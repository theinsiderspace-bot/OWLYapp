import React, { useState } from 'react';
import { Course, EnrollmentProgress } from '../types/lms';
import { useLms } from '../context/LmsContext';
import { CourseVisual } from './CourseVisual';
import { CourseEditorModal } from './CourseEditorModal';
import { CertificateModal } from './CertificateModal';
import { GoogleMeetEducatorView } from './GoogleMeetEducatorView';
import { VideoStudio } from './VideoStudio';
import { EducatorLectureFeeManager } from './EducatorLectureFeeManager';
import { TeacherAnalyticsChart } from './TeacherAnalyticsChart';
import { 
  Plus, 
  Users, 
  DollarSign, 
  Star, 
  BookOpen, 
  Edit3, 
  Eye, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  Pin, 
  BellRing,
  Sparkles,
  Clock,
  ArrowRight,
  Award,
  ShieldCheck,
  RotateCcw,
  ShieldAlert,
  AlertTriangle,
  Lock,
  X,
  Building2,
  ExternalLink,
  UserCheck,
  Video,
  TrendingUp,
  BarChart3,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface TeacherStudioProps {
  onSelectCourse: (course: Course) => void;
  onOpenTeacherApplication?: () => void;
  onOpenSignIn?: () => void;
  onBrowseCatalog?: () => void;
}

export const TeacherStudio: React.FC<TeacherStudioProps> = ({ 
  onSelectCourse, 
  onOpenTeacherApplication, 
  onOpenSignIn,
  onBrowseCatalog 
}) => {
  const { 
    currentUser, 
    allUsers,
    courses, 
    enrollments,
    discussions, 
    addDiscussionReply, 
    togglePinDiscussion, 
    toggleEndorseReply,
    announcements,
    createAnnouncement,
    toggleCoursePublish,
    issueCertificate,
    revokeCertificate,
    teacherApplications,
    approveTeacherApplication,
    googleMeetSessions,
    hostedVideos,
    transactions,
    educatorBilling,
    cloudSyncState,
    forceCloudSync
  } = useLms();

  const [activeTab, setActiveTab] = useState<'courses' | 'analytics' | 'video-studio' | 'meet' | 'lecture-fees' | 'discussions' | 'announcements' | 'certificates'>('courses');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [publishAlert, setPublishAlert] = useState<string | null>(null);
  const [showAppDetails, setShowAppDetails] = useState(false);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [approvalToast, setApprovalToast] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Status checks: Approved requires explicit verificationStatus === 'approved' (or platform admin)
  const isTeacherApproved = (currentUser?.role === 'teacher' && currentUser.teacherVerificationStatus === 'approved') || currentUser?.role === 'admin';
  const isTeacherPending = currentUser?.role === 'teacher' && (currentUser.teacherVerificationStatus === 'pending_approval' || currentUser.teacherVerificationStatus === 'unverified' || !currentUser.teacherVerificationStatus);
  const isTeacherRejected = currentUser?.role === 'teacher' && currentUser.teacherVerificationStatus === 'rejected';
  const isStudentVisiting = currentUser?.role === 'student';

  const myApplication = currentUser 
    ? teacherApplications.find(a => a.userId === currentUser.id || a.id === currentUser.teacherApplicationId)
    : undefined;

  // Q&A reply input state
  const [replyTextByThread, setReplyTextByThread] = useState<Record<string, string>>({});
  const [discussionFilter, setDiscussionFilter] = useState<'all' | 'unanswered'>('all');

  // Announcement state
  const [selectedCourseForAnn, setSelectedCourseForAnn] = useState<string>(courses[0]?.id || '');
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annSuccessMsg, setAnnSuccessMsg] = useState(false);

  // Manual Certificate Issue State
  const [studentToIssueId, setStudentToIssueId] = useState<string>(allUsers.find(u => u.role === 'student')?.id || '');
  const [courseToIssueId, setCourseToIssueId] = useState<string>(courses[0]?.id || '');
  const [honorsToIssue, setHonorsToIssue] = useState<any>('Passed with Honors');
  const [issueSuccessMsg, setIssueSuccessMsg] = useState(false);
  const [inspectingCert, setInspectingCert] = useState<{ course: Course; enrollment: EnrollmentProgress } | null>(null);

  // Filter courses created by or assigned to teacher (or show all in teacher mode for test convenience)
  const teacherCourses = courses;

  // Compute teacher KPIs
  const totalStudents = teacherCourses.reduce((sum, c) => sum + c.studentCount, 0);
  const totalRevenue = teacherCourses.reduce((sum, c) => sum + (c.studentCount * c.price), 0);
  const avgRating = teacherCourses.length > 0 
    ? (teacherCourses.reduce((sum, c) => sum + c.rating, 0) / teacherCourses.length).toFixed(2) 
    : '5.00';
  const totalHours = teacherCourses.reduce((sum, c) => sum + c.durationHours, 0).toFixed(1);

  // Gather all certificates issued across teacher's courses
  const issuedCertificatesList: { studentName: string; userEmail: string; courseTitle: string; courseId: string; userId: string; cert: any; enrollment: EnrollmentProgress }[] = [];
  Object.entries(enrollments).forEach(([key, enrollment]) => {
    if (enrollment.certificateIssued) {
      const course = courses.find(c => c.id === enrollment.courseId);
      const student = allUsers.find(u => u.id === enrollment.userId);
      if (course && student) {
        issuedCertificatesList.push({
          studentName: enrollment.certificateIssued.recipientName || student.name,
          userEmail: student.email,
          courseTitle: course.title,
          courseId: course.id,
          userId: student.id,
          cert: enrollment.certificateIssued,
          enrollment
        });
      }
    }
  });

  const studentsList = allUsers.filter(u => u.role === 'student');

  const handleManualIssueCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTeacherApproved) {
      setPublishAlert('Accredited Faculty Required: Official certificates of completion can only be issued by instructors whose accreditation has been formally approved by platform management.');
      return;
    }
    if (!studentToIssueId || !courseToIssueId) return;

    const student = allUsers.find(u => u.id === studentToIssueId);
    if (!student) return;

    issueCertificate(courseToIssueId, student.name, honorsToIssue, studentToIssueId);
    setIssueSuccessMsg(true);
    setTimeout(() => setIssueSuccessMsg(false), 3000);
  };

  // Filter discussions
  const filteredDiscussions = discussions.filter(d => {
    if (discussionFilter === 'unanswered') {
      return !d.isAnswered;
    }
    return true;
  });

  const handleSendReply = (threadId: string) => {
    const text = replyTextByThread[threadId];
    if (!text || !text.trim()) return;
    addDiscussionReply(threadId, text.trim());
    setReplyTextByThread(prev => ({ ...prev, [threadId]: '' }));
  };

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annBody.trim() || !selectedCourseForAnn) return;

    createAnnouncement(selectedCourseForAnn, annTitle.trim(), annBody.trim());
    setAnnTitle('');
    setAnnBody('');
    setAnnSuccessMsg(true);
    setTimeout(() => setAnnSuccessMsg(false), 3000);
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200/80 text-sky-600 flex items-center justify-center mx-auto shadow-sm">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-slate-900">
            Instructor Studio Access
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Please log in with your educator credentials to manage curriculum, schedule Google Meet office hours, and upload video studio lessons.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onOpenSignIn && (
            <button
              onClick={onOpenSignIn}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
            >
              <Lock className="w-4 h-4" />
              <span>Log In with Educator Account</span>
            </button>
          )}
          {onOpenTeacherApplication && (
            <button
              onClick={onOpenTeacherApplication}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Apply as Instructor (70% Split / 30% System Retention)</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dynamic Feedback or Restriction Alert */}
      {publishAlert && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-xs flex items-start justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Management Verification Required</span>
              <p className="text-amber-800 mt-0.5 leading-relaxed">{publishAlert}</p>
            </div>
          </div>
          <button onClick={() => setPublishAlert(null)} className="text-amber-600 hover:text-amber-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Case 1: Student Visiting Teacher Studio */}
      {isStudentVisiting && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 md:p-7 shadow-sm border border-indigo-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Learner Perspective
              </span>
              <span className="text-xs text-indigo-300">You are browsing as a Student ({currentUser.name})</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold">Interested in Teaching at OWLY Academy?</h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Join our accredited instructor network to build production-grade masterclasses. All instructor applications undergo rigorous credential verification and <strong>approval solely by platform management</strong>.
            </p>
          </div>

          <button
            onClick={() => onOpenTeacherApplication?.()}
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-sm shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>Apply as Instructor</span>
          </button>
        </div>
      )}

      {/* Case 2: Teacher Application Declined */}
      {isTeacherRejected && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-rose-900">
                Instructor Accreditation Declined by Management
              </h3>
              <p className="text-xs text-rose-800 leading-relaxed">
                Management reviewed your instructor submission. Review feedback:{' '}
                <span className="font-semibold">{myApplication?.reviewNotes || 'Verification criteria could not be confirmed.'}</span>
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onOpenTeacherApplication?.()}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Submit Updated Credentials for Re-evaluation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case 3: Teacher Account Pending Management Approval - ALL FUNCTIONALITIES STRICTLY RESTRICTED */}
      {currentUser.role === 'teacher' && !isTeacherApproved && !isTeacherRejected && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Locked Status Hero Card */}
          <div className="bg-white border-2 border-amber-300/90 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 ring-4 ring-amber-50">
                  <Lock className="w-7 h-7 text-amber-700" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                      All Teacher Functionalities Locked
                    </h2>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      Pending Administrative Approval
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 max-w-3xl leading-relaxed">
                    Your instructor accreditation application is currently queued for administrative verification by <strong>Platform Management (Platform Dean)</strong>. In accordance with university academic standards and platform governance, <strong>all educator privileges—including course creation, marketplace publishing, video lesson studio, Google Meet office hours, fee management, and certificate issuance—remain strictly restricted</strong> until an administrator formally approves your application.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start">
                <button
                  onClick={async () => {
                    setIsRefreshingStatus(true);
                    try {
                      await forceCloudSync();
                      setStatusFeedback('Refreshed from Cloud Firestore. Status: Pending Management Review.');
                      setTimeout(() => setStatusFeedback(null), 4000);
                    } finally {
                      setIsRefreshingStatus(false);
                    }
                  }}
                  disabled={isRefreshingStatus}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
                  <span>{isRefreshingStatus ? 'Checking...' : 'Check Live Status'}</span>
                </button>

                {onBrowseCatalog && (
                  <button
                    onClick={onBrowseCatalog}
                    className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Browse Catalog as Learner</span>
                  </button>
                )}
              </div>
            </div>

            {statusFeedback && (
              <div className="bg-sky-50 border border-sky-200 text-sky-800 rounded-xl p-3 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{statusFeedback}</span>
              </div>
            )}

            {/* Verification Pipeline Tracker */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 md:p-5">
              <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider block mb-3">
                Management Accreditation Pipeline
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-amber-200/70 text-xs flex items-center gap-3 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">1. Application Submitted</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">Dossier & syllabus queued in database</div>
                  </div>
                </div>

                <div className="bg-amber-100/80 p-3.5 rounded-xl border border-amber-300 text-xs flex items-center gap-3 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-amber-950">2. Administrative Review</div>
                    <div className="text-[10px] text-amber-800 font-mono mt-0.5">Evaluation by Platform Dean</div>
                  </div>
                </div>

                <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200 text-xs flex items-center gap-3 opacity-60">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-700">3. Faculty Activation</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">Full studio & marketplace unlock</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Application Dossier */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              <div 
                onClick={() => setShowAppDetails(!showAppDetails)}
                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-xs text-slate-800">
                    Submitted Faculty Dossier Details
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ({myApplication?.id || currentUser.teacherApplicationId || 'Registered'})
                  </span>
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  {showAppDetails ? 'Collapse Details' : 'View Full Dossier'}
                </button>
              </div>

              {showAppDetails && (
                <div className="p-4 pt-1 border-t border-slate-200 text-xs space-y-3 bg-white animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">APPLICANT</span>
                      <span className="text-slate-800 font-medium">{currentUser.name} ({currentUser.email})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">ACADEMIC TITLE</span>
                      <span className="text-slate-800 font-medium">{currentUser.title || myApplication?.academicTitle || 'Faculty Candidate'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">INSTITUTION / COMPANY</span>
                      <span className="text-slate-800 font-medium">{currentUser.institutionOrCompany || myApplication?.institutionOrCompany || 'Independent Researcher'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">PRIMARY DOMAIN</span>
                      <span className="text-slate-800 font-medium">{myApplication?.primaryDomain || 'Computer Science & AI'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">SUBMISSION DATE</span>
                      <span className="text-slate-800 font-mono">{myApplication ? new Date(myApplication.submittedAt).toLocaleDateString() : currentUser.joinedDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">CURRENT STATUS</span>
                      <span className="text-amber-700 font-bold font-mono">Pending Admin Approval</span>
                    </div>
                  </div>

                  {myApplication?.proposedCourseTopic && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-400 text-[10px] block font-semibold">PROPOSED MASTERCLASS</span>
                      <span className="text-slate-800 font-medium">{myApplication.proposedCourseTopic}</span>
                    </div>
                  )}

                  {myApplication?.credentialsSummary && (
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">CREDENTIALS DOSSIER</span>
                      <p className="text-slate-600 leading-relaxed text-xs">{myApplication.credentialsSummary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Applicant Review Status Banner */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-xs text-amber-950 flex items-center gap-2">
                  <span>Administrative Accreditation Review in Progress</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-200/80 text-amber-900 rounded font-semibold">
                    Password-Protected Account
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/90 leading-relaxed">
                  Your instructor credentials and account password have been securely recorded in the Cloud Firestore database. In compliance with platform governance, all educator tools—including course syllabus drafting, video lectures, Google Meet classrooms, lecture fee management, and certificate issuance—remain completely locked until a Platform Administrator evaluates your dossier and grants official approval in the <strong>Admin Dashboard &gt; Teacher Approvals</strong> portal.
                </p>
              </div>
            </div>

            {approvalToast && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{approvalToast}</span>
              </div>
            )}
          </div>

          {/* Matrix of Restricted Educator Capabilities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Restricted Capabilities (Locked Until Management Grants Approval)</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                8 Systems Protected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900">Course Creation Studio</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Drafting new syllabus modules, lesson creation, and course uploads are disabled until accredited.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900">Catalog Marketplace Publishing</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Publishing masterclasses to the public catalog and enrolling paying learners is locked.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900">AI Video Studio & Storage</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Lecture screen recording, AI video transcoding, and cloud media uploads are restricted.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Video className="w-4 h-4 text-rose-500" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900">Google Meet Classrooms</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Hosting live office hours and generating verified Google Meet conference links is restricted.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900">Lecture Fees & Payouts</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Custom lecture fee pricing, 70% net revenue split, and balance payout withdrawals are disabled.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900">Student Q&A & Forum Replies</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Replying to student questions as verified faculty or endorsing student answers is locked.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900">Cryptographic Certificates</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Generating verified SHA-256 completion credentials for students is strictly locked.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900">Public Faculty Directory</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your profile is hidden from learner search and 1-on-1 office hour bookings until accredited.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OPERATIONAL TEACHER STUDIO (ONLY UNLOCKED ONCE FORMALLY APPROVED BY ADMIN) */}
      {isTeacherApproved && (
        <>
          {/* Studio Banner & Instructor Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {currentUser.avatarText}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono text-xs uppercase tracking-wider text-indigo-700 font-semibold">
                    Instructor Studio
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">{currentUser.title}</span>

                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>Verified Faculty · Approved by Management</span>
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                  Welcome back, {currentUser.name}
                </h2>
                <p className="text-xs text-slate-600 max-w-2xl mt-1 leading-relaxed">
                  Manage your course curriculum, upload new video lectures, broadcast updates, and interact directly with enrolled learners.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('video-studio')}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-sm"
              >
                <Video className="w-4 h-4" />
                <span>AI Video Studio & Recording</span>
              </button>

              <button
                onClick={() => setIsCreatingCourse(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Course</span>
              </button>
            </div>
          </div>

      {/* KPI Metric Strips (Tabular figures, single elevation) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Learners Enrolled
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalStudents.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all published courses</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Gross Course Revenue
          </span>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            ${totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Platform royalties & sales</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Average Instructor Rating
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums flex items-center gap-1.5">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            <span>{avgRating}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Student review score average</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Curriculum Content
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalHours}h
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{teacherCourses.length} active syllabus courses</p>
        </div>
      </div>

      {/* Tabs Navigation (Functional buttons with clean state) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'courses'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Courses & Content ({teacherCourses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Revenue & Enrollment Trends</span>
        </button>

        <button
          onClick={() => setActiveTab('video-studio')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'video-studio'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Video className="w-4 h-4 text-indigo-600" />
          <span>AI Video Studio & Hosting ({hostedVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('meet')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'meet'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Video className="w-4 h-4 text-rose-500" />
          <span>Google Meet Classrooms ({googleMeetSessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lecture-fees')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'lecture-fees'
              ? 'bg-white border-t border-x border-slate-200 text-emerald-600 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Lecture Fees & Monetization</span>
        </button>

        <button
          onClick={() => setActiveTab('discussions')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'discussions'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Learner Q&A ({discussions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Announcements ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'certificates'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Accreditations & Certificates ({issuedCertificatesList.length})</span>
        </button>
      </div>

      {/* TAB 1: Courses Management */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* Recharts Monthly Revenue Growth & Course Enrollment Trends */}
          <TeacherAnalyticsChart
            courses={teacherCourses}
            transactions={transactions}
            sessions={googleMeetSessions}
            educatorBilling={educatorBilling}
            onNavigateToLectureFees={() => setActiveTab('lecture-fees')}
            onSelectCourse={onSelectCourse}
          />

          <div className="flex items-center justify-between pt-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Course Syllabi</h3>
              <p className="text-xs text-slate-500">Manage curriculum modules, publication state, and lesson content</p>
            </div>
            <button
              onClick={() => setIsCreatingCourse(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherCourses.map(course => (
              <div key={course.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all">
                <div>
                  <CourseVisual
                    category={course.category}
                    theme={course.theme}
                    title={course.title}
                    className="h-36"
                  />

                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>{course.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{course.studentCount} Students</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-800">${course.price}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2 leading-snug">
                      {course.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.durationHours} hours</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.modules.length} modules</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.modules.reduce((s, m) => s + m.lessons.length, 0)} lessons</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (!isTeacherApproved) {
                          setPublishAlert('Publishing Restricted: Course publishing requires formal management accreditation. Your instructor application is currently pending review and approval solely by platform management.');
                          return;
                        }
                        toggleCoursePublish(course.id);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded capitalize ${
                        course.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                      title={!isTeacherApproved ? 'Requires Management Approval' : 'Toggle publication status'}
                    >
                      {course.status}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Content</span>
                    </button>

                    <button
                      onClick={() => onSelectCourse(course)}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: AI Video Studio & Hosting */}
      {activeTab === 'video-studio' && (
        <VideoStudio onBackToCourses={() => setActiveTab('courses')} />
      )}

      {/* TAB: Google Meet Virtual Classrooms & Office Hours */}
      {activeTab === 'meet' && (
        <GoogleMeetEducatorView courses={teacherCourses} />
      )}

      {/* TAB 2: Learner Interactions & Q&A Discussion Forum */}
      {activeTab === 'discussions' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enrolled Learner Inquiries</h3>
              <p className="text-xs text-slate-500">
                Answer technical questions, verify solutions, and endorse outstanding student insights.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setDiscussionFilter('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  discussionFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Threads ({discussions.length})
              </button>
              <button
                onClick={() => setDiscussionFilter('unanswered')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  discussionFilter === 'unanswered'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Needs Answer ({discussions.filter(d => !d.isAnswered).length})
              </button>
            </div>
          </div>

          {/* Thread Cards */}
          <div className="space-y-4">
            {filteredDiscussions.map(thread => {
              const course = courses.find(c => c.id === thread.courseId);

              return (
                <div key={thread.id} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-indigo-700">{course?.title}</span>
                        {thread.lessonTitle && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{thread.lessonTitle}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>Asked by <strong className="text-slate-800">{thread.authorName}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>{thread.createdAt}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {thread.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => togglePinDiscussion(thread.id)}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          thread.isPinned
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                        title="Pin this question"
                      >
                        <Pin className="w-4 h-4" />
                      </button>

                      {thread.isAnswered ? (
                        <span className="px-2.5 py-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 rounded border border-emerald-200 font-semibold">
                          Answered
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[11px] font-mono text-amber-700 bg-amber-50 rounded border border-amber-200 font-semibold">
                          Awaiting Answer
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed border border-slate-100">
                    {thread.content}
                  </p>

                  {/* Replies List */}
                  {thread.replies.length > 0 && (
                    <div className="pl-4 border-l-2 border-slate-200 space-y-3">
                      {thread.replies.map(reply => (
                        <div key={reply.id} className="text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-500">
                              <span className="font-bold text-slate-800">{reply.authorName}</span>
                              <span className="text-[11px] capitalize">({reply.authorRole})</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-[11px]">{reply.createdAt}</span>
                            </div>

                            <button
                              onClick={() => toggleEndorseReply(thread.id, reply.id)}
                              className={`text-[11px] px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                                reply.isInstructorEndorsed
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold'
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>{reply.isInstructorEndorsed ? 'Instructor Endorsed' : 'Endorse Answer'}</span>
                            </button>
                          </div>

                          <p className="text-slate-800 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Instructor Reply Form */}
                  <div className="pt-2 flex gap-3">
                    <input
                      type="text"
                      value={replyTextByThread[thread.id] || ''}
                      onChange={(e) => setReplyTextByThread(prev => ({ ...prev, [thread.id]: e.target.value }))}
                      placeholder={`Reply as Instructor (${currentUser.name})...`}
                      className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleSendReply(thread.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Official Reply</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Broadcast Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {/* Broadcast Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-4 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900">Broadcast Student Announcement</h3>
              <p className="text-xs text-slate-500">
                Send an immediate notification and bulletin board update to all enrolled students for a specific course.
              </p>
            </div>

            {annSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Announcement broadcasted successfully to all enrolled learners!</span>
              </div>
            )}

            <form onSubmit={handleBroadcastAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Target Course
                </label>
                <select
                  value={selectedCourseForAnn}
                  onChange={(e) => setSelectedCourseForAnn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.studentCount} enrolled students)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Live Q&A Session this Thursday at 18:00 UTC"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Announcement Body
                </label>
                <textarea
                  value={annBody}
                  onChange={(e) => setAnnBody(e.target.value)}
                  rows={4}
                  placeholder="Details regarding upcoming office hours, new bonus resources, or schedule updates..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!annTitle.trim() || !annBody.trim()}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast to Students</span>
                </button>
              </div>
            </form>
          </div>

          {/* Past Announcements */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Broadcast History</h3>
            <div className="space-y-3">
              {announcements.map(ann => (
                <div key={ann.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-indigo-700">{ann.courseTitle}</span>
                    <span className="font-mono">{ann.createdAt}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{ann.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Accreditations & Certificates Management */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          {/* Issue Certificate Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Issue Official Course Certificate</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Grant an accredited Certificate of Academic Mastery directly to any enrolled student.
                </p>
              </div>

              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-mono font-bold">
                Instructor Authority
              </span>
            </div>

            {issueSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Certificate issued successfully! The student can now view, print, and share their verified diploma.</span>
              </div>
            )}

            <form onSubmit={handleManualIssueCertificate} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Select Course
                </label>
                <select
                  value={courseToIssueId}
                  onChange={(e) => setCourseToIssueId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Recipient Student
                </label>
                <select
                  value={studentToIssueId}
                  onChange={(e) => setStudentToIssueId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                >
                  {studentsList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Honors Standing
                </label>
                <select
                  value={honorsToIssue}
                  onChange={(e) => setHonorsToIssue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                >
                  <option value="Standard Mastery">Standard Mastery</option>
                  <option value="Passed with Honors">Passed with Honors</option>
                  <option value="Highest Distinction (Top 5%)">Highest Distinction (Top 5%)</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Generate & Issue Certificate</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Issued Student Certificates */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                Issued Course Certificates Registry ({issuedCertificatesList.length})
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                Verified Faculty Signatures Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-3 px-4 text-left">Student Recipient</th>
                    <th className="py-3 px-4 text-left">Course Title</th>
                    <th className="py-3 px-4 text-left">Credential ID</th>
                    <th className="py-3 px-4 text-center">Honors</th>
                    <th className="py-3 px-4 text-center">Issue Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {issuedCertificatesList.length > 0 ? (
                    issuedCertificatesList.map((item, idx) => {
                      const course = courses.find(c => c.id === item.courseId);

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{item.studentName}</span>
                            <span className="text-slate-500 text-[11px]">{item.userEmail}</span>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs truncate text-slate-700">
                            {item.courseTitle}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 text-[11px]">
                            {item.cert.credentialId}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-50 text-amber-800 border border-amber-200">
                              {item.cert.honors || 'Standard'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                            {item.cert.issueDate}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {course && (
                                <button
                                  onClick={() => setInspectingCert({ course, enrollment: item.enrollment })}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium transition-colors"
                                >
                                  View
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  if (confirm(`Revoke certificate for ${item.studentName}?`)) {
                                    revokeCertificate(item.courseId, item.userId);
                                  }
                                }}
                                className="px-2.5 py-1 text-rose-700 hover:bg-rose-50 rounded text-xs font-medium transition-colors"
                              >
                                Revoke
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No certificates issued yet. Issue your first certificate using the form above!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Dedicated Revenue & Enrollment Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <TeacherAnalyticsChart
            courses={teacherCourses}
            transactions={transactions}
            sessions={googleMeetSessions}
            educatorBilling={educatorBilling}
            onNavigateToLectureFees={() => setActiveTab('lecture-fees')}
            onSelectCourse={onSelectCourse}
          />

          {/* Detailed Course Monetization & Unit Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Course Monetization & Enrollment Performance Matrix
                </h4>
                <p className="text-xs text-slate-500">
                  Granular unit economics per syllabus showing gross volume, 70% net faculty earnings, and 30% system retention.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('lecture-fees')}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lecture Fee Settings</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 px-3">Course Title</th>
                    <th className="pb-3 px-3">Unit Price</th>
                    <th className="pb-3 px-3">Enrolled Learners</th>
                    <th className="pb-3 px-3">Gross Sales</th>
                    <th className="pb-3 px-3 text-emerald-700">70% Net Take-Home</th>
                    <th className="pb-3 px-3 text-amber-700">30% Platform Retention</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teacherCourses.map(course => {
                    const gross = course.studentCount * course.price;
                    const net = Math.round(gross * 0.70);
                    const systemFee = gross - net;

                    return (
                      <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-900">{course.title}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{course.category} · {course.level}</div>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-semibold text-slate-800">
                          ${course.price}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-cyan-700">
                          {course.studentCount} students
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-700">
                          ${gross.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-emerald-600">
                          +${net.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-amber-700">
                          -${systemFee.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => setEditingCourse(course)}
                            className="px-2.5 py-1 text-indigo-600 hover:bg-indigo-50 font-semibold rounded text-xs transition-colors"
                          >
                            Edit Pricing
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Lecture Fees & Monetization */}
      {activeTab === 'lecture-fees' && (
        <EducatorLectureFeeManager
          courses={teacherCourses}
          onOpenScheduleMeet={() => setActiveTab('meet')}
          onEditCourse={(course) => setEditingCourse(course)}
        />
      )}

      {/* Inspecting Certificate Modal */}
      {inspectingCert && (
        <CertificateModal
          course={inspectingCert.course}
          enrollment={inspectingCert.enrollment}
          onClose={() => setInspectingCert(null)}
        />
      )}

      {/* Course Editor Modal */}
      {(isCreatingCourse || editingCourse) && (
        <CourseEditorModal
          courseToEdit={editingCourse}
          onClose={() => {
            setIsCreatingCourse(false);
            setEditingCourse(null);
          }}
          onSaved={(course) => {
            setIsCreatingCourse(false);
            setEditingCourse(null);
          }}
        />
      )}
        </>
      )}
    </div>
  );
};
