import React, { useState } from 'react';
import { LmsProvider, useLms } from './context/LmsContext';
import { Course } from './types/lms';
import { Navbar } from './components/Navbar';
import { CourseCatalog } from './components/CourseCatalog';
import { MyLearning } from './components/MyLearning';
import { TeacherStudio } from './components/TeacherStudio';
import { AdminDashboard } from './components/AdminDashboard';
import { CoursePlayer } from './components/CoursePlayer';
import { CourseDetailsModal } from './components/CourseDetailsModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal, AuthModalMode } from './components/AuthModal';
import { OwlyBrand } from './components/OwlyBrand';
import { EcosystemLaunchers } from './components/EcosystemLaunchers';
import { EmbeddedEcosystemViewer } from './components/EmbeddedEcosystemViewer';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { 
  ShieldCheck, 
  GraduationCap, 
  Github, 
  Twitter, 
  Linkedin,
  ArrowRight
} from 'lucide-react';

function LMSAppContent() {
  const { currentUser, isUserEnrolled, embeddedEcosystem, setEmbeddedEcosystem } = useLms();

  const [activeTab, setActiveTab] = useState<'catalog' | 'learning' | 'teacher' | 'admin' | 'privacy'>('catalog');
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState<Course | null>(null);
  const [selectedCourseForCheckout, setSelectedCourseForCheckout] = useState<Course | null>(null);
  const [activeLearningCourse, setActiveLearningCourse] = useState<Course | null>(null);

  // Authentication & Teacher Application modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('student_signup');

  const handleOpenAuth = (mode: AuthModalMode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Handle course interaction
  const handleSelectCourse = (course: Course) => {
    if (isUserEnrolled(course.id)) {
      setActiveLearningCourse(course);
    } else {
      setSelectedCourseForDetails(course);
    }
  };

  const handleEnrollClick = (course: Course) => {
    setSelectedCourseForDetails(null);
    if (!currentUser) {
      setSelectedCourseForCheckout(course);
      handleOpenAuth('signin');
      return;
    }
    setSelectedCourseForCheckout(course);
  };

  const handleEnrollmentSuccess = (course: Course) => {
    setSelectedCourseForCheckout(null);
    setActiveLearningCourse(course);
  };

  // If student is inside the interactive Course Player
  if (activeLearningCourse) {
    return (
      <CoursePlayer
        course={activeLearningCourse}
        onBack={() => setActiveLearningCourse(null)}
      />
    );
  }

  const handleTabChange = (tab: 'catalog' | 'learning' | 'teacher' | 'admin' | 'privacy') => {
    setEmbeddedEcosystem(null);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar adhering to Top Bar Contract */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        onOpenAuthModal={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {embeddedEcosystem ? (
          <EmbeddedEcosystemViewer
            initialPlatform={embeddedEcosystem}
            onClose={() => setEmbeddedEcosystem(null)}
          />
        ) : (
          <>
            {activeTab === 'catalog' && (
              <CourseCatalog
                onSelectCourse={handleSelectCourse}
                onEnrollCourse={handleEnrollClick}
                onOpenTeacherApplication={() => handleOpenAuth('teacher_signup')}
                onOpenStudentSignup={() => handleOpenAuth('student_signup')}
                onOpenSignIn={() => handleOpenAuth('signin')}
              />
            )}

            {activeTab === 'learning' && (
              <MyLearning
                onSelectCourse={(course) => setActiveLearningCourse(course)}
                onBrowseCatalog={() => setActiveTab('catalog')}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {activeTab === 'teacher' && (
              <TeacherStudio
                onSelectCourse={handleSelectCourse}
                onOpenTeacherApplication={() => handleOpenAuth('teacher_signup')}
                onOpenSignIn={() => handleOpenAuth('signin')}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboard />
            )}

            {activeTab === 'privacy' && (
              <PrivacyPolicyPage onBack={() => { setActiveTab('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            )}
          </>
        )}
      </main>

      {/* Course Details Syllabus Modal */}
      {selectedCourseForDetails && (
        <CourseDetailsModal
          course={selectedCourseForDetails}
          onClose={() => setSelectedCourseForDetails(null)}
          onEnroll={(c) => handleEnrollClick(c)}
          onStartCourse={(c) => {
            setSelectedCourseForDetails(null);
            if (!currentUser) {
              handleOpenAuth('signin');
              return;
            }
            setActiveLearningCourse(c);
          }}
        />
      )}

      {/* Checkout & Payment Modal */}
      {selectedCourseForCheckout && currentUser && (
        <CheckoutModal
          course={selectedCourseForCheckout}
          onClose={() => setSelectedCourseForCheckout(null)}
          onEnrollmentSuccess={handleEnrollmentSuccess}
        />
      )}

      {/* Sign-Up & Teacher Accreditation Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(role) => {
          if (selectedCourseForCheckout) {
            // Keep checkout modal active for the freshly signed-in student
            return;
          }
          if (role === 'teacher') setActiveTab('teacher');
          else if (role === 'admin') setActiveTab('admin');
          else setActiveTab('learning');
        }}
      />

      {/* Platform Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <OwlyBrand size="sm" theme="dark" showSubtitle={true} />
              <div className="h-4 w-px bg-slate-200 hidden sm:block" />
              <EcosystemLaunchers variant="footer" className="hidden sm:flex" />
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
              <button 
                onClick={() => { handleTabChange('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className={`hover:text-slate-900 transition-colors ${activeTab === 'catalog' && !embeddedEcosystem ? 'text-indigo-600 font-semibold' : ''}`}
              >
                Course Catalog
              </button>
              <button 
                onClick={() => { handleTabChange('learning'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className={`hover:text-slate-900 transition-colors ${activeTab === 'learning' && !embeddedEcosystem ? 'text-indigo-600 font-semibold' : ''}`}
              >
                My Learning
              </button>
              <button 
                onClick={() => { handleTabChange('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className={`hover:text-slate-900 transition-colors ${activeTab === 'privacy' && !embeddedEcosystem ? 'text-indigo-600 font-semibold' : ''}`}
              >
                Privacy Policy
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              © {new Date().getFullYear()} OWLY Learning Technologies Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LmsProvider>
      <LMSAppContent />
    </LmsProvider>
  );
}
