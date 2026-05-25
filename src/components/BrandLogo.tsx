import { useState } from 'react';

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={compact ? 'brand brand-compact' : 'brand'}>
      {!imgError ? (
        <img
          src="/logo.png"
          alt="FiberTech"
          className="brand-image"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg viewBox="0 0 520 120" aria-hidden="true">
          <defs><linearGradient id="g" x1="0" x2="1"><stop stopColor="#fb7185"/><stop offset="1" stopColor="#f97316"/></linearGradient></defs>
          <path d="M40 98 C130 10, 390 10, 480 98" fill="none" stroke="url(#g)" strokeWidth="6" opacity=".75"/>
          <text x="28" y="86" fontSize="58" fontWeight="900" fontFamily="Inter, Arial" fill="#020617">FIBER</text>
          <text x="285" y="86" fontSize="58" fontWeight="900" fontFamily="Inter, Arial" fill="#f97316">TECH</text>
        </svg>
      )}
    </div>
  );
}
