import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
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
  EducatorBillingProfile,
  PayoutRecord,
  AIPricingRecommendation,
  HostedVideo,
  CloudStorageMetrics
} from '../types/lms';
import {
  INITIAL_USERS,
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
  INITIAL_STORAGE_METRICS
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

interface LmsContextType {
  // User & Persona State
  currentUser: User | null;
  allUsers: User[];
  setUserRole: (role: UserRole) => void;
  setCurrentUserById: (userId: string | null) => void;
  signOut: () => void;
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => void;

  // Sign up & Teacher Verification
  teacherApplications: TeacherApplication[];
  signUpStudent: (data: { name: string; email: string; title?: string; bio?: string }) => User;
  signUpTeacher: (data: {
    name: string;
    email: string;
    academicTitle: string;
    institutionOrCompany: string;
    primaryDomain: string;
    bio: string;
    portfolioUrl?: string;
    credentialsSummary: string;
    proposedCourseTopic: string;
  }) => { user: User; application: TeacherApplication };
  applyAsTeacher: (data: {
    academicTitle: string;
    institutionOrCompany: string;
    primaryDomain: string;
    bio: string;
    portfolioUrl?: string;
    credentialsSummary: string;
    proposedCourseTopic: string;
  }) => TeacherApplication;
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

  // Reset to demo data
  resetPlatformData: () => void;
}

const LmsContext = createContext<LmsContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'aetheria_lms_users_v1',
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
  HOSTED_VIDEOS: 'aetheria_lms_hosted_videos_v1'
};

export const LmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or fallback to initial data
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      return stored ? JSON.parse(stored) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
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
      return stored ? JSON.parse(stored) : INITIAL_EDUCATOR_BILLING;
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
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  };

  // Sign up & Teacher Verification
  const signUpStudent = (data: { name: string; email: string; title?: string; bio?: string }): User => {
    const initials = data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';
    const newStudent: User = {
      id: `user-student-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      role: 'student',
      avatarText: initials,
      title: data.title?.trim() || 'Software Engineer',
      bio: data.bio?.trim() || 'Student pursuing technical masterclasses at Aetheria Academy.',
      enrolledCourseIds: [],
      totalSpent: 0,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'active'
    };

    setAllUsers(prev => [newStudent, ...prev]);
    setActiveUserId(newStudent.id);
    setActiveRole('student');
    return newStudent;
  };

  const signUpTeacher = (data: {
    name: string;
    email: string;
    academicTitle: string;
    institutionOrCompany: string;
    primaryDomain: string;
    bio: string;
    portfolioUrl?: string;
    credentialsSummary: string;
    proposedCourseTopic: string;
  }): { user: User; application: TeacherApplication } => {
    const appId = `app-teacher-${Date.now()}`;
    const userId = `user-teacher-${Date.now()}`;
    const initials = data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'TC';

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
      submittedAt: new Date().toISOString(),
      status: 'pending_approval'
    };

    const newTeacher: User = {
      id: userId,
      name: data.name.trim(),
      email: data.email.trim(),
      role: 'teacher',
      avatarText: initials,
      title: data.academicTitle.trim(),
      bio: data.bio.trim(),
      enrolledCourseIds: [],
      totalSpent: 0,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'active',
      teacherVerificationStatus: 'pending_approval',
      teacherApplicationId: appId
    };

    setTeacherApplications(prev => [newApp, ...prev]);
    setAllUsers(prev => [newTeacher, ...prev]);
    setActiveUserId(newTeacher.id);
    setActiveRole('teacher');
    return { user: newTeacher, application: newApp };
  };

  const applyAsTeacher = (data: {
    academicTitle: string;
    institutionOrCompany: string;
    primaryDomain: string;
    bio: string;
    portfolioUrl?: string;
    credentialsSummary: string;
    proposedCourseTopic: string;
  }): TeacherApplication => {
    const user = currentUser || INITIAL_USERS[0];
    const appId = `app-teacher-${Date.now()}`;
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
      submittedAt: new Date().toISOString(),
      status: 'pending_approval'
    };

    setTeacherApplications(prev => [newApp, ...prev]);
    setAllUsers(prev => prev.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          role: 'teacher' as UserRole,
          title: data.academicTitle.trim(),
          bio: data.bio.trim(),
          teacherVerificationStatus: 'pending_approval',
          teacherApplicationId: appId
        };
      }
      return u;
    }));
    setActiveRole('teacher');
    setActiveUserId(user.id);
    return newApp;
  };

  const approveTeacherApplication = (applicationId: string, reviewNotes?: string) => {
    const app = teacherApplications.find(a => a.id === applicationId);
    if (!app) return;

    setTeacherApplications(prev => prev.map(a => {
      if (a.id === applicationId) {
        return {
          ...a,
          status: 'approved',
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser?.name || 'Platform Admin',
          reviewNotes: reviewNotes || 'Credentials, research background, and curriculum plan verified and approved by management.'
        };
      }
      return a;
    }));

    setAllUsers(prev => prev.map(u => {
      if (u.id === app.userId) {
        return {
          ...u,
          teacherVerificationStatus: 'approved'
        };
      }
      return u;
    }));
  };

  const rejectTeacherApplication = (applicationId: string, reviewNotes?: string) => {
    const app = teacherApplications.find(a => a.id === applicationId);
    if (!app) return;

    setTeacherApplications(prev => prev.map(a => {
      if (a.id === applicationId) {
        return {
          ...a,
          status: 'rejected',
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser?.name || 'Platform Admin',
          reviewNotes: reviewNotes || 'Application declined by management based on institutional accreditation standards.'
        };
      }
      return a;
    }));

    setAllUsers(prev => prev.map(u => {
      if (u.id === app.userId) {
        return {
          ...u,
          teacherVerificationStatus: 'rejected'
        };
      }
      return u;
    }));
  };

  // Course operations
  const getCourseById = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };

  const createCourse = (courseData: Omit<Course, 'id' | 'rating' | 'reviewCount' | 'studentCount' | 'updatedDate'>): Course => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      studentCount: 0,
      updatedDate: 'Just now',
    };
    setCourses(prev => [newCourse, ...prev]);
    return newCourse;
  };

  const updateCourse = (courseId: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...updates, updatedDate: 'Updated just now' } : c));
  };

  const deleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
  };

  const toggleCoursePublish = (courseId: string) => {
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

    const newSession: GoogleMeetSession = {
      ...sessionData,
      id,
      meetUrl: finalMeetUrl,
      meetCode: finalMeetCode,
      calendarEventId: calEventId,
      attendeeCount: 0,
      createdAt: new Date().toISOString()
    };

    setGoogleMeetSessions(prev => [newSession, ...prev]);

    // Broadcast instant cohort announcement
    createAnnouncement(
      sessionData.courseId,
      `🔴 Live Google Meet Class Scheduled: ${sessionData.title}`,
      `A new Google Meet ${sessionData.sessionType.replace('_', ' ')} has been scheduled for ${new Date(sessionData.scheduledAt).toLocaleString()}. Access Link: ${finalMeetUrl}`
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
    setEducatorBilling(prev => ({ ...prev, ...updates }));
  };

  const requestPayout = (amount?: number): PayoutRecord => {
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

    setAllUsers(INITIAL_USERS);
    setActiveRole('guest');
    setActiveUserId(null);
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
        setUserRole,
        setCurrentUserById,
        signOut,
        updateUserStatus,
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
