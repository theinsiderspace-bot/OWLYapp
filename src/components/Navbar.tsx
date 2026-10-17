import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { UserRole } from '../types/lms';
import { OwlyBrand } from './OwlyBrand';
import { EcosystemLaunchers } from './EcosystemLaunchers';
import { 
  GraduationCap, 
  BookOpen, 
  LayoutDashboard, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles,
  RefreshCw,
  Award,
  UserPlus,
  Clock,
  LogIn,
  CheckCircle2,
  Menu,
  X,
  Briefcase,
  LogOut,
  Dna,
  Gamepad2,
  Lock,
  UserCheck,
  Users,
  Cloud,
  CloudOff
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'catalog' | 'instructors' | 'learning' | 'teacher' | 'admin' | 'privacy' | 'bioscience';
  setActiveTab: (tab: 'catalog' | 'instructors' | 'learning' | 'teacher' | 'admin' | 'privacy' | 'bioscience') => void;
  onOpenCart?: () => void;
  onOpenAuthModal?: (mode: 'student_signup' | 'teacher_signup' | 'signin') => void;
  onOpenProfileModal?: () => void;
  onLaunchGame?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenAuthModal, 
  onOpenProfileModal,
  onLaunchGame 
}) => {
  const { currentUser, signOut, enrollments, resetPlatformData, cloudSyncState, forceCloudSync } = useLms();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Count active enrollments for current user (if logged in)
  const enrolledCount = currentUser 
    ? Object.keys(enrollments).filter(key => key.startsWith(`${currentUser.id}_`)).length
    : 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 md:gap-8 h-16">
          {/* Zone 1: OWLY Wordmark */}
          <button 
            onClick={() => setActiveTab('catalog')} 
            className="flex items-center gap-2.5 text-left group transition-opacity shrink-0"
            title="OWLY Home"
          >
            <OwlyBrand size="md" theme="dark" showSubtitle={true} />
          </button>

          {/* Zone 2: Profile-Customized Menu Bar */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {/* Guest / Unauthenticated Visitor Menu (Students must log in first) */}
            {!currentUser && (
              <>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                    activeTab === 'catalog'
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Browse Masterclasses
                </button>

                <button
                  onClick={() => setActiveTab('instructors')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                    activeTab === 'instructors'
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Faculty Directory</span>
                </button>

                <button
                  onClick={() => onOpenAuthModal?.('signin')}
                  className="whitespace-nowrap shrink-0 transition-colors py-1 text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 group"
                >
                  <GraduationCap className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  <span>Student Portal</span>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded-full">
                    Log In First
                  </span>
                </button>

                <button
                  onClick={() => onOpenAuthModal?.('teacher_signup')}
                  className="whitespace-nowrap shrink-0 transition-colors py-1 text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 group"
                >
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  <span>Teach on OWLY</span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-full">
                    70% Split (30% Sys)
                  </span>
                </button>

                <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-200 text-xs text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <span>Guest Visitor</span>
                </div>
              </>
            )}

            {/* Student Profile Menu */}
            {currentUser?.role === 'student' && (
              <>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                    activeTab === 'catalog'
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Browse Catalog
                </button>

                <button
                  onClick={() => setActiveTab('instructors')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                    activeTab === 'instructors'
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Faculty Directory</span>
                </button>

                <button
                  onClick={() => setActiveTab('learning')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                    activeTab === 'learning'
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <span>My Learning</span>
                  {enrolledCount > 0 && (
                    <span className="text-[11px] font-mono font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {enrolledCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => onOpenAuthModal?.('teacher_signup')}
                  className="whitespace-nowrap shrink-0 transition-colors py-1 text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 group"
                >
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  <span>Teach on OWLY</span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-full">
                    70% Split (30% Sys)
                  </span>
                </button>

                <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-200 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span>Student View</span>
                </div>
              </>
            )}

            {/* Teacher Profile Menu */}
            {currentUser?.role === 'teacher' && (
              <>
                <button
                  onClick={() => setActiveTab('teacher')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                    activeTab === 'teacher'
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-sky-500" />
                  <span>Teacher Studio</span>
                </button>

                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                    activeTab === 'catalog'
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Course Catalog
                </button>

                <button
                  onClick={() => setActiveTab('instructors')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                    activeTab === 'instructors'
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4 text-sky-500" />
                  <span>Faculty Directory</span>
                </button>

                <button
                  onClick={() => setActiveTab('learning')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                    activeTab === 'learning'
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>My Learning</span>
                  {enrolledCount > 0 && (
                    <span className="text-[11px] font-mono font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {enrolledCount}
                    </span>
                  )}
                </button>

                {/* Faculty Status Pill */}
                <div className="hidden lg:flex items-center pl-2 border-l border-slate-200">
                  {currentUser.teacherVerificationStatus === 'approved' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Faculty
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Application Under Review
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Admin Profile Menu */}
            {currentUser?.role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                    activeTab === 'admin'
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Admin Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('instructors')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                    activeTab === 'instructors'
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Faculty Directory</span>
                </button>

                <button
                  onClick={() => setActiveTab('teacher')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                    activeTab === 'teacher'
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Teacher Studio
                </button>

                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                    activeTab === 'catalog'
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Browse Catalog
                </button>

                <button
                  onClick={() => setActiveTab('learning')}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                    activeTab === 'learning'
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Learner Preview
                </button>

                {/* Admin Status Pill */}
                <div className="hidden lg:flex items-center pl-2 border-l border-slate-200">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200/80 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    Super Admin
                  </span>
                </div>
              </>
            )}

            {/* Bioscience Discovery & 3D Lab Tab */}
            <button
              onClick={() => setActiveTab('bioscience')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                activeTab === 'bioscience'
                  ? 'text-teal-600 font-semibold border-b-2 border-teal-600'
                  : 'text-slate-600 hover:text-teal-600'
              }`}
            >
              <Dna className="w-4 h-4 text-teal-600" />
              <span>Bioscience Lab</span>
              {!(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1 ml-0.5" title="Requires educator or admin credentials">
                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                  <span>Faculty</span>
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Actions & Profile Switcher */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* 3D Game Quick Launcher */}
            {onLaunchGame && (
              <button
                onClick={onLaunchGame}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                title="Launch 3D CRISPR-NANO Simulation Game"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">3D Bio-Game</span>
              </button>
            )}

            {/* Owly Ecosystem Launchers: OWLY SAT & OWLY IELTS in same frame, no link displayed */}
            <div className="flex items-center p-0.5 bg-slate-100/90 border border-slate-200/90 rounded-xl shadow-xs">
              <EcosystemLaunchers variant="navbar" />
            </div>

            {/* Live Cloud & Database Sync Status Pill */}
            <button
              onClick={() => forceCloudSync()}
              title={`Database Status: ${cloudSyncState.status === 'synced' ? 'Synced with Firestore' : cloudSyncState.status === 'syncing' ? 'Syncing...' : 'Local Cache / Offline'}. Click to force sync.`}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-all whitespace-nowrap ${
                cloudSyncState.status === 'synced'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : cloudSyncState.status === 'syncing'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {cloudSyncState.status === 'synced' ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold text-[11px]">Cloud Synced</span>
                </>
              ) : cloudSyncState.status === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span className="font-semibold text-[11px]">Syncing...</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-[11px]">Sync Local</span>
                </>
              )}
            </button>

            {/* Reset Sample State */}
            <button
              onClick={resetPlatformData}
              title="Reset sample data"
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Direct Join / Sign-up Button for Verified Students */}
            {currentUser?.role === 'student' && (
              <button
                onClick={() => onOpenAuthModal?.('teacher_signup')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors whitespace-nowrap"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Apply to Teach</span>
              </button>
            )}

            {/* Profile / Persona Switcher OR Log In / Sign Up for Guests */}
            {!currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal?.('signin')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Log In</span>
                </button>

                <button
                  onClick={() => onOpenAuthModal?.('student_signup')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Student</span>
                  <span>Sign Up</span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/80 whitespace-nowrap"
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-white ${
                    currentUser.role === 'admin' 
                      ? 'bg-purple-700' 
                      : currentUser.role === 'teacher' 
                      ? 'bg-sky-700' 
                      : 'bg-indigo-700'
                  }`}>
                    {currentUser.avatarText}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="font-semibold text-slate-900 block leading-tight">{currentUser.name}</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] capitalize font-medium ${
                        currentUser.role === 'admin'
                          ? 'text-purple-700'
                          : currentUser.role === 'teacher'
                          ? 'text-sky-700'
                          : 'text-indigo-700'
                      }`}>
                        {currentUser.role === 'teacher' && currentUser.teacherVerificationStatus === 'approved' 
                          ? 'Verified Faculty' 
                          : currentUser.role === 'teacher' 
                          ? 'Faculty (Pending)' 
                          : currentUser.role === 'admin' 
                          ? 'Platform Admin' 
                          : 'Student'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
                </button>

                {roleDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setRoleDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-2 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                      {/* Active Account Header */}
                      <div className="px-3.5 py-2.5 bg-slate-50/60">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                            currentUser.role === 'admin' 
                              ? 'bg-purple-700' 
                              : currentUser.role === 'teacher' 
                              ? 'bg-sky-700' 
                              : 'bg-indigo-700'
                          }`}>
                            {currentUser.avatarText}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {currentUser.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {currentUser.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            currentUser.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : currentUser.role === 'teacher'
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          }`}>
                            {currentUser.role === 'teacher' && currentUser.teacherVerificationStatus === 'approved' 
                              ? 'Verified Faculty' 
                              : currentUser.role === 'teacher' 
                              ? 'Faculty (Pending Approval)' 
                              : currentUser.role === 'admin' 
                              ? 'Super Admin' 
                              : 'Enrolled Student'}
                          </span>
                        </div>
                      </div>

                      {/* Quick Portal Navigation */}
                      <div className="py-1">
                        {currentUser.role === 'student' && (
                          <>
                            <button
                              onClick={() => {
                                setRoleDropdownOpen(false);
                                setActiveTab('learning');
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                                activeTab === 'learning' ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-slate-700'
                              }`}
                            >
                              <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span>My Learning Space</span>
                            </button>
                            <button
                              onClick={() => {
                                setRoleDropdownOpen(false);
                                setActiveTab('catalog');
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                                activeTab === 'catalog' ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-slate-700'
                              }`}
                            >
                              <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>Browse Catalog</span>
                            </button>
                          </>
                        )}

                        {currentUser.role === 'teacher' && (
                          <>
                            <button
                              onClick={() => {
                                setRoleDropdownOpen(false);
                                setActiveTab('teacher');
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                                activeTab === 'teacher' ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-slate-700'
                              }`}
                            >
                              <BookOpen className="w-4 h-4 text-sky-600 shrink-0" />
                              <span>Teacher Studio & Classes</span>
                            </button>
                            <button
                              onClick={() => {
                                setRoleDropdownOpen(false);
                                setActiveTab('catalog');
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                                activeTab === 'catalog' ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-slate-700'
                              }`}
                            >
                              <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>Course Catalog</span>
                            </button>
                            <button
                              onClick={() => {
                                setRoleDropdownOpen(false);
                                setActiveTab('learning');
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                                activeTab === 'learning' ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-slate-700'
                              }`}
                            >
                              <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>Learner Preview</span>
                            </button>
                          </>
                        )}

                        {currentUser.role === 'admin' && (
                          <>
                            <button
                              onClick={() => {
                                setRoleDropdownOpen(false);
                                setActiveTab('admin');
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                                activeTab === 'admin' ? 'text-purple-600 font-semibold bg-purple-50/50' : 'text-slate-700'
                              }`}
                            >
                              <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                              <span>Admin Dashboard</span>
                            </button>
                            <button
                              onClick={() => {
                                setRoleDropdownOpen(false);
                                setActiveTab('teacher');
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                                activeTab === 'teacher' ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-slate-700'
                              }`}
                            >
                              <BookOpen className="w-4 h-4 text-sky-600 shrink-0" />
                              <span>Teacher Studio</span>
                            </button>
                            <button
                              onClick={() => {
                                setRoleDropdownOpen(false);
                                setActiveTab('catalog');
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                                activeTab === 'catalog' ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-slate-700'
                              }`}
                            >
                              <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>Course Catalog</span>
                            </button>
                          </>
                        )}
                      </div>

                      {/* User Profile & AI Dossier */}
                      <div className="py-1 bg-indigo-50/40 border-y border-indigo-100/60">
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            onOpenProfileModal?.();
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs text-indigo-700 hover:bg-indigo-100/70 flex items-center gap-2.5 font-bold transition-colors"
                        >
                          <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>My Profile & AI Portfolio</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            setActiveTab('instructors');
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                        >
                          <Users className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>Faculty & Instructor Directory</span>
                        </button>
                      </div>

                      {/* Account Actions */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            onOpenAuthModal?.('student_signup');
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-xs text-indigo-700 hover:bg-indigo-50/50 flex items-center gap-2 font-medium"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Create New Student Account</span>
                        </button>

                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            onOpenAuthModal?.('teacher_signup');
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-xs text-amber-800 hover:bg-amber-50/50 flex items-center gap-2 font-medium"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                          <span>Apply as Accredited Instructor</span>
                        </button>

                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            onOpenAuthModal?.('signin');
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <LogIn className="w-3.5 h-3.5 text-slate-500" />
                          <span>Sign In / Switch Account</span>
                        </button>
                      </div>

                      {/* Sign Out Button */}
                      <div className="py-1 bg-slate-50/50">
                        <button
                          onClick={() => {
                            signOut();
                            setRoleDropdownOpen(false);
                            setActiveTab('catalog');
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Sign Out (Return to Guest)</span>
                        </button>
                      </div>

                      <div className="px-3.5 py-2 text-[11px] text-slate-400">
                        Signed in as <span className="font-medium text-slate-600">{currentUser.email}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer (Profile-Aware) */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 px-2 border-t border-slate-200 bg-white space-y-2">
            <div className="px-2 py-1 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>
                {!currentUser
                  ? 'Welcome Visitor'
                  : currentUser.role === 'admin' 
                  ? 'Admin Navigation' 
                  : currentUser.role === 'teacher' 
                  ? 'Instructor Navigation' 
                  : 'Learner Navigation'}
              </span>
              <EcosystemLaunchers variant="compact" />
            </div>

            {/* Mobile guest menu */}
            {!currentUser && (
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                    activeTab === 'catalog' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Browse Masterclasses</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuthModal?.('signin'); }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold"
                >
                  <LogIn className="w-4 h-4 text-indigo-600" />
                  <span>Log In to Student Account</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuthModal?.('student_signup'); }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-xs"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Create Student Account</span>
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuthModal?.('teacher_signup'); }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between text-slate-700 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    <span>Teach on OWLY</span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                    70% Split (30% Sys)
                  </span>
                </button>
              </div>
            )}

            {currentUser?.role === 'student' && (
              <>
                <button
                  onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                    activeTab === 'catalog' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Browse Catalog</span>
                </button>
                <button
                  onClick={() => { setActiveTab('learning'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between ${
                    activeTab === 'learning' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    <span>My Learning</span>
                  </div>
                  {enrolledCount > 0 && (
                    <span className="text-[11px] font-mono font-medium text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                      {enrolledCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuthModal?.('teacher_signup'); }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between text-slate-700 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    <span>Teach on OWLY</span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                    70% Split (30% Sys)
                  </span>
                </button>

                {/* Mobile Bioscience & 3D Game Buttons */}
                <button
                  onClick={() => { setActiveTab('bioscience'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between ${
                    activeTab === 'bioscience' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Dna className="w-4 h-4 text-teal-600" />
                    <span>Bioscience Lab & AlphaFold</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-slate-400" />
                    <span>Faculty</span>
                  </span>
                </button>

                {onLaunchGame && (
                  <button
                    onClick={() => { setMobileMenuOpen(false); onLaunchGame(); }}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold shadow-xs"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Launch 3D CRISPR-NANO Game</span>
                  </button>
                )}
              </>
            )}

            {currentUser?.role === 'teacher' && (
              <>
                <button
                  onClick={() => { setActiveTab('teacher'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                    activeTab === 'teacher' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span>Teacher Studio</span>
                </button>
                <button
                  onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                    activeTab === 'catalog' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-slate-500" />
                  <span>Course Catalog</span>
                </button>
                <button
                  onClick={() => { setActiveTab('learning'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between ${
                    activeTab === 'learning' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    <span>My Learning</span>
                  </div>
                  {enrolledCount > 0 && (
                    <span className="text-[11px] font-mono font-medium text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                      {enrolledCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('bioscience'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                    activeTab === 'bioscience' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Dna className="w-4 h-4 text-teal-600" />
                  <span>Bioscience Lab & AlphaFold</span>
                </button>
              </>
            )}

            {currentUser?.role === 'admin' && (
              <>
                <button
                  onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                    activeTab === 'admin' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Admin Dashboard</span>
                </button>
                <button
                  onClick={() => { setActiveTab('teacher'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                    activeTab === 'teacher' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span>Teacher Studio</span>
                </button>
                <button
                  onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                    activeTab === 'catalog' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-slate-500" />
                  <span>Browse Catalog</span>
                </button>
                <button
                  onClick={() => { setActiveTab('learning'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                    activeTab === 'learning' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <span>Learner Preview</span>
                </button>
                <button
                  onClick={() => { setActiveTab('bioscience'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                    activeTab === 'bioscience' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Dna className="w-4 h-4 text-teal-600" />
                  <span>Bioscience Lab & AlphaFold</span>
                </button>
              </>
            )}

            {/* Mobile Profile & Directory Links */}
            {currentUser && (
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfileModal?.();
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 text-indigo-700 bg-indigo-50 font-semibold"
                >
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>My Profile & AI Credentials</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveTab('instructors');
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Faculty & Instructor Directory</span>
                </button>
              </div>
            )}

            {/* Mobile Sign Out for Logged-In Users */}
            {currentUser && (
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                    setActiveTab('catalog');
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 text-rose-600 hover:bg-rose-50 font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out ({currentUser.name})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
