import "server-only";
import { redirect } from "next/navigation";
import { db } from "./supabase/server";
import type { Role } from "./types";

export type Staff = { id: string; email: string; full_name: string; role: Role };

/** The signed-in staff member, or a redirect to the login page. Call it in every admin page and action. */
export async function requireStaff(): Promise<Staff> {
  const supabase = await db();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", data.user.id).single();
  if (!profile) redirect("/admin/login?error=no-access");
  return { id: data.user.id, email: data.user.email ?? "", ...profile } as Staff;
}

export async function requireAdmin(): Promise<Staff> {
  const me = await requireStaff();
  if (me.role !== "admin") redirect("/admin");
  return me;
}
