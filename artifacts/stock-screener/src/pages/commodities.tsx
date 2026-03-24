import { useEffect } from "react";
import { useRunScreener } from "@workspace/api-client-react";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { CommodityResult } from "@workspace/api-client-react/src/generated/api.schemas";

const FUTURES = ["GC=F", "CL=F", "HG=F", "NG=F"];

const COMMODITY_LABELS: Record<string, { name: string; emoji: string }> = {
  "GC=F":  { name: "Gold",           emoji: "🥇" },
  "CL=F":  { name: "Crude Oil (WTI)", emoji: "🛢️" },
  "HG=F":  { name: "Copper",         emoji: "🔶" },
  "NG=F":  { name: "Natural Gas",    emoji: "🔥" },
};

function formatPct(val?: number | null) {
  if (val == null) return "—";
  const pct = val * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

function Row({ c, i }: { c: CommodityResult; i: number }) {
  const label = COMMODITY_LABELS[c.ticker];
  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.07 }}
      className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
    >
      <td className="px-5 py-4 font-semibold text-amber-400 flex items-center gap-2">
        <span>{label?.emoji}</span>
        <span>{label?.name ?? c.ticker}</span>
      </td>
      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{c.name}</td>
      <td className="px-5 py-4 text-right font-bold text-foreground tabular-nums text-base">
        {formatCurrency(c.price)}
      </td>
      <td className={cn(
        "px-5 py-4 text-right tabular-nums font-semibold",
        c.dayChangePercent == null ? "text-muted-foreground"
          : c.dayChangePercent > 0 ? "text-success"
          : c.dayChangePercent < 0 ? "text-destructive"
          : "text-muted-foreground"
      )}>
        {formatPct(c.dayChangePercent)}
      </td>
      <td className="px-5 py-4 text-right tabular-nums text-muted-foreground">{c.dayHigh != null ? formatCurrency(c.dayHigh) : "—"}</td>
      <td className="px-5 py-4 text-right tabular-nums text-muted-foreground">{c.dayLow != null ? formatCurrency(c.dayLow) : "—"}</td>
      <td className="px-5 py-4 text-right tabular-nums text-muted-foreground">{c.prevClose != null ? formatCurrency(c.prevClose) : "—"}</td>
    </motion.tr>
  );
}

export default function CommoditiesPage() {
  const { mutate, data, isPending } = useRunScreener();

  useEffect(() => {
    mutate({ data: { tickers: FUTURES, maxPB: 999, maxDebtToEquity: 999, minCurrentRatio: 0 } });
  }, []);

  const commodities = data?.commodities ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Commodity Watchlist</h2>
          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 tracking-widest">
            Futures
          </span>
          {!isPending && (
            <span className="ml-auto text-xs text-muted-foreground font-mono">
              {new Date().toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="rounded-xl border border-border/60 overflow-hidden bg-card/60 backdrop-blur-xl shadow-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="px-5 py-4 text-left">Commodity</th>
                <th className="px-5 py-4 text-left">Contract</th>
                <th className="px-5 py-4 text-right">Price</th>
                <th className="px-5 py-4 text-right">Day %</th>
                <th className="px-5 py-4 text-right">Day High</th>
                <th className="px-5 py-4 text-right">Day Low</th>
                <th className="px-5 py-4 text-right">Prev Close</th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground font-mono text-xs tracking-widest uppercase animate-pulse">
                    Fetching commodity data...
                  </td>
                </tr>
              ) : (
                commodities.map((c, i) => <Row key={c.ticker} c={c} i={i} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
