(function () {
  const nativeCursorSelector = [
    "button",
    "a",
    "input",
    "select",
    "textarea",
    "[role='button']",
    ".ol-control"
  ].join(",");

  const textHoverSelector = [
    ".launch-screen h1",
    ".launch-screen h2",
    ".launch-screen p",
    ".launch-screen span",
    ".launch-screen strong",
    ".launch-screen label"
  ].join(",");

  function setupLaunchCursor() {
    const cursor = document.getElementById("custom-cursor");
    const launch = document.getElementById("launch-screen");
    if (!cursor || !launch || !window.matchMedia("(pointer: fine)").matches) return;

    document.body.classList.add("has-custom-cursor");

    let x = -80;
    let y = -80;
    let raf = null;

    function draw() {
      cursor.style.transform = `translate3d(${x - cursor.offsetWidth / 2}px, ${y - cursor.offsetHeight / 2}px, 0)`;
      raf = null;
    }

    function requestDraw() {
      if (!raf) raf = window.requestAnimationFrame(draw);
    }

    function updateHoverState(target) {
      const isLaunchVisible = document.body.classList.contains("is-launching");
      const nativeTarget = target.closest(nativeCursorSelector);
      const textTarget = target.closest(textHoverSelector);

      document.body.classList.toggle("cursor-native", isLaunchVisible && Boolean(nativeTarget));
      document.body.classList.toggle("cursor-over-text", isLaunchVisible && !nativeTarget && Boolean(textTarget));
    }

    window.addEventListener("pointermove", (event) => {
      x = event.clientX;
      y = event.clientY;
      const isLaunchVisible = document.body.classList.contains("is-launching");
      document.body.classList.toggle("cursor-visible", isLaunchVisible);
      if (isLaunchVisible && event.target instanceof Element) {
        updateHoverState(event.target);
      }
      requestDraw();
    }, { passive: true });

    window.addEventListener("pointerleave", () => {
      document.body.classList.remove("cursor-visible", "cursor-over-text", "cursor-native");
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        document.body.classList.remove("cursor-visible", "cursor-over-text", "cursor-native");
      }
    });

    document.addEventListener("click", () => {
      if (!document.body.classList.contains("is-launching")) {
        document.body.classList.remove("cursor-visible", "cursor-over-text", "cursor-native");
      }
    });
  }

  window.addEventListener("DOMContentLoaded", setupLaunchCursor);
})();
