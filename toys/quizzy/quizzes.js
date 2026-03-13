const quizzes = [
  {
    id: "am-i-the-problem",
    title: "Am I The Problem?",
    desc: "A chaotic personality quiz for people who may or may not be the source of all emotional damage.",
    href: "/quiz/am-i-the-problem.html",
    image: "/media/am-i-the-problem-splash.png",
    category: "personality",
    tags: ["chaos", "personality", "friends"],
    featured: true,
    questions: 10,
    estTime: "2 min"
  },
  {
    id: "annoying-friend-test",
    title: "Are You the Annoying Friend?",
    desc: "Find out whether you're lovable chaos, mildly irritating, or an actual group chat threat.",
    href: "/quiz/annoying-friend-test.html",
    image: "/media/annoying-friend-test-splash.png",
    category: "friends",
    tags: ["friends", "chaos", "meme"],
    featured: false,
    questions: 9,
    estTime: "2 min"
  },
  {
    id: "internet-brainrot-level",
    title: "Internet Brainrot Level Test",
    desc: "Measure the structural damage caused by memes, timelines, doomscrolling, and cursed online culture.",
    href: "/quiz/internet-brainrot-level.html",
    image: "/media/internet-brainrot-level-splash.png",
    category: "meme",
    tags: ["meme", "chaos", "personality"],
    featured: false,
    questions: 12,
    estTime: "3 min"
  },
  {
    id: "how-chaotic-are-you",
    title: "How Chaotic Are You?",
    desc: "A very serious digital exam that determines whether you're stable, feral, or legally unpredictable.",
    href: "/quiz/how-chaotic-are-you.html",
    image: "/media/how-chaotic-are-you-splash.png",
    category: "chaos",
    tags: ["chaos", "personality"],
    featured: false,
    questions: 8,
    estTime: "2 min"
  },
  {
    id: "toxity-check",
    title: "Toxicity Check",
    desc: "Are you healthy, messy, manipulative, or just accidentally impossible to deal with?",
    href: "/quiz/toxicity-check.html",
    image: "/media/toxicity-check-splash.png",
    category: "dating",
    tags: ["dating", "personality", "chaos"],
    featured: false,
    questions: 11,
    estTime: "3 min"
  },
  {
    id: "red-flag-detector",
    title: "Red Flag Detector",
    desc: "Judge suspicious behavior, bad texts, mixed signals, and painfully obvious disaster energy.",
    href: "/quiz/red-flag-detector.html",
    image: "/media/red-flag-detector-splash.png",
    category: "dating",
    tags: ["dating", "meme", "friends"],
    featured: false,
    questions: 10,
    estTime: "2 min"
  }
];

const quizGrid = document.getElementById("quiz-grid");
const featuredQuiz = document.getElementById("featured-quiz");
const searchInput = document.getElementById("quiz-search");
const tagFilters = document.getElementById("tag-filters");
const quizCount = document.getElementById("quiz-count");
const resultsCount = document.getElementById("results-count");
const emptyState = document.getElementById("empty-state");

let activeTag = "all";
let searchTerm = "";

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (match) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return map[match];
  });
}

function renderFeaturedQuiz(items) {
  const featured = items.find((quiz) => quiz.featured) || items[0];

  if (!featured) {
    featuredQuiz.innerHTML = "";
    featuredQuiz.classList.add("is-hidden");
    return;
  }

  featuredQuiz.classList.remove("is-hidden");
  featuredQuiz.innerHTML = `
    <div class="featured-quiz__inner">
      <div class="featured-quiz__media">
        <img src="${featured.image}" alt="${escapeHtml(featured.title)} thumbnail" loading="lazy">
      </div>

      <div class="featured-quiz__body">
        <span class="featured-badge">FEATURED QUIZ</span>
        <h2>${escapeHtml(featured.title)}</h2>
        <p>${escapeHtml(featured.desc)}</p>

        <div class="quiz-meta">
          <span class="quiz-pill">${featured.questions} questions</span>
          <span class="quiz-pill">${featured.estTime}</span>
          ${featured.tags.map(tag => `<span class="quiz-pill">#${escapeHtml(tag)}</span>`).join("")}
        </div>

        <div class="hero-actions">
          <a class="pp-btn pp-btn--primary" href="${featured.href}">Play Quiz</a>
          <a class="pp-btn pp-btn--ghost" href="#quiz-grid">See More</a>
        </div>
      </div>
    </div>
  `;
}

function renderQuizCards(items) {
  if (!items.length) {
    quizGrid.innerHTML = "";
    emptyState.classList.remove("is-hidden");
    resultsCount.textContent = "Showing 0 quizzes";
    return;
  }

  emptyState.classList.add("is-hidden");
  resultsCount.textContent = `Showing ${items.length} quiz${items.length === 1 ? "" : "zes"}`;

  quizGrid.innerHTML = items.map((quiz) => `
    <article class="quiz-card">
      <div class="quiz-card__thumb">
        <img src="${quiz.image}" alt="${escapeHtml(quiz.title)} thumbnail" loading="lazy">
      </div>

      <div class="quiz-card__body">
        <div class="quiz-card__top">
          <h3>${escapeHtml(quiz.title)}</h3>
        </div>

        <p class="quiz-card__desc">${escapeHtml(quiz.desc)}</p>

        <div class="quiz-meta">
          <span class="quiz-pill">${quiz.questions} questions</span>
          <span class="quiz-pill">${quiz.estTime}</span>
        </div>

        <div class="quiz-card__tags">
          ${quiz.tags.map(tag => `<span class="quiz-tag">${escapeHtml(tag)}</span>`).join("")}
        </div>

        <div class="quiz-card__actions">
          <a class="quiz-link quiz-link--primary" href="${quiz.href}">Play</a>
          <a class="quiz-link quiz-link--secondary" href="${quiz.href}">Details</a>
        </div>
      </div>
    </article>
  `).join("");
}

function getFilteredQuizzes() {
  return quizzes.filter((quiz) => {
    const matchesTag =
      activeTag === "all" ||
      quiz.tags.includes(activeTag) ||
      quiz.category === activeTag;

    const haystack = `
      ${quiz.title}
      ${quiz.desc}
      ${quiz.category}
      ${quiz.tags.join(" ")}
    `.toLowerCase();

    const matchesSearch = haystack.includes(searchTerm.toLowerCase());

    return matchesTag && matchesSearch;
  });
}

function renderAll() {
  const filtered = getFilteredQuizzes();
  renderFeaturedQuiz(filtered.length ? filtered : quizzes);
  renderQuizCards(filtered);
  quizCount.textContent = quizzes.length;
}

function handleTagFilterClick(event) {
  const button = event.target.closest("[data-tag]");
  if (!button) return;

  activeTag = button.dataset.tag;

  document.querySelectorAll(".tag-filter").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.tag === activeTag);
  });

  renderAll();
}

function handleSearchInput(event) {
  searchTerm = event.target.value.trim();
  renderAll();
}

if (tagFilters) {
  tagFilters.addEventListener("click", handleTagFilterClick);
}

if (searchInput) {
  searchInput.addEventListener("input", handleSearchInput);
}

renderAll();

function shuffleArray(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}
