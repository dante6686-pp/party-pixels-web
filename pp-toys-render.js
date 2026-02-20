// pp-toys-render.js
(function () {
  let allToys = [];
  let currentFilter = "all";    // all | game | generator
  let currentSort = "date";    // alpha | date

  function parseDate(value) {
    if (!value) return 0;
    const t = Date.parse(value);
    return isNaN(t) ? 0 : t;
  }

  function getFilteredSortedToys() {
    let toys = [...allToys];

    // FILTER
    if (currentFilter === "game") {
      toys = toys.filter(t => (t.type || "").toLowerCase() === "game");
    } else if (currentFilter === "generator") {
      toys = toys.filter(t => (t.type || "").toLowerCase() === "generator");
    }

    // SORT
    if (currentSort === "alpha") {
      toys.sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSort === "date") {
      // najnowsze na górze
      toys.sort((a, b) => parseDate(b.added) - parseDate(a.added));
    }

    return toys;
  }

  function renderToys() {
    const grid = document.getElementById("toy-grid");
    if (!grid) return;

    const toys = getFilteredSortedToys();
    const frag = document.createDocumentFragment();

    toys.forEach(toy => {
      const article = document.createElement("article");
      article.className = "toy-card";

      // STATUS
      let statusClass = "toy-status";
      let statusLabel = "Live";

      if (toy.status === "soon") {
        statusClass += " toy-status-soon";
        statusLabel = "Soon";
      } else if (toy.status === "dev") {
        statusClass += " toy-status-soon";
        statusLabel = "In dev";
      }

      // LINK
      const hasLink = !!toy.href;
      const linkClass = hasLink ? "toy-link" : "toy-link disabled";
      const href = hasLink ? toy.href : "#";

      // TAGS
      const tagsHtml = (toy.tags || [])
        .map(t => `<span class="toy-tag">${t}</span>`)
        .join("");

      // BUDUJEMY HTML KARTY – gradient siedzi w CSS .toy-card
      let html = "";

      // THUMB (opcjonalny)
      if (toy.thumb) {
        html += `
          <div class="toy-thumb" style="background-image: url('${toy.thumb}');"></div>
        `;
      }

      html += `
        <div class="toy-label-row">
          <span class="toy-type-pill">${toy.type || "Toy"}</span>
          <span class="${statusClass}">${statusLabel}</span>
        </div>

        <h3 class="toy-title">${toy.title}</h3>

        <p class="toy-desc">
          ${toy.desc || ""}
        </p>

        <div class="toy-footer">
          <div class="toy-tags">
            ${tagsHtml}
          </div>
          <a class="${linkClass}" href="${href}">
            <span>${hasLink ? "Open toy →" : "Coming soon"}</span>
          </a>
        </div>
      `;

      article.innerHTML = html;
      frag.appendChild(article);
    });

    grid.innerHTML = "";
    grid.appendChild(frag);
  }

  async function loadToys() {
    try {
      const res = await fetch("/pp-toys.json");
      allToys = await res.json();
      renderToys();
    } catch (err) {
      console.error("Error loading toys:", err);
      const grid = document.getElementById("toy-grid");
      if (grid) {
        grid.innerHTML = "<p style='font-size:12px;color:#f88;'>Failed to load toys.</p>";
      }
    }
  }

  function initControls() {
    const filterButtons = document.querySelectorAll(".toy-filter-btn");
    const sortSelect = document.getElementById("toy-sort");

    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const value = btn.getAttribute("data-filter");
        currentFilter = value || "all";

        filterButtons.forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        renderToys();
      });
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        currentSort = sortSelect.value || "alpha";
        renderToys();
      });
    }
  }

  function init() {
    initControls();
    loadToys();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
