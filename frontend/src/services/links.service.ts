import { LINKS_PAGE_SIZE } from "@/constants";
import type { IApiSuccess, ILink, ILinkPage } from "@/interfaces";
import { api } from "@/lib/api";

export interface ICreateLinkInput {
  originalUrl: string;
  title?: string;
  /** Custom short code, e.g. "my-cv". A random one is generated when left out. */
  alias?: string;
  /** ISO date-time. */
  expiresAt?: string;
}

export interface IUpdateLinkInput {
  originalUrl?: string;
  title?: string;
  isActive?: boolean;
  /** ISO date-time, or null to remove the expiry. */
  expiresAt?: string | null;
}

type LinkResponse = IApiSuccess<{ link: ILink }>;

export async function listLinks(page: number): Promise<ILinkPage> {
  const response = await api()
    .query({ page, limit: LINKS_PAGE_SIZE })
    .get("/links")
    .json<IApiSuccess<ILinkPage>>();
  return response.data;
}

export async function createLink(input: ICreateLinkInput): Promise<ILink> {
  const response = await api().post(input, "/links").json<LinkResponse>();
  return response.data.link;
}

export async function updateLink(id: string, changes: IUpdateLinkInput): Promise<ILink> {
  const response = await api()
    .patch(changes, `/links/${encodeURIComponent(id)}`)
    .json<LinkResponse>();
  return response.data.link;
}

export async function deleteLink(id: string): Promise<void> {
  await api().delete(`/links/${encodeURIComponent(id)}`).res();
}
