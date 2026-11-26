<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import {
  COMMON_EXAMPLES,
  COMMON_PLACEHOLDERS,
  normalizePlaceholderName,
  usePlaceholders,
} from "../placeholders.js";

const {
  values,
  enabled,
  pagePlaceholders,
  activeCount,
  setPlaceholder,
  removePlaceholder,
  clearAllPlaceholders,
  setEnabled,
  refreshPage,
} = usePlaceholders();

const mounted = ref(false);
const open = ref(false);
const triggerRef = ref(null);
const drawerRef = ref(null);
const customName = ref("");
const customValue = ref("");
const customError = ref("");

const pageSet = computed(() => new Set(pagePlaceholders.value));
const commonSet = new Set(COMMON_PLACEHOLDERS.map(({ token }) => token));

const commonList = computed(() =>
  COMMON_PLACEHOLDERS.filter(({ token }) => !pageSet.value.has(token)),
);

const otherSaved = computed(() =>
  Object.keys(values.value)
    .filter((token) => !pageSet.value.has(token) && !commonSet.has(token))
    .sort(),
);

function exampleFor(token) {
  return COMMON_EXAMPLES.get(token) ?? `Value for ${token}`;
}

function inputId(prefix, token) {
  return `ph-${prefix}-${token.replace(/[^A-Za-z0-9_-]/g, "_")}`;
}

function openDrawer() {
  refreshPage();
  open.value = true;
  nextTick(() => {
    const firstInput = drawerRef.value?.querySelector("input");
    if (firstInput instanceof HTMLElement) {
      firstInput.focus();
    } else {
      drawerRef.value?.focus();
    }
  });
}

function closeDrawer({ restoreFocus = true } = {}) {
  if (!open.value) return;
  open.value = false;
  customError.value = "";
  if (restoreFocus) {
    nextTick(() => {
      triggerRef.value?.focus();
    });
  }
}

function toggleDrawer() {
  if (open.value) closeDrawer();
  else openDrawer();
}

function onInput(token, event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  setPlaceholder(token, target.value);
}

function onAddCustom() {
  const token = normalizePlaceholderName(customName.value);
  if (!token) {
    customError.value = "Use a placeholder like TARGET_IP or <TARGET_IP>.";
    return;
  }
  const value = customValue.value;
  if (!value) {
    customError.value = "Enter a value to substitute.";
    return;
  }
  setPlaceholder(token, value);
  customName.value = "";
  customValue.value = "";
  customError.value = "";
}

function onKeydown(event) {
  if (event.key === "Escape" && open.value) {
    event.preventDefault();
    closeDrawer({ restoreFocus: true });
  }
}

onMounted(() => {
  mounted.value = true;
  refreshPage();
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div class="placeholder-settings-wrap">
    <button
      ref="triggerRef"
      type="button"
      class="placeholder-settings-btn"
      :class="{ 'has-values': mounted && activeCount > 0, 'is-paused': mounted && activeCount > 0 && !enabled }"
      aria-haspopup="dialog"
      aria-controls="placeholder-settings-panel"
      :aria-expanded="String(open)"
      title="Set substituted values for placeholders like <TARGET_IP>"
      @click="toggleDrawer"
    >
      <svg
        class="placeholder-settings-icon"
        viewBox="0 0 16 16"
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M2 4h3M9 4h5M2 8h8M13 8h1M2 12h4M10 12h4" />
        <circle cx="7" cy="4" r="1.75" />
        <circle cx="11.5" cy="8" r="1.75" />
        <circle cx="8" cy="12" r="1.75" />
      </svg>
      <span class="placeholder-settings-label">Settings</span>
      <span
        v-if="mounted && activeCount > 0"
        class="placeholder-settings-badge"
        :title="enabled ? `${activeCount} active substitution${activeCount === 1 ? '' : 's'}` : `${activeCount} saved (paused)`"
      >
        {{ activeCount }}
      </span>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        class="placeholder-backdrop"
        @click.self="closeDrawer()"
      >
        <aside
          id="placeholder-settings-panel"
          ref="drawerRef"
          class="placeholder-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="placeholder-settings-title"
          tabindex="-1"
        >
          <header class="placeholder-drawer-head">
            <div>
              <h2 id="placeholder-settings-title" class="placeholder-drawer-title">
                Placeholder settings
              </h2>
              <p class="placeholder-drawer-sub">
                Substitutes blanks on every page and in copied commands. Saved in this browser.
              </p>
            </div>
            <button
              type="button"
              class="placeholder-close-btn"
              aria-label="Close placeholder settings"
              title="Close (Esc)"
              @click="closeDrawer()"
            >
              ×
            </button>
          </header>

          <div class="placeholder-drawer-toolbar">
            <button
              type="button"
              role="switch"
              class="placeholder-toggle-btn"
              :aria-checked="String(enabled)"
              @click="setEnabled(!enabled)"
            >
              <span class="placeholder-switch-track" aria-hidden="true">
                <span class="placeholder-switch-thumb" />
              </span>
              <span>Apply on page</span>
            </button>

            <button
              type="button"
              class="placeholder-clear-all"
              :disabled="activeCount === 0"
              @click="clearAllPlaceholders"
            >
              Clear all
            </button>
          </div>

          <div class="placeholder-drawer-body">
            <section
              v-if="pagePlaceholders.length > 0"
              class="placeholder-section"
              aria-labelledby="placeholder-section-page"
            >
              <h3 id="placeholder-section-page" class="placeholder-section-title">
                On this page
                <span class="placeholder-section-count">{{ pagePlaceholders.length }}</span>
              </h3>
              <div class="placeholder-list">
                <div
                  v-for="token in pagePlaceholders"
                  :key="`page-${token}`"
                  class="placeholder-row"
                >
                  <label :for="inputId('page', token)" class="placeholder-token">
                    {{ token }}
                  </label>
                  <div class="placeholder-field">
                    <input
                      :id="inputId('page', token)"
                      type="text"
                      class="placeholder-input"
                      :value="values[token] ?? ''"
                      :placeholder="exampleFor(token)"
                      autocomplete="off"
                      autocapitalize="off"
                      spellcheck="false"
                      @input="onInput(token, $event)"
                    />
                    <button
                      v-if="values[token]"
                      type="button"
                      class="placeholder-row-clear"
                      :aria-label="`Clear ${token}`"
                      title="Reset to placeholder"
                      @click="removePlaceholder(token)"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section
              v-if="commonList.length > 0"
              class="placeholder-section"
              aria-labelledby="placeholder-section-common"
            >
              <h3 id="placeholder-section-common" class="placeholder-section-title">
                Common placeholders
              </h3>
              <div class="placeholder-list">
                <div
                  v-for="item in commonList"
                  :key="`common-${item.token}`"
                  class="placeholder-row"
                >
                  <label :for="inputId('common', item.token)" class="placeholder-token">
                    {{ item.token }}
                  </label>
                  <div class="placeholder-field">
                    <input
                      :id="inputId('common', item.token)"
                      type="text"
                      class="placeholder-input"
                      :value="values[item.token] ?? ''"
                      :placeholder="item.example"
                      autocomplete="off"
                      autocapitalize="off"
                      spellcheck="false"
                      @input="onInput(item.token, $event)"
                    />
                    <button
                      v-if="values[item.token]"
                      type="button"
                      class="placeholder-row-clear"
                      :aria-label="`Clear ${item.token}`"
                      title="Reset to placeholder"
                      @click="removePlaceholder(item.token)"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section
              v-if="otherSaved.length > 0"
              class="placeholder-section"
              aria-labelledby="placeholder-section-saved"
            >
              <h3 id="placeholder-section-saved" class="placeholder-section-title">
                Other saved
                <span class="placeholder-section-count">{{ otherSaved.length }}</span>
              </h3>
              <div class="placeholder-list">
                <div
                  v-for="token in otherSaved"
                  :key="`saved-${token}`"
                  class="placeholder-row"
                >
                  <label :for="inputId('saved', token)" class="placeholder-token">
                    {{ token }}
                  </label>
                  <div class="placeholder-field">
                    <input
                      :id="inputId('saved', token)"
                      type="text"
                      class="placeholder-input"
                      :value="values[token] ?? ''"
                      autocomplete="off"
                      autocapitalize="off"
                      spellcheck="false"
                      @input="onInput(token, $event)"
                    />
                    <button
                      type="button"
                      class="placeholder-row-clear"
                      :aria-label="`Remove ${token}`"
                      title="Remove substitution"
                      @click="removePlaceholder(token)"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section
              class="placeholder-section"
              aria-labelledby="placeholder-section-custom"
            >
              <h3 id="placeholder-section-custom" class="placeholder-section-title">
                Add placeholder
              </h3>
              <form class="placeholder-add-form" @submit.prevent="onAddCustom">
                <div class="placeholder-add-fields">
                  <label class="placeholder-add-label">
                    <span>Token</span>
                    <input
                      v-model="customName"
                      type="text"
                      class="placeholder-input"
                      placeholder="<SHARE>"
                      autocomplete="off"
                      autocapitalize="off"
                      spellcheck="false"
                      @input="customError = ''"
                    />
                  </label>
                  <label class="placeholder-add-label">
                    <span>Value</span>
                    <input
                      v-model="customValue"
                      type="text"
                      class="placeholder-input"
                      placeholder="backups"
                      autocomplete="off"
                      autocapitalize="off"
                      spellcheck="false"
                      @input="customError = ''"
                    />
                  </label>
                </div>
                <p v-if="customError" class="placeholder-add-error" role="alert">
                  {{ customError }}
                </p>
                <button type="submit" class="placeholder-add-submit">
                  Add substitution
                </button>
              </form>
            </section>
          </div>
        </aside>
      </div>
    </Teleport>
  </div>
</template>
