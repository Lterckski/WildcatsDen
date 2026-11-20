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

/** Sizes in shelf order (XS, S, M…). */
export const sortVariants = <T extends { sort: number }>(v: T[]) => [...v].sort((a, b) => a.sort - b.sort);
