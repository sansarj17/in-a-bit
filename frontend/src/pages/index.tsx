import Head from "next/head";
import Link from "next/link";
import { buttonStyles, DemoButton, FormError, Logo } from "@/components";
import { useMe } from "@/hooks/useAuth";
import { useRedirectIfLoggedIn } from "@/hooks/useRedirectIfLoggedIn";
import { getErrorMessage } from "@/utils/apiError";

export default function HomePage() {
  useRedirectIfLoggedIn();
  const { error } = useMe();

  return (
    <>
      <Head>
        <title>in-a-bit · short links</title>
      </Head>
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6">
        <header className="flex h-20 items-center justify-between">
          <Logo />
          <Link href="/login" className={buttonStyles("ghost", "sm")}>
            Log in
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center pb-24">
          <FormError message={error ? getErrorMessage(error) : null} />
          <section>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Long links,
              <br />
              made <span className="text-accent">a bit</span> shorter.
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted">
              Paste a long URL and get a short link you can share anywhere. Edit where it
              points, or switch it off, at any time.
            </p>
            <div className="mt-8 flex flex-wrap items-start gap-3">
              <Link href="/register" className={buttonStyles("primary")}>
                Create an account
              </Link>
              <DemoButton />
            </div>
            <p className="mt-3 text-sm text-muted">
              The demo gives you your own throwaway account with a few sample links.
            </p>

            <figure className="mt-14 rounded-2xl border border-border bg-surface p-5 font-mono text-sm">
              <p className="truncate text-muted">
                https://www.example.com/blog/2026/11/how-we-built-a-url-shortener?utm_source=newsletter
              </p>
              <p className="mt-2 font-semibold text-accent">→ in-a-bit/x7Kp2Qa</p>
            </figure>
          </section>
        </main>
      </div>
    </>
  );
}
