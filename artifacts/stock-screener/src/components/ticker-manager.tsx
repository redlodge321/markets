import { X, Plus, Activity, Search, Loader2, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchTickers, useGetTopByMarketCap } from "@workspace/api-client-react";
import type { TickerSearchResult } from "@workspace/api-client-react/src/generated/api.schemas";

interface TickerManagerProps {
  tickers: string[];
  newTicker: string;
  setNewTicker: (val: string) => void;
  addTicker: (e?: React.FormEvent, directSymbol?: string) => void;
  removeTicker: (symbol: string) => void;
  setTickers: (tickers: string[]) => void;
}

export function TickerManager({
  tickers,
  newTicker,
  setNewTicker,
  addTicker,
  removeTicker,
  setTickers,
}: TickerManagerProps) {
  const [suggestions, setSuggestions] = useState<TickerSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchMutation = useSearchTickers();
  const top1000Mutation = useGetTopByMarketCap();

  const runSearch = useCallback((query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    searchMutation.mutate(
      { data: { query } },
      {
        onSuccess: (data) => {
          setSuggestions(data.results);
          setShowDropdown(data.results.length > 0);
          setHighlightedIdx(-1);
        },
      }
    );
  }, []);

  const handleInputChange = (val: string) => {
    setNewTicker(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), 300);
  };

  const selectSuggestion = (result: TickerSearchResult) => {
    addTicker(undefined, result.symbol);
    setNewTicker("");
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && highlightedIdx >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightedIdx]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightedIdx >= 0 && suggestions[highlightedIdx]) {
      selectSuggestion(suggestions[highlightedIdx]);
    } else {
      addTicker(e);
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleLoadTop1000 = () => {
    top1000Mutation.mutate(
      { data: {} },
      {
        onSuccess: (data) => {
          setTickers(data.stocks.map((s) => s.ticker));
        },
      }
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Stock Universe</h2>
            <p className="text-sm text-muted-foreground">Search by name or enter a ticker symbol.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLoadTop1000}
            disabled={top1000Mutation.isPending}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Load the top 1,000 US stocks by market cap"
          >
            {top1000Mutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5" />
            )}
            {top1000Mutation.isPending ? "Loading…" : "Top 1000"}
          </button>
          <button
            type="button"
            onClick={() => setTickers([])}
            disabled={tickers.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border/50 bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Clear all tickers from universe"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex gap-2" autoComplete="off">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {searchMutation.isPending
                ? <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
                : <Search className="w-3.5 h-3.5 text-muted-foreground" />
              }
            </div>
            <input
              ref={inputRef}
              type="text"
              value={newTicker}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Search company or ticker…"
              autoComplete="off"
              className="w-full bg-background border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono uppercase placeholder:normal-case placeholder:font-sans placeholder:text-muted-foreground"
            />

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden"
                >
                  {suggestions.map((r, idx) => (
                    <button
                      key={r.symbol}
                      type="button"
                      onMouseEnter={() => setHighlightedIdx(idx)}
                      onMouseDown={(e) => { e.preventDefault(); selectSuggestion(r); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                        idx === highlightedIdx ? "bg-primary/10" : "hover:bg-secondary/50"
                      } ${idx > 0 ? "border-t border-border/40" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-foreground">{r.symbol}</span>
                        <span className="text-muted-foreground text-sm font-sans truncate max-w-[160px]">
                          {r.shortname}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0 ml-2">
                        {r.exchange}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={!newTicker.trim()}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-border/50 shrink-0"
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
