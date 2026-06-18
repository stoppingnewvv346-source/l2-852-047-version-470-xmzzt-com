function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
        callback();
    }
}

function setupMenu() {
    const button = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
        return;
    }
    button.addEventListener("click", () => {
        menu.classList.toggle("open");
    });
}

function setupHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
        return;
    }
    let index = 0;
    let timer = 0;
    const show = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, position) => {
            slide.classList.toggle("active", position === index);
        });
        dots.forEach((dot, position) => {
            dot.classList.toggle("active", position === index);
        });
    };
    const start = () => {
        clearInterval(timer);
        timer = window.setInterval(() => show(index + 1), 5600);
    };
    dots.forEach((dot, position) => {
        dot.addEventListener("click", () => {
            show(position);
            start();
        });
    });
    prev && prev.addEventListener("click", () => {
        show(index - 1);
        start();
    });
    next && next.addEventListener("click", () => {
        show(index + 1);
        start();
    });
    hero.addEventListener("mouseenter", () => clearInterval(timer));
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
}

function normalize(value) {
    return String(value || "").trim().toLowerCase();
}

function filterCards(input) {
    const scope = input.closest("main") || document;
    const list = scope.querySelector("[data-filter-list]") || document;
    const cards = Array.from(list.querySelectorAll(".movie-card-item"));
    const apply = () => {
        const keywords = normalize(input.value).split(/\s+/).filter(Boolean);
        cards.forEach((card) => {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.tags,
                card.textContent
            ].join(" "));
            const visible = keywords.every((keyword) => haystack.includes(keyword));
            card.classList.toggle("is-filtered-out", !visible);
        });
    };
    input.addEventListener("input", apply);
    apply();
}

function setupFilters() {
    const inputs = Array.from(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach((input) => filterCards(input));
    const queryInput = document.querySelector("[data-query-input]");
    if (queryInput) {
        const params = new URLSearchParams(window.location.search);
        const value = params.get("q");
        if (value) {
            queryInput.value = value;
            queryInput.dispatchEvent(new Event("input"));
        }
    }
}

export async function initPlayer(source) {
    const video = document.querySelector("[data-player]");
    const overlay = document.querySelector(".play-overlay");
    if (!video || !source) {
        return;
    }
    let loaded = false;
    let loading = null;
    const loadStream = async () => {
        if (loaded) {
            return;
        }
        if (loading) {
            return loading;
        }
        loading = (async () => {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.load();
                loaded = true;
                return;
            }
            try {
                const module = await import("./hls.js");
                const Hls = module.H;
                if (Hls && Hls.isSupported()) {
                    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    await new Promise((resolve) => {
                        const done = () => resolve();
                        hls.on(Hls.Events.MANIFEST_PARSED, done);
                        window.setTimeout(done, 1600);
                    });
                    loaded = true;
                    return;
                }
            } catch (error) {
                loaded = false;
            }
            video.src = source;
            video.load();
            loaded = true;
        })();
        return loading;
    };
    const play = async () => {
        await loadStream();
        overlay && overlay.classList.add("is-hidden");
        try {
            await video.play();
        } catch (error) {
            overlay && overlay.classList.remove("is-hidden");
        }
    };
    overlay && overlay.addEventListener("click", play);
    video.addEventListener("click", () => {
        if (video.paused) {
            play();
        }
    });
}

ready(() => {
    setupMenu();
    setupHero();
    setupFilters();
});
