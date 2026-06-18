(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var menuButton = document.getElementById("mobileMenuButton");
        var mobilePanel = document.getElementById("mobilePanel");

        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                mobilePanel.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var activeIndex = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === activeIndex);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === activeIndex);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5600);
        }

        var searchInput = document.getElementById("siteSearchInput");
        var yearFilter = document.getElementById("yearFilter");
        var regionFilter = document.getElementById("regionFilter");
        var genreFilter = document.getElementById("genreFilter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            if (!cards.length) {
                return;
            }

            var keyword = normalize(searchInput ? searchInput.value : "");
            var year = normalize(yearFilter ? yearFilter.value : "");
            var region = normalize(regionFilter ? regionFilter.value : "");
            var genre = normalize(genreFilter ? genreFilter.value : "");

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-keywords") || card.textContent);
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardGenre = normalize(card.getAttribute("data-genre"));

                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }
                if (region && cardRegion !== region) {
                    matched = false;
                }
                if (genre && cardGenre.indexOf(genre) === -1) {
                    matched = false;
                }

                card.classList.toggle("is-hidden", !matched);
            });
        }

        if (searchInput || yearFilter || regionFilter || genreFilter) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && searchInput) {
                searchInput.value = q;
            }

            [searchInput, yearFilter, regionFilter, genreFilter].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });
            applyFilters();
        }
    });
})();

function initMoviePlayer(videoId, overlayId, videoUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var loaded = false;
    var player = null;

    if (!video || !overlay || !videoUrl) {
        return;
    }

    function attachVideo() {
        if (loaded) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            player = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            player.loadSource(videoUrl);
            player.attachMedia(video);
        } else {
            video.src = videoUrl;
        }

        loaded = true;
    }

    function startPlayback() {
        attachVideo();
        overlay.classList.add("is-hidden");
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    overlay.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
        if (!loaded || video.paused) {
            startPlayback();
        } else {
            video.pause();
        }
    });

    window.addEventListener("pagehide", function () {
        if (player && typeof player.destroy === "function") {
            player.destroy();
        }
    });
}
