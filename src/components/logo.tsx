import Image from "next/image";

/** The Wildcats Den mark, cut from the brand logo. Gold for maroon backgrounds, maroon for light ones. */
export function Logo({ tone = "maroon", className = "" }: { tone?: "maroon" | "gold"; className?: string }) {
  return (
    <Image src={`/logo-${tone}.png`} alt="Wildcats Den" width={600} height={293} priority className={`w-auto ${className}`} />
  );
}
