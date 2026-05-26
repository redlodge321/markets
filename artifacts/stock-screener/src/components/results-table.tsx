import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, formatMarketCap, cn } from "@/lib/utils";
import type { ScreenerResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { Minus, CalendarClock } from "lucide-react";

interface ResultsTableProps {
  results: ScreenerResult[];
  isLoading: boolean;
  isQuotesMode?: boolean;
  onLongHover?: (ticker: string) => void;
}

function formatEarningsDate(iso?: string | null): { label: string; daysAway: number | null } {
  if (!iso) return { label: "—", daysAway: null };
  const date = new Date(iso);
  if (isNaN(date.getTime())) return { label: "—", daysAway: null };
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const daysAway = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return { label, daysAway };
}

export function ResultsTable({ results, isLoading, isQuotesMode = false, onLongHover }: ResultsTableProps) {
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [namePopup, setNamePopup] = useState<string | null>(null);

  const startHover = (ticker: string) => {
    // 3s → show company name popup
    nameTimer.current = setTimeout(() => setNamePopup(ticker), 3000);
    // 6s → load in TradingView chart
    hoverTimer.current = setTimeout(() => onLongHover?.(ticker), 6000);
  };

  const cancelHover = () => {
    if (nameTimer.current) { clearTimeout(nameTimer.current); nameTimer.current = null; }
    if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
    setNamePopup(null);
  };
  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-secondary border-t-primary animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-secondary border-b-accent animate-spin-reverse"></div>
        </div>
        <p className="mt-4 text-muted-foreground font-mono animate-pulse tracking-widest text-sm uppercase">
          Agent processing universe...
        </p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px] text-center border-dashed border-2 border-border/50">
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
          <Minus className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">No stocks met criteria</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          {isQuotesMode
            ? "No data retrieved for the selected tickers."
            : "Try adjusting your screening parameters to be less restrictive, or add more tickers to your universe."}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/40 text-xs uppercase tracking-wider text-blue-300 font-semibold">
              <th className="px-5 py-1.5 text-center">Ticker</th>
              <th className="px-5 py-1.5 text-center">Industry</th>
              <th className="px-5 py-1.5 text-center">Price</th>
              <th className="px-5 py-1.5 text-center">Day %</th>
              <th className="px-5 py-1.5 text-center">6M %</th>
              <th className="px-5 py-1.5 text-center">Div Yield</th>
              <th className="px-5 py-1.5 text-center">P/B</th>
              <th className="px-5 py-1.5 text-center">Debt/Eq</th>
              <th className="px-5 py-1.5 text-center">Curr Ratio</th>
              <th className="px-5 py-1.5 text-center">P/FCF</th>
              <th className="px-5 py-1.5 text-center">Mkt Cap</th>
              <th className="px-5 py-1.5 text-center">Next Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-mono text-sm">
            {results.map((stock, i) => {
              const isStrongBalance =
                (stock.debtToEquity <= 0 || stock.debtToEquity < 100) &&
                (stock.currentRatio <= 0 || stock.currentRatio > 1.5);
              const { label: earningsLabel, daysAway } = formatEarningsDate(stock.nextEarningsDate);
              const earningsSoon = daysAway !== null && daysAway >= 0 && daysAway <= 30;

              return (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={stock.ticker}
                  className="group hover:bg-secondary/30 transition-colors"
                >
                  <td
                    className="px-5 py-1.5 whitespace-nowrap relative text-center"
                    onMouseEnter={() => startHover(stock.ticker)}
                    onMouseLeave={cancelHover}
                  >
                    <div className={cn(
                      "inline-flex items-center gap-2 px-2.5 py-1 rounded bg-secondary/50 border border-border/50 text-foreground font-bold group-hover:border-primary/30 transition-colors",
                      "cursor-help"
                    )}>
                      {stock.ticker}
                    </div>

                    {/* Company name popup — appears after 3s hover */}
                    <AnimatePresence>
                      {namePopup === stock.ticker && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full mt-1.5 z-50 min-w-max max-w-xs px-3 py-2 rounded-lg border border-primary/30 bg-card shadow-xl shadow-black/40 pointer-events-none"
                        >
                          <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-mono mb-0.5">
                            {stock.ticker}
                          </p>
                          <p className="text-sm font-semibold text-foreground leading-snug">
                            {stock.companyName}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                  <td className="px-5 py-1.5 font-sans text-muted-foreground text-sm whitespace-nowrap max-w-[160px] truncate" title={stock.industry}>
                    {stock.industry || '—'}
                  </td>
                  <td className="px-5 py-1.5 text-right text-foreground">
                    {formatCurrency(stock.price)}
                  </td>

                  {/* Day Change % */}
                  <td className={cn(
                    "px-5 py-1.5 text-right tabular-nums font-medium",
                    stock.dayChangePercent == null ? "text-muted-foreground"
                      : stock.dayChangePercent > 0 ? "text-success"
                      : stock.dayChangePercent < 0 ? "text-destructive"
                      : "text-muted-foreground"
                  )}>
                    {stock.dayChangePercent != null
                      ? `${stock.dayChangePercent >= 0 ? "+" : ""}${(stock.dayChangePercent * 100).toFixed(2)}%`
                      : "—"}
                  </td>

                  {/* 6-Month Change % */}
                  <td className={cn(
                    "px-5 py-1.5 text-right tabular-nums font-medium",
                    stock.sixMonthChangePercent == null ? "text-muted-foreground"
                      : stock.sixMonthChangePercent > 0 ? "text-success"
                      : stock.sixMonthChangePercent < 0 ? "text-destructive"
                      : "text-muted-foreground"
                  )}>
                    {stock.sixMonthChangePercent != null
                      ? `${stock.sixMonthChangePercent >= 0 ? "+" : ""}${(stock.sixMonthChangePercent * 100).toFixed(1)}%`
                      : "—"}
                  </td>

                  {/* Dividend Yield */}
                  <td className={cn(
                    "px-5 py-1.5 text-right tabular-nums font-medium",
                    stock.dividendYield == null || stock.dividendYield === 0 ? "text-muted-foreground" : "text-success"
                  )}>
                    {stock.dividendYield != null && stock.dividendYield > 0
                      ? `${(stock.dividendYield * 100).toFixed(2)}%`
                      : "—"}
                  </td>

                  {/* P/B */}
                  <td className={cn(
                    "px-5 py-1.5 text-right tabular-nums",
                    !stock.priceToBook || stock.priceToBook <= 0 ? "text-muted-foreground"
                      : stock.priceToBook > 5 ? "text-destructive"
                      : stock.priceToBook < 1.5 ? "text-success"
                      : "text-foreground"
                  )}>
                    {stock.priceToBook && stock.priceToBook > 0 ? stock.priceToBook.toFixed(2) + 'x' : '-'}
                  </td>

                  {/* Debt/Equity */}
                  <td className={cn(
                    "px-5 py-1.5 text-right tabular-nums",
                    !stock.debtToEquity || stock.debtToEquity <= 0 ? "text-muted-foreground"
                      : stock.debtToEquity > 150 ? "text-destructive"
                      : stock.debtToEquity < 50 ? "text-success"
                      : "text-foreground"
                  )}>
                    {stock.debtToEquity && stock.debtToEquity > 0 ? `${stock.debtToEquity.toFixed(1)}%` : '-'}
                  </td>

                  {/* Current Ratio */}
                  <td className={cn(
                    "px-5 py-1.5 text-right tabular-nums",
                    !stock.currentRatio || stock.currentRatio <= 0 ? "text-muted-foreground"
                      : stock.currentRatio < 1 ? "text-destructive"
                      : stock.currentRatio > 2 ? "text-success"
                      : "text-foreground"
                  )}>
                    {stock.currentRatio && stock.currentRatio > 0 ? stock.currentRatio.toFixed(2) + 'x' : '-'}
                  </td>

                  {/* P/FCF */}
                  <td className={cn(
                    "px-5 py-1.5 text-right tabular-nums",
                    !stock.pfcfRatio ? "text-muted-foreground"
                      : stock.pfcfRatio > 40 ? "text-destructive"
                      : stock.pfcfRatio < 15 ? "text-success"
                      : "text-foreground"
                  )}>
                    {stock.pfcfRatio ? stock.pfcfRatio.toFixed(1) : '—'}
                  </td>

                  <td className="px-5 py-1.5 text-right text-foreground">
                    {formatMarketCap(stock.marketCap)}
                  </td>

                  {/* Next Earnings */}
                  <td className="px-5 py-1.5 text-right whitespace-nowrap">
                    {daysAway !== null ? (
                      <div className={cn(
                        "inline-flex items-center gap-1.5",
                        earningsSoon ? "text-yellow-400" : "text-muted-foreground"
                      )}>
                        {earningsSoon && <CalendarClock className="w-3.5 h-3.5 flex-shrink-0" />}
                        <span className="font-sans text-xs">{earningsLabel}</span>
                        {earningsSoon && (
                          <span className="text-[10px] font-mono bg-yellow-400/10 border border-yellow-400/20 px-1 rounded">
                            {daysAway}d
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
