import { useEffect } from "react";
import { useLinks } from "@/hooks/useLinks";
import { getErrorMessage } from "@/utils/apiError";
import { Button } from "../Button";
import { FormError } from "../FormError";
import { LinkItem } from "./LinkItem";

interface LinkListProps {
  page: number;
  onPageChange: (page: number) => void;
}

/** The user's links, newest first, one page at a time. */
export function LinkList({ page, onPageChange }: LinkListProps) {
  const { data, error, isPending, isPlaceholderData } = useLinks(page);

  // Deleting the last link on a later page leaves it empty: step back to the last real page.
  const lastPage = Math.max(1, data?.pagination.totalPages ?? 1);
  useEffect(() => {
    if (data && page > lastPage) onPageChange(lastPage);
  }, [data, page, lastPage, onPageChange]);

  if (isPending) return <p className="text-muted">Loading your links…</p>;
  if (error) return <FormError message={getErrorMessage(error)} />;

  const { links, pagination } = data;

  return (
    <section aria-labelledby="links-heading">
      <div className="flex items-baseline justify-between">
        <h2 id="links-heading" className="text-lg font-semibold tracking-tight">
          Your links
        </h2>
        <span className="text-sm text-muted">{pagination.total} total</span>
      </div>

      {links.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-10 text-center text-muted">
          No links yet. Shorten your first one above.
        </p>
      ) : (
        <ul className={`mt-4 flex flex-col gap-3 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
          {links.map((link) => (
            <LinkItem key={link.id} link={link} />
          ))}
        </ul>
      )}

      {pagination.totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            ← Newer
          </Button>
          <span className="text-sm text-muted">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Older →
          </Button>
        </nav>
      )}
    </section>
  );
}
