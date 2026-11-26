import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { codeText } from "../site/.vitepress/theme/copy.js";
import {
  COMMON_PLACEHOLDERS,
  ENABLED_KEY,
  STORAGE_KEY,
  applyPlaceholdersToRoot,
  collectPagePlaceholders,
  loadEnabled,
  loadPlaceholders,
  normalizePlaceholderName,
  saveEnabled,
  savePlaceholders,
} from "../site/.vitepress/theme/placeholders.js";

const repositoryRoot = path.resolve(import.meta.dirname, "..");

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}

function createFakeBlank(initialText) {
  const classes = new Set(["blank"]);
  const attrs = new Map();
  return {
    textContent: initialText,
    dataset: {},
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
    },
    setAttribute: (name, value) => attrs.set(name, value),
    removeAttribute: (name) => attrs.delete(name),
    getAttribute: (name) => attrs.get(name) ?? null,
  };
}

function createFakeRoot(blanks) {
  return {
    querySelectorAll(selector) {
      assert.equal(selector, ".vp-doc .blank");
      return blanks;
    },
  };
}

test("normalizes placeholder names with or without angle brackets", () => {
  assert.equal(normalizePlaceholderName("TARGET_IP"), "<TARGET_IP>");
  assert.equal(normalizePlaceholderName("  <TARGET_IP>  "), "<TARGET_IP>");
  assert.equal(normalizePlaceholderName("supplied-domain/user"), "<supplied-domain/user>");
  assert.equal(normalizePlaceholderName("<observed-unit.service>"), "<observed-unit.service>");
  assert.equal(normalizePlaceholderName(""), null);
  assert.equal(normalizePlaceholderName("   "), null);
  assert.equal(normalizePlaceholderName("<0.4096>"), null);
  assert.equal(normalizePlaceholderName("bad name"), null);
  assert.equal(normalizePlaceholderName("<<TARGET_IP>>"), null);
});

test("persists and reloads placeholder maps and enabled state safely", () => {
  const storage = createMemoryStorage();
  assert.deepEqual(loadPlaceholders(storage), {});
  assert.equal(loadEnabled(storage), true);

  savePlaceholders(
    {
      TARGET_IP: "10.10.11.42",
      "<USERNAME>": "jdoe",
      "<EMPTY>": "",
      "<0.4096>": "ignored",
    },
    storage,
  );
  assert.deepEqual(loadPlaceholders(storage), {
    "<TARGET_IP>": "10.10.11.42",
    "<USERNAME>": "jdoe",
  });

  savePlaceholders({}, storage);
  assert.equal(storage.getItem(STORAGE_KEY), null);
  assert.deepEqual(loadPlaceholders(storage), {});

  saveEnabled(false, storage);
  assert.equal(storage.getItem(ENABLED_KEY), "false");
  assert.equal(loadEnabled(storage), false);

  saveEnabled(true, storage);
  assert.equal(storage.getItem(ENABLED_KEY), null);
  assert.equal(loadEnabled(storage), true);

  // Corrupt JSON fails closed to an empty map.
  storage.setItem(STORAGE_KEY, "{not valid json");
  assert.deepEqual(loadPlaceholders(storage), {});
});

test("substitutes, pauses, and restores page blanks while preserving copy text", () => {
  const ip1 = createFakeBlank("<TARGET_IP>");
  const user = createFakeBlank("<USERNAME>");
  const ip2 = createFakeBlank("<TARGET_IP>");
  const root = createFakeRoot([ip1, user, ip2]);

  assert.deepEqual(collectPagePlaceholders(root), ["<TARGET_IP>", "<USERNAME>"]);

  // Apply substitution for <TARGET_IP> only.
  const discovered = applyPlaceholdersToRoot(root, { "<TARGET_IP>": "10.10.11.42" }, true);
  assert.deepEqual(discovered, ["<TARGET_IP>", "<USERNAME>"]);
  assert.equal(ip1.textContent, "10.10.11.42");
  assert.equal(ip1.classList.contains("is-filled"), true);
  assert.equal(ip1.getAttribute("title"), "Substituted for <TARGET_IP>");
  assert.equal(ip2.textContent, "10.10.11.42");
  assert.equal(user.textContent, "<USERNAME>");
  assert.equal(user.classList.contains("is-filled"), false);
  assert.equal(user.getAttribute("title"), null);

  // Command copy reads rendered line textContent, so it picks up the substituted value.
  const line = {
    classList: { contains: (name) => name === "line" },
    get textContent() {
      return `ping -c 3 '${ip1.textContent}'`;
    },
  };
  assert.equal(codeText({ children: [line] }), "ping -c 3 '10.10.11.42'");

  // Pausing substitution restores original placeholder text without losing stored values.
  applyPlaceholdersToRoot(root, { "<TARGET_IP>": "10.10.11.42" }, false);
  assert.equal(ip1.textContent, "<TARGET_IP>");
  assert.equal(ip1.classList.contains("is-filled"), false);
  assert.equal(ip1.getAttribute("title"), null);
  assert.equal(codeText({ children: [line] }), "ping -c 3 '<TARGET_IP>'");

  // Re-enabling with a new value updates in place.
  applyPlaceholdersToRoot(root, { "<TARGET_IP>": "10.10.11.99", "<USERNAME>": "alice" }, true);
  assert.equal(ip1.textContent, "10.10.11.99");
  assert.equal(user.textContent, "alice");
  assert.equal(codeText({ children: [line] }), "ping -c 3 '10.10.11.99'");
});

test("common placeholder presets include core engagement blanks and theme wires settings in top-right navbar", async () => {
  const tokens = COMMON_PLACEHOLDERS.map(({ token }) => token);
  for (const required of ["<TARGET_IP>", "<KALI_IP>", "<DOMAIN>", "<USERNAME>", "<PASSWORD>", "<PORT>"]) {
    assert.ok(tokens.includes(required), required);
  }

  const theme = await readFile(path.join(repositoryRoot, "site/.vitepress/theme/index.js"), "utf8");
  assert.match(theme, /nav-bar-content-after.*PlaceholderSettings/);
  assert.match(theme, /installPlaceholders\(router\)/);
});
