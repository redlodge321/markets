import { useGetBenchmarks } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export function MarketBenchmarks() {
  const { data, isLoading } = useGetBenchmarks({
    query: { refetchInterval: 30_000 },
  });

  if (isLoading || !data?.benchmarks?.length) {
    return (
      <div className="hidden md:flex items-center gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-end gap-0.5">
            <div className="h-2.5 w-12 rounded bg-muted/40 animate-pulse" />
            <div className="h-3 w-16 rounded bg-muted/30 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-4 border border-zinc-500/30 rounded-lg px-3 py-1.5 bg-background/30 backdrop-blur-sm">
      {data.benchmarks.map((b) => {
        const pct = b.dayChangePercent ?? 0;
        const isPos = pct >= 0;
        return (
          <div key={b.symbol} className="flex flex-col items-end leading-none gap-0.5">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">
              {b.name}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-semibold text-foreground tabular-nums">
                {b.price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span
                className={cn(
                  "text-[10px] font-mono tabular-nums",
                  isPos ? "text-emerald-400" : "text-red-400"
                )}
              >
                {isPos ? "+" : ""}
                {(pct * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
