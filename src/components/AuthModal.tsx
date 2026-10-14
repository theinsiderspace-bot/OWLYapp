import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { UserRole } from '../types/lms';
import { 
  X, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Lock, 
  Building2, 
  FileText, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export type AuthModalMode = 'student_signup' | 'teacher_signup' | 'signin';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthModalMode;
  onClose: () => void;
  onSuccess?: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'student_signup',
  onClose,
  onSuccess
}) => {
  const { 
    currentUser, 
    allUsers, 
    signUpStudent, 
    signUpTeacher, 
    applyAsTeacher, 
    setCurrentUserById, 
    teacherApplications 
  } = useLms();

  const [mode, setMode] = useState<AuthModalMode>(initialMode);

  // Student form state
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentTitle, setStudentTitle] = useState('Senior Software Engineer');
  const [studentBio, setStudentBio] = useState('Eager to master production distributed systems and AI agent architectures.');
  const [studentPassword, setStudentPassword] = useState('••••••••');

  // Teacher application state
  const [teacherName, setTeacherName] = useState(currentUser?.role === 'student' ? currentUser.name : '');
  const [teacherEmail, setTeacherEmail] = useState(currentUser?.role === 'student' ? currentUser.email : '');
  const [academicTitle, setAcademicTitle] = useState('');
  const [institution, setInstitution] = useState('');
  const [primaryDomain, setPrimaryDomain] = useState('Engineering & Cloud Architecture');
  const [teacherBio, setTeacherBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [credentialsSummary, setCredentialsSummary] = useState('');
  const [proposedCourseTopic, setProposedCourseTopic] = useState('');
  const [pledgeAccepted, setPledgeAccepted] = useState(false);

  // Sign in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');

  // Submission feedback state
  const [successNotice, setSuccessNotice] = useState<{
    title: string;
    description: string;
    badge?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentEmail.trim()) return;

    signUpStudent({
      name: studentName,
      email: studentEmail,
      title: studentTitle,
      bio: studentBio
    });

    setSuccessNotice({
      title: 'Student Account Activated!',
      description: `Welcome aboard, ${studentName}! Your learning account is ready. You can now browse masterclasses, complete interactive modules, and claim verified certificates.`,
      badge: 'Active Student'
    });

    setTimeout(() => {
      onSuccess?.('student');
      onClose();
    }, 1800);
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !teacherEmail.trim() || !academicTitle.trim() || !institution.trim() || !pledgeAccepted) {
      return;
    }

    if (currentUser && currentUser.role === 'student') {
      applyAsTeacher({
        academicTitle,
        institutionOrCompany: institution,
        primaryDomain,
        bio: teacherBio || `Faculty member at ${institution} specializing in ${primaryDomain}.`,
        portfolioUrl,
        credentialsSummary: credentialsSummary || 'Verified academic and engineering background.',
        proposedCourseTopic: proposedCourseTopic || 'Production Systems Architecture'
      });
    } else {
      signUpTeacher({
        name: teacherName,
        email: teacherEmail,
        academicTitle,
        institutionOrCompany: institution,
        primaryDomain,
        bio: teacherBio || `Faculty member at ${institution} specializing in ${primaryDomain}.`,
        portfolioUrl,
        credentialsSummary: credentialsSummary || 'Verified academic and engineering background.',
        proposedCourseTopic: proposedCourseTopic || 'Production Systems Architecture'
      });
    }

    setSuccessNotice({
      title: 'Application Submitted to Management!',
      description: `Thank you, ${teacherName}. Your accreditation credentials have been received. Platform Management (Admin) will thoroughly review your curriculum and credentials. You can access Teacher Studio now to prepare draft materials.`,
      badge: 'Pending Management Approval'
    });

    setTimeout(() => {
      onSuccess?.('teacher');
      onClose();
    }, 2200);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    const targetUser = allUsers.find(u => u.email.toLowerCase() === signInEmail.trim().toLowerCase());
    if (targetUser) {
      setCurrentUserById(targetUser.id);
      setSuccessNotice({
        title: `Welcome back, ${targetUser.name}`,
        description: `Signed in successfully as ${targetUser.role.toUpperCase()}.`,
        badge: targetUser.role
      });
      setTimeout(() => {
        onSuccess?.(targetUser.role);
        onClose();
      }, 1000);
    } else {
      setSignInError('No account found with this email address. Please check your email or select a demo profile below.');
    }
  };

  const handleQuickPersonaSelect = (userId: string) => {
    const targetUser = allUsers.find(u => u.id === userId);
    if (targetUser) {
      setCurrentUserById(targetUser.id);
      onSuccess?.(targetUser.role);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Mode Tabs */}
        <div className="bg-slate-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-indigo-400 font-semibold">
              OWLY Academy Authentication
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {mode === 'student_signup' && 'Create Student Account'}
            {mode === 'teacher_signup' && 'Instructor Accreditation Application'}
            {mode === 'signin' && 'Sign In to OWLY'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
            {mode === 'student_signup' && 'Instant access to graduate-level technical courses, interactive labs, and industry certificates.'}
            {mode === 'teacher_signup' && 'Apply to teach. To preserve our academic standard, instructor accreditation and course publishing are granted solely by management.'}
            {mode === 'signin' && 'Sign in to access your enrolled courses, instructor studio, or management dashboard.'}
          </p>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 mt-5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => { setMode('student_signup'); setSuccessNotice(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'student_signup'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Sign-Up</span>
            </button>

            <button
              onClick={() => { setMode('teacher_signup'); setSuccessNotice(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'teacher_signup'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Apply as Instructor</span>
            </button>

            <button
              onClick={() => { setMode('signin'); setSuccessNotice(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto">
          {successNotice ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                {successNotice.badge && (
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-100 text-emerald-800 mb-2">
                    {successNotice.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-900">{successNotice.title}</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                  {successNotice.description}
                </p>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Redirecting you into the application workspace...
              </div>
            </div>
          ) : (
            <>
              {/* MODE 1: Student Sign-Up */}
              {mode === 'student_signup' && (
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Jordan Hayes"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="jordan.hayes@example.com"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Professional Title / Headline
                      </label>
                      <input
                        type="text"
                        value={studentTitle}
                        onChange={(e) => setStudentTitle(e.target.value)}
                        placeholder="e.g. Distributed Systems Engineer"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Learning Objectives / Focus
                    </label>
                    <textarea
                      rows={2}
                      value={studentBio}
                      onChange={(e) => setStudentBio(e.target.value)}
                      placeholder="What areas of technical engineering are you looking to master?"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                    />
                  </div>

                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-900 flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold block">Instant Enrollment & Verified Certificates</span>
                      <span className="text-[11px] text-indigo-700">
                        Student accounts are activated immediately. You can enroll in courses, access interactive code sandboxes, and receive verifiable completion credentials.
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Complete Student Registration</span>
                    </button>
                  </div>
                </form>
              )}

              {/* MODE 2: Teacher Sign-Up & Application */}
              {mode === 'teacher_signup' && (
                <form onSubmit={handleTeacherSubmit} className="space-y-4">
                  {/* Governance Notice Banner */}
                  <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-2">
                        <span>Teacher Accreditation Policy</span>
                        <span className="bg-amber-200 text-amber-900 text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold">
                          Solely by Management
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        To guarantee high educational rigor, instructor accounts are <strong>vetted and approved solely by platform management</strong>. Once submitted, your profile enters the management verification queue. You can draft course materials in Teacher Studio, but marketplace publishing and certificate issuance require explicit management authorization.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Instructor Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        placeholder="e.g. Dr. Arthur Pendelton"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Academic / Official Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        placeholder="a.pendelton@stanford.edu"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Academic or Industry Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={academicTitle}
                        onChange={(e) => setAcademicTitle(e.target.value)}
                        placeholder="e.g. Professor of Distributed Systems"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Affiliated University / Company <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. Stanford University / Google Research"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Primary Specialization Domain
                      </label>
                      <select
                        value={primaryDomain}
                        onChange={(e) => setPrimaryDomain(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      >
                        <option value="Engineering & Cloud Architecture">Engineering & Cloud Architecture</option>
                        <option value="Artificial Intelligence & Autonomous Agents">Artificial Intelligence & Autonomous Agents</option>
                        <option value="Quantitative Finance & Trading">Quantitative Finance & Trading</option>
                        <option value="Design Systems & Architecture">Design Systems & Architecture</option>
                        <option value="Formal Verification & Cryptography">Formal Verification & Cryptography</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Google Scholar / GitHub / Portfolio Link
                      </label>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://scholar.google.com/citations?user=..."
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Credentials & Research Summary <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={credentialsSummary}
                      onChange={(e) => setCredentialsSummary(e.target.value)}
                      placeholder="List your highest degree, notable publications, patents, or industry achievements for management review."
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Proposed Course Topic & Curriculum Outline
                    </label>
                    <input
                      type="text"
                      value={proposedCourseTopic}
                      onChange={(e) => setProposedCourseTopic(e.target.value)}
                      placeholder="e.g. Advanced Raft Consensus & High-Throughput Replicated Logs"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pledgeAccepted}
                        onChange={(e) => setPledgeAccepted(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-[11px] text-slate-600 leading-snug">
                        I certify that the above credentials and institutional affiliations are genuine, and I acknowledge that <strong>instructor publishing rights and verified certifications are approved solely by management</strong>.
                      </span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!pledgeAccepted}
                      className="w-full py-2.5 bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit Application for Management Approval</span>
                    </button>
                  </div>
                </form>
              )}

              {/* MODE 3: Sign In & Quick Switcher */}
              {mode === 'signin' && (
                <div className="space-y-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    {signInError && (
                      <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{signInError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="Enter registered email"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Sign In with Email</span>
                    </button>
                  </form>

                  {/* Fast Testing Personas */}
                  <div className="border-t border-slate-200 pt-5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                      One-Click Fast Demo Accounts
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Student Alex Mercer */}
                      <button
                        onClick={() => handleQuickPersonaSelect('user-student-1')}
                        className="p-3 text-left border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 rounded-xl transition-all group flex items-start gap-2.5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                          AM
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-slate-900 group-hover:text-indigo-600 truncate">
                            Alex Mercer
                          </div>
                          <div className="text-[10px] text-slate-500">Student · 2 Enrolled</div>
                          <span className="inline-block mt-1 text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
                            Active Learner
                          </span>
                        </div>
                      </button>

                      {/* Approved Teacher Dr. Elena Vance */}
                      <button
                        onClick={() => handleQuickPersonaSelect('user-teacher-1')}
                        className="p-3 text-left border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 rounded-xl transition-all group flex items-start gap-2.5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold shrink-0">
                          EV
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-slate-900 group-hover:text-indigo-600 truncate">
                            Dr. Elena Vance
                          </div>
                          <div className="text-[10px] text-slate-500">Teacher · MIT Faculty</div>
                          <span className="inline-block mt-1 text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
                            Approved by Management
                          </span>
                        </div>
                      </button>

                      {/* Pending Teacher Prof. Julian Thorne */}
                      <button
                        onClick={() => handleQuickPersonaSelect('user-teacher-2')}
                        className="p-3 text-left border border-amber-200 hover:border-amber-400 bg-amber-50/30 rounded-xl transition-all group flex items-start gap-2.5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                          JT
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-slate-900 group-hover:text-amber-700 truncate">
                            Prof. Julian Thorne
                          </div>
                          <div className="text-[10px] text-slate-500">Teacher · Oxford Univ.</div>
                          <span className="inline-block mt-1 text-[9px] font-mono text-amber-800 bg-amber-100 px-1 py-0.2 rounded font-semibold">
                            Pending Management Approval
                          </span>
                        </div>
                      </button>

                      {/* Admin Marcus Sterling */}
                      <button
                        onClick={() => handleQuickPersonaSelect('user-admin-1')}
                        className="p-3 text-left border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 rounded-xl transition-all group flex items-start gap-2.5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                          MS
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-slate-900 group-hover:text-emerald-700 truncate">
                            Marcus Sterling
                          </div>
                          <div className="text-[10px] text-slate-500">Management · Dean</div>
                          <span className="inline-block mt-1 text-[9px] font-mono text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded font-semibold">
                            Full Management Authority
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
