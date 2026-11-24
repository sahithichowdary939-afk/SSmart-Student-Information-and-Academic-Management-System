import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
}

export const JNTUACEPLogo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'light',
  className = ''
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-xs', sub: 'text-[9px]' },
    md: { icon: 'w-10 h-10', text: 'text-sm font-bold', sub: 'text-[10px]' },
    lg: { icon: 'w-14 h-14', text: 'text-base font-bold', sub: 'text-xs' },
    xl: { icon: 'w-20 h-20', text: 'text-lg font-bold', sub: 'text-xs' }
  };

  const currentSize = sizeMap[size];
  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official JNTUACEP Emblem SVG */}
      <div className={`${currentSize.icon} flex-shrink-0 relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Sunburst / Cog Border */}
          <circle cx="60" cy="60" r="56" fill="#0d2b45" stroke="#f6c90e" strokeWidth="4" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="#f6c90e" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Golden Laurel / Ring */}
          <circle cx="60" cy="60" r="42" fill="#143e6c" stroke="#f6c90e" strokeWidth="2.5" />

          {/* Book of Knowledge */}
          <path
            d="M38 74C46 71 54 72 60 76C66 72 74 71 82 74V52C74 49 66 50 60 54C54 50 46 49 38 52V74Z"
            fill="#ffffff"
            stroke="#f6c90e"
            strokeWidth="2"
          />
          <line x1="60" y1="54" x2="60" y2="76" stroke="#0d2b45" strokeWidth="1.5" />

          {/* Flame of Wisdom (Torch / Jyoti) */}
          <path
            d="M60 30C63 36 67 40 64 45C61 48 58 48 56 45C53 41 57 36 60 30Z"
            fill="#ff5722"
          />
          <path
            d="M60 34C61.5 38 63.5 40.5 62 43.5C60.5 45.5 59 45.5 58 43.5C56.5 41 58.5 38 60 34Z"
            fill="#ffeb3b"
          />

          {/* Atom Rings representing Engineering & Technology */}
          <ellipse cx="60" cy="62" rx="28" ry="10" transform="rotate(-30 60 62)" stroke="#90caf9" strokeWidth="1" strokeDasharray="2 2" />
          <ellipse cx="60" cy="62" rx="28" ry="10" transform="rotate(30 60 62)" stroke="#90caf9" strokeWidth="1" strokeDasharray="2 2" />

          {/* Text Seal Arc */}
          <text x="60" y="22" textAnchor="middle" fill="#f6c90e" fontSize="7.5" fontWeight="bold" letterSpacing="0.5">
            JNTUACEP
          </text>
          <text x="60" y="94" textAnchor="middle" fill="#f6c90e" fontSize="6.5" fontWeight="bold" letterSpacing="0.5">
            ESTD 2006 • AUTONOMOUS
          </text>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`${currentSize.text} ${isDark ? 'text-slate-900' : 'text-white'} tracking-tight leading-tight`}>
              JNTUA College of Engineering
            </span>
          </div>
          <span className={`${currentSize.sub} font-semibold ${isDark ? 'text-blue-700' : 'text-blue-300'} tracking-wide uppercase`}>
            Pulivendula • Autonomous
          </span>
        </div>
      )}
    </div>
  );
};
