export const peso = (n: number) => "₱" + n.toLocaleString("en-PH");

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" });

export const PICKUP = "SSG Office, Cebu Institute of Technology – University";

export const statusLabel: Record<string, string> = {
  pending: "Placed",
  ready: "Ready for pickup",
  claimed: "Claimed",
  cancelled: "Cancelled",
};

/** "₱320" or "₱320–₱340" when sizes cost different amounts. */
export const priceRange = (variants: { price: number }[]) => {
  const p = variants.map((v) => v.price);
  if (p.length === 0) return "";
  const lo = Math.min(...p), hi = Math.max(...p);
  return lo === hi ? peso(lo) : `${peso(lo)}–${peso(hi)}`;
};

/** Sizes in shelf order (XS, S, M…). */
export const sortVariants = <T extends { sort: number }>(v: T[]) => [...v].sort((a, b) => a.sort - b.sort);
