import { computed, ref } from "vue";

export const STORAGE_KEY = "oscp-checklist:placeholders:v1";
export const ENABLED_KEY = "oscp-checklist:placeholders-enabled:v1";

// Mirrors BLANK in site/.vitepress/markdown.mjs: starts with an ASCII letter
// and contains only letters, digits, underscores, dots, slashes, or hyphens.
export const PLACEHOLDER_TOKEN = /^<[A-Za-z][A-Za-z0-9_./-]*>$/;

export const COMMON_PLACEHOLDERS = Object.freeze([
  { token: "<TARGET_IP>", example: "10.10.11.42" },
  { token: "<KALI_IP>", example: "10.10.14.5" },
  { token: "<PORT>", example: "8080" },
  { token: "<LPORT>", example: "4444" },
  { token: "<DOMAIN>", example: "corp.local" },
  { token: "<DC_IP>", example: "10.10.11.10" },
  { token: "<TARGET_HOST>", example: "dc01.corp.local" },
  { token: "<TARGET_URL>", example: "http://10.10.11.42" },
  { token: "<USERNAME>", example: "jdoe" },
  { token: "<PASSWORD>", example: "Password123!" },
  { token: "<NTLM_HASH>", example: "aad3b435b51404ee:..." },
]);

export const COMMON_EXAMPLES = new Map(
  COMMON_PLACEHOLDERS.map(({ token, example }) => [token, example]),
);

export function normalizePlaceholderName(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const wrapped =
    trimmed.startsWith("<") && trimmed.endsWith(">") ? trimmed : `<${trimmed}>`;
  return PLACEHOLDER_TOKEN.test(wrapped) ? wrapped : null;
}

export function sanitizePlaceholderMap(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const clean = {};
  for (const [key, value] of Object.entries(input)) {
    const token = normalizePlaceholderName(key);
    if (!token || typeof value !== "string" || value.length === 0) continue;
    clean[token] = value;
  }
  return clean;
}

function defaultStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function loadPlaceholders(storage = defaultStorage()) {
  if (!storage) return {};
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return sanitizePlaceholderMap(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function savePlaceholders(values, storage = defaultStorage()) {
  if (!storage) return;
  try {
    const clean = sanitizePlaceholderMap(values);
    if (Object.keys(clean).length === 0) {
      storage.removeItem(STORAGE_KEY);
    } else {
      storage.setItem(STORAGE_KEY, JSON.stringify(clean));
    }
  } catch {
    // Ignore storage quota or private-mode errors.
  }
}

export function loadEnabled(storage = defaultStorage()) {
  if (!storage) return true;
  try {
    const raw = storage.getItem(ENABLED_KEY);
    return raw === null ? true : raw !== "false";
  } catch {
    return true;
  }
}

export function saveEnabled(enabled, storage = defaultStorage()) {
  if (!storage) return;
  try {
    if (enabled) storage.removeItem(ENABLED_KEY);
    else storage.setItem(ENABLED_KEY, "false");
  } catch {
    // Ignore storage errors.
  }
}

function originalToken(element) {
  if (element.dataset?.blankPlaceholder) return element.dataset.blankPlaceholder;
  const token = element.textContent ?? "";
  if (element.dataset) element.dataset.blankPlaceholder = token;
  return token;
}

export function collectPagePlaceholders(root) {
  if (!root?.querySelectorAll) return [];
  const seen = new Set();
  const ordered = [];
  for (const element of root.querySelectorAll(".vp-doc .blank")) {
    const token = originalToken(element);
    if (PLACEHOLDER_TOKEN.test(token) && !seen.has(token)) {
      seen.add(token);
      ordered.push(token);
    }
  }
  return ordered;
}

export function applyPlaceholdersToRoot(root, values, enabled = true) {
  if (!root?.querySelectorAll) return [];
  const seen = new Set();
  const ordered = [];
  for (const element of root.querySelectorAll(".vp-doc .blank")) {
    const token = originalToken(element);
    if (PLACEHOLDER_TOKEN.test(token) && !seen.has(token)) {
      seen.add(token);
      ordered.push(token);
    }
    const replacement = enabled && typeof values[token] === "string" ? values[token] : "";
    if (replacement.length > 0) {
      if (element.textContent !== replacement) element.textContent = replacement;
      element.classList?.add("is-filled");
      element.setAttribute?.("title", `Substituted for ${token}`);
      if (element.dataset) element.dataset.blankFilled = "true";
    } else {
      if (element.textContent !== token) element.textContent = token;
      element.classList?.remove("is-filled");
      if (element.dataset?.blankFilled === "true") {
        element.removeAttribute?.("title");
        delete element.dataset.blankFilled;
      }
    }
  }
  return ordered;
}

const values = ref({});
const enabled = ref(true);
const pagePlaceholders = ref([]);
let hydrated = false;
let applying = false;
let rafId = 0;

function syncDom() {
  if (typeof document === "undefined") return;
  applying = true;
  try {
    pagePlaceholders.value = applyPlaceholdersToRoot(document, values.value, enabled.value);
  } finally {
    applying = false;
  }
}

function scheduleSyncDom() {
  if (typeof window === "undefined") return;
  if (rafId) window.cancelAnimationFrame(rafId);
  rafId = window.requestAnimationFrame(() => {
    rafId = 0;
    syncDom();
  });
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  values.value = loadPlaceholders();
  enabled.value = loadEnabled();
}

export function usePlaceholders() {
  const activeCount = computed(() => Object.keys(values.value).length);

  function setPlaceholder(rawName, rawValue) {
    const token = normalizePlaceholderName(rawName);
    if (!token) return false;
    const next = { ...values.value };
    if (typeof rawValue === "string" && rawValue.length > 0) {
      next[token] = rawValue;
    } else {
      delete next[token];
    }
    values.value = next;
    savePlaceholders(next);
    syncDom();
    return true;
  }

  function removePlaceholder(token) {
    if (!(token in values.value)) return;
    const next = { ...values.value };
    delete next[token];
    values.value = next;
    savePlaceholders(next);
    syncDom();
  }

  function clearAllPlaceholders() {
    if (Object.keys(values.value).length === 0) return;
    values.value = {};
    savePlaceholders({});
    syncDom();
  }

  function setEnabled(nextEnabled) {
    const flag = Boolean(nextEnabled);
    if (enabled.value === flag) return;
    enabled.value = flag;
    saveEnabled(flag);
    syncDom();
  }

  function refreshPage() {
    hydrate();
    syncDom();
  }

  return {
    values,
    enabled,
    pagePlaceholders,
    activeCount,
    setPlaceholder,
    removePlaceholder,
    clearAllPlaceholders,
    setEnabled,
    refreshPage,
  };
}

export function installPlaceholders(router) {
  hydrate();
  if (typeof document === "undefined") return;

  const after = router?.onAfterRouteChange;
  if (router) {
    router.onAfterRouteChange = async (href) => {
      await after?.(href);
      window.setTimeout(scheduleSyncDom, 0);
    };
  }

  window.addEventListener("load", scheduleSyncDom, { once: true });
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      values.value = loadPlaceholders();
      syncDom();
    }
    if (event.key === ENABLED_KEY || event.key === null) {
      enabled.value = loadEnabled();
      syncDom();
    }
  });

  const observer = new MutationObserver((records) => {
    if (applying) return;
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches?.(".vp-doc, .vp-doc .blank") || node.querySelector?.(".vp-doc .blank")) {
          scheduleSyncDom();
          return;
        }
      }
    }
  });

  const startObserving = () => {
    syncDom();
    const target = document.getElementById("app") ?? document.body;
    if (target) {
      observer.observe(target, { childList: true, subtree: true });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserving, { once: true });
  } else {
    scheduleSyncDom();
    const target = document.getElementById("app") ?? document.body;
    if (target) observer.observe(target, { childList: true, subtree: true });
  }
}
