(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-list]').forEach(function (wrap) {
      var input = wrap.querySelector('[data-filter-input]');
      var category = wrap.querySelector('[data-filter-category]');
      var year = wrap.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(wrap.querySelectorAll('[data-card]'));
      var empty = wrap.querySelector('[data-empty-state]');

      function apply() {
        var keyword = normalize(input && input.value);
        var categoryValue = normalize(category && category.value);
        var yearValue = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardCategory = normalize(card.getAttribute('data-category'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (categoryValue && cardCategory !== categoryValue) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }

          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, category, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function initPlayers() {
    document.querySelectorAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('video');
      var cover = shell.querySelector('.player-cover');
      if (!video || !cover) {
        return;
      }

      var src = video.getAttribute('data-video');
      var started = false;
      var hls = null;

      function playVideo() {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }

      function start() {
        if (!src) {
          return;
        }
        shell.classList.add('is-playing');
        if (started) {
          playVideo();
          return;
        }
        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.load();
          playVideo();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          return;
        }

        video.src = src;
        video.load();
        playVideo();
      }

      cover.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initFilters();
    initPlayers();
  });
})();
