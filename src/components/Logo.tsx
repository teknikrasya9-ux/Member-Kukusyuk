import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showText = false }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} relative transition-transform duration-300 hover:scale-105 drop-shadow-md select-none`}
      >
        <img
          src="/logo-kukusyuk.svg"
          alt="Kukusyuk CampusFit Logo"
          className="w-full h-full object-contain filter drop-shadow-md"
          onError={(e) => {
            // Fallback SVG if svg file fails to load
            const target = e.currentTarget;
            target.style.display = 'none';
          }}
        />
      </div>
      {showText && (
        <div className="mt-1.5 text-center">
          <span className="text-xs font-bold tracking-wider text-emerald-950 uppercase bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300">
            CampusFit Member
          </span>
        </div>
      )}
    </div>
  );
};

