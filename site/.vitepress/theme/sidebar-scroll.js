// Keeps the active task visible in the desktop sidebar after each page change,
// so a jump from a route link or a search result also shows where that task sits in
// its module. Below 960px the sidebar is an off-canvas menu and is left alone.
// Respects reduced motion.

function scrollActiveItem() {
  if (!window.matchMedia("(min-width: 960px)").matches) return;
  const active = document.querySelector(".VPSidebar .VPSidebarItem.is-active > .item");
  if (!(active instanceof HTMLElement)) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  active.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
}

export function installSidebarScroll(router) {
  const after = router.onAfterRouteChange;
  router.onAfterRouteChange = async (href) => {
    await after?.(href);
    // Let the sidebar re-render and expand the active group first.
    window.setTimeout(() => window.requestAnimationFrame(scrollActiveItem), 0);
  };
  window.addEventListener("load", () => window.requestAnimationFrame(scrollActiveItem), { once: true });
}
