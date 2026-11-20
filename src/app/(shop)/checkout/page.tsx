"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/components/cart";
import { compressInput } from "@/lib/compress";
import { peso, PICKUP } from "@/lib/format";
import { placeOrder, type CheckoutState } from "../actions";

const GCASH_NUMBER = process.env.NEXT_PUBLIC_GCASH_NUMBER || "0900 000 0000";
const GCASH_NAME = process.env.NEXT_PUBLIC_GCASH_NAME || "GCash account name";
const GCASH_QR = process.env.NEXT_PUBLIC_GCASH_QR;

export default function CheckoutPage() {
  const { items, total } = useCart();
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});
  const v = state.values ?? {};
  const [payment, setPayment] = useState(v.payment || "gcash");
  const [student, setStudent] = useState(v.cit_student || "");

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold">Your bag is empty</h1>
        <Link href="/" className={buttonVariants({ className: "mt-6 h-11 px-8 font-bold" })}>CONTINUE SHOPPING</Link>
      </div>
    );

  const choice = "flex cursor-pointer items-start gap-3 border p-4 transition-colors hover:border-foreground/40 has-checked:border-maroon has-checked:bg-maroon/5";

  return (
    <form action={action} className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[1fr_340px] md:px-8">
      <input type="hidden" name="items" value={JSON.stringify(items.map((i) => ({ variant_id: i.variantId, qty: i.qty })))} />
      <div className="rise space-y-10">
        <h1 className="text-3xl font-extrabold tracking-tight">CHECKOUT</h1>

        <section className="space-y-4">
          <h2 className="text-lg font-bold">1. Your details</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required autoComplete="name" defaultValue={v.name} className="h-11" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" defaultValue={v.email} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile number</Label>
              <Input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="0917 123 4567" defaultValue={v.phone} className="h-11" />
            </div>
          </div>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">Are you a current CIT-U student?</legend>
            <div className="grid grid-cols-2 gap-3">
              {["yes", "no"].map((x) => (
                <label key={x} className={choice}>
                  <input type="radio" name="cit_student" value={x} required checked={student === x} onChange={() => setStudent(x)} className="mt-1 accent-maroon" />
                  <span className="text-sm font-medium">{x === "yes" ? "Yes" : "No"}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Anyone can order. This just helps us know our buyers.</p>
          </fieldset>
          {student === "yes" && (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-2 duration-300">
              <Label htmlFor="student_id">Student ID (optional)</Label>
              <Input id="student_id" name="student_id" defaultValue={v.student_id} className="h-11" />
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold">2. Pickup</h2>
          <p className="border p-4 text-sm">
            <b>{PICKUP}</b>
            <br />
            We&apos;ll email you when your order is ready. Bring your order code.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold">3. Payment</h2>
          <label className={choice}>
            <input type="radio" name="payment" value="gcash" checked={payment === "gcash"} onChange={() => setPayment("gcash")} className="mt-1 accent-maroon" />
            <span>
              <span className="block text-sm font-semibold">GCash</span>
              <span className="text-xs text-muted-foreground">Send the total, then upload your receipt. Staff verify it before pickup.</span>
            </span>
          </label>
          <label className={choice}>
            <input type="radio" name="payment" value="cash" checked={payment === "cash"} onChange={() => setPayment("cash")} className="mt-1 accent-maroon" />
            <span>
              <span className="block text-sm font-semibold">Cash on pickup</span>
              <span className="text-xs text-muted-foreground">Pay at the SSG Office. Orders not claimed within 7 days are cancelled and the stock is released.</span>
            </span>
          </label>

          {payment === "gcash" && (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-4 bg-secondary p-5 duration-300">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {GCASH_QR && (
                  // eslint-disable-next-line @next/next/no-img-element -- the QR comes from settings, any URL
                  <img src={GCASH_QR} alt="GCash QR code" className="size-40 bg-white object-contain p-2" />
                )}
                <div className="text-sm">
                  <p>Send <b className="text-lg">{peso(total)}</b> to</p>
                  <p className="mt-1 text-lg font-bold tracking-wide">{GCASH_NUMBER}</p>
                  <p className="text-muted-foreground">{GCASH_NAME}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gcash_ref">GCash reference number</Label>
                <Input id="gcash_ref" name="gcash_ref" required inputMode="numeric" defaultValue={v.gcash_ref} className="h-11 bg-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt">Receipt screenshot</Label>
                <Input
                  id="receipt"
                  name="receipt"
                  type="file"
                  accept="image/*"
                  required
                  className="h-auto bg-white py-2"
                  onChange={(e) => compressInput(e.currentTarget, 1400)}
                />
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="rise h-fit bg-secondary p-6 md:sticky md:top-24 md:mt-14" style={{ animationDelay: "120ms" }}>
        <h2 className="font-extrabold">ORDER SUMMARY</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.variantId} className="flex justify-between gap-2">
              <span>{i.name} ({i.size}) × {i.qty}</span>
              <span>{peso(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold"><span>Total</span><span>{peso(total)}</span></div>
        {state.error && <p key={state.error} role="alert" className="mt-4 animate-in fade-in slide-in-from-top-1 text-sm font-medium text-destructive">{state.error}</p>}
        <Button type="submit" disabled={pending} className="mt-6 h-12 w-full font-bold tracking-wide hover:shadow-md">
          {pending ? "PLACING ORDER…" : "PLACE ORDER"}
        </Button>
      </aside>
    </form>
  );
}
