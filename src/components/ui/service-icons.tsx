interface SvgProps {
  className?: string;
}

export function ImageGenSvg({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Canvas frame */}
      <rect x="6" y="8" width="36" height="32" rx="3" stroke="currentColor" strokeWidth="2" />
      {/* Mountain landscape */}
      <path d="M6 32l10-12 8 8 6-6 12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sun */}
      <circle cx="34" cy="18" r="4" stroke="currentColor" strokeWidth="2" />
      {/* AI sparkle */}
      <path d="M14 14l1.5 3 3 1.5-3 1.5L14 23l-1.5-3-3-1.5 3-1.5L14 14z" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function MusicGenSvg({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Waveform bars */}
      <rect x="6" y="20" width="3" height="8" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="12" y="14" width="3" height="20" rx="1.5" fill="currentColor" opacity="0.7" />
      <rect x="18" y="10" width="3" height="28" rx="1.5" fill="currentColor" />
      <rect x="24" y="16" width="3" height="16" rx="1.5" fill="currentColor" opacity="0.8" />
      <rect x="30" y="8" width="3" height="32" rx="1.5" fill="currentColor" />
      <rect x="36" y="14" width="3" height="20" rx="1.5" fill="currentColor" opacity="0.7" />
      <rect x="42" y="18" width="3" height="12" rx="1.5" fill="currentColor" opacity="0.5" />
      {/* AI sparkle */}
      <path d="M40 8l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function VideoGenSvg({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Film frame */}
      <rect x="4" y="10" width="40" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
      {/* Play triangle */}
      <path d="M20 18v12l10-6-10-6z" fill="currentColor" opacity="0.8" />
      {/* Film strip holes top */}
      <circle cx="10" cy="14" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="38" cy="14" r="1.5" fill="currentColor" opacity="0.4" />
      {/* Film strip holes bottom */}
      <circle cx="10" cy="34" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="38" cy="34" r="1.5" fill="currentColor" opacity="0.4" />
      {/* AI sparkle */}
      <path d="M36 10l1.5 3 3 1.5-3 1.5L36 19l-1.5-3-3-1.5 3-1.5L36 10z" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function TextGenSvg({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document */}
      <rect x="8" y="4" width="32" height="40" rx="3" stroke="currentColor" strokeWidth="2" />
      {/* Text lines */}
      <line x1="14" y1="14" x2="34" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="14" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="14" y1="26" x2="34" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="14" y1="32" x2="26" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* AI cursor blink */}
      <rect x="28" y="30" width="2" height="6" rx="1" fill="currentColor" opacity="0.5" />
      {/* AI sparkle */}
      <path d="M36 6l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function CodeGenSvg({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Terminal window */}
      <rect x="4" y="8" width="40" height="32" rx="3" stroke="currentColor" strokeWidth="2" />
      {/* Title bar */}
      <line x1="4" y1="16" x2="44" y2="16" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <circle cx="10" cy="12" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="16" cy="12" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="22" cy="12" r="1.5" fill="currentColor" opacity="0.4" />
      {/* Code brackets */}
      <path d="M14 22l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 22l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Slash */}
      <line x1="27" y1="20" x2="21" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function CalorieGenSvg({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Plate */}
      <ellipse cx="24" cy="28" rx="18" ry="12" stroke="currentColor" strokeWidth="2" />
      {/* Food on plate */}
      <path d="M16 24c0-4 3.5-8 8-8s8 4 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Steam lines */}
      <path d="M18 14c0-2 1-3 0-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M24 12c0-2 1-3 0-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M30 14c0-2 1-3 0-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* Calorie text hint */}
      <text x="24" y="30" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="bold" opacity="0.7">kcal</text>
      {/* AI sparkle */}
      <path d="M40 10l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function MathGenSvg({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Calculator body */}
      <rect x="8" y="4" width="32" height="40" rx="3" stroke="currentColor" strokeWidth="2" />
      {/* Screen */}
      <rect x="12" y="8" width="24" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      {/* Math symbols */}
      <text x="24" y="16" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold" opacity="0.8">x+y</text>
      {/* Keypad dots */}
      <circle cx="16" cy="24" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="24" cy="24" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="32" cy="24" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="16" cy="32" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="24" cy="32" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="32" cy="32" r="2" fill="currentColor" opacity="0.4" />
      {/* Equals sign */}
      <line x1="20" y1="38" x2="28" y2="38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="20" y1="41" x2="28" y2="41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* AI sparkle */}
      <path d="M38 6l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function FortuneGenSvg({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Yin-Yang circle */}
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" />
      {/* Yin-Yang S-curve */}
      <path d="M24 8a8 8 0 010 16 8 8 0 000 16" stroke="currentColor" strokeWidth="2" />
      {/* Small circles */}
      <circle cx="24" cy="16" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="24" cy="32" r="2.5" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      {/* Trigram lines - top right */}
      <line x1="38" y1="12" x2="44" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="38" y1="16" x2="40" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="42" y1="16" x2="44" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      {/* Trigram lines - bottom left */}
      <line x1="4" y1="32" x2="10" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="4" y1="36" x2="10" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      {/* AI sparkle */}
      <path d="M40 36l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
