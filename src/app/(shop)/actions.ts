"use server";

import { redirect } from "next/navigation";
import { adminDb } from "@/lib/supabase/server";
import { sendOrderPlaced } from "@/lib/email";
import type { Order, OrderItem } from "@/lib/types";

export type CheckoutState = { error?: string; values?: Record<string, string> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PH_MOBILE = /^(\+?63|0)9\d{9}$/;
const UUID = /^[0-9a-f-]{36}$/i;

export async function placeOrder(_: CheckoutState, form: FormData): Promise<CheckoutState> {
  const text = (k: string) => String(form.get(k) ?? "").trim();
  const values = {
    name: text("name"),
    email: text("email").toLowerCase(),
    phone: text("phone").replace(/[\s-]/g, ""),
    cit_student: text("cit_student"),
    student_id: text("student_id"),
    payment: text("payment"),
    gcash_ref: text("gcash_ref"),
  };
  const fail = (error: string) => ({ error, values });

  if (values.name.length < 2 || values.name.length > 100) return fail("Please enter your full name.");
  if (!EMAIL.test(values.email) || values.email.length > 200) return fail("Please enter a valid email address.");
  if (!PH_MOBILE.test(values.phone)) return fail("Please enter a valid mobile number, like 0917 123 4567.");
  if (!["yes", "no"].includes(values.cit_student)) return fail("Please tell us if you are a current CIT-U student.");
  if (values.student_id.length > 30) return fail("That student ID looks too long.");
  if (!["gcash", "cash"].includes(values.payment)) return fail("Please choose how you'll pay.");

  let items: { variant_id: string; qty: number }[];
  try {
    items = JSON.parse(text("items"));
    if (!Array.isArray(items) || items.length === 0 || items.length > 30) throw 0;
    items = items.map((i) => ({ variant_id: String(i.variant_id), qty: Number(i.qty) }));
    if (items.some((i) => !UUID.test(i.variant_id) || !Number.isInteger(i.qty) || i.qty < 1)) throw 0;
  } catch {
    return fail("Your bag is empty or out of date. Please refresh and try again.");
  }

  const supabase = adminDb();
  let receiptPath: string | null = null;
  if (values.payment === "gcash") {
    if (values.gcash_ref.length < 6 || values.gcash_ref.length > 40) return fail("Please enter the GCash reference number.");
    const receipt = form.get("receipt");
    if (!(receipt instanceof File) || receipt.size === 0) return fail("Please attach a screenshot of your GCash receipt.");
    if (!["image/webp", "image/jpeg", "image/png"].includes(receipt.type) || receipt.size > 5 * 1024 * 1024)
      return fail("The receipt must be a JPG, PNG or WebP image under 5 MB.");
    receiptPath = `${crypto.randomUUID()}.${receipt.type.split("/")[1]}`;
    const { error } = await supabase.storage.from("receipts").upload(receiptPath, receipt, { contentType: receipt.type });
    if (error) return fail("We couldn't upload your receipt. Please try again.");
  }

  const { data, error } = await supabase.rpc("place_order", {
    p_name: values.name,
    p_email: values.email,
    p_phone: values.phone,
    p_cit_student: values.cit_student === "yes",
    p_student_id: values.student_id,
    p_payment_method: values.payment,
    p_gcash_ref: values.payment === "gcash" ? values.gcash_ref : "",
    p_items: items,
  });
  if (error || !data) {
    if (receiptPath) await supabase.storage.from("receipts").remove([receiptPath]);
    // place_order raises shopper-readable messages (sold out, bag empty); anything else gets a generic one.
    return fail(error?.code === "P0001" ? error.message : "Something went wrong placing your order. Please try again.");
  }

  let order = data as Order;
  if (receiptPath) {
    const { data: updated } = await supabase.from("orders").update({ receipt_path: receiptPath }).eq("id", order.id).select().single();
    if (updated) order = updated as Order;
  }
  const { data: orderItems } = await supabase.from("order_items").select("*").eq("order_id", order.id);
  await sendOrderPlaced(order, (orderItems ?? []) as OrderItem[]);

  redirect(`/orders/${order.id}?placed=1`);
}
