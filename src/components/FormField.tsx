import React from "react";

interface FormFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "number" | "textarea" | "select";
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  children?: React.ReactNode;
}

const FormField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  placeholder,
  options,
}: FormFieldProps) => {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const describedBy = [error ? errorId : null, helperText ? helperId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  const baseClasses = `w-full rounded-md border px-3 py-2.5 text-sm font-sans transition-colors
    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
    ${error ? "border-destructive" : "border-input"}
    bg-background text-foreground placeholder:text-muted-foreground`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>

      {type === "select" && options ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          className={baseClasses}
        >
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          placeholder={placeholder}
          rows={3}
          className={baseClasses + " resize-y"}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}

      {helperText && !error && (
        <p id={helperId} className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};

export default FormField;
