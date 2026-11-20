import { SubmitButton } from "@/components/confirm-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/server";
import { removeStaff, setRole } from "../../actions";
import { AddStaffForm } from "./add-staff-form";

export default async function StaffPage() {
  const me = await requireAdmin();
  const supabase = adminDb();
  const [{ data: profiles }, { data: users }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const email = (id: string) => users?.users.find((u) => u.id === id)?.email ?? "";

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-extrabold">Staff accounts</h1>
      <p className="text-sm text-muted-foreground">Staff can do everything except manage these accounts. Admins can also add and remove staff.</p>
      <div className="bg-white">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead /></TableRow>
          </TableHeader>
          <TableBody>
            {(profiles ?? []).map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.full_name || "—"}{p.id === me.id && <span className="text-muted-foreground"> (you)</span>}</TableCell>
                <TableCell>{email(p.id)}</TableCell>
                <TableCell className="capitalize">{p.role}</TableCell>
                <TableCell>
                  {p.id !== me.id && (
                    <div className="flex justify-end gap-2">
                      <form action={setRole}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="role" value={p.role === "admin" ? "staff" : "admin"} />
                        <SubmitButton variant="outline" size="sm">{p.role === "admin" ? "Make staff" : "Make admin"}</SubmitButton>
                      </form>
                      <form action={removeStaff}>
                        <input type="hidden" name="id" value={p.id} />
                        <SubmitButton variant="destructive" size="sm" confirm={`Remove ${email(p.id)}? They will no longer be able to sign in.`}>Remove</SubmitButton>
                      </form>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AddStaffForm />
    </div>
  );
}
