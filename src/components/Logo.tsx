import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showText = false }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <img
        src="/logo-kukusyuk.png"
        alt="Logo Kukusyuk"
        className={`${sizeClasses[size]} object-contain mx-auto rounded-full shadow-md`}
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.src.includes('/images/logo-kukusyuk.png')) {
            target.src = '/images/logo-kukusyuk.png';
          }
        }}
      />
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
