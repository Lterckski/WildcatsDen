import { notFound } from "next/navigation";
import { adminDb } from "@/lib/supabase/server";
import { dateTime, peso, PICKUP, statusLabel } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";
import { ClearBag } from "./clear-bag";

export const metadata = { title: "Your order", robots: { index: false } };

// The order id is a random UUID, so the link itself is the shopper's key to this page.
export default async function OrderPage({ params, searchParams }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const placed = (await searchParams).placed === "1";
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await adminDb().from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const o = data as Order & { order_items: OrderItem[] };

  const steps = [
    { label: "Order placed", at: o.created_at },
    ...(o.payment_method === "gcash" ? [{ label: "GCash payment verified", at: o.paid_at }] : []),
    { label: "Ready for pickup", at: o.ready_at },
    { label: "Claimed", at: o.claimed_at },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {placed && <ClearBag />}
      {placed && (
        <div className="mb-8 bg-maroon p-6 text-white">
          <p className="text-sm font-semibold tracking-[0.2em] text-gold">THANK YOU</p>
          <p className="mt-1 text-xl font-bold">Your order is in. We sent the details to {o.email}.</p>
        </div>
      )}
      <p className="text-sm text-muted-foreground">Order code</p>
      <h1 className="text-4xl font-extrabold tracking-[0.15em]">{o.code}</h1>
      <p className="mt-2 inline-block bg-gold px-3 py-1 text-sm font-bold text-maroon-deep">{statusLabel[o.status]}</p>

      {o.status === "cancelled" ? (
        <p className="mt-6 text-sm">This order was cancelled{o.cancel_reason ? `: ${o.cancel_reason}` : ""}.</p>
      ) : (
        <ol className="mt-8 space-y-4 border-l-2 border-border pl-6">
          {steps.map((s) => (
            <li key={s.label} className="relative">
              <span className={`absolute top-1 -left-[31px] size-3 rounded-full ${s.at ? "bg-maroon" : "border-2 border-border bg-white"}`} />
              <p className={`text-sm font-semibold ${s.at ? "" : "text-muted-foreground"}`}>{s.label}</p>
              {s.at && <p className="text-xs text-muted-foreground">{dateTime(s.at)}</p>}
            </li>
          ))}
        </ol>
      )}

      <ul className="mt-10 divide-y border-y text-sm">
        {o.order_items.map((i) => (
          <li key={i.id} className="flex justify-between py-3">
            <span>{i.product_name} ({i.size}) × {i.qty}</span>
            <span>{peso(i.price * i.qty)}</span>
          </li>
        ))}
        <li className="flex justify-between py-3 text-base font-bold"><span>Total</span><span>{peso(o.total)}</span></li>
      </ul>

      <div className="mt-8 space-y-2 bg-secondary p-5 text-sm">
        <p><b>Pickup:</b> {PICKUP}</p>
        <p>
          <b>Payment:</b>{" "}
          {o.payment_method === "gcash"
            ? o.paid_at ? "GCash, verified" : "GCash, waiting for staff to verify your receipt"
            : o.paid_at ? "Cash, paid" : `Cash on pickup (${peso(o.total)})`}
        </p>
        {!o.paid_at && o.status !== "cancelled" && (
          <p className="text-muted-foreground">Unpaid orders not claimed within 7 days of ordering are cancelled.</p>
        )}
      </div>
    </div>
  );
}
