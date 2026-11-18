import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { IUser } from "@/interfaces";
import {
  getMe,
  login,
  loginAsDemo,
  logout,
  register,
  type ILoginInput,
  type IRegisterInput,
} from "@/services/auth.service";

export const ME_QUERY_KEY = ["auth", "me"] as const;

/** The logged-in user (null when logged out). Pages use this to decide what to show. */
export function useMe(): UseQueryResult<IUser | null> {
  return useQuery({ queryKey: ME_QUERY_KEY, queryFn: getMe });
}

// Login and register return the user, so we put it straight into the "me" cache:
// every component using useMe() updates at once, without another request.

export function useLogin(): UseMutationResult<IUser, Error, ILoginInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => queryClient.setQueryData(ME_QUERY_KEY, user),
  });
}

export function useRegister(): UseMutationResult<IUser, Error, IRegisterInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: register,
    onSuccess: (user) => queryClient.setQueryData(ME_QUERY_KEY, user),
  });
}

export function useDemoLogin(): UseMutationResult<IUser, Error, void> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginAsDemo,
    onSuccess: (user) => queryClient.setQueryData(ME_QUERY_KEY, user),
  });
}

/**
 * Logs out, then loads `redirectTo` as a fresh page. A full page load throws away
 * everything in memory (cached links, the user), so nothing from this session can leak
 * to the next person on the browser, and no page is left showing stale data.
 */
export function useLogout(redirectTo = "/"): UseMutationResult<void, Error, void> {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => window.location.assign(redirectTo),
  });
}
