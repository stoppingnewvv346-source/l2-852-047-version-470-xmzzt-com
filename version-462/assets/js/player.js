import { H as Hls } from "./hls-engine.js";

export function setupPlayer(config) {
  const video = document.querySelector("[data-video-player]");
  const overlay = document.querySelector("[data-play-overlay]");
  const loading = document.querySelector("[data-player-loading]");
  const error = document.querySelector("[data-player-error]");
  const source = config?.source;
  let hls = null;
  let attached = false;

  if (!video || !source) return;

  const showLoading = (value) => {
    if (loading) loading.hidden = !value;
  };

  const showError = (message) => {
    showLoading(false);
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
  };

  const attach = () => new Promise((resolve, reject) => {
    if (attached) {
      resolve();
      return;
    }

    attached = true;
    showLoading(true);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", () => {
        showLoading(false);
        resolve();
      }, { once: true });
      video.addEventListener("error", () => reject(new Error("播放暂时不可用，请稍后重试")), { once: true });
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        showLoading(false);
        resolve();
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (!data?.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        reject(new Error("播放暂时不可用，请稍后重试"));
      });
      return;
    }

    reject(new Error("当前浏览器无法播放该视频"));
  });

  const play = async () => {
    try {
      if (error) error.hidden = true;
      await attach();
      video.controls = true;
      if (overlay) overlay.hidden = true;
      await video.play();
    } catch (err) {
      if (overlay) overlay.hidden = false;
      showError(err?.message || "播放暂时不可用，请稍后重试");
    }
  };

  overlay?.addEventListener("click", play);
  video.addEventListener("click", () => {
    if (!attached || video.paused) {
      play();
    } else {
      video.pause();
    }
  });
  video.addEventListener("play", () => {
    if (overlay) overlay.hidden = true;
  });
  video.addEventListener("waiting", () => showLoading(true));
  video.addEventListener("playing", () => showLoading(false));
  window.addEventListener("pagehide", () => {
    if (hls) hls.destroy();
  });
}
