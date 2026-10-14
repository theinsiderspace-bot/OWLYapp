import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { GoogleMeetSession, Course } from '../types/lms';
import { GoogleMeetScheduleModal } from './GoogleMeetScheduleModal';
import { 
  Video, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  Radio, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  Share2,
  Tv,
  DollarSign
} from 'lucide-react';

interface GoogleMeetEducatorViewProps {
  courses: Course[];
}

export const GoogleMeetEducatorView: React.FC<GoogleMeetEducatorViewProps> = ({ courses }) => {
  const { 
    currentUser, 
    googleMeetSessions, 
    deleteMeetSession, 
    updateMeetSessionStatus,
    createMeetSession,
    isGoogleConnected,
    connectGoogle,
    disconnectGoogle,
    googleAuthUser
  } = useLms();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'live' | 'completed'>('all');
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  
  // Mandatory confirmation dialog state for destructive action (Workspace API guideline)
  const [sessionToDelete, setSessionToDelete] = useState<GoogleMeetSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Instant room creation state
  const [isCreatingInstant, setIsCreatingInstant] = useState(false);

  const filteredSessions = googleMeetSessions.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const handleCopyInvite = (session: GoogleMeetSession) => {
    const text = `Join Google Meet with ${session.instructorName}:
Title: ${session.title}
Course: ${session.courseTitle}
When: ${new Date(session.scheduledAt).toLocaleString()} (${session.durationMinutes} mins)
Google Meet Link: ${session.meetUrl}
Meeting Code: ${session.meetCode}`;

    navigator.clipboard.writeText(text);
    setCopiedSessionId(session.id);
    setTimeout(() => setCopiedSessionId(null), 2500);
  };

  const handleInstantRoom = async () => {
    setIsCreatingInstant(true);
    try {
      const selectedCourse = courses[0];
      const newSession = await createMeetSession({
        title: `Instant Faculty Office Hours · ${currentUser?.name || 'Faculty'}`,
        courseId: selectedCourse?.id || 'course-1',
        courseTitle: selectedCourse?.title || 'Distributed Systems Architecture',
        instructorId: currentUser?.id || 'faculty-1',
        instructorName: currentUser?.name || 'Faculty Member',
        sessionType: 'office_hours',
        scheduledAt: new Date().toISOString(),
        durationMinutes: 45,
        meetUrl: '',
        meetCode: '',
        status: 'live',
        maxAttendees: 50,
        description: 'Ad-hoc live Q&A room opened by instructor.',
        isRecorded: true
      });
      // Launch meeting link
      if (newSession.meetUrl) {
        window.open(newSession.meetUrl, '_blank', 'noopener,noreferrer');
      }
    } finally {
      setIsCreatingInstant(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    try {
      await deleteMeetSession(sessionToDelete.id);
      setSessionToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectGoogle();
    } finally {
      setIsConnecting(false);
    }
  };

  // Metrics
  const totalLiveMinutes = googleMeetSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalAttendees = googleMeetSessions.reduce((sum, s) => sum + s.attendeeCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-600/20">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-indigo-700 font-semibold">
                  Virtual Classroom Hub
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Google Meet & Calendar
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Google Meet Video Classrooms & Office Hours
              </h2>
              <p className="text-xs text-slate-500">
                Host live video lectures, interactive code review labs, and scheduled 1-on-1 office hours
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleInstantRoom}
              disabled={isCreatingInstant}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              <Radio className={`w-3.5 h-3.5 text-rose-400 ${isCreatingInstant ? 'animate-pulse' : ''}`} />
              <span>{isCreatingInstant ? 'Launching...' : 'Start Instant Meet'}</span>
            </button>

            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Class</span>
            </button>
          </div>
        </div>

        {/* Google Workspace Account Connection Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {isGoogleConnected ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-emerald-800 font-medium bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Connected as {googleAuthUser?.email || currentUser?.email || 'Educator'}</span>
              </div>
              <span className="text-slate-400 hidden md:inline">Calendar API & Meet spaces auto-synced</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold text-slate-900">Google Workspace:</span>
              <span>Connect your Google account to automatically invite students and sync calendar invites.</span>
            </div>
          )}

          <div>
            {isGoogleConnected ? (
              <button
                onClick={disconnectGoogle}
                className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
              >
                Disconnect Google Account
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 text-xs transition-colors whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isConnecting ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Sessions
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {googleMeetSessions.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Live lectures & workshops</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Upcoming Scheduled
          </span>
          <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums">
            {googleMeetSessions.filter(s => s.status === 'scheduled').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active on student calendars</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Delivered Minutes
          </span>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            {totalLiveMinutes}m
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Video airtime with students</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Enrolled Attendees
          </span>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums">
            {totalAttendees}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Engaged across all cohorts</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Sessions ({googleMeetSessions.length})
        </button>
        <button
          onClick={() => setFilter('scheduled')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'scheduled' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Scheduled ({googleMeetSessions.filter(s => s.status === 'scheduled').length})
        </button>
        <button
          onClick={() => setFilter('live')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'live' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🔴 Live Now ({googleMeetSessions.filter(s => s.status === 'live').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'completed' ? 'bg-slate-200 text-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Completed ({googleMeetSessions.filter(s => s.status === 'completed').length})
        </button>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSessions.map((session) => {
            const isLive = session.status === 'live';
            const isScheduled = session.status === 'scheduled';
            const isCopied = copiedSessionId === session.id;

            return (
              <div 
                key={session.id} 
                className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                  isLive ? 'border-rose-400 ring-2 ring-rose-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Status & Format */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isLive && (
                        <span className="font-mono text-[10px] uppercase font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-rose-600" />
                          <span>Live Now</span>
                        </span>
                      )}
                      {isScheduled && (
                        <span className="font-mono text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                          Scheduled
                        </span>
                      )}
                      {session.status === 'completed' && (
                        <span className="font-mono text-[10px] uppercase font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      )}

                      <span className="text-[11px] font-medium text-slate-500 capitalize">
                        {session.sessionType.replace('_', ' ')}
                      </span>
                    </div>

                    <button
                      onClick={() => setSessionToDelete(session)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Cancel / Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Course */}
                  <div>
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {session.title}
                    </h4>
                    <span className="text-xs text-indigo-600 font-semibold block mt-0.5">
                      {session.courseTitle}
                    </span>
                  </div>

                  {/* Time & Capacity Metadata */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(session.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{session.durationMinutes} minutes</span>
                    </div>
                  </div>

                  {/* Description */}
                  {session.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {session.description}
                    </p>
                  )}

                  {/* Lecture Fee & 30% System Retention Breakdown */}
                  {session.lectureFee !== undefined && session.lectureFee > 0 ? (
                    <div className="flex items-center justify-between text-xs bg-emerald-50/80 border border-emerald-200/80 rounded-xl px-3 py-2 text-emerald-950">
                      <div className="flex items-center gap-1.5 font-bold">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Lecture Fee: <strong className="font-mono text-slate-900">${session.lectureFee}</strong></span>
                      </div>
                      <div className="text-[11px] font-mono text-emerald-800">
                        <span className="text-amber-800">Sys (30%): -${((session.systemRetentionFee ?? session.lectureFee * 0.3)).toFixed(2)}</span>
                        <span className="mx-1 text-slate-300">·</span>
                        <span className="text-emerald-700 font-bold">Net (70%): +${((session.educatorNetEarnings ?? session.lectureFee * 0.7)).toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200/70 rounded-xl px-3 py-1.5 text-slate-600">
                      <span>Admission: Free for enrolled masterclass learners</span>
                    </div>
                  )}

                  {/* Google Meet Link Display */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                        M
                      </div>
                      <span className="font-mono text-slate-700 truncate">{session.meetUrl}</span>
                    </div>

                    <button
                      onClick={() => handleCopyInvite(session)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200 flex items-center gap-1 shrink-0 transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-[11px] text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {session.status !== 'completed' && (
                      <button
                        onClick={() => updateMeetSessionStatus(
                          session.id, 
                          session.status === 'live' ? 'completed' : 'live'
                        )}
                        className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        {session.status === 'live' ? 'Mark Ended' : 'Set Live'}
                      </button>
                    )}
                  </div>

                  <a
                    href={session.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                      isLive 
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{isLive ? 'Join Live Room' : 'Open Google Meet'}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Video className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">No Google Meet sessions found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Schedule a live video lecture or start an instant ad-hoc room to collaborate directly with students.
          </p>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule First Class</span>
          </button>
        </div>
      )}

      {/* Schedule Modal */}
      <GoogleMeetScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        courses={courses}
      />

      {/* Mandatory User Confirmation Dialog for Destructive Operation (Workspace Integration Requirement) */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Cancel & Delete Meet Session?</h4>
                <p className="text-xs text-slate-500">Workspace API deletion confirmation</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              Are you sure you want to cancel and delete <span className="font-semibold text-slate-900">"{sessionToDelete.title}"</span>? This will remove the scheduled Google Meet conference link and update the cohort syllabus.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Keep Session
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Cancellation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
