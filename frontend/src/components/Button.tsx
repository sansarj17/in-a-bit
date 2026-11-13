import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

const BASE_STYLES =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-[15px] font-semibold " +
  "transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-foreground hover:brightness-110 active:brightness-95",
  secondary: "border border-border bg-surface hover:border-foreground/30 active:bg-background",
};

/** Button classes, also used to style links that look like buttons. */
export function buttonStyles(variant: ButtonVariant = "primary"): string {
  return `${BASE_STYLES} ${VARIANT_STYLES[variant]}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  isLoading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`${buttonStyles(variant)} ${className}`}
      {...props}
    >
      {isLoading ? "Please wait…" : children}
    </button>
  );
}
