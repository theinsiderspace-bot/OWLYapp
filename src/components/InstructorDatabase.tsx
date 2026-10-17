import React, { useState, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import { Instructor, Course } from '../types/lms';
import {
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  Star,
  Users,
  BookOpen,
  Award,
  Video,
  ExternalLink,
  ShieldCheck,
  Building,
  GraduationCap,
  Filter,
  RefreshCw,
  Cloud,
  ChevronRight,
  X,
  Calendar,
  FileText,
  BadgeCheck
} from 'lucide-react';

interface InstructorDatabaseProps {
  onSelectCourse?: (course: Course) => void;
  onOpenTeacherApplication?: () => void;
  onOpenMeetScheduler?: () => void;
}

export const InstructorDatabase: React.FC<InstructorDatabaseProps> = ({
  onSelectCourse,
  onOpenTeacherApplication,
  onOpenMeetScheduler
}) => {
  const { 
    instructors, 
    courses, 
    currentUser, 
    updateInstructorProfile, 
    matchInstructorsWithAI,
    cloudSyncState,
    forceCloudSync
  } = useLms();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'students' | 'courses' | 'hindex'>('rating');

  // AI Matchmaker State
  const [aiMatchQuery, setAiMatchQuery] = useState('');
  const [isMatchingAI, setIsMatchingAI] = useState(false);
  const [aiMatches, setAiMatches] = useState<{
    matches: {
      instructorId: string;
      matchScore: number;
      alignmentSummary: string;
      recommendedAction: string;
    }[];
    advisoryNote?: string;
  } | null>(null);

  // Selected instructor for Dossier modal
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  // Unique domains
  const domains = useMemo(() => {
    const list = Array.from(new Set(instructors.map(i => i.primaryDomain))).filter(Boolean);
    return ['all', ...list];
  }, [instructors]);

  // Filtered & Sorted instructors
  const filteredInstructors = useMemo(() => {
    return instructors.filter(inst => {
      // Domain filter
      if (selectedDomain !== 'all' && inst.primaryDomain !== selectedDomain) {
        return false;
      }
      // Status filter
      if (selectedStatus === 'approved' && inst.verificationStatus !== 'approved') {
        return false;
      }
      if (selectedStatus === 'pending' && inst.verificationStatus !== 'pending_approval') {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = inst.name.toLowerCase().includes(q);
        const inTitle = inst.academicTitle.toLowerCase().includes(q);
        const inInst = inst.institutionOrCompany.toLowerCase().includes(q);
        const inDomain = inst.primaryDomain.toLowerCase().includes(q);
        const inBio = inst.bio.toLowerCase().includes(q);
        const inSpecialties = inst.specialties?.some(s => s.toLowerCase().includes(q));
        if (!inName && !inTitle && !inInst && !inDomain && !inBio && !inSpecialties) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'students') return (b.studentCount || 0) - (a.studentCount || 0);
      if (sortBy === 'courses') return (b.courseIds?.length || 0) - (a.courseIds?.length || 0);
      if (sortBy === 'hindex') return (b.hIndex || 0) - (a.hIndex || 0);
      return 0;
    });
  }, [instructors, selectedDomain, selectedStatus, searchQuery, sortBy]);

  // Aggregate stats
  const totalFacultyCount = instructors.length;
  const verifiedFacultyCount = instructors.filter(i => i.verificationStatus === 'approved').length;
  const totalStudentsMentored = instructors.reduce((acc, i) => acc + (i.studentCount || 0), 0);
  const totalCoursesTaught = courses.length;

  // Handle AI Match
  const handleRunAIMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiMatchQuery.trim()) return;
    setIsMatchingAI(true);
    try {
      const result = await matchInstructorsWithAI(aiMatchQuery.trim());
      if (result) {
        setAiMatches(result);
      }
    } finally {
      setIsMatchingAI(false);
    }
  };

  // Admin fast accreditation toggle
  const handleToggleAccreditation = async (inst: Instructor) => {
    const nextStatus = inst.verificationStatus === 'approved' ? 'pending_approval' : 'approved';
    await updateInstructorProfile(inst.id, {
      verificationStatus: nextStatus
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* 1. Header Banner & Real-time Cloud Sync Pill */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-400/30">
                  Global Academic Network
                </span>
                
                {/* Cloud Database Sync Status */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-400/30">
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  <span>Firestore Sync: Active</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Accredited Faculty & Instructor Directory
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Connect with world-class faculty, research fellows, and engineering architects from MIT, Oxford, Stanford, and Cambridge.
                All instructors undergo rigorous credential verification and <strong>marketplace authorization by platform management</strong>.
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">
              {currentUser?.role === 'student' && onOpenTeacherApplication && (
                <button
                  onClick={onOpenTeacherApplication}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Award className="w-4 h-4" />
                  <span>Apply to Teach (70% Net)</span>
                </button>
              )}

              <button
                onClick={forceCloudSync}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-white/10"
                title="Force reload from Firestore"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncState.status === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Sync Cloud DB</span>
              </button>
            </div>
          </div>

          {/* Aggregate KPI Strip */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">Total Faculty</span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block">{totalFacultyCount}</span>
              <span className="text-[10px] text-slate-400">Accredited researchers</span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">Verified by Governance</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">{verifiedFacultyCount}</span>
              <span className="text-[10px] text-slate-400">100% credential vetted</span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">Students Mentored</span>
              <span className="text-xl font-bold font-mono text-sky-400 mt-0.5 block">{totalStudentsMentored.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">Active enrollments</span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">Production Masterclasses</span>
              <span className="text-xl font-bold font-mono text-purple-400 mt-0.5 block">{totalCoursesTaught}</span>
              <span className="text-[10px] text-slate-400">Published curricula</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AI Faculty Advisor & Research Matchmaker */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">AI Faculty Advisor & Research Matchmaker</h2>
              <p className="text-[11px] text-slate-500">
                Describe your research goal, technical challenge, or coursework objective to match with ideal faculty mentors.
              </p>
            </div>
          </div>

          <form onSubmit={handleRunAIMatch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={aiMatchQuery}
                onChange={e => setAiMatchQuery(e.target.value)}
                placeholder="e.g. 'I want to study distributed consensus protocols, Raft in Rust, and multi-region databases'..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isMatchingAI || !aiMatchQuery.trim()}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {isMatchingAI ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Matching Faculty...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Match with AI</span>
                </>
              )}
            </button>
          </form>

          {/* AI Match Results Banner */}
          {aiMatches && (
            <div className="p-4 bg-gradient-to-r from-purple-50/70 via-indigo-50/70 to-slate-50 border border-purple-200/80 rounded-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-purple-600" />
                  <span>Dean's Pedagogical Match Results</span>
                </span>
                <button
                  onClick={() => setAiMatches(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {aiMatches.advisoryNote && (
                <p className="text-[11px] text-slate-700 italic border-l-2 border-purple-400 pl-2.5">
                  "{aiMatches.advisoryNote}"
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiMatches.matches.map(match => {
                  const inst = instructors.find(i => i.id === match.instructorId);
                  if (!inst) return null;
                  return (
                    <div 
                      key={match.instructorId}
                      className="p-3 bg-white rounded-lg border border-purple-200 shadow-2xs space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate">{inst.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono font-bold text-[10px]">
                          {match.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {match.alignmentSummary}
                      </p>
                      <button
                        onClick={() => setSelectedInstructor(inst)}
                        className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 pt-1"
                      >
                        <span>View Dossier</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Search Bar, Domain Filters, and Sorting Controls */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Query Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search faculty by name, institution, or research topic..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white shadow-2xs"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Accreditation Filter */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-700 font-medium shrink-0"
            >
              <option value="all">All Accreditation Statuses</option>
              <option value="approved">Verified Faculty Only</option>
              <option value="pending">Pending Accreditation</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-700 font-medium shrink-0"
            >
              <option value="rating">Sort: Highest Student Rating</option>
              <option value="students">Sort: Most Students Mentored</option>
              <option value="courses">Sort: Most Courses Authored</option>
              <option value="hindex">Sort: Academic H-Index</option>
            </select>
          </div>
        </div>

        {/* Domain Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {domains.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                selectedDomain === d
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {d === 'all' ? 'All Academic Departments' : d}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Instructor Database Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredInstructors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No faculty members found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No instructors match your current search query or domain filter. Try adjusting your search keywords.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDomain('all');
                setSelectedStatus('all');
              }}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstructors.map(inst => {
              const instCourses = courses.filter(c => inst.courseIds?.includes(c.id) || c.instructorId === inst.userId);

              return (
                <div 
                  key={inst.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-lg transition-all flex flex-col overflow-hidden group"
                >
                  {/* Card Header Strip */}
                  <div className="p-5 pb-4 border-b border-slate-100 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-700 text-white font-bold text-base flex items-center justify-center shadow-md shrink-0">
                          {inst.avatarText}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {inst.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                            {inst.academicTitle}
                          </p>
                        </div>
                      </div>

                      {/* Accreditation Pill */}
                      {inst.verificationStatus === 'approved' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{inst.institutionOrCompany}</span>
                    </div>
                  </div>

                  {/* Body: Bio & Specialties */}
                  <div className="p-5 py-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {inst.bio}
                      </p>

                      {/* Specialties Chips */}
                      {inst.specialties && inst.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {inst.specialties.slice(0, 3).map(s => (
                            <span 
                              key={s}
                              className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                            >
                              {s}
                            </span>
                          ))}
                          {inst.specialties.length > 3 && (
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md">
                              +{inst.specialties.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Stats Strip */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">RATING</span>
                        <div className="flex items-center justify-center gap-1 text-slate-800 font-bold font-mono">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{inst.rating ? inst.rating.toFixed(2) : '5.0'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">STUDENTS</span>
                        <span className="text-slate-800 font-bold font-mono">
                          {inst.studentCount?.toLocaleString() || '0'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">COURSES</span>
                        <span className="text-slate-800 font-bold font-mono">
                          {instCourses.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Office hours preview if available */}
                  {inst.officeHoursSchedule && (
                    <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Video className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="truncate">{inst.officeHoursSchedule}</span>
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedInstructor(inst)}
                      className="flex-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-lg border border-slate-200 shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>View Dossier</span>
                    </button>

                    {instCourses.length > 0 && onSelectCourse && (
                      <button
                        type="button"
                        onClick={() => onSelectCourse(instCourses[0])}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                        title="Browse courses by this faculty member"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Curriculum</span>
                      </button>
                    )}

                    {/* Admin Accreditation Quick Toggle */}
                    {currentUser?.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => handleToggleAccreditation(inst)}
                        title={inst.verificationStatus === 'approved' ? 'Revoke accreditation' : 'Approve faculty accreditation'}
                        className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                          inst.verificationStatus === 'approved'
                            ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Comprehensive Faculty Dossier Modal */}
      {selectedInstructor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="fixed inset-0"
            onClick={() => setSelectedInstructor(null)} 
          />

          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-600 text-white font-bold text-xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                  {selectedInstructor.avatarText}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{selectedInstructor.name}</h2>
                    {selectedInstructor.verificationStatus === 'approved' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Accredited Faculty</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-400/40 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Pending Governance Review</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-sky-200 font-medium mt-0.5">
                    {selectedInstructor.academicTitle}
                  </p>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedInstructor.institutionOrCompany}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInstructor(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              
              {/* Credentials & Academic Summary */}
              {selectedInstructor.credentialsSummary && (
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Degrees & Academic Credentials
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
                    {selectedInstructor.credentialsSummary}
                  </p>
                </div>
              )}

              {/* Research Biography */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Faculty Research Biography
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedInstructor.bio}
                </p>
              </div>

              {/* Research Specialties */}
              {selectedInstructor.specialties && selectedInstructor.specialties.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Research Specialties & Domain Competencies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInstructor.specialties.map(spec => (
                      <span 
                        key={spec}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 font-medium border border-indigo-200/80 rounded-lg text-xs"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Google Meet Office Hours & Mentorship */}
              {selectedInstructor.officeHoursSchedule && (
                <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">Real-Time Google Meet Office Hours</h5>
                      <p className="text-[11px] text-slate-600">
                        {selectedInstructor.officeHoursSchedule}
                      </p>
                    </div>
                  </div>

                  {onOpenMeetScheduler && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInstructor(null);
                        onOpenMeetScheduler();
                      }}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors shrink-0"
                    >
                      Book Session
                    </button>
                  )}
                </div>
              )}

              {/* Courses Taught by this Faculty */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Published Masterclasses & Curricula
                </h4>
                {courses.filter(c => selectedInstructor.courseIds?.includes(c.id) || c.instructorId === selectedInstructor.userId).length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                    This faculty member does not have published public masterclasses yet. New curricula under review.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {courses
                      .filter(c => selectedInstructor.courseIds?.includes(c.id) || c.instructorId === selectedInstructor.userId)
                      .map(course => (
                        <div 
                          key={course.id}
                          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 transition-colors flex items-center justify-between gap-3"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase">
                              {course.category} • {course.level}
                            </span>
                            <h5 className="font-bold text-slate-900 text-xs mt-0.5">{course.title}</h5>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              ★ {course.rating} • {course.studentCount} Students • {course.durationHours} Hours
                            </p>
                          </div>

                          {onSelectCourse && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInstructor(null);
                                onSelectCourse(course);
                              }}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0"
                            >
                              <span>Inspect Syllabus</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Portfolio / External Scholar Link */}
              {selectedInstructor.portfolioUrl && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Official Faculty Website / Lab:</span>
                  <a 
                    href={selectedInstructor.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>Visit Academic Lab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="text-[11px] text-slate-400 font-mono">
                Faculty ID: {selectedInstructor.id}
              </div>

              <button
                type="button"
                onClick={() => setSelectedInstructor(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
