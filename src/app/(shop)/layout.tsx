import Link from "next/link";
import { CartProvider } from "@/components/cart";
import { BagLink } from "@/components/bag-link";
import { Logo } from "@/components/logo";
import { PICKUP } from "@/lib/format";

const TICKER = ["ALL HAIL WILDCATS", "EST. 1946", "PICK UP AT THE SSG OFFICE", "PAY WITH GCASH OR CASH", "OFFICIAL CIT-U MERCH"];

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <CartProvider>
      <a href="#content" className="sr-only z-50 rounded-full bg-gold px-4 py-2 font-bold text-maroon-deep focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <div className="overflow-hidden bg-gold py-2 text-maroon-deep" aria-label="Order online, pick up at the SSG Office, pay with GCash or cash">
        <div className="marquee flex w-max gap-8 font-display text-sm tracking-[0.15em]" aria-hidden>
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-8">{t}<span>★</span></span>
          ))}
        </div>
      </div>
      <header className="sticky top-0 z-30 bg-maroon-deep/95 text-white backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="hover:opacity-80">
            <Logo tone="gold" className="h-11 md:h-12" />
          </Link>
          <nav className="flex items-center gap-1 text-sm font-semibold">
            {[["/#shop", "Shop"], ["/#tees", "Tees"], ["/#bags", "Bags"]].map(([href, label]) => (
              <Link key={href} href={href} className="hidden rounded-full px-4 py-2 hover:bg-white/10 hover:text-gold sm:block">{label}</Link>
            ))}
            <BagLink />
          </nav>
        </div>
      </header>
      <main id="content" className="flex-1">{children}</main>
      <footer className="zebra relative mt-24 overflow-hidden bg-maroon-deep text-white/80">
        <div className="absolute inset-0 bg-maroon-deep/85" />
        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-8 md:px-8">
          <div className="grid gap-10 text-sm md:grid-cols-[2fr_1fr_1fr]">
            <div>
              <Logo tone="gold" className="h-20" />
              <p className="mt-4 max-w-xs">The official merch store of the CIT-U Wildcats. Made by students, for the pride.</p>
            </div>
            <div>
              <h3 className="font-display text-lg tracking-wider text-gold">PICKUP</h3>
              <p className="mt-2">{PICKUP}. Bring your order code. Unpaid orders not claimed within 7 days are cancelled.</p>
            </div>
            <div>
              <h3 className="font-display text-lg tracking-wider text-gold">FOLLOW</h3>
              <a className="link-underline mt-2 inline-block hover:text-gold" href="https://www.facebook.com/wildcatscit" target="_blank" rel="noreferrer">
                facebook.com/wildcatscit
              </a>
            </div>
          </div>
          <p className="mt-16 font-display text-[18vw] leading-none tracking-tight text-gold/15 select-none md:text-[12rem]" aria-hidden>WILDCATS</p>
        </div>
      </footer>
    </CartProvider>
  );
}
