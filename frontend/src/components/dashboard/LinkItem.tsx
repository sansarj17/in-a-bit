import { useState } from "react";
import { useDeleteLink, useUpdateLink } from "@/hooks/useLinks";
import type { ILink } from "@/interfaces";
import { getErrorMessage } from "@/utils/apiError";
import { formatDate, getDisplayShortUrl, getShortUrl } from "@/utils/links";
import { Button } from "../Button";
import { CopyButton } from "../CopyButton";
import { FormError } from "../FormError";
import { EditLinkForm } from "./EditLinkForm";

interface LinkItemProps {
  link: ILink;
}

/** One link in the dashboard list: short URL, destination, and actions. */
export function LinkItem({ link }: LinkItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const toggleActive = useUpdateLink();
  const deleteLink = useDeleteLink();

  const actionError = toggleActive.error ?? deleteLink.error;

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${getDisplayShortUrl(link.code)}? Anyone who opens it will see "Link not found".`,
    );
    if (confirmed) deleteLink.mutate(link.id);
  }

  return (
    <li className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      {isEditing ? (
        <EditLinkForm link={link} onDone={() => setIsEditing(false)} />
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={getShortUrl(link.code)}
                target="_blank"
                rel="noreferrer"
                className={`font-mono font-semibold underline-offset-4 hover:underline ${
                  link.isActive ? "text-accent" : "text-muted line-through"
                }`}
              >
                {getDisplayShortUrl(link.code)}
              </a>
              {!link.isActive && (
                <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-medium text-muted">
                  Disabled
                </span>
              )}
            </div>
            {link.title && <p className="mt-1 font-medium">{link.title}</p>}
            <p className="mt-1 truncate text-sm text-muted" title={link.originalUrl}>
              → {link.originalUrl}
            </p>
            <p className="mt-2 text-xs text-muted">Created {formatDate(link.createdAt)}</p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1">
            <CopyButton text={getShortUrl(link.code)} />
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              isLoading={toggleActive.isPending}
              onClick={() => toggleActive.mutate({ id: link.id, changes: { isActive: !link.isActive } })}
            >
              {link.isActive ? "Disable" : "Enable"}
            </Button>
            <Button variant="danger" size="sm" isLoading={deleteLink.isPending} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      )}
      {actionError && (
        <div className="mt-3">
          <FormError message={getErrorMessage(actionError)} />
        </div>
      )}
    </li>
  );
}
