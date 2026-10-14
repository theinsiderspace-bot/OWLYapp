import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { Course, MeetSessionType } from '../types/lms';
import { 
  DollarSign, 
  Percent, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Video, 
  Users, 
  Check, 
  Calendar, 
  Info, 
  CreditCard,
  Plus,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface EducatorLectureFeeManagerProps {
  courses: Course[];
  onOpenScheduleMeet?: () => void;
  onEditCourse?: (course: Course) => void;
}

export const EducatorLectureFeeManager: React.FC<EducatorLectureFeeManagerProps> = ({
  courses,
  onOpenScheduleMeet,
  onEditCourse
}) => {
  const { 
    currentUser, 
    educatorBilling, 
    updateEducatorBilling, 
    setEducatorLectureFee,
    googleMeetSessions,
    requestPayout,
    payouts
  } = useLms();

  // Local state for fee editing
  const [defaultFee, setDefaultFee] = useState<number>(educatorBilling.defaultLectureFee ?? 75);
  const [sessionFees, setSessionFees] = useState<Record<MeetSessionType, number>>({
    live_lecture: educatorBilling.lectureFeesBySessionType?.live_lecture ?? 75,
    code_review: educatorBilling.lectureFeesBySessionType?.code_review ?? 95,
    office_hours: educatorBilling.lectureFeesBySessionType?.office_hours ?? 45,
    workshop: educatorBilling.lectureFeesBySessionType?.workshop ?? 120,
    ama: educatorBilling.lectureFeesBySessionType?.ama ?? 35
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'configure' | 'courses' | 'sessions' | 'payouts'>('configure');

  // Interactive calculator state
  const [calcFee, setCalcFee] = useState<number>(defaultFee);
  const [calcAttendees, setCalcAttendees] = useState<number>(25);

  // Financial calculations with strict 30% system retention
  const SYSTEM_RETENTION_RATE = 0.30;
  const EDUCATOR_NET_RATE = 0.70;

  const calcGross = calcFee * calcAttendees;
  const calcSystemRetained = calcGross * SYSTEM_RETENTION_RATE;
  const calcEducatorTakeHome = calcGross * EDUCATOR_NET_RATE;

  // Preset quick buttons
  const feePresets = [35, 50, 75, 100, 150, 200];

  const handleSaveFees = (e: React.FormEvent) => {
    e.preventDefault();
    updateEducatorBilling({
      defaultLectureFee: defaultFee,
      lectureFeesBySessionType: sessionFees,
      royaltyPercentage: 70,
      systemRetentionPercentage: 30
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSessionFeeChange = (type: MeetSessionType, val: number) => {
    const clean = Math.max(0, val);
    setSessionFees(prev => ({ ...prev, [type]: clean }));
    setEducatorLectureFee(clean, type);
  };

  // Compute lifetime financial metrics from courses
  const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0);
  const totalGrossRevenue = courses.reduce((sum, c) => sum + (c.studentCount * c.price), 0);
  const totalSystemRetained = totalGrossRevenue * SYSTEM_RETENTION_RATE;
  const totalEducatorNet = totalGrossRevenue * EDUCATOR_NET_RATE;

  const totalPaidOut = payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const availablePayout = Math.max(0, totalEducatorNet - totalPaidOut);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <Percent className="w-3 h-3 text-emerald-300" />
                <span>30% System Retention · 70% Educator Split</span>
              </span>
              <span className="text-xs text-slate-300">Monetization & Lecture Pricing Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Lecture Fees & Faculty Monetization
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Set and calibrate your lecture fees for live classrooms, workshops, and recorded curriculum. The platform retains <strong>30%</strong> to deliver high-concurrency video CDN, AI automated chapter indexing, and Google Meet enterprise infrastructure, transferring <strong>70%</strong> directly to your earnings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenScheduleMeet && (
              <button
                onClick={onOpenScheduleMeet}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Live Lecture</span>
              </button>
            )}
            <button
              onClick={() => requestPayout()}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-emerald-300" />
              <span>Request Payout (${availablePayout.toLocaleString()} Avail)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Default Lecture Fee
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums flex items-center gap-1">
            <span>${educatorBilling.defaultLectureFee ?? 75}</span>
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Net: ${((educatorBilling.defaultLectureFee ?? 75) * 0.7).toFixed(2)} (70%)</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Gross Revenue
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ${totalGrossRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{totalStudents.toLocaleString()} total student enrollments</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            System Retained (30%)
          </span>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
            ${totalSystemRetained.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Platform infra, CDN & Meet</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Educator Net Take-Home (70%)
          </span>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            ${totalEducatorNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">${availablePayout.toLocaleString()} available for payout</p>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('configure')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'configure'
              ? 'bg-white border-t border-x border-slate-200 text-emerald-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Lecture Fee Configuration & Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'courses'
              ? 'bg-white border-t border-x border-slate-200 text-emerald-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Course Lectures & Effective Rates ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'sessions'
              ? 'bg-white border-t border-x border-slate-200 text-emerald-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Video className="w-4 h-4 text-rose-500" />
          <span>Live Meet Sessions Schedule ({googleMeetSessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === 'payouts'
              ? 'bg-white border-t border-x border-slate-200 text-emerald-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>Payout History & Direct Deposit</span>
        </button>
      </div>

      {/* TAB 1: Fee Configuration & Interactive Calculator */}
      {activeTab === 'configure' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form to Set Lecture Fees */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <span>Set Standard Lecture Fee</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    This baseline rate applies automatically when you schedule live lectures, office hours, or workshops.
                  </p>
                </div>

                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold font-mono">
                  System Retains 30%
                </span>
              </div>

              <form onSubmit={handleSaveFees} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Standard Base Fee ($ USD per Lecture / Session)
                  </label>
                  <div className="relative max-w-sm">
                    <span className="absolute left-3.5 top-3 text-slate-400 font-mono font-bold">$</span>
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={defaultFee}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setDefaultFee(val);
                        setCalcFee(val);
                      }}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-bold text-lg text-slate-900"
                    />
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
                    {feePresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setDefaultFee(preset);
                          setCalcFee(preset);
                        }}
                        className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition-colors ${
                          defaultFee === preset 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Per-Format Fee Customizer */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Fee Breakdown by Session Format
                    </span>
                    <span className="text-[11px] text-slate-400">Customized per format</span>
                  </div>

                  <div className="space-y-3">
                    {/* Live Lecture */}
                    <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🎙️</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Live Lecture</span>
                          <span className="text-[10px] text-slate-500">Scheduled broadcast with chat</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-[11px]">
                          <span className="text-amber-700 block font-mono">Sys 30%: ${(sessionFees.live_lecture * 0.3).toFixed(2)}</span>
                          <span className="text-emerald-700 font-bold block font-mono">Net 70%: ${(sessionFees.live_lecture * 0.7).toFixed(2)}</span>
                        </div>
                        <div className="relative w-24">
                          <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-xs">$</span>
                          <input
                            type="number"
                            min={0}
                            value={sessionFees.live_lecture}
                            onChange={(e) => handleSessionFeeChange('live_lecture', parseFloat(e.target.value) || 0)}
                            className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-right"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interactive Code Review */}
                    <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">💻</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Code Review Lab</span>
                          <span className="text-[10px] text-slate-500">Architecture & PR evaluation</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-[11px]">
                          <span className="text-amber-700 block font-mono">Sys 30%: ${(sessionFees.code_review * 0.3).toFixed(2)}</span>
                          <span className="text-emerald-700 font-bold block font-mono">Net 70%: ${(sessionFees.code_review * 0.7).toFixed(2)}</span>
                        </div>
                        <div className="relative w-24">
                          <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-xs">$</span>
                          <input
                            type="number"
                            min={0}
                            value={sessionFees.code_review}
                            onChange={(e) => handleSessionFeeChange('code_review', parseFloat(e.target.value) || 0)}
                            className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-right"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hands-on Workshop */}
                    <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🛠️</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Masterclass Workshop</span>
                          <span className="text-[10px] text-slate-500">90-120 min intensive build</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-[11px]">
                          <span className="text-amber-700 block font-mono">Sys 30%: ${(sessionFees.workshop * 0.3).toFixed(2)}</span>
                          <span className="text-emerald-700 font-bold block font-mono">Net 70%: ${(sessionFees.workshop * 0.7).toFixed(2)}</span>
                        </div>
                        <div className="relative w-24">
                          <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-xs">$</span>
                          <input
                            type="number"
                            min={0}
                            value={sessionFees.workshop}
                            onChange={(e) => handleSessionFeeChange('workshop', parseFloat(e.target.value) || 0)}
                            className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-right"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Faculty Office Hours */}
                    <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">☕</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Office Hours</span>
                          <span className="text-[10px] text-slate-500">Open Q&A and consultation</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-[11px]">
                          <span className="text-amber-700 block font-mono">Sys 30%: ${(sessionFees.office_hours * 0.3).toFixed(2)}</span>
                          <span className="text-emerald-700 font-bold block font-mono">Net 70%: ${(sessionFees.office_hours * 0.7).toFixed(2)}</span>
                        </div>
                        <div className="relative w-24">
                          <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-xs">$</span>
                          <input
                            type="number"
                            min={0}
                            value={sessionFees.office_hours}
                            onChange={(e) => handleSessionFeeChange('office_hours', parseFloat(e.target.value) || 0)}
                            className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-right"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {savedSuccess ? (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Lecture fee settings saved to your faculty profile!</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      Changes immediately reflect on newly scheduled lectures and sessions.
                    </span>
                  )}

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Lecture Fees</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Real-Time 30% System Retention Interactive Split Calculator */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <span>Revenue Split Calculator</span>
                </h3>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                  30% / 70% Policy
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Simulated Lecture Admission Fee ($ USD)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={10}
                      max={300}
                      step={5}
                      value={calcFee}
                      onChange={(e) => setCalcFee(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-sm text-slate-900 w-16 text-right">
                      ${calcFee}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Simulated Registered Students
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={200}
                      step={1}
                      value={calcAttendees}
                      onChange={(e) => setCalcAttendees(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-sm text-slate-900 w-16 text-right">
                      {calcAttendees}
                    </span>
                  </div>
                </div>

                {/* Visual Split Graph */}
                <div className="pt-2">
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                    <div 
                      style={{ width: '70%' }} 
                      className="h-full bg-emerald-500 transition-all duration-300" 
                      title="Educator Take-Home: 70%"
                    />
                    <div 
                      style={{ width: '30%' }} 
                      className="h-full bg-amber-500 transition-all duration-300" 
                      title="System Retention: 30%"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 font-medium">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Educator Net (70%): ${calcEducatorTakeHome.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1 text-amber-700">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      System Retained (30%): ${calcSystemRetained.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Gross Lecture Pool ({calcAttendees} students × ${calcFee}):</span>
                    <span className="font-mono font-semibold text-slate-900">${calcGross.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-800">
                    <span>System Retention (Platform Fee 30%):</span>
                    <span className="font-mono font-semibold">-${calcSystemRetained.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                    <span className="font-bold text-emerald-800 text-sm">Your Net Payout (70%):</span>
                    <span className="font-mono font-extrabold text-emerald-600 text-base">
                      +${calcEducatorTakeHome.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanatory Policy Guarantee */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 space-y-2 text-xs text-emerald-950">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Platform System Retention Policy</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  The system retains <strong>30%</strong> of gross lecture tuition fees to fund:
                </p>
                <ul className="text-[11px] text-emerald-800 space-y-1 list-disc pl-4">
                  <li>Global low-latency edge CDN video streaming</li>
                  <li>Server-side AI video transcription & automated chapter indexing</li>
                  <li>Enterprise Google Meet encrypted classrooms</li>
                  <li>Payment processing, fraud prevention & tax compliance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Courses & Effective Per-Lecture Rates */}
      {activeTab === 'courses' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Course Syllabi & Lecture Rate Breakdown</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Effective per-lecture valuation across all published masterclasses with 30% system retention.
              </p>
            </div>

            <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
              {courses.length} Active Courses
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="py-3 px-4">Masterclass Course</th>
                  <th className="py-3 px-3">Tuition Price</th>
                  <th className="py-3 px-3">Total Lectures</th>
                  <th className="py-3 px-3">Effective Lecture Rate</th>
                  <th className="py-3 px-3">Sys Retention (30%)</th>
                  <th className="py-3 px-3">Your Net (70%)</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {courses.map((course) => {
                  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 1;
                  const effectivePerLecture = Math.round((course.price / totalLessons) * 100) / 100;
                  const perLectureSysRetained = Math.round(effectivePerLecture * SYSTEM_RETENTION_RATE * 100) / 100;
                  const perLectureNet = Math.round(effectivePerLecture * EDUCATOR_NET_RATE * 100) / 100;

                  return (
                    <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                        <div>{course.title}</div>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          {course.category} · {course.studentCount} enrolled
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        ${course.price}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {totalLessons} lectures
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        ${effectivePerLecture.toFixed(2)} / lecture
                      </td>
                      <td className="py-3.5 px-3 text-amber-700">
                        -${perLectureSysRetained.toFixed(2)} (30%)
                      </td>
                      <td className="py-3.5 px-3 font-bold text-emerald-600">
                        +${perLectureNet.toFixed(2)} (70%)
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {onEditCourse && (
                          <button
                            onClick={() => onEditCourse(course)}
                            className="px-2.5 py-1 text-[11px] font-sans font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg transition-colors"
                          >
                            Edit Pricing
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Live Meet Sessions Schedule */}
      {activeTab === 'sessions' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-rose-500" />
                <span>Scheduled Live Lectures & Fee Schedule</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Monetization and revenue breakdown per live Google Meet session.
              </p>
            </div>

            {onOpenScheduleMeet && (
              <button
                onClick={onOpenScheduleMeet}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>New Live Lecture</span>
              </button>
            )}
          </div>

          {googleMeetSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {googleMeetSessions.map((session) => {
                const fee = session.lectureFee ?? educatorBilling.defaultLectureFee ?? 75;
                const sysFee = session.systemRetentionFee ?? Math.round(fee * 0.30 * 100) / 100;
                const netEarn = session.educatorNetEarnings ?? Math.round(fee * 0.70 * 100) / 100;

                return (
                  <div key={session.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                          {session.sessionType.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {session.durationMinutes} mins
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{session.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{session.courseTitle}</p>
                    </div>

                    <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 text-xs font-mono space-y-1">
                      <div className="flex justify-between items-center text-slate-700">
                        <span>Admission Fee:</span>
                        <span className="font-bold text-slate-900">${fee} USD</span>
                      </div>
                      <div className="flex justify-between items-center text-amber-700 text-[11px]">
                        <span>System Retention (30%):</span>
                        <span>-${sysFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-700 font-semibold border-t border-slate-100 pt-1 text-[11px]">
                        <span>Educator Net (70%):</span>
                        <span>+${netEarn.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>{session.attendeeCount} registered students</span>
                      <span className="font-semibold text-emerald-700">
                        Net: ${(session.attendeeCount * netEarn).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <Video className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm">No live Google Meet lectures scheduled yet.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Payout History & Direct Deposit */}
      {activeTab === 'payouts' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Direct Deposit & Payout History</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Net earnings transferred via Stripe Direct Deposit (Routing: 021000021 · Account: •••• {educatorBilling.payoutAccountLast4}).
              </p>
            </div>

            <button
              onClick={() => requestPayout()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
            >
              <CreditCard className="w-4 h-4" />
              <span>Withdraw Net Balance</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="py-3 px-4">Payout ID</th>
                  <th className="py-3 px-3">Date Requested</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Transferred Amount (70% Net)</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{payout.id}</td>
                    <td className="py-3.5 px-3 text-slate-600 font-sans">
                      {new Date(payout.requestedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-sans">
                      {payout.method} ({payout.accountReference})
                    </td>
                    <td className="py-3.5 px-3 font-bold text-emerald-600">
                      ${payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {payout.currency}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {payout.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
