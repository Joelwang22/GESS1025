<script setup>
import { computed, ref } from "vue";
import { useData, useRouter } from "vitepress";

import { matchTasks, normalizeTaskId } from "../task-id.js";
import { taskHref } from "../task-links.js";

// Home quick jump: the same matching as Find task in the sidebar, for phones
// where the sidebar sits behind a menu. "Full-text search" opens VitePress's
// own local search, which "/" also opens from any page.

const RESULT_LIMIT = 8;

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
const exact = computed(() => {
  const id = normalizeTaskId(value.value);
  return tasks.value.find((task) => task.id === id) ?? null;
});
const matches = computed(() => (exact.value ? [] : matchTasks(tasks.value, value.value)));

function open(id) {
  value.value = "";
  message.value = "";
  router.go(taskHref(id));
}

function go() {
  if (exact.value) return open(exact.value.id);
  if (matches.value.length) return open(matches.value[0].id);
  message.value = value.value.trim()
    ? `No task matches "${value.value.trim()}". Try an ID such as NET-01 or a word such as smb.`
    : "Type a task ID such as NET-01, or a word from a task title.";
}

function clear() {
  value.value = "";
  message.value = "";
}

function openSearch() {
  const button = document.querySelector(".VPNavBarSearch button");
  if (button instanceof HTMLElement) button.click();
}
</script>

<template>
  <form class="home-jump" role="search" aria-label="Jump to a task" @submit.prevent="go">
    <label class="home-jump-label" for="home-jump-input">Jump to a task</label>
    <div class="home-jump-row">
      <input
        id="home-jump-input"
        v-model="value"
        class="home-jump-input"
        placeholder="NET-01, web9 or smb"
        autocomplete="off"
        spellcheck="false"
        aria-describedby="home-jump-help"
        @input="message = ''"
        @keydown.esc.prevent="clear"
      />
      <button class="home-jump-go" type="submit">Go</button>
      <button class="home-jump-search" type="button" @click="openSearch">
        Full-text search <kbd>/</kbd>
      </button>
    </div>
    <p id="home-jump-help" class="home-jump-message" role="status" aria-live="polite">
      <template v-if="message">{{ message }}</template>
      <template v-else-if="exact">Press Enter to open {{ exact.id }}: {{ exact.title }}</template>
      <template v-else-if="value.trim() && matches.length">
        {{ matches.length }} {{ matches.length === 1 ? "match" : "matches" }}<template v-if="matches.length > RESULT_LIMIT">, first {{ RESULT_LIMIT }} shown</template>. Enter opens the first.
      </template>
    </p>
    <ol v-if="matches.length" class="home-jump-results">
      <li v-for="task in matches.slice(0, RESULT_LIMIT)" :key="task.id">
        <a :href="taskHref(task.id)" @click.prevent="open(task.id)">
          <span class="home-jump-id">{{ task.id }}</span>
          <span class="home-jump-title">{{ task.title }}</span>
          <span class="home-jump-module">{{ task.module }}</span>
        </a>
      </li>
    </ol>
  </form>
</template>
