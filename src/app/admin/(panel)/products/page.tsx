import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/supabase/server";
import { priceRange, sortVariants } from "@/lib/format";
import type { Product } from "@/lib/types";

export default async function ProductsPage() {
  const { data } = await (await db()).from("products").select("*, variants(*)").order("category").order("name");
  const products = (data ?? []) as Product[];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Inventory</h1>
        <Link href="/admin/products/new" className={buttonVariants({ className: "h-10 px-4" })}>New product</Link>
      </div>
      <div className="bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16" />
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock by size</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const total = p.variants.reduce((n, v) => n + v.stock, 0);
              return (
                <TableRow key={p.id} className={p.active ? "" : "opacity-50"}>
                  <TableCell>
                    <div className="group relative h-16 w-12 overflow-hidden bg-secondary">
                      {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover transition-transform duration-300 group-hover:scale-110" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/products/${p.id}`} className="font-semibold text-maroon underline-offset-4 hover:underline">{p.name}</Link>
                    <p className="text-xs text-muted-foreground">{p.category}{p.active ? "" : " · Hidden"}</p>
                  </TableCell>
                  <TableCell>{priceRange(p.variants)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {sortVariants(p.variants).map((v) => (
                        <span key={v.id} className={`border px-2 py-0.5 text-xs ${v.stock === 0 ? "border-destructive text-destructive" : v.stock <= 5 ? "border-amber-500 text-amber-700" : ""}`}>
                          {v.size}: {v.stock}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{total}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
