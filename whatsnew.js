// whatsnew.js
(function () {
  const ALL = Array.isArray(window.PP_WHATS_NEW) ? window.PP_WHATS_NEW : [];

  // ile slajdów ma się pokazać w "What's new"
  const MAX_SLIDES = 4;

  const track = document.getElementById("ppWhatsNewTrack");
  const viewport = document.getElementById("ppWhatsNewViewport");
  const dotsWrap = document.getElementById("ppWhatsNewDots");
  const btnPrev = document.getElementById("ppWhatsNewPrev");
  const btnNext = document.getElementById("ppWhatsNewNext");

  const updatesLog = document.getElementById("ppUpdatesLog");
  const updatesMeta = document.getElementById("ppUpdatesMeta");

  // newest first (tak jak w data.js)
  const SLIDES = ALL.slice(0, MAX_SLIDES);

  let index = 0;

  function esc(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderSlides() {
    if (!track) return;

    track.innerHTML = SLIDES.map(item => {
      const title = esc(item.title);
      const sub = esc(item.subtitle);
      const cta = esc(item.cta || "View");
      const href = esc(item.href || "#");
      const img = esc(item.image || "");
      const tag = esc(item.tag || "");

      return `
        <a class="pp-whatsnew__card" href="${href}">
          <div class="pp-whatsnew__img" style="background-image:url('${img}')"></div>
          <div class="pp-whatsnew__body">
            <div class="pp-whatsnew__title">${title}</div>
            <div class="pp-whatsnew__sub">${sub}</div>
            <div class="pp-whatsnew__cta-row">
              <span class="pp-whatsnew__cta">${cta}</span>
              ${tag ? `<span class="pp-whatsnew__tag">${tag}</span>` : ``}
            </div>
          </div>
        </a>
      `;
    }).join("");

    // dots
    if (dotsWrap) {
      dotsWrap.innerHTML = SLIDES.map((_, i) => {
        const active = i === index ? "is-active" : "";
        return `<button class="pp-whatsnew__dot ${active}" type="button" aria-label="Go to slide ${i + 1}" data-i="${i}"></button>`;
      }).join("");

      dotsWrap.querySelectorAll("[data-i]").forEach(btn => {
        btn.addEventListener("click", () => {
          index = Number(btn.getAttribute("data-i")) || 0;
          scrollToIndex();
          updateDots();
        });
      });
    }
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll(".pp-whatsnew__dot").forEach((d, i) => {
      d.classList.toggle("is-active", i === index);
    });
  }

  function scrollToIndex() {
    if (!viewport) return;
    const card = track?.children?.[index];
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  function clampIndex() {
    if (index < 0) index = 0;
    if (index > SLIDES.length - 1) index = SLIDES.length - 1;
  }

  function next() {
    index += 1;
    if (index >= SLIDES.length) index = 0;
    scrollToIndex();
    updateDots();
  }

  function prev() {
    index -= 1;
    if (index < 0) index = SLIDES.length - 1;
    scrollToIndex();
    updateDots();
  }

  function bindControls() {
    btnNext?.addEventListener("click", next);
    btnPrev?.addEventListener("click", prev);

    // keyboard
    viewport?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });

    // keep index in sync when user scrolls manually
    viewport?.addEventListener("scroll", () => {
      const cards = Array.from(track?.children || []);
      if (!cards.length) return;

      const vpRect = viewport.getBoundingClientRect();
      let bestI = 0;
      let bestDist = Infinity;

      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const dist = Math.abs(r.left - vpRect.left);
        if (dist < bestDist) {
          bestDist = dist;
          bestI = i;
        }
      });

      index = bestI;
      clampIndex();
      updateDots();
    }, { passive: true });
  }

  function renderUpdatesLog() {
    if (!updatesLog) return;

    if (updatesMeta) {
      updatesMeta.textContent = `${ALL.length} total`;
    }

    updatesLog.innerHTML = ALL.map(item => {
      const title = esc(item.title);
      const sub = esc(item.subtitle);
      const href = esc(item.href || "#");
      const tag = esc(item.tag || "");

      return `
        <a class="pp-update" href="${href}">
          <div>
            <div class="pp-update__title">${title}</div>
            <div class="pp-update__sub">${sub}</div>
          </div>
          ${tag ? `<div class="pp-update__tag">${tag}</div>` : ``}
        </a>
      `;
    }).join("");
  }

  // boot
  if (SLIDES.length && track && viewport) {
    renderSlides();
    bindControls();
    updateDots();
  } else {
    // jeśli brak slajdów, to schowaj cały blok "What's new" żeby nie straszył pustką
    const section = document.querySelector(".pp-whatsnew");
    if (section) section.style.display = "none";
  }

  renderUpdatesLog();
})();
