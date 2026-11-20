import Link from "next/link";
import { CartProvider } from "@/components/cart";
import { BagLink } from "@/components/bag-link";
import { Logo } from "@/components/logo";
import { PICKUP } from "@/lib/format";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <CartProvider>
      <a href="#content" className="sr-only z-50 bg-gold px-4 py-2 font-bold text-maroon-deep focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <div className="bg-maroon-deep py-2 text-center text-xs font-medium tracking-wide text-gold">
        Order online · Pick up at the SSG Office · Pay with GCash or cash
      </div>
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="text-maroon hover:opacity-80">
            <Logo className="h-11 md:h-12" />
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium sm:gap-6">
            <Link href="/#shop" className="link-underline hover:text-maroon">Shop</Link>
            <Link href="/#tees" className="link-underline hover:text-maroon">Tees</Link>
            <Link href="/#bags" className="link-underline hover:text-maroon">Bags</Link>
            <BagLink />
          </nav>
        </div>
      </header>
      <main id="content" className="flex-1">{children}</main>
      <footer className="mt-24 bg-maroon-deep text-white/80">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-sm md:grid-cols-3 md:px-8">
          <div>
            <Logo tone="gold" className="h-14" />
            <p className="mt-3">The official merch store of the CIT-U Wildcats.</p>
          </div>
          <div>
            <h3 className="font-bold text-white">Pickup</h3>
            <p className="mt-2">{PICKUP}. Bring your order code. Unpaid orders not claimed within 7 days are cancelled.</p>
          </div>
          <div>
            <h3 className="font-bold text-white">Follow us</h3>
            <a className="link-underline mt-2 inline-block hover:text-gold" href="https://www.facebook.com/wildcatscit" target="_blank" rel="noreferrer">
              facebook.com/wildcatscit
            </a>
          </div>
        </div>
      </footer>
    </CartProvider>
  );
}
