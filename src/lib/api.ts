import wretch, { type WretchOptions } from "wretch";
import QueryString from "wretch/addons/queryString";

const wr = wretch().addon(QueryString);

export const api = () => {
  wr._url = process.env.NEXT_PUBLIC_API_URL || "https://example.com"

  const options: WretchOptions = {
    // credentials: "include",
    headers: {},
    signal: AbortSignal.timeout(30e3),
  };

  return wr.options(options)
};
