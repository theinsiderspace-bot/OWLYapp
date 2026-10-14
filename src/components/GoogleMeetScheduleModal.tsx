import React, { useState } from 'react';
import { Course, MeetSessionType } from '../types/lms';
import { useLms } from '../context/LmsContext';
import { 
  X, 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Sparkles, 
  Check, 
  Radio, 
  BookOpen, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

interface GoogleMeetScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  defaultCourseId?: string;
}

export const GoogleMeetScheduleModal: React.FC<GoogleMeetScheduleModalProps> = ({
  isOpen,
  onClose,
  courses,
  defaultCourseId
}) => {
  const { currentUser, createMeetSession, isGoogleConnected, connectGoogle } = useLms();

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(defaultCourseId || courses[0]?.id || '');
  const [sessionType, setSessionType] = useState<MeetSessionType>('live_lecture');
  
  // Default to 1 hour from now formatted for datetime-local input
  const defaultDateStr = () => {
    const d = new Date(Date.now() + 3600 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  const [scheduledAt, setScheduledAt] = useState(defaultDateStr);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [maxAttendees, setMaxAttendees] = useState(100);
  const [description, setDescription] = useState('');
  const [isRecorded, setIsRecorded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

    setIsSubmitting(true);
    try {
      const selectedCourse = courses.find(c => c.id === courseId);
      await createMeetSession({
        title: title.trim(),
        courseId,
        courseTitle: selectedCourse?.title || 'Masterclass',
        instructorId: currentUser?.id || 'faculty-1',
        instructorName: currentUser?.name || 'Faculty Member',
        sessionType,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes,
        meetUrl: '',
        meetCode: '',
        status: 'scheduled',
        maxAttendees,
        description: description.trim() || `Live ${sessionType.replace('_', ' ')} with ${currentUser?.name || 'Instructor'}.`,
        isRecorded
      });
      onClose();
    } catch (err) {
      console.error('Failed to schedule Google Meet session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    try {
      await connectGoogle();
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Schedule Google Meet Class</span>
                <span className="font-mono text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Workspace API
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Launch interactive video lectures and office hours with enrolled students
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Google Workspace Connection Banner */}
        <div className="px-6 pt-5">
          {isGoogleConnected ? (
            <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-900 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-emerald-950">Google Workspace Connected:</span> Real-time Google Calendar sync and Meet space provisioning active.
                </div>
              </div>
              <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-medium">
                Live API Ready
              </span>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-indigo-50/90 via-slate-50 to-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0 mt-0.5 sm:mt-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Sign in with Google:</span> Connect your educator Google Calendar to automatically invite student emails and sync event agendas.
                </div>
              </div>
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={isConnectingGoogle}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 text-xs transition-colors whitespace-nowrap self-end sm:self-auto"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isConnectingGoogle ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Session Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Live Deep Dive: Raft Consensus Log Replication & Split-Brain"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Course Association & Session Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Associated Masterclass <span className="text-rose-500">*</span>
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Session Format
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as MeetSessionType)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                <option value="live_lecture">🎙️ Live Lecture (Broadcast + Chat)</option>
                <option value="office_hours">☕ Faculty Office Hours (Open Mic)</option>
                <option value="code_review">💻 Interactive Code Review Lab</option>
                <option value="workshop">🛠️ Hands-on Architecture Workshop</option>
                <option value="ama">❓ Student AMA / Capstone Defense</option>
              </select>
            </div>
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Date & Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins (1 hr)</option>
                <option value={90}>90 mins (1.5 hrs)</option>
                <option value={120}>120 mins (2 hrs)</option>
              </select>
            </div>
          </div>

          {/* Description & Agenda */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Agenda & Preparation Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline topics to be covered, prerequisites for the live session, and any GitHub repos students should clone beforehand..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Options */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Record Session to Google Drive</span>
                <span className="text-slate-500">Video replay will be automatically archived into course lesson modules.</span>
              </div>
              <input
                type="checkbox"
                checked={isRecorded}
                onChange={(e) => setIsRecorded(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Broadcast to Enrolled Cohort</span>
                <span className="text-slate-500">Auto-publishes an announcement to all students enrolled in this course.</span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                Enabled
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Video className="w-4 h-4" />
              <span>{isSubmitting ? 'Generating Meet Room...' : 'Create Google Meet Session'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
