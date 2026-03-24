import { Router, type IRouter } from "express";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import YahooFinanceCtor from "yahoo-finance2";
import { RunScreenerBody, RunScreenerResponse, GetStockQuotesBody, GetStockQuotesResponse } from "@workspace/api-zod";

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
      shortName?: string;
      longName?: string;
      sector?: string;
      marketCap?: number;
      fiftyTwoWeekHigh?: number;
      fiftyTwoWeekLow?: number;
    };
    defaultKeyStatistics?: { forwardPE?: number; priceToBook?: number };
    financialData?: { profitMargins?: number };
  }>;
};

interface StockData {
  ticker: string;
  companyName: string;
  price: number;
  forwardPE: number;
  priceToBook: number;
  profitMargin: number;
  sector?: string;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

async function fetchStockData(ticker: string): Promise<StockData | { error: string }> {
  try {
    const quote = await yf.quoteSummary(ticker, {
      modules: ["price", "defaultKeyStatistics", "financialData"],
    });

    const price_data = quote.price;
    const financial = quote.financialData;
    const keyStats = quote.defaultKeyStatistics;

    const price = price_data?.regularMarketPrice ?? null;
    const forwardPE = keyStats?.forwardPE ?? null;
    const priceToBook = keyStats?.priceToBook ?? null;
    const profitMargin = financial?.profitMargins ?? null;
    const companyName = price_data?.shortName ?? price_data?.longName ?? ticker;
    const sector = price_data?.sector;
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
      forwardPE: forwardPE ?? 0,
      priceToBook: priceToBook ?? 0,
      profitMargin: profitMargin ?? 0,
      sector,
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
  const { tickers, maxPE = 30, maxPB = 3, minMargin = 0.10 } = body;

  const results: StockData[] = [];
  const errors: { ticker: string; error: string }[] = [];

  await Promise.all(
    tickers.map(async (ticker) => {
      const data = await fetchStockData(ticker);
      if ("error" in data) {
        errors.push({ ticker: ticker.toUpperCase(), error: data.error });
        return;
      }

      const pe = data.forwardPE;
      const pb = data.priceToBook;
      const margin = data.profitMargin;

      const pePass = pe > 0 && pe < maxPE;
      const pbPass = pb <= 0 || pb < maxPB;
      const marginPass = margin > minMargin;

      if (pePass && pbPass && marginPass) {
        results.push(data);
      }
    })
  );

  results.sort((a, b) => a.forwardPE - b.forwardPE);

  const response = RunScreenerResponse.parse({
    results,
    screened: tickers.length,
    passed: results.length,
    criteria: { maxPE, minMargin },
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
        quotes.push({ ticker: ticker.toUpperCase(), companyName: ticker, price: 0, forwardPE: 0, priceToBook: 0, profitMargin: 0, error: data.error });
      } else {
        quotes.push(data);
      }
    })
  );

  const response = GetStockQuotesResponse.parse({ quotes });
  res.json(response);
});

export default router;
