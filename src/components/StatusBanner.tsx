interface StatusBannerProps {
  message: string;
  onDismiss: () => void;
}

const StatusBanner = ({ message, onDismiss }: StatusBannerProps) => (
  <div role="alert" className="mb-6 flex items-start gap-3 rounded-md border border-accent bg-accent/10 px-4 py-3 text-sm text-foreground animate-fade-in">
    <p className="flex-1">{message}</p>
    <button
      onClick={onDismiss}
      className="shrink-0 font-medium text-foreground hover:opacity-70"
      aria-label="Dismiss"
    >
      ✕
    </button>
  </div>
);

export default StatusBanner;
