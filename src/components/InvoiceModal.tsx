import React from 'react';
import { Transaction, Course } from '../types/lms';
import { Printer, CheckCircle, Download, ArrowRight, ShieldCheck } from 'lucide-react';
import { OwlyLogoIcon } from './OwlyBrand';

interface InvoiceModalProps {
  transaction: Transaction;
  course?: Course;
  onClose: () => void;
  onStartCourse: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  transaction,
  course,
  onClose,
  onStartCourse
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Success Banner */}
        <div className="bg-emerald-600 text-white p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Payment Confirmed & Access Granted</h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              Your enrollment license is active. A receipt was sent to {transaction.userEmail}.
            </p>
          </div>
        </div>

        {/* Invoice Body */}
        <div id="printable-certificate" className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <OwlyLogoIcon size={24} />
                <span className="font-bold text-slate-900 text-sm">OWLY Online Education Ltd.</span>
              </div>
              <p className="text-xs text-slate-500">VAT ID: EU-928491823 · Tax Invoice</p>
              <p className="text-xs text-slate-500">100 Enterprise Way, Technology Park</p>
            </div>

            <div className="text-right">
              <span className="font-mono text-sm font-bold text-slate-900 block tabular-nums">
                {transaction.invoiceNumber}
              </span>
              <span className="text-xs text-slate-500 block">
                {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold uppercase tracking-wider block mt-1">
                PAID IN FULL
              </span>
            </div>
          </div>

          {/* Billed To */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium uppercase text-[10px] tracking-wider mb-1">
                Billed To
              </span>
              <p className="font-semibold text-slate-800">{transaction.userName}</p>
              <p className="text-slate-500">{transaction.userEmail}</p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium uppercase text-[10px] tracking-wider mb-1">
                Payment Method
              </span>
              <p className="font-semibold text-slate-800 capitalize">
                {transaction.paymentMethod === 'card' ? `Credit Card (•••• ${transaction.cardLast4 || '4242'})` : transaction.paymentMethod}
              </p>
              <p className="text-slate-500 font-mono text-[11px]">Tx ID: {transaction.id}</p>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2.5 px-4 text-left font-medium">Description</th>
                  <th className="py-2.5 px-4 text-center font-medium">Qty</th>
                  <th className="py-2.5 px-4 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{transaction.courseTitle}</p>
                    <p className="text-[11px] text-slate-500">Lifetime access & verified credential issuance</p>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 font-mono">1</td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-800 tabular-nums">
                    ${transaction.originalAmount.toFixed(2)}
                  </td>
                </tr>

                {transaction.discountAmount && transaction.discountAmount > 0 && (
                  <tr className="text-indigo-600 bg-indigo-50/40">
                    <td className="py-2.5 px-4" colSpan={2}>
                      Discount Applied ({transaction.discountCode})
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-medium tabular-nums">
                      -${transaction.discountAmount.toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-right font-bold text-slate-800">
                    Total Paid (USD):
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm tabular-nums">
                    ${transaction.amount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Guarantee Note */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Backed by our 30-Day Money-Back Guarantee. Full refund available upon request via admin desk.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={onStartCourse}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Go to Course Player</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
