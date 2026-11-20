import Link from "next/link";
import { CartProvider } from "@/components/cart";
import { BagLink } from "@/components/bag-link";
import { Logo } from "@/components/logo";
import { PICKUP } from "@/lib/format";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <CartProvider>
      <div className="bg-maroon-deep py-2 text-center text-xs font-medium tracking-wide text-gold">
        Order online · Pick up at the SSG Office · Pay with GCash or cash
      </div>
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="text-maroon">
            <Logo className="text-lg md:text-xl" />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/#shop" className="hidden hover:text-maroon sm:block">Shop</Link>
            <Link href="/#tees" className="hidden hover:text-maroon sm:block">Tees</Link>
            <Link href="/#bags" className="hidden hover:text-maroon sm:block">Bags</Link>
            <BagLink />
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-24 bg-maroon-deep text-white/80">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-sm md:grid-cols-3 md:px-8">
          <div>
            <Logo className="text-lg text-gold" />
            <p className="mt-3">The official merch store of the CIT-U Wildcats.</p>
          </div>
          <div>
            <h3 className="font-bold text-white">Pickup</h3>
            <p className="mt-2">{PICKUP}. Bring your order code. Unpaid orders not claimed within 7 days are cancelled.</p>
          </div>
          <div>
            <h3 className="font-bold text-white">Follow us</h3>
            <a className="mt-2 block underline-offset-4 hover:underline" href="https://www.facebook.com/wildcatscit" target="_blank" rel="noreferrer">
              facebook.com/wildcatscit
            </a>
          </div>
        </div>
      </footer>
    </CartProvider>
  );
}
