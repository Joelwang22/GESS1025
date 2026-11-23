<script setup>
import { computed } from "vue";
import { useData } from "vitepress";

import { moduleHref, taskHref } from "../task-links.js";

const { frontmatter } = useData();

// Up to this many routes show their titles in the rail. A hub task lists its
// routes as call-number chips (titles on hover and focus) so the rail stays
// short; the route sheet at the foot of the page always gives every title.
const TITLED_LIMIT = 6;

const outbound = computed(() => frontmatter.value.routesOut ?? []);
const stops = computed(() => frontmatter.value.routeStops ?? []);
const compact = computed(() => outbound.value.length > TITLED_LIMIT);
const moduleLink = computed(() => moduleHref(`/generated/modules/${frontmatter.value.moduleId}`));
</script>

<template>
  <nav v-if="frontmatter.taskId" class="task-rail" aria-label="Routes from this task">
    <p class="task-rail-head">
      <span class="task-rail-id">{{ frontmatter.taskId }}</span>
      <a class="task-rail-module" :href="moduleLink">{{ frontmatter.moduleTitle }}</a>
    </p>
    <p class="task-rail-label">
      Routes from this task
      <span v-if="outbound.length" class="task-rail-count">{{ outbound.length }}</span>
    </p>
    <ol v-if="outbound.length && !compact" class="task-rail-list">
      <li v-for="station in outbound" :key="station.id">
        <a :href="taskHref(station.id)">
          <span class="task-rail-route-id">{{ station.id }}</span>
          <span class="task-rail-route-title">{{ station.title }}</span>
        </a>
      </li>
    </ol>
    <template v-else-if="outbound.length">
      <ol class="task-rail-chips">
        <li v-for="station in outbound" :key="station.id">
          <a class="route-chip" :href="taskHref(station.id)" :title="`${station.id}: ${station.title}`">{{ station.id }}</a>
        </li>
      </ol>
      <a class="task-rail-more" href="#task-routes">Titles in the route sheet</a>
    </template>
    <p v-else class="task-rail-empty">No task links.</p>
    <p v-if="stops.length" class="task-rail-stops">
      <span v-for="stop in stops" :key="stop" class="stop">{{ stop }}</span>
    </p>
  </nav>
</template>
