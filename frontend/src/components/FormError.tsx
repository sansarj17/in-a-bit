interface FormErrorProps {
  message: string | null;
}

/** An error for the whole form (e.g. "Invalid email or password"), announced to screen readers. */
export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger"
    >
      {message}
    </p>
  );
}
