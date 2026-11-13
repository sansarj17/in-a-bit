import Head from "next/head";
import Link from "next/link";
import { Button, buttonStyles, FormError, Logo } from "@/components";
import { useLogout, useMe } from "@/hooks/useAuth";
import type { IUser } from "@/interfaces";
import { getErrorMessage } from "@/utils/apiError";

export default function HomePage() {
  const { data: user, isPending, error } = useMe();
  const logout = useLogout();

  return (
    <>
      <Head>
        <title>in-a-bit · short links</title>
      </Head>
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6">
        <header className="flex h-20 items-center justify-between">
          <Logo />
          {user && (
            <Button variant="secondary" isLoading={logout.isPending} onClick={() => logout.mutate()}>
              Log out
            </Button>
          )}
        </header>

        <main className="flex flex-1 flex-col justify-center pb-24">
          <FormError message={error ? getErrorMessage(error) : null} />
          {isPending && <p className="text-muted">Loading…</p>}
          {!isPending && (user ? <Welcome user={user} /> : <Landing />)}
        </main>
      </div>
    </>
  );
}

function Landing() {
  return (
    <section>
      <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
        Long links,
        <br />
        made <span className="text-accent">a bit</span> shorter.
      </h1>
      <p className="mt-5 max-w-md text-lg text-muted">
        Paste a long URL and get a short link you can share anywhere.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/register" className={buttonStyles("primary")}>
          Create an account
        </Link>
        <Link href="/login" className={buttonStyles("secondary")}>
          Log in
        </Link>
      </div>

      <figure className="mt-14 rounded-2xl border border-border bg-surface p-5 font-mono text-sm">
        <p className="truncate text-muted">
          https://www.example.com/blog/2026/11/how-we-built-a-url-shortener?utm_source=newsletter
        </p>
        <p className="mt-2 font-semibold text-accent">→ in-a-bit/x7Kp2Qa</p>
      </figure>
    </section>
  );
}

interface WelcomeProps {
  user: IUser;
}

function Welcome({ user }: WelcomeProps) {
  return (
    <section>
      <p className="text-sm font-medium uppercase tracking-widest text-muted">Signed in</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Hi, {user.name}</h1>
      <p className="mt-4 text-lg text-muted">
        You&apos;re logged in as <span className="text-foreground">{user.email}</span>. Creating
        short links comes next.
      </p>
    </section>
  );
}
