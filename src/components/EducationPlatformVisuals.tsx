import React from 'react';
import { 
  Users, 
  Award, 
  BookOpen, 
  Star, 
  Sparkles, 
  Video, 
  CheckCircle, 
  ArrowRight, 
  Compass, 
  Cpu, 
  ShieldCheck, 
  Flame,
  Globe,
  Zap
} from 'lucide-react';
import { OwlyLogoIcon } from './OwlyBrand';
import { DisciplineArtworks } from './ThemeArtworks';

export const ScholarStatsBanner: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Active Scholars</span>
          <Users className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
          24,850+
        </div>
        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Across 84 countries worldwide</span>
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Verified Completion</span>
          <Award className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-extrabold text-amber-400 font-mono tracking-tight">
          98.4%
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Verifiable cryptographic credentials
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Faculty Rating</span>
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        </div>
        <div className="text-2xl font-extrabold text-white font-mono tracking-tight flex items-center gap-1.5">
          <span>4.96</span>
          <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Peer-reviewed masterclasses
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Live Classrooms</span>
          <Video className="w-4 h-4 text-rose-400" />
        </div>
        <div className="text-2xl font-extrabold text-indigo-400 font-mono tracking-tight">
          Google Meet
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Direct mentorship & office hours
        </p>
      </div>
    </div>
  );
};

export const LearningTracksShowcase: React.FC<{ onSelectCategory?: (cat: string) => void }> = ({ onSelectCategory }) => {
  const tracks = [
    {
      id: 'Engineering',
      title: 'Distributed Systems & Cloud Ops',
      description: 'Raft consensus, multi-region replication, and fault-tolerant cloud backends.',
      border: 'hover:border-sky-500/50',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      coursesCount: '4 Masterclasses',
      category: 'Engineering'
    },
    {
      id: 'Artificial Intelligence',
      title: 'GenAI & Autonomous Agent Graphs',
      description: 'Transformer attention, tool grounding, and sandboxed DAG execution swarms.',
      border: 'hover:border-purple-500/50',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      coursesCount: '3 Masterclasses',
      category: 'Artificial Intelligence'
    },
    {
      id: 'Finance & Trading',
      title: 'Quantitative Finance & Microstructure',
      description: 'Limit order book dynamics, stochastic volatility, and algorithmic execution.',
      border: 'hover:border-emerald-500/50',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      coursesCount: '2 Masterclasses',
      category: 'Finance & Trading'
    },
    {
      id: 'Design Systems',
      title: 'Production Design Systems & Front-End',
      description: 'Design tokens, accessible component math, and high-performance WebGL interfaces.',
      border: 'hover:border-amber-500/50',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      coursesCount: '2 Masterclasses',
      category: 'Design Systems'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-indigo-400 font-semibold block mb-1">
            Curated Academic Pathways
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Specialized Masterclass Disciplines
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {tracks.map((track) => {
          const DisciplineArtwork = DisciplineArtworks[track.category];
          return (
            <div
              key={track.id}
              onClick={() => onSelectCategory?.(track.id)}
              className={`rounded-2xl bg-slate-900/90 border border-slate-800 ${track.border} transition-all cursor-pointer flex flex-col justify-between group hover:bg-slate-900 overflow-hidden shadow-lg hover:shadow-indigo-500/10`}
            >
              {/* Illustrative Schematic Header */}
              <div className="h-28 w-full overflow-hidden border-b border-slate-800/80 group-hover:scale-[1.02] transition-transform duration-300">
                {DisciplineArtwork && <DisciplineArtwork className="w-full h-full" />}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                      Curriculum Track
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${track.badgeColor}`}>
                      {track.coursesCount}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {track.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {track.description}
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white transition-colors border-t border-slate-800/60">
                  <span>Explore Curriculum</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
