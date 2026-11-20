"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart";

export function BagLink() {
  const { count } = useCart();
  return (
    <Link href="/bag" className="relative flex items-center gap-2 text-sm font-medium" aria-label={`Bag, ${count} items`}>
      <ShoppingBag className="size-5" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-maroon-deep">
          {count}
        </span>
      )}
    </Link>
  );
}
