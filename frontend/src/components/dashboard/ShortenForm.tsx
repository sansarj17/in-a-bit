import { useRef, type FormEvent } from "react";
import { useCreateLink } from "@/hooks/useLinks";
import { getErrorMessage, getFieldErrors } from "@/utils/apiError";
import { fromDateTimeLocalValue, getDisplayShortUrl, getShortUrl } from "@/utils/links";
import { Button } from "../Button";
import { CopyButton } from "../CopyButton";
import { FormError } from "../FormError";
import { TextField } from "../TextField";

/** The "paste a long URL, get a short one" form at the top of the dashboard. */
export function ShortenForm() {
  const createLink = useCreateLink();
  const formRef = useRef<HTMLFormElement>(null);

  const fieldErrors = getFieldErrors(createLink.error);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const formError = createLink.error && !hasFieldErrors ? getErrorMessage(createLink.error) : null;
  const createdLink = createLink.data;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createLink.mutate(
      {
        originalUrl: String(form.get("originalUrl") ?? ""),
        title: String(form.get("title") ?? ""),
        alias: String(form.get("alias") ?? ""),
        expiresAt: fromDateTimeLocalValue(String(form.get("expiresAt") ?? "")) ?? undefined,
      },
      { onSuccess: () => formRef.current?.reset() },
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-[0_24px_48px_-32px_rgb(0_0_0/0.25)] sm:p-7">
      <h1 className="text-2xl font-semibold tracking-tight">Shorten a link</h1>
      <form ref={formRef} onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <FormError message={formError} />
        <TextField
          label="Long URL"
          name="originalUrl"
          type="url"
          placeholder="https://example.com/a/very/long/link"
          required
          error={fieldErrors.originalUrl}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <TextField
              label="Title (optional)"
              name="title"
              placeholder="e.g. Portfolio"
              maxLength={100}
              error={fieldErrors.title}
            />
          </div>
          <Button type="submit" isLoading={createLink.isPending}>
            Shorten
          </Button>
        </div>

        {/* Optional extras stay folded away; open automatically if one of them has an error. */}
        <details
          open={Boolean(fieldErrors.alias || fieldErrors.expiresAt) || undefined}
          className="group rounded-lg border border-border px-4 py-3"
        >
          <summary className="cursor-pointer text-sm font-medium text-muted select-none hover:text-foreground">
            Custom alias &amp; expiry
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField
              label="Custom alias"
              name="alias"
              placeholder="my-portfolio"
              maxLength={32}
              hint="Letters, numbers, - or _. Leave empty for a random code."
              error={fieldErrors.alias}
            />
            <TextField
              label="Expires at"
              name="expiresAt"
              type="datetime-local"
              hint="After this the link stops working."
              error={fieldErrors.expiresAt}
            />
          </div>
        </details>
      </form>

      {createdLink && (
        <div
          role="status"
          className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-muted">Your short link</p>
            <a
              href={getShortUrl(createdLink.code)}
              target="_blank"
              rel="noreferrer"
              className="font-mono font-semibold text-accent underline-offset-4 hover:underline"
            >
              {getDisplayShortUrl(createdLink.code)}
            </a>
          </div>
          <CopyButton text={getShortUrl(createdLink.code)} />
        </div>
      )}
    </section>
  );
}
