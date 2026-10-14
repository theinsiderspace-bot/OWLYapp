import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  X, 
  Award, 
  CheckCircle, 
  Clock, 
  ExternalLink 
} from 'lucide-react';

interface CertificateVerifierModalProps {
  initialCredentialId?: string;
  onClose: () => void;
  onViewCertificate?: (courseId: string) => void;
}

export const CertificateVerifierModal: React.FC<CertificateVerifierModalProps> = ({
  initialCredentialId = '',
  onClose,
  onViewCertificate
}) => {
  const { verifyCertificate } = useLms();
  const [searchId, setSearchId] = useState(initialCredentialId);
  const [result, setResult] = useState<any>(() => {
    return initialCredentialId ? verifyCertificate(initialCredentialId) : null;
  });
  const [hasSearched, setHasSearched] = useState(Boolean(initialCredentialId));

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    const res = verifyCertificate(searchId.trim());
    setResult(res);
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Official Credential Verification Desk
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Verify academic authenticity of any OWLY Institute diploma or course certificate by entering the unique Credential ID below.
          </p>

          <form onSubmit={handleVerify} className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Enter Credential ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. OWL-GENAI-98420-ALX"
                className="flex-1 px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-sm"
              >
                Verify
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Sample IDs to test: ATH-GENAI-98420-ALX
            </p>
          </form>

          {/* Verification Result */}
          {hasSearched && (
            <div className="pt-2">
              {result && result.isValid ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>AUTHENTIC & VALID CREDENTIAL</span>
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-emerald-200/60 pt-1 font-mono">
                    <div className="pt-1.5 flex justify-between">
                      <span className="text-emerald-700">Recipient:</span>
                      <strong className="text-slate-900">{result.certificate.recipientName}</strong>
                    </div>

                    <div className="pt-1.5 flex justify-between">
                      <span className="text-emerald-700">Course Title:</span>
                      <strong className="text-slate-900 text-right max-w-xs truncate">
                        {result.course?.title || 'Course'}
                      </strong>
                    </div>

                    <div className="pt-1.5 flex justify-between">
                      <span className="text-emerald-700">Academic Standing:</span>
                      <strong className="text-slate-900">
                        {result.certificate.honors || 'Standard Mastery'}
                      </strong>
                    </div>

                    <div className="pt-1.5 flex justify-between">
                      <span className="text-emerald-700">Issue Date:</span>
                      <span className="text-slate-800">{result.certificate.issueDate}</span>
                    </div>

                    <div className="pt-1.5 flex justify-between">
                      <span className="text-emerald-700">Credential ID:</span>
                      <span className="font-bold text-slate-900">{result.certificate.credentialId}</span>
                    </div>

                    <div className="pt-1.5 flex justify-between">
                      <span className="text-emerald-700">Lead Instructor:</span>
                      <span className="text-slate-800">{result.course?.instructorName || 'Lead Faculty'}</span>
                    </div>
                  </div>

                  {onViewCertificate && result.course && (
                    <div className="pt-2">
                      <button
                        onClick={() => onViewCertificate(result.course.id)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Award className="w-4 h-4" />
                        <span>Inspect Full Certificate</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 space-y-2 text-xs text-rose-800">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>CREDENTIAL NOT FOUND OR REVOKED</span>
                  </div>
                  <p className="text-rose-700">
                    No active accreditation matches the identifier "{searchId.toUpperCase()}". Please verify the ID for typographical errors.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
