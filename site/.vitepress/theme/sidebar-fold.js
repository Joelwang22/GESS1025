// Motion for the desktop sidebar fold. Elements whose place depends on the
// sidebar column take their new place in one reflow, and a transform then
// carries them there from where they were drawn (FLIP), so the reading column
// glides instead of jumping and no layout property is animated per frame.

export const FOLD_FOLLOWERS = ".VPDoc .container > .content, .VPDoc .aside-container, .VPLocalNav .container";

// The build minifies "220ms" to ".22s", so both units are read.
export function toMilliseconds(time) {
  const value = String(time ?? "").trim();
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) return 0;
  if (value.endsWith("ms")) return amount;
  if (value.endsWith("s")) return amount * 1000;
  return amount;
}

// The sidebar, the nav bar surface and the column share the --rb-fold-*
// tokens from tokens.css, so all three move as one sheet.
export function foldTiming(hiding, root = document.documentElement) {
  const styles = getComputedStyle(root);
  const token = (name) => styles.getPropertyValue(`--rb-fold-${hiding ? "hide" : "show"}-${name}`).trim();
  return { duration: toMilliseconds(token("duration")), easing: token("easing") || "ease-out" };
}

function leftEdges(elements) {
  return elements.map((element) => (element.getClientRects().length ? element.getBoundingClientRect().left : null));
}

let running = [];

export function cancelFold() {
  for (const animation of running) animation.cancel();
  running = [];
}

// Runs `change` (which must apply the new layout synchronously) and animates
// every follower from its previous drawn position to its new one. A press
// mid-flight measures where the column is drawn, so a reversal starts there.
export function foldWithMotion(change, hiding) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const followers = reduced ? [] : [...document.querySelectorAll(FOLD_FOLLOWERS)];
  const before = leftEdges(followers);
  cancelFold();
  change();
  if (!followers.length) return;
  const after = leftEdges(followers);
  const timing = foldTiming(hiding);
  if (!timing.duration) return;
  followers.forEach((element, index) => {
    if (before[index] === null || after[index] === null) return;
    const offset = before[index] - after[index];
    if (Math.abs(offset) < 0.5) return;
    running.push(element.animate([{ transform: `translateX(${offset}px)` }, { transform: "translateX(0)" }], timing));
  });
}
