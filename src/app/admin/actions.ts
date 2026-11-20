"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { sendReadyForPickup } from "@/lib/email";
import { adminDb, db } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";

export type FormState = { error?: string; ok?: string };

const text = (form: FormData, k: string) => String(form.get(k) ?? "").trim();

// ---------- Sign in ----------

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const supabase = await db();
  const { error } = await supabase.auth.signInWithPassword({ email: text(form, "email"), password: text(form, "password") });
  if (error) return { error: "Wrong email or password." };
  redirect("/admin");
}

export async function signOut() {
  await (await db()).auth.signOut();
  redirect("/admin/login");
}

// ---------- Orders ----------

async function getOrder(id: string) {
  const { data } = await (await db()).from("orders").select("*").eq("id", id).single();
  if (!data) throw new Error("Order not found");
  return data as Order;
}

async function updateOrder(id: string, patch: Partial<Order>) {
  const { data, error } = await (await db()).from("orders").update(patch).eq("id", id).select().single();
  if (error) throw error;
  revalidatePath("/admin", "layout");
  return data as Order;
}

export async function verifyPayment(form: FormData) {
  await requireStaff();
  const o = await getOrder(text(form, "id"));
  if (o.payment_method === "gcash" && !o.paid_at && o.status !== "cancelled") await updateOrder(o.id, { paid_at: new Date().toISOString() });
}

export async function markReady(form: FormData) {
  await requireStaff();
  const o = await getOrder(text(form, "id"));
  if (o.status !== "pending" || (o.payment_method === "gcash" && !o.paid_at)) return;
  const updated = await updateOrder(o.id, { status: "ready", ready_at: new Date().toISOString() });
  await sendReadyForPickup(updated);
}

export async function markClaimed(form: FormData) {
  await requireStaff();
  const o = await getOrder(text(form, "id"));
  if (o.status !== "ready") return;
  const now = new Date().toISOString();
  // Cash is collected at the counter, so claiming also records the payment.
  await updateOrder(o.id, { status: "claimed", claimed_at: now, paid_at: o.paid_at ?? now });
}

export async function cancelOrder(form: FormData) {
  const me = await requireStaff();
  const { error } = await adminDb().rpc("cancel_order", { p_order: text(form, "id"), p_reason: `Cancelled by ${me.full_name || me.email}` });
  if (error) throw error;
  revalidatePath("/admin", "layout");
}

// ---------- Products ----------

const PUBLIC_PHOTOS = "/storage/v1/object/public/products/";

export async function saveProduct(_: FormState, form: FormData): Promise<FormState> {
  await requireStaff();
  const supabase = await db();
  const id = text(form, "id");
  const name = text(form, "name");
  const slug = (text(form, "slug") || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const price = Number(text(form, "price"));
  if (!name || !slug) return { error: "Name is required." };
  if (!Number.isInteger(price) || price < 0) return { error: "Price must be a whole number of pesos." };

  let variants: { id?: string; size: string; stock: number }[];
  let kept: string[];
  try {
    variants = JSON.parse(text(form, "variants"));
    kept = JSON.parse(text(form, "images"));
  } catch {
    return { error: "Something went wrong reading the form. Please reload." };
  }
  variants = variants.map((v) => ({ ...v, size: v.size.trim() })).filter((v) => v.size);
  if (variants.length === 0) return { error: "Add at least one size." };
  if (variants.some((v) => !Number.isInteger(v.stock) || v.stock < 0)) return { error: "Stock must be 0 or more." };
  if (new Set(variants.map((v) => v.size.toLowerCase())).size !== variants.length) return { error: "Each size can only appear once." };

  const uploads = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const added: string[] = [];
  for (const file of uploads) {
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) return { error: "Photos must be images under 2 MB." };
    const path = `${crypto.randomUUID()}.webp`;
    const { error } = await supabase.storage.from("products").upload(path, file, { contentType: file.type });
    if (error) return { error: `Photo upload failed: ${error.message}` };
    added.push(supabase.storage.from("products").getPublicUrl(path).data.publicUrl);
  }

  const row = {
    name,
    slug,
    price,
    category: text(form, "category") || "Tees",
    description: text(form, "description"),
    active: form.get("active") === "on",
    images: [...kept, ...added],
  };
  const saved = id
    ? await supabase.from("products").update(row).eq("id", id).select("id, images").single()
    : await supabase.from("products").insert(row).select("id, images").single();
  if (saved.error) return { error: saved.error.code === "23505" ? "Another product already uses that link name." : saved.error.message };
  const productId = saved.data.id as string;

  // Photos removed from a product are deleted from storage to stay inside the free 1 GB.
  const removed = text(form, "removed_images");
  if (removed) {
    const paths = (JSON.parse(removed) as string[]).filter((u) => u.includes(PUBLIC_PHOTOS)).map((u) => u.split(PUBLIC_PHOTOS)[1]);
    if (paths.length) await supabase.storage.from("products").remove(paths);
  }

  const { data: existing } = await supabase.from("variants").select("id").eq("product_id", productId);
  const keepIds = new Set(variants.map((v) => v.id).filter(Boolean));
  const drop = (existing ?? []).filter((v) => !keepIds.has(v.id)).map((v) => v.id);
  if (drop.length) await supabase.from("variants").delete().in("id", drop);
  for (const [i, v] of variants.entries()) {
    const r = v.id
      ? await supabase.from("variants").update({ size: v.size, stock: v.stock, sort: i }).eq("id", v.id)
      : await supabase.from("variants").insert({ product_id: productId, size: v.size, stock: v.stock, sort: i });
    if (r.error) return { error: r.error.message };
  }

  revalidatePath("/", "layout");
  redirect(`/admin/products/${productId}?saved=1`);
}

// ---------- Staff accounts (admin only) ----------

export async function addStaff(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const email = text(form, "email").toLowerCase();
  const password = text(form, "password");
  const role = text(form, "role") === "admin" ? "admin" : "staff";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email." };
  if (password.length < 8) return { error: "The password needs at least 8 characters." };
  const supabase = adminDb();
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) return { error: error?.message ?? "Could not create the account." };
  const { error: pErr } = await supabase.from("profiles").insert({ id: data.user.id, full_name: text(form, "full_name"), role });
  if (pErr) {
    await supabase.auth.admin.deleteUser(data.user.id);
    return { error: pErr.message };
  }
  revalidatePath("/admin/staff");
  return { ok: `Added ${email}. Share the password with them privately.` };
}

export async function setRole(form: FormData) {
  const me = await requireAdmin();
  const id = text(form, "id");
  if (id === me.id) return; // an admin can't demote themselves and lock everyone out
  await adminDb().from("profiles").update({ role: text(form, "role") === "admin" ? "admin" : "staff" }).eq("id", id);
  revalidatePath("/admin/staff");
}

export async function removeStaff(form: FormData) {
  const me = await requireAdmin();
  const id = text(form, "id");
  if (id === me.id) return;
  await adminDb().auth.admin.deleteUser(id);
  revalidatePath("/admin/staff");
}
