import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { Course, EnrollmentProgress } from '../types/lms';
import { CourseCard } from './CourseCard';
import { CertificateModal } from './CertificateModal';
import { CertificateVerifierModal } from './CertificateVerifierModal';
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Sparkles,
  PlayCircle,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  Search,
  ExternalLink,
  Linkedin,
  Video,
  Radio,
  TrendingUp,
  LogIn,
  UserPlus
} from 'lucide-react';
import { LearningAnalyticsCharts } from './LearningAnalyticsCharts';

interface MyLearningProps {
  onSelectCourse: (course: Course) => void;
  onBrowseCatalog: () => void;
  onOpenAuth?: (mode: 'signin' | 'student_signup') => void;
}

export const MyLearning: React.FC<MyLearningProps> = ({ onSelectCourse, onBrowseCatalog, onOpenAuth }) => {
  const { currentUser, setCurrentUserById, courses, enrollments, issueCertificate, googleMeetSessions } = useLms();

  const [activeSubTab, setActiveSubTab] = useState<'courses' | 'analytics' | 'certificates' | 'meet'>('courses');
  const [selectedCourseForCert, setSelectedCourseForCert] = useState<Course | null>(null);
  const [showVerifierModal, setShowVerifierModal] = useState(false);
  const [verifierTargetId, setVerifierTargetId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // If student is not logged in, require logging in first
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-slate-900">
            Student Login Required
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Automatic student login is disabled on startup. You must log in to your student account first to access your enrolled courses, area chart progress analytics, Google Meet classrooms, and certificates.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onOpenAuth ? onOpenAuth('signin') : setCurrentUserById('user-student-1')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In to Student Account</span>
          </button>
          {onOpenAuth && (
            <button
              onClick={() => onOpenAuth('student_signup')}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>Create Student Account</span>
            </button>
          )}
          <button
            onClick={() => setCurrentUserById('user-student-1')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-xl text-xs font-medium transition-colors"
          >
            <span>One-Click Demo Student (Alex Mercer)</span>
          </button>
        </div>

        <div className="pt-4">
          <button
            onClick={onBrowseCatalog}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>Return to Course Catalog</span>
          </button>
        </div>
      </div>
    );
  }

  // Find enrolled courses for current user
  const enrolledCourses = courses.filter(c => {
    const key = `${currentUser.id}_${c.id}`;
    return Boolean(enrollments[key]);
  });

  // Calculate overall statistics
  let totalLessonsAcrossEnrolled = 0;
  let totalLessonsCompleted = 0;
  const earnedCertificates: { course: Course; enrollment: EnrollmentProgress }[] = [];
  const pendingCertificates: { course: Course; enrollment: EnrollmentProgress; isComplete: boolean; pct: number }[] = [];

  enrolledCourses.forEach(c => {
    const key = `${currentUser.id}_${c.id}`;
    const enr = enrollments[key];
    const totalC = c.modules.reduce((s, m) => s + m.lessons.length, 0);
    const completedCount = enr?.completedLessonIds.length || 0;
    const pct = totalC > 0 ? Math.round((completedCount / totalC) * 100) : 0;
    
    totalLessonsAcrossEnrolled += totalC;
    totalLessonsCompleted += completedCount;

    if (enr?.certificateIssued) {
      earnedCertificates.push({ course: c, enrollment: enr });
    } else if (enr) {
      pendingCertificates.push({ 
        course: c, 
        enrollment: enr, 
        isComplete: pct >= 100,
        pct
      });
    }
  });

  const overallPercent = totalLessonsAcrossEnrolled > 0
    ? Math.round((totalLessonsCompleted / totalLessonsAcrossEnrolled) * 100)
    : 0;

  const handleClaimCertificate = (courseId: string) => {
    issueCertificate(courseId, currentUser.name, 'Passed with Honors');
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourseForCert(course);
    }
  };

  const handleCopyCredential = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentCertEnrollment = selectedCourseForCert 
    ? enrollments[`${currentUser.id}_${selectedCourseForCert.id}`]
    : null;

  // Filter Google Meet sessions for courses the student is enrolled in
  const enrolledCourseIds = new Set(enrolledCourses.map(c => c.id));
  const enrolledMeetSessions = googleMeetSessions.filter(s => enrolledCourseIds.has(s.courseId));
  const activeLiveSession = enrolledMeetSessions.find(s => s.status === 'live');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Live Now Flash Alert Banner */}
      {activeLiveSession && (
        <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-rose-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center font-bold shadow-lg shadow-rose-600/30 shrink-0">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-400/30">
                  Live Video Classroom Now
                </span>
                <span className="text-xs text-slate-300">·</span>
                <span className="text-xs text-slate-300">{activeLiveSession.instructorName}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {activeLiveSession.title}
              </h3>
              <p className="text-xs text-slate-300">
                Course: {activeLiveSession.courseTitle}
              </p>
            </div>
          </div>

          <a
            href={activeLiveSession.meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all whitespace-nowrap"
          >
            <Video className="w-4 h-4" />
            <span>Join Google Meet Now</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Student Profile Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {currentUser.avatarText}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase tracking-wider text-indigo-700 font-semibold">
                Learner Workspace
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">{currentUser.title}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              Welcome back, {currentUser.name}
            </h2>
            <p className="text-xs text-slate-600 max-w-xl mt-1 leading-relaxed">
              Track your engineering curriculum milestones, complete video lectures, and earn verifiable course certificates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowVerifierModal(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verify Any Credential</span>
          </button>

          <button
            onClick={onBrowseCatalog}
            className="px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Explore Courses</span>
          </button>
        </div>
      </div>

      {/* Progress Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Enrolled Masterclasses
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {enrolledCourses.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active curriculum licenses</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Lessons Completed
          </span>
          <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums">
            {totalLessonsCompleted} / {totalLessonsAcrossEnrolled}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Video lectures & quizzes passed</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Mastery Percentage
          </span>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            {overallPercent}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all active cohorts</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Verified Certificates
          </span>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums flex items-center gap-1.5">
            <Award className="w-5 h-5 text-amber-500" />
            <span>{earnedCertificates.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Academic credentials earned</p>
        </div>
      </div>

      {/* Recharts Analytics: Student Course Completion Percentages & Study Time Trends */}
      {enrolledCourses.length > 0 && (
        <LearningAnalyticsCharts
          enrolledCourses={enrolledCourses}
          enrollments={enrollments}
          currentUserId={currentUser.id}
          onSelectCourse={onSelectCourse}
        />
      )}

      {/* Navigation Sub-Tabs: Courses vs Analytics vs Certificates vs Meet */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('courses')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'courses'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Enrolled Courses ({enrolledCourses.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'analytics'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>Study Habits & Pacing</span>
        </button>

        <button
          onClick={() => setActiveSubTab('certificates')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'certificates'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Certificates & Accreditations ({earnedCertificates.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('meet')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'meet'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Video className="w-4 h-4 text-rose-500" />
          <span>Live Google Meet Classes ({enrolledMeetSessions.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: Enrolled Courses */}
      {activeSubTab === 'courses' && (
        <div>
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => {
                const enr = enrollments[`${currentUser.id}_${course.id}`];
                const hasCert = Boolean(enr?.certificateIssued);

                return (
                  <div key={course.id} className="relative group">
                    <CourseCard
                      course={course}
                      onSelect={onSelectCourse}
                    />

                    {/* Quick Certificate Earned Pill */}
                    {hasCert && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCourseForCert(course);
                        }}
                        className="absolute top-3 left-3 z-20 px-2.5 py-1 bg-amber-500/90 hover:bg-amber-500 text-slate-950 rounded-md text-[11px] font-bold flex items-center gap-1 shadow-md backdrop-blur-sm transition-all"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Certificate Earned</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
              <GraduationCap className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">
                No Courses Enrolled Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Discover industry-grade curriculums in Distributed Systems, Generative AI Engineering, Quantitative Trading, and Design Systems.
              </p>
              <button
                onClick={onBrowseCatalog}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-sm"
              >
                <span>Explore Course Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: Analytics, Study Habits & Pacing */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <span>Curriculum Milestone Roadmap & Study Habits</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed breakdown of study hours, quiz accuracy, and projected certificate completion dates.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-mono font-bold rounded-lg border border-emerald-200">
                  Target Pace: 15h / week (On Track)
                </span>
              </div>
            </div>

            {/* Course by Course Milestone Progress */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Course Milestone Breakdown
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrolledCourses.map(course => {
                  const enr = enrollments[`${currentUser.id}_${course.id}`];
                  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
                  const completedLessons = enr?.completedLessonIds.length || 0;
                  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                  const quizCount = Object.keys(enr?.quizScores || {}).length;
                  const avgQuizScore = quizCount > 0
                    ? Math.round(Object.values(enr?.quizScores || {}).reduce((a, b) => a + b, 0) / quizCount)
                    : null;

                  return (
                    <div 
                      key={course.id}
                      className="border border-slate-200 rounded-xl p-5 space-y-4 hover:border-indigo-300 transition-colors bg-slate-50/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-indigo-600">
                            {course.category} · {course.level}
                          </span>
                          <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                            {course.title}
                          </h5>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                          {pct}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${pct}%`,
                              backgroundColor: pct === 100 ? '#10b981' : course.theme?.accentColor || '#6366f1' 
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-mono">
                          <span>{completedLessons} of {totalLessons} lessons done</span>
                          <span>{totalLessons - completedLessons} remaining</span>
                        </div>
                      </div>

                      {/* Stats pills */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-center">
                        <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                          <span className="text-[10px] text-slate-400 block uppercase">Modules</span>
                          <span className="text-xs font-bold text-slate-800 font-mono">{course.modules.length}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                          <span className="text-[10px] text-slate-400 block uppercase">Quiz Avg</span>
                          <span className="text-xs font-bold text-emerald-600 font-mono">
                            {avgQuizScore !== null ? `${avgQuizScore}%` : 'N/A'}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                          <span className="text-[10px] text-slate-400 block uppercase">Syllabus</span>
                          <span className="text-xs font-bold text-slate-800 font-mono">{course.durationHours}h</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectCourse(course)}
                        className="w-full py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Continue Lessons</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Study Habit Insights Strip */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 border border-indigo-900/50 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  AI Study Optimizer & Habit Telemetry
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Peak Cognitive Time</span>
                  <p className="font-bold text-slate-200 mt-0.5">8:30 AM – 11:00 AM</p>
                  <p className="text-[11px] text-slate-400 mt-1">Quiz retention is 24% higher during morning focus blocks.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Current Velocity</span>
                  <p className="font-bold text-emerald-400 mt-0.5">3.4 Lessons / Day</p>
                  <p className="text-[11px] text-slate-400 mt-1">At this pace, expected completion of all enrolled modules is in 16 days.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Next Milestone Goal</span>
                  <p className="font-bold text-amber-300 mt-0.5">Raft Consensus Lab 2</p>
                  <p className="text-[11px] text-slate-400 mt-1">Unlock verifiable certificate in Distributed Systems upon completion.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Certificates & Accreditations Gallery */}
      {activeSubTab === 'certificates' && (
        <div className="space-y-8">
          {/* Section 1: Earned Certificates Gallery */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Earned Academic Credentials
                </h3>
                <p className="text-xs text-slate-500">
                  Cryptographically verifiable diplomas issued by Aetheria Institute of Technology.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                {earnedCertificates.length} Active Credentials
              </span>
            </div>

            {earnedCertificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {earnedCertificates.map(({ course, enrollment }) => {
                  const cert = enrollment.certificateIssued!;

                  return (
                    <div 
                      key={course.id}
                      className="bg-white border-2 border-slate-200 hover:border-amber-400/80 rounded-2xl p-6 space-y-5 shadow-sm transition-all relative overflow-hidden"
                    >
                      {/* Gold Top Accent Line */}
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                            <Award className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded">
                              {cert.honors || 'Verified Mastery'}
                            </span>
                            <h4 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                              {course.title}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Issued to <strong className="text-slate-800">{cert.recipientName}</strong> · {cert.issueDate}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Credential ID and Hash */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs font-mono flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                            Credential ID
                          </span>
                          <span className="font-bold text-slate-800 text-[11px]">{cert.credentialId}</span>
                        </div>

                        <button
                          onClick={() => handleCopyCredential(cert.credentialId)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-sans font-medium text-slate-700 flex items-center gap-1 transition-colors"
                        >
                          {copiedId === cert.credentialId ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy ID</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between pt-1 gap-2">
                        <button
                          onClick={() => {
                            setVerifierTargetId(cert.credentialId);
                            setShowVerifierModal(true);
                          }}
                          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verify Authenticity</span>
                        </button>

                        <button
                          onClick={() => setSelectedCourseForCert(course)}
                          className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View & Print Certificate</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-2">
                <Award className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Certificates Earned Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Complete lessons and module quizzes in your enrolled courses below to generate your verifiable certificate!
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Pending / In-Progress Course Certificates (Claimable!) */}
          {pendingCertificates.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Claimable & In-Progress Course Certificates
                </h3>
                <p className="text-xs text-slate-500">
                  Ready to claim upon completing curriculum requirements, or claim immediate accreditation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingCertificates.map(({ course, enrollment, isComplete, pct }) => (
                  <div key={course.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          {course.category} · {course.level}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
                          {course.title}
                        </h4>
                      </div>

                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {pct}% Done
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        {enrollment.completedLessonIds.length} of {course.modules.reduce((s, m) => s + m.lessons.length, 0)} lessons completed
                      </span>
                    </div>

                    {/* Claim Certificate Action Button */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => onSelectCourse(course)}
                        className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Continue Lessons</span>
                      </button>

                      <button
                        onClick={() => handleClaimCertificate(course.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm ${
                          isComplete
                            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                            : 'bg-slate-900 hover:bg-indigo-600 text-white'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isComplete ? 'Claim Certificate' : 'Issue Certificate Now'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: Live Google Meet Classes */}
      {activeSubTab === 'meet' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-rose-500" />
                  <span>Google Meet Classrooms & Faculty Office Hours</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Live interactive video lectures, architecture code walkthroughs, and AMA sessions for your enrolled courses
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full self-start sm:self-auto">
                {enrolledMeetSessions.length} Available Sessions
              </span>
            </div>
          </div>

          {enrolledMeetSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {enrolledMeetSessions.map((session) => {
                const isLive = session.status === 'live';
                const isScheduled = session.status === 'scheduled';

                return (
                  <div 
                    key={session.id}
                    className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                      isLive 
                        ? 'border-rose-400 ring-2 ring-rose-500/20' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isLive && (
                            <span className="font-mono text-[10px] uppercase font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-rose-600" />
                              <span>Live Classroom Active</span>
                            </span>
                          )}
                          {isScheduled && (
                            <span className="font-mono text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                              Upcoming
                            </span>
                          )}
                          {session.status === 'completed' && (
                            <span className="font-mono text-[10px] uppercase font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                              Concluded
                            </span>
                          )}
                          <span className="text-[11px] font-medium text-slate-500 capitalize">
                            {session.sessionType.replace('_', ' ')}
                          </span>
                        </div>

                        <span className="text-xs font-mono font-medium text-slate-500">
                          {session.durationMinutes} mins
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {session.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold mt-0.5">
                          <span>{session.courseTitle}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-600 font-normal">Instructor: {session.instructorName}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(session.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                        {session.description && (
                          <p className="text-slate-500 text-[11px] leading-relaxed pt-1">
                            {session.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="font-mono text-[11px] text-slate-500 truncate">
                        Code: {session.meetCode}
                      </span>

                      <a
                        href={session.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
                          isLive 
                            ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>{isLive ? 'Join Live Room' : 'Join Google Meet'}</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Video className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No scheduled Google Meet classes for your courses yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When your course instructors schedule live lecture broadcasts, code reviews, or open office hours, they will appear here with direct Google Meet join links.
              </p>
              <button
                onClick={() => setActiveSubTab('courses')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Back to My Courses
              </button>
            </div>
          )}
        </div>
      )}

      {/* Certificate Inspection Modal */}
      {selectedCourseForCert && currentCertEnrollment && (
        <CertificateModal
          course={selectedCourseForCert}
          enrollment={currentCertEnrollment}
          onClose={() => setSelectedCourseForCert(null)}
        />
      )}

      {/* Credential Verifier Modal */}
      {showVerifierModal && (
        <CertificateVerifierModal
          initialCredentialId={verifierTargetId}
          onClose={() => {
            setShowVerifierModal(false);
            setVerifierTargetId('');
          }}
          onViewCertificate={(courseId) => {
            setShowVerifierModal(false);
            const course = courses.find(c => c.id === courseId);
            if (course) {
              setSelectedCourseForCert(course);
            }
          }}
        />
      )}
    </div>
  );
};
