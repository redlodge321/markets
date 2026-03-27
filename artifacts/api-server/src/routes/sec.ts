import { Router, type IRouter } from "express";
import { XMLParser } from "fast-xml-parser";

const router: IRouter = Router();

const SEC_FEED_URL =
  "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-K&owner=include&output=atom";
const USER_AGENT = "MVC Market Screen admin@mvcmarketscreen.com";

const CACHE_TTL = 5 * 60 * 1000;
let cachedFilings: { date: string; company: string; link: string }[] | null = null;
let cacheTime = 0;

router.get("/sec/bankruptcies", async (_req, res) => {
  const now = Date.now();
  if (cachedFilings && now - cacheTime < CACHE_TTL) {
    return res.json({ filings: cachedFilings, fetchedAt: new Date(cacheTime).toISOString() });
  }

  try {
    const response = await fetch(SEC_FEED_URL, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      return res.status(502).json({ error: `SEC EDGAR returned ${response.status}` });
    }

    const xml = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const parsed = parser.parse(xml);

    const rawEntries = parsed?.feed?.entry ?? [];
    const entries: Record<string, unknown>[] = Array.isArray(rawEntries) ? rawEntries : [rawEntries];

    const filings: { date: string; company: string; link: string }[] = [];

    for (const entry of entries) {
      const summaryRaw = entry.summary;
      const summary: string =
        typeof summaryRaw === "object" && summaryRaw !== null
          ? String((summaryRaw as Record<string, unknown>)["#text"] ?? "")
          : String(summaryRaw ?? "");

      if (!summary.includes("1.03")) continue;

      const title = String(entry.title ?? "");
      // Title format: "COMPANY NAME (0001234567) (8-K)"
      const company = title.split(" (0")[0].trim() || title;

      const updated = String(entry.updated ?? "");
      const date = updated.split("T")[0] ?? updated;

      const rawLink = entry.link;
      const links: Record<string, string>[] = Array.isArray(rawLink)
        ? rawLink
        : rawLink ? [rawLink as Record<string, string>] : [];
      const linkObj =
        links.find((l) => l["@_rel"] === "alternate") ?? links[0];
      const link = linkObj?.["@_href"] ?? "";

      filings.push({ date, company, link });
    }

    cachedFilings = filings;
    cacheTime = now;

    return res.json({ filings, fetchedAt: new Date(now).toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
});

export default router;
