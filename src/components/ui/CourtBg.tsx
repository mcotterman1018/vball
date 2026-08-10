export function CourtBg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.06]"
      viewBox="0 0 400 600"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
    >
      <rect x="40" y="80" width="320" height="440" rx="4" />
      <line x1="40" y1="300" x2="360" y2="300" />
      <line x1="200" y1="80" x2="200" y2="300" />
      <rect x="120" y="80" width="160" height="80" />
      <rect x="120" y="440" width="160" height="80" />
      <circle cx="200" cy="300" r="40" />
      <line x1="40" y1="220" x2="360" y2="220" />
    </svg>
  );
}
