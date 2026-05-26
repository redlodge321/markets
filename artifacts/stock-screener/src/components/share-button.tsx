import { useState, useRef, useEffect } from "react";
import { Share2, Check, Link2, Mail } from "lucide-react";

export function ShareButton({ title = "MVC Market Screen" }: { title?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const el = document.createElement("textarea");
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 2000);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`${title} — Market Data`);
    const body = encodeURIComponent(
      `Here's a link to the ${title} dashboard:\n\n${window.location.href}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border/30 hover:border-border/60"
      >
        <Share2 className="w-3 h-3" />
        <span>Share</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border border-zinc-600/50 bg-zinc-900 shadow-xl overflow-hidden">
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-muted-foreground hover:bg-zinc-800 hover:text-foreground transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-400">Link copied!</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5 shrink-0" />
                <span>Copy link</span>
              </>
            )}
          </button>
          <div className="h-px bg-zinc-700/60" />
          <button
            onClick={handleEmail}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-muted-foreground hover:bg-zinc-800 hover:text-foreground transition-colors"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>Share via email</span>
          </button>
        </div>
      )}
    </div>
  );
}
