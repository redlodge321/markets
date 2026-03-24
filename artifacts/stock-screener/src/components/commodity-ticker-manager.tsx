import { X, Plus, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

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

const QUICK_ADD = [
  { ticker: "SI=F",  label: "Silver" },
  { ticker: "BZ=F",  label: "Brent" },
  { ticker: "ZW=F",  label: "Wheat" },
  { ticker: "PL=F",  label: "Platinum" },
];

interface CommodityTickerManagerProps {
  tickers: string[];
  addTicker: (symbol: string) => void;
  removeTicker: (symbol: string) => void;
}

export function CommodityTickerManager({ tickers, addTicker, removeTicker }: CommodityTickerManagerProps) {
  const [input, setInput] = useState("");

  const normalize = (raw: string): string => {
    const s = raw.trim().toUpperCase();
    if (!s) return "";
    // Already has =F suffix or is an exchange-suffixed contract (e.g. GCM26.CMX)
    if (s.includes("=") || s.includes(".")) return s;
    // Append =F for bare base symbols like GC, CL, HG
    return `${s}=F`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = normalize(input);
    if (sym && !tickers.includes(sym)) {
      addTicker(sym);
      setInput("");
    }
  };

  const handleQuickAdd = (ticker: string) => {
    if (!tickers.includes(ticker)) addTicker(ticker);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6 border border-amber-500/10">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Flame className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Commodity Universe</h2>
          <p className="text-sm text-muted-foreground">Enter a futures ticker (e.g. GC=F, CL, NG).</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex gap-2" autoComplete="off">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. GC=F or SI or ZW=F"
            autoComplete="off"
            className="flex-1 bg-background border border-amber-500/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all font-mono uppercase placeholder:normal-case placeholder:font-sans placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>

        {/* Quick-add chips for common extras */}
        <div className="flex flex-wrap gap-2">
          {QUICK_ADD.filter((q) => !tickers.includes(q.ticker)).map((q) => (
            <button
              key={q.ticker}
              onClick={() => handleQuickAdd(q.ticker)}
              className="px-2.5 py-1 rounded-md border border-amber-500/20 text-amber-400/70 hover:text-amber-400 hover:border-amber-500/50 text-xs font-mono transition-colors"
            >
              + {q.label}
            </button>
          ))}
        </div>

        {/* Active tickers */}
        <div className="flex flex-wrap gap-2 min-h-[40px] items-start">
          <AnimatePresence>
            {tickers.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground py-2 w-full text-center italic"
              >
                No commodity futures added yet.
              </motion.p>
            ) : (
              tickers.map((ticker) => (
                <motion.div
                  key={ticker}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors group"
                >
                  <span className="font-mono text-xs font-medium text-amber-400 tracking-wide">
                    {COMMODITY_LABELS[ticker] ?? ticker}
                  </span>
                  <span className="font-mono text-[10px] text-amber-400/50">{ticker}</span>
                  <button
                    onClick={() => removeTicker(ticker)}
                    className="text-amber-400/40 hover:text-destructive transition-colors focus:outline-none ml-0.5"
                    aria-label={`Remove ${ticker}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
