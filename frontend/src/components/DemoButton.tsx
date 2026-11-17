import { useDemoLogin } from "@/hooks/useAuth";
import { getErrorMessage } from "@/utils/apiError";
import { Button } from "./Button";
import { FormError } from "./FormError";

interface DemoButtonProps {
  className?: string;
}

/**
 * One click to a throwaway account with sample links, so visitors (and recruiters) can
 * try the app without signing up. The page's redirect hook takes them to the dashboard.
 */
export function DemoButton({ className = "" }: DemoButtonProps) {
  const demoLogin = useDemoLogin();

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <Button variant="secondary" isLoading={demoLogin.isPending} onClick={() => demoLogin.mutate()}>
        Try the demo
      </Button>
      <FormError message={demoLogin.error ? getErrorMessage(demoLogin.error) : null} />
    </div>
  );
}
