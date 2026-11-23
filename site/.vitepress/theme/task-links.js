import { withBase } from "vitepress";

export { normalizeTaskId } from "./task-id.js";

export function taskHref(id) {
  return withBase(`/generated/tasks/${id.toLowerCase()}.html`);
}

export function moduleHref(link) {
  return withBase(`${link}.html`);
}
