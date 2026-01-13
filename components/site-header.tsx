export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Keto Companion</h1>
          <nav className="flex items-center gap-3">
            <button className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              Login
            </button>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Sign Up
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

