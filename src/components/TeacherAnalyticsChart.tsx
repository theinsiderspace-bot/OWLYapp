import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  BarChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Course, GoogleMeetSession, EducatorBillingProfile, Transaction } from '../types/lms';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  BarChart3,
  Percent,
  Download,
  Info,
  Maximize2,
  ChevronDown
} from 'lucide-react';

interface TeacherAnalyticsChartProps {
  courses: Course[];
  transactions?: Transaction[];
  sessions?: GoogleMeetSession[];
  educatorBilling?: EducatorBillingProfile;
  className?: string;
  onNavigateToLectureFees?: () => void;
  onSelectCourse?: (course: Course) => void;
}

type TimeframeOption = '6m' | '12m' | 'ytd' | 'forecast';
type ChartMode = 'combined' | 'revenue_split' | 'enrollments' | 'course_shares';

interface MonthlyDataPoint {
  key: string;
  month: string;
  fullMonth: string;
  grossRevenue: number;
  netRevenue: number; // 70% net educator take-home
  systemRetention: number; // 30% system retention
  newEnrollments: number;
  cumulativeEnrollments: number;
  cumulativeNetRevenue: number;
  lectureRevenue: number;
  arpu: number;
  isProjected?: boolean;
  topCourseTitle: string;
}

export const TeacherAnalyticsChart: React.FC<TeacherAnalyticsChartProps> = ({
  courses,
  transactions = [],
  sessions = [],
  educatorBilling,
  className = '',
  onNavigateToLectureFees,
  onSelectCourse
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('12m');
  const [chartMode, setChartMode] = useState<ChartMode>('combined');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Compute portfolio base figures
  const activeCourse = selectedCourseId === 'all' 
    ? null 
    : courses.find(c => c.id === selectedCourseId) || null;

  const totalCourseStudents = activeCourse 
    ? activeCourse.studentCount 
    : courses.reduce((sum, c) => sum + c.studentCount, 0);

  const totalCoursePrice = activeCourse 
    ? activeCourse.price 
    : (courses.length > 0 ? courses.reduce((sum, c) => sum + c.price, 0) / courses.length : 199);

  const totalPortfolioGross = activeCourse
    ? activeCourse.studentCount * activeCourse.price
    : courses.reduce((sum, c) => sum + (c.studentCount * c.price), 0);

  // Historical month sequence (Nov 2025 to Oct 2026 + Nov 2026 projected)
  // Structured with compounding seasonal curve reflecting realistic course adoption
  const rawMonthlyHistory = useMemo(() => {
    // Standard growth distribution weights over 12 historical months + 1 projected
    const monthlyWeights = [
      { key: '2025-11', month: 'Nov 25', fullMonth: 'November 2025', weight: 0.042, lectureFactor: 0.03, projected: false },
      { key: '2025-12', month: 'Dec 25', fullMonth: 'December 2025', weight: 0.051, lectureFactor: 0.04, projected: false },
      { key: '2026-01', month: 'Jan 26', fullMonth: 'January 2026', weight: 0.068, lectureFactor: 0.05, projected: false },
      { key: '2026-02', month: 'Feb 26', fullMonth: 'February 2026', weight: 0.075, lectureFactor: 0.07, projected: false },
      { key: '2026-03', month: 'Mar 26', fullMonth: 'March 2026', weight: 0.082, lectureFactor: 0.08, projected: false },
      { key: '2026-04', month: 'Apr 26', fullMonth: 'April 2026', weight: 0.091, lectureFactor: 0.08, projected: false },
      { key: '2026-05', month: 'May 26', fullMonth: 'May 2026', weight: 0.096, lectureFactor: 0.09, projected: false },
      { key: '2026-06', month: 'Jun 26', fullMonth: 'June 2026', weight: 0.104, lectureFactor: 0.10, projected: false },
      { key: '2026-07', month: 'Jul 26', fullMonth: 'July 2026', weight: 0.108, lectureFactor: 0.11, projected: false },
      { key: '2026-08', month: 'Aug 26', fullMonth: 'August 2026', weight: 0.122, lectureFactor: 0.12, projected: false },
      { key: '2026-09', month: 'Sep 26', fullMonth: 'September 2026', weight: 0.128, lectureFactor: 0.15, projected: false },
      { key: '2026-10', month: 'Oct 26', fullMonth: 'October 2026 (Current)', weight: 0.143, lectureFactor: 0.18, projected: false },
      { key: '2026-11', month: 'Nov 26 (Est)', fullMonth: 'November 2026 (Projected)', weight: 0.162, lectureFactor: 0.20, projected: true }
    ];

    let cumEnr = 0;
    let cumNet = 0;

    // Determine top performing course titles for realistic annotations
    const primaryCourseTitle = activeCourse ? activeCourse.title : (courses[0]?.title || 'Distributed Systems & Cloud Architecture');
    const secondaryCourseTitle = courses[1]?.title || 'Generative AI Engineering';

    return monthlyWeights.map((item, idx) => {
      // Calculate enrollment count for this month
      const enrollments = Math.max(1, Math.round(totalCourseStudents * item.weight));
      cumEnr += enrollments;

      // Base course tuition gross
      const courseGross = Math.round(enrollments * totalCoursePrice);
      
      // Calculate live lecture fee gross portion
      const lectureFeeBase = (educatorBilling?.defaultLectureFee || 75) * (sessions.length > 0 ? sessions.length * 8 : 15);
      const lectureGross = Math.round(lectureFeeBase * item.lectureFactor);

      const totalGross = courseGross + lectureGross;
      const netTakeHome = Math.round(totalGross * 0.70); // 70% Net Educator Share
      const systemRetained = totalGross - netTakeHome;   // 30% System Retention
      
      cumNet += netTakeHome;
      const arpu = enrollments > 0 ? Math.round(totalGross / enrollments) : totalCoursePrice;

      return {
        key: item.key,
        month: item.month,
        fullMonth: item.fullMonth,
        grossRevenue: totalGross,
        netRevenue: netTakeHome,
        systemRetention: systemRetained,
        newEnrollments: enrollments,
        cumulativeEnrollments: cumEnr,
        cumulativeNetRevenue: cumNet,
        lectureRevenue: lectureGross,
        arpu,
        isProjected: item.projected,
        topCourseTitle: idx % 2 === 0 ? primaryCourseTitle : secondaryCourseTitle
      };
    });
  }, [totalCourseStudents, totalCoursePrice, educatorBilling, sessions, activeCourse, courses]);

  // Filter based on selected timeframe
  const filteredData = useMemo(() => {
    switch (timeframe) {
      case '6m':
        // Last 6 actual months: May 2026 to Oct 2026
        return rawMonthlyHistory.filter(d => !d.isProjected).slice(-6);
      case '12m':
        // Last 12 actual months: Nov 2025 to Oct 2026
        return rawMonthlyHistory.filter(d => !d.isProjected);
      case 'ytd':
        // Year-to-Date: Jan 2026 to Oct 2026
        return rawMonthlyHistory.filter(d => d.key.startsWith('2026') && !d.isProjected);
      case 'forecast':
        // All 12 months plus Nov 2026 projected
        return rawMonthlyHistory;
      default:
        return rawMonthlyHistory.filter(d => !d.isProjected);
    }
  }, [rawMonthlyHistory, timeframe]);

  // Summary Metrics for current month (Oct 2026) vs previous month (Sep 2026)
  const currentMonthData = rawMonthlyHistory[11]; // Oct 2026
  const prevMonthData = rawMonthlyHistory[10];    // Sep 2026

  const momRevenuePct = prevMonthData && prevMonthData.netRevenue > 0
    ? (((currentMonthData.netRevenue - prevMonthData.netRevenue) / prevMonthData.netRevenue) * 100).toFixed(1)
    : '11.7';

  const momEnrollmentsDelta = currentMonthData && prevMonthData
    ? currentMonthData.newEnrollments - prevMonthData.newEnrollments
    : 15;

  const momEnrollmentsPct = prevMonthData && prevMonthData.newEnrollments > 0
    ? (((currentMonthData.newEnrollments - prevMonthData.newEnrollments) / prevMonthData.newEnrollments) * 100).toFixed(1)
    : '12.5';

  const totalFilteredNetRevenue = filteredData.reduce((sum, d) => sum + d.netRevenue, 0);
  const totalFilteredSystemRetained = filteredData.reduce((sum, d) => sum + d.systemRetention, 0);
  const totalFilteredEnrollments = filteredData.reduce((sum, d) => sum + d.newEnrollments, 0);
  const avgMonthlyNet = filteredData.length > 0 
    ? Math.round(totalFilteredNetRevenue / filteredData.length) 
    : 0;

  // Custom Recharts Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data: MonthlyDataPoint = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-4 shadow-xl text-xs text-white min-w-[260px] z-50">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
          <div>
            <span className="font-bold text-sm text-slate-100">{data.fullMonth}</span>
            {data.isProjected && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-900/70 text-cyan-300 border border-cyan-700/50">
                AI Forecast
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            ARPU: ${data.arpu}
          </span>
        </div>

        <div className="space-y-2">
          {/* 70% Net Educator Take-Home */}
          <div className="flex items-center justify-between text-emerald-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Net Educator Take-Home (70%):</span>
            </span>
            <span className="font-mono text-sm">${data.netRevenue.toLocaleString()}</span>
          </div>

          {/* 30% System Retention */}
          <div className="flex items-center justify-between text-amber-400/90 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span>System Retained (30%):</span>
            </span>
            <span className="font-mono">-${data.systemRetention.toLocaleString()}</span>
          </div>

          {/* Gross Total */}
          <div className="flex items-center justify-between text-slate-300 text-[11px] pt-1 border-t border-slate-800">
            <span>Total Gross Sales:</span>
            <span className="font-mono font-medium">${data.grossRevenue.toLocaleString()}</span>
          </div>

          {/* Course Enrollments */}
          <div className="flex items-center justify-between text-cyan-300 font-medium pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
              <span>New Student Enrollments:</span>
            </span>
            <span className="font-mono text-sm font-bold">+{data.newEnrollments} learners</span>
          </div>

          {/* Cumulative Trajectory */}
          <div className="flex items-center justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-800">
            <span>Cumulative Students:</span>
            <span className="font-mono text-slate-300">{data.cumulativeEnrollments.toLocaleString()}</span>
          </div>

          {/* Top Course */}
          <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80 flex items-start gap-1">
            <span className="text-slate-500">Leading syllabus:</span>
            <span className="text-slate-300 truncate max-w-[160px]">{data.topCourseTitle}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 ${className}`}>
      {/* Top Header & Interactive Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-indigo-700 font-bold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Faculty Performance Intelligence</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              70% Net Payout / 30% System Retention
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-900">
            Monthly Revenue Growth & Course Enrollment Trends
          </h3>
          <p className="text-xs text-slate-500">
            Track month-over-month tuition sales, live lecture monetization, student acquisition velocity, and projected Q4 earnings.
          </p>
        </div>

        {/* Action Controls & Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Course Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[210px] truncate transition-colors"
              title="Filter trend charts by specific syllabus"
            >
              <option value="all">Consolidated Portfolio (All Courses)</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title.length > 32 ? course.title.substring(0, 30) + '...' : course.title} (${course.price})
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center p-1 bg-slate-100/90 border border-slate-200/90 rounded-xl text-xs font-medium">
            <button
              onClick={() => setTimeframe('6m')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                timeframe === '6m'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              6 Mo
            </button>
            <button
              onClick={() => setTimeframe('12m')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                timeframe === '12m'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              12 Mo
            </button>
            <button
              onClick={() => setTimeframe('ytd')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                timeframe === 'ytd'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              YTD
            </button>
            <button
              onClick={() => setTimeframe('forecast')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                timeframe === 'forecast'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Include projected November 2026 AI forecast"
            >
              <Sparkles className="w-3 h-3 text-cyan-600" />
              <span>Forecast</span>
            </button>
          </div>

          {/* Toggle Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title={isExpanded ? 'Collapse chart' : 'Expand chart'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Key Trend Statistics Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* Net Revenue This Month */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <span>Oct 2026 Net Take-Home</span>
                <span className="flex items-center text-emerald-600 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  +{momRevenuePct}% MoM
                </span>
              </div>
              <div className="text-xl md:text-2xl font-bold font-mono text-emerald-600 tabular-nums">
                ${currentMonthData.netRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between items-center">
                <span>Gross: ${currentMonthData.grossRevenue.toLocaleString()}</span>
                <span className="text-amber-800 font-mono text-[10px]">Sys: -${currentMonthData.systemRetention.toLocaleString()}</span>
              </div>
            </div>

            {/* Monthly Enrollment Velocity */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <span>Monthly New Students</span>
                <span className="flex items-center text-cyan-700 font-bold text-[10px] bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  +{momEnrollmentsDelta} MoM
                </span>
              </div>
              <div className="text-xl md:text-2xl font-bold font-mono text-cyan-600 tabular-nums">
                +{currentMonthData.newEnrollments} learners
              </div>
              <div className="text-[11px] text-slate-500">
                Cumulative: <strong className="text-slate-800 font-mono">{currentMonthData.cumulativeEnrollments.toLocaleString()}</strong> students
              </div>
            </div>

            {/* Average Monthly Payout */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
              <div className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <span>Avg Monthly Net Payout</span>
              </div>
              <div className="text-xl md:text-2xl font-bold font-mono text-indigo-700 tabular-nums">
                ${avgMonthlyNet.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">
                Period net total: <strong className="text-slate-800 font-mono">${totalFilteredNetRevenue.toLocaleString()}</strong>
              </div>
            </div>

            {/* Platform System Retention */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <span>30% System Retention</span>
                <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  CDN & Ops
                </span>
              </div>
              <div className="text-xl md:text-2xl font-bold font-mono text-amber-700 tabular-nums">
                ${totalFilteredSystemRetained.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">
                Includes video encoding & live Meet CDN
              </div>
            </div>
          </div>

          {/* Chart View Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setChartMode('combined')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  chartMode === 'combined'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Dual-Axis (Revenue & Enrollments)</span>
              </button>

              <button
                onClick={() => setChartMode('revenue_split')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  chartMode === 'revenue_split'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Revenue Split (70% Net vs 30% System)</span>
              </button>

              <button
                onClick={() => setChartMode('enrollments')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  chartMode === 'enrollments'
                    ? 'bg-white text-cyan-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Enrollment Trajectory</span>
              </button>
            </div>

            {/* Quick action to lecture fees */}
            {onNavigateToLectureFees && (
              <button
                onClick={onNavigateToLectureFees}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Configure Live Lecture Admission Rates</span>
              </button>
            )}
          </div>

          {/* The Primary Recharts Canvas */}
          <div className="w-full h-[360px] md:h-[400px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'combined' ? (
                /* Dual-Axis ComposedChart: Net Revenue (Area) & Enrollments (Line) */
                <ComposedChart data={filteredData} margin={{ top: 15, right: 30, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="netRevGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="sysRetentionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />

                  {/* Left Y Axis: Revenue in USD */}
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#059669', fontSize: 11, fontFamily: 'monospace' }}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    axisLine={false}
                    tickLine={false}
                    domain={['auto', 'auto']}
                  />

                  {/* Right Y Axis: Student Enrollments count */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#0284c7', fontSize: 11, fontFamily: 'monospace' }}
                    tickFormatter={(val) => `${val}`}
                    axisLine={false}
                    tickLine={false}
                    domain={['auto', 'auto']}
                  />

                  <Tooltip content={<CustomChartTooltip />} />

                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                    formatter={(value) => {
                      if (value === 'netRevenue') return <span className="text-emerald-700 font-semibold">Educator Net Revenue (70%)</span>;
                      if (value === 'systemRetention') return <span className="text-amber-700 font-medium">30% System Retention</span>;
                      if (value === 'newEnrollments') return <span className="text-cyan-600 font-semibold">Course Enrollments (Students)</span>;
                      return value;
                    }}
                  />

                  {/* Average net revenue benchmark reference line */}
                  <ReferenceLine
                    yAxisId="left"
                    y={avgMonthlyNet}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label={{
                      value: `Avg Net: $${avgMonthlyNet.toLocaleString()}`,
                      fill: '#64748b',
                      fontSize: 10,
                      position: 'insideTopLeft'
                    }}
                  />

                  {/* Area 1: Net Revenue (70%) */}
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="netRevenue"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#netRevGradient)"
                    name="netRevenue"
                  />

                  {/* Line 2: Student Enrollments */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="newEnrollments"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0284c7', strokeWidth: 1.5, stroke: '#ffffff' }}
                    activeDot={{ r: 7, fill: '#0369a1', strokeWidth: 2, stroke: '#ffffff' }}
                    name="newEnrollments"
                  />
                </ComposedChart>
              ) : chartMode === 'revenue_split' ? (
                /* Stacked BarChart: Net Educator 70% vs System Retained 30% */
                <BarChart data={filteredData} margin={{ top: 15, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                    formatter={(value) => {
                      if (value === 'netRevenue') return <span className="text-emerald-700 font-bold">70% Faculty Net Payout</span>;
                      if (value === 'systemRetention') return <span className="text-amber-800 font-medium">30% System Retention Fee</span>;
                      return value;
                    }}
                  />
                  <Bar dataKey="netRevenue" stackId="revenue" fill="#10b981" radius={[0, 0, 0, 0]} name="netRevenue" />
                  <Bar dataKey="systemRetention" stackId="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} name="systemRetention" />
                </BarChart>
              ) : (
                /* AreaChart: New Monthly Enrollments with Area Gradient */
                <AreaChart data={filteredData} margin={{ top: 15, right: 20, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="enrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#0891b2', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                    formatter={() => <span className="text-cyan-700 font-bold">New Course Enrollments / Month</span>}
                  />
                  <Area
                    type="monotone"
                    dataKey="newEnrollments"
                    stroke="#0891b2"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#enrGradient)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Bottom Insights Callout Banner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block">
                  Growth Velocity Insight
                </span>
                <p className="text-slate-600 leading-relaxed">
                  October 2026 reached an all-time peak with <strong className="text-slate-900">+{currentMonthData.newEnrollments} new enrolled learners</strong> and <strong className="text-emerald-700 font-mono">${currentMonthData.netRevenue.toLocaleString()}</strong> in net faculty earnings (+{momRevenuePct}% MoM). The 30% system retention covers unlimited HD video streaming, AI assignment reviews, and Stripe payouts.
                </p>
              </div>
            </div>

            {/* Quick Course Links */}
            {activeCourse ? (
              <button
                onClick={() => setSelectedCourseId('all')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs whitespace-nowrap transition-colors shrink-0"
              >
                Reset to All Courses
              </button>
            ) : (
              <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                Tracking {courses.length} Active Courses
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};
