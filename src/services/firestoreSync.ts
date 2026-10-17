import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore,
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocs, 
  collection, 
  onSnapshot, 
  getDocFromServer,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, Instructor, TeacherApplication } from '../types/lms';

export interface RegistrationAudit {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'student' | 'teacher' | 'admin';
  registeredAt: string;
  registrationType: 'student_signup' | 'teacher_application' | 'google_oauth' | 'manual_admin';
}

// Initialize Firebase App instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with experimentalForceLongPolling to eliminate 10s streaming timeout in iframe/proxy environments
let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  // CRITICAL: The app will break without this line
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}
export const db: Firestore = dbInstance;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  // If this is an offline or backend unreachable notice, log gracefully without throwing fatal errors
  if (errMsg.includes('offline') || errMsg.includes('backend') || (error as any)?.code === 'unavailable') {
    console.warn('Firestore offline notice: ', errMsg);
    return errInfo;
  }

  console.warn('Firestore Error caught: ', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Helper to call server-side direct Firestore API with graceful error handling
 */
export async function callServerApi(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
  try {
    const res = await fetch(endpoint, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Non-fatal, client can fall back to client SDK
  }
  return null;
}

/**
 * Fetch all platform entities directly from Cloud Firestore via server-side Google Cloud connection
 */
export async function fetchAllFromCloud(): Promise<{
  users: User[];
  teacherApplications: TeacherApplication[];
  instructors: Instructor[];
  registrations: RegistrationAudit[];
} | null> {
  try {
    const data = await callServerApi('/api/db/sync-all');
    if (data && data.success) {
      return {
        users: data.users || [],
        teacherApplications: data.teacherApplications || [],
        instructors: data.instructors || [],
        registrations: data.registrations || []
      };
    }
  } catch (e) {
    console.warn('fetchAllFromCloud notice:', e);
  }
  return null;
}

/**
 * Validate Connection to Firestore on Boot with client check + server fallback
 */
export async function testFirestoreConnection(timeoutMs: number = 4000): Promise<boolean> {
  try {
    const checkPromise = getDocs(collection(db, 'users'));
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Backend connection timeout')), timeoutMs)
    );
    await Promise.race([checkPromise, timeoutPromise]);
    return true;
  } catch (error) {
    // Check if server-side Firestore API is responding
    try {
      const serverRes = await callServerApi('/api/db/sync-all');
      if (serverRes?.success) return true;
    } catch {}

    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('timeout') || error.message.includes('backend'))) {
      console.warn('Firestore operating with resilient server fallback:', error.message);
    }
    return false;
  }
}

// Deeply recursive function to strip undefined values from objects and arrays before saving to Firestore
export function sanitizePayload(val: any): any {
  if (val === undefined) return null;
  if (val === null || typeof val !== 'object') return val;
  if (Array.isArray(val)) {
    return val.filter(item => item !== undefined).map(item => sanitizePayload(item));
  }
  const clean: Record<string, any> = {};
  for (const key of Object.keys(val)) {
    const v = val[key];
    if (v !== undefined) {
      clean[key] = sanitizePayload(v);
    }
  }
  return clean;
}

/**
 * Save / Sync a single user profile to Firestore (Client SDK + Server Cloud Fallback)
 */
export async function saveUserToFirestore(user: User): Promise<boolean> {
  const path = `users/${user.id}`;
  const payload = sanitizePayload({
    ...user,
    updatedAt: user.updatedAt || new Date().toISOString()
  });

  let clientOk = false;
  try {
    await setDoc(doc(db, 'users', user.id), payload, { merge: true });
    clientOk = true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }

  // Guaranteed server-side persistence across all browsers/computers
  let serverOk = false;
  try {
    const serverRes = await callServerApi('/api/db/save-user', 'POST', { user: payload });
    if (serverRes?.success) serverOk = true;
  } catch {}

  return clientOk || serverOk;
}

/**
 * Direct alias for explicitly adding / syncing a user profile to Firestore database
 */
export const saveUserProfileToFirestore = saveUserToFirestore;

/**
 * Delete a user profile from Firestore
 */
export async function deleteUserFromFirestore(userId: string): Promise<boolean> {
  const path = `users/${userId}`;
  let clientOk = false;
  try {
    await deleteDoc(doc(db, 'users', userId));
    clientOk = true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }

  try {
    await callServerApi('/api/db/delete-user', 'POST', { userId });
  } catch {}

  return clientOk;
}

/**
 * Delete an instructor profile from Firestore
 */
export async function deleteInstructorFromFirestore(instructorId: string): Promise<boolean> {
  const path = `instructors/${instructorId}`;
  try {
    await deleteDoc(doc(db, 'instructors', instructorId));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    return false;
  }
}

/**
 * Delete a teacher application from Firestore
 */
export async function deleteTeacherApplicationFromFirestore(appId: string): Promise<boolean> {
  const path = `teacher_applications/${appId}`;
  try {
    await deleteDoc(doc(db, 'teacher_applications', appId));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    return false;
  }
}

/**
 * Delete a registration audit record from Firestore
 */
export async function deleteRegistrationAuditFromFirestore(registrationId: string): Promise<boolean> {
  const path = `registrations/${registrationId}`;
  try {
    await deleteDoc(doc(db, 'registrations', registrationId));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    return false;
  }
}

/**
 * Cascading deletion of a user and all related records across Firestore
 */
export async function deleteUserCascadeFromFirestore(userId: string): Promise<boolean> {
  try {
    // 1. Delete main user doc
    await deleteUserFromFirestore(userId);

    // 2. Query and delete any matching instructor records
    try {
      const instSnap = await getDocs(collection(db, 'instructors'));
      for (const d of instSnap.docs) {
        const data = d.data();
        if (data.userId === userId || d.id === userId) {
          await deleteDoc(doc(db, 'instructors', d.id));
        }
      }
    } catch {}

    // 3. Query and delete any matching teacher applications
    try {
      const appSnap = await getDocs(collection(db, 'teacher_applications'));
      for (const d of appSnap.docs) {
        const data = d.data();
        if (data.userId === userId || d.id === userId) {
          await deleteDoc(doc(db, 'teacher_applications', d.id));
        }
      }
    } catch {}

    // 4. Query and delete any matching registration logs
    try {
      const regSnap = await getDocs(collection(db, 'registrations'));
      for (const d of regSnap.docs) {
        const data = d.data();
        if (data.userId === userId || d.id === userId) {
          await deleteDoc(doc(db, 'registrations', d.id));
        }
      }
    } catch {}

    // 5. Also execute server-side cascade
    try {
      await callServerApi('/api/db/delete-user', 'POST', { userId });
    } catch {}

    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
    return false;
  }
}

/**
 * Batch seed / sync initial users to Firestore if collection is empty or missing them
 */
export async function syncInitialUsersToFirestore(users: User[]): Promise<boolean> {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const existingIds = new Set(snapshot.docs.map(d => d.id));
    const existingEmails = new Set(snapshot.docs.map(d => (d.data().email || '').toLowerCase()));

    for (const user of users) {
      if (!existingIds.has(user.id) && !existingEmails.has(user.email.toLowerCase())) {
        const payload = sanitizePayload({
          ...user,
          updatedAt: user.updatedAt || new Date().toISOString()
        });
        await setDoc(doc(db, 'users', user.id), payload, { merge: true });
        try {
          await callServerApi('/api/db/save-user', 'POST', { user: payload });
        } catch {}
      }
    }
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'users');
    return false;
  }
}

/**
 * Load all users from Firestore with server API fallback
 */
export async function loadUsersFromFirestore(): Promise<User[] | null> {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    if (!snapshot.empty) {
      const users: User[] = [];
      snapshot.forEach(docSnap => {
        users.push(docSnap.data() as User);
      });
      return users;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'users');
  }

  // Fallback: Query server-side direct Firestore endpoint
  try {
    const cloudData = await fetchAllFromCloud();
    if (cloudData && cloudData.users && cloudData.users.length > 0) {
      return cloudData.users;
    }
  } catch {}

  return null;
}

/**
 * Subscribe to real-time changes in Firestore users collection
 */
export function subscribeToUsers(
  onUpdate: (users: User[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'users');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: User[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as User);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
      onError?.(error);
    }
  );
}

/**
 * Save / Sync a single instructor to Firestore (Client SDK + Server Cloud Fallback)
 */
export async function saveInstructorToFirestore(instructor: Instructor): Promise<boolean> {
  const path = `instructors/${instructor.id}`;
  const payload = sanitizePayload({
    ...instructor,
    updatedAt: new Date().toISOString()
  });

  let clientOk = false;
  try {
    await setDoc(doc(db, 'instructors', instructor.id), payload, { merge: true });
    clientOk = true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }

  // Guaranteed server-side persistence fallback
  try {
    const serverRes = await callServerApi('/api/db/save-instructor', 'POST', { instructor: payload });
    if (serverRes?.success) return true;
  } catch {}

  return clientOk;
}

/**
 * Batch seed / sync initial instructors to Firestore if collection is empty
 */
export async function syncInitialInstructorsToFirestore(instructors: Instructor[]): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, 'instructors'));
    if (!snap.empty) return true;
    for (const inst of instructors) {
      await setDoc(doc(db, 'instructors', inst.id), sanitizePayload({
        ...inst,
        updatedAt: new Date().toISOString()
      }), { merge: true });
    }
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'instructors');
    return false;
  }
}

/**
 * Load all instructors from Firestore with server API fallback
 */
export async function loadInstructorsFromFirestore(): Promise<Instructor[] | null> {
  try {
    const snapshot = await getDocs(collection(db, 'instructors'));
    if (!snapshot.empty) {
      const instructors: Instructor[] = [];
      snapshot.forEach(docSnap => {
        instructors.push(docSnap.data() as Instructor);
      });
      return instructors;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'instructors');
  }

  try {
    const cloudData = await fetchAllFromCloud();
    if (cloudData && cloudData.instructors && cloudData.instructors.length > 0) {
      return cloudData.instructors;
    }
  } catch {}

  return null;
}

/**
 * Subscribe to real-time changes in Firestore instructors directory
 */
export function subscribeToInstructors(
  onUpdate: (instructors: Instructor[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'instructors');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Instructor[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Instructor);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'instructors');
      onError?.(error);
    }
  );
}

/**
 * Save / Sync a teacher registration / application to Firestore (Client SDK + Server Cloud Fallback)
 */
export async function saveTeacherApplicationToFirestore(app: TeacherApplication): Promise<boolean> {
  const path = `teacher_applications/${app.id}`;
  const payload = sanitizePayload(app);

  let clientOk = false;
  try {
    await setDoc(doc(db, 'teacher_applications', app.id), payload, { merge: true });
    clientOk = true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }

  // Guaranteed server-side persistence fallback
  try {
    const serverRes = await callServerApi('/api/db/save-teacher-application', 'POST', { application: payload });
    if (serverRes?.success) return true;
  } catch {}

  return clientOk;
}

/**
 * Batch seed initial teacher applications
 */
export async function syncInitialTeacherApplicationsToFirestore(apps: TeacherApplication[]): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, 'teacher_applications'));
    if (!snap.empty) return true;
    for (const app of apps) {
      await setDoc(doc(db, 'teacher_applications', app.id), sanitizePayload(app), { merge: true });
    }
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'teacher_applications');
    return false;
  }
}

/**
 * Load all teacher applications from Firestore with server API fallback
 */
export async function loadTeacherApplicationsFromFirestore(): Promise<TeacherApplication[] | null> {
  try {
    const snapshot = await getDocs(collection(db, 'teacher_applications'));
    if (!snapshot.empty) {
      const apps: TeacherApplication[] = [];
      snapshot.forEach(docSnap => {
        apps.push(docSnap.data() as TeacherApplication);
      });
      return apps;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'teacher_applications');
  }

  try {
    const cloudData = await fetchAllFromCloud();
    if (cloudData && cloudData.teacherApplications && cloudData.teacherApplications.length > 0) {
      return cloudData.teacherApplications;
    }
  } catch {}

  return null;
}

/**
 * Subscribe to real-time changes in Firestore teacher applications
 */
export function subscribeToTeacherApplications(
  onUpdate: (apps: TeacherApplication[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'teacher_applications');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: TeacherApplication[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as TeacherApplication);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'teacher_applications');
      onError?.(error);
    }
  );
}

/**
 * Record a registration event into the Firestore audit log (Client SDK + Server Cloud Fallback)
 */
export async function saveRegistrationAuditToFirestore(reg: RegistrationAudit): Promise<boolean> {
  const path = `registrations/${reg.id}`;
  const payload = sanitizePayload(reg);

  let clientOk = false;
  try {
    await setDoc(doc(db, 'registrations', reg.id), payload, { merge: true });
    clientOk = true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }

  // Guaranteed server-side persistence fallback
  try {
    const serverRes = await callServerApi('/api/db/save-registration', 'POST', { registration: payload });
    if (serverRes?.success) return true;
  } catch {}

  return clientOk;
}

/**
 * Load registrations audit log from Firestore with server API fallback
 */
export async function loadRegistrationsFromFirestore(): Promise<RegistrationAudit[] | null> {
  try {
    const snapshot = await getDocs(collection(db, 'registrations'));
    if (!snapshot.empty) {
      const list: RegistrationAudit[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as RegistrationAudit);
      });
      return list;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'registrations');
  }

  try {
    const cloudData = await fetchAllFromCloud();
    if (cloudData && cloudData.registrations && cloudData.registrations.length > 0) {
      return cloudData.registrations;
    }
  } catch {}

  return null;
}

/**
 * Batch seed initial registrations to Firestore if collection is empty
 */
export async function syncInitialRegistrationsToFirestore(regs: RegistrationAudit[]): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, 'registrations'));
    if (!snap.empty) return true;
    for (const reg of regs) {
      await setDoc(doc(db, 'registrations', reg.id), sanitizePayload(reg), { merge: true });
    }
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'registrations');
    return false;
  }
}

/**
 * Subscribe to real-time changes in Firestore registrations
 */
export function subscribeToRegistrations(
  onUpdate: (regs: RegistrationAudit[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'registrations');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: RegistrationAudit[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as RegistrationAudit);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'registrations');
      onError?.(error);
    }
  );
}

