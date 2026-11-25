// A module row lists its scan ports under its name.
//
// Closed, the module keeps them on one line that never wraps: every port
// while they fit, otherwise as many as fit, in source order, with the rest
// counted ("25 · 110 · 143 +4"). Fitting changes only the line's text, never
// the row's height, so nothing in the sidebar moves; the line refits when
// its width changes (a section opening, the drawer opening, the window
// resizing).
//
// Open, the module shows every port, wrapping between ports when they need
// more than one line. That happens in the same frame its task list opens,
// so the extra line arrives with a movement the reader asked for.
//
// The row's title always holds the full list.

export const PORT_SEPARATOR = " · ";

export function portLabel(ports, shown) {
  const head = ports.slice(0, shown).join(PORT_SEPARATOR);
  return shown >= ports.length ? head : `${head} +${ports.length - shown}`;
}

// The most ports that fit, by `fits(shown)`; never fewer than one.
export function fitPortCount(ports, fits) {
  for (let shown = ports.length; shown > 1; shown -= 1) {
    if (fits(shown)) return shown;
  }
  return Math.min(1, ports.length);
}

export function fitPortLabel(ports, fits) {
  return portLabel(ports, fitPortCount(ports, (shown) => fits(portLabel(ports, shown))));
}

// Each port is its own unbreakable span, and the separator holds to the
// port before it, so a wrapped list breaks only between ports and never
// inside one such as 53/udp.
function render(line, ports, shown) {
  const nodes = [];
  ports.slice(0, shown).forEach((port, index) => {
    if (index) nodes.push(" · ");
    const span = document.createElement("span");
    span.className = "sb-port";
    span.textContent = port;
    nodes.push(span);
  });
  if (shown < ports.length) nodes.push(` +${ports.length - shown}`);
  line.replaceChildren(...nodes);
}

function textWidth(line) {
  const range = document.createRange();
  range.selectNodeContents(line);
  return range.getBoundingClientRect().width;
}

function moduleIsOpen(line) {
  const item = line.closest(".VPSidebarItem");
  return Boolean(item) && !item.classList.contains("collapsed");
}

const fitted = new WeakMap();

function fitLine(line) {
  const width = line.clientWidth;
  // A line in a closed section has no width yet; it fits when it opens.
  if (width === 0) return;
  const open = moduleIsOpen(line);
  const state = `${open ? "open" : "closed"}:${width}`;
  if (fitted.get(line) === state) return;
  fitted.set(line, state);
  const ports = (line.dataset.ports ?? "").split(" ").filter(Boolean);
  if (!ports.length) return;
  if (open) {
    render(line, ports, ports.length);
    return;
  }
  const shown = fitPortCount(ports, (count) => {
    render(line, ports, count);
    return textWidth(line) <= width + 0.5;
  });
  render(line, ports, shown);
}

const LINE = ".sb-ports[data-ports]";

export function installSidebarPorts() {
  const resized = new ResizeObserver((entries) => {
    for (const { target } of entries) fitLine(target);
  });
  const watch = (root) => {
    for (const line of root.querySelectorAll?.(LINE) ?? []) resized.observe(line);
  };
  // Server-rendered rows are already in the page; rows mounted later, such
  // as the sidebar of a page that had none, are picked up as they arrive. A
  // module opening or closing flips its class, and its line refits before
  // the next paint, with its task list.
  watch(document);
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") {
        const item = record.target;
        if (item.matches?.(".VPSidebarItem.level-1")) {
          const line = item.querySelector(`:scope > .item ${LINE}`);
          if (line) fitLine(line);
        }
        continue;
      }
      for (const node of record.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches(LINE)) resized.observe(node);
        watch(node);
      }
    }
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
}
