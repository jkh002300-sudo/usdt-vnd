const API_URL = "https://usdt-vnd.vercel.app/api/rate";
const FALLBACK_RATE = 25500;
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5분

let RATE = FALLBACK_RATE;

const usdtInput = document.querySelector("#usdtAmount");
const vndInput = document.querySelector("#vndAmount");

function numericValue(value) {
  return Number(String(value).replace(/[^0-9.]/g, "")) || 0;
}

function formatNumber(value, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits
  }).format(value);
}

function updateVnd() {
  const usdt = numericValue(usdtInput.value);

  usdtInput.value = formatNumber(usdt, 2);
  vndInput.value = formatNumber(Math.round(usdt * RATE));
}

function updateRateDisplay() {
  const formattedRate = formatNumber(RATE);

  // HTML에 해당 ID가 있으면 자동으로 환율 표시를 변경합니다.
  const rateElements = document.querySelectorAll(
    "#exchangeRate, #rateText, #exampleRate, [data-exchange-rate]"
  );

  rateElements.forEach((element) => {
    element.textContent = `1 USDT ≈ ${formattedRate} VND`;
  });
}

async function loadBinanceRate() {
  try {
    const response = await fetch(`${API_URL}?t=${Date.now()}`, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`환율 API 오류: ${response.status}`);
    }

    const data = await response.json();

    if (
      data.success === true &&
      Number.isFinite(Number(data.rate)) &&
      Number(data.rate) > 0
    ) {
      RATE = Number(data.rate);

      console.log("Binance P2P 환율 업데이트:", RATE);

      updateRateDisplay();
      updateVnd();
    } else {
      throw new Error(data.error || "정상적인 환율이 없습니다.");
    }
  } catch (error) {
    console.error("환율 불러오기 실패:", error);

    // API 오류가 발생하면 마지막 환율 또는 기본 환율을 유지합니다.
    updateRateDisplay();
    updateVnd();
  }
}

usdtInput.addEventListener("focus", () => {
  usdtInput.value = numericValue(usdtInput.value) || "";
});

usdtInput.addEventListener("blur", updateVnd);

usdtInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    usdtInput.blur();
  }
});

document.querySelector("#swapButton")?.addEventListener("click", () => {
  document.querySelector(".exchange-card")?.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(.985)" },
      { transform: "scale(1)" }
    ],
    {
      duration: 260,
      easing: "ease-out"
    }
  );
});

document.querySelectorAll(".accordion details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;

    document.querySelectorAll(".accordion details").forEach((other) => {
      if (other !== detail) {
        other.open = false;
      }
    });
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  observer.observe(element);
});

// 처음 접속할 때 즉시 Binance P2P 환율 조회
loadBinanceRate();

// 사이트를 열어둔 동안 5분마다 자동 갱신
setInterval(loadBinanceRate, REFRESH_INTERVAL);
