// Theme bootstrap: runs before first paint so there is no flash of the wrong
// theme. Mirrors src/contexts/ThemeContext.tsx (localStorage "theme":
// light | dark | system). Kept as a file, not inline, so the CSP can stay
// script-src 'self'.
(function () {
  try {
    var pref = localStorage.getItem("theme") || "system";
    var dark =
      pref === "dark" ||
      (pref !== "light" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    var root = document.documentElement;
    root.classList.add(dark ? "dark" : "light");
    root.style.colorScheme = dark ? "dark" : "light";
    if (pref !== "system") {
      var metas = document.querySelectorAll('meta[name="theme-color"]');
      for (var i = 0; i < metas.length; i++) {
        metas[i].setAttribute("content", dark ? "#1D2824" : "#F6F1E6");
      }
    }
  } catch (e) {}
})();
