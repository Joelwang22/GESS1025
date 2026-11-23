// Copies a command plate's code exactly as rendered: each Shiki line's text,
// joined with newlines. Nothing is trimmed and no prompt prefix is removed, so
// the clipboard holds the source command text byte for byte.
export function codeText(code) {
  return [...code.children]
    .filter((element) => element.classList.contains("line"))
    .map((line) => line.textContent ?? "")
    .join("\n");
}

async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    field.remove();
    return copied;
  }
}

const timers = new WeakMap();

export function installCopy() {
  window.addEventListener("click", async (event) => {
    const button = event.target instanceof Element ? event.target.closest(".cmd-copy") : null;
    if (!button) return;
    const plate = button.closest(".cmd-plate");
    const code = plate?.querySelector("pre code");
    const status = plate?.querySelector(".cmd-status");
    if (!code) return;
    const label = button.querySelector(".cmd-copy-text") ?? button;
    const copied = await writeClipboard(codeText(code));
    label.textContent = copied ? "Copied" : "Copy";
    button.classList.toggle("is-copied", copied);
    if (status) status.textContent = copied ? "" : "Copy failed. Select the text instead.";
    clearTimeout(timers.get(button));
    timers.set(
      button,
      window.setTimeout(() => {
        label.textContent = "Copy";
        button.classList.remove("is-copied");
        if (status) status.textContent = "";
      }, 2400),
    );
  });
}
