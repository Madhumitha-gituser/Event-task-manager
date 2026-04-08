export default function Logo({ className = '', size = 48 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Calendar / event block */}
      <rect x="6" y="8" width="36" height="34" rx="6" fill="url(#logo-grad1)" />
      <rect x="6" y="8" width="36" height="10" rx="6" fill="url(#logo-grad2)" />
      {/* Calendar holes */}
      <rect x="14" y="22" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
      <rect x="28" y="22" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
      <rect x="14" y="32" width="6" height="6" rx="1" fill="white" fillOpacity="0.9" />
      {/* Checkmark for "task done" */}
      <path
        d="M28 34l4 4 8-10"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="logo-grad1" x1="6" y1="8" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6B6B" />
          <stop offset="0.5" stopColor="#FF8E53" />
          <stop offset="1" stopColor="#FFB347" />
        </linearGradient>
        <linearGradient id="logo-grad2" x1="6" y1="8" x2="42" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4ECDC4" />
          <stop offset="1" stopColor="#44A08D" />
        </linearGradient>
      </defs>
    </svg>
  );
}
