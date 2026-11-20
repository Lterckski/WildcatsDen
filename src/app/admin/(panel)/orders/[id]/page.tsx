import Link from "next/link";
import { notFound } from "next/navigation";
import { SubmitButton } from "@/components/confirm-button";
import { requireStaff } from "@/lib/auth";
import { adminDb, db } from "@/lib/supabase/server";
import { dateTime, peso, statusLabel } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";
import { cancelOrder, markClaimed, markReady, verifyPayment } from "../../../actions";

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  await requireStaff();
  const { id } = await params;
  const { data } = await (await db()).from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const o = data as Order & { order_items: OrderItem[] };
  const receipt = o.receipt_path
    ? (await adminDb().storage.from("receipts").createSignedUrl(o.receipt_path, 600)).data?.signedUrl
    : null;
  const open = o.status === "pending" || o.status === "ready";

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/admin" className="text-sm text-muted-foreground hover:underline">← Orders</Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-mono text-3xl font-extrabold tracking-widest">{o.code}</h1>
          <p className="text-sm text-muted-foreground">Placed {dateTime(o.created_at)}</p>
        </div>
        <span className="bg-gold px-3 py-1 text-sm font-bold text-maroon-deep">{statusLabel[o.status]}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-1 bg-white p-5 text-sm">
          <h2 className="mb-2 font-bold">Customer</h2>
          <p>{o.name}</p>
          <p><a href={`mailto:${o.email}`} className="underline underline-offset-4">{o.email}</a></p>
          <p><a href={`tel:${o.phone}`} className="underline underline-offset-4">{o.phone}</a></p>
          <p>{o.cit_student ? `CIT-U student${o.student_id ? ` · ID ${o.student_id}` : ""}` : "Not a current CIT-U student"}</p>
        </section>
        <section className="space-y-1 bg-white p-5 text-sm">
          <h2 className="mb-2 font-bold">Payment</h2>
          <p>{o.payment_method === "gcash" ? "GCash" : "Cash on pickup"} · {peso(o.total)}</p>
          {o.gcash_ref && <p>Reference: <span className="font-mono font-semibold">{o.gcash_ref}</span></p>}
          <p>{o.paid_at ? `Paid · ${dateTime(o.paid_at)}` : "Not paid yet"}</p>
          {receipt && (
            <a href={receipt} target="_blank" rel="noreferrer" className="mt-2 block">
              {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed link */}
              <img src={receipt} alt="GCash receipt" className="max-h-80 border object-contain" />
            </a>
          )}
        </section>
      </div>

      <section className="bg-white p-5 text-sm">
        <h2 className="mb-2 font-bold">Items</h2>
        <ul className="divide-y">
          {o.order_items.map((i) => (
            <li key={i.id} className="flex justify-between py-2">
              <span>{i.product_name} · <b>{i.size}</b> × {i.qty}</span>
              <span>{peso(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
      </section>

      {o.status === "cancelled" && <p className="text-sm">Cancelled {o.cancelled_at && dateTime(o.cancelled_at)}{o.cancel_reason ? ` · ${o.cancel_reason}` : ""}</p>}

      {open && (
        <div className="flex flex-wrap gap-3">
          {o.payment_method === "gcash" && !o.paid_at && (
            <form action={verifyPayment}>
              <input type="hidden" name="id" value={o.id} />
              <SubmitButton confirm={`Confirm you received ${peso(o.total)} with reference ${o.gcash_ref}?`} className="h-10 px-4">Verify GCash payment</SubmitButton>
            </form>
          )}
          {o.status === "pending" && (o.payment_method === "cash" || o.paid_at) && (
            <form action={markReady}>
              <input type="hidden" name="id" value={o.id} />
              <SubmitButton className="h-10 px-4">Mark ready & email customer</SubmitButton>
            </form>
          )}
          {o.status === "ready" && (
            <form action={markClaimed}>
              <input type="hidden" name="id" value={o.id} />
              <SubmitButton confirm={o.paid_at ? "Mark as picked up?" : `Collected ${peso(o.total)} in cash?`} className="h-10 px-4">
                {o.paid_at ? "Mark claimed" : "Cash received · mark claimed"}
              </SubmitButton>
            </form>
          )}
          <form action={cancelOrder}>
            <input type="hidden" name="id" value={o.id} />
            <SubmitButton variant="destructive" confirm="Cancel this order and return its stock?" className="h-10 px-4">Cancel order</SubmitButton>
          </form>
        </div>
      )}
    </div>
  );
}
