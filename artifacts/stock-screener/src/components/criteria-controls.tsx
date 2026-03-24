import { SlidersHorizontal, Info } from "lucide-react";
import * as React from "react";

interface CriteriaControlsProps {
  maxPB: number;
  setMaxPB: (val: number) => void;
  maxDebtToEquity: number;
  setMaxDebtToEquity: (val: number) => void;
  minCurrentRatio: number;
  setMinCurrentRatio: (val: number) => void;
  minMarketCap: number;
  setMinMarketCap: (val: number) => void;
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
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          {label}
          <div className="group relative cursor-help">
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-popover border border-border rounded-lg text-xs text-popover-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
              {tooltip}
            </div>
          </div>
        </label>
        <div className="px-3 py-1 bg-background border border-border rounded-md font-mono text-primary font-bold text-sm">
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
        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-xs font-mono text-muted-foreground px-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function formatMarketCapLabel(billions: number): string {
  if (billions >= 1000) return `$${(billions / 1000).toFixed(1)}T`;
  return `$${billions.toFixed(0)}B`;
}

export function CriteriaControls({
  maxPB,
  setMaxPB,
  maxDebtToEquity,
  setMaxDebtToEquity,
  minCurrentRatio,
  setMinCurrentRatio,
  minMarketCap,
  setMinMarketCap,
}: CriteriaControlsProps) {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Screener Criteria</h2>
          <p className="text-sm text-muted-foreground">Define your strict agentic parameters.</p>
        </div>
      </div>

      <div className="space-y-6">
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
          label="Min Market Cap"
          tooltip="Minimum market capitalization. Filters out smaller companies — large caps ($10B+) tend to have more liquidity and stability."
          value={minMarketCap}
          displayValue={formatMarketCapLabel(minMarketCap)}
          min={0}
          max={2000}
          step={10}
          onChange={setMinMarketCap}
          minLabel="$0"
          maxLabel="$2T"
        />
      </div>
    </div>
  );
}
