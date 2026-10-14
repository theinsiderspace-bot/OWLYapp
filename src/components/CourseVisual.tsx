import React from 'react';

interface CourseVisualProps {
  category: string;
  theme: {
    accentColor: string;
    gradientFrom: string;
    gradientTo: string;
    icon: string;
  };
  title: string;
  className?: string;
}

export const CourseVisual: React.FC<CourseVisualProps> = ({ category, theme, title, className = 'h-48' }) => {
  return (
    <div className={`relative overflow-hidden w-full ${className} bg-slate-950 flex flex-col justify-between p-5 border-b border-slate-800/80 group`}>
      {/* Background Radial Ambiance Gradients based on discipline */}
      <div 
        className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-2xl opacity-40 pointer-events-none group-hover:opacity-60 transition-opacity"
        style={{ backgroundColor: theme.accentColor }}
      />
      <div 
        className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ backgroundColor: '#4F46E5' }}
      />

      {/* Cybernetic Dot & Matrix Mesh */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
          backgroundSize: '18px 18px'
        }}
      />

      {/* Watermark OWLY Monocle Silhouette */}
      <div className="absolute right-2 top-2 opacity-10 pointer-events-none select-none">
        <svg width="100" height="100" viewBox="0 0 48 48" fill="none">
          <circle cx="18" cy="24" r="10" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="30" cy="24" r="10" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M22 23.5C23 22.5 25 22.5 26 23.5" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M22 29L24 33L26 29Z" fill="#FFFFFF" />
        </svg>
      </div>

      {/* SVG Domain Illustration / Technical Schematic */}
      <div className="absolute right-2 top-2 bottom-2 w-3/5 opacity-85 pointer-events-none flex items-center justify-end">
        {category === 'Engineering' && (
          <svg className="w-full h-full max-h-36 drop-shadow-md" viewBox="0 0 220 150" fill="none">
            {/* Cluster Nodes & Pipelines */}
            <circle cx="45" cy="45" r="15" stroke="#0284C7" strokeWidth="2" fill="#0284C7" fillOpacity="0.15" />
            <circle cx="165" cy="40" r="15" stroke="#0284C7" strokeWidth="2" fill="#0284C7" fillOpacity="0.15" />
            <circle cx="105" cy="105" r="20" stroke="#38BDF8" strokeWidth="2.5" fill="#38BDF8" fillOpacity="0.25" />
            <circle cx="185" cy="115" r="12" stroke="#0284C7" strokeWidth="1.5" />
            
            {/* Connecting replication pathways */}
            <path d="M58 45 L89 95" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M152 45 L121 95" stroke="#0284C7" strokeWidth="1.5" />
            <path d="M125 107 L173 115" stroke="#38BDF8" strokeWidth="1.5" />
            
            {/* Pulse Wave */}
            <circle cx="105" cy="105" r="28" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2 3" />

            <text x="39" y="49" fill="#E0F2FE" fontSize="9" fontFamily="monospace" fontWeight="bold">N1</text>
            <text x="159" y="44" fill="#E0F2FE" fontSize="9" fontFamily="monospace" fontWeight="bold">N2</text>
            <text x="96" y="109" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="monospace">RAFT</text>
            <text x="90" y="140" fill="#7DD3FC" fontSize="7.5" fontFamily="monospace">p99::1.2ms</text>
          </svg>
        )}

        {category === 'Artificial Intelligence' && (
          <svg className="w-full h-full max-h-36 drop-shadow-md" viewBox="0 0 220 150" fill="none">
            {/* Neural Matrix & Manifold */}
            <circle cx="40" cy="25" r="6" fill="#818CF8" />
            <circle cx="40" cy="75" r="6" fill="#818CF8" />
            <circle cx="40" cy="125" r="6" fill="#818CF8" />
            <circle cx="105" cy="35" r="7" fill="#A5B4FC" />
            <circle cx="105" cy="75" r="9" fill="#C7D2FE" stroke="#818CF8" strokeWidth="1.5" />
            <circle cx="105" cy="115" r="7" fill="#A5B4FC" />
            <circle cx="170" cy="55" r="8" fill="#6366F1" />
            <circle cx="170" cy="95" r="8" fill="#6366F1" />
            
            {/* Attention lines */}
            <line x1="46" y1="25" x2="98" y2="35" stroke="#4F46E5" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="46" y1="25" x2="96" y2="75" stroke="#4F46E5" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="46" y1="75" x2="96" y2="75" stroke="#818CF8" strokeWidth="1.8" />
            <line x1="46" y1="75" x2="98" y2="115" stroke="#4F46E5" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="46" y1="125" x2="98" y2="115" stroke="#4F46E5" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="112" y1="35" x2="162" y2="55" stroke="#818CF8" strokeWidth="1.5" />
            <line x1="114" y1="75" x2="162" y2="55" stroke="#C084FC" strokeWidth="1.8" />
            <line x1="114" y1="75" x2="162" y2="95" stroke="#C084FC" strokeWidth="1.8" />
            <line x1="112" y1="115" x2="162" y2="95" stroke="#818CF8" strokeWidth="1.5" />
            
            <circle cx="105" cy="75" r="16" stroke="#C084FC" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 3" />
            <text x="140" y="22" fill="#E9D5FF" fontSize="7.5" fontFamily="monospace">AGENT_GRAPH</text>
          </svg>
        )}

        {category === 'Finance & Trading' && (
          <svg className="w-full h-full max-h-36 drop-shadow-md" viewBox="0 0 220 150" fill="none">
            {/* Candlestick & Order Book Graph */}
            <line x1="30" y1="55" x2="30" y2="115" stroke="#34D399" strokeWidth="1.5" />
            <rect x="24" y="70" width="12" height="30" fill="#10B981" rx="1.5" />

            <line x1="65" y1="35" x2="65" y2="105" stroke="#F87171" strokeWidth="1.5" />
            <rect x="59" y="50" width="12" height="40" fill="#EF4444" rx="1.5" />

            <line x1="100" y1="25" x2="100" y2="90" stroke="#34D399" strokeWidth="1.5" />
            <rect x="94" y="38" width="12" height="38" fill="#10B981" rx="1.5" />

            <line x1="135" y1="15" x2="135" y2="80" stroke="#34D399" strokeWidth="1.5" />
            <rect x="129" y="28" width="12" height="32" fill="#10B981" rx="1.5" />

            <line x1="170" y1="10" x2="170" y2="65" stroke="#34D399" strokeWidth="1.5" />
            <rect x="164" y="18" width="12" height="35" fill="#10B981" rx="1.5" />

            {/* Depth Curve */}
            <path d="M 20 95 Q 85 75 185 20" stroke="#6EE7B7" strokeWidth="2.5" />
            <text x="135" y="130" fill="#A7F3D0" fontSize="7.5" fontFamily="monospace">MICROSTRUCTURE</text>
          </svg>
        )}

        {category === 'Design Systems' && (
          <svg className="w-full h-full max-h-36 drop-shadow-md" viewBox="0 0 220 150" fill="none">
            {/* Bauhaus Grid & Typographic Scale */}
            <rect x="25" y="25" width="48" height="48" stroke="#F59E0B" strokeWidth="1.8" fill="#F59E0B" fillOpacity="0.15" rx="3" />
            <circle cx="125" cy="50" r="24" stroke="#FBBF24" strokeWidth="1.8" fill="#FBBF24" fillOpacity="0.15" />
            <rect x="25" y="90" width="135" height="26" stroke="#D97706" strokeWidth="1.5" rx="4" fill="#78350F" fillOpacity="0.2" />
            <line x1="45" y1="103" x2="140" y2="103" stroke="#FDE68A" strokeWidth="2" strokeDasharray="4 4" />
            
            <circle cx="185" cy="40" r="4" fill="#38BDF8" />
            <circle cx="185" cy="55" r="4" fill="#818CF8" />
            <circle cx="185" cy="70" r="4" fill="#F59E0B" />
            
            <text x="145" y="32" fill="#FDE68A" fontSize="8.5" fontFamily="monospace">8px_GRID</text>
            <text x="35" y="107" fill="#FEF3C7" fontSize="8" fontFamily="monospace">tokens.palette</text>
          </svg>
        )}
      </div>

      {/* Top Tag & Discipline Badge */}
      <div className="relative z-10 flex items-center justify-between text-xs">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accentColor }} />
          <span>{category}</span>
        </span>
        <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25 font-bold tracking-tight">
          OWL-{category.substring(0, 3).toUpperCase()}
        </span>
      </div>

      {/* Bottom Title & Schematic Meta */}
      <div className="relative z-10 mt-auto">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-1 rounded-full" style={{ backgroundColor: theme.accentColor }} />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            FACULTY MASTERCLASS
          </span>
        </div>
        <h3 className="text-white text-base font-bold leading-snug line-clamp-2 max-w-[85%] group-hover:text-indigo-200 transition-colors">
          {title}
        </h3>
      </div>
    </div>
  );
};
