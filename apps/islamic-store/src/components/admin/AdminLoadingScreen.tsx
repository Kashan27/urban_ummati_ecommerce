export function AdminLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-8 text-center shadow-sm">
        <h1 className="font-serif text-3xl tracking-[0.14em] mb-2">URBAN UMMATI</h1>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Checking admin session...</p>
      </div>
    </div>
  );
}
