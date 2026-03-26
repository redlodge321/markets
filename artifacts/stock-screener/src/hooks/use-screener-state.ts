import { useState } from "react";

const STORAGE_KEY = "screener-last-run";

const INITIAL_UNIVERSE = [
  "AAPL", "MSFT", "GOOGL", "AMZN",
  "TSLA", "META", "NVDA", "BRK-B",
];

const INITIAL_COMMODITY_UNIVERSE = ["GC=F", "CL=F", "HG=F", "NG=F"];

interface SavedState {
  tickers?: string[];
  commodityTickers?: string[];
  maxPB?: number;
  maxDebtToEquity?: number;
  minCurrentRatio?: number;
  maxMarketCap?: number;
  minMarketCap?: number;
}

function loadSaved(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SavedState;
  } catch {
    // ignore parse errors
  }
  return {};
}

export function useScreenerState() {
  const [tickers, setTickers] = useState<string[]>(() => {
    const s = loadSaved(); return s.tickers?.length ? s.tickers : INITIAL_UNIVERSE;
  });
  const [commodityTickers, setCommodityTickers] = useState<string[]>(() => {
    const s = loadSaved(); return s.commodityTickers?.length ? s.commodityTickers : INITIAL_COMMODITY_UNIVERSE;
  });
  const [maxPB, setMaxPB] = useState<number>(() => {
    const s = loadSaved(); return s.maxPB ?? 20;
  });
  const [maxDebtToEquity, setMaxDebtToEquity] = useState<number>(() => {
    const s = loadSaved(); return s.maxDebtToEquity ?? 1000;
  });
  const [minCurrentRatio, setMinCurrentRatio] = useState<number>(() => {
    const s = loadSaved(); return s.minCurrentRatio ?? 0.5;
  });
  const [maxMarketCap, setMaxMarketCap] = useState<number>(() => {
    const s = loadSaved(); return s.maxMarketCap ?? 2000000;
  });
  const [minMarketCap, setMinMarketCap] = useState<number>(() => {
    const s = loadSaved(); return s.minMarketCap ?? 0;
  });
  const [newTicker, setNewTicker] = useState("");

  const saveLastRun = (snapshot: {
    tickers: string[];
    commodityTickers: string[];
    maxPB: number;
    maxDebtToEquity: number;
    minCurrentRatio: number;
    maxMarketCap: number;
    minMarketCap: number;
  }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // storage may be unavailable in some environments
    }
  };

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
    setTickers,
    commodityTickers,
    maxPB,
    setMaxPB,
    maxDebtToEquity,
    setMaxDebtToEquity,
    minCurrentRatio,
    setMinCurrentRatio,
    maxMarketCap,
    setMaxMarketCap,
    minMarketCap,
    setMinMarketCap,
    newTicker,
    setNewTicker,
    addTicker,
    removeTicker,
    addCommodityTicker,
    removeCommodityTicker,
    saveLastRun,
  };
}
