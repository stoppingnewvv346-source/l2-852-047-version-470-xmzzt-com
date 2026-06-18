(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var year = scope.querySelector("[data-year-filter]");
            var items = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-list] > article"));
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";
            if (input && q) {
                input.value = q;
            }

            function run() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                items.forEach(function (item) {
                    var text = (item.getAttribute("data-keywords") || item.textContent || "").toLowerCase();
                    var itemYear = item.getAttribute("data-year") || text;
                    var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var okYear = !yearValue || itemYear.indexOf(yearValue) !== -1;
                    item.style.display = okKeyword && okYear ? "" : "none";
                });
            }

            if (input) {
                input.addEventListener("input", run);
            }
            if (year) {
                year.addEventListener("change", run);
            }
            run();
        });
    }

    function mountPlayer(videoId, coverId, url) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        if (!video || !cover || !url) {
            return;
        }
        var started = false;
        var hls = null;

        function reveal() {
            cover.classList.add("is-hidden");
        }

        function restore() {
            if (!video.paused) {
                return;
            }
            cover.classList.remove("is-hidden");
        }

        function playNow() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    cover.classList.remove("is-hidden");
                });
            }
        }

        function attach() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playNow();
                });
            } else {
                video.src = url;
            }
        }

        function start() {
            reveal();
            attach();
            playNow();
        }

        cover.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!started || video.paused) {
                start();
            }
        });
        video.addEventListener("pause", restore);
        video.addEventListener("play", reveal);
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.MoviePlayer = {
        mount: mountPlayer
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
