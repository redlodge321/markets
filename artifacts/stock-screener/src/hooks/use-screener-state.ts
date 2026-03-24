import { useState } from "react";

const INITIAL_UNIVERSE = [
  "AAPL", "MSFT", "GOOGL", "AMZN", 
  "TSLA", "META", "NVDA", "BRK-B"
];

export function useScreenerState() {
  const [tickers, setTickers] = useState<string[]>(INITIAL_UNIVERSE);
  const [maxPB, setMaxPB] = useState<number>(3);
  const [maxDebtToEquity, setMaxDebtToEquity] = useState<number>(100);
  const [minCurrentRatio, setMinCurrentRatio] = useState<number>(1.2);
  const [maxMarketCap, setMaxMarketCap] = useState<number>(2000);
  const [newTicker, setNewTicker] = useState("");

  const addTicker = (e?: React.FormEvent) => {
    e?.preventDefault();
    const symbol = newTicker.trim().toUpperCase();
    if (symbol && !tickers.includes(symbol)) {
      setTickers((prev) => [...prev, symbol]);
      setNewTicker("");
    }
  };

  const removeTicker = (symbolToRemove: string) => {
    setTickers((prev) => prev.filter((t) => t !== symbolToRemove));
  };

  return {
    tickers,
    maxPB,
    setMaxPB,
    maxDebtToEquity,
    setMaxDebtToEquity,
    minCurrentRatio,
    setMinCurrentRatio,
    maxMarketCap,
    setMaxMarketCap,
    newTicker,
    setNewTicker,
    addTicker,
    removeTicker,
  };
}
