"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { compressAll } from "@/lib/compress";
import type { Product } from "@/lib/types";
import { saveProduct, type FormState } from "../../../actions";

// New products start with the tee sizes and current prices (₱320 up to L, ₱340 for XL and up).
const NEW_ROWS = ["XS", "S", "M", "L", "XL", "2XL"].map((size, i) => ({ size, price: i < 4 ? 320 : 340, stock: 0 }));
type Row = { id?: string; size: string; price: number; stock: number };

export function ProductForm({ product, saved }: { product: Product | null; saved: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, saved ? { ok: "Saved." } : {});
  const [rows, setRows] = useState<Row[]>(
    product?.variants.map((v) => ({ id: v.id, size: v.size, price: v.price, stock: v.stock })) ?? NEW_ROWS,
  );
  const [images, setImages] = useState(product?.images ?? []);
  const [removed, setRemoved] = useState<string[]>([]);
  const set = (i: number, patch: Partial<Row>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <form action={action} className="space-y-6 bg-white p-6">
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <input type="hidden" name="variants" value={JSON.stringify(rows)} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="removed_images" value={JSON.stringify(removed)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required defaultValue={product?.name} className="h-10" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" list="categories" required defaultValue={product?.category ?? "Tees"} className="h-10" />
          <datalist id="categories"><option value="Tees" /><option value="Bags" /><option value="Accessories" /></datalist>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="slug">Link name</Label>
          <Input id="slug" name="slug" placeholder="made from the name if left empty" defaultValue={product?.slug} className="h-10" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} defaultValue={product?.description} />
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="size-4 accent-maroon" />
          Show in store
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-bold">Sizes, prices and stock</legend>
        <div className="flex gap-2 text-xs text-muted-foreground"><span className="w-32">Size</span><span className="w-24">Price (₱)</span><span className="w-24">Stock</span></div>
        {rows.map((r, i) => (
          <div key={r.id ?? `new-${i}`} className="flex animate-in fade-in slide-in-from-left-2 items-center gap-2 duration-300">
            <Input aria-label="Size" value={r.size} onChange={(e) => set(i, { size: e.target.value })} className="h-9 w-32" />
            <Input aria-label={`Price for ${r.size}`} type="number" min={1} value={r.price} onChange={(e) => set(i, { price: Math.max(0, Math.floor(Number(e.target.value) || 0)) })} className="h-9 w-24" />
            <Input aria-label={`Stock for ${r.size}`} type="number" min={0} value={r.stock} onChange={(e) => set(i, { stock: Math.max(0, Math.floor(Number(e.target.value) || 0)) })} className="h-9 w-24" />
            <Button type="button" variant="ghost" size="icon" aria-label={`Remove size ${r.size}`} onClick={() => setRows(rows.filter((_, j) => j !== i))}>
              <X />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => setRows([...rows, { size: "", price: rows.at(-1)?.price ?? 0, stock: 0 }])}>Add size</Button>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-bold">Photos</legend>
        <div className="flex flex-wrap gap-3">
          {images.map((src, i) => (
            <div key={src} className="relative h-32 w-24 animate-in fade-in zoom-in-95 bg-secondary duration-300">
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
              {i === 0 && <span className="absolute bottom-0 left-0 bg-maroon px-1 text-[10px] text-white">Main</span>}
              <button type="button" aria-label="Remove photo" onClick={() => { setImages(images.filter((x) => x !== src)); setRemoved([...removed, src]); }} className="absolute top-1 right-1 bg-white p-0.5 hover:scale-110 hover:text-destructive">
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
        <Input name="photos" type="file" accept="image/*" multiple className="h-auto py-2" onChange={(e) => compressAll(e.currentTarget, 1400)} />
        <p className="text-xs text-muted-foreground">Photos are shrunk before upload. The first photo is the one shown in the store.</p>
      </fieldset>

      {state.error && <p key={state.error} role="alert" className="animate-in fade-in slide-in-from-top-1 text-sm text-destructive">{state.error}</p>}
      {state.ok && <p role="status" className="animate-in fade-in slide-in-from-top-1 text-sm text-green-700">{state.ok}</p>}
      <Button type="submit" disabled={pending} className="h-10 px-6">{pending ? "Saving…" : "Save"}</Button>
    </form>
  );
}
