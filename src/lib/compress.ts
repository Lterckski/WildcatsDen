/** Shrinks a photo in the browser to WebP so uploads stay small (Supabase free tier has 1 GB of storage). */
export async function compressImage(file: File, maxSide = 1600, quality = 0.8): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", quality));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
}

/** Swaps the file in an <input type="file"> for its compressed copy, so a plain form submit sends the small one. */
export async function compressInput(input: HTMLInputElement, maxSide?: number) {
  const file = input.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
  const small = await compressImage(file, maxSide);
  const dt = new DataTransfer();
  dt.items.add(small);
  input.files = dt.files;
}

/** Same as compressInput, for a multi-file input. */
export async function compressAll(input: HTMLInputElement, maxSide?: number) {
  const files = [...(input.files ?? [])].filter((f) => f.type.startsWith("image/"));
  const dt = new DataTransfer();
  for (const f of files) dt.items.add(await compressImage(f, maxSide));
  input.files = dt.files;
}
