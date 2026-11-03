const header = document.querySelector(".site-header");
const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
const promo = document.getElementById("promo");

const headerSpacer = document.getElementById("headerSpacer");

function syncHeaderOffset() {
  if (!header) return;
  const h = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--header-offset", `${h}px`);
  if (headerSpacer) headerSpacer.style.height = `${h}px`;
}

syncHeaderOffset();
window.addEventListener("resize", syncHeaderOffset);

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 20);
});

toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  });
});

/**
 * Offer banner — edit offers.json only.
 * - enabled: false  → hide banner
 * - startDate / endDate: optional "YYYY-MM-DD" (inclusive, local time)
 */
function parseDay(value) {
  if (!value || typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function isOfferActive(offer) {
  if (!offer || offer.enabled !== true) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = parseDay(offer.startDate);
  const end = parseDay(offer.endDate);

  if (start && today < start) return false;
  if (end && today > end) return false;
  return true;
}

function hidePromo() {
  promo?.setAttribute("hidden", "");
  document.body.classList.remove("has-promo");
  syncHeaderOffset();
}

function showPromo(offer) {
  if (!promo) return;

  const label = promo.querySelector(".promo-label");
  const message = promo.querySelector(".promo-message");
  const cta = promo.querySelector(".promo-cta");

  if (label) label.textContent = offer.label?.trim() || "Offer";
  if (message) message.textContent = offer.message?.trim() || "";
  if (cta) {
    cta.textContent = offer.ctaText?.trim() || "View offer";
    cta.href = offer.ctaUrl?.trim() || "https://wa.me/917827455800";
  }

  promo.removeAttribute("hidden");
  document.body.classList.add("has-promo");
  syncHeaderOffset();
}

async function loadOfferBanner() {
  if (!promo) return;

  try {
    const response = await fetch("offers.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`offers.json ${response.status}`);
    const offer = await response.json();
    if (isOfferActive(offer) && offer.message?.trim()) {
      showPromo(offer);
    } else {
      hidePromo();
    }
  } catch (err) {
    console.warn("Offer banner: could not load offers.json", err);
    // Keep the HTML fallback text visible if fetch fails (e.g. file:// preview)
    promo.removeAttribute("hidden");
    document.body.classList.add("has-promo");
    syncHeaderOffset();
  }
}

loadOfferBanner();
