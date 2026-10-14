import React, { useState, useRef, useEffect } from 'react';
import { HostedVideo, RecordingSource } from '../types/lms';
import { useLms } from '../context/LmsContext';
import { StudioVideoPlayerModal } from './StudioVideoPlayerModal';
import { 
  Video, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  Monitor, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Sparkles, 
  Cloud, 
  CloudUpload, 
  CheckCircle, 
  Layers, 
  FileText, 
  Server, 
  Search, 
  Trash2, 
  ExternalLink, 
  Eye, 
  Copy, 
  Check, 
  Upload, 
  Clock, 
  Sliders, 
  Tv, 
  Activity, 
  AlertCircle, 
  BookmarkCheck, 
  ArrowRight,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  Volume2
} from 'lucide-react';

interface VideoStudioProps {
  onBackToCourses?: () => void;
  preselectedCourseId?: string;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({ 
  onBackToCourses,
  preselectedCourseId 
}) => {
  const { 
    currentUser, 
    courses, 
    hostedVideos, 
    storageMetrics, 
    addHostedVideo, 
    deleteHostedVideo, 
    attachVideoToLesson,
    analyzeVideoWithAI,
    generateTeleprompterScript
  } = useLms();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'record' | 'library' | 'script'>('record');

  // ==========================================
  // 1. RECORDING STUDIO STATE
  // ==========================================
  const [recordingMode, setRecordingMode] = useState<RecordingSource>('webcam_mic');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Hardware stream refs
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioVisualizerCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Device state
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [deviceError, setDeviceError] = useState<string | null>(null);

  // Post-recording review state
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [recordedBlobSize, setRecordedBlobSize] = useState<number>(0);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoDescription, setNewVideoDescription] = useState('');
  const [selectedCourseForVideo, setSelectedCourseForVideo] = useState(preselectedCourseId || courses[0]?.id || '');
  const [selectedLessonForVideo, setSelectedLessonForVideo] = useState('');
  const [isUploadingToCDN, setIsUploadingToCDN] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [autoRunAI, setAutoRunAI] = useState(true);

  // ==========================================
  // 2. LIVE TELEPROMPTER STATE
  // ==========================================
  const [teleprompterOpen, setTeleprompterOpen] = useState(true);
  const [teleprompterScrollActive, setTeleprompterScrollActive] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(2); // 1 - 5
  const [teleprompterFontSize, setTeleprompterFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [teleprompterText, setTeleprompterText] = useState(
    `[Welcome learners · Look straight into camera]\n\nHello everyone! Welcome back to this hands-on engineering masterclass.\n\n[Pause for emphasis · 2s]\n\nToday we are analyzing our core architectural invariants. Notice how our state replication handles high concurrency without split-brain conditions.\n\n[Switch screen to terminal/code demo]\n\nLet's walk through the implementation code line by line...`
  );
  const teleprompterScrollBoxRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // 3. AI SCRIPT GENERATOR WORKSHOP STATE
  // ==========================================
  const [scriptTopic, setScriptTopic] = useState('Distributed Consensus and Leader Leases');
  const [scriptDuration, setScriptDuration] = useState(5);
  const [scriptTone, setScriptTone] = useState('Technical Masterclass');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedScriptResult, setGeneratedScriptResult] = useState<{ topic: string; scriptText: string; bulletPoints: string[] } | null>(null);

  // ==========================================
  // 4. CLOUD LIBRARY FILTER & MODAL STATE
  // ==========================================
  const [searchFilter, setSearchFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [inspectingVideo, setInspectingVideo] = useState<HostedVideo | null>(null);
  const [attachModalVideo, setAttachModalVideo] = useState<HostedVideo | null>(null);
  const [targetAttachCourse, setTargetAttachCourse] = useState(courses[0]?.id || '');
  const [targetAttachLesson, setTargetAttachLesson] = useState('');
  const [analyzingVideoId, setAnalyzingVideoId] = useState<string | null>(null);
  const [copiedStreamId, setCopiedStreamId] = useState<string | null>(null);

  // Initialize camera stream when entering recording mode
  useEffect(() => {
    if (activeTab === 'record' && !recordedBlobUrl) {
      startMediaPreview();
    } else {
      stopMediaTracks();
    }
    return () => {
      stopMediaTracks();
    };
  }, [activeTab, recordingMode]);

  // Audio level visualizer loop
  useEffect(() => {
    let animId: number;
    const canvas = audioVisualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (analyserRef.current && micActive) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / 16) - 2;
        let x = 0;

        for (let i = 0; i < 16; i++) {
          const val = dataArray[i * 2] || 0;
          const percent = val / 255;
          const barHeight = Math.max(4, percent * canvas.height);

          // Color gradient from green to yellow to red
          if (percent > 0.8) {
            ctx.fillStyle = '#ef4444';
          } else if (percent > 0.5) {
            ctx.fillStyle = '#f59e0b';
          } else {
            ctx.fillStyle = '#10b981';
          }

          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 2;
        }
      } else {
        // Flat line or simulated low pulse when recording is live
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (isRecording) {
          ctx.fillStyle = '#10b981';
          for (let i = 0; i < 16; i++) {
            const h = Math.random() * 12 + 4;
            ctx.fillRect(i * 10, canvas.height - h, 8, h);
          }
        }
      }
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [micActive, isRecording]);

  // Teleprompter auto-scroller loop
  useEffect(() => {
    let scrollTimer: any;
    if (teleprompterScrollActive && teleprompterScrollBoxRef.current) {
      scrollTimer = setInterval(() => {
        if (teleprompterScrollBoxRef.current) {
          teleprompterScrollBoxRef.current.scrollTop += teleprompterSpeed * 0.75;
        }
      }, 50);
    }
    return () => clearInterval(scrollTimer);
  }, [teleprompterScrollActive, teleprompterSpeed]);

  // Recording duration timer
  useEffect(() => {
    let timer: any;
    if (isRecording && !isPaused) {
      timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording, isPaused]);

  // Media Stream Helpers
  const stopMediaTracks = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(t => t.stop());
      activeStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const startMediaPreview = async () => {
    stopMediaTracks();
    setDeviceError(null);

    try {
      if (recordingMode === 'screen_mic') {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        screenStreamRef.current = screenStream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = screenStream;
        }
      } else {
        // webcam_mic or picture_in_picture
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: true
        });
        activeStreamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }

        // Setup audio visualizer
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyserRef.current = analyser;
          }
        } catch (audioErr) {
          console.warn('AudioContext visualization setup warning:', audioErr);
        }
      }
    } catch (err: any) {
      console.warn('Media capture warning (running in browser sandbox):', err);
      setDeviceError('Browser permission request closed or denied. You can still test video recording and use our AI Studio features with simulation mode.');
    }
  };

  const triggerStartRecording = () => {
    setCountdown(3);
    const countInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countInterval);
          executeStartRecording();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const executeStartRecording = () => {
    setRecordingDuration(0);
    recordedChunksRef.current = [];
    const streamToRecord = activeStreamRef.current || screenStreamRef.current;

    if (streamToRecord && typeof MediaRecorder !== 'undefined') {
      try {
        const recorder = new MediaRecorder(streamToRecord, {
          mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
            ? 'video/webm;codecs=vp9,opus'
            : 'video/webm'
        });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedBlobUrl(url);
          setRecordedBlobSize(blob.size || 14500000);
          setNewVideoTitle(`Lecture: ${new Date().toLocaleDateString()} Masterclass Session`);
          setNewVideoDescription(`High-resolution studio lecture recording covering system invariants and production implementation.`);
        };

        recorder.start(1000); // 1s slice
        mediaRecorderRef.current = recorder;
      } catch (e) {
        console.warn('MediaRecorder error, will generate simulation blob on stop:', e);
      }
    }

    setIsRecording(true);
    setIsPaused(false);
    setTeleprompterScrollActive(true);
  };

  const handlePauseResume = () => {
    if (!isRecording) return;
    if (isPaused) {
      mediaRecorderRef.current?.resume?.();
      setIsPaused(false);
      setTeleprompterScrollActive(true);
    } else {
      mediaRecorderRef.current?.pause?.();
      setIsPaused(true);
      setTeleprompterScrollActive(false);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setTeleprompterScrollActive(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Fallback if hardware recorder was not available: use standard educational preview video
      const simulatedUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      setRecordedBlobUrl(simulatedUrl);
      setRecordedBlobSize(24800000);
      setNewVideoTitle(`Lecture: ${new Date().toLocaleDateString()} Masterclass Session`);
      setNewVideoDescription(`High-resolution studio recording covering system invariants and production implementation.`);
    }

    stopMediaTracks();
  };

  const handleDiscardRecording = () => {
    if (recordedBlobUrl && recordedBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(recordedBlobUrl);
    }
    setRecordedBlobUrl(null);
    setRecordedBlobSize(0);
    setUploadProgress(0);
    setIsUploadingToCDN(false);
    startMediaPreview();
  };

  const handleSaveAndUploadCDN = async () => {
    if (!newVideoTitle.trim()) return;
    setIsUploadingToCDN(true);
    setUploadProgress(10);

    // Simulate multi-bitrate HLS encoding and edge CDN distribution
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          finishVideoUpload();
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const finishVideoUpload = async () => {
    const matchedCourse = courses.find(c => c.id === selectedCourseForVideo);
    let matchedLessonTitle = '';
    if (matchedCourse && selectedLessonForVideo) {
      for (const m of matchedCourse.modules) {
        const l = m.lessons.find(less => less.id === selectedLessonForVideo);
        if (l) {
          matchedLessonTitle = l.title;
          break;
        }
      }
    }

    const videoId = `video-host-${Date.now()}`;
    const newHostedVideo: HostedVideo = {
      id: videoId,
      title: newVideoTitle.trim(),
      description: newVideoDescription.trim() || 'Studio recorded lecture.',
      courseId: selectedCourseForVideo || undefined,
      courseTitle: matchedCourse?.title || undefined,
      lessonId: selectedLessonForVideo || undefined,
      lessonTitle: matchedLessonTitle || undefined,
      videoUrl: recordedBlobUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      durationSeconds: Math.max(60, recordingDuration || 240),
      fileSizeBytes: recordedBlobSize || 18500000,
      resolution: '1080p',
      codec: 'H.264 / AAC (Edge HLS)',
      bitrateMbps: 14.5,
      status: autoRunAI ? 'processing_ai' : 'ready',
      recordedAt: new Date().toISOString(),
      recordingSource: recordingMode,
      storageTier: 'Edge CDN Multi-Region',
      cdnEndpoint: `https://cdn.aetheria.academy/streams/hls/${videoId}/master.m3u8`,
      aiMetadata: {
        summary: `Studio lecture on ${newVideoTitle.trim()} detailing architecture specifications and practical implementation.`,
        chapters: [
          { timestamp: 0, title: '00:00 - Introduction & Concept Overview', summary: 'Orientation, problem context, and design goals.' },
          { timestamp: 60, title: '01:00 - Live Code & System Implementation', summary: 'Demonstrating implementation patterns and component interaction.' },
          { timestamp: 180, title: '03:00 - Production Hardening & Q&A Summary', summary: 'Edge cases and failure mitigation.' }
        ],
        transcript: [
          { timestamp: 0, speaker: currentUser?.name || 'Instructor', text: `Welcome everyone to this lesson on ${newVideoTitle.trim()}. Today we walk through the core architecture step by step.` },
          { timestamp: 60, speaker: currentUser?.name || 'Instructor', text: 'Look at the interface contract on the screen. Notice how we decouple the write path from the read replicas.' },
          { timestamp: 180, speaker: currentUser?.name || 'Instructor', text: 'Remember to verify your unit tests and complete the comprehension evaluation below.' }
        ],
        keyTakeaways: [
          'Deconstruct monolithic flows into idempotent sub-steps',
          'Enforce strict type-safety across distributed boundaries',
          'Validate telemetry before deploying updates to production'
        ],
        suggestedQuiz: [
          {
            id: `q-${Date.now()}-1`,
            question: `What is the primary design requirement emphasized in "${newVideoTitle.trim()}"?`,
            options: [
              'Idempotency and decoupled asynchronous processing',
              'Eliminating all security checks for higher speed',
              'Storing passwords in plain text',
              'Disabling database backups'
            ],
            correctAnswerIndex: 0,
            explanation: 'Idempotent processing guarantees that retrying an operation does not lead to duplicated state mutations.'
          }
        ],
        speechPacingWpm: 142,
        clarityScore: 95,
        tags: ['Studio Recording', 'Engineering', 'Production']
      }
    };

    // 1. Add to hosted video library
    addHostedVideo(newHostedVideo);

    // 2. Attach to course lesson if chosen
    if (selectedCourseForVideo && selectedLessonForVideo) {
      attachVideoToLesson(videoId, selectedCourseForVideo, selectedLessonForVideo);
    }

    // 3. Trigger Gemini AI analysis in background if enabled
    if (autoRunAI) {
      analyzeVideoWithAI(videoId, newVideoTitle);
    }

    setIsUploadingToCDN(false);
    setRecordedBlobUrl(null);
    setActiveTab('library');
  };

  // AI Script Generator Handlers
  const handleGenerateScript = async () => {
    if (!scriptTopic.trim()) return;
    setIsGeneratingScript(true);
    try {
      const result = await generateTeleprompterScript(scriptTopic.trim(), scriptDuration, scriptTone);
      setGeneratedScriptResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleLoadScriptToTeleprompter = (script: string) => {
    setTeleprompterText(script);
    setActiveTab('record');
    setTeleprompterOpen(true);
  };

  const handleCopyStream = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedStreamId(id);
    setTimeout(() => setCopiedStreamId(null), 2000);
  };

  const handleTriggerAttachModal = (video: HostedVideo) => {
    setAttachModalVideo(video);
    setTargetAttachCourse(video.courseId || courses[0]?.id || '');
    setTargetAttachLesson(video.lessonId || '');
  };

  const handleConfirmAttach = () => {
    if (!attachModalVideo || !targetAttachCourse || !targetAttachLesson) return;
    attachVideoToLesson(attachModalVideo.id, targetAttachCourse, targetAttachLesson);
    setAttachModalVideo(null);
  };

  const formatSeconds = (total: number) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredVideos = hostedVideos.filter(v => {
    const matchSearch = v.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.courseTitle?.toLowerCase().includes(searchFilter.toLowerCase());
    const matchCourse = courseFilter === 'all' || v.courseId === courseFilter;
    return matchSearch && matchCourse;
  });

  return (
    <div className="space-y-6">
      
      {/* Studio Header & Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-sm">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase tracking-wider text-indigo-700 font-semibold">
                Educator Production Suite
              </span>
              <span className="text-slate-300">·</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Cloud className="w-3 h-3 text-emerald-600" />
                Edge CDN Enabled
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              AI Video Studio & Cloud Hosting
            </h2>
            <p className="text-xs text-slate-600">
              Record live 4K/1080p lectures with teleprompter HUD, auto-generate timestamped chapters, and stream via multi-region edge CDN.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('record')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'record'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-rose-500" />
            <span>Record Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'library'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-indigo-500" />
            <span>Cloud Library ({hostedVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'script'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Script Workshop</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE RECORDING STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'record' && (
        <div className="space-y-6">
          {/* Hardware notice if permission closed */}
          {deviceError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 text-xs flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Camera / Screen Permissions Notice</span>
                <p className="text-amber-800 mt-0.5 leading-relaxed">{deviceError}</p>
              </div>
            </div>
          )}

          {/* If video has just been recorded and is waiting for review/upload */}
          {recordedBlobUrl ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Recording Completed ({formatSeconds(recordingDuration)})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Review your capture below, configure metadata, and publish to the Aetheria Edge CDN.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDiscardRecording}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 border border-slate-200 rounded-lg hover:border-rose-300 transition-colors"
                  >
                    Discard & Re-record
                  </button>
                </div>
              </div>

              {/* Video Preview & Upload Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Preview Player (7 cols) */}
                <div className="lg:col-span-7 bg-black rounded-xl overflow-hidden aspect-video border border-slate-800 shadow-inner flex items-center justify-center">
                  <video
                    src={recordedBlobUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Right Metadata & Publish settings (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Video Lecture Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      placeholder="e.g. Distributed Consensus: Implementing Raft"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Lecture Description
                    </label>
                    <textarea
                      rows={2}
                      value={newVideoDescription}
                      onChange={(e) => setNewVideoDescription(e.target.value)}
                      placeholder="Summary of topics covered..."
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Bind to Course & Lesson */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
                      Attach Directly to Course Syllabus (Optional)
                    </span>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Select Target Course
                      </label>
                      <select
                        value={selectedCourseForVideo}
                        onChange={(e) => {
                          setSelectedCourseForVideo(e.target.value);
                          setSelectedLessonForVideo('');
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Do Not Attach Yet (Keep in Cloud Library) --</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    {selectedCourseForVideo && (
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Select Module Lesson
                        </label>
                        <select
                          value={selectedLessonForVideo}
                          onChange={(e) => setSelectedLessonForVideo(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">-- Choose Module Lesson --</option>
                          {courses.find(c => c.id === selectedCourseForVideo)?.modules.flatMap(m => m.lessons).map(l => (
                            <option key={l.id} value={l.id}>{l.title} ({l.durationMinutes}m)</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* AI Copilot Checkbox */}
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRunAI}
                      onChange={(e) => setAutoRunAI(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-indigo-950 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Run Gemini AI Analysis & Chaptering
                      </span>
                      <p className="text-indigo-800 text-[11px] mt-0.5 leading-relaxed">
                        Generates timestamped chapters, verbatim transcription, key takeaways, and a 3-question evaluation quiz automatically.
                      </p>
                    </div>
                  </label>

                  {/* Upload Progress Bar if processing */}
                  {isUploadingToCDN && (
                    <div className="space-y-1.5 animate-in fade-in">
                      <div className="flex justify-between text-[11px] font-mono text-slate-600">
                        <span>Transcoding HLS multi-bitrate streams...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${uploadProgress}%` }}
                          className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    disabled={isUploadingToCDN || !newVideoTitle.trim()}
                    onClick={handleSaveAndUploadCDN}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    {isUploadingToCDN ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Deploying to Multi-Region CDN...</span>
                      </>
                    ) : (
                      <>
                        <CloudUpload className="w-4 h-4" />
                        <span>Transcode & Publish to Cloud CDN</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Live Recording Viewport and Controls */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Viewport & Controls (8 Cols) */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Mode Selector Strip */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">Capture Mode:</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                      <button
                        disabled={isRecording}
                        onClick={() => setRecordingMode('webcam_mic')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                          recordingMode === 'webcam_mic' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Camera Only</span>
                      </button>

                      <button
                        disabled={isRecording}
                        onClick={() => setRecordingMode('screen_mic')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                          recordingMode === 'screen_mic' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Screen Share</span>
                      </button>

                      <button
                        disabled={isRecording}
                        onClick={() => setRecordingMode('picture_in_picture')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                          recordingMode === 'picture_in_picture' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>Picture-in-Picture</span>
                      </button>
                    </div>
                  </div>

                  {/* Audio visualizer display */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                      <Mic className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mic Level:</span>
                    </div>
                    <canvas
                      ref={audioVisualizerCanvasRef}
                      width={130}
                      height={18}
                      className="bg-slate-900 rounded border border-slate-700"
                    />
                  </div>
                </div>

                {/* Main Video Capture Viewport */}
                <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-video border border-slate-800 shadow-2xl flex items-center justify-center">
                  
                  {/* Camera / Screen stream preview */}
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* Picture-in-picture floating avatar overlay simulation */}
                  {recordingMode === 'picture_in_picture' && (
                    <div className="absolute bottom-4 right-4 w-32 h-32 rounded-2xl overflow-hidden border-2 border-indigo-400/80 shadow-2xl bg-slate-900/90 z-20 flex items-center justify-center">
                      <div className="text-center p-2">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold mx-auto flex items-center justify-center text-sm shadow">
                          {currentUser?.avatarText || 'IN'}
                        </div>
                        <span className="text-[10px] font-semibold text-white mt-1 block truncate">
                          {currentUser?.name || 'Instructor'}
                        </span>
                        <span className="text-[9px] text-emerald-400 font-mono">1080p PiP Active</span>
                      </div>
                    </div>
                  )}

                  {/* 3-2-1 Countdown Overlay */}
                  {countdown !== null && (
                    <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-40 backdrop-blur-sm">
                      <div className="text-center animate-bounce">
                        <div className="text-7xl font-mono font-extrabold text-white">
                          {countdown}
                        </div>
                        <p className="text-xs uppercase tracking-widest text-indigo-400 mt-2 font-mono">
                          Studio Recording Starting...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Top HUD: Status & Recording Indicator */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between z-30 pointer-events-none">
                    <div className="flex items-center gap-2">
                      {isRecording ? (
                        <div className="px-3 py-1 rounded-full bg-rose-600/90 backdrop-blur text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg animate-pulse">
                          <span className="w-2.5 h-2.5 rounded-full bg-white" />
                          <span>REC {formatSeconds(recordingDuration)}</span>
                          {isPaused && <span className="text-amber-200 uppercase text-[10px]">[PAUSED]</span>}
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur text-slate-300 text-xs font-mono border border-slate-700/80 flex items-center gap-2 shadow">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Studio Standby · 1080p60 WebM</span>
                        </div>
                      )}
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur text-slate-300 text-[10px] font-mono border border-slate-700/80">
                      H.264 Hardware Acceleration
                    </div>
                  </div>

                  {/* Floating Teleprompter HUD when enabled */}
                  {teleprompterOpen && (
                    <div className="absolute top-16 inset-x-8 max-h-48 bg-slate-950/85 backdrop-blur-md rounded-xl p-3 border border-indigo-500/40 shadow-2xl z-20 flex flex-col justify-between transition-all">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px] text-slate-400">
                        <span className="font-semibold text-indigo-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Live Presenter Teleprompter HUD
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span>Speed: {teleprompterSpeed}x</span>
                          <button
                            onClick={() => setTeleprompterScrollActive(!teleprompterScrollActive)}
                            className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-semibold"
                          >
                            {teleprompterScrollActive ? 'Pause Scroll' : 'Auto Scroll'}
                          </button>
                        </div>
                      </div>

                      <div
                        ref={teleprompterScrollBoxRef}
                        className={`overflow-y-auto max-h-32 text-amber-200 leading-relaxed font-sans pr-2 select-none ${
                          teleprompterFontSize === 'sm' ? 'text-xs' :
                          teleprompterFontSize === 'base' ? 'text-sm' :
                          teleprompterFontSize === 'lg' ? 'text-base font-medium' : 'text-lg font-bold'
                        }`}
                      >
                        {teleprompterText}
                      </div>
                    </div>
                  )}

                  {/* Bottom Studio Controls Overlay */}
                  <div className="absolute bottom-4 inset-x-4 flex items-center justify-center gap-3 z-30">
                    {!isRecording ? (
                      <button
                        onClick={triggerStartRecording}
                        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full text-xs flex items-center gap-2 shadow-2xl hover:scale-105 transition-all"
                      >
                        <div className="w-3 h-3 rounded-full bg-white" />
                        <span>Start Studio Recording</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur p-1.5 rounded-full border border-slate-700 shadow-2xl">
                        <button
                          onClick={handlePauseResume}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
                          <span>{isPaused ? 'Resume' : 'Pause'}</span>
                        </button>

                        <button
                          onClick={handleStopRecording}
                          className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-bold flex items-center gap-2 shadow-md hover:scale-105 transition-all"
                        >
                          <Square className="w-3.5 h-3.5 fill-white" />
                          <span>Stop & Review Capture</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Studio Hardware Toolbar */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCameraActive(!cameraActive)}
                      className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition-colors ${
                        cameraActive ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}
                    >
                      {cameraActive ? <Camera className="w-3.5 h-3.5 text-slate-600" /> : <CameraOff className="w-3.5 h-3.5 text-rose-600" />}
                      <span>{cameraActive ? 'Camera ON' : 'Camera OFF'}</span>
                    </button>

                    <button
                      onClick={() => setMicActive(!micActive)}
                      className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition-colors ${
                        micActive ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}
                    >
                      {micActive ? <Mic className="w-3.5 h-3.5 text-slate-600" /> : <MicOff className="w-3.5 h-3.5 text-rose-600" />}
                      <span>{micActive ? 'Mic ON' : 'Mic MUTED'}</span>
                    </button>

                    <button
                      onClick={() => setTeleprompterOpen(!teleprompterOpen)}
                      className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition-colors ${
                        teleprompterOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{teleprompterOpen ? 'Teleprompter ON' : 'Teleprompter OFF'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Edge Transcoder 1080p60 Active</span>
                  </div>
                </div>

              </div>

              {/* Right Sidebar: Teleprompter Controls & Script Quick Access (4 Cols) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Teleprompter Tuning Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Teleprompter HUD Controls
                    </span>
                    <button
                      onClick={() => setActiveTab('script')}
                      className="text-[11px] text-indigo-600 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <span>AI Script Generator</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Auto-scroll Speed */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Scroll Speed</span>
                      <span className="font-mono text-indigo-600 font-bold">{teleprompterSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={teleprompterSpeed}
                      onChange={(e) => setTeleprompterSpeed(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Font Size */}
                  <div>
                    <span className="text-xs font-medium text-slate-700 block mb-1">
                      HUD Font Size
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['sm', 'base', 'lg', 'xl'] as const).map(size => (
                        <button
                          key={size}
                          onClick={() => setTeleprompterFontSize(size)}
                          className={`py-1 text-xs font-mono rounded-lg border transition-colors ${
                            teleprompterFontSize === size
                              ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {size.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Script Textarea */}
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Current Teleprompter Script
                    </label>
                    <textarea
                      rows={7}
                      value={teleprompterText}
                      onChange={(e) => setTeleprompterText(e.target.value)}
                      placeholder="Type or paste your spoken-word lecture script here..."
                      className="w-full p-2.5 text-xs font-sans border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed text-slate-800"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (teleprompterScrollBoxRef.current) {
                          teleprompterScrollBoxRef.current.scrollTop = 0;
                        }
                      }}
                      className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Scroll to Top</span>
                    </button>
                  </div>
                </div>

                {/* Quick Script Inspiration Card */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4.5 text-xs space-y-2">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Educator Pro Tip: Stage Cues
                  </span>
                  <p className="text-indigo-900 leading-relaxed text-[11px]">
                    Include stage cues inside brackets like <code className="bg-white/80 px-1 py-0.5 rounded text-indigo-700 font-mono">[Look into camera]</code> or <code className="bg-white/80 px-1 py-0.5 rounded text-indigo-700 font-mono">[Switch to code]</code>. The teleprompter displays them cleanly so your delivery stays natural and engaging.
                  </p>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CLOUD VIDEO HOSTING LIBRARY */}
      {/* ========================================================================= */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          
          {/* Quota & CDN Bandwidth Strip */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Cloud Storage Quota
              </span>
              <div className="text-xl font-bold font-mono text-slate-900">
                {(storageMetrics.usedBytes / (1024 * 1024 * 1024)).toFixed(1)} GB / {(storageMetrics.totalBytes / (1024 * 1024 * 1024)).toFixed(0)} GB
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                <div 
                  style={{ width: `${(storageMetrics.usedBytes / storageMetrics.totalBytes) * 100}%` }}
                  className="h-full bg-indigo-600 rounded-full"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                CDN Bandwidth This Month
              </span>
              <div className="text-xl font-bold font-mono text-emerald-600">
                {storageMetrics.bandwidthUsedGb.toLocaleString()} GB / {storageMetrics.totalBandwidthGb.toLocaleString()} GB
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Multi-region edge streaming</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Total Hosted Videos
              </span>
              <div className="text-xl font-bold font-mono text-slate-900">
                {hostedVideos.length} Masterclasses
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Ready for student playback</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Global Edge POPs
              </span>
              <div className="text-xl font-bold font-mono text-cyan-600 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-cyan-600" />
                <span>{storageMetrics.edgeLocationsActive} Locations</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Ultra-low latency worldwide</p>
            </div>
          </div>

          {/* Search, Filter & Quick Upload Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search hosted videos, transcripts, or courses..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Course Filter */}
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Courses ({courses.length})</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setActiveTab('record')}
              className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-sm"
            >
              <Camera className="w-4 h-4" />
              <span>Record New in Studio</span>
            </button>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map(video => (
              <div
                key={video.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Video Thumbnail with duration overlay */}
                  <div className="relative aspect-video bg-black overflow-hidden group">
                    <img
                      src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Duration pill */}
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur text-white font-mono text-[10px] font-bold">
                      {formatSeconds(video.durationSeconds)}
                    </span>

                    {/* Resolution badge */}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-indigo-900/80 backdrop-blur text-indigo-200 border border-indigo-400/30 font-mono text-[10px] font-bold">
                      {video.resolution}
                    </span>

                    {/* Play Hover Overlay */}
                    <button
                      onClick={() => setInspectingVideo(video)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </button>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono">{new Date(video.recordedAt).toLocaleDateString()}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Edge Ready
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors">
                      {video.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>

                    {/* Bound Course / Lesson pill */}
                    <div className="pt-1">
                      {video.courseTitle ? (
                        <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-center justify-between">
                          <span className="truncate max-w-[190px]">
                            <span className="font-semibold block truncate">{video.courseTitle}</span>
                            <span className="text-indigo-600 text-[10px] block truncate">{video.lessonTitle || 'Lesson'}</span>
                          </span>
                          <BookmarkCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                          <span>Unattached Cloud Asset</span>
                          <button
                            onClick={() => handleTriggerAttachModal(video)}
                            className="text-indigo-600 hover:underline font-semibold"
                          >
                            Attach to Lesson
                          </button>
                        </div>
                      )}
                    </div>

                    {/* AI Chapter Count & Quiz Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold flex items-center gap-1">
                        <Layers className="w-3 h-3 text-amber-600" />
                        {video.aiMetadata?.chapters?.length || 0} Chapters
                      </span>

                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-emerald-600" />
                        {video.aiMetadata?.suggestedQuiz?.length || 0} Questions
                      </span>

                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {(video.fileSizeBytes / (1024 * 1024)).toFixed(0)} MB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons Footer */}
                <div className="p-4 pt-0 border-t border-slate-100 grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => setInspectingVideo(video)}
                    className="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Watch & AI Quiz</span>
                  </button>

                  <button
                    onClick={() => handleCopyStream(video.id, video.cdnEndpoint)}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedStreamId === video.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied HLS</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Stream</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <Cloud className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No hosted videos found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No videos match your current filter. Record a lecture in the studio to populate your CDN library.
              </p>
              <button
                onClick={() => setActiveTab('record')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
              >
                Open Studio Recorder
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AI SCRIPT WORKSHOP & TELEPROMPTER WRITER */}
      {/* ========================================================================= */}
      {activeTab === 'script' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Form: Topic & Configuration (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  AI Lecture Scriptwriter
                </h3>
                <p className="text-xs text-slate-500">
                  Powered by Gemini 3.8 Flash for EdTech presenters
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Lecture Topic or Objective <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={scriptTopic}
                onChange={(e) => setScriptTopic(e.target.value)}
                placeholder="e.g. Memory Alignment & Zero-Copy Deserialization"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Target Duration
                </label>
                <select
                  value={scriptDuration}
                  onChange={(e) => setScriptDuration(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={3}>3 Minutes (Quick Tip)</option>
                  <option value={5}>5 Minutes (Core Concept)</option>
                  <option value={10}>10 Minutes (Full Deep Dive)</option>
                  <option value={15}>15 Minutes (Masterclass)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Presentation Tone
                </label>
                <select
                  value={scriptTone}
                  onChange={(e) => setScriptTone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Technical Masterclass">Technical Masterclass</option>
                  <option value="Code Walkthrough">Code Walkthrough</option>
                  <option value="Conceptual Deep Dive">Conceptual Deep Dive</option>
                  <option value="Interactive Sandbox">Interactive Sandbox</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                disabled={isGeneratingScript || !scriptTopic.trim()}
                onClick={handleGenerateScript}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {isGeneratingScript ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Writing Spoken Lecture Script...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Teleprompter Script with AI</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-800 block mb-0.5">What Gemini formats:</span>
              Includes spoken presenter cadence, hook introduction, stage delivery cues in brackets (<code className="text-indigo-600 font-mono">[Pause]</code>, <code className="text-indigo-600 font-mono">[Switch code]</code>), and recap call to action.
            </div>
          </div>

          {/* Right Script Editor / Output (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                Script Preview & Stage Prompts
              </span>

              {generatedScriptResult && (
                <button
                  onClick={() => handleLoadScriptToTeleprompter(generatedScriptResult.scriptText)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Send to Live Teleprompter HUD</span>
                </button>
              )}
            </div>

            {generatedScriptResult ? (
              <div className="space-y-4">
                {/* Key Outline Bullets */}
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5">
                  <span className="text-[11px] font-bold text-amber-900 block mb-1">
                    Key Lecture Objectives:
                  </span>
                  <ul className="space-y-1">
                    {generatedScriptResult.bulletPoints.map((b, i) => (
                      <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Script Display */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Spoken Script with Presenter Cues
                  </label>
                  <textarea
                    rows={12}
                    value={generatedScriptResult.scriptText}
                    onChange={(e) => setGeneratedScriptResult({ ...generatedScriptResult, scriptText: e.target.value })}
                    className="w-full p-3 font-sans text-xs border border-slate-200 rounded-xl leading-relaxed text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    Estimated speaking time: ~{generatedScriptResult.scriptText.split(/\s+/).length} words ({Math.round(generatedScriptResult.scriptText.split(/\s+/).length / 140)} mins)
                  </span>
                  <button
                    onClick={() => handleLoadScriptToTeleprompter(generatedScriptResult.scriptText)}
                    className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Load into Live Studio & Record</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs">
                  Fill in your lecture topic on the left and click "Generate Teleprompter Script with AI" to construct a professional lecture outline.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ATTACH TO LESSON MODAL */}
      {/* ========================================================================= */}
      {attachModalVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                Attach Video to Course Lesson
              </h3>
              <button onClick={() => setAttachModalVideo(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Select which course module and lesson to link with: <strong className="text-slate-900">{attachModalVideo.title}</strong>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Course</label>
                <select
                  value={targetAttachCourse}
                  onChange={(e) => {
                    setTargetAttachCourse(e.target.value);
                    setTargetAttachLesson('');
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Module Lesson</label>
                <select
                  value={targetAttachLesson}
                  onChange={(e) => setTargetAttachLesson(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Module Lesson --</option>
                  {courses.find(c => c.id === targetAttachCourse)?.modules.flatMap(m => m.lessons).map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setAttachModalVideo(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={!targetAttachLesson}
                onClick={handleConfirmAttach}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Confirm & Bind to Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INSPECT VIDEO PLAYER MODAL */}
      {/* ========================================================================= */}
      {inspectingVideo && (
        <StudioVideoPlayerModal
          video={inspectingVideo}
          onClose={() => setInspectingVideo(null)}
          onAttachToLesson={(vid) => {
            setInspectingVideo(null);
            handleTriggerAttachModal(vid);
          }}
        />
      )}

    </div>
  );
};
