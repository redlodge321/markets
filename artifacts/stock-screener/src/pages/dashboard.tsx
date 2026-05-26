import { useState, useEffect } from "react";
import { useScreenerState } from "@/hooks/use-screener-state";
import { TickerManager } from "@/components/ticker-manager";
import { CriteriaControls } from "@/components/criteria-controls";
import { ResultsTable } from "@/components/results-table";
import { CommodityTable } from "@/components/commodity-table";
import { CommodityTickerManager } from "@/components/commodity-ticker-manager";

import { MarketBenchmarks } from "@/components/market-benchmarks";
import { YieldCurveChart } from "@/components/yield-curve-chart";
import { TradingViewChart } from "@/components/tradingview-chart";
import { CommodityHistoryChart } from "@/components/commodity-history-chart";
import { useRunScreener, useGetStockQuotes } from "@workspace/api-client-react";
import { Zap, LayoutGrid, TerminalSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const state = useScreenerState();
  const screenerMutation = useRunScreener();
  const quotesMutation = useGetStockQuotes();
  
  const [viewMode, setViewMode] = useState<"screener" | "quotes">("screener");
  const [activeCommodity, setActiveCommodity] = useState<{ ticker: string; label: string } | null>(null);
  const [chartSymbol, setChartSymbol] = useState("AAPL");

  const handleRunScreener = () => {
    setViewMode("screener");
    state.saveLastRun({
      tickers: state.tickers,
      commodityTickers: state.commodityTickers,
      maxPB: state.maxPB,
      maxDebtToEquity: state.maxDebtToEquity,
      minCurrentRatio: state.minCurrentRatio,
      maxMarketCap: state.maxMarketCap,
      minMarketCap: state.minMarketCap,
      minDividendYield: state.minDividendYield,
    });
    screenerMutation.mutate({
      data: {
        tickers: [...state.tickers, ...state.commodityTickers],
        maxPB: state.maxPB,
        maxDebtToEquity: state.maxDebtToEquity,
        minCurrentRatio: state.minCurrentRatio,
        maxMarketCap: state.maxMarketCap,
        minMarketCap: state.minMarketCap,
        minDividendYield: state.minDividendYield,
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
  const currentResults = (viewMode === "screener"
    ? screenerMutation.data?.results || []
    : quotesMutation.data?.quotes || []
  ).slice().sort((a, b) => a.ticker.localeCompare(b.ticker));

  const commodityResults = screenerMutation.data?.commodities || [];
    
  
  return (
    <div className="min-h-screen pb-20 overflow-x-hidden relative">
      {/* Abstract Background Element */}
      <img 
        src={`${import.meta.env.BASE_URL}images/hero-glow.png`} 
        alt="Background glow" 
        className="fixed inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-[-1] mix-blend-screen"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4 border-b border-border/50 pb-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <TerminalSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                MVC Market Screen <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-primary text-primary-foreground tracking-widest shadow-[0_0_10px_rgba(37,99,235,0.4)]">Pro</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Autonomous financial filtering terminal.</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
          <MarketBenchmarks />
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
          </div>
        </header>


        {/* Equity Results Table */}
        <section className="mb-2 border border-zinc-500/70 rounded-xl p-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">
              {viewMode === "screener" ? "Equity Screen" : "Live Quotes"}
            </h3>
          </div>
          
          <ResultsTable
            results={currentResults as ScreenerResult[]}
            isLoading={isLoading}
            isQuotesMode={viewMode === "quotes"}
            onLongHover={(ticker) => setChartSymbol(ticker)}
          />
        </section>

        {/* Stock Universe + Screener Criteria side by side */}
        <div className="mb-2 border border-zinc-500/70 rounded-xl p-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TickerManager 
            tickers={state.tickers}
            newTicker={state.newTicker}
            setNewTicker={state.setNewTicker}
            addTicker={state.addTicker}
            removeTicker={state.removeTicker}
            setTickers={state.setTickers}
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
            minMarketCap={state.minMarketCap}
            setMinMarketCap={state.setMinMarketCap}
            minDividendYield={state.minDividendYield}
            setMinDividendYield={state.setMinDividendYield}
            onClear={() => {
              state.setMaxPB(20);
              state.setMaxDebtToEquity(1000);
              state.setMinCurrentRatio(0.5);
              state.setMaxMarketCap(2000000);
              state.setMinMarketCap(0);
              state.setMinDividendYield(0);
            }}
          />
        </div>
        </div>

        {/* TradingView Chart */}
        <TradingViewChart symbol={chartSymbol} />

        {/* Commodity Watchlist */}
        {viewMode === "screener" && (
          <CommodityTable
            commodities={commodityResults}
            isLoading={isLoading}
            onLongHover={(ticker, label) => setActiveCommodity({ ticker, label })}
          />
        )}

        {/* Commodity 6M History Chart (shown after 10s hover on a commodity name) */}
        {activeCommodity && (
          <CommodityHistoryChart
            ticker={activeCommodity.ticker}
            label={activeCommodity.label}
            onClose={() => setActiveCommodity(null)}
          />
        )}

        {/* Commodity Universe Manager */}
        {viewMode === "screener" && (
          <div className="mb-2 border border-zinc-500/70 rounded-xl p-2">
            <CommodityTickerManager
              tickers={state.commodityTickers}
              addTicker={state.addCommodityTicker}
              removeTicker={state.removeCommodityTicker}
              onViewChart={(ticker, label) => setActiveCommodity({ ticker, label })}
            />
          </div>
        )}

        {/* Yield Curve Comparison */}
        <YieldCurveChart />


      </div>
    </div>
  );
}
