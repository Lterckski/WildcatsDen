"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { peso } from "@/lib/format";
import { useCart } from "./cart";

const EASE = "cubic-bezier(0.2, 0, 0, 1)";
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Bag button in the header. Opens a side panel that bursts out of the icon as a growing bubble. */
export function BagLink() {
  const { items, count, total, setQty } = useCart();
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLElement>(null);
  const icon = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);

  // Circle centred on the bag icon, in the panel's own coordinates.
  const circle = (r: number) => {
    const p = panel.current!.getBoundingClientRect();
    const i = icon.current!.getBoundingClientRect();
    return `circle(${r}px at ${i.left + i.width / 2 - p.left}px ${i.top + i.height / 2 - p.top}px)`;
  };
  const fullRadius = () => {
    const p = panel.current!.getBoundingClientRect();
    return Math.hypot(p.width, p.height) + 40;
  };

  const open = () => {
    dialog.current!.showModal();
    closing.current = false;
    if (reducedMotion()) {
      panel.current!.animate({ opacity: [0, 1] }, { duration: 200, easing: EASE });
      return;
    }
    panel.current!.animate({ clipPath: [circle(0), circle(fullRadius())] }, { duration: 550, easing: EASE });
    dialog.current!.querySelector("[data-contents]")!.animate(
      { opacity: [0, 1], translate: ["0 12px", "0 0"] },
      { duration: 300, delay: 180, easing: EASE, fill: "backwards" },
    );
  };

  const close = async () => {
    if (closing.current || !dialog.current?.open) return;
    closing.current = true;
    const anim = reducedMotion()
      ? panel.current!.animate({ opacity: [1, 0] }, { duration: 150, easing: EASE, fill: "forwards" })
      : panel.current!.animate({ clipPath: [circle(fullRadius()), circle(0)] }, { duration: 300, easing: EASE, fill: "forwards" });
    dialog.current!.querySelector("[data-backdrop]")!.animate({ opacity: [1, 0] }, { duration: 300, fill: "forwards" });
    await anim.finished;
    dialog.current?.close();
    panel.current?.getAnimations().forEach((a) => a.cancel());
    dialog.current?.querySelector("[data-backdrop]")?.getAnimations().forEach((a) => a.cancel());
  };

  return (
    <>
      <button
        ref={icon}
        type="button"
        onClick={open}
        className="group relative flex items-center gap-2 text-sm font-medium hover:text-maroon"
        aria-label={`Bag, ${count} items`}
        aria-haspopup="dialog"
      >
        <ShoppingBag className="size-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:-rotate-6" />
        {count > 0 && (
          <span key={count} className="pop absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-maroon-deep">
            {count}
          </span>
        )}
      </button>

      <dialog
        ref={dialog}
        aria-label="Your bag"
        onCancel={(e) => {
          e.preventDefault(); // Escape: play the closing bubble instead of vanishing
          close();
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 backdrop:bg-transparent"
      >
        <div data-backdrop onClick={close} className="absolute inset-0 animate-in fade-in bg-maroon-deep/40 duration-300" />
        <aside
          ref={panel}
          className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col overscroll-contain bg-white shadow-2xl"
        >
          <div data-contents className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <h2 className="text-xl font-extrabold tracking-tight">YOUR BAG ({count})</h2>
              <button type="button" onClick={close} aria-label="Close bag" className="p-2 hover:rotate-90 hover:text-maroon">
                <X className="size-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="size-10 text-muted-foreground" />
                <p className="font-semibold">Your bag is empty</p>
                <button type="button" onClick={close} className={buttonVariants({ variant: "outline", className: "h-11 px-6 font-bold" })}>
                  KEEP SHOPPING
                </button>
              </div>
            ) : (
              <>
                <ul className="min-h-0 flex-1 divide-y overflow-y-auto overscroll-contain px-6">
                  {items.map((i) => (
                    <li key={i.variantId} className="flex gap-4 py-4">
                      <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden bg-secondary outline-1 -outline-offset-1 outline-black/10">
                        {i.image && <Image src={i.image} alt={i.name} fill sizes="80px" className="object-cover" />}
                      </div>
                      <div className="flex flex-1 flex-col text-sm">
                        <div className="flex justify-between gap-2">
                          <div>
                            <p className="font-semibold">{i.name}</p>
                            <p className="text-muted-foreground">Size: {i.size}</p>
                          </div>
                          <button type="button" onClick={() => setQty(i.variantId, 0)} aria-label={`Remove ${i.name}`} className="self-start p-1 hover:text-maroon">
                            <X className="size-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center border">
                            <button type="button" onClick={() => setQty(i.variantId, i.qty - 1)} className="p-2 hover:bg-secondary" aria-label="One less"><Minus className="size-3" /></button>
                            <span key={i.qty} className="w-7 animate-in fade-in text-center">{i.qty}</span>
                            <button type="button" onClick={() => setQty(i.variantId, i.qty + 1)} disabled={i.qty >= i.stock} className="p-2 hover:bg-secondary disabled:opacity-30" aria-label="One more"><Plus className="size-3" /></button>
                          </div>
                          <p className="font-bold">{peso(i.price * i.qty)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="space-y-3 border-t bg-secondary px-6 py-5">
                  <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{peso(total)}</span></div>
                  <p className="text-xs text-muted-foreground">Pickup at the SSG Office. Pay with GCash or cash.</p>
                  <Link href="/checkout" onClick={close} className={buttonVariants({ className: "press h-12 w-full font-bold tracking-wide" })}>
                    CHECK OUT
                  </Link>
                  <Link href="/bag" onClick={close} className="link-underline mx-auto block w-fit text-sm font-semibold text-maroon">
                    View full bag
                  </Link>
                </div>
              </>
            )}
          </div>
        </aside>
      </dialog>
    </>
  );
}
