import React from 'react';

/**
 * Dedicated vector icon for OWLY SAT platform launcher
 * Features the signature Owly silhouette with academic graduation mortarboard and SAT emblem.
 */
export const OwlySatLaunchIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 36, 
  className = '' 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 44 44" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Container squircle with subtle border */}
      <rect width="44" height="44" rx="10" fill="url(#owly-sat-bg)" stroke="#F59E0B" strokeWidth="1.2" strokeOpacity="0.4" />
      
      {/* Subtle background glow */}
      <circle cx="22" cy="18" r="14" fill="#6366F1" fillOpacity="0.15" filter="blur(4px)" />

      {/* Graduation Cap / Mortarboard */}
      <path d="M22 6L33 11L22 16L11 11L22 6Z" fill="#F59E0B" />
      <path d="M16 13.5V17C16 19.5 18.5 21 22 21C25.5 21 28 19.5 28 17V13.5" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M31 11.5V17.5C31 18 31.5 18.5 32 18.5" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="32" cy="19.5" r="1" fill="#FDE68A" />

      {/* Owly Spectacles with Golden Core */}
      <circle cx="16.5" cy="22" r="4.2" fill="#0F172A" stroke="#FBBF24" strokeWidth="1.3" />
      <circle cx="27.5" cy="22" r="4.2" fill="#0F172A" stroke="#FBBF24" strokeWidth="1.3" />
      <path d="M20.7 21.5C21.5 20.8 22.5 20.8 23.3 21.5" stroke="#FBBF24" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="16.5" cy="22" r="2" fill="#F59E0B" />
      <circle cx="17.2" cy="21.3" r="0.8" fill="#FFFFFF" />
      <circle cx="27.5" cy="22" r="2" fill="#F59E0B" />
      <circle cx="28.2" cy="21.3" r="0.8" fill="#FFFFFF" />

      {/* SAT Text Badge */}
      <rect x="10" y="28.5" width="24" height="10.5" rx="3.5" fill="#1E1B4B" stroke="#818CF8" strokeWidth="1" />
      <text 
        x="22" 
        y="36.5" 
        textAnchor="middle" 
        fill="#FDE68A" 
        fontSize="7.5" 
        fontWeight="800" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        letterSpacing="0.8"
      >
        SAT
      </text>

      <defs>
        <linearGradient id="owly-sat-bg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E1B4B" />
          <stop offset="0.6" stopColor="#0F172A" />
          <stop offset="1" stopColor="#1E1B4B" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/**
 * Dedicated vector icon for OWLY IELTS platform launcher
 * Features the signature Owly silhouette with global accreditation compass and IELTS emblem.
 */
export const OwlyIeltsLaunchIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 36, 
  className = '' 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 44 44" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Container squircle with subtle border */}
      <rect width="44" height="44" rx="10" fill="url(#owly-ielts-bg)" stroke="#10B981" strokeWidth="1.2" strokeOpacity="0.4" />
      
      {/* Subtle background glow */}
      <circle cx="22" cy="18" r="14" fill="#06B6D4" fillOpacity="0.15" filter="blur(4px)" />

      {/* Global Meridian / Academic Laurels */}
      <circle cx="22" cy="17" r="10" stroke="#059669" strokeWidth="1" strokeDasharray="2 2" />
      <ellipse cx="22" cy="17" rx="5" ry="10" stroke="#10B981" strokeWidth="1" strokeOpacity="0.6" />
      <line x1="12" y1="17" x2="32" y2="17" stroke="#10B981" strokeWidth="1" strokeOpacity="0.6" />

      {/* Owly Spectacles with Emerald/Teal Core */}
      <circle cx="16.5" cy="17.5" r="4.2" fill="#0F172A" stroke="#34D399" strokeWidth="1.3" />
      <circle cx="27.5" cy="17.5" r="4.2" fill="#0F172A" stroke="#34D399" strokeWidth="1.3" />
      <path d="M20.7 17C21.5 16.3 22.5 16.3 23.3 17" stroke="#34D399" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="16.5" cy="17.5" r="2" fill="#10B981" />
      <circle cx="17.2" cy="16.8" r="0.8" fill="#FFFFFF" />
      <circle cx="27.5" cy="17.5" r="2" fill="#10B981" />
      <circle cx="28.2" cy="16.8" r="0.8" fill="#FFFFFF" />

      {/* Beak */}
      <path d="M20.5 21L22 23.5L23.5 21Z" fill="#F59E0B" />

      {/* IELTS Text Badge */}
      <rect x="8" y="28.5" width="28" height="10.5" rx="3.5" fill="#064E3B" stroke="#34D399" strokeWidth="1" />
      <text 
        x="22" 
        y="36.5" 
        textAnchor="middle" 
        fill="#A7F3D0" 
        fontSize="7" 
        fontWeight="800" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        letterSpacing="0.6"
      >
        IELTS
      </text>

      <defs>
        <linearGradient id="owly-ielts-bg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#064E3B" />
          <stop offset="0.6" stopColor="#0F172A" />
          <stop offset="1" stopColor="#042F2E" />
        </linearGradient>
      </defs>
    </svg>
  );
};

import { useLms } from '../context/LmsContext';

/**
 * Ecosystem Launchers - strictly renders interactive launch icons to open in the SAME IFRAME
 * with NO URL or link text displayed, completely avoiding <a> anchor tags.
 */
export const EcosystemLaunchers: React.FC<{
  variant?: 'navbar' | 'compact' | 'footer';
  className?: string;
  onSelectPlatform?: (platform: 'sat' | 'ielts') => void;
}> = ({ variant = 'navbar', className = '', onSelectPlatform }) => {
  const { embeddedEcosystem, setEmbeddedEcosystem } = useLms();
  const iconSize = variant === 'compact' ? 32 : variant === 'footer' ? 34 : 36;

  const handleLaunch = (platform: 'sat' | 'ielts') => {
    if (onSelectPlatform) {
      onSelectPlatform(platform);
    } else {
      setEmbeddedEcosystem(platform);
    }
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Button to open OWLY SAT in the same iframe, NO link tag */}
      <button
        type="button"
        onClick={() => handleLaunch('sat')}
        aria-label="Launch OWLY SAT"
        title="Launch OWLY SAT"
        className={`group relative inline-flex items-center justify-center p-0.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-xs hover:shadow-md cursor-pointer ${
          embeddedEcosystem === 'sat' 
            ? 'ring-2 ring-amber-500 ring-offset-1 bg-amber-500/10' 
            : 'bg-transparent'
        }`}
      >
        <OwlySatLaunchIcon size={iconSize} className="transition-transform group-hover:scale-105" />
      </button>

      {/* Button to open OWLY IELTS in the same iframe, NO link tag */}
      <button
        type="button"
        onClick={() => handleLaunch('ielts')}
        aria-label="Launch OWLY IELTS"
        title="Launch OWLY IELTS"
        className={`group relative inline-flex items-center justify-center p-0.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-xs hover:shadow-md cursor-pointer ${
          embeddedEcosystem === 'ielts' 
            ? 'ring-2 ring-emerald-500 ring-offset-1 bg-emerald-500/10' 
            : 'bg-transparent'
        }`}
      >
        <OwlyIeltsLaunchIcon size={iconSize} className="transition-transform group-hover:scale-105" />
      </button>
    </div>
  );
};
