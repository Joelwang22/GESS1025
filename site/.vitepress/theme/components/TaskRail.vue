<script setup>
import { computed } from "vue";
import { useData } from "vitepress";

import { moduleHref, taskHref } from "../task-links.js";

const { frontmatter } = useData();

const outbound = computed(() => frontmatter.value.routesOut ?? []);
const stops = computed(() => frontmatter.value.routeStops ?? []);
const moduleLink = computed(() => moduleHref(`/generated/modules/${frontmatter.value.moduleId}`));
</script>

<template>
  <nav v-if="frontmatter.taskId" class="task-rail" aria-label="Routes from this task">
    <p class="task-rail-head">
      <span class="task-rail-id">{{ frontmatter.taskId }}</span>
      <a class="task-rail-module" :href="moduleLink">{{ frontmatter.moduleTitle }}</a>
    </p>
    <p class="task-rail-label">Routes from this task</p>
    <ol v-if="outbound.length" class="task-rail-list">
      <li v-for="station in outbound" :key="station.id">
        <a :href="taskHref(station.id)">
          <span class="task-rail-route-id">{{ station.id }}</span>
          <span class="task-rail-route-title">{{ station.title }}</span>
        </a>
      </li>
    </ol>
    <p v-else class="task-rail-empty">No task links.</p>
    <p v-if="stops.length" class="task-rail-stops">
      <span v-for="stop in stops" :key="stop" class="stop">{{ stop }}</span>
    </p>
  </nav>
</template>
