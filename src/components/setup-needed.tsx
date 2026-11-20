export function SetupNeeded() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Almost there</h1>
      <p className="mt-3 text-muted-foreground">
        The store isn&apos;t connected to its database yet. Add the Supabase keys to <code>.env.local</code> (see README) and
        restart.
      </p>
    </div>
  );
}
