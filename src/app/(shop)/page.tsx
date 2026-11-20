import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { SetupNeeded } from "@/components/setup-needed";
import { getProducts } from "@/lib/catalog";
import { supabaseReady } from "@/lib/supabase/server";

export default async function Home() {
  if (!supabaseReady) return <SetupNeeded />;
  const products = await getProducts();
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <>
      <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden bg-maroon-deep">
        <Image src="/products/hero-group.webp" alt="Wildcats wearing Den merch on campus" fill priority sizes="100vw" className="settle object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/90 via-maroon-deep/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-12 md:px-8 md:pb-16">
          <p className="rise text-sm font-semibold tracking-[0.3em] text-gold">EST. 1946</p>
          <h1 style={{ animationDelay: "120ms" }} className="rise mt-2 text-5xl font-extrabold tracking-tight text-white md:text-7xl">ALL HAIL<br />WILDCATS</h1>
          <Link href="#shop" style={{ animationDelay: "240ms" }} className="rise press mt-6 inline-block bg-gold px-8 py-3 text-sm font-bold tracking-wide text-maroon-deep hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
            SHOP THE COLLECTION
          </Link>
        </div>
      </section>

      <div id="shop" className="mx-auto max-w-7xl scroll-mt-20 px-4 md:px-8">
        {categories.map((c) => (
          <section key={c} id={c.toLowerCase()} className="scroll-mt-20 pt-14">
            <h2 className="reveal mb-6 border-b pb-3 text-2xl font-extrabold tracking-tight">{c.toUpperCase()}</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {products.filter((p) => p.category === c).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        ))}
        {products.length === 0 && <p className="py-24 text-center text-muted-foreground">New drops coming soon.</p>}
      </div>
    </>
  );
}
