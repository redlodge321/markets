import { useGetBankruptcyFilings } from "@workspace/api-client-react";
import { AlertTriangle, ExternalLink, RefreshCw, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function BankruptcyFilings() {
  const { data, isLoading, isError, refetch, isFetching } = useGetBankruptcyFilings({
    query: { refetchOnWindowFocus: false },
  });

  const filings = data?.filings ?? [];
  const fetchedAt = data?.fetchedAt
    ? new Date(data.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="border border-zinc-500/70 rounded-xl p-2 glass-panel flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
            <ShieldAlert className="w-4 h-4 text-destructive" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              SEC Bankruptcy Filings
              {filings.length > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-destructive/15 text-destructive border border-destructive/25 tracking-wide">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {filings.length} detected
                </span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground">
              Live 8-K Item 1.03 filings from SEC EDGAR
              {fetchedAt && <span className="ml-1 opacity-60">· as of {fetchedAt}</span>}
            </p>
            <a
              href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-K&owner=include&output=atom"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-muted-foreground/50 hover:text-muted-foreground transition-colors break-all leading-tight"
            >
              SEC EDGAR · action=getcurrent&amp;type=8-K&amp;owner=include&amp;output=atom
            </a>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 text-muted-foreground text-xs uppercase tracking-widest bg-muted/20">
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Company</th>
              <th className="px-4 py-2 text-right">Filing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground text-xs tracking-widest uppercase animate-pulse">
                  Querying SEC EDGAR...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-destructive text-xs">
                  Failed to fetch SEC EDGAR feed. SEC may be rate-limiting — try again shortly.
                </td>
              </tr>
            ) : filings.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground text-xs tracking-widest uppercase">
                  No Item 1.03 filings in current SEC feed
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {filings.map((f, i) => (
                  <motion.tr
                    key={`${f.company}-${f.date}-${i}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-destructive/5 transition-colors group"
                  >
                    <td className="px-4 py-2 text-muted-foreground text-xs tabular-nums whitespace-nowrap">
                      {f.date}
                    </td>
                    <td className="px-4 py-2 text-foreground font-medium">
                      {f.company}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {f.link ? (
                        <a
                          href={f.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-destructive/70 hover:text-destructive transition-colors underline-offset-2 hover:underline"
                        >
                          View 8-K <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
