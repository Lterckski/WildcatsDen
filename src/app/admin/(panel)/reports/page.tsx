import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/supabase/server";
import { peso } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

const manilaDay = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }); // YYYY-MM-DD
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export default async function ReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  const sp = await searchParams;
  const today = manilaDay(new Date());
  const from = typeof sp.from === "string" && DAY.test(sp.from) ? sp.from : today.slice(0, 8) + "01";
  const to = typeof sp.to === "string" && DAY.test(sp.to) ? sp.to : today;

  // A sale counts on the day the money came in: GCash when verified, cash when claimed.
  const { data } = await (await db())
    .from("orders")
    .select("*, order_items(*)")
    .neq("status", "cancelled")
    .gte("paid_at", `${from}T00:00:00+08:00`)
    .lte("paid_at", `${to}T23:59:59.999+08:00`)
    .order("paid_at");
  const orders = (data ?? []) as (Order & { order_items: OrderItem[] })[];

  const revenue = orders.reduce((n, o) => n + o.total, 0);
  const items = orders.flatMap((o) => o.order_items);
  const units = items.reduce((n, i) => n + i.qty, 0);
  const sum = <K extends string>(keys: K[], rows: { key: K; qty: number; amount: number }[]) =>
    keys.map((k) => ({
      key: k,
      qty: rows.filter((r) => r.key === k).reduce((n, r) => n + r.qty, 0),
      amount: rows.filter((r) => r.key === k).reduce((n, r) => n + r.amount, 0),
    }));

  const productRows = items.map((i) => ({ key: `${i.product_name} · ${i.size}`, qty: i.qty, amount: i.qty * i.price }));
  const byProduct = sum([...new Set(productRows.map((r) => r.key))], productRows).sort((a, b) => b.amount - a.amount);
  const dayRows = orders.map((o) => ({ key: manilaDay(new Date(o.paid_at!)), qty: 1, amount: o.total }));
  const byDay = sum([...new Set(dayRows.map((r) => r.key))], dayRows);
  const methodRows = orders.map((o) => ({ key: o.payment_method === "gcash" ? "GCash" : "Cash", qty: 1, amount: o.total }));
  const byMethod = sum(["GCash", "Cash"], methodRows);
  const students = orders.filter((o) => o.cit_student).length;

  const stat = (label: string, value: string) => (
    <div className="bg-white p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Sales reports</h1>
      <form className="flex flex-wrap items-end gap-3">
        <label className="text-sm">From<Input type="date" name="from" defaultValue={from} className="mt-1 h-9 bg-white" /></label>
        <label className="text-sm">To<Input type="date" name="to" defaultValue={to} className="mt-1 h-9 bg-white" /></label>
        <Button type="submit" className="h-9 px-4">Show</Button>
      </form>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stat("Revenue", peso(revenue))}
        {stat("Paid orders", String(orders.length))}
        {stat("Items sold", String(units))}
        {stat("CIT-U student orders", orders.length ? `${Math.round((students / orders.length) * 100)}%` : "–")}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportTable title="By product and size" first="Item" second="Qty" rows={byProduct} />
        <div className="space-y-6">
          <ReportTable title="By payment method" first="Method" second="Orders" rows={byMethod} />
          <ReportTable title="By day" first="Date" second="Orders" rows={byDay} />
        </div>
      </div>
    </div>
  );
}

function ReportTable({ title, first, second, rows }: { title: string; first: string; second: string; rows: { key: string; qty: number; amount: number }[] }) {
  return (
    <section className="bg-white p-5">
      <h2 className="mb-2 font-bold">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow><TableHead>{first}</TableHead><TableHead className="text-right">{second}</TableHead><TableHead className="text-right">Amount</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.key}><TableCell>{r.key}</TableCell><TableCell className="text-right">{r.qty}</TableCell><TableCell className="text-right">{peso(r.amount)}</TableCell></TableRow>
          ))}
          {rows.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No sales in this range.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </section>
  );
}
