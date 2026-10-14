import React, { useState } from 'react';
import { Course, EnrollmentProgress } from '../types/lms';
import { useLms } from '../context/LmsContext';
import { 
  Award, 
  Printer, 
  X, 
  CheckCircle, 
  ShieldCheck, 
  Share2, 
  Copy, 
  Check, 
  Linkedin, 
  Edit3, 
  Sparkles,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { OwlyLogoIcon, OwlyAcademyCrest } from './OwlyBrand';

interface CertificateModalProps {
  course: Course;
  enrollment: EnrollmentProgress;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  course,
  enrollment,
  onClose
}) => {
  const { issueCertificate, currentUser } = useLms();

  const cert = enrollment.certificateIssued || {
    issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    credentialId: `ATH-${course.category.substring(0, 3).toUpperCase()}-94812-${enrollment.userId.slice(-4).toUpperCase()}`,
    recipientName: currentUser?.name || 'Scholar Student',
    honors: 'Passed with Honors' as const,
    gradeScore: 96,
    verificationHash: 'SHA256:0x7a89f412cb90e'
  };

  const [recipientName, setRecipientName] = useState(cert.recipientName);
  const [honors, setHonors] = useState<any>(cert.honors || 'Passed with Honors');
  const [isEditingName, setIsEditingName] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showLinkedInHelper, setShowLinkedInHelper] = useState(false);

  const verificationUrl = `${window.location.origin}?verify=${cert.credentialId}`;

  const handleSaveName = () => {
    if (!recipientName.trim()) return;
    issueCertificate(course.id, recipientName.trim(), honors, enrollment.userId);
    setIsEditingName(false);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(cert.credentialId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Modal Controls Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <span className="text-sm font-bold text-slate-900 block leading-tight">
                Official Verifiable Certificate of Mastery
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Credential ID: {cert.credentialId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Verification Link */}
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Verification URL'}</span>
            </button>

            {/* LinkedIn Share */}
            <button
              onClick={() => setShowLinkedInHelper(!showLinkedInHelper)}
              className="px-3 py-1.5 bg-[#0077B5] hover:bg-[#006097] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>Add to LinkedIn</span>
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LinkedIn Guidance Banner */}
        {showLinkedInHelper && (
          <div className="bg-sky-50 border-b border-sky-100 p-4 text-xs text-sky-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-sky-950">
                <Linkedin className="w-4 h-4 text-[#0077B5]" />
                Add Credential to your LinkedIn Profile
              </span>
              <button onClick={() => setShowLinkedInHelper(false)} className="text-sky-700 hover:text-sky-950 font-bold">×</button>
            </div>
            <p className="text-slate-600">
              Copy and paste these verified details into your LinkedIn "Licenses & Certifications" section:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white p-3 rounded-lg border border-sky-200 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Name:</span>
                <span className="font-bold text-slate-800">{course.title}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Issuing Org:</span>
                <span className="font-bold text-slate-800">OWLY Institute of Technology</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Issue Date:</span>
                <span className="font-bold text-slate-800">{cert.issueDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Credential ID:</span>
                <span className="font-bold text-slate-800">{cert.credentialId}</span>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Customization Bar (Optional Name Editing) */}
        <div className="px-6 py-2.5 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Recipient Name on Certificate:</span>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded bg-white font-semibold text-slate-900"
                  placeholder="Full Legal Name"
                />
                <button
                  onClick={handleSaveName}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <span>{recipientName}</span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-slate-400 hover:text-indigo-600"
                  title="Edit certificate name"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">Honors Standing:</span>
            <select
              value={honors}
              onChange={(e) => {
                const val = e.target.value;
                setHonors(val);
                issueCertificate(course.id, recipientName, val as any, enrollment.userId);
              }}
              className="px-2 py-1 border border-slate-200 rounded text-xs bg-white text-slate-800 font-medium"
            >
              <option value="Standard Mastery">Standard Mastery</option>
              <option value="Passed with Honors">Passed with Honors</option>
              <option value="Highest Distinction (Top 5%)">Highest Distinction (Top 5%)</option>
            </select>
          </div>
        </div>

        {/* Certificate Visual Canvas (Ready for Print & PDF) */}
        <div id="printable-certificate" className="p-8 md:p-12 bg-white flex flex-col items-center text-center">
          {/* Guilloche Border Envelope */}
          <div className="w-full border-4 border-double border-slate-800 p-8 md:p-12 rounded-sm relative bg-gradient-to-b from-amber-50/30 via-white to-amber-50/30 shadow-inner">
            {/* Corner Decorative Accents */}
            <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-amber-600" />
            <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-amber-600" />
            <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-amber-600" />
            <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-amber-600" />

            {/* Academy Wordmark & Crest */}
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <OwlyLogoIcon size={36} />
              <span className="text-base font-bold uppercase tracking-widest text-slate-900 font-mono">
                OWLY Institute of Technology
              </span>
            </div>

            <p className="text-[11px] uppercase tracking-widest text-amber-800 font-semibold mb-3">
              Certificate of Academic Mastery & Engineering Excellence
            </p>

            {/* Recipient Full Name */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight my-4">
              {recipientName}
            </h2>

            <p className="text-xs text-slate-600 max-w-lg mx-auto mb-4 leading-relaxed">
              has completed all curriculum milestones, laboratory projects, and peer assessments to attain verified mastery in the subject of
            </p>

            {/* Course Title */}
            <div className="my-5 py-3 border-y border-slate-300 max-w-2xl mx-auto">
              <h3 className="text-xl md:text-2xl font-bold text-slate-950 leading-tight">
                {course.title}
              </h3>
              <div className="flex items-center justify-center gap-3 text-xs text-slate-500 font-mono mt-1.5">
                <span>Domain: {course.category}</span>
                <span aria-hidden="true">·</span>
                <span>Rigor: {course.level}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-indigo-700">{honors}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              Demonstrating comprehensive proficiency across all architectural paradigms, testing harnesses, and practical implementations.
            </p>

            {/* Seal & Signatures Row */}
            <div className="grid grid-cols-3 items-end pt-6 mt-6 border-t border-slate-200">
              {/* Instructor Signature */}
              <div className="text-center">
                <div className="font-serif italic text-lg text-slate-900 font-bold mb-1">
                  {course.instructorName}
                </div>
                <div className="h-0.5 bg-slate-400 w-32 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                  {course.instructorTitle || 'Lead Instructor'}
                </p>
              </div>

              {/* Gold Verification Seal with OWLY Crest */}
              <div className="flex flex-col items-center justify-center">
                <OwlyAcademyCrest size={64} className="drop-shadow-sm" />
                <span className="text-[9px] uppercase tracking-widest font-mono text-amber-800 font-bold mt-1.5">
                  ACCREDITED SEAL
                </span>
              </div>

              {/* Academic Dean Signature */}
              <div className="text-center">
                <div className="font-serif italic text-lg text-slate-900 font-bold mb-1">
                  Marcus Sterling
                </div>
                <div className="h-0.5 bg-slate-400 w-32 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                  Dean of Academics & Governance
                </p>
              </div>
            </div>

            {/* Verification Footer Data */}
            <div className="mt-8 pt-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-200/60">
              <div className="flex items-center gap-3">
                <span>Issued: {cert.issueDate}</span>
                <span aria-hidden="true">·</span>
                <span>Credential ID: <strong className="text-slate-700">{cert.credentialId}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span>Hash: {cert.verificationHash || 'SHA256:0x4192b0fa'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
