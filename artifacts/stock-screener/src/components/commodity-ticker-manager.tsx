import { X, Flame, Search, Loader2, ChevronDown, BarChart2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchFutures } from "@workspace/api-client-react";
import type { TickerSearchResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { cn } from "@/lib/utils";

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
  onViewChart?: (ticker: string, label: string) => void;
}

export function CommodityTickerManager({ tickers, addTicker, removeTicker, onViewChart }: CommodityTickerManagerProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<TickerSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchMutation = useSearchFutures();

  const normalize = (raw: string): string => {
    const s = raw.trim().toUpperCase();
    if (!s) return "";
    if (s.includes("=") || s.includes(".")) return s;
    return `${s}=F`;
  };

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
    setInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), 300);
  };

  const selectSuggestion = (result: TickerSearchResult) => {
    const sym = normalize(result.symbol);
    if (sym && !tickers.includes(sym)) addTicker(sym);
    setInput("");
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightedIdx >= 0 && suggestions[highlightedIdx]) {
      selectSuggestion(suggestions[highlightedIdx]);
      return;
    }
    const sym = normalize(input);
    if (sym && !tickers.includes(sym)) {
      addTicker(sym);
      setInput("");
      setSuggestions([]);
      setShowDropdown(false);
    }
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
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-3 border border-amber-500/10">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Flame className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Commodity Universe</h2>
          <p className="text-sm text-muted-foreground">Search by name or enter a futures ticker (e.g. GC=F).</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <form onSubmit={handleSubmit} className="flex gap-2" autoComplete="off">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {searchMutation.isPending
                ? <Loader2 className="w-3.5 h-3.5 text-amber-400/60 animate-spin" />
                : <Search className="w-3.5 h-3.5 text-amber-400/60" />
              }
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Search commodity or ticker…"
              autoComplete="off"
              className="w-full bg-background border border-amber-500/20 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all font-mono uppercase placeholder:normal-case placeholder:font-sans placeholder:text-muted-foreground"
            />

            <AnimatePresence>
              {showDropdown && suggestions.length > 0 && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-amber-500/30 rounded-xl shadow-2xl overflow-hidden"
                >
                  {suggestions.map((r, idx) => (
                    <button
                      key={r.symbol}
                      type="button"
                      onMouseEnter={() => setHighlightedIdx(idx)}
                      onMouseDown={(e) => { e.preventDefault(); selectSuggestion(r); }}
                      className={`w-full flex items-center justify-between px-4 py-1.5 text-left transition-colors ${
                        idx === highlightedIdx ? "bg-amber-500/10" : "hover:bg-secondary/50"
                      } ${idx > 0 ? "border-t border-border/40" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-amber-400">{r.symbol}</span>
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
            disabled={!input.trim()}
            className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            Add
          </button>
        </form>

        {/* Quick-add chips for common extras */}
        <div className="flex flex-wrap gap-2">
          {QUICK_ADD.filter((q) => !tickers.includes(q.ticker)).map((q) => (
            <button
              key={q.ticker}
              onClick={() => { if (!tickers.includes(q.ticker)) addTicker(q.ticker); }}
              className="px-2.5 py-1 rounded-md border border-amber-500/20 text-amber-400/70 hover:text-amber-400 hover:border-amber-500/50 text-xs font-mono transition-colors"
            >
              {q.label}
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
              tickers.map((ticker) => {
                const label = COMMODITY_LABELS[ticker] ?? ticker;
                const isOpen = expandedTicker === ticker;
                return (
                  <motion.div
                    key={ticker}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="relative flex flex-col"
                  >
                    {/* Chip row */}
                    <div className={cn(
                      "flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-md border transition-colors group",
                      isOpen
                        ? "bg-amber-500/15 border-amber-500/50 rounded-b-none"
                        : "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40"
                    )}>
                      <span className="font-mono text-xs font-medium text-amber-400 tracking-wide">
                        {label}
                      </span>
                      <span className="font-mono text-[10px] text-amber-400/50 mr-0.5">{ticker}</span>

                      {/* Pull-down toggle */}
                      <button
                        onClick={() => setExpandedTicker(isOpen ? null : ticker)}
                        className={cn(
                          "p-1 rounded transition-colors focus:outline-none",
                          isOpen
                            ? "text-amber-400 bg-amber-500/20"
                            : "text-amber-400/50 hover:text-amber-400 hover:bg-amber-500/10"
                        )}
                        aria-label={isOpen ? "Collapse" : "Expand"}
                        title={isOpen ? "Collapse" : "Show options"}
                      >
                        <ChevronDown className={cn(
                          "w-3 h-3 transition-transform duration-200",
                          isOpen && "rotate-180"
                        )} />
                      </button>
                    </div>

                    {/* Pull-down panel */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden absolute top-full left-0 z-30 min-w-full"
                        >
                          <div className="flex flex-col bg-card border border-t-0 border-amber-500/50 rounded-b-md shadow-lg overflow-hidden">
                            {onViewChart && (
                              <button
                                onClick={() => {
                                  onViewChart(ticker, label);
                                  setExpandedTicker(null);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors whitespace-nowrap border-b border-amber-500/20"
                              >
                                <BarChart2 className="w-3 h-3" />
                                View Chart
                              </button>
                            )}
                            <button
                              onClick={() => {
                                removeTicker(ticker);
                                setExpandedTicker(null);
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors whitespace-nowrap"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
