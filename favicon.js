document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("bad-apple-video");
  const favicon = document.getElementById("favicon");

  if (!(video instanceof HTMLVideoElement) || !(favicon instanceof HTMLLinkElement)) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return;
  }

  function updateFavicon() {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = frame;

      for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const luma = 0.299 * red + 0.587 * green + 0.114 * blue;
        const value = luma < 128 ? 0 : 255;

        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 255;
      }

      context.putImageData(frame, 0, 0);
      favicon.href = canvas.toDataURL("image/png");
    }

    requestAnimationFrame(updateFavicon);
  }

  video.addEventListener("canplay", () => {
    video.play().catch(() => {
      // Muted video should autoplay in modern browsers; ignore if a browser blocks it.
    });
    requestAnimationFrame(updateFavicon);
  }, { once: true });

  video.addEventListener("ended", () => {
    video.currentTime = 0;
    video.play().catch(() => {
      // Retry is best-effort if playback was interrupted by browser policy.
    });
  });

  video.load();
});
