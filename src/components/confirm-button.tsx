"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

/** A submit button that asks first when `confirm` is set, and shows a busy state while the action runs. */
export function SubmitButton({ confirm, children, ...props }: React.ComponentProps<typeof Button> & { confirm?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      {...props}
    >
      {pending ? "Working…" : children}
    </Button>
  );
}
