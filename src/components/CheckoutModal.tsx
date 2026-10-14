import React, { useState } from 'react';
import { Course, Transaction } from '../types/lms';
import { useLms } from '../context/LmsContext';
import { 
  Lock, 
  CreditCard, 
  ShieldCheck, 
  Check, 
  X, 
  ArrowRight, 
  Tag, 
  Smartphone, 
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';

interface CheckoutModalProps {
  course: Course;
  onClose: () => void;
  onEnrollmentSuccess: (course: Course) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  course,
  onClose,
  onEnrollmentSuccess
}) => {
  const { currentUser, createTransaction, enrollInCourse } = useLms();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'googlepay' | 'bank'>('card');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [cardName, setCardName] = useState(currentUser?.name || 'Student Scholar');
  const [zipCode, setZipCode] = useState('94105');

  // Coupon management
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  // Calculations
  const basePrice = course.price;
  const discountAmount = appliedCoupon ? (basePrice * appliedCoupon.percent) / 100 : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const clean = couponInput.trim().toUpperCase();

    if (clean === 'LEARN25') {
      setAppliedCoupon({ code: 'LEARN25', percent: 25 });
      setCouponInput('');
    } else if (clean === 'WELCOME50') {
      setAppliedCoupon({ code: 'WELCOME50', percent: 50 });
      setCouponInput('');
    } else if (clean === 'BUILD100') {
      setAppliedCoupon({ code: 'BUILD100', percent: 100 });
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try LEARN25, WELCOME50, or BUILD100.');
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 16);
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiry(raw);
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);

    // Simulate SSL handshake and gateway authorization
    setTimeout(() => {
      const cardLast4 = cardNumber.replace(/\s/g, '').slice(-4) || '4242';
      
      const newTx = createTransaction({
        courseId: course.id,
        amount: finalPrice,
        originalAmount: basePrice,
        discountCode: appliedCoupon?.code,
        discountAmount,
        paymentMethod,
        cardLast4
      });

      enrollInCourse(course.id, newTx.id);
      setIsProcessing(false);
      setCompletedTx(newTx);
    }, 1100);
  };

  if (completedTx) {
    return (
      <InvoiceModal
        transaction={completedTx}
        course={course}
        onClose={onClose}
        onStartCourse={() => {
          onEnrollmentSuccess(course);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Secure Payment Checkout</span>
            <span className="text-slate-400 text-xs">· 256-bit Encrypted</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Two-Column Split */}
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Order Summary & Coupon (5 cols) */}
          <div className="md:col-span-5 bg-slate-50/70 p-6 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                Order Summary
              </span>

              {/* Course Item */}
              <div className="space-y-2 mb-6">
                <span className="text-xs text-indigo-700 font-mono font-medium block">
                  {course.category} · {course.level}
                </span>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {course.title}
                </h4>
                <p className="text-xs text-slate-500">
                  Instructor: {course.instructorName}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{course.durationHours} hours on-demand video</span>
                </div>
              </div>

              {/* Promo Code Form */}
              <div className="mb-6 pt-4 border-t border-slate-200">
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Discount Code
                </label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="e.g. LEARN25"
                    className="flex-1 px-3 py-1.5 text-xs uppercase bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors whitespace-nowrap"
                  >
                    Apply
                  </button>
                </form>

                {couponError && (
                  <p className="text-[11px] text-rose-600 mt-1.5">{couponError}</p>
                )}

                {appliedCoupon && (
                  <div className="mt-2 flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span className="font-mono font-semibold">{appliedCoupon.code}</span>
                      <span>({appliedCoupon.percent}% off)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="mt-2 text-[11px] text-slate-400">
                  Try codes: <code className="text-indigo-600 font-mono">LEARN25</code> (25%), <code className="text-indigo-600 font-mono">WELCOME50</code> (50%), <code className="text-indigo-600 font-mono">BUILD100</code> (Free)
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs border-t border-slate-200 pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Course Tuition</span>
                  <span className="font-mono tabular-nums">${basePrice.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-mono tabular-nums">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Digital Service Tax</span>
                  <span className="font-mono tabular-nums">$0.00</span>
                </div>

                <div className="flex justify-between text-slate-900 font-bold text-sm border-t border-slate-200 pt-2">
                  <span>Total Amount</span>
                  <span className="font-mono tabular-nums text-indigo-700">${finalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Guarantee Footer */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full 30-day money-back guarantee. No questions asked.</span>
            </div>
          </div>

          {/* Right Column: Payment Form (7 cols) */}
          <div className="md:col-span-7 p-6 space-y-5">
            {/* Payment Method Selector */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
                Select Payment Method
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-slate-700" />
                  <span className="whitespace-nowrap">Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('applepay')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'applepay'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-slate-700" />
                  <span className="whitespace-nowrap">Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-slate-700" />
                  <span className="whitespace-nowrap">Bank Wire</span>
                </button>
              </div>
            </div>

            {/* Payment Input Fields */}
            {paymentMethod === 'card' && (
              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Full name on card"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-700">
                      Card Number
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">Visa / Mastercard / Amex</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums tracking-wider"
                      placeholder="4242 4242 4242 4242"
                    />
                    <div className="absolute right-3 top-2.5">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Expiration (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={handleExpiryChange}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums"
                      placeholder="MM/YY"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums"
                      placeholder="CVC"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Billing ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    placeholder="Postal Code"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'applepay' && (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                <Smartphone className="w-8 h-8 text-slate-800 mx-auto" />
                <h5 className="text-xs font-bold text-slate-900">Apple Pay Express Checkout</h5>
                <p className="text-[11px] text-slate-500">
                  Instant biometric authentication linked to your verified account card ending in 4242.
                </p>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Building2 className="w-4 h-4 text-slate-700" />
                  <span>SEPA / ACH Corporate Wire</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Account credentials will be verified automatically. Immediate access granted with provisional license.
                </p>
              </div>
            )}

            {/* Security note */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>PCI-DSS Level 1 Compliant. Encrypted tokenization.</span>
            </div>

            {/* Submit Action */}
            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authorizing Secure Transaction...</span>
                </>
              ) : (
                <>
                  <span>
                    {finalPrice === 0 ? 'Claim Free Enrollment' : `Authorize & Pay $${finalPrice.toFixed(2)}`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
