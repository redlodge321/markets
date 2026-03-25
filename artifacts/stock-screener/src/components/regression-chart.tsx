import { useState } from "react";
import { useGetRegressionChart } from "@workspace/api-client-react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const PERIODS = ["1y", "5y", "10y"] as const;
type Period = (typeof PERIODS)[number];

function RegressionTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel border border-zinc-500/40 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-muted-foreground mb-1 text-[10px] uppercase tracking-wider">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: ${p.value.toFixed(2)}
        </p>
      ))}
    </div>
  );
}

function StatBadge({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex flex-col items-center bg-zinc-800/60 rounded-lg px-4 py-2 border border-zinc-700/50 min-w-[80px]">
      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-0.5">{label}</span>
      <span className={`text-sm font-bold font-mono ${valueClass ?? "text-foreground"}`}>{value}</span>
    </div>
  );
}

export function RegressionChart() {
  const [symbol, setSymbol] = useState("AAPL");
  const [input, setInput] = useState("AAPL");
  const [period, setPeriod] = useState<Period>("1y");

  const { data, isLoading, isError, refetch } = useGetRegressionChart(
    { symbol, period },
    { query: { enabled: !!symbol } }
  );

  const chartData = data?.points ?? [];
  const step = chartData.length > 1000 ? 3 : chartData.length > 500 ? 2 : 1;
  const displayData = chartData.filter((_, i) => i % step === 0);

  const tickIndices = displayData.length > 0
    ? Array.from({ length: 6 }, (_, i) => Math.round((i / 5) * (displayData.length - 1)))
    : [];

  const stats = data?.stats;
  const r2Pct  = stats ? (stats.r2 * 100).toFixed(1) + "%" : "—";
  const annRet  = stats
    ? (stats.annualisedReturn >= 0 ? "+" : "") + stats.annualisedReturn.toFixed(1) + "%"
    : "—";
  const annRetClass = stats
    ? stats.annualisedReturn >= 0 ? "text-emerald-400" : "text-red-400"
    : "";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const t = input.trim().toUpperCase();
    if (t) setSymbol(t);
  };

  return (
    <section className="mb-4 border border-zinc-500/70 rounded-xl p-4">
      {/* Header row */}
      <div className="mb-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-foreground">Regression Analysis</h3>
          {data?.symbol && (
            <span className="text-sm font-mono text-muted-foreground">— {data.symbol}</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <form onSubmit={handleSearch} className="flex items-center gap-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="Ticker…"
              className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs font-mono text-foreground w-24 focus:outline-none focus:border-zinc-400"
            />
            <button
              type="submit"
              className="text-xs font-mono px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded border border-zinc-600 transition-colors"
            >
              Go
            </button>
          </form>

          <div className="flex items-center gap-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
                  period === p
                    ? "bg-blue-600/30 border-blue-500/60 text-blue-300"
                    : "bg-zinc-800 border-zinc-600 text-muted-foreground hover:text-foreground hover:border-zinc-400"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => refetch()}
            className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border/30 hover:border-border/60"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Stats strip */}
      {stats && (
        <div className="flex gap-3 mb-4 flex-wrap">
          <StatBadge label="R²" value={r2Pct} />
          <StatBadge label="Ann. Return" value={annRet} valueClass={annRetClass} />
          <StatBadge
            label="Slope ($/day)"
            value={(stats.slope >= 0 ? "+" : "") + stats.slope.toFixed(3)}
            valueClass={stats.slope >= 0 ? "text-emerald-400" : "text-red-400"}
          />
          <StatBadge label="Period" value={period} />
        </div>
      )}

      {/* Chart */}
      <div className="h-72">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-xs font-mono text-muted-foreground uppercase tracking-widest animate-pulse">
            Fetching historical data…
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full text-xs font-mono text-destructive">
            Failed to load data for {symbol}
          </div>
        ) : displayData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs font-mono text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayData} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                ticks={tickIndices.map((i) => displayData[i]?.date).filter(Boolean) as string[]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                tickFormatter={(v: string) => v.slice(0, 7)}
              />
              <YAxis
                domain={["auto", "auto"]}
                tickFormatter={(v: number) =>
                  `$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0)}`
                }
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={false}
                width={52}
              />
              <Tooltip content={<RegressionTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, fontFamily: "monospace", paddingTop: 8 }}
              />
              <Line
                type="monotone"
                dataKey="close"
                name="Close"
                stroke="#94a3b8"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="fitted"
                name="Trend"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                activeDot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
