import { h } from "vue";
import { inBrowser } from "vitepress";
import DefaultTheme from "vitepress/theme";

import PlaceholderSettings from "./components/PlaceholderSettings.vue";
import SidebarToggle from "./components/SidebarToggle.vue";
import TaskDirectory from "./components/TaskDirectory.vue";
import TaskHeader from "./components/TaskHeader.vue";
import { installCopy } from "./copy.js";
import { installPlaceholders } from "./placeholders.js";
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
      "nav-bar-content-after": () => h(PlaceholderSettings),
      "doc-before": () => h(TaskHeader),
    });
  },
  enhanceApp({ app, router }) {
    app.component("TaskDirectory", TaskDirectory);
    if (inBrowser) {
      installCopy();
      installPlaceholders(router);
      installSidebarScroll(router);
      installSidebarPorts();
    }
  },
};
