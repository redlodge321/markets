import { SlidersHorizontal, Info, X } from "lucide-react";
import * as React from "react";

interface CriteriaControlsProps {
  maxPB: number;
  setMaxPB: (val: number) => void;
  maxDebtToEquity: number;
  setMaxDebtToEquity: (val: number) => void;
  minCurrentRatio: number;
  setMinCurrentRatio: (val: number) => void;
  maxMarketCap: number;
  setMaxMarketCap: (val: number) => void;
  onClear: () => void;
}

function Slider({
  label,
  tooltip,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
  minLabel,
  maxLabel,
}: {
  label: string;
  tooltip: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  minLabel: string;
  maxLabel: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
          {label}
          <div className="group relative cursor-help">
            <Info className="w-3 h-3 text-muted-foreground" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-popover border border-border rounded-lg text-xs text-popover-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
              {tooltip}
            </div>
          </div>
        </label>
        <div className="px-2 py-0.5 bg-background border border-border rounded font-mono text-primary font-bold text-xs">
          {displayValue}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground/70 px-0.5">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function formatMarketCapLabel(millions: number): string {
  if (millions >= 1000000) return `$${(millions / 1000000).toFixed(1)}T`;
  if (millions >= 1000) return `$${(millions / 1000).toFixed(0)}B`;
  return `$${millions.toFixed(0)}M`;
}

export function CriteriaControls({
  maxPB,
  setMaxPB,
  maxDebtToEquity,
  setMaxDebtToEquity,
  minCurrentRatio,
  setMinCurrentRatio,
  maxMarketCap,
  setMaxMarketCap,
  onClear,
}: CriteriaControlsProps) {
  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Screener Criteria</h2>
            <p className="text-xs text-muted-foreground">Define your agentic parameters.</p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded border border-border/40 hover:border-border transition-colors"
        >
          <X className="w-3 h-3" /> Clear
        </button>
      </div>

      <div className="space-y-4">
        <Slider
          label="Max P/B Ratio"
          tooltip="Price-to-Book ratio compares market value to book value. Under 3 is often considered value territory."
          value={maxPB}
          displayValue={`${maxPB.toFixed(1)}x`}
          min={0.5}
          max={20}
          step={0.5}
          onChange={setMaxPB}
          minLabel="0.5x"
          maxLabel="20x"
        />
        <Slider
          label="Max Debt/Equity"
          tooltip="Debt-to-Equity ratio expressed as a percentage. Under 100% means less debt than equity — a sign of a strong balance sheet."
          value={maxDebtToEquity}
          displayValue={`${maxDebtToEquity.toFixed(0)}%`}
          min={0}
          max={300}
          step={10}
          onChange={setMaxDebtToEquity}
          minLabel="0%"
          maxLabel="300%"
        />
        <Slider
          label="Min Current Ratio"
          tooltip="Current assets divided by current liabilities. Above 1.5 means the company can comfortably cover short-term obligations."
          value={minCurrentRatio}
          displayValue={`${minCurrentRatio.toFixed(1)}x`}
          min={0.5}
          max={5}
          step={0.1}
          onChange={setMinCurrentRatio}
          minLabel="0.5x"
          maxLabel="5x"
        />
        <Slider
          label="Max Market Cap"
          tooltip="Maximum market capitalization. Set lower to focus on mid or small caps. At $2T the filter is effectively off."
          value={maxMarketCap}
          displayValue={maxMarketCap >= 2000000 ? "Any" : formatMarketCapLabel(maxMarketCap)}
          min={0}
          max={2000000}
          step={10000}
          onChange={setMaxMarketCap}
          minLabel="$0"
          maxLabel="Any"
        />
      </div>
    </div>
  );
}
