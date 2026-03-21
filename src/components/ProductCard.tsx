interface ProductCardProps {
  badge: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  ctaLabel: string;
  variant: "accent" | "primary";
  onClick: () => void;
  subtext?: string;
  priceNote?: string;
}

const ProductCard = ({ badge, title, price, description, features, ctaLabel, variant, onClick }: ProductCardProps) => (
  <div className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
    <span className="mb-3 inline-block self-start rounded-sm bg-secondary px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
      {badge}
    </span>
    <h3 className="text-xl font-bold text-card-foreground">{title}</h3>
    <p className="mt-1 text-2xl font-bold text-card-foreground">{price}</p>
    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{description}</p>
    <ul className="mt-4 flex-1 space-y-2">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
          <span className="mt-0.5 text-accent">✓</span>
          <span>{f}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={onClick}
      className={`mt-6 w-full rounded-md px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
        variant === "accent"
          ? "bg-accent text-accent-foreground"
          : "bg-primary text-primary-foreground"
      }`}
    >
      {ctaLabel}
    </button>
  </div>
);

export default ProductCard;
