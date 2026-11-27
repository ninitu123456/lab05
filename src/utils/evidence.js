/** Pure selector: '' = all tags */
export function filterByTag(list, tag) {
  return tag ? list.filter((e) => e.tag === tag) : list;
}

/** Pure selector: [[tag, count], ...] sorted A→Z — tag chips are DERIVED from data, never hard-coded */
export function countByTag(list) {
  const counts = new Map();
  for (const e of list) counts.set(e.tag, (counts.get(e.tag) ?? 0) + 1);
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
}