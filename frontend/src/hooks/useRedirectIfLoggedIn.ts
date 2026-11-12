import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMe } from "./useAuth";

/**
 * Sends logged-in users away from pages meant for logged-out ones (login, register).
 * Also handles the redirect right after a successful login or sign-up, because those
 * put the new user into the useMe() cache.
 */
export function useRedirectIfLoggedIn(destination = "/"): void {
  const router = useRouter();
  const { data: user } = useMe();

  useEffect(() => {
    if (user) void router.replace(destination);
  }, [user, router, destination]);
}
