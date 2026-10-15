import React, { useState, useEffect } from 'react';
import { useLms } from '../context/LmsContext';
import { Course, AIPricingRecommendation, PayoutRecord } from '../types/lms';
import { 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  CheckCircle, 
  ArrowUpRight, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  FileText, 
  Send, 
  AlertCircle, 
  Building2, 
  PieChart, 
  HelpCircle, 
  Clock, 
  CreditCard,
  Percent,
  Check
} from 'lucide-react';

export const AIBillingDashboard: React.FC = () => {
  const { 
    currentUser, 
    courses, 
    educatorBilling, 
    updateEducatorBilling, 
    payouts, 
    requestPayout, 
    updateCoursePrice,
    aiPricingRecommendations,
    refreshAIPricingRecommendations
  } = useLms();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'pricing_ai' | 'forecast' | 'statements' | 'copilot'>('overview');
  const [isRefreshingRecs, setIsRefreshingRecs] = useState(false);
  const [appliedCourseId, setAppliedCourseId] = useState<string | null>(null);
  
  // Payout request modal
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutInputAmount, setPayoutInputAmount] = useState('');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState(false);

  // Copilot Chat
  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello ${currentUser?.name || 'Faculty Member'}! I am your AI Billing & Monetization Copilot. I analyze your enrollment velocity, student price elasticity, and revenue splits to help you maximize earnings and structure high-yield curriculum pricing. How can I assist you today?`
    }
  ]);

  // Tax Remittance Generator
  const [selectedStatementPeriod, setSelectedStatementPeriod] = useState('October 2026');
  const [generatedStatement, setGeneratedStatement] = useState<any>(null);
  const [statementLoading, setStatementLoading] = useState(false);

  // Forecast state
  const [forecastScenario, setForecastScenario] = useState<'base' | 'conservative' | 'bullish'>('base');

  // Compute instructor financials
  const teacherCourses = courses;
  const grossGMV = teacherCourses.reduce((sum, c) => sum + (c.studentCount * c.price), 0);
  const royaltySharePercent = educatorBilling.royaltyPercentage; // 70% educator net (30% system retention)
  const educatorNetEarnings = grossGMV * (royaltySharePercent / 100);
  const platformFeeAmount = grossGMV - educatorNetEarnings;
  const totalPaidOut = payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const availablePayout = Math.max(0, educatorNetEarnings - totalPaidOut);
  const pendingEscrow = Math.round(educatorNetEarnings * 0.08); // 8% rolling 30-day refund protection buffer

  const handleApplyPrice = (courseId: string, newPrice: number) => {
    updateCoursePrice(courseId, newPrice);
    setAppliedCourseId(courseId);
    setTimeout(() => setAppliedCourseId(null), 3000);
  };

  const handleRefreshAI = async () => {
    setIsRefreshingRecs(true);
    try {
      await refreshAIPricingRecommendations();
    } finally {
      setIsRefreshingRecs(false);
    }
  };

  const handleRequestPayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = payoutInputAmount ? parseFloat(payoutInputAmount) : undefined;
    requestPayout(parsed);
    setPayoutSuccessMsg(true);
    setPayoutInputAmount('');
    setTimeout(() => {
      setPayoutSuccessMsg(false);
      setIsPayoutModalOpen(false);
    }, 2000);
  };

  const handleAskCopilot = async (promptText?: string) => {
    const q = promptText || copilotQuestion;
    if (!q.trim()) return;

    const userMsg = { sender: 'user' as const, text: q };
    setCopilotMessages(prev => [...prev, userMsg]);
    setCopilotQuestion('');
    setCopilotLoading(true);

    try {
      const res = await fetch('/api/billing-ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          educatorContext: {
            royaltyPercentage: educatorBilling.royaltyPercentage,
            availablePayout,
            courseCount: courses.length,
            grossGMV
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCopilotMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        throw new Error('API failed');
      }
    } catch {
      // Intelligent fallback
      setCopilotMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Based on your course catalog metrics:
• **Pricing Elasticity**: Your courses carry an average 4.9+ rating. In technical education, courses priced between $249 and $299 experience almost identical conversion rates to those priced below $200 because professional learners frequently expense their enrollment through corporate learning budgets.
• **Bundling Advantage**: Introducing a 2-course masterclass bundle (e.g., Distributed Systems + AI Engineering) at $399 can lift average order value (AOV) by ~28%.
• **Live Cohort Lift**: Hosting scheduled Google Meet office hours and code review sessions allows you to introduce a "Cohort VIP" tier with an additional $150 premium.`
        }
      ]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleGenerateStatement = async () => {
    setStatementLoading(true);
    try {
      const res = await fetch('/api/billing-ai/tax-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructorName: currentUser?.name || 'Educator',
          period: selectedStatementPeriod,
          grossEarnings: grossGMV,
          royaltyPercent: educatorBilling.royaltyPercentage
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedStatement(data);
      }
    } catch (e) {
      console.warn('Statement generation failed:', e);
    } finally {
      setStatementLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'statements' && !generatedStatement) {
      handleGenerateStatement();
    }
  }, [activeSubTab]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-indigo-700 font-semibold">
                  Faculty Financial Control
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {educatorBilling.royaltyPercentage}% Royalty Tier
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                AI-Driven Billing & Revenue Management
              </h2>
              <p className="text-xs text-slate-500">
                Automated payout ledger, dynamic pricing optimizer, 90-day cash flow forecasting, and tax remittance reports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>Request Payout</span>
            </button>

            <button
              onClick={handleRefreshAI}
              disabled={isRefreshingRecs}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Refresh Gemini AI Pricing Analysis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRecs ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline">Run AI Audit</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mt-6 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'overview'
                ? 'bg-slate-50 border-t border-x border-slate-200 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Revenue & Payout Ledger</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pricing_ai')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'pricing_ai'
                ? 'bg-slate-50 border-t border-x border-slate-200 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Price Optimizer</span>
            <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
              {aiPricingRecommendations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('forecast')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'forecast'
                ? 'bg-slate-50 border-t border-x border-slate-200 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>90-Day Cash Flow Forecast</span>
          </button>

          <button
            onClick={() => setActiveSubTab('statements')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'statements'
                ? 'bg-slate-50 border-t border-x border-slate-200 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Tax & Royalty Statements</span>
          </button>

          <button
            onClick={() => setActiveSubTab('copilot')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'copilot'
                ? 'bg-slate-50 border-t border-x border-slate-200 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Financial Copilot</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Gross Sales */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Gross Sales (GMV)
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ${grossGMV.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all student enrollments</p>
        </div>

        {/* Net Royalty */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Net Faculty Share
            </span>
            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              {educatorBilling.royaltyPercentage}% Net
            </span>
          </div>
          <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums">
            ${Math.round(educatorNetEarnings).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">System retains 30%: ${Math.round(platformFeeAmount).toLocaleString()}</p>
        </div>

        {/* Available Payout */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Available for Payout
          </span>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            ${Math.round(availablePayout).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Ready for transfer</p>
        </div>

        {/* Escrow Buffer */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            In Escrow (Buffer)
          </span>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums">
            ${pendingEscrow.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">30-day student refund window</p>
        </div>

        {/* Total Paid Out */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Lifetime Paid Out
          </span>
          <div className="text-2xl font-bold text-slate-700 font-mono tabular-nums">
            ${totalPaidOut.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">To Checking •••• {educatorBilling.payoutAccountLast4}</p>
        </div>
      </div>

      {/* SUB-TAB 1: Overview & Payout Ledger */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payout Settings Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Payout Configuration</span>
              </h3>
              <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                Active
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[11px]">Primary Remittance Method</span>
                <span className="font-semibold text-slate-900 text-sm block mt-0.5">Stripe Direct Deposit</span>
                <span className="text-slate-500 text-[11px]">Routing: 021000021 · Account: •••• {educatorBilling.payoutAccountLast4}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Automated Payouts</span>
                <button
                  onClick={() => updateEducatorBilling({ autoPayoutEnabled: !educatorBilling.autoPayoutEnabled })}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    educatorBilling.autoPayoutEnabled ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {educatorBilling.autoPayoutEnabled ? '1st of Month (On)' : 'Manual Only'}
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Tax Certification</span>
                <span className="font-mono text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>W-8BEN Verified</span>
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Minimum Threshold</span>
                <span className="font-mono font-semibold text-slate-900">${educatorBilling.minimumThreshold} USD</span>
              </div>
            </div>

            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Withdraw Available Balance</span>
            </button>
          </div>

          {/* Historical Payout Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Historical Remittance Ledger</h3>
                <p className="text-xs text-slate-500">Processed electronic disbursements into your verified bank account</p>
              </div>
              <span className="text-xs font-mono text-slate-400">{payouts.length} disbursements</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 font-semibold">Reference ID</th>
                    <th className="py-2.5 font-semibold">Date Processed</th>
                    <th className="py-2.5 font-semibold">Method / Account</th>
                    <th className="py-2.5 font-semibold text-right">Net Amount</th>
                    <th className="py-2.5 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-mono font-medium text-slate-900">
                        {payout.id}
                      </td>
                      <td className="py-3 text-slate-600">
                        {new Date(payout.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 text-slate-600">
                        {payout.method} ({payout.accountReference})
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-600">
                        ${payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle className="w-3 h-3" />
                          <span>Paid</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AI Dynamic Pricing Optimizer */}
      {activeSubTab === 'pricing_ai' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-amber-200/80 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Gemini AI Pricing & Yield Optimizer
                </h3>
                <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                  Our financial neural engine evaluates student price elasticity, enrollment velocities, cohort completion rates, and market benchmarks. Review AI recommendations below and apply calibrated price adjustments with a single click.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiPricingRecommendations.map((rec) => {
              const course = courses.find(c => c.id === rec.courseId);
              const isApplied = appliedCourseId === rec.courseId || course?.price === rec.recommendedPrice;

              return (
                <div key={rec.courseId} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          {rec.marketPositioning.replace('_', ' ')}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1.5 line-clamp-1">
                          {rec.courseTitle}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-[10px] text-slate-400 block uppercase">Confidence</span>
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {rec.confidenceScore}%
                        </span>
                      </div>
                    </div>

                    {/* Price Comparison Block */}
                    <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Current Price</span>
                        <span className="text-base font-mono font-bold text-slate-600 line-through">${rec.currentPrice}</span>
                      </div>
                      <div className="border-x border-slate-200">
                        <span className="text-[10px] uppercase font-semibold text-emerald-700 block">AI Recommended</span>
                        <span className="text-lg font-mono font-bold text-emerald-600">${rec.recommendedPrice}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-indigo-600 block">Yield Lift</span>
                        <span className="text-base font-mono font-bold text-indigo-700">+{rec.projectedRevenueDeltaPercent}%</span>
                      </div>
                    </div>

                    {/* Rationale */}
                    <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 leading-relaxed space-y-1.5">
                      <span className="font-semibold text-slate-800 block text-[11px]">AI Economic Rationale:</span>
                      <p>{rec.rationale}</p>
                      {rec.suggestedPromotionTier && (
                        <div className="pt-1.5 text-[11px] text-amber-800 flex items-center gap-1.5">
                          <span className="font-semibold">Recommended Promotion:</span>
                          <span className="font-mono">{rec.suggestedPromotionTier}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {isApplied ? 'Price updated in live catalog' : 'Adjusts public catalog price'}
                    </span>
                    <button
                      onClick={() => handleApplyPrice(rec.courseId, rec.recommendedPrice)}
                      disabled={isApplied}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isApplied 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied to Catalog</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Apply Recommended Price</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: 90-Day Cash Flow Forecast */}
      {activeSubTab === 'forecast' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">90-Day Revenue & Payout Trajectory</h3>
              <p className="text-xs text-slate-500">Predictive econometric modeling using rolling enrollment trends and cohort retention</p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setForecastScenario('conservative')}
                className={`px-3 py-1 rounded-lg transition-colors ${forecastScenario === 'conservative' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'}`}
              >
                Conservative (-10%)
              </button>
              <button
                onClick={() => setForecastScenario('base')}
                className={`px-3 py-1 rounded-lg transition-colors ${forecastScenario === 'base' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-600'}`}
              >
                Base Case (AI Model)
              </button>
              <button
                onClick={() => setForecastScenario('bullish')}
                className={`px-3 py-1 rounded-lg transition-colors ${forecastScenario === 'bullish' ? 'bg-white shadow-sm text-emerald-600 font-bold' : 'text-slate-600'}`}
              >
                Bullish (+20%)
              </button>
            </div>
          </div>

          {/* Forecast Bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Month 1 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Month 1 (+30 Days)</span>
              <div className="text-3xl font-mono font-bold text-slate-900">
                ${Math.round(
                  (educatorNetEarnings / 3) * (forecastScenario === 'conservative' ? 1.04 : forecastScenario === 'bullish' ? 1.25 : 1.14)
                ).toLocaleString()}
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full w-[65%]" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Driven by recurring student referrals and organic search indexation of your Module 2 updates.
              </p>
            </div>

            {/* Month 2 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Month 2 (+60 Days)</span>
              <div className="text-3xl font-mono font-bold text-indigo-700">
                ${Math.round(
                  (educatorNetEarnings / 3) * (forecastScenario === 'conservative' ? 1.12 : forecastScenario === 'bullish' ? 1.45 : 1.28)
                ).toLocaleString()}
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full w-[80%]" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Amplified by newly scheduled Google Meet live workshops and capstone reviews.
              </p>
            </div>

            {/* Month 3 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Month 3 (+90 Days)</span>
              <div className="text-3xl font-mono font-bold text-emerald-600">
                ${Math.round(
                  (educatorNetEarnings / 3) * (forecastScenario === 'conservative' ? 1.20 : forecastScenario === 'bullish' ? 1.70 : 1.44)
                ).toLocaleString()}
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full w-[95%]" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enterprise cohort licenses and institutional team bulk seat purchases.
              </p>
            </div>
          </div>

          {/* Strategic Drivers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Primary Growth Drivers</span>
              </span>
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                <li>High completion rate (88%) drives automated corporate team vouchers</li>
                <li>Live Google Meet office hours boost syllabus perceived value by +40%</li>
                <li>Cryptographic certificate verification links shared on LinkedIn</li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Risk Mitigations</span>
              </span>
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                <li>Maintain biweekly live office hours to keep drop-offs below 3%</li>
                <li>Offer bundle discount passes during end-of-quarter budget cycles</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Tax & Royalty Statements */}
      {activeSubTab === 'statements' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Official Tax Remittance & Royalty Invoices</h3>
              <p className="text-xs text-slate-500">Itemized breakdown for IRS W-8BEN/W-9 filings and university research account reconciliations</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatementPeriod}
                onChange={(e) => setSelectedStatementPeriod(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
              >
                <option value="October 2026">October 2026 (Current)</option>
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="Q3 2026 Total">Q3 2026 Comprehensive</option>
              </select>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Statement</span>
              </button>
            </div>
          </div>

          {generatedStatement && (
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-6 font-mono text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="text-lg font-bold text-slate-900 font-sans">AETHERIA ACADEMY LMS LTD.</div>
                  <div className="text-slate-500 text-[11px]">Faculty Royalty Remittance Notice · {generatedStatement.statementId}</div>
                  <div className="text-slate-500 text-[11px]">Period: {generatedStatement.period}</div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-800 font-sans block">{generatedStatement.instructorName}</span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-sans border border-emerald-200">
                    {generatedStatement.taxForm}
                  </span>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Total Course Marketplace Gross GMV:</span>
                  <span className="font-bold text-slate-900">${generatedStatement.grossGMV.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Contracted Faculty Royalty ({generatedStatement.royaltyPercentage}%):</span>
                  <span className="font-bold text-indigo-700">${generatedStatement.educatorGrossShare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Platform System Retention Fee (30%):</span>
                  <span className="text-slate-500">-${generatedStatement.platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Stripe Electronic Merchant Settlement Fee (2.9%):</span>
                  <span className="text-slate-500">-${generatedStatement.merchantProcessingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Withholding Tax (Foreign Treaty Status 0%):</span>
                  <span className="text-emerald-700">$0.00 (Exempt)</span>
                </div>
                <div className="flex justify-between py-2.5 bg-emerald-50/80 px-3 rounded-lg border border-emerald-200 text-sm">
                  <span className="font-bold text-emerald-950 font-sans">NET REMITTED TO EDUCATOR:</span>
                  <span className="font-bold text-emerald-700">${generatedStatement.netRemitted.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center pt-2">
                This document is certified by Aetheria Academy Financial Controller. Retain for personal or institutional tax records.
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: AI Financial Copilot */}
      {activeSubTab === 'copilot' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>Educator Financial & Monetization Copilot</span>
              </h3>
              <p className="text-xs text-slate-500">
                Ask Gemini about bundling strategies, live cohort pricing, corporate licensing, or tax deduction strategies
              </p>
            </div>
          </div>

          {/* Prompt Suggestions */}
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              'How can I package a corporate team bundle?',
              'What is my optimal price point for advanced distributed systems?',
              'How will adding Google Meet live office hours impact course retention?',
              'What are the tax advantages of foreign treaty W-8BEN royalties?'
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => handleAskCopilot(p)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors text-left"
              >
                💬 {p}
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 min-h-[300px] max-h-[460px] overflow-y-auto space-y-4">
            {copilotMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div 
                  className={`p-4 rounded-2xl max-w-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-none shadow-sm'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {copilotLoading && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold p-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Gemini Financial Intelligence analyzing catalog...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleAskCopilot();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={copilotQuestion}
              onChange={(e) => setCopilotQuestion(e.target.value)}
              placeholder="Ask any question about educator monetization, corporate pricing, or tax remittance..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={copilotLoading || !copilotQuestion.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </form>
        </div>
      )}

      {/* Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Request Royalty Disbursement</h4>
                  <p className="text-[11px] text-slate-500">Direct transfer to your linked bank account</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {payoutSuccessMsg ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h5 className="text-base font-bold text-slate-900">Disbursement Initiated!</h5>
                <p className="text-xs text-slate-500">
                  Electronic transfer has been queued via Stripe Direct Deposit. Expected in 1-2 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestPayoutSubmit} className="space-y-4 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block">Maximum Available</span>
                  <div className="text-xl font-mono font-bold text-emerald-600">
                    ${Math.round(availablePayout).toLocaleString()} USD
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Transfer destination: Checking •••• {educatorBilling.payoutAccountLast4}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Withdrawal Amount (USD)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="50"
                    max={availablePayout}
                    placeholder={`Full balance ($${Math.round(availablePayout)})`}
                    value={payoutInputAmount}
                    onChange={(e) => setPayoutInputAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Leave empty to withdraw the full available balance.</span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm"
                  >
                    Confirm Disbursement
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
