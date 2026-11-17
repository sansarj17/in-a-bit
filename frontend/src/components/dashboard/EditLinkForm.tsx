import type { FormEvent } from "react";
import { useUpdateLink } from "@/hooks/useLinks";
import type { ILink } from "@/interfaces";
import { getErrorMessage, getFieldErrors } from "@/utils/apiError";
import { fromDateTimeLocalValue, toDateTimeLocalValue } from "@/utils/links";
import { Button } from "../Button";
import { FormError } from "../FormError";
import { TextField } from "../TextField";

interface EditLinkFormProps {
  link: ILink;
  onDone: () => void;
}

/** Inline form for changing a link's destination or title. The short code stays the same. */
export function EditLinkForm({ link, onDone }: EditLinkFormProps) {
  const updateLink = useUpdateLink();

  const fieldErrors = getFieldErrors(updateLink.error);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const formError = updateLink.error && !hasFieldErrors ? getErrorMessage(updateLink.error) : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateLink.mutate(
      {
        id: link.id,
        changes: {
          originalUrl: String(form.get("originalUrl") ?? ""),
          title: String(form.get("title") ?? ""),
          // Clearing the field removes the expiry.
          expiresAt: fromDateTimeLocalValue(String(form.get("expiresAt") ?? "")),
        },
      },
      { onSuccess: onDone },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormError message={formError} />
      <TextField
        id={`edit-${link.id}-url`}
        label="Destination URL"
        name="originalUrl"
        type="url"
        defaultValue={link.originalUrl}
        required
        error={fieldErrors.originalUrl}
      />
      <TextField
        id={`edit-${link.id}-title`}
        label="Title"
        name="title"
        defaultValue={link.title ?? ""}
        maxLength={100}
        error={fieldErrors.title}
      />
      <TextField
        id={`edit-${link.id}-expires`}
        label="Expires at"
        name="expiresAt"
        type="datetime-local"
        defaultValue={toDateTimeLocalValue(link.expiresAt)}
        hint="Leave empty to keep the link working forever."
        error={fieldErrors.expiresAt}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="sm" isLoading={updateLink.isPending}>
          Save
        </Button>
      </div>
    </form>
  );
}
