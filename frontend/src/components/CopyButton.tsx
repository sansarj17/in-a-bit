import { useEffect, useState } from "react";
import { Button } from "./Button";

const COPIED_LABEL_MS = 2000;

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  // Switch the label back to "Copy" after a moment.
  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), COPIED_LABEL_MS);
    return () => clearTimeout(timer);
  }, [isCopied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch {
      // Clipboard access can be blocked (permissions, non-HTTPS): let the user copy by hand.
      window.prompt("Copy this link:", text);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleCopy} aria-live="polite">
      {isCopied ? "Copied!" : "Copy"}
    </Button>
  );
}
