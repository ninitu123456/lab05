/**
 * Pure pagination math — derived state, computed during render.
 * Clamps out-of-range pages (e.g. page 3 after filtering down to 4 items → page 1).
 */
export function getPageWindow(totalItems, requestedPage, pageSize) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const start = (page - 1) * pageSize;
  return { totalPages, page, start, end: start + pageSize };
}