(function () {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var trigger = document.querySelector('[data-player-trigger]');
    var message = document.querySelector('[data-player-message]');

    if (!video) {
        return;
    }

    var source = video.getAttribute('data-source');
    var attached = false;
    var hlsInstance = null;

    var setMessage = function (text) {
        if (message) {
            message.textContent = text || '';
        }
    };

    var loadScript = function (src) {
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[src="' + src + '"]');
            if (existing) {
                existing.addEventListener('load', resolve);
                existing.addEventListener('error', reject);
                return;
            }

            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    var attachSource = function () {
        if (attached) {
            return Promise.resolve();
        }

        if (!source) {
            setMessage('当前影片暂时无法播放');
            return Promise.reject(new Error('empty source'));
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            attached = true;
            return Promise.resolve();
        }

        var attachWithHls = function () {
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                attached = true;
                return Promise.resolve();
            }

            video.src = source;
            attached = true;
            return Promise.resolve();
        };

        if (window.Hls) {
            return attachWithHls();
        }

        return loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest')
            .then(attachWithHls)
            .catch(function () {
                video.src = source;
                attached = true;
            });
    };

    var hideOverlay = function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    };

    var showOverlay = function () {
        if (overlay && video.paused) {
            overlay.classList.remove('is-hidden');
        }
    };

    var playVideo = function () {
        setMessage('');
        attachSource()
            .then(function () {
                return video.play();
            })
            .then(hideOverlay)
            .catch(function () {
                setMessage('点击视频控件继续播放');
            });
    };

    if (trigger) {
        trigger.addEventListener('click', playVideo);
    }

    if (overlay) {
        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                playVideo();
            }
        });
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', showOverlay);
    video.addEventListener('ended', showOverlay);
    video.addEventListener('error', function () {
        setMessage('当前网络环境下播放失败，请稍后再试');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
