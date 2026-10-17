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
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Key
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
    teacherApplications,
    connectGoogle
  } = useLms();

  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [googleLoading, setGoogleLoading] = useState(false);

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
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [teacherFormError, setTeacherFormError] = useState('');
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentEmail.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await signUpStudent({
        name: studentName,
        email: studentEmail,
        title: studentTitle,
        bio: studentBio,
        password: studentPassword
      });

      setSuccessNotice({
        title: 'Student Account Activated!',
        description: `Welcome aboard, ${studentName}! Your learning account is ready. You can now browse masterclasses, complete interactive modules, and claim verified certificates.`,
        badge: 'Active Student'
      });

      setTimeout(() => {
        onSuccess?.('student');
        onClose();
      }, 1600);
    } catch (err: any) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherFormError('');

    if (!teacherName.trim() || !teacherEmail.trim() || !academicTitle.trim() || !institution.trim() || !pledgeAccepted || isSubmitting) {
      return;
    }

    if (!teacherPassword || teacherPassword.trim().length < 6) {
      setTeacherFormError('Account security required: Please enter an educator password with at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanPass = teacherPassword.trim();
      if (currentUser && currentUser.role === 'student') {
        await applyAsTeacher({
          academicTitle,
          institutionOrCompany: institution,
          primaryDomain,
          bio: teacherBio || `Faculty member at ${institution} specializing in ${primaryDomain}.`,
          portfolioUrl,
          credentialsSummary: credentialsSummary || 'Verified academic and engineering background.',
          proposedCourseTopic: proposedCourseTopic || 'Production Systems Architecture',
          password: cleanPass
        });
      } else {
        await signUpTeacher({
          name: teacherName,
          email: teacherEmail,
          password: cleanPass,
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
        title: 'Instructor Application Submitted for Review',
        description: `Thank you, ${teacherName}. Your educator dossier and account password have been securely stored in the Firestore database. In accordance with platform governance, all instructor studio functionalities remain strictly restricted and locked until platform management formally evaluates and grants administrative approval. You may sign in with your email and password to check your live verification status anytime.`,
        badge: 'Pending Admin Approval · All Features Restricted'
      });

      setTimeout(() => {
        onSuccess?.('teacher');
        onClose();
      }, 2400);
    } catch (err: any) {
      console.error('Teacher registration error:', err);
      setTeacherFormError('Application submission error. Please try again or check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    const targetUser = allUsers.find(u => u.email.toLowerCase() === signInEmail.trim().toLowerCase());
    if (targetUser) {
      if (targetUser.password) {
        if (!signInPassword) {
          setSignInError('Password is required for this account.');
          return;
        }
        if (signInPassword.trim() !== targetUser.password) {
          setSignInError('Incorrect password. Please verify your credentials and try again.');
          return;
        }
      }

      setCurrentUserById(targetUser.id);
      setSuccessNotice({
        title: `Welcome back, ${targetUser.name}`,
        description: `Signed in successfully as ${targetUser.role === 'admin' ? 'SUPER ADMIN' : targetUser.role.toUpperCase()}.`,
        badge: targetUser.role === 'admin' ? 'Platform Super Admin' : targetUser.role.toUpperCase()
      });
      setTimeout(() => {
        onSuccess?.(targetUser.role);
        onClose();
      }, 1000);
    } else {
      setSignInError('No account found with this email address. Please check your credentials or register a new student account.');
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
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Activating Account & Syncing Database...</span>
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-4 h-4" />
                          <span>Complete Student Registration</span>
                        </>
                      )}
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

                  {/* Instructor Account Password */}
                  <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Instructor Account Password</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">Min. 6 characters</span>
                    </div>

                    <div className="relative">
                      <input
                        type={showTeacherPassword ? 'text' : 'password'}
                        required
                        value={teacherPassword}
                        onChange={(e) => {
                          setTeacherPassword(e.target.value);
                          if (teacherFormError) setTeacherFormError('');
                        }}
                        placeholder="Create a secure password for your educator profile"
                        className="w-full pl-3 pr-10 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        title={showTeacherPassword ? 'Hide password' : 'Show password'}
                      >
                        {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Secures your educator profile in Cloud Firestore. Use this password with your email to log in and review your verification and accreditation status.
                    </p>
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

                  {teacherFormError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{teacherFormError}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!pledgeAccepted || isSubmitting}
                      className="w-full py-2.5 bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Transmitting Application to Management...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Submit Application for Management Approval</span>
                        </>
                      )}
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

                    <div className="relative my-3">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">Or</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        setGoogleLoading(true);
                        setSignInError('');
                        try {
                          const success = await connectGoogle();
                          if (success) {
                            setSuccessNotice({
                              title: 'Authentication Successful',
                              description: 'Connected with your verified Google account.',
                              badge: 'Platform Administrator'
                            });
                            setTimeout(() => {
                              onSuccess?.('admin');
                              onClose();
                            }, 1000);
                          }
                        } catch (err: any) {
                          setSignInError(err?.message || 'Failed to authenticate with Google');
                        } finally {
                          setGoogleLoading(false);
                        }
                      }}
                      disabled={googleLoading}
                      className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
                    </button>
                  </form>

                  {/* Account Creation Options */}
                  <div className="border-t border-slate-200 pt-5 space-y-3">
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-800">New to OWLY Academy?</div>
                        <div className="text-[11px] text-slate-500">Create a student account to enroll in masterclasses.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSignInError('');
                          setMode('student_signup');
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Sign Up</span>
                      </button>
                    </div>

                    <div className="p-3.5 bg-amber-50/50 border border-amber-200/70 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-amber-950">Educators & Faculty</div>
                        <div className="text-[11px] text-amber-800/80">Apply for faculty accreditation and publish courses.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSignInError('');
                          setMode('teacher_signup');
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Apply</span>
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
