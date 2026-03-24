import { X, Plus, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TickerManagerProps {
  tickers: string[];
  newTicker: string;
  setNewTicker: (val: string) => void;
  addTicker: (e: React.FormEvent) => void;
  removeTicker: (symbol: string) => void;
}

export function TickerManager({
  tickers,
  newTicker,
  setNewTicker,
  addTicker,
  removeTicker,
}: TickerManagerProps) {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Stock Universe</h2>
          <p className="text-sm text-muted-foreground">Manage the list of tickers to screen.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <form onSubmit={addTicker} className="flex gap-2">
          <input
            type="text"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            placeholder="e.g. AMD, NFLX..."
            className="flex-1 bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono"
          />
          <button
            type="submit"
            disabled={!newTicker.trim()}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-border/50"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>

        <div className="flex flex-wrap gap-2 min-h-[40px] items-start">
          <AnimatePresence>
            {tickers.length === 0 ? (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground py-2 w-full text-center italic"
              >
                No tickers in universe. Add some to begin.
              </motion.p>
            ) : (
              tickers.map((ticker) => (
                <motion.div
                  key={ticker}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/50 border border-border hover:border-primary/50 transition-colors group"
                >
                  <span className="font-mono text-sm font-medium text-foreground tracking-wide">
                    {ticker}
                  </span>
                  <button
                    onClick={() => removeTicker(ticker)}
                    className="text-muted-foreground hover:text-destructive transition-colors focus:outline-none"
                    aria-label={`Remove ${ticker}`}
                  >
                    <X className="w-3.5 h-3.5" />
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
