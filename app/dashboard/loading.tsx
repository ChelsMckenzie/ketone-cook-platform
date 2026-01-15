export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="h-9 w-48 animate-pulse rounded bg-muted" />
            <div className="h-5 w-64 animate-pulse rounded bg-muted" />
          </div>

          {/* Profile overview skeleton */}
          <div className="h-40 animate-pulse rounded-xl border-2 border-border bg-muted/30" />

          {/* Main grid skeleton */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left column */}
            <div className="space-y-6">
              <div className="h-64 animate-pulse rounded-xl border-2 border-border bg-muted/30" />
              <div className="h-48 animate-pulse rounded-xl border-2 border-border bg-muted/30" />
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div className="h-80 animate-pulse rounded-xl border-2 border-border bg-muted/30" />
              <div className="h-64 animate-pulse rounded-xl border-2 border-border bg-muted/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
