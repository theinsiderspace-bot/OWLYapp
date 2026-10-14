export type UserRole = 'student' | 'teacher' | 'admin';

export type TeacherVerificationStatus = 'unverified' | 'pending_approval' | 'approved' | 'rejected';

export interface TeacherApplication {
  id: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  academicTitle: string;
  institutionOrCompany: string;
  primaryDomain: string;
  bio: string;
  portfolioUrl?: string;
  credentialsSummary: string;
  proposedCourseTopic: string;
  submittedAt: string;
  status: TeacherVerificationStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarText: string;
  title?: string;
  bio?: string;
  enrolledCourseIds: string[];
  totalSpent: number;
  joinedDate: string;
  status: 'active' | 'suspended';
  teacherVerificationStatus?: TeacherVerificationStatus;
  teacherApplicationId?: string;
}

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

export type LessonType = 'video' | 'article' | 'quiz';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ResourceAttachment {
  id: string;
  name: string;
  fileSize: string;
  type: string;
  downloadUrl?: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  type: LessonType;
  videoUrl?: string;
  contentMarkdown?: string;
  quizQuestions?: QuizQuestion[];
  resources?: ResourceAttachment[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: CourseLevel;
  price: number;
  originalPrice?: number;
  instructorId: string;
  instructorName: string;
  instructorTitle: string;
  instructorBio: string;
  rating: number;
  reviewCount: number;
  studentCount: number;
  durationHours: number;
  updatedDate: string;
  featured?: boolean;
  status: 'published' | 'draft' | 'archived';
  learningObjectives: string[];
  prerequisites: string[];
  modules: CourseModule[];
  theme: {
    accentColor: string;
    gradientFrom: string;
    gradientTo: string;
    icon: 'server' | 'cpu' | 'trending-up' | 'layout';
  };
}

export interface EnrollmentProgress {
  courseId: string;
  userId: string;
  enrolledAt: string;
  completedLessonIds: string[];
  lastAccessedLessonId?: string;
  quizScores: Record<string, number>; // quizLessonId -> percentage
  userNotes: Record<string, string>; // lessonId -> personal markdown/notes
  certificateIssued?: {
    issueDate: string;
    credentialId: string;
    recipientName: string;
    honors?: 'Standard Mastery' | 'Passed with Honors' | 'Highest Distinction (Top 5%)';
    gradeScore?: number;
    verificationHash?: string;
  };
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  courseId: string;
  courseTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  originalAmount: number;
  discountCode?: string;
  discountAmount?: number;
  paymentMethod: 'card' | 'applepay' | 'googlepay' | 'bank';
  cardLast4?: string;
  status: 'completed' | 'refunded';
  createdAt: string;
}

export interface DiscussionReply {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
  isInstructorEndorsed?: boolean;
}

export interface DiscussionThread {
  id: string;
  courseId: string;
  lessonId?: string;
  lessonTitle?: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  title: string;
  content: string;
  createdAt: string;
  replies: DiscussionReply[];
  isPinned?: boolean;
  isAnswered?: boolean;
}

export interface Announcement {
  id: string;
  courseId: string;
  courseTitle: string;
  teacherId: string;
  teacherName: string;
  title: string;
  content: string;
  createdAt: string;
}

// Google Meet Integration Types
export type MeetSessionType = 'live_lecture' | 'code_review' | 'office_hours' | 'workshop' | 'ama';

export interface GoogleMeetSession {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  sessionType: MeetSessionType;
  scheduledAt: string; // ISO string
  durationMinutes: number;
  meetUrl: string; // e.g. https://meet.google.com/xyz-abcd-efg
  meetCode: string; // e.g. xyz-abcd-efg
  calendarEventId?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  attendeeCount: number;
  maxAttendees?: number;
  description: string;
  createdAt: string;
  isRecorded?: boolean;
}

// AI-Driven Billing & Financial Types
export interface EducatorBillingProfile {
  royaltyPercentage: number; // e.g. 85 = 85%
  payoutSchedule: 'manual' | 'monthly_1st' | 'biweekly';
  payoutMethod: 'stripe_connect' | 'direct_deposit' | 'paypal';
  payoutAccountLast4: string;
  taxWithholdingStatus: 'verified_w8ben' | 'verified_w9' | 'pending';
  currency: string;
  autoPayoutEnabled: boolean;
  minimumThreshold: number;
}

export interface PayoutRecord {
  id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'processing' | 'pending';
  requestedAt: string;
  processedAt?: string;
  method: string;
  accountReference: string;
  transactionCount: number;
}

export interface AIPricingRecommendation {
  courseId: string;
  courseTitle: string;
  currentPrice: number;
  recommendedPrice: number;
  projectedRevenueDeltaPercent: number;
  rationale: string;
  confidenceScore: number;
  marketPositioning: 'underpriced' | 'optimal' | 'premium_opportunity' | 'surge_candidate';
  suggestedPromotionTier?: string;
}

export interface AIEarningsForecast {
  currentMonthlyRunRate: number;
  month30Estimate: number;
  month60Estimate: number;
  month90Estimate: number;
  projectedGrowthPercent: number;
  scenarioConservative: number;
  scenarioBullish: number;
  keyDrivers: string[];
  riskMitigations: string[];
  lastUpdated: string;
}

// AI-Driven Video Hosting & Recording Studio Types
export interface VideoChapter {
  timestamp: number; // in seconds
  title: string;
  summary: string;
}

export interface VideoTranscriptLine {
  timestamp: number; // in seconds
  text: string;
  speaker: string;
}

export interface VideoAIMetadata {
  transcript: VideoTranscriptLine[];
  chapters: VideoChapter[];
  summary: string;
  keyTakeaways: string[];
  suggestedQuiz: QuizQuestion[];
  speechPacingWpm: number;
  clarityScore: number; // 0 - 100
  tags: string[];
}

export type RecordingSource = 'webcam_mic' | 'screen_mic' | 'picture_in_picture' | 'studio_upload';

export interface HostedVideo {
  id: string;
  title: string;
  description: string;
  courseId?: string;
  courseTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  durationSeconds: number;
  fileSizeBytes: number;
  resolution: '4K' | '1080p' | '720p';
  codec: string;
  bitrateMbps: number;
  status: 'ready' | 'transcoding' | 'processing_ai';
  recordedAt: string;
  recordingSource: RecordingSource;
  storageTier: 'Edge CDN Multi-Region' | 'Standard Cloud Storage';
  cdnEndpoint: string;
  aiMetadata: VideoAIMetadata;
}

export interface TeleprompterScript {
  id: string;
  topic: string;
  scriptText: string;
  estimatedMinutes: number;
  bulletPoints: string[];
  createdAt: string;
}

export interface CloudStorageMetrics {
  usedBytes: number;
  totalBytes: number;
  bandwidthUsedGb: number;
  totalBandwidthGb: number;
  totalHostedVideos: number;
  edgeLocationsActive: number;
}

