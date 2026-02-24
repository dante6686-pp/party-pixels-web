// /js/whatsnew.js
(function () {
  const data = window.PP_WHATS_NEW || [];
  const track = document.getElementById("ppWhatsNewTrack");
  const dotsWrap = document.getElementById("ppWhatsNewDots");
  const prevBtn = document.getElementById("ppWhatsNewPrev");
  const nextBtn = document.getElementById("ppWhatsNewNext");
  const viewport = document.getElementById("ppWhatsNewViewport");

  if (!track || data.length === 0) return;

  let index = 0;

  function slideTemplate(s) {
    const safeTag = s.tag ? `<span class="pp-whatsnew__tag">${escapeHtml(s.tag)}</span>` : "";
    return `
      <article class="pp-whatsnew__slide">
        <div class="pp-whatsnew__media">
          ${safeTag}
          <img src="${s.image}" alt="${escapeAttr(s.title)}">
        </div>
        <div class="pp-whatsnew__body">
          <h3 class="pp-whatsnew__title">${escapeHtml(s.title)}</h3>
          <p class="pp-whatsnew__subtitle">${escapeHtml(s.subtitle || "")}</p>
          <a class="pp-whatsnew__cta" href="${s.href}">${escapeHtml(s.cta || "Open")}</a>
        </div>
      </article>
    `;
  }

  function render() {
    track.innerHTML = data.map(slideTemplate).join("");
    dotsWrap.innerHTML = data.map((_, i) =>
      `<span class="pp-whatsnew__dot ${i === index ? "is-active" : ""}"></span>`
    ).join("");
    update();
  }

  function update() {
    const slide = track.querySelector(".pp-whatsnew__slide");
    if (!slide) return;

    // width of one "page" (slide + gap)
    const slideWidth = slide.getBoundingClientRect().width;
    const gap = 12; // must match CSS gap
    const x = (slideWidth + gap) * index;

    track.style.transform = `translateX(${-x}px)`;
    [...dotsWrap.children].forEach((d, i) => d.classList.toggle("is-active", i === index));
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

  // handle resize
  window.addEventListener("resize", () => requestAnimationFrame(update));

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function escapeAttr(str) { return escapeHtml(str); }

  render();
})();
