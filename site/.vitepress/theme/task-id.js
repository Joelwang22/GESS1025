// Accepts "web-09", "WEB09", "web 9" or "lpriv-2" and returns the canonical
// task ID shape "WEB-09". Returns null for anything else.
export function normalizeTaskId(value) {
  const compact = String(value ?? "").toUpperCase().replace(/\s+/g, "");
  const match = /^([A-Z][A-Z0-9]*?)-?(\d{1,2})$/.exec(compact);
  if (!match) return null;
  return `${match[1]}-${match[2].padStart(2, "0")}`;
}

// Matches tasks whose ID, title or module contains every typed word, in
// source order. "smb" finds the SMB tasks; "suid bash" needs both words.
export function matchTasks(tasks, query) {
  const words = String(query ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return [];
  // A loosely typed ID ("web9", "lpriv 2") also matches its task exactly.
  const looseId = normalizeTaskId(query);
  return tasks.filter(({ id, title, module }) => {
    if (looseId && id === looseId) return true;
    const haystack = `${id} ${title} ${module ?? ""}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}
