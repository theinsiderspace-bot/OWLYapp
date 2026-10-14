import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  Printer, 
  Mail, 
  ExternalLink, 
  Server, 
  UserCheck, 
  Sparkles,
  Globe,
  Database,
  Scale
} from 'lucide-react';
import { OwlyBrand, OwlyLogoIcon } from './OwlyBrand';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<string>('intro');
  const lastUpdated = 'October 14, 2026';

  const sections = [
    { id: 'intro', label: '1. Introduction & Scope' },
    { id: 'collection', label: '2. Information We Collect' },
    { id: 'usage', label: '3. How We Use Your Data' },
    { id: 'google-workspace', label: '4. Google Workspace & Meet' },
    { id: 'ai-processing', label: '5. AI & Video Telemetry' },
    { id: 'security', label: '6. Cryptography & Security' },
    { id: 'sharing', label: '7. Third-Party Disclosures' },
    { id: 'rights', label: '8. User Rights (GDPR & CCPA)' },
    { id: 'contact', label: '9. Contact & DPO' }
  ];

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Action Bar */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 shadow-xs transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Return to Course Catalog</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Version 2.4 · Effective {lastUpdated}
          </span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl shadow-xs transition-colors"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Policy</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
        {/* Policy Header Banner */}
        <div className="bg-slate-950 text-white p-8 sm:p-12 border-b border-slate-800 relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono uppercase font-bold tracking-wider text-[11px] text-white">
                Legal Compliance & Privacy Architecture
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              OWLY Privacy Policy
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              At OWLY Academy, we respect your privacy, your academic records, and your engineering artifacts. 
              This policy explains how OWLY Learning Technologies Inc. collects, protects, processes, and respects 
              personal data across all student portals, educator studios, Google Workspace integrations, and cryptographic diplomas.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Data Selling Pledge</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                <span>GDPR & CCPA/CPRA Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Google API Limited Use Certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Assurances Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200 border-b border-slate-200">
          <div className="bg-white p-6 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Never Sold or Monetized
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never sell, rent, or trade student profiles, contact information, or coursework to advertising aggregators.
            </p>
          </div>

          <div className="bg-white p-6 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Cryptographic Integrity
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Course diplomas are stamped with SHA-256 cryptographic hashes for trustless public verification without leaking private PII.
            </p>
          </div>

          <div className="bg-white p-6 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Student-First Control
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              You own your learning portfolio. You can request a complete data export or account erasure at any time with one click.
            </p>
          </div>
        </div>

        {/* Content Layout with Sidebar Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Sidebar Table of Contents */}
          <aside className="p-6 lg:p-8 bg-slate-50/60 lg:col-span-1">
            <div className="sticky top-24 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                Policy Navigation
              </span>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors block truncate ${
                      activeSection === sec.id
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                  Data Protection Officer
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Have questions about GDPR or FERPA rights? Contact our legal team directly:
                </p>
                <a
                  href="mailto:privacy@owly.ai.studio"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>privacy@owly.ai.studio</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Legal Body Sections */}
          <div className="p-6 sm:p-10 lg:p-12 lg:col-span-3 space-y-10 text-sm leading-relaxed text-slate-700">
            {/* Section 1 */}
            <section id="intro" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 font-mono">01.</span>
                <span>Introduction & Scope</span>
              </h2>
              <p>
                Welcome to <strong>OWLY Academy</strong> (“OWLY”, “we”, “our”, or “us”), operated by <strong>OWLY Learning Technologies Inc.</strong> 
                This Privacy Policy describes how we gather, store, handle, and protect personal and professional information across our web applications, 
                our course marketplace, educator studio, teleprompter tools, Google Meet classrooms, and interactive learning environments.
              </p>
              <p>
                By enrolling in courses, authoring curriculum, logging in, or interacting with the OWLY platform, you agree to the collection and use 
                of information in accordance with this policy. If you do not agree with any terms, please do not access or use our services.
              </p>
            </section>

            {/* Section 2 */}
            <section id="collection" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 font-mono">02.</span>
                <span>Information We Collect</span>
              </h2>
              <p>
                We only collect data necessary to provide seamless educational experiences, manage accreditations, issue verifiable diplomas, 
                and ensure secure platform transactions.
              </p>
              <div className="space-y-2.5">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <span className="font-semibold text-xs text-slate-900 block font-mono">A. Account Credentials & Profiles</span>
                  <p className="text-xs text-slate-600">
                    Names, email addresses, professional titles, bio summaries, and avatar references provided during student registration or faculty accreditation applications.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <span className="font-semibold text-xs text-slate-900 block font-mono">B. Academic & Learning Telemetry</span>
                  <p className="text-xs text-slate-600">
                    Enrolled course IDs, completed lesson timestamps, interactive quiz scores, study time analytics visualized via Recharts, personal lesson notes, and discussion board contributions.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <span className="font-semibold text-xs text-slate-900 block font-mono">C. Educator Studio & Authoring Artifacts</span>
                  <p className="text-xs text-slate-600">
                    Course syllabi, video recording metadata, teleprompter scripts, and published lecture outlines created by faculty members.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <span className="font-semibold text-xs text-slate-900 block font-mono">D. Billing & Transaction History</span>
                  <p className="text-xs text-slate-600">
                    Order IDs, course purchase amounts, receipt timestamps, payment status, and teacher revenue split payout requests. We do not store raw credit card numbers; all transactions are processed via PCI-DSS Level 1 compliant gateway tokenization.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="usage" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 font-mono">03.</span>
                <span>How We Use Your Data</span>
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>To authenticate your identity and protect student/faculty session security without automated unwanted log-ins.</li>
                <li>To calculate course completion percentages and deliver study time trend analytics.</li>
                <li>To generate, issue, and cryptographically verify graduation certificates on our public registry.</li>
                <li>To facilitate educator payouts according to our 85/15 creator revenue split model.</li>
                <li>To moderate peer discussions and maintain community standards across interactive lecture rooms.</li>
                <li>To comply with statutory tax and accounting retention requirements.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="google-workspace" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 font-mono">04.</span>
                <span>Google Workspace & Google Meet Integration</span>
              </h2>
              <p>
                OWLY integrates with 1P Google Workspace APIs to allow verified instructors to schedule and launch real-time Google Meet virtual classrooms, 
                office hours, and calendar invitations directly from the Teacher Studio.
              </p>
              <div className="p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-xl text-xs space-y-2 text-indigo-950">
                <span className="font-bold block flex items-center gap-1.5 text-indigo-900">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  Google API Services User Data Policy Compliance
                </span>
                <p>
                  OWLY&apos;s use and transfer to any other app of information received from Google APIs adheres to the 
                  <strong className="text-indigo-900"> Google API Services User Data Policy</strong>, including the Limited Use requirements.
                </p>
                <p>
                  We only request Google Calendar and Meet scopes necessary to schedule and launch educational sessions. 
                  We never read private emails, personal calendar events unrelated to OWLY courses, or share Google user tokens with third parties.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="ai-processing" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 font-mono">05.</span>
                <span>AI & Video Studio Telemetry</span>
              </h2>
              <p>
                Our Video Studio utilizes server-side AI processing to transcribe lectures, generate automated chapter timestamps, 
                and formulate knowledge-check quizzes for students.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Video transcriptions are processed strictly to assist learners with navigation and accessibility.</li>
                <li>Student personal notes or quiz submissions are <strong>never</strong> used to train public machine learning foundation models.</li>
                <li>Teleprompter scripts and drafts remain private to the authoring instructor until formally published.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="security" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 font-mono">06.</span>
                <span>Cryptography, Certificates & Security</span>
              </h2>
              <p>
                All student diplomas issued by OWLY Academy feature an immutable SHA-256 digital signature. 
                Employers and third parties can verify the certificate ID against our verification engine to confirm course authenticity, 
                completion date, and academic honors without requiring access to the student&apos;s password or private billing records.
              </p>
              <p>
                All platform network traffic is encrypted using TLS 1.3 in transit and AES-256 encryption at rest. 
                Database access is protected by strict role-based access control (RBAC).
              </p>
            </section>

            {/* Section 7 */}
            <section id="sharing" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 font-mono">07.</span>
                <span>Third-Party Service Providers</span>
              </h2>
              <p>
                We do not sell personal data. We only share limited information with trusted infrastructure vendors bound by strict data processing agreements (DPAs):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 border border-slate-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-slate-900 block font-mono">Cloud Hosting & Storage</span>
                  <p className="text-slate-500">Google Cloud Platform & Firebase for secure database records and content delivery.</p>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-slate-900 block font-mono">Video & Real-Time Rooms</span>
                  <p className="text-slate-500">Google Meet infrastructure for authenticated live seminars and office hours.</p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="rights" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 font-mono">08.</span>
                <span>Your Rights (GDPR & CCPA/CPRA)</span>
              </h2>
              <p>
                Depending on your geographic residency, you have statutory rights regarding your personal data:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li><strong>Right of Access:</strong> Request a full copy of all data and course records associated with your account.</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate profile titles, names, or contact addresses.</li>
                <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request permanent deletion of your account and personal history, subject to statutory audit obligations.</li>
                <li><strong>Right to Data Portability:</strong> Export your completion records and certificates in machine-readable JSON or PDF format.</li>
                <li><strong>Opt-Out of Communications:</strong> Manage email notification preferences for announcements and discussion replies.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="contact" className="space-y-3 scroll-mt-24 pt-4 border-t border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 font-mono">09.</span>
                <span>Contact & Data Protection Inquiries</span>
              </h2>
              <p>
                If you have questions, feedback, or wish to exercise your privacy rights, please reach out to our designated Data Protection Officer:
              </p>
              <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <OwlyBrand size="sm" theme="light" showSubtitle={false} />
                  <span className="text-xs text-slate-400 font-mono">· Legal Department</span>
                </div>
                <p className="text-xs text-slate-300">
                  OWLY Learning Technologies Inc.<br />
                  Data Protection & Compliance Office<br />
                  Direct Inquiries: <a href="mailto:privacy@owly.ai.studio" className="text-indigo-400 hover:underline">privacy@owly.ai.studio</a>
                </p>
              </div>
            </section>

            {/* Final Return Button */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={onBack}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Course Catalog</span>
              </button>

              <button
                onClick={handlePrint}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
