import React from 'react';

/**
 * High-aesthetic, generative-style visual artworks for the OWLY LMS theme.
 * Crafted with intricate SVG geometry, gradient meshes, orbital rings, and domain telemetry.
 */

export const OwlyHeroArtwork: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950/80 to-slate-900 border border-indigo-500/20 p-6 md:p-8 flex items-center justify-center shadow-2xl ${className}`}>
      {/* Background Radial Glows */}
      <div className="absolute -top-12 -right-12 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Main SVG Artwork */}
      <svg 
        viewBox="0 0 600 400" 
        className="w-full h-auto max-h-[380px] drop-shadow-2xl select-none" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hero-grad-primary" x1="100" y1="50" x2="500" y2="350" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="0.5" stopColor="#818CF8" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="hero-grad-teal" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="hero-grad-amber" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FBBF24" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
          <radialGradient id="hero-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Orbital Rings */}
        <ellipse cx="300" cy="200" rx="240" ry="120" stroke="#4F46E5" strokeWidth="1" strokeDasharray="4 6" opacity="0.3" transform="rotate(-15 300 200)" />
        <ellipse cx="300" cy="200" rx="190" ry="90" stroke="#38BDF8" strokeWidth="1.2" opacity="0.4" transform="rotate(25 300 200)" />
        <circle cx="300" cy="200" r="140" stroke="#6366F1" strokeWidth="1" strokeDasharray="2 4" opacity="0.25" />
        <circle cx="300" cy="200" r="140" fill="url(#hero-core-glow)" />

        {/* Constellation Grid Nodes & Connecting Laser Paths */}
        <g opacity="0.8">
          <line x1="140" y1="120" x2="230" y2="160" stroke="#4F46E5" strokeWidth="1.5" />
          <line x1="230" y1="160" x2="300" y2="100" stroke="#6366F1" strokeWidth="1.5" />
          <line x1="300" y1="100" x2="370" y2="160" stroke="#6366F1" strokeWidth="1.5" />
          <line x1="370" y1="160" x2="460" y2="120" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="230" y1="160" x2="260" y2="270" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="370" y1="160" x2="340" y2="270" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="260" y1="270" x2="340" y2="270" stroke="#818CF8" strokeWidth="1.5" />

          {/* Glowing Planetary Nodes */}
          <circle cx="140" cy="120" r="7" fill="#38BDF8" />
          <circle cx="140" cy="120" r="14" stroke="#38BDF8" strokeWidth="1" opacity="0.4" />
          
          <circle cx="460" cy="120" r="7" fill="#F59E0B" />
          <circle cx="460" cy="120" r="14" stroke="#F59E0B" strokeWidth="1" opacity="0.4" />

          <circle cx="260" cy="270" r="6" fill="#818CF8" />
          <circle cx="340" cy="270" r="6" fill="#FBBF24" />
        </g>

        {/* Central Geometric Cybernetic Owl Crest (OWLY Sovereign Emblem) */}
        <g transform="translate(250, 130)">
          {/* Owl Outer Aura Shield */}
          <polygon points="50,0 85,25 95,75 50,115 5,75 15,25" fill="#0F172A" stroke="url(#hero-grad-primary)" strokeWidth="2.5" />
          
          {/* Owl Ear Tufts */}
          <polygon points="20,15 32,32 15,35" fill="#312E81" />
          <polygon points="80,15 68,32 85,35" fill="#312E81" />

          {/* Mask Facets */}
          <polygon points="50,30 30,55 50,75 70,55" fill="#1E1B4B" stroke="#6366F1" strokeWidth="1.2" />

          {/* Owl Wisdom Spectacle Eyes (Dual Golden Orbs) */}
          <circle cx="35" cy="55" r="14" fill="#090D16" stroke="#F59E0B" strokeWidth="2.5" />
          <circle cx="65" cy="55" r="14" fill="#090D16" stroke="#F59E0B" strokeWidth="2.5" />
          
          <circle cx="35" cy="55" r="7" fill="#FBBF24" />
          <circle cx="65" cy="55" r="7" fill="#FBBF24" />
          
          <circle cx="37" cy="53" r="2.5" fill="#FFFFFF" />
          <circle cx="67" cy="53" r="2.5" fill="#FFFFFF" />

          {/* Golden Geometric Beak */}
          <polygon points="50,68 44,80 56,80" fill="#F59E0B" />

          {/* Quantum Wisdom Rays */}
          <path d="M40 92 L50 100 L60 92" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
          <path d="M35 98 L50 108 L65 98" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Floating Telemetry Code Tokens & Badges */}
        <g>
          {/* Token 1: Raft Consensus */}
          <rect x="70" y="240" width="130" height="34" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.6" />
          <circle cx="86" cy="257" r="4" fill="#38BDF8" />
          <text x="98" y="261" fill="#E0F2FE" fontSize="10" fontFamily="monospace" fontWeight="bold">Raft.quorum(5/5)</text>

          {/* Token 2: Autonomous Neural Attention */}
          <rect x="410" y="235" width="135" height="34" rx="8" fill="#0F172A" stroke="#A855F7" strokeWidth="1" strokeOpacity="0.6" />
          <circle cx="426" cy="252" r="4" fill="#A855F7" />
          <text x="438" y="256" fill="#F3E8FF" fontSize="10" fontFamily="monospace" fontWeight="bold">Attention.QKV()</text>

          {/* Token 3: Cryptographic Diploma */}
          <rect x="235" y="325" width="130" height="30" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.7" />
          <circle cx="250" cy="340" r="3.5" fill="#F59E0B" />
          <text x="260" y="344" fill="#FEF3C7" fontSize="9.5" fontFamily="monospace" fontWeight="bold">ECDSA-Cert.ver()</text>
        </g>

        {/* Coordinates and Grid Lines */}
        <text x="40" y="50" fill="#64748B" fontSize="9" fontFamily="monospace">ACADEMY_OBSERVATORY::SEC_7</text>
        <text x="440" y="50" fill="#64748B" fontSize="9" fontFamily="monospace">LATENCY: 0.12ms [OPTIMAL]</text>
        <line x1="40" y1="58" x2="200" y2="58" stroke="#334155" strokeWidth="1" />
        <line x1="400" y1="58" x2="560" y2="58" stroke="#334155" strokeWidth="1" />
      </svg>

      {/* Floating HUD Badges */}
      <div className="absolute bottom-4 left-6 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-[11px] font-mono text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>OWLY NEURAL INFRASTRUCTURE ONLINE</span>
      </div>

      <div className="absolute top-4 right-6 hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-[10px] font-mono text-indigo-300">
        <span>FACULTY ACCREDITED</span>
        <span className="text-amber-400">★ 4.96</span>
      </div>
    </div>
  );
};

export const DisciplineArtworks: Record<string, React.FC<{ className?: string }>> = {
  Engineering: ({ className = 'w-full h-full' }) => (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-sky-950/70 via-slate-900 to-slate-950 p-4 border border-sky-500/30 ${className}`}>
      <svg viewBox="0 0 240 140" fill="none" className="w-full h-full drop-shadow">
        {/* Raft cluster & Distributed Nodes */}
        <circle cx="50" cy="50" r="18" fill="#0C4A6E" stroke="#0284C7" strokeWidth="2" />
        <circle cx="120" cy="35" r="22" fill="#075985" stroke="#38BDF8" strokeWidth="2.5" />
        <circle cx="190" cy="55" r="18" fill="#0C4A6E" stroke="#0284C7" strokeWidth="2" />
        <circle cx="85" cy="105" r="16" fill="#082F49" stroke="#0369A1" strokeWidth="1.5" />
        <circle cx="155" cy="105" r="16" fill="#082F49" stroke="#0369A1" strokeWidth="1.5" />

        {/* Active gRPC Replication Beams */}
        <line x1="68" y1="46" x2="98" y2="40" stroke="#38BDF8" strokeWidth="2" />
        <line x1="142" y1="40" x2="172" y2="48" stroke="#38BDF8" strokeWidth="2" />
        <line x1="62" y1="64" x2="75" y2="92" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="178" y1="68" x2="162" y2="92" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="101" y1="105" x2="139" y2="105" stroke="#0369A1" strokeWidth="1.5" />

        {/* Labels */}
        <text x="108" y="38" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="monospace">LEADER</text>
        <text x="43" y="53" fill="#BAE6FD" fontSize="8" fontFamily="monospace">NODE_1</text>
        <text x="183" y="58" fill="#BAE6FD" fontSize="8" fontFamily="monospace">NODE_2</text>
        <text x="73" y="108" fill="#7DD3FC" fontSize="7" fontFamily="monospace">FOLLOWER</text>
        <text x="143" y="108" fill="#7DD3FC" fontSize="7" fontFamily="monospace">FOLLOWER</text>

        {/* Heartbeat pulse waves */}
        <circle cx="120" cy="35" r="30" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="2 3" />
      </svg>
    </div>
  ),

  'Artificial Intelligence': ({ className = 'w-full h-full' }) => (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-950/70 via-slate-900 to-slate-950 p-4 border border-purple-500/30 ${className}`}>
      <svg viewBox="0 0 240 140" fill="none" className="w-full h-full drop-shadow">
        {/* Neural Network Attention & Agent Swarm */}
        <g stroke="#9333EA" strokeWidth="1.2" strokeOpacity="0.5">
          <line x1="40" y1="30" x2="110" y2="40" />
          <line x1="40" y1="30" x2="110" y2="70" />
          <line x1="40" y1="70" x2="110" y2="40" />
          <line x1="40" y1="70" x2="110" y2="70" />
          <line x1="40" y1="70" x2="110" y2="100" />
          <line x1="40" y1="110" x2="110" y2="70" />
          <line x1="40" y1="110" x2="110" y2="100" />

          <line x1="110" y1="40" x2="180" y2="50" stroke="#C084FC" strokeWidth="1.5" />
          <line x1="110" y1="70" x2="180" y2="50" stroke="#C084FC" strokeWidth="1.5" />
          <line x1="110" y1="70" x2="180" y2="90" stroke="#C084FC" strokeWidth="1.5" />
          <line x1="110" y1="100" x2="180" y2="90" stroke="#C084FC" strokeWidth="1.5" />
        </g>

        {/* Input Layer */}
        <circle cx="40" cy="30" r="8" fill="#581C87" stroke="#A855F7" strokeWidth="1.5" />
        <circle cx="40" cy="70" r="8" fill="#581C87" stroke="#A855F7" strokeWidth="1.5" />
        <circle cx="40" cy="110" r="8" fill="#581C87" stroke="#A855F7" strokeWidth="1.5" />

        {/* Transformer Hidden Layer / Attention Head */}
        <circle cx="110" cy="40" r="10" fill="#6B21A8" stroke="#C084FC" strokeWidth="2" />
        <circle cx="110" cy="70" r="13" fill="#7E22CE" stroke="#E9D5FF" strokeWidth="2" />
        <circle cx="110" cy="100" r="10" fill="#6B21A8" stroke="#C084FC" strokeWidth="2" />

        {/* Autonomous Output Action Nodes */}
        <circle cx="180" cy="50" r="12" fill="#9333EA" stroke="#F3E8FF" strokeWidth="2" />
        <circle cx="180" cy="90" r="12" fill="#9333EA" stroke="#F3E8FF" strokeWidth="2" />

        <text x="168" y="54" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace">TOOL</text>
        <text x="168" y="94" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace">EXEC</text>
      </svg>
    </div>
  ),

  'Finance & Trading': ({ className = 'w-full h-full' }) => (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 p-4 border border-emerald-500/30 ${className}`}>
      <svg viewBox="0 0 240 140" fill="none" className="w-full h-full drop-shadow">
        {/* Candlesticks & Depth of Market Curve */}
        <path d="M 20 115 Q 70 100 110 65 T 220 25" stroke="#34D399" strokeWidth="2.5" />
        <path d="M 20 115 Q 70 100 110 65 T 220 25 L 220 130 L 20 130 Z" fill="#064E3B" fillOpacity="0.25" />

        {/* High Frequency Candlesticks */}
        <line x1="50" y1="70" x2="50" y2="120" stroke="#10B981" strokeWidth="1.5" />
        <rect x="44" y="85" width="12" height="25" fill="#10B981" rx="2" />

        <line x1="85" y1="50" x2="85" y2="105" stroke="#F87171" strokeWidth="1.5" />
        <rect x="79" y="65" width="12" height="30" fill="#EF4444" rx="2" />

        <line x1="120" y1="40" x2="120" y2="90" stroke="#10B981" strokeWidth="1.5" />
        <rect x="114" y="50" width="12" height="28" fill="#10B981" rx="2" />

        <line x1="155" y1="25" x2="155" y2="75" stroke="#10B981" strokeWidth="1.5" />
        <rect x="149" y="32" width="12" height="32" fill="#10B981" rx="2" />

        <line x1="190" y1="15" x2="190" y2="60" stroke="#34D399" strokeWidth="1.5" />
        <rect x="184" y="22" width="12" height="26" fill="#34D399" rx="2" />

        <text x="30" y="25" fill="#6EE7B7" fontSize="9" fontFamily="monospace" fontWeight="bold">ALPHA::SHARPE 3.42</text>
      </svg>
    </div>
  ),

  'Design Systems': ({ className = 'w-full h-full' }) => (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-950/70 via-slate-900 to-slate-950 p-4 border border-amber-500/30 ${className}`}>
      <svg viewBox="0 0 240 140" fill="none" className="w-full h-full drop-shadow">
        {/* Golden Ratio & Spatial Grid */}
        <rect x="30" y="20" width="60" height="60" stroke="#F59E0B" strokeWidth="1.5" fill="#78350F" fillOpacity="0.2" rx="4" />
        <rect x="90" y="20" width="40" height="40" stroke="#FBBF24" strokeWidth="1.5" fill="#78350F" fillOpacity="0.2" rx="4" />
        <circle cx="110" cy="85" r="25" stroke="#F59E0B" strokeWidth="1.5" fill="#B45309" fillOpacity="0.2" />

        <line x1="20" y1="110" x2="220" y2="110" stroke="#D97706" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="20" y1="30" x2="220" y2="30" stroke="#78350F" strokeWidth="1" strokeDasharray="4 4" />

        <rect x="150" y="35" width="65" height="55" rx="6" stroke="#FBBF24" strokeWidth="1.5" fill="#1E293B" />
        <circle cx="165" cy="50" r="5" fill="#38BDF8" />
        <circle cx="180" cy="50" r="5" fill="#818CF8" />
        <circle cx="195" cy="50" r="5" fill="#F59E0B" />
        <rect x="160" y="65" width="45" height="4" rx="2" fill="#64748B" />
        <rect x="160" y="74" width="30" height="4" rx="2" fill="#475569" />

        <text x="30" y="130" fill="#FEF3C7" fontSize="8.5" fontFamily="monospace">WCAG::AAA 8.2:1 COMPLIANT</text>
      </svg>
    </div>
  )
};

export const AdminTelemetryVisual: React.FC<{ className?: string }> = ({ className = 'w-full h-32' }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-950 border border-emerald-500/30 p-4 ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
      <div className="relative z-10 flex items-center justify-between h-full">
        <div>
          <span className="font-mono text-[10px] uppercase text-emerald-400 tracking-wider font-semibold">
            PLATFORM GOVERNANCE & AUDIT TRAIL
          </span>
          <div className="text-lg font-bold text-white mt-1">Cryptographic Ledger Active</div>
          <div className="text-xs text-slate-400 mt-0.5">Real-time student transactions, instructor escrows, and accredited certifications</div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-emerald-400">99.99% HEALTH</div>
            <div className="text-[10px] text-slate-500 font-mono">0 BLOCKED REVS</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono text-xs">
            200
          </div>
        </div>
      </div>
    </div>
  );
};
