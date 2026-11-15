/** A user as the API returns it (never includes the password). */
export interface IUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

/** Body of every successful API response. */
export interface IApiSuccess<T> {
  success: true;
  data: T;
}

/** Body of every failed API response. `details` holds per-field validation messages. */
export interface IApiError {
  success: false;
  message: string;
  details?: Record<string, string[] | undefined>;
}

/** A short link as the API returns it. */
export interface ILink {
  id: string;
  code: string;
  originalUrl: string;
  title: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** One page of the logged-in user's links, newest first. */
export interface ILinkPage {
  links: ILink[];
  pagination: IPagination;
}
