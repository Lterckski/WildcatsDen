import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { SetupNeeded } from "@/components/setup-needed";
import { getProducts } from "@/lib/catalog";
import { supabaseReady } from "@/lib/supabase/server";

const LOOKBOOK = [
  "/products/university-maroon-2.webp",
  "/products/all-hail-black-1.webp",
  "/products/corduroy-tote-2.webp",
  "/products/wildcats-1946-white-2.webp",
];

export default async function Home() {
  if (!supabaseReady) return <SetupNeeded />;
  const products = await getProducts();
  const categories = [...new Set(products.map((p) => p.category))];
  const cover = (c: string) => products.find((p) => p.category === c)?.images[0];

  return (
    <>
      {/* Hero: zebra texture, oversized type, two shoot photos */}
      <section className="zebra relative overflow-hidden bg-maroon text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-maroon/70 via-maroon-deep/60 to-maroon-deep/95" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:grid-cols-[1.1fr_1fr] md:px-8 md:py-20">
          <div>
            <p className="rise inline-block rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold tracking-[0.25em] text-gold">EST. 1946 · CIT-U</p>
            <h1 style={{ animationDelay: "100ms" }} className="rise mt-5 font-display text-7xl leading-[0.9] tracking-tight md:text-9xl">
              ALL HAIL
              <br />
              <span className="text-gold">WILDCATS</span>
            </h1>
            <p style={{ animationDelay: "200ms" }} className="rise mt-6 max-w-md text-base text-white/80">
              Official Den merch from our latest shoot. Order online, pay with GCash or cash, and pick it up at the SSG Office.
            </p>
            <div style={{ animationDelay: "300ms" }} className="rise mt-8 flex flex-wrap gap-3">
              <Link href="#shop" className="press rounded-full bg-gold px-8 py-3.5 text-sm font-bold tracking-wide text-maroon-deep hover:bg-white hover:shadow-lg">
                SHOP THE DROP
              </Link>
              <Link href="#how" className="press rounded-full border border-white/30 px-8 py-3.5 text-sm font-bold tracking-wide hover:bg-white/10">
                HOW PICKUP WORKS
              </Link>
            </div>
          </div>
          <div className="relative h-[420px] md:h-[540px]">
            <div className="rise absolute top-0 right-0 h-[85%] w-[62%] -rotate-2 overflow-hidden rounded-2xl shadow-2xl ring-4 ring-gold/80" style={{ animationDelay: "150ms" }}>
              <Image src="/products/wildcats-1946-white-2.webp" alt="Student in the Wildcats 1946 tee" fill priority sizes="(min-width: 768px) 30vw, 60vw" className="object-cover" />
            </div>
            <div className="rise absolute bottom-0 left-0 h-[70%] w-[55%] rotate-3 overflow-hidden rounded-2xl shadow-2xl ring-4 ring-white" style={{ animationDelay: "300ms" }}>
              <Image src="/products/university-maroon-2.webp" alt="Students in the maroon University tee" fill priority sizes="(min-width: 768px) 28vw, 55vw" className="object-cover" />
            </div>
            <span className="rise absolute top-6 left-4 flex size-24 rotate-[-12deg] items-center justify-center rounded-full bg-gold text-center font-display text-lg leading-none text-maroon-deep shadow-xl md:size-28" style={{ animationDelay: "450ms" }}>
              <span className="flex flex-col items-center">FROM<span className="font-heading text-xl font-extrabold">₱320</span></span>
            </span>
          </div>
        </div>
      </section>

      {/* Category tiles */}
      <section id="shop" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-16 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((c) => (
            <Link key={c} href={`#${c.toLowerCase()}`} className="group reveal relative block h-64 overflow-hidden rounded-2xl bg-maroon md:h-80">
              {cover(c) && (
                <Image src={cover(c)!} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover opacity-70 transition-[scale,opacity] duration-700 group-hover:scale-105 group-hover:opacity-90" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/90 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                <h2 className="font-display text-5xl tracking-tight text-white md:text-6xl">{c.toUpperCase()}</h2>
                <span className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-maroon-deep transition-transform group-hover:translate-x-1">SHOP →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Products by category */}
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {categories.map((c) => (
          <section key={c} id={c.toLowerCase()} className="scroll-mt-20 pt-16">
            <div className="reveal mb-8 flex items-end justify-between gap-4">
              <h2 className="font-display text-5xl tracking-tight text-maroon md:text-6xl">{c.toUpperCase()}</h2>
              <p className="pb-2 text-sm text-muted-foreground">{products.filter((p) => p.category === c).length} styles</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {products.filter((p) => p.category === c).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        ))}
        {products.length === 0 && <p className="py-24 text-center text-muted-foreground">New drops coming soon.</p>}
      </div>

      {/* How it works */}
      <section id="how" className="mx-auto mt-24 max-w-7xl scroll-mt-20 px-4 md:px-8">
        <div className="rounded-3xl bg-maroon-deep p-8 text-white md:p-12">
          <h2 className="reveal font-display text-5xl tracking-tight md:text-6xl">HOW IT <span className="text-gold">WORKS</span></h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              ["Order online", "Pick your sizes and check out with your email and mobile number. No account needed."],
              ["Pay your way", "Send GCash and upload the receipt, or pay in cash when you pick up."],
              ["Pick up at SSG", "We email you when it's ready. Show your order code at the SSG Office."],
            ].map(([t, d], i) => (
              <li key={t} className="reveal">
                <span className="font-display text-6xl text-gold">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-bold">{t}</h3>
                <p className="mt-1 text-sm text-white/70">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Lookbook */}
      <section className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
        <h2 className="reveal mb-8 font-display text-5xl tracking-tight text-maroon md:text-6xl">THE LOOKBOOK</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {LOOKBOOK.map((src, i) => (
            <div key={src} className={`reveal relative overflow-hidden rounded-2xl ${i % 2 ? "aspect-[3/4] md:mt-12" : "aspect-[3/4]"}`}>
              <Image src={src} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-[scale] duration-700 hover:scale-105" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
