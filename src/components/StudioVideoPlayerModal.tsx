import React, { useState, useRef, useEffect } from 'react';
import { HostedVideo, QuizQuestion } from '../types/lms';
import { useLms } from '../context/LmsContext';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Sparkles, 
  Clock, 
  FileText, 
  HelpCircle, 
  Server, 
  CheckCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers, 
  Share2,
  BookmarkCheck,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';

interface StudioVideoPlayerModalProps {
  video: HostedVideo;
  onClose: () => void;
  onAttachToLesson?: (video: HostedVideo) => void;
}

export const StudioVideoPlayerModal: React.FC<StudioVideoPlayerModalProps> = ({
  video,
  onClose,
  onAttachToLesson
}) => {
  const { courses } = useLms();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.durationSeconds || 180);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'chapters' | 'transcript' | 'quiz' | 'insights' | 'cdn'>('chapters');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState(video.resolution || '1080p');

  // Quiz evaluation state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekTo = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    setCurrentTime(seconds);
    if (!isPlaying) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeekOffset = (delta: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
    seekTo(target);
  };

  const handleCopyCDN = () => {
    navigator.clipboard.writeText(video.cdnEndpoint || video.videoUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const boundCourse = courses.find(c => c.id === video.courseId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95">
        
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              {video.resolution} {video.codec}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">
                {video.title}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {boundCourse ? `Bound to: ${boundCourse.title} · ${video.lessonTitle || 'Lesson'}` : 'Unattached Cloud Video Asset'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onAttachToLesson && (
              <button
                onClick={() => onAttachToLesson(video)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Attach to Lesson</span>
              </button>
            )}
            <button
              onClick={handleCopyCDN}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied HLS' : 'Copy CDN'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Viewport & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-hidden">
          
          {/* Main Video Viewport (7 Cols) */}
          <div className="lg:col-span-7 bg-black flex flex-col justify-between overflow-hidden relative border-r border-slate-800">
            <div className="relative w-full aspect-video flex-1 max-h-[58vh] flex items-center justify-center bg-black">
              <video
                ref={videoRef}
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                    setDuration(videoRef.current.duration || video.durationSeconds || 180);
                  }
                }}
                onEnded={() => setIsPlaying(false)}
                playsInline
              />

              {/* Center Play Overlay when paused */}
              {!isPlaying && (
                <div 
                  onClick={togglePlay}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity"
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all">
                    <Play className="w-7 h-7 fill-white ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls Bar */}
            <div className="bg-slate-950 p-3 flex flex-col gap-2 border-t border-slate-800">
              {/* Scrub line with Chapter markers */}
              <div className="relative w-full flex items-center">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 z-10"
                />

                {/* Chapter marker dots */}
                {video.aiMetadata?.chapters?.map((chap, idx) => {
                  const pct = Math.min(100, (chap.timestamp / (duration || 1)) * 100);
                  return (
                    <div
                      key={idx}
                      title={`${chap.title} (${formatTime(chap.timestamp)})`}
                      onClick={() => seekTo(chap.timestamp)}
                      style={{ left: `${pct}%` }}
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 hover:scale-150 transition-transform cursor-pointer z-20 -ml-1 border border-black shadow"
                    />
                  );
                })}
              </div>

              {/* Controls Footer */}
              <div className="flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="p-1 hover:text-indigo-400">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button onClick={() => handleSeekOffset(-10)} title="Rewind 10s" className="p-1 hover:text-indigo-400">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleSeekOffset(10)} title="Forward 10s" className="p-1 hover:text-indigo-400">
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
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Resolution Selector */}
                  <div className="flex items-center gap-1 text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                    {['4K', '1080p', '720p'].map(res => (
                      <button
                        key={res}
                        onClick={() => setSelectedResolution(res as any)}
                        className={`px-1 rounded ${selectedResolution === res ? 'text-indigo-400 font-bold' : 'hover:text-white'}`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>

                  {/* Playback speed selector */}
                  <div className="flex items-center gap-1 text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                    {[0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <button
                        key={rate}
                        onClick={() => setPlaybackRate(rate)}
                        className={`px-1 rounded ${playbackRate === rate ? 'text-indigo-400 font-bold' : 'hover:text-white'}`}
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

            {/* Video Meta bar under player */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  CDN Transcoded · Edge Ready
                </span>
                <span className="text-[11px] text-slate-400">
                  Size: {(video.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB · Bitrate: {video.bitrateMbps} Mbps
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] text-slate-400">
                  Recorded: {new Date(video.recordedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {video.description}
              </p>
            </div>
          </div>

          {/* Right AI & Metadata Panel (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900 flex flex-col min-h-0 overflow-hidden">
            {/* Tabs Bar */}
            <div className="flex items-center border-b border-slate-800 px-3 bg-slate-950 overflow-x-auto">
              <button
                onClick={() => setActiveTab('chapters')}
                className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'chapters'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Chapters ({video.aiMetadata?.chapters?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('transcript')}
                className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'transcript'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Transcript</span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'quiz'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quiz ({video.aiMetadata?.suggestedQuiz?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('insights')}
                className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'insights'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Insights</span>
              </button>

              <button
                onClick={() => setActiveTab('cdn')}
                className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'cdn'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>CDN Specs</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              
              {/* TAB 1: Chapters */}
              {activeTab === 'chapters' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Click any chapter to jump the player:</span>
                    <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      Gemini Auto-Detected
                    </span>
                  </div>

                  <div className="space-y-2">
                    {video.aiMetadata?.chapters?.map((chap, idx) => {
                      const isCurrent = currentTime >= chap.timestamp && 
                        (idx === (video.aiMetadata.chapters.length - 1) || currentTime < video.aiMetadata.chapters[idx + 1].timestamp);

                      return (
                        <div
                          key={idx}
                          onClick={() => seekTo(chap.timestamp)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isCurrent
                              ? 'bg-indigo-950/60 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/30'
                              : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-slate-700 text-amber-400 font-semibold">
                                {formatTime(chap.timestamp)}
                              </span>
                              <span>{chap.title}</span>
                            </span>
                            {isCurrent && (
                              <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                                <Activity className="w-3 h-3 animate-pulse" /> Playing
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {chap.summary}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: Transcript */}
              {activeTab === 'transcript' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-white block mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Gemini High-Fidelity Speech-to-Text Transcription
                    </span>
                    Clicking on any spoken sentence seeks video playback directly to that phrase.
                  </div>

                  <div className="space-y-2">
                    {video.aiMetadata?.transcript?.map((line, idx) => {
                      const isLineActive = currentTime >= line.timestamp && 
                        (idx === (video.aiMetadata.transcript.length - 1) || currentTime < video.aiMetadata.transcript[idx + 1].timestamp);

                      return (
                        <div
                          key={idx}
                          onClick={() => seekTo(line.timestamp)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isLineActive
                              ? 'bg-indigo-950/60 border-indigo-500/80 text-white font-medium'
                              : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] text-indigo-400">
                              {formatTime(line.timestamp)}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {line.speaker}
                            </span>
                          </div>
                          <p className="leading-relaxed">
                            {line.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: Quiz Comprehension Evaluation */}
              {activeTab === 'quiz' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-xs text-slate-300">
                    <span className="font-semibold text-white block mb-1 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      AI Comprehension Evaluation Questions
                    </span>
                    These evaluation questions were automatically extracted from this video lecture. You can test them below or attach them to a course module quiz.
                  </div>

                  {video.aiMetadata?.suggestedQuiz?.map((q, qIdx) => (
                    <div key={q.id || qIdx} className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-bold shrink-0">
                          Q{qIdx + 1}
                        </span>
                        <p className="text-xs font-semibold text-white leading-relaxed">
                          {q.question}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = quizAnswers[q.id] === optIdx;
                          const isCorrect = q.correctAnswerIndex === optIdx;
                          let btnStyle = 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600';
                          if (quizSubmitted) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-indigo-950/60 border-indigo-500 text-indigo-200 font-medium';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={quizSubmitted}
                              onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                          <span className="font-semibold text-indigo-300 block mb-0.5">Explanation:</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-2">
                    {!quizSubmitted ? (
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors"
                      >
                        Evaluate Quiz Answers
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setQuizAnswers({});
                        }}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
                      >
                        Reset Quiz Attempt
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: AI Insights */}
              {activeTab === 'insights' && (
                <div className="space-y-4">
                  {/* Pacing & Clarity Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Speech Pacing
                      </span>
                      <div className="text-xl font-bold font-mono text-white flex items-center gap-1.5">
                        <span>{video.aiMetadata?.speechPacingWpm || 142}</span>
                        <span className="text-xs text-slate-400 font-normal">wpm</span>
                      </div>
                      <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Optimal lecture speed
                      </p>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Clarity Score
                      </span>
                      <div className="text-xl font-bold font-mono text-indigo-400">
                        {video.aiMetadata?.clarityScore || 95}%
                      </div>
                      <p className="text-[10px] text-indigo-300 mt-1">
                        Pedagogical effectiveness rating
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 space-y-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      Executive Summary
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {video.aiMetadata?.summary}
                    </p>
                  </div>

                  {/* Key Takeaways */}
                  <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      Key Learning Takeaways
                    </span>
                    <ul className="space-y-1.5">
                      {video.aiMetadata?.keyTakeaways?.map((takeaway, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Semantic Tags */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Topic Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {video.aiMetadata?.tags?.map((tag, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CDN Technical Specs */}
              {activeTab === 'cdn' && (
                <div className="space-y-3">
                  <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-cyan-400" />
                      Cloud Storage & Streaming Architecture
                    </span>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">CDN Storage Tier</span>
                        <span className="font-mono text-white">{video.storageTier}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">HLS Master Stream URL</span>
                        <span className="font-mono text-cyan-400 truncate max-w-xs">{video.cdnEndpoint}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">Encoding Bitrate</span>
                        <span className="font-mono text-white">{video.bitrateMbps} Mbps Variable Bitrate</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">Video & Audio Codec</span>
                        <span className="font-mono text-white">{video.codec}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">Target Delivery Protocol</span>
                        <span className="font-mono text-white">Apple HLS & MPEG-DASH Chunked Stream</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-700/60">
                        <span className="text-slate-400">Cache Invalidation</span>
                        <span className="font-mono text-emerald-400">Active · 48 Edge POPs Worldwide</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyCDN}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy HLS Master Playlist URL</span>
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
