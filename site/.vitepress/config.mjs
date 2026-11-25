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
const moduleByTitle = new Map(catalog.modules.map((module) => [module.title, module]));
function renderGroup(group, isSection = false) {
  const module = isSection ? null : moduleByTitle.get(group.text);
  if (isSection || !module) {
    return {
      text: `<span class="sb-section">${escapeHtml(group.text)}</span><span class="sb-count">${group.items.length}</span>`,
      collapsed: group.collapsed,
      items: group.items.map((item) => renderGroup(item)),
    };
  }
  const ports = module.ports ?? [];
  const shownPorts = ports.slice(0, 3);
  const extraPorts = ports.length - shownPorts.length;
  const portMarkup = ports.length
    ? `<span class="sb-ports" title="${escapeHtml(ports.join(" · "))}">${escapeHtml(
        extraPorts > 0 ? `${shownPorts.join(" · ")} +${extraPorts}` : shownPorts.join(" · "),
      )}</span>`
    : "";
  return {
    text: `<span class="sb-name"><span class="sb-module">${escapeHtml(group.text)}</span>${portMarkup}</span><span class="sb-count">${group.items.length}</span>`,
    collapsed: group.collapsed,
    moduleTitle: group.text,
    moduleLink: module.link,
    modulePorts: ports,
    items: group.items.map((item) => {
      const [id, ...title] = item.text.split(" · ");
      return {
        text: `<span class="sb-id">${escapeHtml(id)}</span> <span class="sb-title">${escapeHtml(title.join(" · "))}</span>`,
        link: item.link,
        taskId: id,
        taskTitle: title.join(" · "),
      };
    }),
  };
}

const sidebar = generatedSidebar.map((group) => renderGroup(group, true));

const markdown = checklistMarkdown({
  terminalStates: new Set(source.terminalStates),
  taskTitles: new Map(catalog.tasks.map(({ id, title }) => [id, title])),
});

export default defineConfig({
  title: "OSCP Checklist",
  description:
    "A command-first OSCP checklist with finding-driven operator pages and task detail.",
  lang: "en-US",
  base: "/GESS1025/",
  cleanUrls: false,
  ignoreDeadLinks: false,
  lastUpdated: false,
  markdown: {
    lineNumbers: false,
    theme: { light: "github-dark-dimmed", dark: "github-dark-dimmed" },
    codeTransformers: markdown.codeTransformers,
    config: markdown.config,
  },
  head: [["meta", { name: "color-scheme", content: "light dark" }]],
  transformHead({ pageData }) {
    const target = pageData.frontmatter.redirectTarget;
    return target
      ? [["meta", { "http-equiv": "refresh", content: `0;url=${target}` }]]
      : [];
  },
  // VitePress keeps one meta tag per name, so the light and dark browser
  // chrome colours are written into the final HTML instead of `head`.
  transformHtml(code) {
    return code.replace(
      "</head>",
      '<meta name="theme-color" content="#faf9f5" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#151a22" media="(prefers-color-scheme: dark)"></head>',
    );
  },
  themeConfig: {
    logo: false,
    siteTitle: "OSCP Checklist",
    nav: [],
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
      prev: "Previous",
      next: "Next",
    },
    returnToTopLabel: "Back to top",
    sidebarMenuLabel: "Browse",
    darkModeSwitchLabel: "Theme",
    lightModeSwitchTitle: "Use light theme",
    darkModeSwitchTitle: "Use dark theme",
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/Joelwang22/GESS1025",
        ariaLabel: "Checklist repository on GitHub",
      },
    ],
  },
});
