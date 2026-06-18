(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isHidden = mobileNav.hasAttribute('hidden');
            if (isHidden) {
                mobileNav.removeAttribute('hidden');
                menuButton.setAttribute('aria-expanded', 'true');
                menuButton.textContent = '×';
            } else {
                mobileNav.setAttribute('hidden', '');
                menuButton.setAttribute('aria-expanded', 'false');
                menuButton.textContent = '☰';
            }
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
                dot.setAttribute('aria-selected', dotIndex === current ? 'true' : 'false');
            });
        };

        var start = function () {
            stop();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        var stop = function () {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        showSlide(0);
        start();
    }

    var filterForm = document.querySelector('[data-filter-form]');
    if (filterForm) {
        var searchInput = filterForm.querySelector('[data-filter-search]');
        var regionSelect = filterForm.querySelector('[data-filter-region]');
        var typeSelect = filterForm.querySelector('[data-filter-type]');
        var categorySelect = filterForm.querySelector('[data-filter-category]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var countNode = document.querySelector('[data-result-count]');
        var noResult = document.querySelector('[data-no-result]');
        var url = new URL(window.location.href);
        var queryValue = url.searchParams.get('q') || '';

        if (searchInput && queryValue) {
            searchInput.value = queryValue;
        }

        var normalize = function (value) {
            return String(value || '').trim().toLowerCase();
        };

        var applyFilter = function () {
            var query = normalize(searchInput ? searchInput.value : '');
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var category = categorySelect ? categorySelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardRegion = card.getAttribute('data-region') || '';
                var cardType = card.getAttribute('data-type') || '';
                var cardCategory = card.getAttribute('data-category') || '';
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (region && cardRegion !== region) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }
                if (category && cardCategory !== category) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = String(visible);
            }
            if (noResult) {
                noResult.classList.toggle('is-visible', visible === 0);
            }
        };

        [searchInput, regionSelect, typeSelect, categorySelect].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applyFilter);
                field.addEventListener('change', applyFilter);
            }
        });

        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        applyFilter();
    }
})();
