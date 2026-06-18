(function () {
  function bySelector(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  bySelector('.search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (input && input.value.trim()) {
        input.value = input.value.trim();
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = bySelector('.hero-slide', hero);
    var dots = bySelector('[data-hero-dot]', hero);
    var current = 0;
    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  bySelector('[data-filter-panel]').forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var type = panel.querySelector('[data-filter-type]');
    var reset = panel.querySelector('[data-filter-reset]');
    var list = panel.parentElement.querySelector('[data-filter-list]');
    var cards = list ? Array.prototype.slice.call(list.children) : [];
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query && input) {
      input.value = query;
    }
    function applyFilter() {
      var text = input ? input.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var okText = !text || haystack.indexOf(text) !== -1;
        var okType = !typeValue || cardType === typeValue;
        card.classList.toggle('hidden-by-filter', !(okText && okType));
      });
    }
    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (type) {
      type.addEventListener('change', applyFilter);
    }
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (type) {
          type.value = '';
        }
        applyFilter();
      });
    }
    applyFilter();
  });
})();

window.initVideoPlayer = function (source) {
  var shell = document.querySelector('.player-shell');
  if (!shell) {
    return;
  }
  var video = shell.querySelector('video');
  var cover = shell.querySelector('.player-cover');
  var hlsInstance = null;
  function bindSource() {
    if (!video || video.getAttribute('data-ready') === '1') {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
    video.setAttribute('data-ready', '1');
  }
  function playVideo() {
    bindSource();
    shell.classList.add('is-playing');
    if (video) {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
  }
  if (cover) {
    cover.addEventListener('click', playVideo);
  }
  if (video) {
    video.addEventListener('click', function () {
      bindSource();
    });
  }
  window.addEventListener('pagehide', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
    }
  });
};
