(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  var toggle = qs("[data-menu-toggle]");
  var mobileNav = qs("[data-mobile-nav]");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var hero = qs("[data-hero]");
  if (hero) {
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  qsa("[data-filter-root]").forEach(function (panel) {
    var pageRoot = panel.parentElement || document;
    var input = qs("[data-filter-input]", panel);
    var yearSelect = qs("[data-filter-year]", panel);
    var empty = qs("[data-empty]", panel);
    var items = qsa("[data-movie-card]", pageRoot);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");

    if (input && initial) {
      input.value = initial;
    }

    function matchYear(item, yearValue) {
      if (!yearValue) return true;
      var year = Number(item.getAttribute("data-year") || "0");
      if (yearValue === "2020") return year <= 2020;
      return String(year) === yearValue;
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var yearValue = yearSelect ? yearSelect.value : "";
      var visible = 0;

      items.forEach(function (item) {
        var text = [
          item.getAttribute("data-title") || "",
          item.getAttribute("data-region") || "",
          item.getAttribute("data-year") || "",
          item.getAttribute("data-tags") || "",
          item.textContent || "",
        ]
          .join(" ")
          .toLowerCase();
        var ok =
          (!query || text.indexOf(query) !== -1) && matchYear(item, yearValue);
        item.hidden = !ok;
        if (ok) visible += 1;
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) input.addEventListener("input", applyFilter);
    if (yearSelect) yearSelect.addEventListener("change", applyFilter);
    applyFilter();
  });
})();
