import React from 'react';
import { useSiteData } from '../context/SiteContext';
import { resolveMediaUrl } from '../utils/mediaUrl';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = false
}) => {
  const { data: siteData } = useSiteData();
  const logoSrc = resolveMediaUrl(siteData?.settings?.logoUrl || 'reveg-logo.svg');
  const brandName = siteData?.settings?.brandName || siteData?.settings?.siteName || 'RevEg Fresh Foods';

  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
    custom: ''
  };

  const selectedSize = size === 'custom' ? '' : sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official RevEg Fresh Foods Logo Emblem */}
      <img
        src={logoSrc}
        alt={`${brandName} Logo`}
        className={`${selectedSize} object-contain shrink-0 transition-transform duration-200 hover:scale-105`}
        loading="eager"
        onError={(e: any) => {
          e.target.src = resolveMediaUrl('reveg-logo.svg');
        }}
      />

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center text-lg sm:text-xl font-extrabold tracking-tight font-jakarta leading-none">
            <span className="text-[#0D5B29]">Rev</span>
            <span className="text-[#E8590C]">eg</span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#0D5B29] mt-0.5">
            {brandName.includes('Fresh Foods') ? 'Fresh Foods' : brandName}
          </span>
        </div>
      )}
    </div>
  );
};
