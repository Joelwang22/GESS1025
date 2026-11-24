import { h } from "vue";
import { inBrowser } from "vitepress";
import DefaultTheme from "vitepress/theme";

import GoToTask from "./components/GoToTask.vue";
import HomeJump from "./components/HomeJump.vue";
import SidebarToggle from "./components/SidebarToggle.vue";
import TaskDirectory from "./components/TaskDirectory.vue";
import TaskHeader from "./components/TaskHeader.vue";
import { installCopy } from "./copy.js";
import { installSidebarScroll } from "./sidebar-scroll.js";

import "./tokens.css";
import "./components.css";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "nav-bar-content-before": () => h(SidebarToggle),
      "sidebar-nav-before": () => h(GoToTask),
      "doc-before": () => h(TaskHeader),
    });
  },
  enhanceApp({ app, router }) {
    app.component("TaskDirectory", TaskDirectory);
    app.component("HomeJump", HomeJump);
    if (inBrowser) {
      installCopy();
      installSidebarScroll(router);
    }
  },
};
