import wretch from "wretch";
import type { IApiSuccess, IUser } from "@/interfaces";
import { api } from "@/lib/api";

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IRegisterInput extends ILoginInput {
  name: string;
}

type UserResponse = IApiSuccess<{ user: IUser }>;

const HTTP_UNAUTHORIZED = 401;

/** The logged-in user, or null when nobody is logged in. */
export async function getMe(): Promise<IUser | null> {
  try {
    const response = await api().get("/auth/me").json<UserResponse>();
    return response.data.user;
  } catch (error) {
    // 401 just means "not logged in", which is a normal state, not an error.
    if (error instanceof wretch.WretchError && error.status === HTTP_UNAUTHORIZED) {
      return null;
    }
    throw error;
  }
}

export async function login(input: ILoginInput): Promise<IUser> {
  const response = await api().post(input, "/auth/login").json<UserResponse>();
  return response.data.user;
}

export async function register(input: IRegisterInput): Promise<IUser> {
  const response = await api().post(input, "/auth/register").json<UserResponse>();
  return response.data.user;
}

export async function logout(): Promise<void> {
  await api().post(undefined, "/auth/logout").res();
}
