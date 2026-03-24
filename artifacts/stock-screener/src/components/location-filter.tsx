import { MapPin, X } from "lucide-react";

const COUNTRY_PRESETS = ["United States", "China", "United Kingdom", "Japan", "Canada"];
const STATE_PRESETS = ["CA", "NY", "TX", "WA", "MA"];

interface LocationFilterProps {
  filterCountry: string;
  setFilterCountry: (val: string) => void;
  filterState: string;
  setFilterState: (val: string) => void;
}

export function LocationFilter({ filterCountry, setFilterCountry, filterState, setFilterState }: LocationFilterProps) {
  const isActive = filterCountry.trim() !== "" || filterState.trim() !== "";

  return (
    <div className={`glass-panel rounded-2xl p-4 flex flex-col gap-3 transition-colors ${isActive ? "border border-primary/30" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${isActive ? "bg-primary/10 border-primary/20" : "bg-secondary/50 border-border/40"}`}>
            <MapPin className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">HQ Location Filter</h2>
            <p className="text-xs text-muted-foreground">Filter equities by company headquarters.</p>
          </div>
        </div>
        {isActive && (
          <button
            onClick={() => { setFilterCountry(""); setFilterState(""); }}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded border border-border/40 hover:border-border transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Country */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-medium">Country</label>
          <div className="relative">
            <input
              type="text"
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              placeholder="e.g. United States"
              className="w-full bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50 pr-7"
            />
            {filterCountry && (
              <button
                onClick={() => setFilterCountry("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {COUNTRY_PRESETS.filter((c) => c.toLowerCase() !== filterCountry.toLowerCase()).slice(0, 3).map((c) => (
              <button
                key={c}
                onClick={() => setFilterCountry(c)}
                className="px-2 py-0.5 rounded text-[10px] border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* State */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-medium">State <span className="opacity-60">(US)</span></label>
          <div className="relative">
            <input
              type="text"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              placeholder="e.g. CA, Texas"
              className="w-full bg-background border border-border/50 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50 pr-7"
            />
            {filterState && (
              <button
                onClick={() => setFilterState("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {STATE_PRESETS.filter((s) => s.toLowerCase() !== filterState.toLowerCase()).map((s) => (
              <button
                key={s}
                onClick={() => setFilterState(s)}
                className="px-2 py-0.5 rounded text-[10px] border border-border/40 text-muted-foreground hover:text-foreground hover:border-border font-mono transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
