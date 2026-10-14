import React, { useState } from 'react';
import { Course } from '../types/lms';
import { useLms } from '../context/LmsContext';
import { CourseCard } from './CourseCard';
import { OwlyBrand, OwlyLogoIcon } from './OwlyBrand';
import { ScholarStatsBanner, LearningTracksShowcase } from './EducationPlatformVisuals';
import { OwlyHeroArtwork } from './ThemeArtworks';
import { 
  Search, 
  SlidersHorizontal, 
  Star, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  Award,
  ChevronDown,
  ArrowRight,
  GraduationCap,
  LogIn,
  UserPlus
} from 'lucide-react';

interface CourseCatalogProps {
  onSelectCourse: (course: Course) => void;
  onEnrollCourse: (course: Course) => void;
  onOpenTeacherApplication?: () => void;
  onOpenStudentSignup?: () => void;
  onOpenSignIn?: () => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ 
  onSelectCourse, 
  onEnrollCourse,
  onOpenTeacherApplication,
  onOpenStudentSignup,
  onOpenSignIn
}) => {
  const { courses, currentUser, setCurrentUserById } = useLms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price-asc' | 'price-desc'>('popular');

  const categories = ['All', 'Engineering', 'Artificial Intelligence', 'Finance & Trading', 'Design Systems'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Filter & Sort
  const publishedCourses = courses.filter(c => c.status === 'published');

  const filteredCourses = publishedCourses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return b.studentCount - a.studentCount;
  });

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section with OWLY Visuals */}
      <section className="bg-slate-950 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        {/* Subtle grid texture & glowing nebula gradients */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          
          {/* OWLY Brand Emblem Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs shadow-lg backdrop-blur">
            <OwlyLogoIcon size={18} />
            <span className="font-mono uppercase font-bold tracking-wider text-[11px] text-white">
              OWLY ACADEMY
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-amber-400 font-mono text-[11px] font-semibold">
              The Next-Gen Online Education Platform
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight" style={{ textWrap: 'balance' }}>
            Where Principal Engineers & University Faculty Teach Online
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Exhaustive, code-grounded masterclasses designed by MIT and Oxford faculty. Experience real-time Google Meet classrooms, interactive AI video studio lectures, and verifiable cryptographic certificates.
          </p>

          {/* Startup State: Student Authentication Prompt (automatic login removed) */}
          {!currentUser ? (
            <div className="max-w-2xl mx-auto bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 text-left shadow-2xl backdrop-blur-md">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-white">Student Portal · Authentication Required</span>
                    <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30 font-semibold">
                      Please Log In First
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Automatic student login has been removed from the startup page. Please sign in or register your student account first to track progress, access course materials, and receive verified diplomas.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5 mt-3.5">
                    <button
                      onClick={onOpenSignIn}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Log In to Student Account</span>
                    </button>
                    {onOpenStudentSignup && (
                      <button
                        onClick={onOpenStudentSignup}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Create Account</span>
                      </button>
                    )}
                    <button
                      onClick={() => setCurrentUserById('user-student-1')}
                      className="px-3 py-2 bg-slate-950 hover:bg-indigo-950/60 text-slate-400 hover:text-indigo-300 border border-slate-800 rounded-xl text-[11px] font-medium transition-colors"
                      title="Quick test login as student Alex Mercer"
                    >
                      <span>Quick Demo Student</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : currentUser.role === 'student' ? (
            <div className="max-w-2xl mx-auto bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 text-left shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-bold text-sm text-emerald-400">
                    {currentUser.avatarText}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Active Student Account</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-700/50">Logged In</span>
                    </div>
                    <div className="text-sm font-bold text-white">{currentUser.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 hidden sm:inline">{currentUser.title}</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Quick Platform Action Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('catalog-explore');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
            >
              <span>Explore Masterclasses</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenStudentSignup && (
              <button
                onClick={onOpenStudentSignup}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <span>Enroll as Scholar</span>
              </button>
            )}

            {onOpenTeacherApplication && (
              <button
                onClick={onOpenTeacherApplication}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <span>Apply as Faculty</span>
              </button>
            )}
          </div>

          {/* Value points strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>30-Day Money-Back Guarantee</span>
            </span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Verifiable Cryptographic Diplomas</span>
            </span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Lifetime Access & AI Study Copilot</span>
            </span>
          </div>

          {/* AI-Generated Style Theme Hero Centerpiece Visual */}
          <div className="pt-6 pb-2 max-w-4xl mx-auto">
            <OwlyHeroArtwork className="w-full" />
          </div>

          {/* Scholar Metrics Strip */}
          <div className="pt-4 max-w-4xl mx-auto">
            <ScholarStatsBanner />
          </div>

        </div>
      </section>

      {/* Specialized Learning Tracks Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningTracksShowcase onSelectCategory={(cat) => setSelectedCategory(cat)} />
      </div>

      {/* Main Catalog Viewport */}
      <div id="catalog-explore" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-4">
        {/* Search & Filter Controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses by title, keywords, or instructor..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            {/* Dropdown Filters (Level & Sort) */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="text-slate-400">Level:</span>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {levels.map(l => (
                    <option key={l} value={l}>{l === 'All' ? 'All Levels' : l}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="text-slate-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="popular">Most Enrolled</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Category Tabs / Segmented Controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat === 'All' ? 'All Curriculums' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Showing {filteredCourses.length} masterclasses</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-indigo-600 hover:underline"
            >
              Clear search filter
            </button>
          )}
        </div>

        {/* Course Card Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onSelect={onSelectCourse}
                onEnrollClick={onEnrollCourse}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <h4 className="text-sm font-bold text-slate-900">No courses match your criteria</h4>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or selecting a different category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLevel('All');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Dual Callout Section: Instructor Accreditation & Student Community */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
          {/* Instructor Accreditation Callout */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-semibold">
                  Accredited Faculty
                </span>
                <span className="text-[11px] text-slate-400">Solely by Management</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold">
                Teach Production Systems & Advanced AI
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Join our roster of university lecturers and principal engineers. All instructors are thoroughly evaluated and verified by platform management before publishing courses to our student marketplace.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onOpenTeacherApplication?.()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Apply as Instructor</span>
              </button>
            </div>
          </div>

          {/* Student Sign-Up Callout */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
                  Learner Community
                </span>
                <span className="text-[11px] text-slate-500">Instant Access</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Register as a Student & Earn Credentials
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create a student profile to save progress across lectures, submit interactive quiz assessments, participate in instructor Q&A forums, and claim cryptographic certificates of completion.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onOpenStudentSignup?.()}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Create Student Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
