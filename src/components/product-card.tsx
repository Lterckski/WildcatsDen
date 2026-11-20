import Image from "next/image";
import Link from "next/link";
import { priceRange } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.variants.every((v) => v.stock === 0);
  const low = !soldOut && product.variants.some((v) => v.stock > 0 && v.stock <= 5);
  return (
    <Link href={`/products/${product.slug}`} className="group reveal block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary outline-1 -outline-offset-1 outline-black/10">
        {product.images[0] && (
          <Image src={product.images[0]} alt={product.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-[scale] duration-700 ease-out group-hover:scale-[1.04]" />
        )}
        {product.images[1] && (
          <Image src={product.images[1]} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover opacity-0 transition-[opacity,scale] duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100" />
        )}
        {(soldOut || low) && (
          <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${soldOut ? "bg-white text-foreground" : "bg-gold text-maroon-deep"}`}>
            {soldOut ? "SOLD OUT" : "SELLING FAST"}
          </span>
        )}
        <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1 opacity-0 transition-[opacity,translate] duration-300 group-hover:opacity-100 [@media(hover:hover)]:translate-y-2 group-hover:translate-y-0">
          {product.variants.map((v) => (
            <span key={v.id} className={`rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold ${v.stock === 0 ? "text-muted-foreground line-through" : ""}`}>{v.size}</span>
          ))}
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-semibold leading-snug transition-colors group-hover:text-maroon">{product.name}</h3>
        <p className="text-base font-extrabold text-maroon">{priceRange(product.variants)}</p>
      </div>
    </Link>
  );
}
