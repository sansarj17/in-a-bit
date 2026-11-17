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

export function useLogout(): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Drop everything cached for this user, so the next person on this browser sees none of it.
      queryClient.clear();
      queryClient.setQueryData(ME_QUERY_KEY, null);
    },
  });
}
