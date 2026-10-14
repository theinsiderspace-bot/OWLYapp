import React, { useState, useEffect, useRef } from 'react';
import { Course, Lesson, QuizQuestion } from '../types/lms';
import { useLms } from '../context/LmsContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  CheckCircle, 
  Circle, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  PlayCircle, 
  HelpCircle, 
  Download, 
  MessageSquare, 
  Save, 
  ChevronDown, 
  ChevronUp,
  Send,
  Star,
  Check,
  Sparkles,
  Users
} from 'lucide-react';
import { CertificateModal } from './CertificateModal';
import { PeerReviewFeedbackSection } from './PeerReviewFeedbackSection';

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, onBack }) => {
  const { 
    currentUser, 
    getEnrollment, 
    markLessonComplete, 
    saveUserNote, 
    saveQuizScore, 
    issueCertificate,
    discussions,
    addDiscussionThread,
    addDiscussionReply,
    hostedVideos,
    assignmentSubmissions
  } = useLms();

  const enrollment = getEnrollment(course.id);
  const completedIds = enrollment?.completedLessonIds || [];

  // Count submissions for this course
  const courseSubmissionsCount = assignmentSubmissions.filter(s => s.courseId === course.id).length;

  // Flatten all lessons
  const allLessons: Lesson[] = course.modules.flatMap(m => m.lessons);

  // Active lesson state
  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    return enrollment?.lastAccessedLessonId || allLessons[0]?.id || '';
  });

  const activeLesson = allLessons.find(l => l.id === activeLessonId) || allLessons[0];
  const activeModule = course.modules.find(m => m.lessons.some(l => l.id === activeLessonId));

  // Match AI-enhanced hosted video if present
  const matchingHostedVideo = hostedVideos.find(
    v => (v.lessonId && v.lessonId === activeLessonId) || (v.courseId === course.id && v.lessonId === activeLessonId) || (activeLesson.videoUrl && v.videoUrl === activeLesson.videoUrl)
  );

  // Current lesson indices
  const currentLessonIndex = allLessons.findIndex(l => l.id === activeLessonId);
  const hasPrev = currentLessonIndex > 0;
  const hasNext = currentLessonIndex < allLessons.length - 1;

  // Video Player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  // Tab state: 'overview' | 'ai_chapters' | 'notes' | 'peer_reviews' | 'resources' | 'discussion'
  const [playerTab, setPlayerTab] = useState<'overview' | 'ai_chapters' | 'notes' | 'peer_reviews' | 'resources' | 'discussion'>('overview');

  // Personal notes
  const [noteText, setNoteText] = useState('');
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  // Certificate Modal
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Discussion question input
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionBody, setNewQuestionBody] = useState('');
  const [replyInputByThread, setReplyInputByThread] = useState<Record<string, string>>({});

  // Sync personal note when active lesson changes
  useEffect(() => {
    if (enrollment?.userNotes && enrollment.userNotes[activeLessonId]) {
      setNoteText(enrollment.userNotes[activeLessonId]);
    } else {
      setNoteText('');
    }
    // Reset video state
    setIsPlaying(false);
    setCurrentTime(0);
    setSimulatedProgress(0);
    // Reset quiz state
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  }, [activeLessonId]);

  // Video time simulation if HTML video doesn't play
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && (!videoRef.current || videoRef.current.paused)) {
      interval = setInterval(() => {
        setSimulatedProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            // Auto complete lesson if watched 100%
            if (!completedIds.includes(activeLessonId)) {
              markLessonComplete(course.id, activeLessonId, true);
            }
            return 100;
          }
          return prev + 1;
        });
      }, 500 / playbackRate);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackRate, activeLessonId, completedIds, course.id]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(true));
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (secondsDelta: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + secondsDelta));
    } else {
      setSimulatedProgress(prev => Math.max(0, Math.min(100, prev + (secondsDelta > 0 ? 5 : -5))));
    }
  };

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
      if (!isPlaying) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(true));
      }
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleSaveNote = () => {
    saveUserNote(course.id, activeLessonId, noteText);
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 2000);
  };

  const handleQuizAnswer = (qId: string, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    if (!activeLesson.quizQuestions || activeLesson.quizQuestions.length === 0) return;
    let correctCount = 0;
    activeLesson.quizQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / activeLesson.quizQuestions.length) * 100);
    setQuizScore(percent);
    setQuizSubmitted(true);
    saveQuizScore(course.id, activeLessonId, percent);
  };

  const handleNextLesson = () => {
    if (hasNext) {
      setActiveLessonId(allLessons[currentLessonIndex + 1].id);
    }
  };

  const handlePrevLesson = () => {
    if (hasPrev) {
      setActiveLessonId(allLessons[currentLessonIndex - 1].id);
    }
  };

  // Discussions for this course & lesson
  const lessonDiscussions = discussions.filter(
    d => d.courseId === course.id && (!d.lessonId || d.lessonId === activeLessonId)
  );

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionTitle.trim() || !newQuestionBody.trim()) return;
    addDiscussionThread(course.id, activeLessonId, activeLesson.title, newQuestionTitle.trim(), newQuestionBody.trim());
    setNewQuestionTitle('');
    setNewQuestionBody('');
  };

  const handlePostReply = (threadId: string) => {
    const text = replyInputByThread[threadId];
    if (!text || !text.trim()) return;
    addDiscussionReply(threadId, text.trim());
    setReplyInputByThread(prev => ({ ...prev, [threadId]: '' }));
  };

  // Progress metrics
  const totalLessons = allLessons.length;
  const completedCount = completedIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isLessonCompleted = completedIds.includes(activeLessonId);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Learning Navigation Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Catalog</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs md:max-w-md">
              {course.title}
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              {activeLesson.title}
            </p>
          </div>
        </div>

        {/* Progress & Certificate Button */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-mono tabular-nums">
                {completedCount} of {totalLessons} lessons ({progressPercent}%)
              </span>
            </div>
            <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (!enrollment?.certificateIssued) {
                issueCertificate(course.id, currentUser?.name || 'Student');
              }
              setShowCertificateModal(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              progressPercent >= 100
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>{progressPercent >= 100 ? 'Claim Certificate' : 'Certificate Preview'}</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout: Player Stage (Left/Center) + Curriculum Sidebar (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Stage Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900">
          {/* Certificate Completion Celebration Banner */}
          {progressPercent >= 100 && (
            <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/40 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="font-bold text-white block">Curriculum 100% Completed!</span>
                  <span className="text-[11px] text-amber-300">Your verified Certificate of Academic Mastery is ready to claim and print.</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!enrollment?.certificateIssued) {
                    issueCertificate(course.id, currentUser?.name || 'Student', 'Passed with Honors');
                  }
                  setShowCertificateModal(true);
                }}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow whitespace-nowrap"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Claim & View Certificate</span>
              </button>
            </div>
          )}

          {/* Main Visual Content: Video / Quiz / Article */}
          <div className="relative bg-black w-full aspect-video max-h-[58vh] flex items-center justify-center overflow-hidden">
            {activeLesson.type === 'video' && (
              <div className="relative w-full h-full flex flex-col justify-between">
                {/* HTML Video Element */}
                <video
                  ref={videoRef}
                  src={activeLesson.videoUrl}
                  className="w-full h-full object-contain"
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime);
                      setDuration(videoRef.current.duration || 180);
                    }
                  }}
                  onEnded={() => {
                    setIsPlaying(false);
                    markLessonComplete(course.id, activeLessonId, true);
                  }}
                  playsInline
                />

                {/* Video Overlay Play Trigger */}
                {!isPlaying && (
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity"
                  >
                    <div className="w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                      <Play className="w-7 h-7 fill-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Custom Video Controls Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 flex flex-col gap-2">
                  {/* Scrubber slider */}
                  <div className="relative w-full flex items-center">
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={videoRef.current ? currentTime : (simulatedProgress * duration) / 100}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (videoRef.current) {
                          videoRef.current.currentTime = val;
                          setCurrentTime(val);
                        } else {
                          setSimulatedProgress((val / duration) * 100);
                        }
                      }}
                      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500 z-10"
                    />

                    {/* Chapter marker dots */}
                    {matchingHostedVideo?.aiMetadata?.chapters?.map((chap, idx) => {
                      const pct = Math.min(100, (chap.timestamp / (duration || 1)) * 100);
                      return (
                        <div
                          key={idx}
                          title={`${chap.title} (${Math.floor(chap.timestamp / 60)}:${String(Math.floor(chap.timestamp % 60)).padStart(2, '0')})`}
                          onClick={() => seekTo(chap.timestamp)}
                          style={{ left: `${pct}%` }}
                          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 hover:scale-150 transition-transform cursor-pointer z-20 -ml-1 border border-black shadow"
                        />
                      );
                    })}
                  </div>

                  {/* Buttons & Indicators */}
                  <div className="flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-3">
                      <button onClick={togglePlay} className="p-1 hover:text-indigo-400">
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      <button onClick={() => handleSeek(-10)} title="Seek back 10s" className="p-1 hover:text-indigo-400">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button onClick={() => handleSeek(10)} title="Seek forward 10s" className="p-1 hover:text-indigo-400">
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      <button 
                        onClick={() => {
                          setIsMuted(!isMuted);
                          if (videoRef.current) videoRef.current.muted = !isMuted;
                        }} 
                        className="p-1 hover:text-indigo-400"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      <span className="font-mono text-[11px] text-slate-300 tabular-nums">
                        {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Playback speed selector */}
                      <div className="flex items-center gap-1 text-[11px] font-mono bg-white/10 px-2 py-0.5 rounded">
                        {[0.75, 1, 1.25, 1.5, 2].map(rate => (
                          <button
                            key={rate}
                            onClick={() => handleSpeedChange(rate)}
                            className={`px-1 rounded hover:text-white ${playbackRate === rate ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          if (videoRef.current?.requestFullscreen) {
                            videoRef.current.requestFullscreen();
                          }
                        }}
                        className="p-1 hover:text-indigo-400"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeLesson.type === 'quiz' && (
              <div className="w-full h-full bg-slate-950 p-6 flex flex-col justify-center items-center text-center">
                <HelpCircle className="w-10 h-10 text-amber-500 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">
                  Knowledge Evaluation: {activeLesson.title}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mb-4">
                  Test your understanding of the concepts covered in this module. Score 70% or higher to automatically earn module completion credit.
                </p>
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20">
                  {activeLesson.quizQuestions?.length || 0} Questions Total
                </span>
              </div>
            )}

            {activeLesson.type === 'article' && (
              <div className="w-full h-full bg-slate-950 p-6 flex flex-col justify-center items-center text-center">
                <FileText className="w-10 h-10 text-sky-400 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">
                  Technical Architecture Document
                </h3>
                <p className="text-xs text-slate-400 max-w-md">
                  Deep-dive code examples and reference implementations. Scroll below the stage to review the complete lesson specifications.
                </p>
              </div>
            )}
          </div>

          {/* Under Stage Control Strip */}
          <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => markLessonComplete(course.id, activeLessonId, !isLessonCompleted)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                  isLessonCompleted
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {isLessonCompleted ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 text-slate-400" />
                    <span>Mark as Complete</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevLesson}
                disabled={!hasPrev}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNextLesson}
                disabled={!hasNext}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Next Lesson</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stage Tabs */}
          <div className="border-b border-slate-800 bg-slate-950 px-6">
            <div className="flex gap-6 text-xs font-medium">
              <button
                onClick={() => setPlayerTab('overview')}
                className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
                  playerTab === 'overview'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeLesson.type === 'quiz' ? 'Quiz Assessment' : 'Overview & Content'}
              </button>

              {matchingHostedVideo && (
                <button
                  onClick={() => setPlayerTab('ai_chapters')}
                  className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    playerTab === 'ai_chapters'
                      ? 'border-indigo-500 text-indigo-400 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Chapters & Transcript</span>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                    {matchingHostedVideo.aiMetadata?.chapters?.length || 0}
                  </span>
                </button>
              )}

              <button
                onClick={() => setPlayerTab('notes')}
                className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
                  playerTab === 'notes'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                My Lesson Notes
              </button>

              <button
                onClick={() => setPlayerTab('peer_reviews')}
                className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  playerTab === 'peer_reviews'
                    ? 'border-indigo-500 text-indigo-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Peer Reviews</span>
                {courseSubmissionsCount > 0 && (
                  <span className="text-[10px] font-mono bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded">
                    {courseSubmissionsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setPlayerTab('resources')}
                className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
                  playerTab === 'resources'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Resources & Downloads ({activeLesson.resources?.length || 0})
              </button>

              <button
                onClick={() => setPlayerTab('discussion')}
                className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  playerTab === 'discussion'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Q&A Discussion</span>
                {lessonDiscussions.length > 0 && (
                  <span className="text-[10px] font-mono bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded">
                    {lessonDiscussions.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content Panel */}
          <div className="p-6 md:p-8 flex-1">
            {/* Tab: Overview / Quiz */}
            {playerTab === 'overview' && (
              <div>
                {activeLesson.type === 'quiz' ? (
                  <div className="max-w-3xl space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <div>
                        <h3 className="text-base font-bold text-white">Interactive Assessment</h3>
                        <p className="text-xs text-slate-400">Answer each question to check your mastery.</p>
                      </div>

                      {quizScore !== null && (
                        <div className="text-right">
                          <span className={`text-base font-bold font-mono ${quizScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            Score: {quizScore}%
                          </span>
                          <span className="text-[11px] block text-slate-400">
                            {quizScore >= 70 ? 'Passed & Completed' : 'Needs 70% to pass'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Question List */}
                    <div className="space-y-6">
                      {activeLesson.quizQuestions?.map((q, qIndex) => (
                        <div key={q.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 font-mono text-xs flex items-center justify-center shrink-0">
                              {qIndex + 1}
                            </span>
                            <h4 className="text-sm font-semibold text-slate-200 leading-snug">
                              {q.question}
                            </h4>
                          </div>

                          <div className="space-y-2 pl-9">
                            {q.options.map((option, optIdx) => {
                              const isSelected = selectedAnswers[q.id] === optIdx;
                              const isCorrect = q.correctAnswerIndex === optIdx;

                              let stateClass = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300';
                              if (quizSubmitted) {
                                if (isCorrect) {
                                  stateClass = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                                } else if (isSelected && !isCorrect) {
                                  stateClass = 'bg-rose-950/40 border-rose-500 text-rose-200';
                                }
                              } else if (isSelected) {
                                stateClass = 'bg-indigo-950/50 border-indigo-500 text-indigo-200';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleQuizAnswer(q.id, optIdx)}
                                  disabled={quizSubmitted}
                                  className={`w-full p-3 rounded-lg border text-xs text-left flex items-start gap-2.5 transition-all ${stateClass}`}
                                >
                                  <div className="mt-0.5">
                                    {isSelected ? (
                                      <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                      </div>
                                    ) : (
                                      <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                                    )}
                                  </div>
                                  <span className="leading-relaxed">{option}</span>
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <div className="mt-3 pl-9 pt-3 border-t border-slate-800/80 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg">
                              <span className="font-semibold text-amber-400 block mb-1">
                                Explanation:
                              </span>
                              <p className="leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      {!quizSubmitted ? (
                        <button
                          onClick={handleSubmitQuiz}
                          disabled={Object.keys(selectedAnswers).length === 0}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow transition-colors cursor-pointer"
                        >
                          Submit Quiz Answers
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setQuizSubmitted(false);
                            setSelectedAnswers({});
                            setQuizScore(null);
                          }}
                          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Retake Quiz
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-3xl space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">{activeLesson.title}</h2>
                      <p className="text-xs text-slate-400">
                        {activeModule?.title} · Duration: {activeLesson.durationMinutes} minutes
                      </p>
                    </div>

                    <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed space-y-4">
                      {activeLesson.contentMarkdown ? (
                        <div className="whitespace-pre-line text-xs font-sans">
                          {activeLesson.contentMarkdown}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">
                          Complete the video lesson above to advance your progress in this module.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: AI Chapters & Transcript */}
            {playerTab === 'ai_chapters' && matchingHostedVideo && (
              <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>AI Semantic Chapters & Interactive Transcript</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Generated by Gemini 3.8 Flash · Click any chapter or transcript line to jump playback directly.
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {matchingHostedVideo.resolution} · {matchingHostedVideo.codec}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Left: Chapters */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Lecture Chapters ({matchingHostedVideo.aiMetadata?.chapters?.length || 0})
                    </span>

                    <div className="space-y-2">
                      {matchingHostedVideo.aiMetadata?.chapters?.map((chap, idx) => (
                        <div
                          key={idx}
                          onClick={() => seekTo(chap.timestamp)}
                          className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/60 rounded-xl cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                              <span className="font-mono text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded font-semibold">
                                {Math.floor(chap.timestamp / 60)}:{String(Math.floor(chap.timestamp % 60)).padStart(2, '0')}
                              </span>
                              <span>{chap.title}</span>
                            </span>
                            <Play className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {chap.summary}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Key Takeaways */}
                    {matchingHostedVideo.aiMetadata?.keyTakeaways && (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 mt-4">
                        <span className="text-xs font-bold text-emerald-400 block">
                          Key Pedagogical Takeaways
                        </span>
                        <ul className="space-y-1.5">
                          {matchingHostedVideo.aiMetadata.keyTakeaways.map((takeaway, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right: Verbatim Transcript */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Verbatim Transcript ({matchingHostedVideo.aiMetadata?.speechPacingWpm || 140} wpm)
                    </span>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-[500px] overflow-y-auto space-y-2.5">
                      {matchingHostedVideo.aiMetadata?.transcript?.map((line, idx) => (
                        <div
                          key={idx}
                          onClick={() => seekTo(line.timestamp)}
                          className="p-2.5 rounded-lg border border-slate-800/80 hover:bg-slate-900/80 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] text-indigo-400">
                              {Math.floor(line.timestamp / 60)}:{String(Math.floor(line.timestamp % 60)).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {line.speaker}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {line.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Personal Notes */}
            {playerTab === 'notes' && (
              <div className="max-w-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Lesson Notes</h3>
                    <p className="text-xs text-slate-400">
                      Private personal notes tied to {activeLesson.title}. Auto-saved to your profile.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{noteSavedFeedback ? 'Saved!' : 'Save Notes'}</span>
                  </button>
                </div>

                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record insights, code snippets, architectural trade-offs, or questions here..."
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed"
                />
              </div>
            )}

            {/* Tab: Peer Reviews Feedback */}
            {playerTab === 'peer_reviews' && (
              <PeerReviewFeedbackSection
                course={course}
                activeLesson={activeLesson}
              />
            )}

            {/* Tab: Resources */}
            {playerTab === 'resources' && (
              <div className="max-w-3xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Downloadable Materials</h3>
                  <p className="text-xs text-slate-400">Supplemental code files, architecture whitepapers, and guides.</p>
                </div>

                {activeLesson.resources && activeLesson.resources.length > 0 ? (
                  <div className="space-y-2">
                    {activeLesson.resources.map(res => (
                      <div
                        key={res.id}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-indigo-400" />
                          <div>
                            <span className="text-xs font-semibold text-slate-200 block">{res.name}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{res.type} · {res.fileSize}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            // Trigger dummy file download simulation
                            const blob = new Blob([`// ${res.name}\n// Resource for ${course.title}\n// Instructor: ${course.instructorName}`], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = res.name;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No external files attached to this specific lesson.</p>
                )}
              </div>
            )}

            {/* Tab: Lesson Discussion & Q&A */}
            {playerTab === 'discussion' && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white">Curriculum Q&A Forum</h3>
                  <p className="text-xs text-slate-400">
                    Interact directly with Dr. Vance and fellow enrolled engineers.
                  </p>
                </div>

                {/* Ask Question Form */}
                <form onSubmit={handlePostQuestion} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Ask a Question regarding this lesson
                  </span>
                  <input
                    type="text"
                    value={newQuestionTitle}
                    onChange={(e) => setNewQuestionTitle(e.target.value)}
                    placeholder="Headline summary of your question..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <textarea
                    value={newQuestionBody}
                    onChange={(e) => setNewQuestionBody(e.target.value)}
                    placeholder="Details, edge cases observed, or relevant code snippets..."
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newQuestionTitle.trim() || !newQuestionBody.trim()}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Question</span>
                    </button>
                  </div>
                </form>

                {/* Discussion Thread List */}
                <div className="space-y-4">
                  {lessonDiscussions.length > 0 ? (
                    lessonDiscussions.map(thread => (
                      <div key={thread.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                              <span className="font-semibold text-slate-300">{thread.authorName}</span>
                              <span aria-hidden="true">·</span>
                              <span className="capitalize">{thread.authorRole}</span>
                              <span aria-hidden="true">·</span>
                              <span>{thread.createdAt}</span>
                              {thread.isPinned && (
                                <span className="text-amber-400 text-[10px] uppercase font-mono">Pinned</span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-white">{thread.title}</h4>
                          </div>

                          {thread.isAnswered && (
                            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 whitespace-nowrap">
                              ✓ Answered
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg">
                          {thread.content}
                        </p>

                        {/* Replies */}
                        {thread.replies.length > 0 && (
                          <div className="pl-4 border-l-2 border-slate-800 space-y-3 mt-3">
                            {thread.replies.map(reply => (
                              <div key={reply.id} className="text-xs space-y-1">
                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                  <span className="font-semibold text-slate-200">{reply.authorName}</span>
                                  {reply.isInstructorEndorsed && (
                                    <span className="text-indigo-400 text-[10px] font-mono bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-500/30">
                                      Instructor Reply
                                    </span>
                                  )}
                                  <span aria-hidden="true">·</span>
                                  <span>{reply.createdAt}</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg">
                                  {reply.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Form */}
                        <div className="pt-2 flex gap-2">
                          <input
                            type="text"
                            value={replyInputByThread[thread.id] || ''}
                            onChange={(e) => setReplyInputByThread(prev => ({ ...prev, [thread.id]: e.target.value }))}
                            placeholder="Add a reply to this thread..."
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => handlePostReply(thread.id)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold whitespace-nowrap"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 py-4 text-center">
                      No questions asked yet for this lesson. Be the first to start the discussion!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Course Curriculum Drawer */}
        <aside className="w-full lg:w-80 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Course Curriculum
            </h3>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
              {course.modules.length} Modules · {totalLessons} Lessons
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
            {course.modules.map((mod, modIdx) => (
              <div key={mod.id} className="py-2">
                <div className="px-4 py-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide block">
                    {mod.title}
                  </span>
                </div>

                <div className="space-y-0.5 px-2">
                  {mod.lessons.map(lesson => {
                    const isActive = lesson.id === activeLessonId;
                    const isDone = completedIds.includes(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLessonId(lesson.id)}
                        className={`w-full px-3 py-2.5 rounded-lg text-left flex items-start justify-between gap-2.5 text-xs transition-colors ${
                          isActive
                            ? 'bg-indigo-600/20 text-white font-medium border border-indigo-500/40'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : isActive ? (
                              <PlayCircle className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600" />
                            )}
                          </div>
                          <div>
                            <span className="block leading-snug">{lesson.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                              {lesson.type} · {lesson.durationMinutes}m
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Certificate Modal */}
      {showCertificateModal && enrollment && (
        <CertificateModal
          course={course}
          enrollment={enrollment}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
};
