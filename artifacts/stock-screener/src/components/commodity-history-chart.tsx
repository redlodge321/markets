import { useGetCommodityChart } from "@workspace/api-client-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CommodityHistoryChartProps {
  ticker: string;
  label: string;
  onClose: () => void;
}

function fmt(n: number) {
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toFixed(4).replace(/\.?0+$/, "") || n.toFixed(2);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="text-amber-400 font-semibold">${fmt(payload[0].value)}</p>
    </div>
  );
}

export function CommodityHistoryChart({ ticker, label, onClose }: CommodityHistoryChartProps) {
  const { data, isLoading, isError } = useGetCommodityChart(ticker, {
    query: { refetchOnWindowFocus: false },
  });

  const points = data?.points ?? [];
  const first = points[0]?.close;
  const last = points[points.length - 1]?.close;
  const change = first && last ? ((last - first) / first) * 100 : null;
  const isPos = change != null && change >= 0;

  // Thin out x-axis labels to monthly
  const monthlyDates = points
    .filter((_, i) => i === 0 || points[i].date.slice(8) === "01" || i === points.length - 1)
    .map((p) => p.date);

  const minClose = points.length ? Math.min(...points.map((p) => p.close)) : 0;
  const maxClose = points.length ? Math.max(...points.map((p) => p.close)) : 0;
  const padding = (maxClose - minClose) * 0.05 || 1;

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.3 }}
        className="mb-2 border border-amber-500/30 rounded-xl p-2 glass-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              {isPos
                ? <TrendingUp className="w-4 h-4 text-amber-400" />
                : <TrendingDown className="w-4 h-4 text-amber-400" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {label}
                <span className="ml-2 text-xs text-muted-foreground font-normal">{data?.name ?? ticker}</span>
              </h3>
              <p className="text-xs text-muted-foreground">6-Month Daily Close · {ticker}</p>
            </div>
            {change != null && (
              <span className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded border tabular-nums",
                isPos
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              )}>
                {isPos ? "+" : ""}{change.toFixed(2)}% (6M)
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chart body */}
        {isLoading ? (
          <div className="h-52 flex items-center justify-center text-xs text-muted-foreground tracking-widest uppercase animate-pulse">
            Loading price history…
          </div>
        ) : isError || points.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-xs text-destructive">
            Could not load price history for {ticker}.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "Lora, Georgia, serif" }}
                tickLine={false}
                axisLine={false}
                ticks={monthlyDates}
                tickFormatter={(d: string) => {
                  const dt = new Date(d + "T00:00:00");
                  return dt.toLocaleDateString("en-US", { month: "short" });
                }}
              />
              <YAxis
                domain={[minClose - padding, maxClose + padding]}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "Lora, Georgia, serif" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${fmt(v)}`}
                width={70}
              />
              <Tooltip content={<ChartTooltip />} />
              {first && (
                <ReferenceLine
                  y={first}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="3 3"
                  strokeOpacity={0.4}
                />
              )}
              <Line
                type="monotone"
                dataKey="close"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.section>
    </AnimatePresence>
  );
}
