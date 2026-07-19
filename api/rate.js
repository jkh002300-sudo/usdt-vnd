const BINANCE_URL =
  "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60"
    }
  });
}

function median(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS"
        }
      });
    }

    try {
      const url = new URL(request.url);

      const amount = Math.max(
        Number(url.searchParams.get("amount")) || 30000000,
        1
      );

      const response = await fetch(BINANCE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150.0.0.0 Safari/537.36",
          Origin: "https://p2p.binance.com",
          Referer: "https://p2p.binance.com/"
        },
        body: JSON.stringify({
          page: 1,
          rows: 10,
          asset: "USDT",
          fiat: "VND",
          tradeType: "SELL",
          payTypes: [],
          publisherType: null,
          transAmount: String(amount)
        })
      });

      if (!response.ok) {
        throw new Error(`Binance error: ${response.status}`);
      }

      const result = await response.json();

      const prices = (result.data || [])
        .map((item) => Number(item?.adv?.price))
        .filter((price) => Number.isFinite(price) && price > 0)
        .slice(0, 5);

      if (prices.length < 3) {
        throw new Error("사용 가능한 Binance P2P 광고가 부족합니다.");
      }

      const rate = median(prices);

      return json({
        success: true,
        asset: "USDT",
        fiat: "VND",
        amount,
        rate,
        prices,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      return json(
        {
          success: false,
          error: error.message,
          updatedAt: new Date().toISOString()
        },
        502
      );
    }
  }
};
