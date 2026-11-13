import Head from "next/head";
import Link from "next/link";
import type { FormEvent } from "react";
import { AuthCard, Button, FormError, TextField } from "@/components";
import { useRegister } from "@/hooks/useAuth";
import { useRedirectIfLoggedIn } from "@/hooks/useRedirectIfLoggedIn";
import { getErrorMessage, getFieldErrors } from "@/utils/apiError";

// Mirrors the backend rules so most mistakes are caught before the request is sent.
const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 50;

export default function RegisterPage() {
  useRedirectIfLoggedIn();
  const register = useRegister();

  const fieldErrors = getFieldErrors(register.error);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const formError = register.error && !hasFieldErrors ? getErrorMessage(register.error) : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    register.mutate({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
  }

  return (
    <>
      <Head>
        <title>Create an account · in-a-bit</title>
      </Head>
      <AuthCard
        title="Create your account"
        subtitle="Free, and it takes a few seconds."
        footer={
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Log in
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormError message={formError} />
          <TextField
            label="Name"
            name="name"
            autoComplete="name"
            maxLength={MAX_NAME_LENGTH}
            required
            error={fieldErrors.name}
          />
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
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
            error={fieldErrors.password}
          />
          <Button type="submit" isLoading={register.isPending} className="mt-2">
            Create account
          </Button>
        </form>
      </AuthCard>
    </>
  );
}
