const RATE = 25500;

const usdtInput = document.querySelector("#usdtAmount");
const vndInput = document.querySelector("#vndAmount");

function numericValue(value) {
  return Number(String(value).replace(/[^0-9.]/g, "")) || 0;
}

function formatNumber(value, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("ko-KR", { maximumFractionDigits }).format(value);
}

function updateVnd() {
  const usdt = numericValue(usdtInput.value);
  usdtInput.value = formatNumber(usdt, 2);
  vndInput.value = formatNumber(Math.round(usdt * RATE));
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

document.querySelector("#swapButton").addEventListener("click", () => {
  document.querySelector(".exchange-card").animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(.985)" },
      { transform: "scale(1)" }
    ],
    { duration: 260, easing: "ease-out" }
  );
});

document.querySelectorAll(".accordion details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".accordion details").forEach((other) => {
      if (other !== detail) other.open = false;
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

updateVnd();
