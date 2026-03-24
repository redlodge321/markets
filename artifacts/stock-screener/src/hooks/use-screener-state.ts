import { useState } from "react";

const INITIAL_UNIVERSE = [
  "AAPL", "MSFT", "GOOGL", "AMZN", 
  "TSLA", "META", "NVDA", "BRK-B"
];

export function useScreenerState() {
  const [tickers, setTickers] = useState<string[]>(INITIAL_UNIVERSE);
  const [maxPE, setMaxPE] = useState<number>(30);
  const [maxPB, setMaxPB] = useState<number>(3);
  const [minMargin, setMinMargin] = useState<number>(0.10);
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
    maxPE,
    setMaxPE,
    maxPB,
    setMaxPB,
    minMargin,
    setMinMargin,
    newTicker,
    setNewTicker,
    addTicker,
    removeTicker,
  };
}
