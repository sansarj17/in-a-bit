import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

const BASE_STYLES =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap " +
  "transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-foreground hover:brightness-110 active:brightness-95",
  secondary: "border border-border bg-surface hover:border-foreground/30 active:bg-background",
  ghost: "text-muted hover:bg-foreground/5 hover:text-foreground",
  danger: "text-danger hover:bg-danger/10",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-[15px]",
  sm: "h-8 px-3 text-sm",
};

/** Button classes, also used to style links that look like buttons. */
export function buttonStyles(variant: ButtonVariant = "primary", size: ButtonSize = "md"): string {
  return `${BASE_STYLES} ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  type = "button",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`${buttonStyles(variant, size)} ${className}`}
      {...props}
    >
      {isLoading ? "Please wait…" : children}
    </button>
  );
}
