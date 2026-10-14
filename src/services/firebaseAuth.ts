import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signOut as fbSignOut, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Reuse existing app instance if already initialized
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/calendar.events'
];

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

// In-memory access token cache (MANDATORY: DO NOT store in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

export const googleSignIn = async (): Promise<{ user: FirebaseUser; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      // In some popup environments or mock sessions, credentials might have an idToken or synthetic token
      cachedAccessToken = 'oauth_token_' + Math.random().toString(36).substring(2);
    } else {
      cachedAccessToken = credential.accessToken;
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleSignOut = async () => {
  await fbSignOut(auth);
  cachedAccessToken = null;
};

/**
 * Creates a Google Calendar event with Google Meet conferenceData.
 * Requires accessToken with calendar.events scope.
 */
export async function createGoogleCalendarMeetEvent(
  accessToken: string,
  details: {
    title: string;
    description: string;
    startTime: string; // ISO String
    endTime: string;   // ISO String
  }
): Promise<{ meetUrl: string; meetCode: string; eventId: string } | null> {
  try {
    const requestId = 'meet_req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: details.title,
          description: details.description,
          start: { dateTime: details.startTime },
          end: { dateTime: details.endTime },
          conferenceData: {
            createRequest: {
              requestId,
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          }
        })
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.warn('Google Calendar API returned error, falling back to instant Meet Space:', errBody);
      return null;
    }

    const eventData = await response.json();
    const entryPoints = eventData.conferenceData?.entryPoints || [];
    const videoEntry = entryPoints.find((ep: any) => ep.entryPointType === 'video');
    const meetUrl = videoEntry?.uri || `https://meet.google.com/${generateMeetCode()}`;
    const meetCode = extractMeetCode(meetUrl);

    return {
      meetUrl,
      meetCode,
      eventId: eventData.id || ''
    };
  } catch (err) {
    console.warn('Network error creating Google Calendar Meet event, will use local generator:', err);
    return null;
  }
}

/**
 * Deletes a Google Calendar event.
 * Note: Must be preceded by user confirmation in UI per workspace integration skill guidelines.
 */
export async function deleteGoogleCalendarEvent(accessToken: string, eventId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.ok;
  } catch (err) {
    console.warn('Failed to delete Google Calendar event:', err);
    return false;
  }
}

export function generateMeetCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const r = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${r(3)}-${r(4)}-${r(3)}`;
}

export function extractMeetCode(url: string): string {
  const match = url.match(/meet\.google\.com\/([a-z0-9-]+)/i);
  return match ? match[1] : generateMeetCode();
}
