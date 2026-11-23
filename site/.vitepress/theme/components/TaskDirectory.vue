<script setup>
import { computed, ref } from "vue";
import { useData, withBase } from "vitepress";

import { matchTasks } from "../task-id.js";

const { theme } = useData();
const query = ref("");
// "module" groups tasks under their module in printed-index columns; "flat"
// lists all tasks as one call-number table. Neither choice is stored.
const mode = ref("module");

const modules = computed(() =>
  (theme.value.sidebar ?? [])
    .filter((group) => group.moduleTitle)
    .map((group) => ({
      title: group.moduleTitle,
      link: withBase(`${group.moduleLink}.html`),
      tasks: group.items
        .filter((item) => item.taskId)
        .map((item) => ({
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
const flat = computed(() => shown.value.flatMap((module) => module.tasks));
const shownCount = computed(() => flat.value.length);
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
        @keydown.esc.prevent="query = ''"
      />
      <button v-if="query" class="directory-clear" type="button" @click="query = ''">Clear</button>
    </div>
    <div class="directory-modes" role="group" aria-label="Directory layout">
      <button type="button" class="directory-mode" :aria-pressed="mode === 'module'" @click="mode = 'module'">
        By module ({{ modules.length }})
      </button>
      <button type="button" class="directory-mode" :aria-pressed="mode === 'flat'" @click="mode = 'flat'">
        Flat list ({{ total }})
      </button>
    </div>
    <p class="directory-status" role="status" aria-live="polite">
      <template v-if="query.trim()">{{ shownCount }} of {{ total }} tasks match "{{ query.trim() }}".</template>
      <template v-else>All {{ total }} tasks, in source order.</template>
    </p>
  </div>
  <div v-if="mode === 'module'" class="directory">
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
  <ol v-else class="directory-flat" aria-label="All tasks in source order">
    <li v-for="task in flat" :key="task.id">
      <a :href="task.link">
        <span class="directory-id">{{ task.id }}</span>
        <span class="directory-title">{{ task.title }}</span>
        <span class="directory-flat-module">{{ task.module }}</span>
      </a>
    </li>
  </ol>
</template>
