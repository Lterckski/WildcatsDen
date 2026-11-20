"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart";

export function ClearBag() {
  const { clear, count } = useCart();
  useEffect(() => {
    if (count > 0) clear();
  }, [count, clear]);
  return null;
}
