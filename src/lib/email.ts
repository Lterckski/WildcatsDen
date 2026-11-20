import "server-only";
import { peso, PICKUP } from "./format";
import type { Order, OrderItem } from "./types";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

async function send(to: string, subject: string, body: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`RESEND_API_KEY not set; skipped email "${subject}"`);
    return;
  }
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1a1a1a">
    <div style="background:#7B2232;color:#FFD35C;padding:20px 24px;font-weight:800;letter-spacing:2px;font-size:18px">WILDCATS DEN</div>
    <div style="padding:24px;line-height:1.6">${body}</div></div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "Wildcats Den <onboarding@resend.dev>", to, subject, html }),
  });
  // An email failure must never undo an order, so it is only logged.
  if (!res.ok) console.error("Resend error", res.status, await res.text());
}

const itemsTable = (items: OrderItem[], total: number) =>
  `<table style="width:100%;border-collapse:collapse;margin:16px 0">${items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #eee">${esc(i.product_name)} (${esc(i.size)}) × ${i.qty}</td><td style="text-align:right;border-bottom:1px solid #eee">${peso(i.price * i.qty)}</td></tr>`,
    )
    .join("")}<tr><td style="padding:8px 0;font-weight:700">Total</td><td style="text-align:right;font-weight:700">${peso(total)}</td></tr></table>`;

const link = (o: Order) => `<p><a href="${site}/orders/${o.id}" style="color:#7B2232;font-weight:700">View your order</a></p>`;

export function sendOrderPlaced(o: Order, items: OrderItem[]) {
  const pay =
    o.payment_method === "gcash"
      ? "We received your GCash receipt. Our staff will verify it and email you when your order is ready for pickup."
      : `Please pay in cash when you pick up your order at the ${PICKUP}. Orders not claimed within 7 days are cancelled.`;
  return send(
    o.email,
    `Order ${o.code} received`,
    `<p>Hi ${esc(o.name)},</p><p>Thanks for your order <b>${o.code}</b>.</p>${itemsTable(items, o.total)}<p>${pay}</p>${link(o)}`,
  );
}

export function sendReadyForPickup(o: Order) {
  const pay = o.paid_at ? "Your payment is confirmed." : `Please bring ${peso(o.total)} in cash.`;
  return send(
    o.email,
    `Order ${o.code} is ready for pickup`,
    `<p>Hi ${esc(o.name)},</p><p>Your order <b>${o.code}</b> is ready. Pick it up at the <b>${PICKUP}</b> and show your order code. ${pay}</p>${
      o.paid_at ? "" : "<p>Unclaimed orders are cancelled 7 days after they were placed.</p>"
    }${link(o)}`,
  );
}
