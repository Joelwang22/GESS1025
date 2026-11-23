<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const collapsed = ref(false);
const desktop = ref(false);
let media;
let sidebar;

function applyState() {
  document.documentElement.classList.toggle("sidebar-collapsed", collapsed.value);
  if (!sidebar) return;
  sidebar.toggleAttribute("inert", collapsed.value);
  if (collapsed.value) sidebar.setAttribute("aria-hidden", "true");
  else sidebar.removeAttribute("aria-hidden");
}

function toggle() {
  collapsed.value = !collapsed.value;
  applyState();
}

function syncViewport(event) {
  desktop.value = event.matches;
  if (!desktop.value && collapsed.value) {
    collapsed.value = false;
    applyState();
  }
}

onMounted(() => {
  sidebar = document.querySelector(".VPSidebar");
  media = window.matchMedia("(min-width: 60rem)");
  desktop.value = media.matches;
  media.addEventListener("change", syncViewport);
  applyState();
});

onBeforeUnmount(() => {
  media?.removeEventListener("change", syncViewport);
  collapsed.value = false;
  applyState();
});
</script>

<template>
  <button
    v-if="desktop"
    class="sidebar-toggle"
    type="button"
    aria-controls="VPSidebarNav"
    :aria-expanded="String(!collapsed)"
    @click="toggle"
  >
    {{ collapsed ? "Show navigation" : "Hide navigation" }}
  </button>
</template>
