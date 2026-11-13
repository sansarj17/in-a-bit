import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import { Geist, Geist_Mono } from "next/font/google";
import { useState } from "react";
import "@/styles/globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  // One client per app instance, not per module: during server rendering a module-level
  // client would be shared between users, leaking one user's cached data to another.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans`}>
        <Component {...pageProps} />
      </div>
    </QueryClientProvider>
  );
}
