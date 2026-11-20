// Wordmark until the logo files arrive: bold WILDCATS, thin DEN, like the brand mark.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-heading leading-none tracking-[0.18em] ${className}`}>
      <span className="font-extrabold">WILDCATS</span> <span className="font-light">DEN</span>
    </span>
  );
}
