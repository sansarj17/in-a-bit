import Head from "next/head";
import Link from "next/link";
import type { FormEvent } from "react";
import { AuthCard, Button, DemoButton, FormError, TextField } from "@/components";
import { useLogin } from "@/hooks/useAuth";
import { useRedirectIfLoggedIn } from "@/hooks/useRedirectIfLoggedIn";
import { getErrorMessage, getFieldErrors } from "@/utils/apiError";

export default function LoginPage() {
  useRedirectIfLoggedIn();
  const login = useLogin();

  const fieldErrors = getFieldErrors(login.error);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const formError = login.error && !hasFieldErrors ? getErrorMessage(login.error) : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    login.mutate({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
  }

  return (
    <>
      <Head>
        <title>Log in · in-a-bit</title>
      </Head>
      <AuthCard
        title="Welcome back"
        subtitle="Log in to manage your short links."
        footer={
          <>
            New here?{" "}
            <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
              Create an account
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormError message={formError} />
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            error={fieldErrors.email}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            error={fieldErrors.password}
          />
          <Button type="submit" isLoading={login.isPending} className="mt-2">
            Log in
          </Button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <DemoButton />
      </AuthCard>
    </>
  );
}
