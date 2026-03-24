import { motion } from "framer-motion";
import { formatCurrency, formatPercent, formatMarketCap, cn } from "@/lib/utils";
import type { ScreenerResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface ResultsTableProps {
  results: ScreenerResult[];
  isLoading: boolean;
  isQuotesMode?: boolean;
}

export function ResultsTable({ results, isLoading, isQuotesMode = false }: ResultsTableProps) {
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
            <tr className="border-b border-border/60 bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <th className="px-6 py-4">Ticker</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4 text-right">Price</th>
              <th className="px-6 py-4 text-right">Fwd P/E</th>
              <th className="px-6 py-4 text-right">P/B</th>
              <th className="px-6 py-4 text-right">Profit Margin</th>
              <th className="px-6 py-4">Sector</th>
              <th className="px-6 py-4 text-right">Market Cap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-mono text-sm">
            {results.map((stock, i) => (
              <motion.tr
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={stock.ticker}
                className="group hover:bg-secondary/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-secondary/50 border border-border/50 text-foreground font-bold group-hover:border-primary/30 transition-colors">
                    {stock.ticker}
                  </div>
                </td>
                <td className="px-6 py-4 font-sans text-muted-foreground truncate max-w-[200px]" title={stock.companyName}>
                  {stock.companyName || '-'}
                </td>
                <td className="px-6 py-4 text-right text-foreground">
                  {formatCurrency(stock.price)}
                </td>

                {/* P/E Column */}
                <td className={cn(
                  "px-6 py-4 text-right tabular-nums",
                  stock.forwardPE > 30 ? "text-destructive" : stock.forwardPE < 15 ? "text-success" : "text-foreground"
                )}>
                  {stock.forwardPE ? stock.forwardPE.toFixed(2) : '-'}
                </td>

                {/* P/B Column */}
                <td className={cn(
                  "px-6 py-4 text-right tabular-nums",
                  !stock.priceToBook || stock.priceToBook <= 0
                    ? "text-muted-foreground"
                    : stock.priceToBook > 5 ? "text-destructive" : stock.priceToBook < 1.5 ? "text-success" : "text-foreground"
                )}>
                  {stock.priceToBook && stock.priceToBook > 0 ? stock.priceToBook.toFixed(2) + 'x' : '-'}
                </td>

                {/* Margin Column */}
                <td className={cn(
                  "px-6 py-4 text-right tabular-nums flex items-center justify-end gap-1.5",
                  stock.profitMargin > 0.20 ? "text-success" : stock.profitMargin < 0.05 ? "text-destructive" : "text-foreground"
                )}>
                  {stock.profitMargin > 0.20 && <TrendingUp className="w-3 h-3 opacity-70" />}
                  {stock.profitMargin < 0.05 && <TrendingDown className="w-3 h-3 opacity-70" />}
                  {formatPercent(stock.profitMargin)}
                </td>

                <td className="px-6 py-4 text-muted-foreground truncate max-w-[150px]">
                  {stock.sector || '-'}
                </td>
                <td className="px-6 py-4 text-right text-foreground">
                  {formatMarketCap(stock.marketCap)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
