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

  const equityBenchmarks = data.benchmarks.filter((b) => b.symbol !== "^VIX");
  const vix = data.benchmarks.find((b) => b.symbol === "^VIX");

  return (
    <div className="hidden md:flex items-center gap-4 border border-zinc-500/30 rounded-lg px-3 py-1.5 bg-background/30 backdrop-blur-sm">
      {equityBenchmarks.map((b) => {
        const pct = b.dayChangePercent ?? 0;
        const isPos = pct >= 0;
        return (
          <div key={b.symbol} className="flex flex-col items-center leading-none gap-0.5">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
              {b.name}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-semibold text-foreground tabular-nums">
                {b.price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className={cn("text-xs font-mono tabular-nums", isPos ? "text-emerald-400" : "text-red-400")}>
                {isPos ? "+" : ""}{(pct * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}

      {vix && (
        <>
          <div className="w-px h-6 bg-zinc-600/60 self-center" />
          <div className="flex flex-col items-center leading-none gap-0.5">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">VIX</span>
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "text-xs font-semibold tabular-nums",
                vix.price >= 30 ? "text-red-400" : vix.price >= 20 ? "text-amber-400" : "text-emerald-400"
              )}>
                {vix.price.toFixed(2)}
              </span>
              <span className={cn(
                "text-xs font-mono tabular-nums",
                (vix.dayChangePercent ?? 0) >= 0 ? "text-red-400" : "text-emerald-400"
              )}>
                {(vix.dayChangePercent ?? 0) >= 0 ? "+" : ""}{((vix.dayChangePercent ?? 0) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
