import { useGetRates } from "@workspace/api-client-react";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RateResult } from "@workspace/api-client-react/src/generated/api.schemas";

function formatDayChange(rate: RateResult): { label: string; bps?: number } {
  if (rate.dayChange == null) return { label: "—" };

  if (rate.quoteType === "yield") {
    const bps = rate.dayChange * 100;
    const sign = bps >= 0 ? "+" : "";
    return { label: `${sign}${bps.toFixed(1)} bps`, bps };
  }

  if (rate.quoteType === "etf") {
    const sign = rate.dayChange >= 0 ? "+" : "";
    return { label: `${sign}$${rate.dayChange.toFixed(2)}` };
  }

  const sign = rate.dayChange >= 0 ? "+" : "";
  return { label: `${sign}${rate.dayChange.toFixed(3)} pts` };
}

function RateCard({ rate }: { rate: RateResult }) {
  const { label: changeLabel, bps } = formatDayChange(rate);

  const isUp = rate.quoteType === "yield"
    ? (bps != null ? bps > 0 : (rate.dayChange ?? 0) > 0)
    : (rate.dayChange ?? 0) > 0;
  const isDown = rate.quoteType === "yield"
    ? (bps != null ? bps < 0 : (rate.dayChange ?? 0) < 0)
    : (rate.dayChange ?? 0) < 0;

  const changeColor = isUp ? "text-success" : isDown ? "text-destructive" : "text-muted-foreground";

  const subtitleMap: Record<string, string> = {
    "^ZT=F": "2Y Implied Yield",
    "^FVX": "Treasury Yield",
    "^TNX": "Treasury Yield",
    "^TYX": "Treasury Yield",
    "MBB": "MBS ETF Yield",
  };
  const subtitle = subtitleMap[rate.symbol] ?? "Yield";

  return (
    <div className="flex-1 min-w-[140px] glass-panel rounded-xl p-4 border border-border/60 hover:border-border transition-colors">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground leading-tight">
            {rate.name}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/50 mt-0.5 whitespace-nowrap">
            {rate.symbol}
          </span>
        </div>

        <div className="text-xl font-bold font-mono text-foreground tracking-tight">
          {rate.displayValue}
        </div>

        <div className="flex items-center gap-1.5">
          {isUp ? (
            <TrendingUp className={cn("w-3 h-3 flex-shrink-0", changeColor)} />
          ) : isDown ? (
            <TrendingDown className={cn("w-3 h-3 flex-shrink-0", changeColor)} />
          ) : (
            <Minus className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
          )}
          <span className={cn("text-xs font-mono font-medium", changeColor)}>
            {changeLabel}
          </span>
          {rate.dayChangePercent != null && (
            <span className={cn("text-[10px] font-mono text-muted-foreground/70")}>
              ({rate.dayChangePercent >= 0 ? "+" : ""}{(rate.dayChangePercent * 100).toFixed(2)}%)
            </span>
          )}
        </div>

        <div className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-mono">
          {subtitle}
        </div>
      </div>
    </div>
  );
}

export function RatesPanel() {
  const { data, isLoading, isError, refetch, isFetching } = useGetRates({
    query: { refetchInterval: 60_000 },
  });

  return (
    <section className="mb-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Rates &amp; Fixed Income</h3>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          title="Refresh rates"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
        </button>
      </div>

      {isLoading ? (
        <div className="glass-panel rounded-xl p-6 flex items-center justify-center gap-3 border border-border/60">
          <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />
          <span className="text-sm text-muted-foreground font-mono">Fetching rates...</span>
        </div>
      ) : isError ? (
        <div className="glass-panel rounded-xl p-4 border border-destructive/30 text-destructive text-sm font-mono">
          Could not load rate data.
        </div>
      ) : (
        <div className="flex gap-3 flex-wrap">
          {(data?.rates ?? []).map((rate) => (
            <RateCard key={rate.symbol} rate={rate} />
          ))}
        </div>
      )}
    </section>
  );
}
