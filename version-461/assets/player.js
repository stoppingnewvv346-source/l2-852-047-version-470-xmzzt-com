(function () {
  function mount(root) {
    var video = root.querySelector("video");
    var overlay = root.querySelector("[data-play-start]");
    var errorBox = root.querySelector("[data-player-error]");
    var stream = root.getAttribute("data-stream");
    var attached = false;
    var hls = null;

    function showError(message) {
      if (!errorBox) return;
      errorBox.textContent = message || "播放暂时不可用，请稍后重试。";
      errorBox.hidden = false;
    }

    function attachStream() {
      if (attached || !video || !stream) return;
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showError("播放暂时不可用，请稍后重试。");
          }
        });
        return;
      }

      showError("播放暂时不可用，请稍后重试。");
    }

    function hideOverlay() {
      if (overlay) overlay.classList.add("is-hidden");
    }

    function showOverlay() {
      if (overlay) overlay.classList.remove("is-hidden");
    }

    function playVideo() {
      attachStream();
      hideOverlay();
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          showOverlay();
        });
      }
    }

    if (!video || !stream) return;

    if (overlay) {
      overlay.addEventListener("click", function () {
        playVideo();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", function () {
      if (!video.ended) showOverlay();
    });
    video.addEventListener("ended", showOverlay);

    document.addEventListener("keydown", function (event) {
      var tag = (
        (document.activeElement && document.activeElement.tagName) ||
        ""
      ).toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (event.code === "Space") {
        event.preventDefault();
        if (video.paused) playVideo();
        else video.pause();
      }
      if (event.key && event.key.toLowerCase() === "m") {
        video.muted = !video.muted;
      }
      if (event.key && event.key.toLowerCase() === "f") {
        if (document.fullscreenElement) document.exitFullscreen();
        else root.requestFullscreen();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) hls.destroy();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-player]"),
      mount,
    );
  });
})();
