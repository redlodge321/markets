import { motion } from "framer-motion";
import { formatCurrency, cn } from "@/lib/utils";
import type { CommodityResult } from "@workspace/api-client-react/src/generated/api.schemas";

interface CommodityTableProps {
  commodities: CommodityResult[];
  isLoading: boolean;
}

const COMMODITY_LABELS: Record<string, string> = {
  "GC=F": "Gold",
  "SI=F": "Silver",
  "CL=F": "Crude Oil (WTI)",
  "BZ=F": "Brent Crude",
  "NG=F": "Natural Gas",
  "HG=F": "Copper",
  "ZW=F": "Wheat",
  "ZC=F": "Corn",
  "ZS=F": "Soybeans",
  "PL=F": "Platinum",
  "PA=F": "Palladium",
};

function formatPct(val?: number | null) {
  if (val == null) return "—";
  const pct = val * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

export function CommodityTable({ commodities, isLoading }: CommodityTableProps) {
  if (!isLoading && commodities.length === 0) return null;

  return (
    <section className="mb-4 border border-zinc-500/70 rounded-xl p-4">
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-lg font-bold text-foreground">Commodity Watchlist</h3>
        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 tracking-widest">
          Futures
        </span>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="px-5 py-1.5 text-left">Commodity</th>
                <th className="px-5 py-1.5 text-left">Contract</th>
                <th className="px-5 py-1.5 text-right">Price</th>
                <th className="px-5 py-1.5 text-right">Day %</th>
                <th className="px-5 py-1.5 text-right">6M %</th>
                <th className="px-5 py-1.5 text-right">Prev Close</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground font-mono text-xs tracking-widest uppercase">
                    Fetching commodity data...
                  </td>
                </tr>
              ) : (
                commodities.map((c, i) => {
                  const isFwd = c.isForwardContract === true;
                  return (
                    <motion.tr
                      key={c.ticker}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        "border-b border-border/30 hover:bg-secondary/30 transition-colors",
                        isFwd && "bg-secondary/10"
                      )}
                    >
                      {/* Label */}
                      <td className={cn("px-5 py-1.5 font-semibold", isFwd ? "pl-10 text-amber-400/60 text-xs" : "text-amber-400")}>
                        {isFwd
                          ? `↳ ${COMMODITY_LABELS[c.baseGroup ?? ""] ?? c.baseGroup} 3M Fwd`
                          : COMMODITY_LABELS[c.ticker] ?? c.ticker}
                      </td>

                      {/* Contract name from Yahoo */}
                      <td className="px-5 py-1.5 font-mono text-xs text-muted-foreground">
                        {c.name}
                      </td>

                      {/* Price */}
                      <td className={cn("px-5 py-1.5 text-right tabular-nums", isFwd ? "text-muted-foreground" : "font-semibold text-foreground")}>
                        {formatCurrency(c.price)}
                      </td>

                      {/* Day % */}
                      <td className={cn(
                        "px-5 py-1.5 text-right tabular-nums font-medium",
                        c.dayChangePercent == null ? "text-muted-foreground"
                          : c.dayChangePercent > 0 ? "text-success"
                          : c.dayChangePercent < 0 ? "text-destructive"
                          : "text-muted-foreground"
                      )}>
                        {formatPct(c.dayChangePercent)}
                      </td>

                      {/* 6M % */}
                      <td className={cn(
                        "px-5 py-1.5 text-right tabular-nums font-medium",
                        c.sixMonthChangePercent == null ? "text-muted-foreground"
                          : c.sixMonthChangePercent > 0 ? "text-success"
                          : c.sixMonthChangePercent < 0 ? "text-destructive"
                          : "text-muted-foreground"
                      )}>
                        {c.sixMonthChangePercent != null
                          ? `${c.sixMonthChangePercent >= 0 ? "+" : ""}${(c.sixMonthChangePercent * 100).toFixed(1)}%`
                          : "—"}
                      </td>

                      {/* Prev Close */}
                      <td className="px-5 py-1.5 text-right tabular-nums text-muted-foreground">
                        {c.prevClose != null ? formatCurrency(c.prevClose) : "—"}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
