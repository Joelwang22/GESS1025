<script setup>
import { computed } from "vue";
import { useData } from "vitepress";

import { taskHref } from "../task-links.js";

const { frontmatter } = useData();

const INBOUND_OPEN_LIMIT = 12;

const outbound = computed(() => frontmatter.value.routesOut ?? []);
const stops = computed(() => frontmatter.value.routeStops ?? []);
const inbound = computed(() => frontmatter.value.routesIn ?? []);
const isTask = computed(() => Boolean(frontmatter.value.taskId));
const here = computed(() => frontmatter.value.moduleTitle);
</script>

<template>
  <section v-if="isTask" class="route-panel" aria-labelledby="task-routes">
    <div class="route-panel-head">
      <!-- The id puts this sheet in the "On this page" outline. -->
      <h2 id="task-routes" class="route-panel-title">Recorded routes for {{ frontmatter.taskId }}</h2>
      <p class="route-panel-note">
        Every task and stop state this page links, in the order the text first
        names them. The result table decides which one applies.
      </p>
    </div>

    <ol v-if="outbound.length" class="route-list">
      <li v-for="station in outbound" :key="station.id">
        <a class="route-row" :href="taskHref(station.id)">
          <span class="route-row-top">
            <span class="route-row-id">{{ station.id }}</span>
            <span v-if="station.module && station.module !== here" class="route-row-module">{{ station.module }}</span>
          </span>
          <span class="route-row-title">{{ station.title }}</span>
        </a>
      </li>
    </ol>
    <p v-else class="route-panel-empty">This task links no other task.</p>

    <p v-if="stops.length" class="route-stops">
      <span class="route-stops-label">Stop states named here</span>
      <span v-for="stop in stops" :key="stop" class="stop">{{ stop }}</span>
    </p>

    <div v-if="inbound.length" class="route-inbound">
      <template v-if="inbound.length <= INBOUND_OPEN_LIMIT">
        <h3 class="route-inbound-title">Linked from {{ inbound.length }} {{ inbound.length === 1 ? "task" : "tasks" }}</h3>
        <ul class="route-chips">
          <li v-for="station in inbound" :key="station.id">
            <a class="route-chip" :href="taskHref(station.id)" :title="`${station.id}: ${station.title}`">{{ station.id }}</a>
          </li>
        </ul>
      </template>
      <details v-else class="route-inbound-more">
        <summary>Linked from {{ inbound.length }} tasks</summary>
        <ul class="route-chips">
          <li v-for="station in inbound" :key="station.id">
            <a class="route-chip" :href="taskHref(station.id)" :title="`${station.id}: ${station.title}`">{{ station.id }}</a>
          </li>
        </ul>
      </details>
    </div>
  </section>
</template>
