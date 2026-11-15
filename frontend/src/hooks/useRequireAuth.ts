import type { UseQueryResult } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect } from "react";
import type { IUser } from "@/interfaces";
import { useMe } from "./useAuth";

/**
 * For pages that need a logged-in user: sends everyone else to /login.
 * This is only for the UI. The API checks the cookie on every request anyway.
 */
export function useRequireAuth(): UseQueryResult<IUser | null> {
  const router = useRouter();
  const me = useMe();

  useEffect(() => {
    if (me.data === null) void router.replace("/login");
  }, [me.data, router]);

  return me;
}
