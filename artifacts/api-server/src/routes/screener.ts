import { Router, type IRouter } from "express";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import YahooFinanceCtor from "yahoo-finance2";
import { RunScreenerBody, RunScreenerResponse, GetStockQuotesBody, GetStockQuotesResponse, SearchTickersBody, SearchTickersResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// yahoo-finance2 v3 requires class instantiation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf = new (YahooFinanceCtor as any)({ suppressNotices: ["yahooSurvey"] }) as {
  quoteSummary(
    symbol: string,
    opts: { modules: string[] }
  ): Promise<{
    price?: {
      regularMarketPrice?: number;
      regularMarketChangePercent?: number;
      shortName?: string;
      longName?: string;
      sector?: string;
      marketCap?: number;
      fiftyTwoWeekHigh?: number;
      fiftyTwoWeekLow?: number;
    };
    defaultKeyStatistics?: { forwardPE?: number; priceToBook?: number };
    financialData?: { profitMargins?: number; debtToEquity?: number; currentRatio?: number; freeCashflow?: number };
    calendarEvents?: { earnings?: { earningsDate?: string[] } };
    summaryProfile?: { sector?: string; industry?: string };
  }>;
  search(
    query: string,
    opts?: { quotesCount?: number; newsCount?: number }
  ): Promise<{
    quotes?: Array<{ symbol: string; shortname?: string; exchange?: string; quoteType?: string; isYahooFinance?: boolean }>;
  }>;
};

interface CommodityData {
  ticker: string;
  name: string;
  price: number;
  dayChangePercent?: number;
  sixMonthChangePercent?: number;
  prevClose?: number;
}

async function fetchCommodityData(ticker: string): Promise<CommodityData | { error: string }> {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [quote, chartData] = await Promise.all([
      yf.quoteSummary(ticker, { modules: ["price"] }),
      yf.chart(ticker, { period1: sixMonthsAgo, period2: new Date(), interval: '1mo' }).catch(() => null),
    ]);

    const p = quote.price;
    const price = p?.regularMarketPrice;
    if (!price) return { error: "No price data" };

    let sixMonthChangePercent: number | undefined;
    if (chartData?.quotes && chartData.quotes.length >= 2) {
      const first = chartData.quotes[0]?.close;
      const last = chartData.quotes[chartData.quotes.length - 1]?.close;
      if (first && last && first > 0) {
        sixMonthChangePercent = (last - first) / first;
      }
    }

    return {
      ticker: ticker.toUpperCase(),
      name: p?.shortName ?? p?.longName ?? ticker,
      price,
      dayChangePercent: p?.regularMarketChangePercent ?? undefined,
      sixMonthChangePercent,
      prevClose: p?.regularMarketPreviousClose ?? undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: message };
  }
}

interface StockData {
  ticker: string;
  companyName: string;
  price: number;
  dayChangePercent?: number;
  sixMonthChangePercent?: number;
  forwardPE: number;
  priceToBook: number;
  profitMargin: number;
  debtToEquity: number;
  currentRatio: number;
  pfcfRatio?: number;
  freeCashflow?: number;
  nextEarningsDate?: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

async function fetchStockData(ticker: string): Promise<StockData | { error: string }> {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [quote, chartData] = await Promise.all([
      yf.quoteSummary(ticker, {
        modules: ["price", "defaultKeyStatistics", "financialData", "calendarEvents", "summaryProfile"],
      }),
      yf.chart(ticker, { period1: sixMonthsAgo, period2: new Date(), interval: '1mo' }).catch(() => null),
    ]);

    const price_data = quote.price;
    const financial = quote.financialData;
    const keyStats = quote.defaultKeyStatistics;

    const price = price_data?.regularMarketPrice ?? null;
    const dayChangePercent = price_data?.regularMarketChangePercent ?? undefined;

    let sixMonthChangePercent: number | undefined;
    if (chartData?.quotes && chartData.quotes.length >= 2) {
      const first = chartData.quotes[0]?.close;
      const last = chartData.quotes[chartData.quotes.length - 1]?.close;
      if (first && last && first > 0) {
        sixMonthChangePercent = (last - first) / first;
      }
    }
    const forwardPE = keyStats?.forwardPE ?? null;
    const priceToBook = keyStats?.priceToBook ?? null;
    const profitMargin = financial?.profitMargins ?? null;
    const debtToEquity = financial?.debtToEquity ?? null;
    const currentRatio = financial?.currentRatio ?? null;
    const freeCashflow = financial?.freeCashflow ?? null;
    const mcapRaw = price_data?.marketCap ?? null;
    const pfcfRatio = freeCashflow && freeCashflow > 0 && mcapRaw ? mcapRaw / freeCashflow : null;
    const earningsDates = quote.calendarEvents?.earnings?.earningsDate;
    const nextEarningsRaw = earningsDates && earningsDates.length > 0 ? earningsDates[0] : undefined;
    const nextEarningsDate = nextEarningsRaw
      ? (nextEarningsRaw instanceof Date ? nextEarningsRaw.toISOString() : String(nextEarningsRaw))
      : undefined;
    const companyName = price_data?.shortName ?? price_data?.longName ?? ticker;
    const sector = quote.summaryProfile?.sector;
    const industry = quote.summaryProfile?.industry;
    const marketCap = price_data?.marketCap;
    const fiftyTwoWeekHigh = price_data?.fiftyTwoWeekHigh;
    const fiftyTwoWeekLow = price_data?.fiftyTwoWeekLow;

    if (price === null || price === undefined) {
      return { error: "Could not fetch price data" };
    }

    return {
      ticker: ticker.toUpperCase(),
      companyName: companyName ?? ticker,
      price,
      dayChangePercent,
      sixMonthChangePercent,
      forwardPE: forwardPE ?? 0,
      priceToBook: priceToBook ?? 0,
      profitMargin: profitMargin ?? 0,
      debtToEquity: debtToEquity ?? 0,
      currentRatio: currentRatio ?? 0,
      pfcfRatio: pfcfRatio ?? undefined,
      freeCashflow: freeCashflow ?? undefined,
      nextEarningsDate,
      sector,
      industry,
      marketCap,
      fiftyTwoWeekHigh,
      fiftyTwoWeekLow,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: message };
  }
}

router.post("/screener/run", async (req, res) => {
  const body = RunScreenerBody.parse(req.body);
  const { tickers, maxPB = 3, maxDebtToEquity = 100, minCurrentRatio = 1.2, maxMarketCap = 2000 } = body;

  const isFuture = (t: string) => t.includes("=");
  const equityTickers = tickers.filter((t) => !isFuture(t));
  const futureTickers = tickers.filter((t) => isFuture(t));

  const results: StockData[] = [];
  const commodities: CommodityData[] = [];
  const errors: { ticker: string; error: string }[] = [];

  await Promise.all([
    ...equityTickers.map(async (ticker) => {
      const data = await fetchStockData(ticker);
      if ("error" in data) {
        errors.push({ ticker: ticker.toUpperCase(), error: data.error });
        return;
      }
      const pb = data.priceToBook;
      const dte = data.debtToEquity;
      const cr = data.currentRatio;
      const mcap = data.marketCap ?? 0;
      const maxMarketCapRaw = maxMarketCap * 1e6;
      const pbPass = pb <= 0 || pb < maxPB;
      const dtePass = dte <= 0 || dte < maxDebtToEquity;
      const crPass = cr <= 0 || cr > minCurrentRatio;
      const mcapPass = maxMarketCap >= 2000000 || mcap <= maxMarketCapRaw;
      if (pbPass && dtePass && crPass && mcapPass) results.push(data);
    }),
    ...futureTickers.map(async (ticker) => {
      const data = await fetchCommodityData(ticker);
      if ("error" in data) {
        errors.push({ ticker: ticker.toUpperCase(), error: data.error });
      } else {
        commodities.push(data);
      }
    }),
  ]);

  results.sort((a, b) => a.forwardPE - b.forwardPE);

  const response = RunScreenerResponse.parse({
    results,
    commodities,
    screened: tickers.length,
    passed: results.length,
    criteria: { maxPE: 0, minMargin: 0 },
    errors,
  });

  res.json(response);
});

router.post("/screener/quote", async (req, res) => {
  const body = GetStockQuotesBody.parse(req.body);
  const { tickers } = body;

  const quotes: (StockData & { error?: string })[] = [];

  await Promise.all(
    tickers.map(async (ticker) => {
      const data = await fetchStockData(ticker);
      if ("error" in data) {
        quotes.push({ ticker: ticker.toUpperCase(), companyName: ticker, price: 0, forwardPE: 0, priceToBook: 0, profitMargin: 0, debtToEquity: 0, currentRatio: 0, error: data.error });
      } else {
        quotes.push(data);
      }
    })
  );

  const response = GetStockQuotesResponse.parse({ quotes });
  res.json(response);
});

router.post("/screener/search", async (req, res) => {
  const { query } = SearchTickersBody.parse(req.body);
  const raw = await yf.search(query, { quotesCount: 8, newsCount: 0 });
  const results = (raw.quotes ?? [])
    .filter((q) => q.isYahooFinance && q.quoteType === "EQUITY")
    .slice(0, 6)
    .map((q) => ({
      symbol: q.symbol,
      shortname: q.shortname,
      exchange: q.exchange,
      quoteType: q.quoteType,
    }));
  res.json(SearchTickersResponse.parse({ results }));
});

export default router;
