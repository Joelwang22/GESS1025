import { h } from "vue";
import { inBrowser } from "vitepress";
import DefaultTheme from "vitepress/theme";

import SidebarToggle from "./components/SidebarToggle.vue";
import TaskDirectory from "./components/TaskDirectory.vue";
import TaskHeader from "./components/TaskHeader.vue";
import { installCopy } from "./copy.js";
import { installSidebarPorts } from "./sidebar-ports.js";
import { installSidebarScroll } from "./sidebar-scroll.js";

import "./tokens.css";
import "./components.css";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "nav-bar-content-before": () => h(SidebarToggle),
      "doc-before": () => h(TaskHeader),
    });
  },
  enhanceApp({ app, router }) {
    app.component("TaskDirectory", TaskDirectory);
    if (inBrowser) {
      installCopy();
      installSidebarScroll(router);
      installSidebarPorts();
    }
  },
};
