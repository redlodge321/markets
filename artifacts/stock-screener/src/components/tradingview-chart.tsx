import { useEffect, useRef } from "react";

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => void;
    };
  }
}

interface TradingViewChartProps {
  symbol?: string;
}

export function TradingViewChart({ symbol = "AAPL" }: TradingViewChartProps) {
  const containerId = "tradingview_main_chart";
  const prevSymbol = useRef<string | null>(null);

  useEffect(() => {
    const init = () => {
      if (!window.TradingView) return;
      // Clear previous widget before mounting a new one
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = "";
      new window.TradingView.widget({
        autosize: true,
        symbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "3",
        locale: "en",
        toolbar_bg: "#18181b",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: containerId,
      });
      prevSymbol.current = symbol;
    };

    if (window.TradingView) {
      init();
      return;
    }

    // Script already appended by a previous render — just wait for it
    let script = document.querySelector<HTMLScriptElement>(
      'script[src="https://s3.tradingview.com/tv.js"]'
    );
    if (!script) {
      script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", init);
    return () => {
      script?.removeEventListener("load", init);
    };
  }, [symbol]);

  return (
    <section className="mb-4 border border-zinc-500/70 rounded-xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-lg font-bold text-foreground">Chart</h3>
        <span className="text-xs text-muted-foreground">
          {symbol !== "AAPL" || prevSymbol.current
            ? <span className="font-semibold text-primary">{symbol}</span>
            : "(search any symbol)"}
        </span>
        <span className="text-[10px] text-muted-foreground/50 ml-auto">
          Hover any ticker for 6s to load it here
        </span>
      </div>
      <div
        id={containerId}
        className="w-full rounded-lg overflow-hidden"
        style={{ height: 500 }}
      />
    </section>
  );
}
