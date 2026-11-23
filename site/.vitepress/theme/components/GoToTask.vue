<script setup>
import { computed, ref } from "vue";
import { useData, useRouter } from "vitepress";

import { normalizeTaskId, taskHref } from "../task-links.js";

const { theme } = useData();
const router = useRouter();
const value = ref("");
const message = ref("");

const tasks = computed(() =>
  (theme.value.sidebar ?? []).flatMap((group) =>
    (group.items ?? []).filter((item) => item.taskId).map((item) => ({ id: item.taskId, title: item.taskTitle })),
  ),
);
const ids = computed(() => new Set(tasks.value.map(({ id }) => id)));

function go() {
  const id = normalizeTaskId(value.value);
  if (!id || !ids.value.has(id)) {
    message.value = value.value.trim()
      ? `No task ${value.value.trim().toUpperCase()}. Try an ID such as NET-01.`
      : "Type a task ID such as NET-01.";
    return;
  }
  message.value = "";
  value.value = "";
  router.go(taskHref(id));
}
</script>

<template>
  <form class="goto" role="search" aria-label="Go to a task by ID" @submit.prevent="go">
    <label class="goto-label" for="goto-task-id">Go to task ID</label>
    <div class="goto-row">
      <input
        id="goto-task-id"
        v-model="value"
        class="goto-input"
        list="goto-task-ids"
        placeholder="NET-01"
        autocomplete="off"
        autocapitalize="characters"
        spellcheck="false"
        @input="message = ''"
      />
      <button class="goto-button" type="submit">Go</button>
    </div>
    <datalist id="goto-task-ids">
      <option v-for="task in tasks" :key="task.id" :value="task.id">{{ task.title }}</option>
    </datalist>
    <p class="goto-message" role="status" aria-live="polite">{{ message }}</p>
  </form>
</template>
