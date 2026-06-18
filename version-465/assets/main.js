window.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === current);
    });
  }

  if (slides.length) {
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide") || 0));
      });
    });
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  var input = document.getElementById("searchInput");
  var yearFilter = document.getElementById("yearFilter");
  var tagFilter = document.getElementById("tagFilter");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-list .movie-card"));

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function runFilter() {
    var text = normalize(input ? input.value : "");
    var year = normalize(yearFilter ? yearFilter.value : "");
    var tag = normalize(tagFilter ? tagFilter.value : "");
    cards.forEach(function (card) {
      var data = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.textContent
      ].join(" "));
      var okText = !text || data.indexOf(text) !== -1;
      var okYear = !year || normalize(card.getAttribute("data-year")) === year;
      var okTag = !tag || data.indexOf(tag) !== -1;
      card.classList.toggle("filter-hidden", !(okText && okYear && okTag));
    });
  }

  if (cards.length) {
    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
      input.addEventListener("input", runFilter);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", runFilter);
    }
    if (tagFilter) {
      tagFilter.addEventListener("change", runFilter);
    }
    runFilter();
  }
});
