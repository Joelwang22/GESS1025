import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitepress";

import { checklistMarkdown } from "./markdown.mjs";

function readJson(relative) {
  return JSON.parse(readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8"));
}

const generatedSidebar = readJson("./generated/sidebar.json");
const catalog = readJson("./generated/catalog.json");
const source = readJson("../../content/source.json");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// The generated sidebar keeps "ID · Title" labels. The rendered sidebar sets
// the call number in its own column so long titles hang beside it.
const sidebar = generatedSidebar.map((group, index) => ({
  text: `<span class="sb-module">${escapeHtml(group.text)}</span><span class="sb-count">${group.items.length}</span>`,
  collapsed: group.collapsed,
  moduleTitle: group.text,
  moduleLink: catalog.modules[index].link,
  items: group.items.map((item) => {
    const [id, ...title] = item.text.split(" · ");
    return {
      text: `<span class="sb-id">${escapeHtml(id)}</span> <span class="sb-title">${escapeHtml(title.join(" · "))}</span>`,
      link: item.link,
      taskId: id,
      taskTitle: title.join(" · "),
    };
  }),
}));

const markdown = checklistMarkdown({
  terminalStates: new Set(source.terminalStates),
  taskTitles: new Map(catalog.tasks.map(({ id, title }) => [id, title])),
});

export default defineConfig({
  title: "OSCP Master Checklist",
  description:
    "A searchable reading interface for the Operator Workbench OSCP master checklist.",
  lang: "en-US",
  base: "/checklist/",
  cleanUrls: false,
  ignoreDeadLinks: false,
  lastUpdated: false,
  markdown: {
    lineNumbers: false,
    theme: { light: "github-dark", dark: "github-dark" },
    codeTransformers: markdown.codeTransformers,
    config: markdown.config,
  },
  head: [
    ["meta", { name: "theme-color", content: "#f6f6f3", media: "(prefers-color-scheme: light)" }],
    ["meta", { name: "theme-color", content: "#111417", media: "(prefers-color-scheme: dark)" }],
    ["meta", { name: "color-scheme", content: "light dark" }],
  ],
  themeConfig: {
    logo: false,
    siteTitle: "OSCP Master Checklist",
    nav: [
      { text: "Box route", link: "/generated/start" },
      { text: "Modules", link: "/checklist/" },
      { text: "Source", link: "/about/source" },
    ],
    sidebar,
    search: {
      provider: "local",
      options: {
        detailedView: true,
      },
    },
    outline: {
      level: [2, 3],
      label: "On this page",
    },
    docFooter: {
      prev: "Previous in source order",
      next: "Next in source order",
    },
    returnToTopLabel: "Back to top",
    sidebarMenuLabel: "Modules and tasks",
    darkModeSwitchLabel: "Theme",
    lightModeSwitchTitle: "Use light theme",
    darkModeSwitchTitle: "Use dark theme",
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/Joelwang22/checklist",
        ariaLabel: "Checklist repository on GitHub",
      },
    ],
  },
});
