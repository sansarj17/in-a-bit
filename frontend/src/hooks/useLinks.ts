import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ILink, ILinkPage } from "@/interfaces";
import {
  createLink,
  deleteLink,
  listLinks,
  updateLink,
  type ICreateLinkInput,
  type IUpdateLinkInput,
} from "@/services/links.service";

export const LINKS_QUERY_KEY = ["links"] as const;

/** One page of the user's links. Keeps showing the old page while the next one loads. */
export function useLinks(page: number): UseQueryResult<ILinkPage> {
  return useQuery({
    queryKey: [...LINKS_QUERY_KEY, { page }],
    queryFn: () => listLinks(page),
    placeholderData: keepPreviousData,
  });
}

// After any change, refetch every cached page of links. Simpler than editing the cache
// by hand, and a created or deleted link shifts what belongs on each page anyway.
function useRefetchLinks(): () => Promise<void> {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: LINKS_QUERY_KEY });
}

export function useCreateLink(): UseMutationResult<ILink, Error, ICreateLinkInput> {
  const refetchLinks = useRefetchLinks();
  return useMutation({ mutationFn: createLink, onSuccess: refetchLinks });
}

interface IUpdateLinkVariables {
  id: string;
  changes: IUpdateLinkInput;
}

export function useUpdateLink(): UseMutationResult<ILink, Error, IUpdateLinkVariables> {
  const refetchLinks = useRefetchLinks();
  return useMutation({
    mutationFn: ({ id, changes }: IUpdateLinkVariables) => updateLink(id, changes),
    onSuccess: refetchLinks,
  });
}

export function useDeleteLink(): UseMutationResult<void, Error, string> {
  const refetchLinks = useRefetchLinks();
  return useMutation({ mutationFn: deleteLink, onSuccess: refetchLinks });
}
