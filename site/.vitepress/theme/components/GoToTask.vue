<script setup>
import { computed, ref } from "vue";
import { useData, useRouter } from "vitepress";

import { matchTasks, normalizeTaskId } from "../task-id.js";
import { taskHref } from "../task-links.js";

const RESULT_LIMIT = 12;

const { theme } = useData();
const router = useRouter();
const value = ref("");
const message = ref("");

const tasks = computed(() =>
  (theme.value.sidebar ?? []).flatMap((group) =>
    (group.items ?? [])
      .filter((item) => item.taskId)
      .map((item) => ({ id: item.taskId, title: item.taskTitle, module: group.moduleTitle })),
  ),
);
const ids = computed(() => new Set(tasks.value.map(({ id }) => id)));
const exact = computed(() => {
  const id = normalizeTaskId(value.value);
  return id && ids.value.has(id) ? id : null;
});
const exactTitle = computed(() => tasks.value.find(({ id }) => id === exact.value)?.title ?? "");
const matches = computed(() => (exact.value ? [] : matchTasks(tasks.value, value.value)));

function open(id) {
  message.value = "";
  value.value = "";
  router.go(taskHref(id));
}

function go() {
  if (exact.value) return open(exact.value);
  if (matches.value.length) return open(matches.value[0].id);
  message.value = value.value.trim()
    ? `No task matches "${value.value.trim()}". Try an ID such as NET-01 or a word such as smb.`
    : "Type a task ID such as NET-01, or a word from a task title.";
}
</script>

<template>
  <form class="goto" role="search" aria-label="Find a task by ID or title" @submit.prevent="go">
    <label class="goto-label" for="goto-task-id">Find task</label>
    <div class="goto-row">
      <input
        id="goto-task-id"
        v-model="value"
        class="goto-input"
        placeholder="NET-01 or smb"
        autocomplete="off"
        spellcheck="false"
        aria-describedby="goto-task-help"
        @input="message = ''"
      />
      <button class="goto-button" type="submit">Go</button>
    </div>
    <p id="goto-task-help" class="goto-message" role="status" aria-live="polite">
      <template v-if="message">{{ message }}</template>
      <template v-else-if="exact">Press Enter to open {{ exact }}: {{ exactTitle }}</template>
      <template v-else-if="value.trim() && matches.length">
        {{ matches.length }} {{ matches.length === 1 ? "match" : "matches" }}<template v-if="matches.length > RESULT_LIMIT">, first {{ RESULT_LIMIT }} shown. Keep typing to narrow</template>. Enter opens the first.
      </template>
    </p>
    <ol v-if="matches.length" class="goto-results">
      <li v-for="task in matches.slice(0, RESULT_LIMIT)" :key="task.id">
        <a :href="taskHref(task.id)" @click.prevent="open(task.id)">
          <span class="goto-result-id">{{ task.id }}</span>
          <span class="goto-result-title">{{ task.title }}</span>
          <span class="goto-result-module">{{ task.module }}</span>
        </a>
      </li>
    </ol>
  </form>
</template>
