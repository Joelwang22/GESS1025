<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

import { cancelFold, foldWithMotion } from "../sidebar-fold.js";

const collapsed = ref(false);
const desktop = ref(false);
let media;

function applyState() {
  document.documentElement.classList.toggle("sidebar-collapsed", collapsed.value);
  const sidebar = document.querySelector(".VPSidebar");
  if (!sidebar) return;
  sidebar.toggleAttribute("inert", collapsed.value);
  if (collapsed.value) sidebar.setAttribute("aria-hidden", "true");
  else sidebar.removeAttribute("aria-hidden");
}

function toggle() {
  const hiding = !collapsed.value;
  foldWithMotion(() => {
    collapsed.value = hiding;
    applyState();
  }, hiding);
}

function syncViewport(event) {
  desktop.value = event.matches;
  if (!desktop.value && collapsed.value) {
    cancelFold();
    collapsed.value = false;
    applyState();
  }
}

onMounted(() => {
  media = window.matchMedia("(min-width: 60rem)");
  desktop.value = media.matches;
  media.addEventListener("change", syncViewport);
  applyState();
});

onBeforeUnmount(() => {
  media?.removeEventListener("change", syncViewport);
  cancelFold();
  collapsed.value = false;
  applyState();
});
</script>

<template>
  <!-- The slot is server-rendered and holds the control's width from the
       first paint, so the search field beside it never moves when the button
       mounts after hydration. -->
  <span class="sidebar-toggle-slot">
    <button
      v-if="desktop"
      class="sidebar-toggle"
      type="button"
      aria-label="Sidebar navigation"
      aria-controls="VPSidebarNav"
      :aria-expanded="String(!collapsed)"
      :title="collapsed ? 'Show navigation' : 'Hide navigation'"
      @click="toggle"
    >
      <span class="sidebar-toggle-glyph" aria-hidden="true">
        <span class="sidebar-toggle-bar" />
        <span class="sidebar-toggle-bar" />
        <span class="sidebar-toggle-bar" />
      </span>
    </button>
  </span>
</template>
