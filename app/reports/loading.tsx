export default function ReportsLoading() {
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
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-9 w-64 animate-pulse rounded bg-muted" />
              <div className="h-5 w-48 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 animate-pulse rounded bg-muted" />
              <div className="h-10 w-36 animate-pulse rounded bg-muted" />
              <div className="h-10 w-10 animate-pulse rounded bg-muted" />
            </div>
          </div>

          {/* Overview skeleton */}
          <div className="h-64 animate-pulse rounded-xl border-2 border-border bg-muted/30" />

          {/* Fasting stats skeleton */}
          <div className="h-48 animate-pulse rounded-xl border-2 border-border bg-muted/30" />

          {/* Chart skeleton */}
          <div className="h-96 animate-pulse rounded-xl border-2 border-border bg-muted/30" />
        </div>
      </div>
    </div>
  );
}
