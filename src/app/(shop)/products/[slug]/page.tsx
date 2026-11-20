import { notFound } from "next/navigation";
import { getProduct } from "@/lib/catalog";
import { ProductView } from "./product-view";

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  return <ProductView product={product} />;
}
