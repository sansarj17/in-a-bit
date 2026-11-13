import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  /** Shown under the input, and marks the input invalid for screen readers. */
  error?: string;
  hint?: string;
}

export function TextField({ label, name, error, hint, ...inputProps }: TextFieldProps) {
  const messageId = `${name}-message`;
  const message = error ?? hint;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className="h-11 rounded-lg border border-border bg-background px-3 text-[15px] outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:ring-3 focus:ring-accent/20 aria-invalid:border-danger aria-invalid:focus:ring-danger/20"
        {...inputProps}
      />
      {message && (
        <p id={messageId} className={`text-sm ${error ? "text-danger" : "text-muted"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
