interface BrandMarkProps {
  variant?: "dark" | "light";
}

const BrandMark = ({ variant = "dark" }: BrandMarkProps) => (
  <a
    href="/"
    className={`inline-flex items-baseline gap-0 text-xl font-bold tracking-tight no-underline font-heading ${
      variant === "light" ? "text-primary-foreground" : "text-primary"
    }`}
  >
    <span className="text-accent">£</span>
    <span>RateCheck</span>
  </a>
);

export default BrandMark;
