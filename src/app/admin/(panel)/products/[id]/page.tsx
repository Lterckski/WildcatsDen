import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/supabase/server";
import { sortVariants } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductForm } from "./product-form";

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  let product: Product | null = null;
  if (id !== "new") {
    const { data } = await (await db()).from("products").select("*, variants(*)").eq("id", id).maybeSingle();
    if (!data) notFound();
    product = { ...(data as Product), variants: sortVariants((data as Product).variants) };
  }
  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/products" className="text-sm text-muted-foreground hover:underline">← Inventory</Link>
      <h1 className="text-2xl font-extrabold">{product ? product.name : "New product"}</h1>
      {/* Remount after each save so the form starts from what was stored (new photo URLs, new size ids). */}
      <ProductForm key={JSON.stringify(product)} product={product} saved={(await searchParams).saved === "1"} />
    </div>
  );
}
