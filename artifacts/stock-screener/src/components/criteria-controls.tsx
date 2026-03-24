import { SlidersHorizontal, Info } from "lucide-react";
import * as React from "react";

interface CriteriaControlsProps {
  maxPB: number;
  setMaxPB: (val: number) => void;
  minMargin: number;
  setMinMargin: (val: number) => void;
}

export function CriteriaControls({
  maxPB,
  setMaxPB,
  minMargin,
  setMinMargin,
}: CriteriaControlsProps) {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Screener Criteria</h2>
            <p className="text-sm text-muted-foreground">Define your strict agentic parameters.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* PB Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              Max P/B Ratio
              <div className="group relative cursor-help">
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-popover border border-border rounded-lg text-xs text-popover-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  Price-to-Book ratio compares market value to book value. Under 3 is often considered value territory.
                </div>
              </div>
            </label>
            <div className="px-3 py-1 bg-background border border-border rounded-md font-mono text-primary font-bold text-sm">
              {maxPB.toFixed(1)}x
            </div>
          </div>
          <input
            type="range"
            min="0.5"
            max="20"
            step="0.5"
            value={maxPB}
            onChange={(e) => setMaxPB(parseFloat(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs font-mono text-muted-foreground px-1">
            <span>0.5x</span>
            <span>20x</span>
          </div>
        </div>

        {/* Margin Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              Min Profit Margin
              <div className="group relative cursor-help">
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover border border-border rounded-lg text-xs text-popover-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  Net income divided by revenue. Higher indicates stronger profitability.
                </div>
              </div>
            </label>
            <div className="px-3 py-1 bg-background border border-border rounded-md font-mono text-primary font-bold text-sm">
              {(minMargin * 100).toFixed(0)}%
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={minMargin}
            onChange={(e) => setMinMargin(parseFloat(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs font-mono text-muted-foreground px-1">
            <span>0%</span>
            <span>50%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
