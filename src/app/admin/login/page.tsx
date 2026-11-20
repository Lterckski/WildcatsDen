"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { signIn, type FormState } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, {});
  return (
    <div className="flex min-h-screen items-center justify-center bg-maroon-deep px-4">
      <form action={action} className="w-full max-w-sm space-y-5 bg-white p-8">
        <div>
          <Logo className="h-16" />
          <p className="mt-2 text-sm text-muted-foreground">Staff sign in</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="username" className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" className="h-11" />
        </div>
        {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" disabled={pending} className="h-11 w-full font-bold">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
