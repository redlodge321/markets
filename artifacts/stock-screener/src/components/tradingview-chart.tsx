import { useEffect, useRef } from "react";

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => void;
    };
  }
}

export function TradingViewChart() {
  const containerId = "tradingview_main_chart";
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: "NASDAQ:AAPL",
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
      }
    };
    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      initialized.current = false;
    };
  }, []);

  return (
    <section className="mb-4 border border-zinc-500/70 rounded-xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-lg font-bold text-foreground">Chart</h3>
        <span className="text-xs font-mono text-muted-foreground">(search any symbol)</span>
      </div>
      <div
        id={containerId}
        className="w-full rounded-lg overflow-hidden"
        style={{ height: 500 }}
      />
    </section>
  );
}
