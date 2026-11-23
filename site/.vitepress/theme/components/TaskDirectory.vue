<script setup>
import { computed } from "vue";
import { useData, withBase } from "vitepress";

const { theme } = useData();

const modules = computed(() =>
  (theme.value.sidebar ?? [])
    .filter((group) => group.moduleTitle)
    .map((group) => ({
      title: group.moduleTitle,
      link: withBase(`${group.moduleLink}.html`),
      tasks: group.items.map((item) => ({
        id: item.taskId,
        title: item.taskTitle,
        link: withBase(`${item.link}.html`),
      })),
    })),
);
</script>

<template>
  <div class="directory">
    <section v-for="module in modules" :key="module.title" class="directory-module" :aria-label="`${module.title} tasks`">
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
