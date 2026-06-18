const select = (selector, scope = document) => scope.querySelector(selector);
const selectAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setupMenu() {
  const button = select("[data-menu-button]");
  const panel = select("[data-mobile-panel]");
  if (!button || !panel) return;
  button.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
  });
}

function setupHero() {
  const hero = select("[data-hero]");
  if (!hero) return;
  const slides = selectAll("[data-hero-slide]", hero);
  const dots = selectAll("[data-hero-dot]", hero);
  const thumbs = selectAll("[data-hero-thumb]", hero);
  const prev = select("[data-hero-prev]", hero);
  const next = select("[data-hero-next]", hero);
  let current = 0;
  let timer = null;

  const show = (index) => {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === current));
    dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === current));
    thumbs.forEach((thumb, thumbIndex) => thumb.classList.toggle("is-active", thumbIndex === current));
  };

  const restart = () => {
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => show(current + 1), 5000);
  };

  prev?.addEventListener("click", () => {
    show(current - 1);
    restart();
  });

  next?.addEventListener("click", () => {
    show(current + 1);
    restart();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      show(Number(dot.dataset.heroDot || 0));
      restart();
    });
  });

  thumbs.forEach((thumb) => {
    thumb.addEventListener("mouseenter", () => {
      show(Number(thumb.dataset.heroThumb || 0));
      restart();
    });
  });

  show(0);
  restart();
}

function setupSearchForms() {
  selectAll("[data-search-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const target = form.dataset.searchUrl || form.getAttribute("action") || "search.html";
      const query = input?.value.trim() || "";
      const url = query ? `${target}?q=${encodeURIComponent(query)}` : target;
      window.location.href = url;
    });
  });
}

function setupCardFilters() {
  selectAll("[data-filter-scope]").forEach((scope) => {
    const input = select("[data-card-filter]", scope);
    const year = select("[data-year-filter]", scope);
    const type = select("[data-type-filter]", scope);
    const list = select("[data-card-list]");
    const cards = list ? selectAll("[data-movie-card]", list) : [];
    const count = select("[data-filter-count]", scope);
    const empty = select("[data-empty-state]");

    const apply = () => {
      const keyword = (input?.value || "").trim().toLowerCase();
      const yearValue = year?.value || "";
      const typeValue = type?.value || "";
      let visible = 0;

      cards.forEach((card) => {
        const matchesKeyword = !keyword || (card.dataset.search || "").includes(keyword);
        const matchesYear = !yearValue || card.dataset.year === yearValue;
        const matchesType = !typeValue || card.dataset.type === typeValue;
        const shouldShow = matchesKeyword && matchesYear && matchesType;
        card.hidden = !shouldShow;
        if (shouldShow) visible += 1;
      });

      if (count) count.textContent = `已显示 ${visible} 部`;
      if (empty) empty.hidden = visible !== 0;
    };

    input?.addEventListener("input", apply);
    year?.addEventListener("change", apply);
    type?.addEventListener("change", apply);
    apply();
  });
}

function cardTemplate(movie) {
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  const searchText = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, ...(movie.tags || [])].join(" ").toLowerCase();
  return `
      <article class="movie-card movie-card-small" data-movie-card data-title="${escapeHtml(movie.title)}" data-year="${escapeHtml(movie.year)}" data-type="${escapeHtml(movie.type)}" data-category="${escapeHtml(movie.category)}" data-search="${escapeHtml(searchText)}">
        <a class="movie-poster" href="${escapeHtml(movie.url)}" aria-label="观看${escapeHtml(movie.title)}" style="background-image: url('${escapeHtml(movie.image)}');">
          <span class="year-badge">${escapeHtml(movie.year)}</span>
          <span class="poster-shade"></span>
          <span class="play-bubble">▶</span>
          <span class="poster-meta">${escapeHtml(movie.region)}</span>
        </a>
        <div class="movie-card-body">
          <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
          <p>${escapeHtml(movie.oneLine)}</p>
          <div class="movie-meta-line">
            <a href="${escapeHtml(movie.categoryUrl)}">${escapeHtml(movie.category)}</a>
            <span>${escapeHtml(movie.genre)}</span>
          </div>
          <div class="tag-row">${tags}</div>
        </div>
      </article>`;
}

async function setupSearchPage() {
  const page = select("[data-search-page]");
  if (!page) return;
  const input = select("[data-site-search-input]", page);
  const year = select("[data-site-year]", page);
  const type = select("[data-site-type]", page);
  const category = select("[data-site-category]", page);
  const results = select("[data-site-results]", page);
  const count = select("[data-site-count]", page);
  const empty = select("[data-site-empty]", page);
  const params = new URLSearchParams(window.location.search);
  const dataUrl = new URL("../data/search-index.json", import.meta.url);
  const response = await fetch(dataUrl);
  const movies = await response.json();

  if (params.has("q") && input) input.value = params.get("q") || "";
  if (params.has("year") && year) year.value = params.get("year") || "";
  if (params.has("type") && type) type.value = params.get("type") || "";
  if (params.has("category") && category) category.value = params.get("category") || "";

  const apply = () => {
    const keyword = (input?.value || "").trim().toLowerCase();
    const yearValue = year?.value || "";
    const typeValue = type?.value || "";
    const categoryValue = category?.value || "";
    const matched = movies.filter((movie) => {
      const haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.oneLine, ...(movie.tags || [])].join(" ").toLowerCase();
      return (!keyword || haystack.includes(keyword)) &&
        (!yearValue || String(movie.year) === yearValue) &&
        (!typeValue || movie.type === typeValue) &&
        (!categoryValue || movie.category === categoryValue);
    }).slice(0, 240);

    if (results) results.innerHTML = matched.map(cardTemplate).join("");
    if (count) count.textContent = `已显示 ${matched.length} 部`;
    if (empty) empty.hidden = matched.length !== 0;
  };

  input?.addEventListener("input", apply);
  year?.addEventListener("change", apply);
  type?.addEventListener("change", apply);
  category?.addEventListener("change", apply);
  apply();
}

setupMenu();
setupHero();
setupSearchForms();
setupCardFilters();
setupSearchPage();
