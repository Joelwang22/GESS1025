<script setup>
import { computed, ref } from "vue";
import { useData, useRouter } from "vitepress";

import { matchTasks, normalizeTaskId } from "../task-id.js";
import { taskHref } from "../task-links.js";

const RESULT_LIMIT = 12;

const { frontmatter, theme } = useData();
const router = useRouter();
const value = ref("");
const input = ref(null);
const message = ref("");
// Results open over the sidebar tree rather than pushing it down, so typing
// never moves the modules beneath the field. They show while focus is
// anywhere in the form and close when it leaves.
const engaged = ref(false);

const tasks = computed(() => {
  const result = [];
  for (const section of theme.value.sidebar ?? []) {
    for (const group of section.items ?? []) {
      if (!group.moduleTitle) continue;
      for (const item of group.items ?? []) {
        if (item.taskId) result.push({ id: item.taskId, title: item.taskTitle, module: group.moduleTitle });
      }
    }
  }
  return result;
});
const ids = computed(() => new Set(tasks.value.map(({ id }) => id)));
const exact = computed(() => {
  const id = normalizeTaskId(value.value);
  return id && ids.value.has(id) ? id : null;
});
const exactTitle = computed(() => tasks.value.find(({ id }) => id === exact.value)?.title ?? "");
const matches = computed(() => (exact.value ? [] : matchTasks(tasks.value, value.value)));
const listing = computed(() => Boolean(value.value.trim() && matches.value.length));
const open = computed(() => engaged.value && Boolean(message.value || exact.value || listing.value));

function go(id) {
  message.value = "";
  value.value = "";
  engaged.value = false;
  router.go(taskHref(id));
}

// Clear keeps focus in the field so the next query can be typed at once.
function clear() {
  value.value = "";
  message.value = "";
  input.value?.focus();
}

function submit() {
  engaged.value = true;
  if (exact.value) return go(exact.value);
  if (matches.value.length) {
    message.value = "Choose a matching task below, or type an exact task ID.";
    return;
  }
  message.value = value.value.trim()
    ? `No task matches "${value.value.trim()}". Try an ID such as NET-01 or a word such as smb.`
    : "Type a task ID such as NET-01, or a word from a task title.";
}

function leave(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) engaged.value = false;
}
</script>

<template>
  <form
    v-if="!frontmatter.taskId"
    class="goto"
    role="search"
    aria-label="Find a task by ID or title"
    @submit.prevent="submit"
    @focusin="engaged = true"
    @focusout="leave"
  >
    <label class="goto-label" for="goto-task-id">Find task</label>
    <div class="goto-row">
      <div class="goto-field">
        <input
          id="goto-task-id"
          ref="input"
          v-model="value"
          class="goto-input"
          placeholder="NET-01 or smb"
          autocomplete="off"
          spellcheck="false"
          aria-describedby="goto-task-help"
          @input="message = ''; engaged = true"
          @keydown.esc.prevent="clear"
        />
        <button v-if="value" class="goto-clear" type="button" @click="clear">Clear</button>
      </div>
      <button class="goto-button" type="submit">Go</button>
    </div>
    <!-- Pressing inside the panel keeps focus in the field, so a result's
         click lands before focus could leave the form and close it. -->
    <div class="goto-panel" :class="{ 'is-open': open }" @mousedown.prevent>
      <p id="goto-task-help" class="goto-message" role="status" aria-live="polite">
        <template v-if="engaged && message">{{ message }}</template>
        <template v-else-if="engaged && exact">Press Enter to open {{ exact }}: {{ exactTitle }}</template>
        <template v-else-if="engaged && listing">
          {{ matches.length }} {{ matches.length === 1 ? "match" : "matches" }}<template v-if="matches.length > RESULT_LIMIT">, first {{ RESULT_LIMIT }} shown. Keep typing to narrow</template>.
        </template>
      </p>
      <ol v-if="engaged && listing" class="goto-results">
        <li v-for="task in matches.slice(0, RESULT_LIMIT)" :key="task.id">
          <a :href="taskHref(task.id)" @click.prevent="go(task.id)">
            <span class="goto-result-id">{{ task.id }}</span>
            <span class="goto-result-title">{{ task.title }}</span>
            <span class="goto-result-module">{{ task.module }}</span>
          </a>
        </li>
      </ol>
    </div>
  </form>
</template>
