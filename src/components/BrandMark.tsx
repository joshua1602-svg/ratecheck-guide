interface BrandMarkProps {
  variant?: "dark" | "light";
}

const BrandMark = ({ variant = "dark" }: BrandMarkProps) => {
  const fg = variant === "light" ? "text-primary-foreground" : "text-foreground";
  const accent = "text-accent";

  return (
    <a
      href="/"
      className={`inline-flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight no-underline font-heading ${fg}`}
    >
      <img src="/favicon.ico" alt="RateCheck logo" width="28" height="28" className="shrink-0" />
      <span>Rate<span className="font-normal">Check</span></span>
    </a>
  );
};

export default BrandMark;
