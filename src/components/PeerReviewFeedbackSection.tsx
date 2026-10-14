import React, { useState, useMemo } from 'react';
import { Course, Lesson, AssignmentSubmission, PeerReview } from '../types/lms';
import { useLms } from '../context/LmsContext';
import { 
  Users, 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  Code, 
  ExternalLink, 
  Copy, 
  Check, 
  PlusCircle, 
  Filter, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Award,
  BookOpen,
  X,
  FileCode2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface PeerReviewFeedbackSectionProps {
  course: Course;
  activeLesson: Lesson;
}

export const PeerReviewFeedbackSection: React.FC<PeerReviewFeedbackSectionProps> = ({
  course,
  activeLesson
}) => {
  const { 
    currentUser, 
    assignmentSubmissions, 
    submitAssignment, 
    addPeerReview, 
    addReviewComment, 
    voteReviewHelpful 
  } = useLms();

  // Filter & Search states
  const [filterMode, setFilterMode] = useState<'all' | 'lesson' | 'my' | 'needs_review'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'reviews'>('recent');

  // Modal / Form states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [reviewingSubmission, setReviewingSubmission] = useState<AssignmentSubmission | null>(null);
  const [expandedSubmissions, setExpandedSubmissions] = useState<Record<string, boolean>>({ 'sub-1': true });
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // New Assignment Submission Form state
  const [subLessonId, setSubLessonId] = useState(activeLesson.id);
  const [subTitle, setSubTitle] = useState('');
  const [subSummary, setSubSummary] = useState('');
  const [subCodeSnippet, setSubCodeSnippet] = useState('');
  const [subLanguage, setSubLanguage] = useState('rust');
  const [subRepoUrl, setSubRepoUrl] = useState('');
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  // New Peer Review Form state
  const [revRating, setRevRating] = useState<number>(5);
  const [revClarity, setRevClarity] = useState<number>(5);
  const [revArchitecture, setRevArchitecture] = useState<number>(5);
  const [revRobustness, setRevRobustness] = useState<number>(5);
  const [revStrengths, setRevStrengths] = useState('');
  const [revImprovements, setRevImprovements] = useState('');
  const [revComment, setRevComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Comment on review state
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Flatten course lessons for dropdown selection
  const allCourseLessons = useMemo(() => {
    return course.modules.flatMap(m => m.lessons);
  }, [course]);

  // Filter and sort submissions for this course
  const courseSubmissions = useMemo(() => {
    return assignmentSubmissions.filter(s => s.courseId === course.id);
  }, [assignmentSubmissions, course.id]);

  const filteredSubmissions = useMemo(() => {
    return courseSubmissions.filter(sub => {
      // Filter by tab
      if (filterMode === 'lesson' && sub.lessonId !== activeLesson.id) return false;
      if (filterMode === 'my' && sub.studentId !== currentUser?.id) return false;
      if (filterMode === 'needs_review' && sub.reviews.length >= 2) return false;

      // Filter by search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = sub.studentName.toLowerCase().includes(q);
        const matchesTitle = sub.title.toLowerCase().includes(q);
        const matchesSummary = sub.summary.toLowerCase().includes(q);
        const matchesLesson = sub.lessonTitle.toLowerCase().includes(q);
        if (!matchesName && !matchesTitle && !matchesSummary && !matchesLesson) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') {
        const avgA = a.reviews.length ? a.reviews.reduce((acc, r) => acc + r.rating, 0) / a.reviews.length : 0;
        const avgB = b.reviews.length ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length : 0;
        return avgB - avgA;
      }
      if (sortBy === 'reviews') {
        return b.reviews.length - a.reviews.length;
      }
      return b.id.localeCompare(a.id); // recent
    });
  }, [courseSubmissions, filterMode, activeLesson.id, currentUser?.id, searchQuery, sortBy]);

  const toggleExpand = (id: string) => {
    setExpandedSubmissions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCreateSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTitle.trim() || !subSummary.trim()) {
      setSubmitFeedback('Please provide both an assignment title and an overview summary.');
      return;
    }

    const selectedLesson = allCourseLessons.find(l => l.id === subLessonId) || activeLesson;

    const newSub = submitAssignment({
      courseId: course.id,
      courseTitle: course.title,
      lessonId: selectedLesson.id,
      lessonTitle: selectedLesson.title,
      title: subTitle.trim(),
      summary: subSummary.trim(),
      codeSnippet: subCodeSnippet.trim() || undefined,
      language: subLanguage,
      repoUrl: subRepoUrl.trim() || undefined
    });

    setExpandedSubmissions(prev => ({ ...prev, [newSub.id]: true }));
    setShowSubmitModal(false);
    setSubTitle('');
    setSubSummary('');
    setSubCodeSnippet('');
    setSubRepoUrl('');
    setSubmitFeedback(null);
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSubmission) return;

    if (!revComment.trim() || !revStrengths.trim() || !revImprovements.trim()) {
      setReviewError('Please complete all review fields (Strengths, Improvements, and Detailed Evaluation).');
      return;
    }

    addPeerReview(reviewingSubmission.id, {
      rating: revRating,
      rubric: {
        clarity: revClarity,
        architecture: revArchitecture,
        robustness: revRobustness
      },
      strengths: revStrengths.trim(),
      improvements: revImprovements.trim(),
      comment: revComment.trim()
    });

    setReviewingSubmission(null);
    setRevStrengths('');
    setRevImprovements('');
    setRevComment('');
    setReviewError('');
    setExpandedSubmissions(prev => ({ ...prev, [reviewingSubmission.id]: true }));
  };

  const handlePostReply = (submissionId: string, reviewId: string) => {
    const text = replyTextMap[reviewId]?.trim();
    if (!text) return;
    addReviewComment(submissionId, reviewId, text);
    setReplyTextMap(prev => ({ ...prev, [reviewId]: '' }));
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Users className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">Peer Review & Assignment Workshop</h3>
            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Live Cohort
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            Evaluate implementations submitted by fellow engineers, score architecture using structured rubrics, and submit your code for constructive critique.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSubLessonId(activeLesson.id);
            setShowSubmitModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Assignment</span>
        </button>
      </div>

      {/* Control Bar: Filters, Search & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            All Submissions ({courseSubmissions.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('lesson')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'lesson'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>Current Lesson</span>
            <span className="text-[10px] font-mono opacity-80">
              ({courseSubmissions.filter(s => s.lessonId === activeLesson.id).length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('needs_review')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filterMode === 'needs_review'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Needs Review ({courseSubmissions.filter(s => s.reviews.length < 2).length})
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={() => setFilterMode('my')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterMode === 'my'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              My Submissions ({courseSubmissions.filter(s => s.studentId === currentUser.id).length})
            </button>
          )}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search code or peer..."
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="recent">Newest</option>
            <option value="rating">Top Rated</option>
            <option value="reviews">Most Reviews</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/40 border border-slate-800/60 rounded-2xl p-8">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">No submissions found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Be the first engineer to submit a solution for {activeLesson.title} to receive constructive peer feedback!
            </p>
            <button
              type="button"
              onClick={() => {
                setSubLessonId(activeLesson.id);
                setShowSubmitModal(true);
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Submit Your Solution
            </button>
          </div>
        ) : (
          filteredSubmissions.map(submission => {
            const isExpanded = Boolean(expandedSubmissions[submission.id]);
            const avgRating = submission.reviews.length > 0
              ? (submission.reviews.reduce((acc, r) => acc + r.rating, 0) / submission.reviews.length).toFixed(1)
              : null;

            const isAuthor = currentUser?.id === submission.studentId;
            const hasUserReviewed = submission.reviews.some(r => r.reviewerId === currentUser?.id);

            return (
              <div 
                key={submission.id}
                className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden transition-all shadow-sm hover:border-slate-700/80"
              >
                {/* Submission Header Card */}
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs border border-indigo-500/20">
                        {submission.studentAvatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{submission.studentName}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                            {submission.submittedAt}
                          </span>
                          {submission.status === 'distinguished' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                              <Award className="w-3 h-3 text-amber-400" />
                              Distinguished Solution
                            </span>
                          )}
                          {isAuthor && (
                            <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                              Your Submission
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-indigo-400 font-medium">{submission.lessonTitle}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Expand CTA */}
                    <div className="flex items-center gap-2.5">
                      {avgRating ? (
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-amber-300">{avgRating}</span>
                          <span className="text-[10px] text-amber-400/70 font-mono">({submission.reviews.length})</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                          Awaiting Reviews
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleExpand(submission.id)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                        title={isExpanded ? 'Collapse' : 'Expand reviews'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <div className="mt-3">
                    <h4 className="text-sm font-bold text-white tracking-tight">{submission.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{submission.summary}</p>
                  </div>

                  {/* Code snippet preview & External Link */}
                  {submission.codeSnippet && (
                    <div className="mt-3.5 relative">
                      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-x border-t border-slate-800 rounded-t-xl text-[11px] font-mono text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="uppercase">{submission.language || 'code'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(submission.id, submission.codeSnippet!)}
                          className="flex items-center gap-1 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          {copiedCodeId === submission.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Snippet</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-b-xl text-xs font-mono text-slate-200 overflow-x-auto max-h-56 leading-relaxed">
                        <code>{submission.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* Footer actions: External link + Review action */}
                  <div className="mt-3.5 pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {submission.repoUrl && (
                        <a
                          href={submission.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Artifact / Repo</span>
                        </a>
                      )}
                      <span className="text-xs text-slate-500">
                        {submission.reviews.length} {submission.reviews.length === 1 ? 'Peer Review' : 'Peer Reviews'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isAuthor && !hasUserReviewed && (
                        <button
                          type="button"
                          onClick={() => {
                            setReviewingSubmission(submission);
                            setRevRating(5);
                            setRevClarity(5);
                            setRevArchitecture(5);
                            setRevRobustness(5);
                            setRevStrengths('');
                            setRevImprovements('');
                            setRevComment('');
                            setReviewError('');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-all"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Write Peer Review</span>
                        </button>
                      )}

                      {hasUserReviewed && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>You Reviewed This</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleExpand(submission.id)}
                        className="text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors cursor-pointer"
                      >
                        {isExpanded ? 'Hide Reviews' : 'Read Feedback'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Reviews Breakdown */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 bg-slate-900/40 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Cohort Peer Evaluations ({submission.reviews.length})</span>
                      </h5>

                      {!isAuthor && !hasUserReviewed && (
                        <button
                          type="button"
                          onClick={() => setReviewingSubmission(submission)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                        >
                          + Add Evaluation
                        </button>
                      )}
                    </div>

                    {submission.reviews.length === 0 ? (
                      <div className="p-4 bg-slate-950/60 border border-dashed border-slate-800 rounded-xl text-center">
                        <p className="text-xs text-slate-400">
                          No reviews submitted yet for this assignment. Be the first to evaluate this student's solution!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {submission.reviews.map(review => {
                          const hasUpvoted = currentUser ? review.helpfulUserIds.includes(currentUser.id) : false;

                          return (
                            <div 
                              key={review.id}
                              className="p-4 bg-slate-950 border border-slate-800/90 rounded-xl space-y-3"
                            >
                              {/* Reviewer Header */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-700/50 text-indigo-300 flex items-center justify-center text-xs font-bold">
                                    {review.reviewerAvatar}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-white">{review.reviewerName}</span>
                                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                                        review.reviewerRole === 'teacher' 
                                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                          : review.reviewerRole === 'admin'
                                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                                      }`}>
                                        {review.reviewerRole === 'teacher' ? 'Instructor' : review.reviewerRole === 'admin' ? 'Faculty Admin' : 'Peer Reviewer'}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono">{review.createdAt}</span>
                                  </div>
                                </div>

                                {/* Stars */}
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star 
                                      key={star} 
                                      className={`w-3.5 h-3.5 ${
                                        star <= review.rating 
                                          ? 'text-amber-400 fill-amber-400' 
                                          : 'text-slate-700'
                                      }`} 
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Rubric Breakdown Pills */}
                              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                                  Clarity: <strong className="text-indigo-400 font-mono">{review.rubric.clarity}/5</strong>
                                </span>
                                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                                  Architecture: <strong className="text-emerald-400 font-mono">{review.rubric.architecture}/5</strong>
                                </span>
                                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                                  Robustness: <strong className="text-amber-400 font-mono">{review.rubric.robustness}/5</strong>
                                </span>
                              </div>

                              {/* Structured Strengths & Improvements */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/40 rounded-lg">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                                    Key Strengths
                                  </span>
                                  <p className="text-slate-300 leading-relaxed">{review.strengths}</p>
                                </div>

                                <div className="p-2.5 bg-amber-950/20 border border-amber-900/40 rounded-lg">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                                    Suggested Refinements
                                  </span>
                                  <p className="text-slate-300 leading-relaxed">{review.improvements}</p>
                                </div>
                              </div>

                              {/* Detailed Commentary */}
                              <div className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                                {review.comment}
                              </div>

                              {/* Helpful Button & Comments */}
                              <div className="flex items-center justify-between pt-1">
                                <button
                                  type="button"
                                  onClick={() => voteReviewHelpful(submission.id, review.id)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                    hasUpvoted 
                                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50' 
                                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                                  }`}
                                  title="Mark as helpful review"
                                >
                                  <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'text-indigo-400 fill-indigo-400' : ''}`} />
                                  <span>Helpful ({review.helpfulVotes})</span>
                                </button>
                              </div>

                              {/* Nested Discussion / Comment Thread on Review */}
                              <div className="mt-3 pt-2 border-t border-slate-900 space-y-2">
                                {review.comments && review.comments.length > 0 && (
                                  <div className="space-y-1.5 pl-3 border-l-2 border-indigo-900/40">
                                    {review.comments.map(c => (
                                      <div key={c.id} className="text-xs bg-slate-900/80 p-2 rounded-lg">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-300">
                                          <span>{c.authorName}</span>
                                          <span className="text-[10px] font-normal text-slate-500">· {c.createdAt}</span>
                                        </div>
                                        <p className="text-slate-200 mt-0.5">{c.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Reply Input */}
                                <div className="flex items-center gap-2 pt-1">
                                  <input
                                    type="text"
                                    value={replyTextMap[review.id] || ''}
                                    onChange={e => setReplyTextMap({ ...replyTextMap, [review.id]: e.target.value })}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handlePostReply(submission.id, review.id);
                                      }
                                    }}
                                    placeholder="Reply to this peer review..."
                                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handlePostReply(submission.id, review.id)}
                                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
                                    title="Send reply"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Submit Assignment */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Submit Assignment for Peer Review</h3>
                  <p className="text-xs text-slate-400">Share your solution with the cohort to receive evaluations.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitFeedback && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{submitFeedback}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmission} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Associated Lesson
                </label>
                <select
                  value={subLessonId}
                  onChange={e => setSubLessonId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {allCourseLessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title} ({lesson.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Submission Title *
                </label>
                <input
                  type="text"
                  required
                  value={subTitle}
                  onChange={e => setSubTitle(e.target.value)}
                  placeholder="e.g. Asynchronous Raft Leader Election with Tokio Channels"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Architectural Summary & Approach *
                </label>
                <textarea
                  required
                  rows={3}
                  value={subSummary}
                  onChange={e => setSubSummary(e.target.value)}
                  placeholder="Explain your approach, design decisions, invariants preserved, and potential trade-offs..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Language / Runtime
                  </label>
                  <select
                    value={subLanguage}
                    onChange={e => setSubLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="rust">Rust</option>
                    <option value="typescript">TypeScript</option>
                    <option value="go">Go</option>
                    <option value="python">Python</option>
                    <option value="tla+">TLA+ Specification</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Repository or Artifact Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={subRepoUrl}
                    onChange={e => setSubRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Code Implementation / Snippet
                </label>
                <textarea
                  rows={7}
                  value={subCodeSnippet}
                  onChange={e => setSubCodeSnippet(e.target.value)}
                  placeholder="// Paste your primary implementation, algorithms, or module code here..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  Publish to Peer Review Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Write Peer Review */}
      {reviewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Write Peer Evaluation</h3>
                  <p className="text-xs text-slate-400">
                    Reviewing <strong className="text-indigo-400">{reviewingSubmission.title}</strong> by {reviewingSubmission.studentName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewingSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewError && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <form onSubmit={handleCreateReview} className="space-y-4">
              {/* Overall Star Rating */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Overall Evaluation Rating</span>
                  <span className="text-[11px] text-slate-400">Rate the overall quality and depth of the solution.</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRevRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= revRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Rubric Matrix */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Engineering Rubric Assessment
                </span>

                {/* Clarity */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-200 block">Clarity & Documentation</span>
                    <span className="text-[11px] text-slate-400">Code structure, comments, and rationale explanation.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => setRevClarity(v)}
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                          revClarity === v
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Architecture */}
                <div className="flex items-center justify-between gap-3 text-xs pt-2 border-t border-slate-900">
                  <div>
                    <span className="font-semibold text-slate-200 block">Technical Architecture</span>
                    <span className="text-[11px] text-slate-400">Separation of concerns, modularity, and algorithm choice.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => setRevArchitecture(v)}
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                          revArchitecture === v
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Robustness */}
                <div className="flex items-center justify-between gap-3 text-xs pt-2 border-t border-slate-900">
                  <div>
                    <span className="font-semibold text-slate-200 block">Robustness & Edge Cases</span>
                    <span className="text-[11px] text-slate-400">Partition handling, split-brain tolerance, error recovery.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => setRevRobustness(v)}
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                          revRobustness === v
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">
                  Key Strengths *
                </label>
                <textarea
                  required
                  rows={2}
                  value={revStrengths}
                  onChange={e => setRevStrengths(e.target.value)}
                  placeholder="What did this student execute particularly well? Highlight clean patterns or invariants..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Improvements */}
              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">
                  Suggested Areas for Improvement *
                </label>
                <textarea
                  required
                  rows={2}
                  value={revImprovements}
                  onChange={e => setRevImprovements(e.target.value)}
                  placeholder="What edge cases, concurrency hazards, or optimizations should they consider?"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Detailed Evaluation */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Detailed Peer Evaluation *
                </label>
                <textarea
                  required
                  rows={4}
                  value={revComment}
                  onChange={e => setRevComment(e.target.value)}
                  placeholder="Provide an in-depth constructive critique to help your fellow engineer level up..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReviewingSubmission(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  Submit Peer Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
