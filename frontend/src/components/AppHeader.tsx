import { useLogout } from "@/hooks/useAuth";
import type { IUser } from "@/interfaces";
import { Button } from "./Button";
import { Logo } from "./Logo";

interface AppHeaderProps {
  user: IUser;
}

/** Top bar for logged-in pages. */
export function AppHeader({ user }: AppHeaderProps) {
  const logout = useLogout();

  return (
    <header className="flex h-20 items-center justify-between gap-4">
      <Logo />
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted sm:inline">{user.name}</span>
        <Button
          variant="secondary"
          size="sm"
          isLoading={logout.isPending}
          onClick={() => logout.mutate()}
        >
          Log out
        </Button>
      </div>
    </header>
  );
}
