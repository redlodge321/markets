import { useState, useEffect } from "react";
import { useScreenerState } from "@/hooks/use-screener-state";
import { TickerManager } from "@/components/ticker-manager";
import { CriteriaControls } from "@/components/criteria-controls";
import { ResultsTable } from "@/components/results-table";
import { useRunScreener, useGetStockQuotes } from "@workspace/api-client-react";
import { Zap, LayoutGrid, TerminalSquare, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const state = useScreenerState();
  const screenerMutation = useRunScreener();
  const quotesMutation = useGetStockQuotes();
  
  const [viewMode, setViewMode] = useState<"screener" | "quotes">("screener");

  const handleRunScreener = () => {
    setViewMode("screener");
    screenerMutation.mutate({
      data: {
        tickers: state.tickers,
        maxPB: state.maxPB,
        maxDebtToEquity: state.maxDebtToEquity,
        minCurrentRatio: state.minCurrentRatio,
        maxMarketCap: state.maxMarketCap,
      },
    });
  };

  const handleGetQuotes = () => {
    setViewMode("quotes");
    quotesMutation.mutate({
      data: {
        tickers: state.tickers,
      },
    });
  };

  // Auto-run on mount
  useEffect(() => {
    handleRunScreener();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = screenerMutation.isPending || quotesMutation.isPending;
  
  // Extract results based on view mode
  const currentResults = viewMode === "screener" 
    ? screenerMutation.data?.results || [] 
    : quotesMutation.data?.quotes || [];
    
  const errors = viewMode === "screener" ? screenerMutation.data?.errors || [] : [];
  
  // Stats
  const screenedCount = viewMode === "screener" ? screenerMutation.data?.screened : state.tickers.length;
  const passedCount = viewMode === "screener" ? screenerMutation.data?.passed : quotesMutation.data?.quotes.length;

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden relative">
      {/* Abstract Background Element */}
      <img 
        src={`${import.meta.env.BASE_URL}images/hero-glow.png`} 
        alt="Background glow" 
        className="fixed inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-[-1] mix-blend-screen"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border/50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <TerminalSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                Agentic Screener <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-primary text-primary-foreground tracking-widest shadow-[0_0_10px_rgba(37,99,235,0.4)]">Pro</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Autonomous financial filtering terminal.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-secondary/40 p-1.5 rounded-xl border border-border backdrop-blur-sm">
            <button
              onClick={handleRunScreener}
              disabled={isLoading || state.tickers.length === 0}
              className={`
                px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all
                ${viewMode === 'screener' 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}
              `}
            >
              <Zap className="w-4 h-4" />
              Run Agent
            </button>
            <button
              onClick={handleGetQuotes}
              disabled={isLoading || state.tickers.length === 0}
              className={`
                px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all
                ${viewMode === 'quotes' 
                  ? 'bg-secondary text-foreground shadow-lg border border-border' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}
              `}
            >
              <LayoutGrid className="w-4 h-4" />
              Raw Quotes
            </button>
          </div>
        </header>

        {/* Error Bar */}
        <AnimatePresence>
          {errors.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8"
            >
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-destructive">Could not fetch data for some tickers</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {errors.map((err) => (
                      <span key={err.ticker} className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-destructive/20 text-destructive text-xs font-mono border border-destructive/20">
                        {err.ticker} <span className="opacity-70 font-sans">- {err.error}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Table */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">
              {viewMode === "screener" ? "Screener Results" : "Live Quotes"}
            </h3>
          </div>
          
          <ResultsTable 
            results={currentResults as ScreenerResult[]} 
            isLoading={isLoading} 
            isQuotesMode={viewMode === "quotes"} 
          />
        </section>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TickerManager 
            tickers={state.tickers}
            newTicker={state.newTicker}
            setNewTicker={state.setNewTicker}
            addTicker={state.addTicker}
            removeTicker={state.removeTicker}
          />
          <CriteriaControls
            maxPB={state.maxPB}
            setMaxPB={state.setMaxPB}
            maxDebtToEquity={state.maxDebtToEquity}
            setMaxDebtToEquity={state.setMaxDebtToEquity}
            minCurrentRatio={state.minCurrentRatio}
            setMinCurrentRatio={state.setMinCurrentRatio}
            maxMarketCap={state.maxMarketCap}
            setMaxMarketCap={state.setMaxMarketCap}
          />
        </div>

        {/* Main Actions Panel */}
        <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 shadow-xl">
          <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground pl-2">
            {viewMode === "screener" ? (
              <>
                <div className="flex flex-col">
                  <span className="text-xs uppercase opacity-70">Target Universe</span>
                  <span className="text-foreground text-base">{screenedCount || 0}</span>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase opacity-70">Passed Filter</span>
                  <span className="text-success text-base font-bold text-glow-success">{passedCount || 0}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col">
                <span className="text-xs uppercase opacity-70">Showing Raw Quotes For</span>
                <span className="text-foreground text-base">{passedCount || 0} Tickers</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
