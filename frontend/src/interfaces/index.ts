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
