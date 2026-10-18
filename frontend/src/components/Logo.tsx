type LogoProps = {
  size?: number;
  showText?: boolean;
};

export default function Logo({ size = 32, showText = true }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        role="img"
        aria-label="Smart Queue logo"
      >
        <defs>
          <linearGradient id="sq-logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#7C3AED" />
            <stop offset="1" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#sq-logo-gradient)" />
        <circle cx="11" cy="20" r="5.5" fill="#fff" />
        <circle cx="23" cy="20" r="4" fill="#fff" fillOpacity="0.75" />
        <circle cx="32" cy="20" r="2.5" fill="#fff" fillOpacity="0.5" />
      </svg>
      {showText && (
        <span className="font-display font-bold text-lg text-indigo">Smart Queue</span>
      )}
    </span>
  );
}