<script setup>
import { computed } from "vue";
import { useData, withBase } from "vitepress";

// The compact location row above a task or module title. It is derived
// navigation rendered outside <main> and implies no progress.

const { frontmatter, theme } = useData();

const isTask = computed(() => Boolean(frontmatter.value.taskId));
const isModule = computed(() => frontmatter.value.pageClass === "module-page");
const isOperatorPage = computed(() => Boolean(frontmatter.value.operatorPage));
const moduleLink = computed(() => withBase(`/generated/modules/${frontmatter.value.moduleId}.html`));
const checklistLink = withBase("/checklist/index.html");
const boxRouteLink = withBase("/generated/start.html");

const position = computed(() => frontmatter.value.modulePosition ?? null);

// The service-dispatch hub, named by its exact source title.
const hub = computed(() => {
  for (const section of theme.value.sidebar ?? []) {
    for (const group of section.items ?? []) {
      const item = (group.items ?? []).find((entry) => entry.taskId === "NET-05");
      if (item) return { id: item.taskId, title: item.taskTitle, link: withBase(`${item.link}.html`) };
    }
  }
  return null;
});
</script>

<template>
  <div v-if="isTask" class="task-header">
    <nav class="task-crumbs" aria-label="Breadcrumb">
      <a :href="moduleLink">{{ frontmatter.moduleTitle }}</a>
      <span v-if="frontmatter.optional" class="task-optional">Optional</span>
    </nav>
    <span v-if="position" class="task-position">{{ isOperatorPage ? "Page" : "Task" }} {{ position.index }} of {{ position.total }}</span>
  </div>
  <div v-else-if="isModule" class="task-header module-header">
    <nav class="task-crumbs" aria-label="Breadcrumb">
      <a :href="checklistLink">Checklist</a>
      <span class="task-crumbs-sep" aria-hidden="true">/</span>
      <span class="task-crumbs-current">{{ frontmatter.moduleTitle }}</span>
      <span class="task-position">{{ frontmatter.moduleTaskCount }} {{ frontmatter.moduleTaskCount === 1 ? "task" : "tasks" }}</span>
    </nav>
    <nav class="task-jumps" aria-label="Related pages">
      <a :href="boxRouteLink">Box route</a>
      <a v-if="hub" :href="hub.link">{{ hub.id }}: {{ hub.title }}</a>
    </nav>
  </div>
</template>
