<script setup>
import { computed, ref } from "vue";
import { useData, withBase } from "vitepress";

import { matchTasks } from "../task-id.js";

const { theme } = useData();
const query = ref("");

const modules = computed(() =>
  (theme.value.sidebar ?? [])
    .filter((group) => group.moduleTitle)
    .map((group) => ({
      title: group.moduleTitle,
      link: withBase(`${group.moduleLink}.html`),
      tasks: group.items.map((item) => ({
        id: item.taskId,
        title: item.taskTitle,
        module: group.moduleTitle,
        link: withBase(`${item.link}.html`),
      })),
    })),
);

// With no query every module and task is listed, server-rendered, in source
// order. Typing narrows the list; clearing the field restores all of it.
const shown = computed(() => {
  if (!query.value.trim()) return modules.value;
  return modules.value
    .map((module) => ({ ...module, tasks: matchTasks(module.tasks, query.value) }))
    .filter((module) => module.tasks.length);
});
const shownCount = computed(() => shown.value.reduce((sum, { tasks }) => sum + tasks.length, 0));
const total = computed(() => modules.value.reduce((sum, { tasks }) => sum + tasks.length, 0));
</script>

<template>
  <div class="directory-tools">
    <label class="directory-label" for="directory-filter">Filter by ID, title or module</label>
    <div class="directory-row">
      <input
        id="directory-filter"
        v-model="query"
        class="directory-input"
        placeholder="e.g. smb, kerberos, LPRIV"
        autocomplete="off"
        spellcheck="false"
      />
      <button v-if="query" class="directory-clear" type="button" @click="query = ''">Clear</button>
    </div>
    <p class="directory-status" role="status" aria-live="polite">
      <template v-if="query.trim()">{{ shownCount }} of {{ total }} tasks match "{{ query.trim() }}".</template>
      <template v-else>All {{ total }} tasks, in source order.</template>
    </p>
  </div>
  <div class="directory">
    <section v-for="module in shown" :key="module.title" class="directory-module" :aria-label="`${module.title} tasks`">
      <p class="directory-module-head">
        <a :href="module.link">{{ module.title }}</a>
        <span class="directory-count">{{ module.tasks.length }}</span>
      </p>
      <ol class="directory-tasks">
        <li v-for="task in module.tasks" :key="task.id">
          <a :href="task.link">
            <span class="directory-id">{{ task.id }}</span>
            <span class="directory-title">{{ task.title }}</span>
          </a>
        </li>
      </ol>
    </section>
  </div>
</template>
