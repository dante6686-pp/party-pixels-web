// updates.js
(function () {
  const ALL = Array.isArray(window.PP_WHATS_NEW) ? window.PP_WHATS_NEW : [];
  const PER_PAGE = 15;

  const listEl = document.getElementById("ppUpdatesAll");
  const pagerEl = document.getElementById("ppPager");
  const summaryEl = document.getElementById("ppUpdatesSummary");

  function esc(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getPageFromUrl() {
    const url = new URL(window.location.href);
    const n = Number(url.searchParams.get("page") || "1");
    if (!Number.isFinite(n) || n < 1) return 1;
    return Math.floor(n);
  }

  function setPageInUrl(page) {
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(page));
    history.replaceState({}, "", url.toString());
  }

  function renderList(items) {
    if (!listEl) return;

    listEl.innerHTML = items.map(item => {
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

  function renderPager(page, totalPages) {
    if (!pagerEl) return;

    const mkBtn = (label, target, disabled, active) => {
      if (disabled) {
        return `<button disabled type="button">${label}</button>`;
      }
      const cls = active ? "is-active" : "";
      return `<button type="button" class="${cls}" data-page="${target}">${label}</button>`;
    };

    // trochę “mądre” numerki: pokazuj max ~7 stron wokół
    const windowSize = 7;
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    let html = "";
    html += mkBtn("Prev", page - 1, page <= 1, false);

    if (start > 1) {
      html += mkBtn("1", 1, false, page === 1);
      if (start > 2) html += `<span style="opacity:.6; padding:0 4px;">…</span>`;
    }

    for (let p = start; p <= end; p++) {
      html += mkBtn(String(p), p, false, p === page);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) html += `<span style="opacity:.6; padding:0 4px;">…</span>`;
      html += mkBtn(String(totalPages), totalPages, false, page === totalPages);
    }

    html += mkBtn("Next", page + 1, page >= totalPages, false);

    pagerEl.innerHTML = html;

    pagerEl.querySelectorAll("[data-page]").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = Number(btn.getAttribute("data-page"));
        if (!target) return;
        goToPage(target);
      });
    });
  }

  function goToPage(page) {
    const totalPages = Math.max(1, Math.ceil(ALL.length / PER_PAGE));
    const safe = Math.min(Math.max(1, page), totalPages);

    setPageInUrl(safe);

    const start = (safe - 1) * PER_PAGE;
    const items = ALL.slice(start, start + PER_PAGE);

    if (summaryEl) {
      const from = ALL.length ? start + 1 : 0;
      const to = Math.min(start + PER_PAGE, ALL.length);
      summaryEl.textContent = `${ALL.length} total • showing ${from}–${to}`;
    }

    renderList(items);
    renderPager(safe, totalPages);

    // scroll do góry listy (bez skakania jak pojebane)
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // boot
  goToPage(getPageFromUrl());
})();
