import Image from "next/image";
import Link from "next/link";
import { priceRange } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const sizes = product.variants.map((v) => v.size);
  const soldOut = product.variants.every((v) => v.stock === 0);
  return (
    <Link href={`/products/${product.slug}`} className="group reveal block">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        )}
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover opacity-0 transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100"
          />
        )}
        {soldOut && (
          <span className="absolute top-3 left-3 bg-white px-2 py-1 text-xs font-bold tracking-wide">SOLD OUT</span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs text-muted-foreground">
          {sizes.length > 1 ? `${sizes[0]}–${sizes[sizes.length - 1]}` : sizes[0]}
        </p>
        <h3 className="text-sm font-semibold leading-snug transition-colors group-hover:text-maroon">{product.name}</h3>
        <p className="text-base font-bold">{priceRange(product.variants)}</p>
      </div>
    </Link>
  );
}
