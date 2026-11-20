"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart";
import { peso, PICKUP, priceRange } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductView({ product }: { product: Product }) {
  const cart = useCart();
  const [image, setImage] = useState(0);
  const [variantId, setVariantId] = useState(product.variants.find((v) => v.stock > 0)?.id ?? "");
  const [added, setAdded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const variant = product.variants.find((v) => v.id === variantId);
  const inBag = cart.items.find((i) => i.variantId === variantId)?.qty ?? 0;
  const canAdd = variant && variant.stock > inBag;

  const add = () => {
    if (!variant) return;
    cart.add({
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      size: variant.size,
      price: variant.price,
      image: product.images[0] ?? "",
      qty: 1,
      stock: variant.stock,
    });
    setAdded(true);
    setJustAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div className="rise mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[1fr_400px] md:gap-12 md:px-8">
      <div className="flex flex-col-reverse gap-3 md:flex-row">
        {product.images.length > 1 && (
          <div className="flex gap-2 md:flex-col">
            {product.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setImage(i)}
                aria-label={`Photo ${i + 1}`}
                className={`relative aspect-[3/4] w-16 overflow-hidden bg-secondary ${i === image ? "ring-2 ring-maroon" : "opacity-60 hover:opacity-100"}`}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-secondary outline-1 -outline-offset-1 outline-black/10">
          {product.images[image] && (
            <Image key={image} src={product.images[image]} alt={product.name} fill priority sizes="(min-width: 768px) 60vw, 100vw" className="animate-in fade-in object-cover duration-500" />
          )}
        </div>
      </div>

      <div className="md:sticky md:top-24 md:self-start">
        <p className="text-xs font-semibold tracking-[0.2em] text-maroon uppercase">{product.category}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{product.name}</h1>
        <p key={variant?.price} className="mt-3 animate-in fade-in text-2xl font-bold">{variant ? peso(variant.price) : priceRange(product.variants)}</p>
        {product.description && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>}

        <fieldset className="mt-8">
          <legend className="mb-3 text-sm font-bold">
            Size{variant ? `: ${variant.size}` : ""}
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                disabled={v.stock === 0}
                onClick={() => {
                  setVariantId(v.id);
                  setAdded(false);
                }}
                aria-pressed={v.id === variantId}
                className={`h-11 min-w-14 border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:text-muted-foreground disabled:line-through ${
                  v.id === variantId ? "border-maroon bg-maroon text-white" : "border-border hover:-translate-y-0.5 hover:border-foreground"
                }`}
              >
                {v.size}
              </button>
            ))}
          </div>
          {variant && variant.stock <= 5 && <p key={variant.id} className="mt-3 animate-in fade-in slide-in-from-top-1 text-sm font-medium text-maroon">Only {variant.stock} left</p>}
        </fieldset>

        <Button onClick={add} disabled={!canAdd} className="mt-8 h-12 w-full text-sm font-bold tracking-wide hover:shadow-md">
          {justAdded ? (
            <span key="added" className="flex items-center gap-2"><Check className="pop size-4" /> ADDED</span>
          ) : !variant ? "SOLD OUT" : canAdd ? "ADD TO BAG" : "ALL IN YOUR BAG"}
        </Button>
        {added && (
          <p className="mt-3 animate-in fade-in slide-in-from-top-1 text-sm duration-300" role="status">
            Added to your bag. <Link href="/bag" className="link-underline font-semibold text-maroon">View bag</Link>
          </p>
        )}
        <div className="mt-8 border-t pt-6 text-sm text-muted-foreground">
          <p><b className="text-foreground">Pickup only</b> at the {PICKUP}.</p>
          <p className="mt-2">Pay with GCash when you order, or in cash at pickup.</p>
        </div>
      </div>
    </div>
  );
}
