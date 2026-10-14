import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { Course, User, Transaction, EnrollmentProgress, TeacherApplication } from '../types/lms';
import { CertificateModal } from './CertificateModal';
import { CertificateVerifierModal } from './CertificateVerifierModal';
import { AIBillingDashboard } from './AIBillingDashboard';
import { AdminTelemetryVisual } from './ThemeArtworks';
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  TrendingUp, 
  Search, 
  Filter, 
  RotateCcw, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle,
  Award,
  Clock,
  ArrowUpRight,
  RefreshCw,
  FileText,
  Printer,
  UserCheck,
  Building2,
  ExternalLink,
  X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser,
    allUsers, 
    courses, 
    transactions, 
    enrollments, 
    refundTransaction, 
    updateUserStatus,
    toggleCoursePublish,
    updateCourse,
    revokeCertificate,
    verifyCertificate,
    teacherApplications,
    approveTeacherApplication,
    rejectTeacherApplication,
    setCurrentUserById
  } = useLms();

  const [activeTab, setActiveTab] = useState<'analytics' | 'billing' | 'students' | 'courses' | 'transactions' | 'certificates' | 'teacherApplications'>('analytics');
  const [studentSearch, setStudentSearch] = useState('');
  const [transactionSearch, setTransactionSearch] = useState('');
  const [certificateSearch, setCertificateSearch] = useState('');
  const [selectedStudentForAudit, setSelectedStudentForAudit] = useState<User | null>(null);
  const [inspectingCert, setInspectingCert] = useState<{ course: Course; enrollment: EnrollmentProgress } | null>(null);
  const [showVerifierModal, setShowVerifierModal] = useState(false);

  // Teacher Applications state
  const [applicationFilter, setApplicationFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedAppForReview, setSelectedAppForReview] = useState<TeacherApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotesInput, setReviewNotesInput] = useState('');
  const [managementToast, setManagementToast] = useState<string | null>(null);

  // Compute Platform Metrics
  const nonRefundedTransactions = transactions.filter(t => t.status === 'completed');
  const totalRevenue = nonRefundedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const studentsOnly = allUsers.filter(u => u.role === 'student');
  const totalStudents = studentsOnly.length;
  const publishedCourses = courses.filter(c => c.status === 'published').length;

  // Average completion rate across all enrollments
  const enrollmentList = Object.values(enrollments);
  let totalCompletionPercentages = 0;
  enrollmentList.forEach(e => {
    const course = courses.find(c => c.id === e.courseId);
    const totalLessons = course?.modules.reduce((s, m) => s + m.lessons.length, 0) || 1;
    const pct = Math.min(100, (e.completedLessonIds.length / totalLessons) * 100);
    totalCompletionPercentages += pct;
  });
  const avgCompletionRate = enrollmentList.length > 0 
    ? Math.round(totalCompletionPercentages / enrollmentList.length) 
    : 0;

  // Category revenue breakdown
  const categoryRevenue: Record<string, number> = {};
  nonRefundedTransactions.forEach(t => {
    const course = courses.find(c => c.id === t.courseId);
    const cat = course?.category || 'Engineering';
    categoryRevenue[cat] = (categoryRevenue[cat] || 0) + t.amount;
  });

  // Filter students
  const filteredStudents = studentsOnly.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Filter transactions
  const filteredTransactions = transactions.filter(t =>
    t.invoiceNumber.toLowerCase().includes(transactionSearch.toLowerCase()) ||
    t.userName.toLowerCase().includes(transactionSearch.toLowerCase()) ||
    t.courseTitle.toLowerCase().includes(transactionSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-700 font-semibold">
              Platform Administration Console
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Master Governance</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
            OWLY Academy Platform Governance & Performance
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl mt-1 leading-relaxed">
            Review live transaction ledger, handle student enrollments and refund requests, monitor course quality standards, and observe cross-platform cohort analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Systems Nominal</span>
          </span>
        </div>
      </div>

      {/* Real-time Theme Telemetry Visual */}
      <AdminTelemetryVisual />

      {/* KPI Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Platform Net Volume (GMV)
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ${totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Processed securely via gateway</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Active Student Accounts
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalStudents}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Registered & verified learners</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Published Catalog Courses
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {publishedCourses} / {courses.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Peer-reviewed curriculums</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Average Course Completion
          </span>
          <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums">
            {avgCompletionRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Calculated across all cohorts</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Revenue Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'billing'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>AI Billing & Monetization</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'students'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Management ({studentsOnly.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'courses'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Governance ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'transactions'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Transaction Ledger ({transactions.length})</span>
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
          <span>Certificates Registry</span>
        </button>

        <button
          onClick={() => setActiveTab('teacherApplications')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'teacherApplications'
              ? 'bg-white border-t border-x border-slate-200 text-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 text-indigo-600" />
          <span>Teacher Approvals</span>
          {teacherApplications.filter(a => a.status === 'pending_approval').length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full">
              {teacherApplications.filter(a => a.status === 'pending_approval').length} Pending
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Revenue Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Revenue Distribution */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Revenue by Subject Category
              </h3>
              <p className="text-xs text-slate-500">
                Distribution of student enrollment tuition across engineering domains.
              </p>

              <div className="space-y-4 pt-2">
                {Object.entries(categoryRevenue).map(([cat, amount]) => {
                  const percent = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-800">{cat}</span>
                        <span className="font-mono tabular-nums text-slate-900">
                          ${amount.toFixed(2)} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Course Performance Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Top Performing Course Curriculums
              </h3>
              <p className="text-xs text-slate-500">
                Sorted by student enrollment numbers and satisfaction ratings.
              </p>

              <div className="divide-y divide-slate-100">
                {courses.map(course => (
                  <div key={course.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="max-w-[70%]">
                      <span className="font-bold text-slate-900 block truncate">{course.title}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        ${course.price} · {course.category} · {course.level}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 block tabular-nums">
                        {course.studentCount.toLocaleString()} learners
                      </span>
                      <span className="text-amber-700 font-mono text-[11px]">
                        ★ {course.rating.toFixed(2)} ({course.reviewCount})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: AI Billing & Monetization */}
      {activeTab === 'billing' && (
        <AIBillingDashboard />
      )}

      {/* TAB 2: Student Management */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search students by name or email address..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <span className="text-xs font-mono text-slate-500">
              Showing {filteredStudents.length} of {studentsOnly.length} students
            </span>
          </div>

          {/* High-density student table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-3 px-4 text-left">Student Profile</th>
                    <th className="py-3 px-4 text-left">Enrolled Courses</th>
                    <th className="py-3 px-4 text-right">Lifetime Spend</th>
                    <th className="py-3 px-4 text-center">Joined Date</th>
                    <th className="py-3 px-4 text-center">Account Status</th>
                    <th className="py-3 px-4 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {student.avatarText}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{student.name}</span>
                            <span className="text-slate-500 text-[11px]">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-medium text-slate-800">
                          {student.enrolledCourseIds.length} course(s)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ${student.totalSpent.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-center text-slate-500 font-mono">
                        {student.joinedDate}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => updateUserStatus(student.id, student.status === 'active' ? 'suspended' : 'active')}
                          className={`px-2 py-0.5 text-[10px] font-mono rounded font-semibold capitalize transition-colors ${
                            student.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {student.status}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedStudentForAudit(student)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          Inspect Audit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Audit Modal */}
          {selectedStudentForAudit && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Audit Trail: {selectedStudentForAudit.name}
                    </h3>
                    <p className="text-xs text-slate-500">{selectedStudentForAudit.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedStudentForAudit(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block mb-2">Enrolled Course Progress:</span>
                    <div className="space-y-2">
                      {selectedStudentForAudit.enrolledCourseIds.map(cid => {
                        const course = courses.find(c => c.id === cid);
                        const progress = enrollments[`${selectedStudentForAudit.id}_${cid}`];
                        const totalL = course?.modules.reduce((s, m) => s + m.lessons.length, 0) || 1;
                        const completedCount = progress?.completedLessonIds.length || 0;
                        const pct = Math.round((completedCount / totalL) * 100);

                        return (
                          <div key={cid} className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1">
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-900">{course?.title || cid}</span>
                              <span className="font-mono text-indigo-700">{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Completed {completedCount} of {totalL} lessons
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Course Governance */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-3 px-4 text-left">Course Title & Category</th>
                    <th className="py-3 px-4 text-left">Lead Instructor</th>
                    <th className="py-3 px-4 text-center">Modules / Lessons</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map(course => (
                    <tr key={course.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{course.title}</span>
                        <span className="text-slate-500 text-[11px]">
                          {course.category} · {course.level}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 block">{course.instructorName}</span>
                        <span className="text-slate-400 text-[11px]">{course.instructorTitle}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                        {course.modules.length} mods / {course.modules.reduce((s, m) => s + m.lessons.length, 0)} les
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ${course.price}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleCoursePublish(course.id)}
                          className={`px-2 py-0.5 text-[10px] font-mono rounded font-semibold capitalize transition-colors ${
                            course.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {course.status}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => toggleCoursePublish(course.id)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          {course.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Transaction Ledger & Instant Refund Processing */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
                placeholder="Search by invoice number, customer name, or course..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Total volume: <strong className="text-slate-900 font-bold">${totalRevenue.toFixed(2)}</strong>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-3 px-4 text-left">Invoice #</th>
                    <th className="py-3 px-4 text-left">Purchaser</th>
                    <th className="py-3 px-4 text-left">Course</th>
                    <th className="py-3 px-4 text-center">Payment Method</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {tx.invoiceNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{tx.userName}</span>
                        <span className="text-slate-500 text-[11px]">{tx.userEmail}</span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-700">
                        {tx.courseTitle}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono uppercase text-slate-600 text-[11px]">
                        {tx.paymentMethod} {tx.cardLast4 ? `(••${tx.cardLast4})` : ''}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ${tx.amount.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-semibold capitalize ${
                          tx.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {tx.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {tx.status === 'completed' ? (
                          <button
                            onClick={() => {
                              if (confirm(`Authorize full refund of $${tx.amount} to ${tx.userName}? This will revoke course access.`)) {
                                refundTransaction(tx.id);
                              }
                            }}
                            className="px-2.5 py-1 text-rose-700 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ml-auto"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Issue Refund</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">Refunded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Global Certificates Registry & Academic Governance */}
      {activeTab === 'certificates' && (() => {
        const allIssuedCertificates: any[] = [];
        Object.entries(enrollments).forEach(([key, enrollment]) => {
          if (enrollment.certificateIssued) {
            const course = courses.find(c => c.id === enrollment.courseId);
            const student = allUsers.find(u => u.id === enrollment.userId);
            allIssuedCertificates.push({
              studentName: enrollment.certificateIssued.recipientName || student?.name || 'Student',
              studentEmail: student?.email || 'N/A',
              courseTitle: course?.title || 'Course',
              courseCategory: course?.category || 'General',
              courseId: enrollment.courseId,
              userId: enrollment.userId,
              cert: enrollment.certificateIssued,
              enrollment,
              course
            });
          }
        });

        const filteredCertificates = allIssuedCertificates.filter(item =>
          item.cert.credentialId.toLowerCase().includes(certificateSearch.toLowerCase()) ||
          item.studentName.toLowerCase().includes(certificateSearch.toLowerCase()) ||
          item.courseTitle.toLowerCase().includes(certificateSearch.toLowerCase())
        );

        return (
          <div className="space-y-6">
            {/* Quick Actions & Verification Strip */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Institution Accreditation Registry</h4>
                  <p className="text-xs text-slate-500">
                    {allIssuedCertificates.length} verified diplomas active across all cohorts.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowVerifierModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Launch Public Credential Verifier</span>
              </button>
            </div>

            {/* Filter Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={certificateSearch}
                  onChange={(e) => setCertificateSearch(e.target.value)}
                  placeholder="Search by Credential ID, student name, or course..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <span className="text-xs font-mono text-slate-500">
                Showing {filteredCertificates.length} credentials
              </span>
            </div>

            {/* Certificates Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                    <tr>
                      <th className="py-3 px-4 text-left">Credential ID</th>
                      <th className="py-3 px-4 text-left">Recipient Student</th>
                      <th className="py-3 px-4 text-left">Course Title</th>
                      <th className="py-3 px-4 text-center">Academic Standing</th>
                      <th className="py-3 px-4 text-center">Issue Date</th>
                      <th className="py-3 px-4 text-right">Governance Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCertificates.length > 0 ? (
                      filteredCertificates.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                            {item.cert.credentialId}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{item.studentName}</span>
                            <span className="text-slate-500 text-[11px]">{item.studentEmail}</span>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs truncate text-slate-800 font-medium">
                            {item.courseTitle}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                              {item.cert.honors || 'Standard Mastery'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                            {item.cert.issueDate}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {item.course && (
                                <button
                                  onClick={() => setInspectingCert({ course: item.course, enrollment: item.enrollment })}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium transition-colors"
                                >
                                  Inspect Diploma
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  if (confirm(`Revoke certificate ${item.cert.credentialId} for ${item.studentName}?`)) {
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No matching credentials found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 6: Teacher Verification & Approvals (Sole Authority: Management) */}
      {activeTab === 'teacherApplications' && (() => {
        const filteredApps = teacherApplications.filter(app => {
          if (applicationFilter === 'pending') return app.status === 'pending_approval';
          if (applicationFilter === 'approved') return app.status === 'approved';
          if (applicationFilter === 'rejected') return app.status === 'rejected';
          return true;
        });

        const pendingCount = teacherApplications.filter(a => a.status === 'pending_approval').length;
        const approvedCount = teacherApplications.filter(a => a.status === 'approved').length;
        const rejectedCount = teacherApplications.filter(a => a.status === 'rejected').length;

        const handleConfirmApproval = (appId: string) => {
          approveTeacherApplication(appId, reviewNotesInput || 'Verified academic standing, research publications, and curriculum outline. Full course publishing and certification privileges granted.');
          setReviewAction(null);
          setSelectedAppForReview(null);
          setReviewNotesInput('');
          setManagementToast('Instructor approved successfully by management! Course publishing and accreditation privileges unlocked.');
          setTimeout(() => setManagementToast(null), 4000);
        };

        const handleConfirmRejection = (appId: string) => {
          rejectTeacherApplication(appId, reviewNotesInput || 'Declined based on institutional credential standards. Resubmission required with verified academic documentation.');
          setReviewAction(null);
          setSelectedAppForReview(null);
          setReviewNotesInput('');
          setManagementToast('Application declined. Review notes logged for instructor visibility.');
          setTimeout(() => setManagementToast(null), 4000);
        };

        return (
          <div className="space-y-6">
            {/* Management Notice Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <span className="font-mono text-xs uppercase tracking-wider text-indigo-300 font-semibold">
                    Management Sole Verification Gate
                  </span>
                </div>
                <h3 className="text-lg font-bold">Instructor Accreditation & Verification Queue</h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Aetheria enforces institutional-level quality. Teacher sign-ups remain locked in pending status until <strong>solely evaluated and authorized by platform management</strong>. Approved instructors unlock curriculum publishing and verified credential awards.
                </p>
              </div>

              {pendingCount > 0 && (
                <div className="px-4 py-2.5 bg-amber-500/20 border border-amber-400/30 rounded-xl text-amber-200 text-xs font-medium flex items-center gap-2 shrink-0">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{pendingCount} Application{pendingCount > 1 ? 's' : ''} Awaiting Management Decision</span>
                </div>
              )}
            </div>

            {/* Management Feedback Toast */}
            {managementToast && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-xs flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{managementToast}</span>
                </div>
                <button onClick={() => setManagementToast(null)} className="text-emerald-600 hover:text-emerald-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Application Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Total Applications
                </span>
                <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                  {teacherApplications.length}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Submitted all-time</p>
              </div>

              <div className="bg-white border border-amber-200 bg-amber-50/20 rounded-xl p-4">
                <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block mb-1">
                  Pending Decision
                </span>
                <div className="text-xl font-bold text-amber-800 font-mono tabular-nums">
                  {pendingCount}
                </div>
                <p className="text-[10px] text-amber-700 mt-0.5">Requires management action</p>
              </div>

              <div className="bg-white border border-emerald-200 bg-emerald-50/20 rounded-xl p-4">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                  Approved Faculty
                </span>
                <div className="text-xl font-bold text-emerald-800 font-mono tabular-nums">
                  {approvedCount}
                </div>
                <p className="text-[10px] text-emerald-700 mt-0.5">Accredited instructors</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Declined / Resubmit
                </span>
                <div className="text-xl font-bold text-slate-700 font-mono tabular-nums">
                  {rejectedCount}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Feedback issued</p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setApplicationFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  applicationFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Applications ({teacherApplications.length})
              </button>

              <button
                onClick={() => setApplicationFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  applicationFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Pending Review</span>
                <span className="font-mono text-[10px] bg-amber-500/30 px-1 py-0.2 rounded">
                  {pendingCount}
                </span>
              </button>

              <button
                onClick={() => setApplicationFilter('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  applicationFilter === 'approved'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Approved ({approvedCount})
              </button>

              <button
                onClick={() => setApplicationFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  applicationFilter === 'rejected'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Declined ({rejectedCount})
              </button>
            </div>

            {/* Applications List */}
            {filteredApps.length > 0 ? (
              <div className="space-y-4">
                {filteredApps.map(app => {
                  const isPending = app.status === 'pending_approval';
                  const isApproved = app.status === 'approved';
                  const isRejected = app.status === 'rejected';

                  return (
                    <div 
                      key={app.id} 
                      className={`bg-white border rounded-2xl p-6 transition-all ${
                        isPending 
                          ? 'border-amber-300 ring-1 ring-amber-200 shadow-sm' 
                          : isApproved 
                          ? 'border-slate-200' 
                          : 'border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        {/* Applicant details */}
                        <div className="space-y-4 flex-1">
                          <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                              {app.applicantName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h4 className="text-base font-bold text-slate-900">
                                  {app.applicantName}
                                </h4>
                                {isPending && (
                                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Pending Management Approval</span>
                                  </span>
                                )}
                                {isApproved && (
                                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                    <span>Approved by Management</span>
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                                    <span>Declined</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>{app.academicTitle}</span>
                                <span className="text-slate-300">·</span>
                                <span className="text-indigo-600 font-semibold">{app.institutionOrCompany}</span>
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {app.applicantEmail} · Submitted: {new Date(app.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          {/* Domain & Proposed Curriculum */}
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
                                Domain:
                              </span>
                              <span className="font-medium text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                {app.primaryDomain}
                              </span>
                              {app.portfolioUrl && (
                                <a
                                  href={app.portfolioUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 ml-auto text-[11px] font-medium"
                                >
                                  <span>View Academic Portfolio / Profile</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>

                            <div>
                              <span className="font-semibold text-slate-700 block mb-0.5">
                                Credentials & Publications Summary:
                              </span>
                              <p className="text-slate-600 leading-relaxed">
                                {app.credentialsSummary}
                              </p>
                            </div>

                            {app.proposedCourseTopic && (
                              <div>
                                <span className="font-semibold text-slate-700 block mb-0.5">
                                  Proposed Course Topic & Syllabus Plan:
                                </span>
                                <p className="text-slate-600 leading-relaxed font-mono text-[11px]">
                                  {app.proposedCourseTopic}
                                </p>
                              </div>
                            )}

                            {app.bio && (
                              <div className="text-slate-500 text-[11px] border-t border-slate-200/60 pt-2 italic">
                                "{app.bio}"
                              </div>
                            )}
                          </div>

                          {/* Historical Review Audit Trail if reviewed */}
                          {app.reviewedAt && (
                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 text-xs space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-indigo-900 font-semibold">
                                <span>Management Evaluation Record</span>
                                <span className="font-mono text-indigo-600">
                                  Evaluated by {app.reviewedBy || 'Management'} on {new Date(app.reviewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                              <p className="text-slate-700 text-[11px] leading-relaxed">
                                {app.reviewNotes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Management Decision Actions */}
                        <div className="lg:w-64 flex flex-col gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Management Authority
                          </span>

                          {/* Decision Buttons */}
                          <div className="space-y-2">
                            {(!isApproved || isRejected) && (
                              <button
                                onClick={() => {
                                  setSelectedAppForReview(app);
                                  setReviewAction('approve');
                                  setReviewNotesInput('Credentials, research background, and curriculum proposal verified and approved by management.');
                                }}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Approve Instructor</span>
                              </button>
                            )}

                            {(!isRejected || isApproved) && (
                              <button
                                onClick={() => {
                                  setSelectedAppForReview(app);
                                  setReviewAction('reject');
                                  setReviewNotesInput('Application declined by management based on institutional accreditation standards. Please submit verified institutional credentials.');
                                }}
                                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                              >
                                <AlertTriangle className="w-4 h-4" />
                                <span>Decline / Request Revision</span>
                              </button>
                            )}

                            {/* View / Inspect Studio as this Instructor */}
                            <button
                              onClick={() => {
                                setCurrentUserById(app.userId);
                                setManagementToast(`Switched persona to instructor: ${app.applicantName}. You can now view their studio perspective.`);
                              }}
                              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                            >
                              <UserCheck className="w-4 h-4 text-slate-500" />
                              <span>Preview Studio as Instructor</span>
                            </button>
                          </div>

                          <div className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                            {isPending ? (
                              <span className="text-amber-700 font-medium">
                                • Awaiting management sign-off before instructor can publish courses.
                              </span>
                            ) : isApproved ? (
                              <span className="text-emerald-700 font-medium">
                                • Authorized by management. Full studio privileges active.
                              </span>
                            ) : (
                              <span className="text-rose-700 font-medium">
                                • Instructor notified with revision guidance.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">No applications found in this view</h4>
                <p className="text-xs text-slate-500">
                  Switch the filter above to view pending, approved, or declined instructor applications.
                </p>
              </div>
            )}

            {/* Modal for Management Decision Notes */}
            {selectedAppForReview && reviewAction && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {reviewAction === 'approve' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                      )}
                      <h3 className="font-bold text-slate-900 text-base">
                        {reviewAction === 'approve' ? 'Confirm Management Approval' : 'Decline Teacher Application'}
                      </h3>
                    </div>
                    <button
                      onClick={() => { setSelectedAppForReview(null); setReviewAction(null); }}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    You are recording a formal management decision for{' '}
                    <strong>{selectedAppForReview.applicantName}</strong> ({selectedAppForReview.institutionOrCompany}).
                    {reviewAction === 'approve' 
                      ? ' This action will immediately grant full course publishing and certificate issuance rights.'
                      : ' The applicant will be able to review your notes and submit updated credentials.'}
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Management Evaluation Notes:
                    </label>
                    <textarea
                      rows={3}
                      value={reviewNotesInput}
                      onChange={(e) => setReviewNotesInput(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      onClick={() => { setSelectedAppForReview(null); setReviewAction(null); }}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    {reviewAction === 'approve' ? (
                      <button
                        onClick={() => handleConfirmApproval(selectedAppForReview.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                      >
                        Approve & Grant Rights
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConfirmRejection(selectedAppForReview.id)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                      >
                        Confirm Decline
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Inspecting Full Certificate Modal */}
      {inspectingCert && (
        <CertificateModal
          course={inspectingCert.course}
          enrollment={inspectingCert.enrollment}
          onClose={() => setInspectingCert(null)}
        />
      )}

      {/* Public Credential Verifier Modal */}
      {showVerifierModal && (
        <CertificateVerifierModal
          onClose={() => setShowVerifierModal(false)}
          onViewCertificate={(courseId) => {
            setShowVerifierModal(false);
            const course = courses.find(c => c.id === courseId);
            const enr = Object.values(enrollments).find(e => e.courseId === courseId && e.certificateIssued);
            if (course && enr) {
              setInspectingCert({ course, enrollment: enr });
            }
          }}
        />
      )}
    </div>
  );
};
