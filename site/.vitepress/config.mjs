import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitepress";

const sidebar = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./generated/sidebar.json", import.meta.url)),
    "utf8",
  ),
);

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
  },
  head: [
    ["meta", { name: "theme-color", content: "#2563eb" }],
    ["meta", { name: "color-scheme", content: "light dark" }],
  ],
  themeConfig: {
    logo: false,
    siteTitle: "OSCP Master Checklist",
    nav: [
      { text: "Checklist", link: "/checklist/" },
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
      label: "On this task",
    },
    docFooter: {
      prev: "Previous task",
      next: "Next task",
    },
    returnToTopLabel: "Back to top",
    sidebarMenuLabel: "Checklist navigation",
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
