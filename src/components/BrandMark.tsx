interface BrandMarkProps {
  variant?: "dark" | "light";
}

const BrandMark = ({ variant = "dark" }: BrandMarkProps) => {
  const fg = variant === "light" ? "text-primary-foreground" : "text-foreground";
  const accent = "text-accent";

  return (
    <a
      href="/"
      className={`inline-flex items-center gap-2 text-xl font-bold tracking-tight no-underline font-heading ${fg}`}
    >
      {/* Logo icon: stylised check + bar chart */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={accent}
        aria-hidden="true"
      >
        <rect x="2" y="18" width="6" height="12" rx="1.5" fill="currentColor" opacity="0.45" />
        <rect x="10" y="12" width="6" height="18" rx="1.5" fill="currentColor" opacity="0.65" />
        <rect x="18" y="6" width="6" height="24" rx="1.5" fill="currentColor" opacity="0.85" />
        <path
          d="M22 4 L27 9 L30 3"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span>RateCheck</span>
    </a>
  );
};

export default BrandMark;
