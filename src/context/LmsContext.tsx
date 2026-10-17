import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Instructor,
  CloudSyncState,
  UserRole,
  Course,
  EnrollmentProgress,
  Transaction,
  DiscussionThread,
  Announcement,
  CourseModule,
  Lesson,
  TeacherApplication,
  TeacherVerificationStatus,
  GoogleMeetSession,
  MeetSessionType,
  EducatorBillingProfile,
  PayoutRecord,
  AIPricingRecommendation,
  HostedVideo,
  CloudStorageMetrics,
  AssignmentSubmission,
  PeerReview,
  PeerReviewRubric,
  PeerReviewComment
} from '../types/lms';
import {
  INITIAL_USERS,
  INITIAL_INSTRUCTORS,
  INITIAL_COURSES,
  INITIAL_ENROLLMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_DISCUSSIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_TEACHER_APPLICATIONS,
  INITIAL_MEET_SESSIONS,
  INITIAL_EDUCATOR_BILLING,
  INITIAL_PAYOUTS,
  INITIAL_AI_RECOMMENDATIONS,
  INITIAL_HOSTED_VIDEOS,
  INITIAL_STORAGE_METRICS,
  INITIAL_ASSIGNMENT_SUBMISSIONS
} from '../data/mockData';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  getAccessToken,
  createGoogleCalendarMeetEvent,
  deleteGoogleCalendarEvent,
  generateMeetCode
} from '../services/firebaseAuth';
import {
  testFirestoreConnection,
  saveUserToFirestore,
  deleteUserFromFirestore,
  syncInitialUsersToFirestore,
  loadUsersFromFirestore,
  subscribeToUsers,
  saveInstructorToFirestore,
  syncInitialInstructorsToFirestore,
  loadInstructorsFromFirestore,
  subscribeToInstructors,
  saveTeacherApplicationToFirestore,
  syncInitialTeacherApplicationsToFirestore,
  loadTeacherApplicationsFromFirestore,
  subscribeToTeacherApplications,
  saveRegistrationAuditToFirestore,
  syncInitialRegistrationsToFirestore,
  loadRegistrationsFromFirestore,
  subscribeToRegistrations,
  deleteUserCascadeFromFirestore,
  deleteTeacherApplicationFromFirestore,
  RegistrationAudit,
  fetchAllFromCloud
} from '../services/firestoreSync';

interface LmsContextType {
  // User & Persona State
  currentUser: User | null;
  allUsers: User[];
  registrations: RegistrationAudit[];
  setUserRole: (role: UserRole) => void;
  setCurrentUserById: (userId: string | null) => void;
  signOut: () => void;
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => void;
  deleteUser: (userId: string) => Promise<boolean>;
  deleteMultipleUsers: (userIds: string[]) => Promise<boolean>;
  deleteTeacherApplication: (appId: string) => Promise<boolean>;
  addUserDirectly: (data: { 
    name: string; 
    email: string; 
    role: UserRole; 
    title?: string; 
    bio?: string;
    institutionOrCompany?: string;
    skills?: string[];
    learningGoals?: string[];
    password?: string;
    portfolioUrl?: string;
  }) => Promise<User>;

  // User Profile & Synchronized Database
  updateUserProfile: (updates: Partial<User>, targetUserId?: string) => Promise<User | null>;
  saveUserProfileToFirestore: (user: User) => Promise<boolean>;
  enhanceUserProfileWithAI: () => Promise<any>;

  // Instructor Database
  instructors: Instructor[];
  getInstructorById: (instructorId: string) => Instructor | undefined;
  getInstructorByUserId: (userId: string) => Instructor | undefined;
  updateInstructorProfile: (instructorId: string, updates: Partial<Instructor>) => Promise<void>;
  matchInstructorsWithAI: (query: string, studentLevel?: string) => Promise<any>;

  // Cloud & Multi-Client Sync
  cloudSyncState: CloudSyncState;
  forceCloudSync: () => Promise<any>;

  // Sign up & Teacher Verification
  teacherApplications: TeacherApplication[];
  signUpStudent: (data: { name: string; email: string; password?: string; title?: string; bio?: string }) => Promise<User>;
  signUpTeacher: (data: {
    name: string;
    email: string;
    password?: string;
    academicTitle: string;
    institutionOrCompany: string;
    primaryDomain: string;
    bio: string;
    portfolioUrl?: string;
    credentialsSummary: string;
    proposedCourseTopic: string;
  }) => Promise<{ user: User; application: TeacherApplication }>;
  applyAsTeacher: (data: {
    academicTitle: string;
    institutionOrCompany: string;
    primaryDomain: string;
    bio: string;
    portfolioUrl?: string;
    credentialsSummary: string;
    proposedCourseTopic: string;
    password?: string;
  }) => Promise<TeacherApplication>;
  approveTeacherApplication: (applicationId: string, reviewNotes?: string) => void;
  rejectTeacherApplication: (applicationId: string, reviewNotes?: string) => void;

  // Course Catalog & Creation
  courses: Course[];
  getCourseById: (courseId: string) => Course | undefined;
  createCourse: (courseData: Omit<Course, 'id' | 'rating' | 'reviewCount' | 'studentCount' | 'updatedDate'>) => Course;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  updateCoursePrice: (courseId: string, newPrice: number) => void;
  deleteCourse: (courseId: string) => void;
  toggleCoursePublish: (courseId: string) => void;

  // Google Meet for Educators & Students
  googleMeetSessions: GoogleMeetSession[];
  createMeetSession: (sessionData: Omit<GoogleMeetSession, 'id' | 'createdAt' | 'attendeeCount'>) => Promise<GoogleMeetSession>;
  deleteMeetSession: (sessionId: string) => Promise<boolean>;
  updateMeetSessionStatus: (sessionId: string, status: GoogleMeetSession['status']) => void;
  isGoogleConnected: boolean;
  googleAuthUser: any;
  connectGoogle: () => Promise<boolean>;
  disconnectGoogle: () => Promise<void>;

  // AI-Driven Billing & Revenue Management
  educatorBilling: EducatorBillingProfile;
  updateEducatorBilling: (updates: Partial<EducatorBillingProfile>) => void;
  setEducatorLectureFee: (fee: number, sessionType?: MeetSessionType) => void;
  payouts: PayoutRecord[];
  requestPayout: (amount?: number) => PayoutRecord;
  aiPricingRecommendations: AIPricingRecommendation[];
  refreshAIPricingRecommendations: () => Promise<AIPricingRecommendation[]>;

  // AI-Driven Video Studio & Cloud Hosting
  hostedVideos: HostedVideo[];
  storageMetrics: CloudStorageMetrics;
  addHostedVideo: (video: HostedVideo) => void;
  updateHostedVideo: (videoId: string, updates: Partial<HostedVideo>) => void;
  deleteHostedVideo: (videoId: string) => void;
  attachVideoToLesson: (videoId: string, courseId: string, lessonId: string) => void;
  analyzeVideoWithAI: (videoId: string, topic?: string) => Promise<HostedVideo | null>;
  generateTeleprompterScript: (topic: string, durationMinutes?: number, tone?: string) => Promise<{ topic: string; estimatedMinutes: number; scriptText: string; bulletPoints: string[] }>;

  // Enrollments & Progress Tracking
  enrollments: Record<string, EnrollmentProgress>;
  getEnrollment: (courseId: string) => EnrollmentProgress | undefined;
  isUserEnrolled: (courseId: string) => boolean;
  enrollInCourse: (courseId: string, transactionId: string) => void;
  markLessonComplete: (courseId: string, lessonId: string, isCompleted: boolean) => void;
  saveUserNote: (courseId: string, lessonId: string, note: string) => void;
  saveQuizScore: (courseId: string, lessonId: string, scorePercentage: number) => void;
  issueCertificate: (
    courseId: string, 
    recipientName: string, 
    honors?: 'Standard Mastery' | 'Passed with Honors' | 'Highest Distinction (Top 5%)',
    targetUserId?: string
  ) => void;
  revokeCertificate: (courseId: string, targetUserId: string) => void;
  verifyCertificate: (credentialId: string) => {
    isValid: boolean;
    certificate?: {
      issueDate: string;
      credentialId: string;
      recipientName: string;
      honors?: string;
      gradeScore?: number;
      verificationHash?: string;
    };
    course?: Course;
    user?: User;
  } | null;

  // Transactions & Secure Payments
  transactions: Transaction[];
  createTransaction: (data: {
    courseId: string;
    amount: number;
    originalAmount: number;
    discountCode?: string;
    discountAmount?: number;
    paymentMethod: 'card' | 'applepay' | 'googlepay' | 'bank';
    cardLast4?: string;
  }) => Transaction;
  refundTransaction: (transactionId: string) => void;

  // Q&A Discussions & Interactions
  discussions: DiscussionThread[];
  addDiscussionThread: (courseId: string, lessonId: string | undefined, lessonTitle: string | undefined, title: string, content: string) => void;
  addDiscussionReply: (threadId: string, content: string) => void;
  togglePinDiscussion: (threadId: string) => void;
  toggleEndorseReply: (threadId: string, replyId: string) => void;

  // Announcements
  announcements: Announcement[];
  createAnnouncement: (courseId: string, title: string, content: string) => void;

  // Peer Review Feedback & Assignment Submissions
  assignmentSubmissions: AssignmentSubmission[];
  submitAssignment: (data: {
    courseId: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
    title: string;
    summary: string;
    codeSnippet?: string;
    language?: string;
    repoUrl?: string;
  }) => AssignmentSubmission;
  addPeerReview: (
    submissionId: string, 
    review: {
      rating: number;
      rubric: { clarity: number; architecture: number; robustness: number };
      strengths: string;
      improvements: string;
      comment: string;
    }
  ) => void;
  addReviewComment: (submissionId: string, reviewId: string, content: string) => void;
  voteReviewHelpful: (submissionId: string, reviewId: string) => void;

  // Embedded Ecosystem (OWLY SAT & OWLY IELTS open in same iframe, no link)
  embeddedEcosystem: 'sat' | 'ielts' | null;
  setEmbeddedEcosystem: (platform: 'sat' | 'ielts' | null) => void;

  // Reset to demo data
  resetPlatformData: () => void;
}

const LmsContext = createContext<LmsContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'aetheria_lms_users_v1',
  REGISTRATIONS: 'aetheria_lms_registrations_v1',
  ACTIVE_ROLE: 'aetheria_lms_active_role_v2',
  ACTIVE_USER_ID: 'aetheria_lms_active_user_id_v2',
  COURSES: 'aetheria_lms_courses_v1',
  ENROLLMENTS: 'aetheria_lms_enrollments_v1',
  TRANSACTIONS: 'aetheria_lms_transactions_v1',
  DISCUSSIONS: 'aetheria_lms_discussions_v1',
  ANNOUNCEMENTS: 'aetheria_lms_announcements_v1',
  TEACHER_APPLICATIONS: 'aetheria_lms_teacher_apps_v1',
  MEET_SESSIONS: 'aetheria_lms_meet_sessions_v1',
  EDUCATOR_BILLING: 'aetheria_lms_educator_billing_v1',
  PAYOUTS: 'aetheria_lms_payouts_v1',
  AI_RECOMMENDATIONS: 'aetheria_lms_ai_recs_v1',
  HOSTED_VIDEOS: 'aetheria_lms_hosted_videos_v1',
  ASSIGNMENT_SUBMISSIONS: 'aetheria_lms_submissions_v1',
  INSTRUCTORS: 'aetheria_lms_instructors_v1'
};

export const LmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or fallback to initial data with persistent admin credentials
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      let users: User[] = stored ? JSON.parse(stored) : [...INITIAL_USERS];

      // Guarantee the requested admin user is always registered and credentials remain up to date
      const adminEmail = 'theinsiderspace@gmail.com';
      const existingIdx = users.findIndex(u => u.email.toLowerCase() === adminEmail.toLowerCase());
      const adminUser: User = {
        id: existingIdx >= 0 ? users[existingIdx].id : 'user-admin-theinsiderspace',
        name: 'Super Admin',
        email: adminEmail,
        password: '1542016',
        role: 'admin',
        avatarText: 'SA',
        title: 'Platform Dean & Super Administrator',
        bio: 'Super Admin with full platform management, faculty accreditation authority, and catalog governance.',
        enrolledCourseIds: [],
        totalSpent: 0,
        joinedDate: 'Oct 14, 2026',
        status: 'active',
      };

      if (existingIdx >= 0) {
        users[existingIdx] = { ...users[existingIdx], ...adminUser };
      } else {
        users = [adminUser, ...users];
      }
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      } catch {}

      return users;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [registrations, setRegistrations] = useState<RegistrationAudit[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeRole, setActiveRole] = useState<UserRole | 'guest'>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);
      return (stored as UserRole) || 'guest';
    } catch {
      return 'guest';
    }
  });

  // Students and users must explicitly log in first. No automatic student login on startup.
  const [activeUserId, setActiveUserId] = useState<string | null>(() => {
    try {
      // Clear previous legacy auto-login session key
      localStorage.removeItem('aetheria_lms_active_user_id_v1');
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
      return stored || null;
    } catch {
      return null;
    }
  });

  const [teacherApplications, setTeacherApplications] = useState<TeacherApplication[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEACHER_APPLICATIONS);
      return stored ? JSON.parse(stored) : INITIAL_TEACHER_APPLICATIONS;
    } catch {
      return INITIAL_TEACHER_APPLICATIONS;
    }
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
      return stored ? JSON.parse(stored) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  const [enrollments, setEnrollments] = useState<Record<string, EnrollmentProgress>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
      return stored ? JSON.parse(stored) : INITIAL_ENROLLMENTS;
    } catch {
      return INITIAL_ENROLLMENTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [discussions, setDiscussions] = useState<DiscussionThread[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DISCUSSIONS);
      return stored ? JSON.parse(stored) : INITIAL_DISCUSSIONS;
    } catch {
      return INITIAL_DISCUSSIONS;
    }
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      return stored ? JSON.parse(stored) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  const [googleMeetSessions, setGoogleMeetSessions] = useState<GoogleMeetSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEET_SESSIONS);
      return stored ? JSON.parse(stored) : INITIAL_MEET_SESSIONS;
    } catch {
      return INITIAL_MEET_SESSIONS;
    }
  });

  const [educatorBilling, setEducatorBilling] = useState<EducatorBillingProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EDUCATOR_BILLING);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...INITIAL_EDUCATOR_BILLING,
          ...parsed,
          royaltyPercentage: 70, // 70% educator net payout
          systemRetentionPercentage: 30, // 30% system retention
          defaultLectureFee: typeof parsed.defaultLectureFee === 'number' ? parsed.defaultLectureFee : 75,
          lectureFeesBySessionType: parsed.lectureFeesBySessionType || INITIAL_EDUCATOR_BILLING.lectureFeesBySessionType
        };
      }
      return INITIAL_EDUCATOR_BILLING;
    } catch {
      return INITIAL_EDUCATOR_BILLING;
    }
  });

  const [payouts, setPayouts] = useState<PayoutRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PAYOUTS);
      return stored ? JSON.parse(stored) : INITIAL_PAYOUTS;
    } catch {
      return INITIAL_PAYOUTS;
    }
  });

  const [aiPricingRecommendations, setAiPricingRecommendations] = useState<AIPricingRecommendation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AI_RECOMMENDATIONS);
      return stored ? JSON.parse(stored) : INITIAL_AI_RECOMMENDATIONS;
    } catch {
      return INITIAL_AI_RECOMMENDATIONS;
    }
  });

  const [hostedVideos, setHostedVideos] = useState<HostedVideo[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HOSTED_VIDEOS);
      return stored ? JSON.parse(stored) : INITIAL_HOSTED_VIDEOS;
    } catch {
      return INITIAL_HOSTED_VIDEOS;
    }
  });

  const [storageMetrics, setStorageMetrics] = useState<CloudStorageMetrics>(INITIAL_STORAGE_METRICS);

  // Peer Review & Assignment Submissions state
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS);
      return stored ? JSON.parse(stored) : INITIAL_ASSIGNMENT_SUBMISSIONS;
    } catch {
      return INITIAL_ASSIGNMENT_SUBMISSIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, JSON.stringify(assignmentSubmissions));
    } catch {}
  }, [assignmentSubmissions]);

  // Instructor Database State
  const [instructors, setInstructors] = useState<Instructor[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INSTRUCTORS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_INSTRUCTORS;
    } catch {
      return INITIAL_INSTRUCTORS;
    }
  });

  // Cloud & Local Sync State tracking
  const [cloudSyncState, setCloudSyncState] = useState<CloudSyncState>({
    status: 'synced',
    lastSyncedAt: new Date().toLocaleTimeString(),
    pendingMutationsCount: 0,
    error: null
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INSTRUCTORS, JSON.stringify(instructors));
    } catch {}
  }, [instructors]);

  // Embedded Ecosystem state: OWLY SAT & OWLY IELTS loaded inside same iframe with no links displayed
  const [embeddedEcosystem, setEmbeddedEcosystem] = useState<'sat' | 'ielts' | null>(null);

  // Google Workspace Auth State (in-memory token, no localStorage storage of credentials)
  const [googleAuthUser, setGoogleAuthUser] = useState<any>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleAuthUser(user);
        setGoogleAccessToken(token);
        setIsGoogleConnected(true);
      },
      () => {
        setGoogleAuthUser(null);
        setGoogleAccessToken(null);
        setIsGoogleConnected(false);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Current active user: null if not logged in (requires logging in first)
  const currentUser: User | null = activeUserId 
    ? (allUsers.find(u => u.id === activeUserId) || null)
    : null;

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, activeRole);
  }, [activeRole]);

  useEffect(() => {
    if (activeUserId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, activeUserId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    }
  }, [activeUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEACHER_APPLICATIONS, JSON.stringify(teacherApplications));
  }, [teacherApplications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(discussions));
  }, [discussions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEET_SESSIONS, JSON.stringify(googleMeetSessions));
  }, [googleMeetSessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EDUCATOR_BILLING, JSON.stringify(educatorBilling));
  }, [educatorBilling]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(payouts));
  }, [payouts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AI_RECOMMENDATIONS, JSON.stringify(aiPricingRecommendations));
  }, [aiPricingRecommendations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOSTED_VIDEOS, JSON.stringify(hostedVideos));
  }, [hostedVideos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
  }, [registrations]);

  // Firestore connection test and real-time multi-tab & cloud synchronization
  useEffect(() => {
    let isMounted = true;
    const unsubs: (() => void)[] = [];

    // Remote-authoritative mergers that prioritize live Cloud Firestore records
    const mergeUsersFromRemote = (local: User[], remote: User[]): User[] => {
      const remoteIds = new Set(remote.map(r => r.id));
      const remoteEmails = new Set(remote.map(r => r.email.toLowerCase()));

      const list: User[] = [...remote];

      // Guarantee Super Admin exists
      const hasSuperAdmin = list.some(u => u.email.toLowerCase() === 'theinsiderspace@gmail.com');
      if (!hasSuperAdmin) {
        const localAdmin = local.find(u => u.email.toLowerCase() === 'theinsiderspace@gmail.com');
        if (localAdmin) list.push(localAdmin);
      }

      // Preserve newly registered local user if not yet reflected in snapshot, excluding deleted mock users
      local.forEach(loc => {
        if (!remoteIds.has(loc.id) && !remoteEmails.has(loc.email.toLowerCase())) {
          const isHardcodedDemo = ['user-student-1', 'user-student-2', 'user-student-3', 'user-student-4', 'user-teacher-1'].includes(loc.id);
          if (!isHardcodedDemo && (loc.id.startsWith('user-student-') || loc.id.startsWith('user-teacher-') || loc.id.startsWith('user-admin-'))) {
            list.unshift(loc);
          }
        }
      });

      // Sort with newest registrations first
      return list.sort((a, b) => {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.id.match(/\d{10,}/) ? parseInt(a.id.match(/\d{10,}/)![0]) : new Date(a.joinedDate).getTime() || 0);
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.id.match(/\d{10,}/) ? parseInt(b.id.match(/\d{10,}/)![0]) : new Date(b.joinedDate).getTime() || 0);
        return timeB - timeA;
      });
    };

    const mergeTeacherAppsFromRemote = (local: TeacherApplication[], remote: TeacherApplication[]): TeacherApplication[] => {
      const remoteIds = new Set(remote.map(r => r.id));
      const list = [...remote];
      local.forEach(loc => {
        if (!remoteIds.has(loc.id)) {
          list.push(loc);
        }
      });
      return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    };

    const mergeInstructorsFromRemote = (local: Instructor[], remote: Instructor[]): Instructor[] => {
      const remoteIds = new Set(remote.map(r => r.id));
      const list = [...remote];
      local.forEach(loc => {
        if (!remoteIds.has(loc.id)) {
          list.push(loc);
        }
      });
      return list;
    };

    const mergeRegistrationsFromRemote = (local: RegistrationAudit[], remote: RegistrationAudit[]): RegistrationAudit[] => {
      const remoteIds = new Set(remote.map(r => r.id));
      const list = [...remote];
      local.forEach(loc => {
        if (!remoteIds.has(loc.id)) {
          list.push(loc);
        }
      });
      return list.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
    };

    // 1. Eagerly attach real-time Firestore listeners immediately on mount
    // A. Real-time Users Subscription
    const unsubUsers = subscribeToUsers(
      (remoteUsers) => {
        if (!isMounted || !remoteUsers) return;
        setAllUsers(prev => {
          const merged = mergeUsersFromRemote(prev, remoteUsers);
          try {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
          } catch {}
          return merged;
        });
        setCloudSyncState(prev => ({
          ...prev,
          status: 'synced',
          lastSyncedAt: new Date().toLocaleTimeString(),
          error: null
        }));
      },
      (err) => console.warn('Users Firestore subscription notice:', err)
    );
    unsubs.push(unsubUsers);

    // B. Real-time Teacher Applications Subscription
    const unsubApps = subscribeToTeacherApplications(
      (remoteApps) => {
        if (!isMounted || !remoteApps) return;
        setTeacherApplications(prev => {
          const merged = mergeTeacherAppsFromRemote(prev, remoteApps);
          try {
            localStorage.setItem(STORAGE_KEYS.TEACHER_APPLICATIONS, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      },
      (err) => console.warn('Teacher Applications Firestore subscription notice:', err)
    );
    unsubs.push(unsubApps);

    // C. Real-time Instructors Subscription
    const unsubInstructors = subscribeToInstructors(
      (remoteInstructors) => {
        if (!isMounted || !remoteInstructors) return;
        setInstructors(prev => {
          const merged = mergeInstructorsFromRemote(prev, remoteInstructors);
          try {
            localStorage.setItem(STORAGE_KEYS.INSTRUCTORS, JSON.stringify(merged));
          } catch {}
          return merged;
        });
        setCloudSyncState(prev => ({
          ...prev,
          status: 'synced',
          lastSyncedAt: new Date().toLocaleTimeString(),
          error: null
        }));
      },
      (err) => console.warn('Instructors Firestore subscription notice:', err)
    );
    unsubs.push(unsubInstructors);

    // D. Real-time Registrations Audit Log Subscription
    const unsubRegistrations = subscribeToRegistrations(
      (remoteRegs) => {
        if (!isMounted || !remoteRegs) return;
        setRegistrations(prev => {
          const merged = mergeRegistrationsFromRemote(prev, remoteRegs);
          try {
            localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      },
      (err) => console.warn('Registrations Firestore subscription notice:', err)
    );
    unsubs.push(unsubRegistrations);

    // 2. Proactive initial pull & initial seeding
    const syncBootData = async () => {
      try {
        // Proactively fetch all remote entities from both server-side cloud API and client Firestore
        const [cloudData, rUsers, rApps, rInstructors, rRegs] = await Promise.allSettled([
          fetchAllFromCloud(),
          loadUsersFromFirestore(),
          loadTeacherApplicationsFromFirestore(),
          loadInstructorsFromFirestore(),
          loadRegistrationsFromFirestore()
        ]);

        if (!isMounted) return;

        const resolvedUsers = (rUsers.status === 'fulfilled' && rUsers.value && rUsers.value.length > 0)
          ? rUsers.value
          : (cloudData.status === 'fulfilled' && cloudData.value?.users) || [];

        const resolvedApps = (rApps.status === 'fulfilled' && rApps.value && rApps.value.length > 0)
          ? rApps.value
          : (cloudData.status === 'fulfilled' && cloudData.value?.teacherApplications) || [];

        const resolvedInstructors = (rInstructors.status === 'fulfilled' && rInstructors.value && rInstructors.value.length > 0)
          ? rInstructors.value
          : (cloudData.status === 'fulfilled' && cloudData.value?.instructors) || [];

        const resolvedRegs = (rRegs.status === 'fulfilled' && rRegs.value && rRegs.value.length > 0)
          ? rRegs.value
          : (cloudData.status === 'fulfilled' && cloudData.value?.registrations) || [];

        if (resolvedUsers.length > 0) {
          setAllUsers(prev => {
            const merged = mergeUsersFromRemote(prev, resolvedUsers);
            try { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged)); } catch {}
            return merged;
          });
        }

        if (resolvedApps.length > 0) {
          setTeacherApplications(prev => {
            const merged = mergeTeacherAppsFromRemote(prev, resolvedApps);
            try { localStorage.setItem(STORAGE_KEYS.TEACHER_APPLICATIONS, JSON.stringify(merged)); } catch {}
            return merged;
          });
        }

        if (resolvedInstructors.length > 0) {
          setInstructors(prev => {
            const merged = mergeInstructorsFromRemote(prev, resolvedInstructors);
            try { localStorage.setItem(STORAGE_KEYS.INSTRUCTORS, JSON.stringify(merged)); } catch {}
            return merged;
          });
        }

        if (resolvedRegs.length > 0) {
          setRegistrations(prev => {
            const merged = mergeRegistrationsFromRemote(prev, resolvedRegs);
            try { localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(merged)); } catch {}
            return merged;
          });
        }

        setCloudSyncState({
          status: 'synced',
          lastSyncedAt: new Date().toLocaleTimeString(),
          pendingMutationsCount: 0,
          error: null
        });
      } catch (err: any) {
        console.warn('Initial Firestore boot sync warning:', err);
      }
    };

    syncBootData();

    // Multi-tab storage event synchronization to fix cross-tab sync issues
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === STORAGE_KEYS.USERS && e.newValue) {
        try { setAllUsers(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === STORAGE_KEYS.REGISTRATIONS && e.newValue) {
        try { setRegistrations(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === STORAGE_KEYS.TEACHER_APPLICATIONS && e.newValue) {
        try { setTeacherApplications(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === STORAGE_KEYS.INSTRUCTORS && e.newValue) {
        try { setInstructors(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === STORAGE_KEYS.COURSES && e.newValue) {
        try { setCourses(JSON.parse(e.newValue)); } catch {}
      } else if (e.key === STORAGE_KEYS.ACTIVE_USER_ID) {
        setActiveUserId(e.newValue || null);
      } else if (e.key === STORAGE_KEYS.ACTIVE_ROLE && e.newValue) {
        setActiveRole(e.newValue as any);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      unsubs.forEach(unsubFn => {
        if (typeof unsubFn === 'function') unsubFn();
      });
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Role switching
  const setUserRole = (role: UserRole) => {
    setActiveRole(role);
    const candidate = allUsers.find(u => u.role === role);
    if (candidate) {
      setActiveUserId(candidate.id);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, candidate.id);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    }
  };

  const signOut = () => {
    setActiveUserId(null);
    setActiveRole('guest');
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    localStorage.removeItem('aetheria_lms_active_user_id_v1');
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, 'guest');
  };

  const setCurrentUserById = (userId: string | null) => {
    if (!userId) {
      signOut();
      return;
    }
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      setActiveUserId(target.id);
      setActiveRole(target.role);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, target.id);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, target.role);
    }
  };

  const updateUserStatus = (userId: string, status: 'active' | 'suspended') => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const mod = { ...u, status };
        saveUserToFirestore(mod);
        return mod;
      }
      return u;
    }));
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    // Safety guard: Super Admin master root account cannot be deleted
    const targetUser = allUsers.find(u => u.id === userId);
    if (targetUser?.email?.toLowerCase() === 'theinsiderspace@gmail.com') {
      console.warn('Super Admin root master account cannot be deleted.');
      return false;
    }

    setAllUsers(prev => {
      const updated = prev.filter(u => u.id !== userId);
      try { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    // Cascade clean matching instructors, teacher applications, and registrations
    setInstructors(prev => {
      const updated = prev.filter(i => i.userId !== userId && i.id !== userId);
      try { localStorage.setItem(STORAGE_KEYS.INSTRUCTORS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    setTeacherApplications(prev => {
      const updated = prev.filter(a => a.userId !== userId);
      try { localStorage.setItem(STORAGE_KEYS.TEACHER_APPLICATIONS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    setRegistrations(prev => {
      const updated = prev.filter(r => r.userId !== userId);
      try { localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (activeUserId === userId) {
      signOut();
    }

    return await deleteUserCascadeFromFirestore(userId);
  };

  const deleteMultipleUsers = async (userIds: string[]): Promise<boolean> => {
    // Filter out root admin
    const validIds = userIds.filter(id => {
      const u = allUsers.find(user => user.id === id);
      return u?.email?.toLowerCase() !== 'theinsiderspace@gmail.com';
    });

    if (validIds.length === 0) return false;

    setAllUsers(prev => {
      const updated = prev.filter(u => !validIds.includes(u.id));
      try { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    setInstructors(prev => {
      const updated = prev.filter(i => !validIds.includes(i.userId) && !validIds.includes(i.id));
      try { localStorage.setItem(STORAGE_KEYS.INSTRUCTORS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    setTeacherApplications(prev => {
      const updated = prev.filter(a => !validIds.includes(a.userId));
      try { localStorage.setItem(STORAGE_KEYS.TEACHER_APPLICATIONS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    setRegistrations(prev => {
      const updated = prev.filter(r => !validIds.includes(r.userId));
      try { localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updated)); } catch {}
      return updated;
    });

    for (const uid of validIds) {
      await deleteUserCascadeFromFirestore(uid);
    }

    return true;
  };

  const deleteTeacherApplication = async (appId: string): Promise<boolean> => {
    setTeacherApplications(prev => {
      const updated = prev.filter(a => a.id !== appId);
      try { localStorage.setItem(STORAGE_KEYS.TEACHER_APPLICATIONS, JSON.stringify(updated)); } catch {}
      return updated;
    });
    return await deleteTeacherApplicationFromFirestore(appId);
  };

  const addUserDirectly = async (data: { 
    name: string; 
    email: string; 
    role: UserRole; 
    title?: string; 
    bio?: string;
    institutionOrCompany?: string;
    skills?: string[];
    learningGoals?: string[];
    password?: string;
    portfolioUrl?: string;
  }): Promise<User> => {
    const initials = data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';
    const nowIso = new Date().toISOString();
    const newUser: User = {
      id: `user-${data.role}-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password?.trim() || undefined,
      role: data.role,
      avatarText: initials,
      title: data.title?.trim() || (data.role === 'teacher' ? 'Faculty Instructor' : 'Technical Learner'),
      bio: data.bio?.trim() || 'Verified member at OWLY Academy.',
      institutionOrCompany: data.institutionOrCompany?.trim(),
      skills: data.skills || [],
      learningGoals: data.learningGoals || [],
      socialLinks: data.portfolioUrl ? { website: data.portfolioUrl.trim() } : undefined,
      enrolledCourseIds: [],
      totalSpent: 0,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'active',
      teacherVerificationStatus: data.role === 'teacher' ? 'approved' : undefined,
      updatedAt: nowIso
    };

    setAllUsers(prev => [newUser, ...prev]);
    await saveUserToFirestore(newUser);

    if (data.role === 'teacher') {
      const newInst: Instructor = {
        id: `inst-${Date.now()}`,
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatarText: newUser.avatarText,
        academicTitle: newUser.title || 'Faculty Instructor',
        institutionOrCompany: data.institutionOrCompany?.trim() || 'OWLY Academy',
        primaryDomain: 'Computer Science & AI',
        specialties: data.skills && data.skills.length > 0 ? data.skills : ['Technical Masterclasses'],
        bio: newUser.bio || 'Verified faculty member.',
        credentialsSummary: 'Accredited by platform administration.',
        portfolioUrl: data.portfolioUrl?.trim(),
        verificationStatus: 'approved',
        rating: 5.0,
        reviewCount: 0,
        studentCount: 0,
        courseIds: [],
        featured: false,
        joinedDate: newUser.joinedDate,
        updatedAt: nowIso
      };
      setInstructors(prev => [newInst, ...prev]);
      await saveInstructorToFirestore(newInst);
    }

    await saveRegistrationAuditToFirestore({
      id: `reg-${Date.now()}`,
      userId: newUser.id,
      userName: newUser.name,
      userEmail: newUser.email,
      role: newUser.role,
      registeredAt: nowIso,
      registrationType: 'manual_admin'
    });
    return newUser;
  };

  // User Profile Update with Automatic Relational Sync across Courses & Instructors
  const updateUserProfile = async (updates: Partial<User>, targetUserId?: string): Promise<User | null> => {
    const idToUpdate = targetUserId || activeUserId;
    if (!idToUpdate) return null;

    const existingUser = allUsers.find(u => u.id === idToUpdate);
    const updatedUserResult: User = existingUser
      ? {
          ...existingUser,
          ...updates,
          updatedAt: new Date().toISOString()
        }
      : {
          id: idToUpdate,
          name: updates.name || 'User',
          email: updates.email || '',
          role: updates.role || 'student',
          avatarText: 'US',
          enrolledCourseIds: [],
          totalSpent: 0,
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'active',
          ...updates,
          updatedAt: new Date().toISOString()
        };

    setAllUsers(prev => prev.map(u => (u.id === idToUpdate ? updatedUserResult : u)));

    // 1. Sync with Instructors database if this user is a teacher / faculty member
    setInstructors(prev => prev.map(inst => {
      if (inst.userId === idToUpdate) {
        const updatedInst: Instructor = {
          ...inst,
          name: updates.name || inst.name,
          academicTitle: updates.title || inst.academicTitle,
          bio: updates.bio || inst.bio,
          avatarText: updates.avatarText || inst.avatarText,
          avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : inst.avatarUrl,
          institutionOrCompany: updates.institutionOrCompany || inst.institutionOrCompany,
          specialties: updates.skills || inst.specialties,
          portfolioUrl: updates.socialLinks?.website || updates.socialLinks?.googleScholar || inst.portfolioUrl,
          updatedAt: new Date().toISOString()
        };
        saveInstructorToFirestore(updatedInst);
        return updatedInst;
      }
      return inst;
    }));

    // 2. Sync Course catalog metadata (fixing the out-of-sync instructor details on authored courses!)
    setCourses(prev => prev.map(course => {
      if (course.instructorId === idToUpdate) {
        return {
          ...course,
          instructorName: updates.name || course.instructorName,
          instructorTitle: updates.title || course.instructorTitle,
          instructorBio: updates.bio || course.instructorBio
        };
      }
      return course;
    }));

    // 3. Save User Profile directly to Firestore
    setCloudSyncState(prev => ({ ...prev, status: 'syncing' }));
    const saved = await saveUserToFirestore(updatedUserResult);
    setCloudSyncState(prev => ({
      ...prev,
      status: saved ? 'synced' : 'offline',
      lastSyncedAt: new Date().toLocaleTimeString(),
      error: saved ? null : 'Saved locally (Firestore write notice)'
    }));

    return updatedUserResult;
  };

  // Instructor Profile Update
  const updateInstructorProfile = async (instructorId: string, updates: Partial<Instructor>) => {
    let targetInst: Instructor | null = null;
    setInstructors(prev => prev.map(inst => {
      if (inst.id === instructorId) {
        targetInst = {
          ...inst,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        return targetInst;
      }
      return inst;
    }));

    if (!targetInst) return;

    // Sync underlying user record
    setAllUsers(prev => prev.map(u => {
      if (u.id === targetInst!.userId) {
        return {
          ...u,
          name: updates.name || u.name,
          title: updates.academicTitle || u.title,
          bio: updates.bio || u.bio,
          avatarText: updates.avatarText || u.avatarText,
          avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : u.avatarUrl,
          institutionOrCompany: updates.institutionOrCompany || u.institutionOrCompany,
          skills: updates.specialties || u.skills,
          teacherVerificationStatus: updates.verificationStatus || u.teacherVerificationStatus
        };
      }
      return u;
    }));

    // Sync courses
    setCourses(prev => prev.map(course => {
      if (course.instructorId === targetInst!.userId) {
        return {
          ...course,
          instructorName: updates.name || course.instructorName,
          instructorTitle: updates.academicTitle || course.instructorTitle,
          instructorBio: updates.bio || course.instructorBio
        };
      }
      return course;
    }));

    // Save to Firestore
    setCloudSyncState(prev => ({ ...prev, status: 'syncing' }));
    const saved = await saveInstructorToFirestore(targetInst);
    setCloudSyncState(prev => ({
      ...prev,
      status: saved ? 'synced' : 'offline',
      lastSyncedAt: new Date().toLocaleTimeString()
    }));
  };

  const getInstructorById = (instructorId: string) => {
    return instructors.find(i => i.id === instructorId);
  };

  const getInstructorByUserId = (userId: string) => {
    return instructors.find(i => i.userId === userId);
  };

  const enhanceUserProfileWithAI = async () => {
    if (!currentUser) return null;
    try {
      const res = await fetch('/api/profile-ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentUser.name,
          role: currentUser.role,
          title: currentUser.title,
          bio: currentUser.bio,
          currentSkills: currentUser.skills,
          learningGoals: currentUser.learningGoals
        })
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (e) {
      console.warn('enhanceUserProfileWithAI error:', e);
      return null;
    }
  };

  const matchInstructorsWithAI = async (query: string, studentLevel?: string) => {
    try {
      const res = await fetch('/api/instructors/ai-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          instructors,
          studentLevel
        })
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (e) {
      console.warn('matchInstructorsWithAI error:', e);
      return null;
    }
  };

  const forceCloudSync = async () => {
    setCloudSyncState(prev => ({ ...prev, status: 'syncing', error: null }));
    try {
      // 1. Proactively pull all remote records from both Cloud Firestore and Server API
      const [cloudData, rUsers, rApps, rInstructors, rRegs] = await Promise.allSettled([
        fetchAllFromCloud(),
        loadUsersFromFirestore(),
        loadTeacherApplicationsFromFirestore(),
        loadInstructorsFromFirestore(),
        loadRegistrationsFromFirestore()
      ]);

      const resolvedUsers = (rUsers.status === 'fulfilled' && rUsers.value && rUsers.value.length > 0)
        ? rUsers.value
        : (cloudData.status === 'fulfilled' && cloudData.value?.users) || [];

      const resolvedApps = (rApps.status === 'fulfilled' && rApps.value && rApps.value.length > 0)
        ? rApps.value
        : (cloudData.status === 'fulfilled' && cloudData.value?.teacherApplications) || [];

      const resolvedInstructors = (rInstructors.status === 'fulfilled' && rInstructors.value && rInstructors.value.length > 0)
        ? rInstructors.value
        : (cloudData.status === 'fulfilled' && cloudData.value?.instructors) || [];

      const resolvedRegs = (rRegs.status === 'fulfilled' && rRegs.value && rRegs.value.length > 0)
        ? rRegs.value
        : (cloudData.status === 'fulfilled' && cloudData.value?.registrations) || [];

      let finalUsers = allUsers;
      if (resolvedUsers.length > 0) {
        const remoteIds = new Set(resolvedUsers.map(r => r.id));
        const remoteEmails = new Set(resolvedUsers.map(r => r.email.toLowerCase()));
        const list = [...resolvedUsers];
        allUsers.forEach(loc => {
          if (!remoteIds.has(loc.id) && !remoteEmails.has(loc.email.toLowerCase())) {
            const isHardcodedDemo = ['user-student-1', 'user-student-2', 'user-student-3', 'user-student-4', 'user-teacher-1'].includes(loc.id);
            if (!isHardcodedDemo && (loc.id.startsWith('user-student-') || loc.id.startsWith('user-teacher-') || loc.id.startsWith('user-admin-'))) {
              list.unshift(loc);
            }
          }
        });
        finalUsers = list.sort((a, b) => {
          const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.id.match(/\d{10,}/) ? parseInt(a.id.match(/\d{10,}/)![0]) : new Date(a.joinedDate).getTime() || 0);
          const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.id.match(/\d{10,}/) ? parseInt(b.id.match(/\d{10,}/)![0]) : new Date(b.joinedDate).getTime() || 0);
          return timeB - timeA;
        });
        setAllUsers(finalUsers);
        try { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(finalUsers)); } catch {}
      }

      let finalApps = teacherApplications;
      if (resolvedApps.length > 0) {
        const remoteIds = new Set(resolvedApps.map(r => r.id));
        const list = [...resolvedApps];
        teacherApplications.forEach(loc => {
          if (!remoteIds.has(loc.id)) list.push(loc);
        });
        finalApps = list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setTeacherApplications(finalApps);
        try { localStorage.setItem(STORAGE_KEYS.TEACHER_APPLICATIONS, JSON.stringify(finalApps)); } catch {}
      }

      let finalInstructors = instructors;
      if (resolvedInstructors.length > 0) {
        const remoteIds = new Set(resolvedInstructors.map(r => r.id));
        const list = [...resolvedInstructors];
        instructors.forEach(loc => {
          if (!remoteIds.has(loc.id)) list.push(loc);
        });
        finalInstructors = list;
        setInstructors(finalInstructors);
        try { localStorage.setItem(STORAGE_KEYS.INSTRUCTORS, JSON.stringify(finalInstructors)); } catch {}
      }

      let finalRegs = registrations;
      if (resolvedRegs.length > 0) {
        const remoteIds = new Set(resolvedRegs.map(r => r.id));
        const list = [...resolvedRegs];
        registrations.forEach(loc => {
          if (!remoteIds.has(loc.id)) list.push(loc);
        });
        finalRegs = list.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
        setRegistrations(finalRegs);
        try { localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(finalRegs)); } catch {}
      }

      // 2. Push any legitimate non-demo records to Firestore
      for (const u of finalUsers) {
        const isHardcodedDemo = ['user-student-1', 'user-student-2', 'user-student-3', 'user-student-4', 'user-teacher-1'].includes(u.id);
        if (!isHardcodedDemo) {
          await saveUserToFirestore(u);
        }
      }
      for (const inst of finalInstructors) {
        await saveInstructorToFirestore(inst);
      }
      for (const app of finalApps) {
        await saveTeacherApplicationToFirestore(app);
      }
      for (const reg of finalRegs) {
        await saveRegistrationAuditToFirestore(reg);
      }

      setCloudSyncState({
        status: 'synced',
        lastSyncedAt: new Date().toLocaleTimeString(),
        pendingMutationsCount: 0,
        error: null
      });

      return {
        success: true,
        usersCount: finalUsers.length,
        appsCount: finalApps.length,
        regsCount: finalRegs.length
      };
    } catch (err: any) {
      setCloudSyncState(prev => ({
        ...prev,
        status: 'error',
        error: err.message || 'Sync failed'
      }));
      return {
        success: false,
        usersCount: allUsers.length,
        appsCount: teacherApplications.length,
        regsCount: registrations.length
      };
    }
  };

  // Sign up & Teacher Verification
  const signUpStudent = async (data: { name: string; email: string; password?: string; title?: string; bio?: string }): Promise<User> => {
    const initials = data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';
    const nowIso = new Date().toISOString();
    const newStudent: User = {
      id: `user-student-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password?.trim() || undefined,
      role: 'student',
      avatarText: initials,
      title: data.title?.trim() || 'Software Engineer',
      bio: data.bio?.trim() || 'Student pursuing technical masterclasses at Aetheria Academy.',
      enrolledCourseIds: [],
      totalSpent: 0,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'active',
      updatedAt: nowIso
    };

    setAllUsers(prev => [newStudent, ...prev.filter(u => u.id !== newStudent.id)]);
    setActiveUserId(newStudent.id);
    setActiveRole('student');

    const regAudit: RegistrationAudit = {
      id: `reg-${Date.now()}`,
      userId: newStudent.id,
      userName: newStudent.name,
      userEmail: newStudent.email,
      role: 'student',
      registeredAt: nowIso,
      registrationType: 'student_signup'
    };
    setRegistrations(prev => [regAudit, ...prev.filter(r => r.id !== regAudit.id)]);

    // Guarantee persistence across both client SDK and server-side cloud DB
    await Promise.allSettled([
      saveUserToFirestore(newStudent),
      saveRegistrationAuditToFirestore(regAudit)
    ]);

    return newStudent;
  };

  const signUpTeacher = async (data: {
    name: string;
    email: string;
    password?: string;
    academicTitle: string;
    institutionOrCompany: string;
    primaryDomain: string;
    bio: string;
    portfolioUrl?: string;
    credentialsSummary: string;
    proposedCourseTopic: string;
  }): Promise<{ user: User; application: TeacherApplication }> => {
    const appId = `app-teacher-${Date.now()}`;
    const userId = `user-teacher-${Date.now()}`;
    const initials = data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'TC';
    const nowIso = new Date().toISOString();

    const newApp: TeacherApplication = {
      id: appId,
      userId,
      applicantName: data.name.trim(),
      applicantEmail: data.email.trim(),
      academicTitle: data.academicTitle.trim(),
      institutionOrCompany: data.institutionOrCompany.trim(),
      primaryDomain: data.primaryDomain.trim(),
      bio: data.bio.trim(),
      portfolioUrl: data.portfolioUrl?.trim(),
      credentialsSummary: data.credentialsSummary.trim(),
      proposedCourseTopic: data.proposedCourseTopic.trim(),
      submittedAt: nowIso,
      status: 'pending_approval'
    };

    const newTeacher: User = {
      id: userId,
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password?.trim() || undefined,
      role: 'teacher',
      avatarText: initials,
      title: data.academicTitle.trim(),
      bio: data.bio.trim(),
      institutionOrCompany: data.institutionOrCompany.trim(),
      enrolledCourseIds: [],
      totalSpent: 0,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'active',
      teacherVerificationStatus: 'pending_approval',
      teacherApplicationId: appId,
      updatedAt: nowIso
    };

    const newInst: Instructor = {
      id: `inst-${Date.now()}`,
      userId: newTeacher.id,
      name: newTeacher.name,
      email: newTeacher.email,
      avatarText: initials,
      academicTitle: data.academicTitle.trim(),
      institutionOrCompany: data.institutionOrCompany.trim(),
      primaryDomain: data.primaryDomain.trim(),
      specialties: [data.primaryDomain.trim(), data.proposedCourseTopic.trim()].filter(Boolean),
      bio: data.bio.trim(),
      credentialsSummary: data.credentialsSummary.trim(),
      portfolioUrl: data.portfolioUrl?.trim(),
      verificationStatus: 'pending_approval',
      rating: 5.0,
      reviewCount: 0,
      studentCount: 0,
      courseIds: [],
      officeHoursSchedule: 'Tuesdays & Thursdays, 16:00 - 18:00 UTC',
      featured: false,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      updatedAt: nowIso
    };

    setTeacherApplications(prev => [newApp, ...prev.filter(a => a.id !== newApp.id)]);
    setAllUsers(prev => [newTeacher, ...prev.filter(u => u.id !== newTeacher.id)]);
    setInstructors(prev => [newInst, ...prev.filter(i => i.id !== newInst.id)]);
    setActiveUserId(newTeacher.id);
    setActiveRole('teacher');

    const regAudit: RegistrationAudit = {
      id: `reg-${Date.now()}`,
      userId: newTeacher.id,
      userName: newTeacher.name,
      userEmail: newTeacher.email,
      role: 'teacher',
      registeredAt: nowIso,
      registrationType: 'teacher_application'
    };
    setRegistrations(prev => [regAudit, ...prev.filter(r => r.id !== regAudit.id)]);

    // Guarantee persistence across both client SDK and server-side cloud DB
    await Promise.allSettled([
      saveUserToFirestore(newTeacher),
      saveTeacherApplicationToFirestore(newApp),
      saveInstructorToFirestore(newInst),
      saveRegistrationAuditToFirestore(regAudit)
    ]);

    return { user: newTeacher, application: newApp };
  };

  const applyAsTeacher = async (data: {
    academicTitle: string;
    institutionOrCompany: string;
    primaryDomain: string;
    bio: string;
    portfolioUrl?: string;
    credentialsSummary: string;
    proposedCourseTopic: string;
    password?: string;
  }): Promise<TeacherApplication> => {
    const user = currentUser || INITIAL_USERS[0];
    const appId = `app-teacher-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const newApp: TeacherApplication = {
      id: appId,
      userId: user.id,
      applicantName: user.name,
      applicantEmail: user.email,
      academicTitle: data.academicTitle.trim(),
      institutionOrCompany: data.institutionOrCompany.trim(),
      primaryDomain: data.primaryDomain.trim(),
      bio: data.bio.trim(),
      portfolioUrl: data.portfolioUrl?.trim(),
      credentialsSummary: data.credentialsSummary.trim(),
      proposedCourseTopic: data.proposedCourseTopic.trim(),
      submittedAt: nowIso,
      status: 'pending_approval'
    };

    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'TC';
    const newInst: Instructor = {
      id: `inst-${Date.now()}`,
      userId: user.id,
      name: user.name,
      email: user.email,
      avatarText: initials,
      academicTitle: data.academicTitle.trim(),
      institutionOrCompany: data.institutionOrCompany.trim(),
      primaryDomain: data.primaryDomain.trim(),
      specialties: [data.primaryDomain.trim(), data.proposedCourseTopic.trim()].filter(Boolean),
      bio: data.bio.trim(),
      credentialsSummary: data.credentialsSummary.trim(),
      portfolioUrl: data.portfolioUrl?.trim(),
      verificationStatus: 'pending_approval',
      rating: 5.0,
      reviewCount: 0,
      studentCount: 0,
      courseIds: [],
      officeHoursSchedule: 'Tuesdays & Thursdays, 16:00 - 18:00 UTC',
      featured: false,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      updatedAt: nowIso
    };

    const updatedUser: User = {
      ...user,
      role: 'teacher' as UserRole,
      password: data.password?.trim() || user.password,
      title: data.academicTitle.trim(),
      institutionOrCompany: data.institutionOrCompany.trim(),
      bio: data.bio.trim(),
      teacherVerificationStatus: 'pending_approval',
      teacherApplicationId: appId,
      updatedAt: nowIso
    };

    setTeacherApplications(prev => [newApp, ...prev.filter(a => a.id !== newApp.id)]);
    setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setInstructors(prev => {
      const exists = prev.some(i => i.userId === user.id);
      if (exists) {
        return prev.map(i => i.userId === user.id ? { ...i, ...newInst, id: i.id } : i);
      }
      return [newInst, ...prev];
    });
    setActiveRole('teacher');
    setActiveUserId(user.id);

    const regAudit: RegistrationAudit = {
      id: `reg-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      role: 'teacher',
      registeredAt: nowIso,
      registrationType: 'teacher_application'
    };
    setRegistrations(prev => [regAudit, ...prev.filter(r => r.id !== regAudit.id)]);

    // Guarantee persistence across both client SDK and server-side cloud DB
    await Promise.allSettled([
      saveUserToFirestore(updatedUser),
      saveTeacherApplicationToFirestore(newApp),
      saveInstructorToFirestore(newInst),
      saveRegistrationAuditToFirestore(regAudit)
    ]);

    return newApp;
  };

  const approveTeacherApplication = (applicationId: string, reviewNotes?: string) => {
    const app = teacherApplications.find(a => a.id === applicationId);
    if (!app) return;

    const updatedApp: TeacherApplication = {
      ...app,
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser?.name || 'Platform Admin',
      reviewNotes: reviewNotes || 'Credentials, research background, and curriculum plan verified and approved by management.'
    };

    setTeacherApplications(prev => prev.map(a => a.id === applicationId ? updatedApp : a));
    saveTeacherApplicationToFirestore(updatedApp);

    setAllUsers(prev => {
      const exists = prev.some(u => u.id === app.userId);
      if (exists) {
        return prev.map(u => {
          if (u.id === app.userId) {
            const updatedUser: User = {
              ...u,
              role: 'teacher',
              teacherVerificationStatus: 'approved'
            };
            saveUserToFirestore(updatedUser);
            return updatedUser;
          }
          return u;
        });
      } else {
        const initials = app.applicantName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'TC';
        const newUser: User = {
          id: app.userId,
          name: app.applicantName,
          email: app.applicantEmail,
          role: 'teacher',
          avatarText: initials,
          title: app.academicTitle,
          institutionOrCompany: app.institutionOrCompany,
          bio: app.bio,
          enrolledCourseIds: [],
          totalSpent: 0,
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'active',
          teacherVerificationStatus: 'approved',
          teacherApplicationId: app.id,
          updatedAt: new Date().toISOString()
        };
        saveUserToFirestore(newUser);
        return [newUser, ...prev];
      }
    });

    // Synchronize or create instructor database record
    setInstructors(prev => {
      const existing = prev.find(i => i.userId === app.userId);
      if (existing) {
        const updated: Instructor = {
          ...existing,
          verificationStatus: 'approved',
          academicTitle: app.academicTitle || existing.academicTitle,
          institutionOrCompany: app.institutionOrCompany || existing.institutionOrCompany,
          primaryDomain: app.primaryDomain || existing.primaryDomain,
          bio: app.bio || existing.bio,
          credentialsSummary: app.credentialsSummary || existing.credentialsSummary,
          portfolioUrl: app.portfolioUrl || existing.portfolioUrl,
          updatedAt: new Date().toISOString()
        };
        saveInstructorToFirestore(updated);
        return prev.map(i => i.userId === app.userId ? updated : i);
      } else {
        const initials = app.applicantName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'FC';
        const newInst: Instructor = {
          id: `inst-${Date.now()}`,
          userId: app.userId,
          name: app.applicantName,
          email: app.applicantEmail,
          avatarText: initials,
          academicTitle: app.academicTitle,
          institutionOrCompany: app.institutionOrCompany,
          primaryDomain: app.primaryDomain,
          specialties: [app.primaryDomain, app.proposedCourseTopic],
          bio: app.bio,
          credentialsSummary: app.credentialsSummary,
          portfolioUrl: app.portfolioUrl,
          verificationStatus: 'approved',
          rating: 5.0,
          reviewCount: 0,
          studentCount: 0,
          courseIds: [],
          officeHoursSchedule: 'Tuesdays & Thursdays, 16:00 - 18:00 UTC',
          featured: false,
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          updatedAt: new Date().toISOString()
        };
        saveInstructorToFirestore(newInst);
        return [newInst, ...prev];
      }
    });
  };

  const rejectTeacherApplication = (applicationId: string, reviewNotes?: string) => {
    const app = teacherApplications.find(a => a.id === applicationId);
    if (!app) return;

    const updatedApp: TeacherApplication = {
      ...app,
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser?.name || 'Platform Admin',
      reviewNotes: reviewNotes || 'Application declined by management based on institutional accreditation standards.'
    };

    setTeacherApplications(prev => prev.map(a => a.id === applicationId ? updatedApp : a));
    saveTeacherApplicationToFirestore(updatedApp);

    setAllUsers(prev => prev.map(u => {
      if (u.id === app.userId) {
        const updatedUser: User = {
          ...u,
          teacherVerificationStatus: 'rejected'
        };
        saveUserToFirestore(updatedUser);
        return updatedUser;
      }
      return u;
    }));

    setInstructors(prev => prev.map(i => {
      if (i.userId === app.userId) {
        const updated: Instructor = { ...i, verificationStatus: 'rejected', updatedAt: new Date().toISOString() };
        saveInstructorToFirestore(updated);
        return updated;
      }
      return i;
    }));
  };

  // Course operations
  const getCourseById = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };

  const isPendingTeacher = () => {
    return currentUser?.role === 'teacher' && currentUser.teacherVerificationStatus !== 'approved';
  };

  const createCourse = (courseData: Omit<Course, 'id' | 'rating' | 'reviewCount' | 'studentCount' | 'updatedDate'>): Course => {
    if (isPendingTeacher()) {
      console.warn('Action restricted: Pending teachers cannot create courses until admin approval is granted.');
      throw new Error('Access Restricted: Instructor account is pending administrative approval. Course creation is disabled.');
    }
    const authorUser = allUsers.find(u => u.id === courseData.instructorId) || currentUser;
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
      instructorName: authorUser?.name || courseData.instructorName,
      instructorTitle: authorUser?.title || courseData.instructorTitle,
      instructorBio: authorUser?.bio || courseData.instructorBio,
      rating: 5.0,
      reviewCount: 0,
      studentCount: 0,
      updatedDate: 'Just now',
    };
    setCourses(prev => [newCourse, ...prev]);

    // Sync into instructor's course list
    setInstructors(prev => prev.map(inst => {
      if (inst.userId === newCourse.instructorId || inst.id === newCourse.instructorId) {
        const updated = {
          ...inst,
          courseIds: Array.from(new Set([...inst.courseIds, newCourse.id])),
          updatedAt: new Date().toISOString()
        };
        saveInstructorToFirestore(updated);
        return updated;
      }
      return inst;
    }));

    return newCourse;
  };

  const updateCourse = (courseId: string, updates: Partial<Course>) => {
    if (isPendingTeacher()) {
      console.warn('Action restricted: Pending teachers cannot update courses until admin approval is granted.');
      return;
    }
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...updates, updatedDate: 'Updated just now' } : c));
  };

  const deleteCourse = (courseId: string) => {
    if (isPendingTeacher()) {
      console.warn('Action restricted: Pending teachers cannot delete courses until admin approval is granted.');
      return;
    }
    setCourses(prev => prev.filter(c => c.id !== courseId));
  };

  const toggleCoursePublish = (courseId: string) => {
    if (isPendingTeacher()) {
      console.warn('Action restricted: Pending teachers cannot publish courses until admin approval is granted.');
      return;
    }
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const nextStatus = c.status === 'published' ? 'draft' : 'published';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const updateCoursePrice = (courseId: string, newPrice: number) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return { 
          ...c, 
          price: newPrice, 
          updatedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
        };
      }
      return c;
    }));
  };

  // Enrollment & Progress
  const isUserEnrolled = (courseId: string): boolean => {
    if (!currentUser) return false;
    const key = `${currentUser.id}_${courseId}`;
    return Boolean(enrollments[key]);
  };

  const getEnrollment = (courseId: string): EnrollmentProgress | undefined => {
    if (!currentUser) return undefined;
    const key = `${currentUser.id}_${courseId}`;
    return enrollments[key];
  };

  const enrollInCourse = (courseId: string, _transactionId: string) => {
    if (!currentUser) return;
    const key = `${currentUser.id}_${courseId}`;
    const course = getCourseById(courseId);
    const firstLessonId = course?.modules[0]?.lessons[0]?.id;

    const newEnrollment: EnrollmentProgress = {
      courseId,
      userId: currentUser.id,
      enrolledAt: new Date().toISOString(),
      completedLessonIds: [],
      lastAccessedLessonId: firstLessonId,
      quizScores: {},
      userNotes: {},
    };

    setEnrollments(prev => ({
      ...prev,
      [key]: newEnrollment
    }));

    // Update user enrolledCourseIds
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          enrolledCourseIds: Array.from(new Set([...u.enrolledCourseIds, courseId]))
        };
      }
      return u;
    }));

    // Increment course student count
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, studentCount: c.studentCount + 1 } : c));
  };

  const markLessonComplete = (courseId: string, lessonId: string, isCompleted: boolean) => {
    if (!currentUser) return;
    const key = `${currentUser.id}_${courseId}`;
    const current = enrollments[key];
    if (!current) return;

    let updatedCompleted = [...current.completedLessonIds];
    if (isCompleted && !updatedCompleted.includes(lessonId)) {
      updatedCompleted.push(lessonId);
    } else if (!isCompleted) {
      updatedCompleted = updatedCompleted.filter(id => id !== lessonId);
    }

    setEnrollments(prev => ({
      ...prev,
      [key]: {
        ...current,
        completedLessonIds: updatedCompleted,
        lastAccessedLessonId: lessonId
      }
    }));
  };

  const saveUserNote = (courseId: string, lessonId: string, note: string) => {
    if (!currentUser) return;
    const key = `${currentUser.id}_${courseId}`;
    const current = enrollments[key];
    if (!current) return;

    setEnrollments(prev => ({
      ...prev,
      [key]: {
        ...current,
        userNotes: {
          ...current.userNotes,
          [lessonId]: note
        }
      }
    }));
  };

  const saveQuizScore = (courseId: string, lessonId: string, scorePercentage: number) => {
    if (!currentUser) return;
    const key = `${currentUser.id}_${courseId}`;
    const current = enrollments[key];
    if (!current) return;

    // Automatically mark quiz completed if score >= 70%
    const updatedCompleted = scorePercentage >= 70 && !current.completedLessonIds.includes(lessonId)
      ? [...current.completedLessonIds, lessonId]
      : current.completedLessonIds;

    setEnrollments(prev => ({
      ...prev,
      [key]: {
        ...current,
        completedLessonIds: updatedCompleted,
        quizScores: {
          ...current.quizScores,
          [lessonId]: scorePercentage
        }
      }
    }));
  };

  const issueCertificate = (
    courseId: string, 
    recipientName: string,
    honors: 'Standard Mastery' | 'Passed with Honors' | 'Highest Distinction (Top 5%)' = 'Standard Mastery',
    targetUserId?: string
  ) => {
    if (isPendingTeacher()) {
      console.warn('Action restricted: Pending teachers cannot issue certificates until admin approval is granted.');
      return;
    }
    const uid = targetUserId || currentUser?.id;
    if (!uid) return;
    const key = `${uid}_${courseId}`;
    const current = enrollments[key];
    const userObj = allUsers.find(u => u.id === uid);
    const finalName = recipientName || userObj?.name || currentUser?.name || 'Scholar';

    const course = getCourseById(courseId);
    const courseCode = course?.category ? course.category.substring(0, 3).toUpperCase() : 'ENG';
    const randCode = Math.floor(10000 + Math.random() * 90000);
    const userTag = (finalName.split(' ')[0] || 'USR').toUpperCase().replace(/[^A-Z]/g, '') || 'STU';

    const certData = {
      issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      credentialId: `ATH-${courseCode}-${randCode}-${userTag}`,
      recipientName: finalName,
      honors,
      gradeScore: Math.floor(92 + Math.random() * 8),
      verificationHash: `SHA256:0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`
    };

    setEnrollments(prev => ({
      ...prev,
      [key]: {
        ...(current || {
          courseId,
          userId: uid,
          enrolledAt: new Date().toISOString(),
          completedLessonIds: course ? course.modules.flatMap(m => m.lessons.map(l => l.id)) : [],
          quizScores: {},
          userNotes: {}
        }),
        certificateIssued: certData
      }
    }));
  };

  const revokeCertificate = (courseId: string, targetUserId: string) => {
    const uid = targetUserId || currentUser?.id;
    if (!uid) return;
    const key = `${uid}_${courseId}`;
    setEnrollments(prev => {
      if (!prev[key]) return prev;
      const clone = { ...prev };
      const { certificateIssued, ...rest } = clone[key];
      clone[key] = rest as EnrollmentProgress;
      return clone;
    });
  };

  const verifyCertificate = (credentialId: string) => {
    const cleanId = credentialId.trim().toUpperCase();
    if (!cleanId) return null;

    for (const [key, enrollment] of Object.entries(enrollments)) {
      if (enrollment.certificateIssued?.credentialId.toUpperCase() === cleanId) {
        const course = getCourseById(enrollment.courseId);
        const user = allUsers.find(u => u.id === enrollment.userId);
        return {
          isValid: true,
          certificate: enrollment.certificateIssued,
          course,
          user
        };
      }
    }

    return { isValid: false };
  };

  // Transactions
  const createTransaction = (data: {
    courseId: string;
    amount: number;
    originalAmount: number;
    discountCode?: string;
    discountAmount?: number;
    paymentMethod: 'card' | 'applepay' | 'googlepay' | 'bank';
    cardLast4?: string;
  }): Transaction => {
    const course = getCourseById(data.courseId);
    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const user = currentUser || {
      id: 'guest-student',
      name: 'Guest Scholar',
      email: 'guest@owly.academy'
    };

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber: invoiceNum,
      courseId: data.courseId,
      courseTitle: course?.title || 'Course Enrollment',
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      amount: data.amount,
      originalAmount: data.originalAmount,
      discountCode: data.discountCode,
      discountAmount: data.discountAmount,
      paymentMethod: data.paymentMethod,
      cardLast4: data.cardLast4 || '4242',
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update user total spent if logged in
    if (currentUser) {
      setAllUsers(prev => prev.map(u => {
        if (u.id === currentUser.id) {
          return { ...u, totalSpent: u.totalSpent + data.amount };
        }
        return u;
      }));
    }

    return newTx;
  };

  const refundTransaction = (transactionId: string) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx || tx.status === 'refunded') return;

    setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'refunded' } : t));

    // Remove enrollment for that course
    const enrollmentKey = `${tx.userId}_${tx.courseId}`;
    setEnrollments(prev => {
      const clone = { ...prev };
      delete clone[enrollmentKey];
      return clone;
    });

    // Deduct user spent and course id
    setAllUsers(prev => prev.map(u => {
      if (u.id === tx.userId) {
        return {
          ...u,
          totalSpent: Math.max(0, u.totalSpent - tx.amount),
          enrolledCourseIds: u.enrolledCourseIds.filter(cid => cid !== tx.courseId)
        };
      }
      return u;
    }));

    // Deduct course student count
    setCourses(prev => prev.map(c => c.id === tx.courseId ? { ...c, studentCount: Math.max(0, c.studentCount - 1) } : c));
  };

  // Discussions
  const addDiscussionThread = (
    courseId: string,
    lessonId: string | undefined,
    lessonTitle: string | undefined,
    title: string,
    content: string
  ) => {
    const authorId = currentUser ? currentUser.id : 'guest-student';
    const authorName = currentUser ? currentUser.name : 'Guest Scholar';
    const authorRole = currentUser ? currentUser.role : 'student';

    const newThread: DiscussionThread = {
      id: `disc-${Date.now()}`,
      courseId,
      lessonId,
      lessonTitle,
      authorId,
      authorName,
      authorRole,
      title,
      content,
      createdAt: 'Just now',
      isAnswered: false,
      isPinned: false,
      replies: []
    };
    setDiscussions(prev => [newThread, ...prev]);
  };

  const addDiscussionReply = (threadId: string, content: string) => {
    const authorId = currentUser ? currentUser.id : 'guest-student';
    const authorName = currentUser ? currentUser.name : 'Guest Scholar';
    const authorRole = currentUser ? currentUser.role : 'student';
    const isInstructorEndorsed = currentUser ? (currentUser.role === 'teacher' || currentUser.role === 'admin') : false;

    const newReply = {
      id: `reply-${Date.now()}`,
      authorId,
      authorName,
      authorRole,
      content,
      createdAt: 'Just now',
      isInstructorEndorsed
    };

    setDiscussions(prev => prev.map(thread => {
      if (thread.id === threadId) {
        const isAnswered = (currentUser && currentUser.role === 'teacher') || thread.isAnswered;
        return {
          ...thread,
          isAnswered,
          replies: [...thread.replies, newReply]
        };
      }
      return thread;
    }));
  };

  const togglePinDiscussion = (threadId: string) => {
    setDiscussions(prev => prev.map(t => t.id === threadId ? { ...t, isPinned: !t.isPinned } : t));
  };

  const toggleEndorseReply = (threadId: string, replyId: string) => {
    if (isPendingTeacher()) {
      console.warn('Action restricted: Pending teachers cannot endorse replies until admin approval is granted.');
      return;
    }
    setDiscussions(prev => prev.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          replies: thread.replies.map(r => r.id === replyId ? { ...r, isInstructorEndorsed: !r.isInstructorEndorsed } : r)
        };
      }
      return thread;
    }));
  };

  // Announcements
  const createAnnouncement = (courseId: string, title: string, content: string) => {
    if (isPendingTeacher()) {
      console.warn('Action restricted: Pending teachers cannot broadcast announcements until admin approval is granted.');
      return;
    }
    const course = getCourseById(courseId);
    const teacherId = currentUser ? currentUser.id : 'faculty-admin';
    const teacherName = currentUser ? currentUser.name : 'Faculty Lead';

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      courseId,
      courseTitle: course?.title || 'Course Announcement',
      teacherId,
      teacherName,
      title,
      content,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  // Google Workspace Integration
  const connectGoogle = async (): Promise<boolean> => {
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleAuthUser(res.user);
        setGoogleAccessToken(res.accessToken);
        setIsGoogleConnected(true);
        if (res.user.email?.toLowerCase() === 'theinsiderspace@gmail.com') {
          setActiveUserId('user-admin-theinsiderspace');
          setActiveRole('admin');
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to sign in with Google:', err);
      return false;
    }
  };

  const disconnectGoogle = async () => {
    await googleSignOut();
    setGoogleAuthUser(null);
    setGoogleAccessToken(null);
    setIsGoogleConnected(false);
  };

  const createMeetSession = async (
    sessionData: Omit<GoogleMeetSession, 'id' | 'createdAt' | 'attendeeCount'>
  ): Promise<GoogleMeetSession> => {
    if (isPendingTeacher()) {
      console.warn('Action restricted: Pending teachers cannot schedule Google Meet sessions until admin approval is granted.');
      throw new Error('Access Restricted: Instructor account is pending administrative approval.');
    }
    const id = `meet-${Date.now()}`;
    let finalMeetUrl = sessionData.meetUrl;
    let finalMeetCode = sessionData.meetCode;
    let calEventId: string | undefined = undefined;

    // If Google token available, create real Google Calendar Event with Hangouts/Google Meet
    if (googleAccessToken) {
      try {
        const startTime = new Date(sessionData.scheduledAt).toISOString();
        const endTime = new Date(new Date(sessionData.scheduledAt).getTime() + sessionData.durationMinutes * 60000).toISOString();
        const calRes = await createGoogleCalendarMeetEvent(googleAccessToken, {
          title: `${sessionData.title} (${sessionData.courseTitle})`,
          description: sessionData.description,
          startTime,
          endTime
        });
        if (calRes) {
          finalMeetUrl = calRes.meetUrl;
          finalMeetCode = calRes.meetCode;
          calEventId = calRes.eventId;
        }
      } catch (e) {
        console.warn('Google Calendar conference creation fallback to direct Meet space:', e);
      }
    }

    if (!finalMeetUrl || !finalMeetUrl.startsWith('https://meet.google.com/')) {
      const code = generateMeetCode();
      finalMeetUrl = `https://meet.google.com/${code}`;
      finalMeetCode = code;
    }

    const sessionFee = sessionData.lectureFee !== undefined 
      ? sessionData.lectureFee 
      : (educatorBilling.lectureFeesBySessionType?.[sessionData.sessionType] ?? educatorBilling.defaultLectureFee ?? 75);
    const systemRetentionFee = Math.round(sessionFee * 0.30 * 100) / 100;
    const educatorNetEarnings = Math.round(sessionFee * 0.70 * 100) / 100;

    const newSession: GoogleMeetSession = {
      ...sessionData,
      id,
      meetUrl: finalMeetUrl,
      meetCode: finalMeetCode,
      calendarEventId: calEventId,
      attendeeCount: 0,
      createdAt: new Date().toISOString(),
      lectureFee: sessionFee,
      systemRetentionFee,
      educatorNetEarnings
    };

    setGoogleMeetSessions(prev => [newSession, ...prev]);

    // Broadcast instant cohort announcement
    createAnnouncement(
      sessionData.courseId,
      `🔴 Live Google Meet Class Scheduled: ${sessionData.title}`,
      `A new Google Meet ${sessionData.sessionType.replace('_', ' ')} has been scheduled for ${new Date(sessionData.scheduledAt).toLocaleString()}. Admission: $${sessionFee} USD (System retains 30% / $${systemRetentionFee}). Access Link: ${finalMeetUrl}`
    );

    return newSession;
  };

  const deleteMeetSession = async (sessionId: string): Promise<boolean> => {
    const session = googleMeetSessions.find(s => s.id === sessionId);
    if (session?.calendarEventId && googleAccessToken) {
      await deleteGoogleCalendarEvent(googleAccessToken, session.calendarEventId);
    }
    setGoogleMeetSessions(prev => prev.filter(s => s.id !== sessionId));
    return true;
  };

  const updateMeetSessionStatus = (sessionId: string, status: GoogleMeetSession['status']) => {
    setGoogleMeetSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status } : s));
  };

  // AI-Driven Billing & Revenue Methods
  const updateEducatorBilling = (updates: Partial<EducatorBillingProfile>) => {
    setEducatorBilling(prev => ({ 
      ...prev, 
      ...updates,
      // Maintain 30% platform retention and 70% educator net share
      royaltyPercentage: updates.royaltyPercentage ?? 70,
      systemRetentionPercentage: updates.systemRetentionPercentage ?? 30
    }));
  };

  const setEducatorLectureFee = (fee: number, sessionType?: MeetSessionType) => {
    if (isPendingTeacher()) {
      console.warn('Action restricted: Pending teachers cannot set lecture fees until admin approval is granted.');
      return;
    }
    const cleanFee = Math.max(0, Math.round(fee * 100) / 100);
    setEducatorBilling(prev => {
      if (sessionType) {
        return {
          ...prev,
          lectureFeesBySessionType: {
            ...(prev.lectureFeesBySessionType || {
              live_lecture: 75,
              code_review: 95,
              office_hours: 45,
              workshop: 120,
              ama: 35
            }),
            [sessionType]: cleanFee
          }
        };
      }
      return {
        ...prev,
        defaultLectureFee: cleanFee
      };
    });
  };

  const requestPayout = (amount?: number): PayoutRecord => {
    if (isPendingTeacher()) {
      console.warn('Action restricted: Pending teachers cannot request payouts until admin approval is granted.');
      const blockedRecord: PayoutRecord = {
        id: `pay-blocked-${Date.now()}`,
        amount: 0,
        currency: educatorBilling.currency,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        method: 'Restricted (Pending Admin Approval)',
        accountReference: 'Verification Required',
        transactionCount: 0
      };
      return blockedRecord;
    }
    const teacherCourses = courses;
    const grossRev = teacherCourses.reduce((sum, c) => sum + (c.studentCount * c.price), 0);
    const netRoyalty = grossRev * (educatorBilling.royaltyPercentage / 100);
    const paidOutTotal = payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const maxAvailable = Math.max(0, netRoyalty - paidOutTotal);
    const payoutAmount = amount && amount > 0 && amount <= maxAvailable ? amount : (maxAvailable > 0 ? maxAvailable : 2500);

    const newPayout: PayoutRecord = {
      id: `pay-${Date.now()}`,
      amount: payoutAmount,
      currency: educatorBilling.currency,
      status: 'completed',
      requestedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      method: educatorBilling.payoutMethod === 'stripe_connect' ? 'Stripe Direct Deposit' : 'Wire Transfer',
      accountReference: `Account •••• ${educatorBilling.payoutAccountLast4}`,
      transactionCount: Math.max(1, Math.floor(payoutAmount / 220))
    };

    setPayouts(prev => [newPayout, ...prev]);
    return newPayout;
  };

  const refreshAIPricingRecommendations = async (): Promise<AIPricingRecommendation[]> => {
    try {
      const res = await fetch('/api/billing-ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.recommendations && Array.isArray(data.recommendations)) {
          setAiPricingRecommendations(data.recommendations);
          return data.recommendations;
        }
      }
    } catch (e) {
      console.warn('API call to /api/billing-ai/recommendations failed, computing heuristics:', e);
    }

    // Heuristic fallback
    const computed: AIPricingRecommendation[] = courses.slice(0, 3).map(c => {
      const isUnderpriced = c.rating >= 4.9 && c.price < 250;
      const recommendedPrice = isUnderpriced ? Math.round(c.price * 1.15) : Math.round(c.price * 1.08);
      const delta = Math.round(((recommendedPrice - c.price) / c.price) * 100 * 10) / 10;
      return {
        courseId: c.id,
        courseTitle: c.title,
        currentPrice: c.price,
        recommendedPrice,
        projectedRevenueDeltaPercent: delta,
        rationale: `Course carries a stellar ${c.rating} rating with ${c.studentCount} active students. Category demand indicates room for pricing elasticity improvement.`,
        confidenceScore: Math.floor(88 + Math.random() * 8),
        marketPositioning: isUnderpriced ? 'underpriced' : 'premium_opportunity',
        suggestedPromotionTier: 'Flash Weekend Cohort Pass'
      };
    });
    setAiPricingRecommendations(computed);
    return computed;
  };

  // ==========================================
  // AI-DRIVEN VIDEO STUDIO & HOSTING METHODS
  // ==========================================
  const addHostedVideo = (video: HostedVideo) => {
    if (isPendingTeacher()) {
      console.warn('Action restricted: Pending teachers cannot upload videos until admin approval is granted.');
      return;
    }
    setHostedVideos(prev => [video, ...prev]);
    setStorageMetrics(prev => ({
      ...prev,
      usedBytes: prev.usedBytes + (video.fileSizeBytes || 500000000),
      totalHostedVideos: prev.totalHostedVideos + 1
    }));
  };

  const updateHostedVideo = (videoId: string, updates: Partial<HostedVideo>) => {
    setHostedVideos(prev => prev.map(v => v.id === videoId ? { ...v, ...updates } : v));
  };

  const deleteHostedVideo = (videoId: string) => {
    setHostedVideos(prev => prev.filter(v => v.id !== videoId));
    setStorageMetrics(prev => ({
      ...prev,
      totalHostedVideos: Math.max(0, prev.totalHostedVideos - 1)
    }));
  };

  const attachVideoToLesson = (videoId: string, courseId: string, lessonId: string) => {
    const course = courses.find(c => c.id === courseId);
    let matchedLessonTitle = 'Lesson';
    if (course) {
      const moduleWithLesson = course.modules.find(m => m.lessons.some(l => l.id === lessonId));
      const lesson = moduleWithLesson?.lessons.find(l => l.id === lessonId);
      if (lesson) {
        matchedLessonTitle = lesson.title;
      }
    }

    const video = hostedVideos.find(v => v.id === videoId);
    if (video) {
      // 1. Update the video record
      updateHostedVideo(videoId, {
        courseId,
        courseTitle: course?.title || 'Course',
        lessonId,
        lessonTitle: matchedLessonTitle
      });

      // 2. Update the course module lesson videoUrl
      setCourses(prev => prev.map(c => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          modules: c.modules.map(mod => ({
            ...mod,
            lessons: mod.lessons.map(l => {
              if (l.id !== lessonId) return l;
              return {
                ...l,
                videoUrl: video.videoUrl,
                durationMinutes: Math.max(1, Math.round(video.durationSeconds / 60))
              };
            })
          }))
        };
      }));
    }
  };

  const analyzeVideoWithAI = async (videoId: string, topic?: string): Promise<HostedVideo | null> => {
    const video = hostedVideos.find(v => v.id === videoId);
    if (!video) return null;

    // Set transcoding/processing state
    updateHostedVideo(videoId, { status: 'processing_ai' });

    try {
      const [aiRes, quizRes] = await Promise.all([
        fetch('/api/video-ai/transcribe-and-chapter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: video.title,
            topic: topic || video.description || 'Software Engineering Masterclass',
            durationSeconds: video.durationSeconds,
            instructorName: currentUser?.name || 'Lead Faculty'
          })
        }).then(r => r.json()).catch(() => null),
        fetch('/api/video-ai/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoTitle: video.title,
            transcriptText: video.aiMetadata?.transcript?.map(t => t.text).join(' ') || video.description
          })
        }).then(r => r.json()).catch(() => null)
      ]);

      const updatedAI: any = {
        summary: aiRes?.summary || video.aiMetadata?.summary || 'Comprehensive video lecture breakdown.',
        chapters: aiRes?.chapters || video.aiMetadata?.chapters || [],
        transcript: aiRes?.transcript || video.aiMetadata?.transcript || [],
        keyTakeaways: aiRes?.keyTakeaways || video.aiMetadata?.keyTakeaways || [],
        suggestedQuiz: quizRes?.questions || video.aiMetadata?.suggestedQuiz || [],
        speechPacingWpm: aiRes?.speechPacingWpm || 140,
        clarityScore: aiRes?.clarityScore || 95,
        tags: aiRes?.tags || video.aiMetadata?.tags || ['Studio Recorded', 'AI Enhanced']
      };

      const updatedVideo: HostedVideo = {
        ...video,
        status: 'ready',
        aiMetadata: updatedAI
      };

      updateHostedVideo(videoId, {
        status: 'ready',
        aiMetadata: updatedAI
      });

      return updatedVideo;
    } catch (err) {
      console.warn('AI analysis call failed, reverting to ready status:', err);
      updateHostedVideo(videoId, { status: 'ready' });
      return video;
    }
  };

  const generateTeleprompterScript = async (topic: string, durationMinutes = 5, tone = 'Technical Masterclass') => {
    try {
      const res = await fetch('/api/video-ai/teleprompter-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          durationMinutes,
          tone,
          audience: 'Engineering Students & Practitioners'
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('Failed to call teleprompter API, using local fallback:', err);
    }

    return {
      topic,
      estimatedMinutes: durationMinutes,
      scriptText: `[Look directly into camera · Confident presentation posture]

Welcome everyone! In this lesson, we are exploring ${topic}.

[Pause · 2 seconds]

Pay close attention to how we structure the architecture. We want clean separation of concerns and deterministic failure handling.

[Switch screen to code editor]

Let's walk through the implementation step by step. Notice how every asynchronous boundary handles backpressure gracefully.

[Return to camera · Friendly signoff]

Try out the hands-on exercise below, and I will see you in the next lecture!`,
      bulletPoints: [
        'Architecture motivation and core design objectives',
        'Step-by-step implementation walkthrough',
        'Production edge cases and backpressure mitigation'
      ]
    };
  };

  // Peer Review & Assignment Submissions
  const submitAssignment = (data: {
    courseId: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
    title: string;
    summary: string;
    codeSnippet?: string;
    language?: string;
    repoUrl?: string;
  }): AssignmentSubmission => {
    const studentUser = currentUser || {
      id: 'student-anonymous',
      name: 'Enrolled Scholar',
      avatarText: 'ES',
      role: 'student' as UserRole
    };

    const newSub: AssignmentSubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      courseId: data.courseId,
      courseTitle: data.courseTitle,
      lessonId: data.lessonId,
      lessonTitle: data.lessonTitle,
      studentId: studentUser.id,
      studentName: studentUser.name,
      studentAvatar: studentUser.avatarText || studentUser.name.substring(0, 2).toUpperCase(),
      studentRole: (studentUser.role as UserRole) || 'student',
      title: data.title,
      summary: data.summary,
      codeSnippet: data.codeSnippet,
      language: data.language || 'typescript',
      repoUrl: data.repoUrl,
      submittedAt: 'Just now',
      status: 'pending_review',
      reviews: []
    };

    setAssignmentSubmissions(prev => [newSub, ...prev]);
    return newSub;
  };

  const addPeerReview = (
    submissionId: string,
    review: {
      rating: number;
      rubric: { clarity: number; architecture: number; robustness: number };
      strengths: string;
      improvements: string;
      comment: string;
    }
  ) => {
    const reviewer = currentUser || {
      id: 'student-peer',
      name: 'Peer Reviewer',
      avatarText: 'PR',
      role: 'student' as UserRole
    };

    const newReview: PeerReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      submissionId,
      reviewerId: reviewer.id,
      reviewerName: reviewer.name,
      reviewerAvatar: reviewer.avatarText || reviewer.name.substring(0, 2).toUpperCase(),
      reviewerRole: (reviewer.role as UserRole) || 'student',
      rating: review.rating,
      rubric: review.rubric,
      strengths: review.strengths,
      improvements: review.improvements,
      comment: review.comment,
      createdAt: 'Just now',
      helpfulVotes: 0,
      helpfulUserIds: [],
      comments: []
    };

    setAssignmentSubmissions(prev => prev.map(sub => {
      if (sub.id !== submissionId) return sub;
      const allReviews = [newReview, ...sub.reviews];
      const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
      const status: 'pending_review' | 'reviewed' | 'distinguished' = 
        allReviews.length >= 2 && avgRating >= 4.5 ? 'distinguished' : 'reviewed';

      return {
        ...sub,
        status,
        reviews: allReviews
      };
    }));
  };

  const addReviewComment = (submissionId: string, reviewId: string, content: string) => {
    const author = currentUser || {
      id: 'student-peer',
      name: 'Peer Scholar',
      avatarText: 'PS',
      role: 'student' as UserRole
    };

    const newComment: PeerReviewComment = {
      id: `rev-com-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatarText || author.name.substring(0, 2).toUpperCase(),
      authorRole: (author.role as UserRole) || 'student',
      content,
      createdAt: 'Just now'
    };

    setAssignmentSubmissions(prev => prev.map(sub => {
      if (sub.id !== submissionId) return sub;
      return {
        ...sub,
        reviews: sub.reviews.map(rev => {
          if (rev.id !== reviewId) return rev;
          return {
            ...rev,
            comments: [...rev.comments, newComment]
          };
        })
      };
    }));
  };

  const voteReviewHelpful = (submissionId: string, reviewId: string) => {
    const userId = currentUser?.id || 'guest-user';
    setAssignmentSubmissions(prev => prev.map(sub => {
      if (sub.id !== submissionId) return sub;
      return {
        ...sub,
        reviews: sub.reviews.map(rev => {
          if (rev.id !== reviewId) return rev;
          const hasVoted = rev.helpfulUserIds.includes(userId);
          const helpfulUserIds = hasVoted
            ? rev.helpfulUserIds.filter(id => id !== userId)
            : [...rev.helpfulUserIds, userId];
          return {
            ...rev,
            helpfulVotes: helpfulUserIds.length,
            helpfulUserIds
          };
        })
      };
    }));
  };

  // Reset demo
  const resetPlatformData = () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROLE);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    localStorage.removeItem('aetheria_lms_active_user_id_v1');
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.ENROLLMENTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.DISCUSSIONS);
    localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS);
    localStorage.removeItem(STORAGE_KEYS.TEACHER_APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.MEET_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.EDUCATOR_BILLING);
    localStorage.removeItem(STORAGE_KEYS.PAYOUTS);
    localStorage.removeItem(STORAGE_KEYS.AI_RECOMMENDATIONS);
    localStorage.removeItem(STORAGE_KEYS.HOSTED_VIDEOS);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.INSTRUCTORS);

    setAllUsers(INITIAL_USERS);
    setActiveRole('guest');
    setActiveUserId(null);
    setInstructors(INITIAL_INSTRUCTORS);
    setTeacherApplications(INITIAL_TEACHER_APPLICATIONS);
    setCourses(INITIAL_COURSES);
    setEnrollments(INITIAL_ENROLLMENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setDiscussions(INITIAL_DISCUSSIONS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setGoogleMeetSessions(INITIAL_MEET_SESSIONS);
    setEducatorBilling(INITIAL_EDUCATOR_BILLING);
    setPayouts(INITIAL_PAYOUTS);
    setAiPricingRecommendations(INITIAL_AI_RECOMMENDATIONS);
    setHostedVideos(INITIAL_HOSTED_VIDEOS);
    setStorageMetrics(INITIAL_STORAGE_METRICS);
  };

  return (
    <LmsContext.Provider
      value={{
        currentUser,
        allUsers,
        registrations,
        setUserRole,
        setCurrentUserById,
        signOut,
        updateUserStatus,
        deleteUser,
        deleteMultipleUsers,
        deleteTeacherApplication,
        addUserDirectly,
        updateUserProfile,
        saveUserProfileToFirestore: saveUserToFirestore,
        enhanceUserProfileWithAI,
        instructors,
        getInstructorById,
        getInstructorByUserId,
        updateInstructorProfile,
        matchInstructorsWithAI,
        cloudSyncState,
        forceCloudSync,
        teacherApplications,
        signUpStudent,
        signUpTeacher,
        applyAsTeacher,
        approveTeacherApplication,
        rejectTeacherApplication,
        courses,
        getCourseById,
        createCourse,
        updateCourse,
        updateCoursePrice,
        deleteCourse,
        toggleCoursePublish,
        googleMeetSessions,
        createMeetSession,
        deleteMeetSession,
        updateMeetSessionStatus,
        isGoogleConnected,
        googleAuthUser,
        connectGoogle,
        disconnectGoogle,
        educatorBilling,
        updateEducatorBilling,
        setEducatorLectureFee,
        payouts,
        requestPayout,
        aiPricingRecommendations,
        refreshAIPricingRecommendations,
        hostedVideos,
        storageMetrics,
        addHostedVideo,
        updateHostedVideo,
        deleteHostedVideo,
        attachVideoToLesson,
        analyzeVideoWithAI,
        generateTeleprompterScript,
        enrollments,
        getEnrollment,
        isUserEnrolled,
        enrollInCourse,
        markLessonComplete,
        saveUserNote,
        saveQuizScore,
        issueCertificate,
        revokeCertificate,
        verifyCertificate,
        transactions,
        createTransaction,
        refundTransaction,
        discussions,
        addDiscussionThread,
        addDiscussionReply,
        togglePinDiscussion,
        toggleEndorseReply,
        announcements,
        createAnnouncement,
        assignmentSubmissions,
        submitAssignment,
        addPeerReview,
        addReviewComment,
        voteReviewHelpful,
        embeddedEcosystem,
        setEmbeddedEcosystem,
        resetPlatformData
      }}
    >
      {children}
    </LmsContext.Provider>
  );
};

export const useLms = () => {
  const context = useContext(LmsContext);
  if (!context) {
    throw new Error('useLms must be used within an LmsProvider');
  }
  return context;
};
