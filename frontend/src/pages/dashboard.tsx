import Head from "next/head";
import { useRouter } from "next/router";
import { AppHeader } from "@/components";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { LinkList } from "@/components/dashboard/LinkList";
import { ShortenForm } from "@/components/dashboard/ShortenForm";
import { useRequireAuth } from "@/hooks/useRequireAuth";

/** Reads ?page=N from the URL, falling back to 1 for anything that isn't a positive integer. */
function parsePage(value: string | string[] | undefined): number {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: user } = useRequireAuth();
  const page = parsePage(router.query.page);

  // The page number lives in the URL, so refresh and the back button keep your place.
  function handlePageChange(nextPage: number) {
    void router.push(
      { pathname: "/dashboard", query: nextPage > 1 ? { page: nextPage } : {} },
      undefined,
      { shallow: true },
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard · in-a-bit</title>
      </Head>
      {/* Nothing to show until we know who is logged in (logged-out visitors get redirected). */}
      {!user ? (
        <p className="grid min-h-screen place-items-center text-muted">Loading…</p>
      ) : (
        <div className="mx-auto max-w-3xl px-6 pb-24">
          <AppHeader user={user} />
          <main className="flex flex-col gap-10">
            {user.isDemo && <DemoBanner />}
            <ShortenForm />
            <LinkList page={page} onPageChange={handlePageChange} />
          </main>
        </div>
      )}
    </>
  );
}
