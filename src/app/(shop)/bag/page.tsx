"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/components/cart";
import { peso } from "@/lib/format";

export default function BagPage() {
  const { items, setQty, total, count } = useCart();

  if (items.length === 0)
    return (
      <div className="rise mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold">Your bag is empty</h1>
        <Link href="/" className={buttonVariants({ className: "press mt-6 h-11 px-8 font-bold" })}>CONTINUE SHOPPING</Link>
      </div>
    );

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[1fr_340px] md:px-8">
      <div>
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight">YOUR BAG ({count})</h1>
        <ul className="divide-y border-y">
          {items.map((i) => (
            <li key={i.variantId} className="flex animate-in fade-in slide-in-from-bottom-2 gap-4 py-5 duration-500">
              <Link href={`/products/${i.slug}`} className="group relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-secondary outline-1 -outline-offset-1 outline-black/10">
                {i.image && <Image src={i.image} alt={i.name} fill sizes="96px" className="object-cover transition-transform duration-500 group-hover:scale-105" />}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-semibold">{i.name}</p>
                    <p className="text-sm text-muted-foreground">Size: {i.size}</p>
                  </div>
                  <button onClick={() => setQty(i.variantId, 0)} aria-label={`Remove ${i.name}`} className="self-start p-1 hover:rotate-90 hover:text-maroon">
                    <X className="size-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center border">
                    <button onClick={() => setQty(i.variantId, i.qty - 1)} className="p-2 hover:bg-secondary" aria-label="One less"><Minus className="size-3" /></button>
                    <span key={i.qty} className="w-8 animate-in fade-in zoom-in-75 text-center text-sm">{i.qty}</span>
                    <button onClick={() => setQty(i.variantId, i.qty + 1)} disabled={i.qty >= i.stock} className="p-2 hover:bg-secondary disabled:opacity-30" aria-label="One more"><Plus className="size-3" /></button>
                  </div>
                  <p key={i.qty} className="animate-in fade-in font-bold">{peso(i.price * i.qty)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="rise h-fit bg-secondary p-6 md:mt-14" style={{ animationDelay: "100ms" }}>
        <h2 className="font-extrabold">ORDER SUMMARY</h2>
        <div className="mt-4 flex justify-between text-sm"><span>Subtotal</span><span>{peso(total)}</span></div>
        <div className="mt-2 flex justify-between text-sm"><span>Pickup at SSG Office</span><span>Free</span></div>
        <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold"><span>Total</span><span>{peso(total)}</span></div>
        <Link href="/checkout" className={buttonVariants({ className: "press mt-6 h-12 w-full font-bold tracking-wide hover:shadow-md" })}>CHECK OUT</Link>
      </aside>
    </div>
  );
}
