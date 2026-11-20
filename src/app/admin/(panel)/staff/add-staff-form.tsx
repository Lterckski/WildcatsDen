"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addStaff, type FormState } from "../../actions";

export function AddStaffForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addStaff, {});
  return (
    <form action={action} className="grid gap-4 bg-white p-6 sm:grid-cols-2">
      <h2 className="font-bold sm:col-span-2">Add an account</h2>
      <div className="space-y-2"><Label htmlFor="full_name">Name</Label><Input id="full_name" name="full_name" required className="h-10" /></div>
      <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required className="h-10" /></div>
      <div className="space-y-2"><Label htmlFor="password">Temporary password</Label><Input id="password" name="password" type="text" minLength={8} required autoComplete="new-password" className="h-10" /></div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <select id="role" name="role" className="h-10 w-full border bg-transparent px-2 text-sm">
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {state.error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{state.error}</p>}
      {state.ok && <p role="status" className="text-sm text-green-700 sm:col-span-2">{state.ok}</p>}
      <Button type="submit" disabled={pending} className="h-10 w-fit px-6">{pending ? "Adding…" : "Add account"}</Button>
    </form>
  );
}
