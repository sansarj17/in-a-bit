import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="rounded font-mono text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      in-a-<span className="text-accent">bit</span>
    </Link>
  );
}
