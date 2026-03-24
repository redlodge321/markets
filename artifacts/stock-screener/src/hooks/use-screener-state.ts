import { useState } from "react";

const INITIAL_UNIVERSE = [
  "AAPL", "MSFT", "GOOGL", "AMZN",
  "TSLA", "META", "NVDA", "BRK-B",
];

const INITIAL_COMMODITY_UNIVERSE = ["GC=F", "CL=F", "HG=F", "NG=F"];

export function useScreenerState() {
  const [tickers, setTickers] = useState<string[]>(INITIAL_UNIVERSE);
  const [commodityTickers, setCommodityTickers] = useState<string[]>(INITIAL_COMMODITY_UNIVERSE);
  const [maxPB, setMaxPB] = useState<number>(20);
  const [maxDebtToEquity, setMaxDebtToEquity] = useState<number>(300);
  const [minCurrentRatio, setMinCurrentRatio] = useState<number>(0.5);
  const [maxMarketCap, setMaxMarketCap] = useState<number>(2000000);
  const [filterCountry, setFilterCountry] = useState<string>("");
  const [filterState, setFilterState] = useState<string>("");
  const [newTicker, setNewTicker] = useState("");

  const addTicker = (e?: React.FormEvent, directSymbol?: string) => {
    e?.preventDefault();
    const symbol = (directSymbol ?? newTicker).trim().toUpperCase();
    if (symbol && !tickers.includes(symbol)) {
      setTickers((prev) => [...prev, symbol]);
      setNewTicker("");
    }
  };

  const removeTicker = (symbolToRemove: string) => {
    setTickers((prev) => prev.filter((t) => t !== symbolToRemove));
  };

  const addCommodityTicker = (symbol: string) => {
    const sym = symbol.trim().toUpperCase();
    if (sym && !commodityTickers.includes(sym)) {
      setCommodityTickers((prev) => [...prev, sym]);
    }
  };

  const removeCommodityTicker = (symbol: string) => {
    setCommodityTickers((prev) => prev.filter((t) => t !== symbol));
  };

  return {
    tickers,
    commodityTickers,
    maxPB,
    setMaxPB,
    maxDebtToEquity,
    setMaxDebtToEquity,
    minCurrentRatio,
    setMinCurrentRatio,
    maxMarketCap,
    setMaxMarketCap,
    filterCountry,
    setFilterCountry,
    filterState,
    setFilterState,
    newTicker,
    setNewTicker,
    addTicker,
    removeTicker,
    addCommodityTicker,
    removeCommodityTicker,
  };
}
