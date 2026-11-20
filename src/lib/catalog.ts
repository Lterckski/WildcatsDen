import "server-only";
import { db } from "./supabase/server";
import { sortVariants } from "./format";
import type { Product } from "./types";

export async function getProducts(): Promise<Product[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants(*)")
    .eq("active", true)
    .order("created_at");
  if (error) throw error;
  return (data as Product[]).map((p) => ({ ...p, variants: sortVariants(p.variants) }));
}

export async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await db();
  const { data } = await supabase.from("products").select("*, variants(*)").eq("slug", slug).eq("active", true).maybeSingle();
  return data ? { ...(data as Product), variants: sortVariants((data as Product).variants) } : null;
}
