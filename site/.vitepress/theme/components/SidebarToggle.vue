<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const collapsed = ref(false);
const desktop = ref(false);
let media;

// Folded, the sidebar shows only as the rail and the site title fades out;
// both leave the tab order and the accessibility tree with their paint.
function applyState() {
  document.documentElement.classList.toggle("sidebar-collapsed", collapsed.value);
  for (const element of document.querySelectorAll(".VPSidebar, .VPNavBar.has-sidebar .VPNavBarTitle")) {
    element.toggleAttribute("inert", collapsed.value);
    if (collapsed.value) element.setAttribute("aria-hidden", "true");
    else element.removeAttribute("aria-hidden");
  }
}

// Only the sidebar, the title and the nav bar surface change; the page
// column keeps its place in both states, so nothing else needs to move.
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
  <!-- On desktop the button is fixed in the rail's top square, out of the nav
       bar's flow, so mounting it after hydration moves nothing. -->
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
</template>
