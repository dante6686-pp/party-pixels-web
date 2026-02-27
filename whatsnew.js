// whatsnew.js
(function () {
  const ALL = window.PP_WHATS_NEW || [];
  const MAX_SLIDES = 4;          // ile pokazujemy w carousel
  const HOME_UPDATES_LIMIT = 10; // ile pokazujemy w logu na index

  const data = ALL.slice(0, MAX_SLIDES);

  const track = document.getElementById("ppWhatsNewTrack");
  const dotsWrap = document.getElementById("ppWhatsNewDots");
  const prevBtn = document.getElementById("ppWhatsNewPrev");
  const nextBtn = document.getElementById("ppWhatsNewNext");
  const viewport = document.getElementById("ppWhatsNewViewport");

  // updates log (index)
  const updatesLog = document.getElementById("ppUpdatesLog");
  const updatesMeta = document.getElementById("ppUpdatesMeta");

  // If no data at all, hide both blocks nicely
  if (!ALL.length) {
    const section = document.querySelector(".pp-whatsnew");
    if (section) section.style.display = "none";
    if (updatesLog) updatesLog.innerHTML = "";
    if (updatesMeta) updatesMeta.textContent = "";
    return;
  }

  // ---- RENDER UPDATES LOG (index only) ----
  function renderUpdatesLog() {
    if (!updatesLog) return;

    if (updatesMeta) updatesMeta.textContent = `${ALL.length} total`;

    const items = ALL.slice(0, HOME_UPDATES_LIMIT);

    updatesLog.innerHTML = items.map(item => {
  const title = escapeHtml(item.title);
  const sub = escapeHtml(item.subtitle || "");
  const href = escapeAttr(item.href || "#");
  const img = escapeAttr(item.image || "");
  const tag = item.tag ? `<div class="pp-update__tag">${escapeHtml(item.tag)}</div>` : "";

  return `
    <a class="pp-update" href="${href}">
      <div class="pp-update__thumb" style="background-image:url('${img}')"></div>

      <div class="pp-update__content">
        <div class="pp-update__title">${title}</div>
        <div class="pp-update__sub">${sub}</div>
      </div>

      ${tag}
    </a>
  `;
}).join("");
  }

  renderUpdatesLog();

  // ---- CAROUSEL (keep your old DOM/CSS contract) ----
  if (!track || data.length === 0) {
    const section = document.querySelector(".pp-whatsnew");
    if (section) section.style.display = "none";
    return;
  }

  let index = 0;

  function slideTemplate(s) {
    const safeTag = s.tag ? `<span class="pp-whatsnew__tag">${escapeHtml(s.tag)}</span>` : "";
    return `
      <article class="pp-whatsnew__slide">
        <div class="pp-whatsnew__media">
          ${safeTag}
          <img src="${escapeAttr(s.image)}" alt="${escapeAttr(s.title)}">
        </div>
        <div class="pp-whatsnew__body">
          <h3 class="pp-whatsnew__title">${escapeHtml(s.title)}</h3>
          <p class="pp-whatsnew__subtitle">${escapeHtml(s.subtitle || "")}</p>
          <a class="pp-whatsnew__cta" href="${escapeAttr(s.href)}">${escapeHtml(s.cta || "Open")}</a>
        </div>
      </article>
    `;
  }

  function render() {
    track.innerHTML = data.map(slideTemplate).join("");

    if (dotsWrap) {
      // zostawiamy spany, jak wcześniej (zgodne z CSS)
      dotsWrap.innerHTML = data.map((_, i) =>
        `<span class="pp-whatsnew__dot ${i === index ? "is-active" : ""}"></span>`
      ).join("");
    }

    update();
  }

  function update() {
    const slide = track.querySelector(".pp-whatsnew__slide");
    if (!slide) return;

    // width of one "page" (slide + gap)
    const slideWidth = slide.getBoundingClientRect().width;

    // gap MUSI pasować do CSS (.pp-whatsnew__track gap)
    // Jeśli w CSS masz inny gap niż 12, zmień tutaj.
    const gap = 12;
    const x = (slideWidth + gap) * index;

    track.style.transform = `translateX(${-x}px)`;

    if (dotsWrap) {
      [...dotsWrap.children].forEach((d, i) => d.classList.toggle("is-active", i === index));
    }
  }

  function clampIndex(i) {
    return Math.max(0, Math.min(data.length - 1, i));
  }

  function prev() { index = clampIndex(index - 1); update(); }
  function next() { index = clampIndex(index + 1); update(); }

  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", next);

  // keyboard support
  viewport?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });

  // swipe support
  let startX = 0, startY = 0, dragging = false;

  viewport?.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    dragging = true;
  }, { passive: true });

  viewport?.addEventListener("touchend", (e) => {
    if (!dragging) return;
    dragging = false;

    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // ignore mostly-vertical swipes
    if (Math.abs(dy) > Math.abs(dx)) return;

    if (dx < -35) next();
    if (dx > 35) prev();
  }, { passive: true });

  window.addEventListener("resize", () => requestAnimationFrame(update));

  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function escapeAttr(str) { return escapeHtml(str); }

  render();
})();
