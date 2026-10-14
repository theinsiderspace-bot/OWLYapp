import React from 'react';

interface OwlyBrandProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export const OwlyLogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Glow / Soft Halo */}
      <circle cx="24" cy="24" r="22" fill="url(#owly-bg-grad)" />
      
      {/* Owl Outer Silhouette & Ear Tufts */}
      <path 
        d="M12 14L16 20C18 19 20 18.5 24 18.5C28 18.5 30 19 32 20L36 14C35 20 37 26 36 32C35 38 30 41 24 41C18 41 13 38 12 32C11 26 13 20 12 14Z" 
        fill="url(#owly-body-grad)"
        stroke="#4F46E5"
        strokeWidth="1.2"
      />

      {/* Owl Facial Mask / Wisdom Monocle Geometry */}
      <circle cx="18" cy="26" r="6.5" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.8" />
      <circle cx="30" cy="26" r="6.5" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.8" />

      {/* Bridge Between Spectacles */}
      <path d="M22 25.5C23 24.5 25 24.5 26 25.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />

      {/* Wise Golden Pupil Core */}
      <circle cx="18" cy="26" r="3.2" fill="#FBBF24" />
      <circle cx="19" cy="25" r="1.2" fill="#FFFFFF" />
      <circle cx="30" cy="26" r="3.2" fill="#FBBF24" />
      <circle cx="31" cy="25" r="1.2" fill="#FFFFFF" />

      {/* Sleek Geometric Beak */}
      <path d="M22 30L24 34L26 30Z" fill="#F59E0B" />

      {/* Academic Chest Chevrons */}
      <path d="M20 37L24 39.5L28 37" stroke="#818CF8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

      <defs>
        <radialGradient id="owly-bg-grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(24 24) rotate(90) scale(22)">
          <stop stopColor="#1E1B4B" />
          <stop offset="1" stopColor="#0F172A" />
        </radialGradient>
        <linearGradient id="owly-body-grad" x1="12" y1="14" x2="36" y2="41" gradientUnits="userSpaceOnUse">
          <stop stopColor="#312E81" />
          <stop offset="0.5" stopColor="#1E1B4B" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const OwlyBrand: React.FC<OwlyBrandProps> = ({ 
  size = 'md', 
  showSubtitle = true,
  className = '',
  theme = 'dark'
}) => {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const isLight = theme === 'light';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center filter drop-shadow-sm">
        <OwlyLogoIcon size={iconSizes[size]} />
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight font-sans ${textSizes[size]} ${isLight ? 'text-white' : 'text-slate-900'}`}>
            OWLY
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        </div>

        {showSubtitle && (
          <span className={`text-[9px] font-mono tracking-widest uppercase font-semibold mt-0.5 ${isLight ? 'text-indigo-200/80' : 'text-indigo-600'}`}>
            ONLINE EDUCATION
          </span>
        )}
      </div>
    </div>
  );
};

export const OwlyAcademyCrest: React.FC<{ size?: number; className?: string }> = ({ size = 64, className = '' }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="crest-shield" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E1B4B" />
            <stop offset="0.6" stopColor="#0F172A" />
            <stop offset="1" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="crest-gold" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FDE68A" />
            <stop offset="0.5" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="crest-indigo" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#818CF8" />
            <stop offset="1" stopColor="#4F46E5" />
          </linearGradient>
        </defs>

        {/* Outer Laurel Wreath Leaves */}
        <g stroke="url(#crest-gold)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.85">
          {/* Left Wreath Branch */}
          <path d="M 28 80 C 15 65 14 35 32 18" />
          <path d="M 20 68 C 15 63 17 58 24 64" fill="#F59E0B" fillOpacity="0.2" />
          <path d="M 16 52 C 12 46 15 42 22 49" fill="#F59E0B" fillOpacity="0.2" />
          <path d="M 19 36 C 16 30 20 27 27 34" fill="#F59E0B" fillOpacity="0.2" />

          {/* Right Wreath Branch */}
          <path d="M 72 80 C 85 65 86 35 68 18" />
          <path d="M 80 68 C 85 63 83 58 76 64" fill="#F59E0B" fillOpacity="0.2" />
          <path d="M 84 52 C 88 46 85 42 78 49" fill="#F59E0B" fillOpacity="0.2" />
          <path d="M 81 36 C 84 30 80 27 73 34" fill="#F59E0B" fillOpacity="0.2" />
        </g>

        {/* Heraldic Shield */}
        <path 
          d="M 50 12 L 74 24 C 74 56 64 74 50 86 C 36 74 26 56 26 24 Z" 
          fill="url(#crest-shield)" 
          stroke="url(#crest-gold)" 
          strokeWidth="2" 
        />

        {/* Academic Owl Icon */}
        <g transform="translate(26, 26)">
          <OwlyLogoIcon size={48} />
        </g>

        {/* Star of Excellence */}
        <polygon points="50,4 52,9 57,9 53,12 55,17 50,14 45,17 47,12 43,9 48,9" fill="#FBBF24" />
      </svg>
    </div>
  );
};

