<script setup>
import { computed } from "vue";
import { useData, withBase } from "vitepress";

// The header row above a task or module title. Everything here is derived
// navigation, rendered outside <main>: the breadcrumb, the call-number stamp
// with the task's place in its module, and jumps to the page's own landmarks.
// It implies no progress and no recommended order.

const { frontmatter, theme } = useData();

const isTask = computed(() => Boolean(frontmatter.value.taskId));
const isModule = computed(() => frontmatter.value.pageClass === "module-page");
const moduleLink = computed(() => withBase(`/generated/modules/${frontmatter.value.moduleId}.html`));
const checklistLink = withBase("/checklist/index.html");
const boxRouteLink = withBase("/generated/start.html");

const position = computed(() => frontmatter.value.modulePosition ?? null);
const routeCount = computed(() => (frontmatter.value.routesOut ?? []).length);
const jumps = computed(() => {
  const list = [];
  if (frontmatter.value.firstCommand) list.push({ href: `#${frontmatter.value.firstCommand}`, label: "First command" });
  if (frontmatter.value.resultsKind === "table") list.push({ href: "#results", label: "Result table" });
  if (frontmatter.value.resultsKind === "outcomes") list.push({ href: "#results", label: "Outcomes" });
  list.push({ href: "#explanations-and-troubleshooting", label: "Explanations" });
  list.push({ href: "#task-routes", label: `Routes (${routeCount.value})` });
  return list;
});

// The service-dispatch hub, named by its exact source title.
const hub = computed(() => {
  for (const group of theme.value.sidebar ?? []) {
    const item = (group.items ?? []).find((entry) => entry.taskId === "NET-05");
    if (item) return { id: item.taskId, title: item.taskTitle, link: withBase(`${item.link}.html`) };
  }
  return null;
});
</script>

<template>
  <div v-if="isTask" class="task-header">
    <nav class="task-crumbs" aria-label="Breadcrumb">
      <a :href="checklistLink">Checklist</a>
      <span class="task-crumbs-sep" aria-hidden="true">/</span>
      <a :href="moduleLink">{{ frontmatter.moduleTitle }}</a>
      <span class="task-crumbs-sep" aria-hidden="true">/</span>
      <span class="task-id-pair">
        <span class="task-stamp">{{ frontmatter.taskId }}</span>
        <span v-if="position" class="task-position">task {{ position.index }} of {{ position.total }}</span>
      </span>
    </nav>
    <nav class="task-jumps" aria-label="Jump to a part of this task">
      <a v-for="jump in jumps" :key="jump.href" :href="jump.href">{{ jump.label }}</a>
    </nav>
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
