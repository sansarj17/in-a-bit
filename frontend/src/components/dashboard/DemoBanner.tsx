import { useRouter } from "next/router";
import { useLogout } from "@/hooks/useAuth";
import { Button } from "../Button";

/** Shown to demo accounts: explains what they're looking at and how to get a real account. */
export function DemoBanner() {
  const router = useRouter();
  const logout = useLogout();

  function handleSignUp() {
    logout.mutate(undefined, { onSuccess: () => void router.push("/register") });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
      <p className="text-muted">
        <span className="font-semibold text-foreground">Demo account.</span>{" "}
        It&apos;s yours alone, so try anything. Create a real account to keep your links.
      </p>
      <Button size="sm" isLoading={logout.isPending} onClick={handleSignUp}>
        Sign up
      </Button>
    </div>
  );
}
