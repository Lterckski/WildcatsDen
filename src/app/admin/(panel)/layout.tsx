import Link from "next/link";
import { Logo } from "@/components/logo";
import { SetupNeeded } from "@/components/setup-needed";
import { requireStaff } from "@/lib/auth";
import { supabaseReady } from "@/lib/supabase/server";
import { signOut } from "../actions";

export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  if (!supabaseReady) return <SetupNeeded />;
  const me = await requireStaff();
  const links = [
    ["/admin", "Orders"],
    ["/admin/products", "Inventory"],
    ["/admin/reports", "Sales reports"],
    ...(me.role === "admin" ? [["/admin/staff", "Staff accounts"]] : []),
  ];
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-maroon-deep text-white md:w-56 md:shrink-0">
        <div className="flex items-center justify-between p-5 md:block">
          <Link href="/admin"><Logo tone="gold" className="h-10" /></Link>
          <p className="text-xs text-white/60 md:mt-1">Admin</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 text-sm md:flex-col md:pb-0">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="rounded px-3 py-2 whitespace-nowrap hover:translate-x-0.5 hover:bg-white/10 hover:text-gold">{label}</Link>
          ))}
          <Link href="/" className="rounded px-3 py-2 whitespace-nowrap text-white/60 hover:bg-white/10">View store ↗</Link>
        </nav>
        <form action={signOut} className="px-5 pb-4 text-xs text-white/60 md:p-5">
          <p className="truncate">{me.full_name || me.email}</p>
          <p className="capitalize">{me.role}</p>
          <button className="mt-2 underline underline-offset-4 hover:text-white">Sign out</button>
        </form>
      </aside>
      <main id="content" className="min-w-0 flex-1 animate-in fade-in bg-secondary/50 p-4 duration-300 md:p-8">{children}</main>
    </div>
  );
}
