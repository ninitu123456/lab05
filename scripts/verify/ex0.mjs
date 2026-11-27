// Exercise 0.1 + 0.2 verification — runs the REAL app (Vite dev server) in Playwright/Chromium
// and writes screenshot evidence to docs/verification/.
//
//   npm run verify:ex0
//
// Nothing in src/, server/ or public/ is touched. Every screenshot is a capture of either the
// running app or a report page built from data recorded in that same run. A failing check is
// still captured and reported as FAIL; the process then exits with code 1.

import { spawn, execSync } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT_DIR = path.join(ROOT, 'docs', 'verification');
const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}/`;
const SCRIPT_NAME = 'scripts/verify/ex0.mjs';

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const pkg = readJson(path.join(ROOT, 'package.json'));
const installed = (name) => {
  try {
    return readJson(path.join(ROOT, 'node_modules', name, 'package.json')).version;
  } catch {
    return 'not installed';
  }
};
const versions = {
  react: `${pkg.dependencies.react} (installed ${installed('react')})`,
  vite: `${pkg.devDependencies.vite} (installed ${installed('vite')})`,
  playwright: installed('playwright'),
};
const osLabel = `${os.version()} ${os.release()} (${os.platform()}/${os.arch()})`;
const runStartedAt = new Date();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const record = (id, label, pass, detail) => {
  results.push({ id, label, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${id}  ${label}  ${detail}`);
};

// ---------------------------------------------------------------------------
// Dev server lifecycle
// ---------------------------------------------------------------------------
async function isUp() {
  try {
    const res = await fetch(BASE_URL);
    return res.ok;
  } catch {
    return false;
  }
}

async function startDevServer() {
  if (await isUp()) {
    console.log(`[dev] Something already serves ${BASE_URL}; reusing it (will not stop it).`);
    return null;
  }
  console.log('[dev] Starting `npm run dev` …');
  const child = spawn(`npm run dev -- --port ${PORT} --strictPort`, {
    cwd: ROOT,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (d) => process.stdout.write(`[vite] ${d}`));
  child.stderr.on('data', (d) => process.stderr.write(`[vite] ${d}`));
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Dev server exited early (code ${child.exitCode})`);
    if (await isUp()) {
      console.log('[dev] Ready.');
      return child;
    }
    await sleep(300);
  }
  throw new Error('Dev server did not become ready within 60s');
}

function stopDevServer(child) {
  if (!child || child.exitCode !== null) return;
  try {
    if (process.platform === 'win32') execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
    else child.kill('SIGTERM');
    console.log('[dev] Stopped.');
  } catch (err) {
    console.warn('[dev] Could not stop dev server:', err.message);
  }
}

// ---------------------------------------------------------------------------
// Minimal DevTools global hook: records which function components ACTUALLY rendered per commit.
// Mirrors React DevTools' logic: new fiber (no alternate) = mount; existing fiber rendered when
// PerformedWork flag (flags & 1) is set; subtrees whose child pointer did not change are skipped.
// ---------------------------------------------------------------------------
const RENDER_HOOK = `(() => {
  const FUNCTION_TAGS = new Set([0, 11, 15]); // FunctionComponent, ForwardRef, SimpleMemoComponent
  // tag 14 (MemoComponent) is only a wrapper; its inner function fiber (tag 0) is recorded instead
  const commits = [];
  const renderers = new Map();
  let nextId = 0;

  const nameOf = (fiber) => {
    let t = fiber.type;
    if (!t) return 'Anonymous';
    if (fiber.tag === 11 && t.render) t = t.render;
    if (typeof t === 'object' && t.type) t = t.type;
    return t.displayName || t.name || 'Anonymous';
  };
  const add = (fiber, out, how) => {
    if (FUNCTION_TAGS.has(fiber.tag)) out.push({ name: nameOf(fiber), how });
  };
  const mountFiber = (fiber, out) => {
    add(fiber, out, 'mount');
    for (let c = fiber.child; c; c = c.sibling) mountFiber(c, out);
  };
  const updateFiber = (next, prev, out) => {
    if ((next.flags & 1) === 1) add(next, out, 'update');
    if (next.child === prev.child) return; // untouched subtree
    for (let c = next.child; c; c = c.sibling) {
      if (c.alternate) updateFiber(c, c.alternate, out);
      else mountFiber(c, out);
    }
  };

  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    renderers,
    supportsFiber: true,
    isDisabled: false,
    inject(renderer) {
      const id = ++nextId;
      renderers.set(id, renderer);
      window.__reactRendererVersion = renderer.version;
      return id;
    },
    onCommitFiberRoot(_id, root) {
      try {
        const current = root.current;
        const prev = current.alternate;
        const rendered = [];
        if (!prev || prev.memoizedState == null || prev.memoizedState.element == null) {
          mountFiber(current, rendered);
        } else {
          updateFiber(current, prev, rendered);
        }
        commits.push({ t: Math.round(performance.now()), rendered });
      } catch (err) {
        commits.push({ t: Math.round(performance.now()), error: String(err), rendered: [] });
      }
    },
    onCommitFiberUnmount() {},
    onPostCommitFiberRoot() {},
    checkDCE() {},
  };
  window.__renderLog = {
    read: () => JSON.parse(JSON.stringify(commits)),
    clear: () => { commits.length = 0; },
  };
})();`;

const readCommits = (page) => page.evaluate(() => window.__renderLog.read());
const clearCommits = (page) => page.evaluate(() => window.__renderLog.clear());
const countRenders = (commits, name) =>
  commits.reduce((n, c) => n + c.rendered.filter((r) => r.name === name).length, 0);

// ---------------------------------------------------------------------------
// Report pages (rendered in Chromium, then screenshotted)
// ---------------------------------------------------------------------------
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

function reportHtml({ title, subtitle, steps, table, verdicts, notes = [] }) {
  const head = table.columns.map((c) => `<th>${esc(c)}</th>`).join('');
  const body = table.rows.length
    ? table.rows.map((r) => `<tr>${r.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${table.columns.length}" class="empty">${esc(table.empty ?? 'No rows recorded')}</td></tr>`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  body{margin:0;padding:28px 32px;font:14px/1.5 "Segoe UI",system-ui,sans-serif;background:#fff;color:#1b1f24}
  h1{font-size:22px;margin:0 0 4px} .sub{color:#57606a;margin:0 0 16px}
  .meta{display:grid;grid-template-columns:max-content 1fr;gap:2px 14px;font-size:13px;background:#f6f8fa;
        border:1px solid #d0d7de;border-radius:8px;padding:10px 14px;margin-bottom:16px}
  .meta b{color:#57606a;font-weight:600}
  ol{margin:0 0 16px;padding-left:20px}
  table{border-collapse:collapse;width:100%;font-size:13px;margin-bottom:16px}
  th,td{border:1px solid #d0d7de;padding:6px 10px;text-align:left;vertical-align:top}
  th{background:#f6f8fa} td.empty{color:#57606a;font-style:italic;text-align:center}
  code{font:12px Consolas,monospace;background:#eff1f3;padding:1px 4px;border-radius:4px}
  .tag{display:inline-block;font:12px Consolas,monospace;padding:1px 6px;margin:1px 3px 1px 0;border-radius:4px;background:#eff1f3}
  .tag.mount{background:#ddf4ff} .tag.hit{background:#ffebe9;outline:1px solid #cf222e}
  .verdict{font-size:16px;font-weight:600;padding:10px 14px;border-radius:8px;margin:6px 0}
  .PASS{background:#dafbe1;color:#116329;border:1px solid #4ac26b}
  .FAIL{background:#ffebe9;color:#a40e26;border:1px solid #ff8182}
  .notes{color:#57606a;font-size:12.5px} footer{margin-top:18px;color:#57606a;font-size:12px;border-top:1px solid #d0d7de;padding-top:8px}
</style></head><body>
<h1>${esc(title)}</h1><p class="sub">${esc(subtitle)}</p>
<div class="meta">
  <b>Run at</b><span>${esc(runStartedAt.toISOString())} (local ${esc(runStartedAt.toLocaleString())})</span>
  <b>React</b><span>${esc(versions.react)}</span>
  <b>Vite</b><span>${esc(versions.vite)}</span>
  <b>App URL</b><span>${esc(BASE_URL)} (npm run dev, StrictMode)</span>
</div>
<ol>${steps.map((s) => `<li>${s}</li>`).join('')}</ol>
<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
${verdicts.map((v) => `<div class="verdict ${v.pass ? 'PASS' : 'FAIL'}">${esc(v.text)} → ${v.pass ? 'PASS' : 'FAIL'}</div>`).join('')}
${notes.map((n) => `<p class="notes">${n}</p>`).join('')}
<footer>Generated by ${esc(SCRIPT_NAME)} via Playwright ${esc(versions.playwright)} (Chromium) on ${esc(osLabel)}</footer>
</body></html>`;
}

async function shootReport(browser, file, spec) {
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
  await page.setContent(reportHtml(spec), { waitUntil: 'load' });
  await page.screenshot({ path: path.join(OUT_DIR, file), fullPage: true });
  await page.close();
  console.log(`[shot] docs/verification/${file}`);
}

const renderedCell = (rendered, highlight = []) =>
  rendered.length
    ? rendered
        .map((r) => `<span class="tag ${r.how}${highlight.includes(r.name) ? ' hit' : ''}">${esc(r.name)}${r.how === 'mount' ? ' (mount)' : ''}</span>`)
        .join('')
    : '<i>(none)</i>';

const commitRows = (commits, highlight) =>
  commits.map((c, i) => [String(i + 1), `${c.t} ms`, renderedCell(c.rendered, highlight) + (c.error ? ` <b>hook error: ${esc(c.error)}</b>` : '')]);

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------
async function openApp(context) {
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: 'load' });
  await page.locator('[role="tablist"]').waitFor();
  return page;
}

/** Wait until no new commit has happened for `quietMs`. */
async function settle(page, quietMs = 700, maxMs = 8000) {
  const start = Date.now();
  let last = (await readCommits(page)).length;
  let quietSince = Date.now();
  while (Date.now() - start < maxMs) {
    await sleep(100);
    const n = (await readCommits(page)).length;
    if (n !== last) {
      last = n;
      quietSince = Date.now();
    } else if (Date.now() - quietSince >= quietMs) return;
  }
}

async function ex01AndPageChange(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.addInitScript(RENDER_HOOK);
  const page = await openApp(context);
  await settle(page, 1000);
  const rendererVersion = await page.evaluate(() => window.__reactRendererVersion ?? 'unknown');
  console.log(`[hook] React renderer injected, version ${rendererVersion}`);

  // ---- Test 1: Evidence → Chat → Reels ----
  await clearCommits(page);
  await page.click('#tab-evidence');
  await page.locator('.evidence-grid').waitFor();
  await settle(page);
  await page.click('#tab-chat');
  await settle(page);
  await page.click('#tab-reels');
  await settle(page, 1000);
  const tabCommits = await readCommits(page);
  const themeRenders = countRenders(tabCommits, 'ThemeToggle');
  const appRenders = countRenders(tabCommits, 'App');
  record('0.1-A', 'ThemeToggle never renders on tab switch', themeRenders === 0,
    `ThemeToggle=${themeRenders}, App=${appRenders}, commits=${tabCommits.length}`);
  await shootReport(browser, 'ex0.1-profiler-tabs.png', {
    title: 'Exercise 0.1 — Split Context: tab switch',
    subtitle: 'Render-commit hook (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) used instead of the React DevTools Profiler UI',
    steps: [
      'Load app (default tab: Reels), wait for commits to settle, clear the log.',
      'Click tab <code>Evidence</code> → wait for <code>.evidence-grid</code> + settle.',
      'Click tab <code>Chat</code> → settle. Click tab <code>Reels</code> → settle.',
      `Hook records function components rendered in each commit (new fiber = mount, else <code>flags &amp; 1</code> PerformedWork). Renderer version: <code>${esc(rendererVersion)}</code>.`,
    ],
    table: { columns: ['Commit #', 'Time', 'Components rendered'], rows: commitRows(tabCommits, ['ThemeToggle', 'App']) },
    verdicts: [
      { text: `ThemeToggle rendered: ${themeRenders} times`, pass: themeRenders === 0 },
      { text: `App rendered: ${appRenders} times`, pass: appRenders === 0 },
    ],
    notes: ['Reels tab calls the backend API; if the backend is not running it shows a load error. That does not affect Exercise 0.'],
  });

  // ---- Test 2: click the active tab 3× ----
  const activeTab = await page.locator('[role="tab"][aria-selected="true"]').getAttribute('id');
  await settle(page, 1000);
  await clearCommits(page);
  for (let i = 0; i < 3; i++) {
    await page.click(`#${activeTab}`);
    await sleep(250);
  }
  await settle(page, 1000);
  const sameCommits = await readCommits(page);
  const nonEmpty = sameCommits.filter((c) => c.rendered.length > 0).length;
  record('0.1-B', 'Clicking the active tab 3× produces 0 commits', sameCommits.length === 0,
    `commits=${sameCommits.length} (with rendered components: ${nonEmpty})`);
  await shootReport(browser, 'ex0.1-profiler-same-tab.png', {
    title: 'Exercise 0.1 — Split Context: click the already-active tab',
    subtitle: 'Reducer returns the same state reference for SET_ACTIVE_TAB on the active tab → React should bail out',
    steps: [
      `Active tab: <code>#${esc(activeTab)}</code>. Wait for commits to settle, clear the log.`,
      `Click <code>#${esc(activeTab)}</code> 3 times (250 ms apart), then wait 1 s with no new commits.`,
    ],
    table: { columns: ['Commit #', 'Time', 'Components rendered'], rows: commitRows(sameCommits), empty: 'No commit recorded' },
    verdicts: [
      { text: `Commits recorded: ${sameCommits.length} (expected 0)`, pass: sameCommits.length === 0 },
      { text: `Components rendered across those commits: ${sameCommits.reduce((n, c) => n + c.rendered.length, 0)}`, pass: nonEmpty === 0 },
    ],
    notes: [
      'The first verdict is the stated criterion (0 commits). The second is shown for context: a commit with no rendered component means React re-ran the reducer, got the same state reference and bailed out of every component, but still committed the root.',
    ],
  });

  // ---- Test 4 (Ex 0.2): page 1 → 2 ----
  await page.click('#tab-evidence');
  await page.locator('.evidence-grid').waitFor();
  await settle(page);
  const pageBefore = await page.locator('.pagination [aria-current="page"]').textContent();
  await clearCommits(page);
  await page.click('.pagination button[aria-label="Page 2"]');
  await settle(page);
  const pageAfter = await page.locator('.pagination [aria-current="page"]').textContent();
  const pageCommits = await readCommits(page);
  const forbidden = ['App', 'ThemeToggle', 'EvidencePanel'];
  const counts = Object.fromEntries(forbidden.map((n) => [n, countRenders(pageCommits, n)]));
  const pagePass = forbidden.every((n) => counts[n] === 0);
  record('0.2-B', 'Page 1→2: App, ThemeToggle, EvidencePanel do not render', pagePass,
    `${forbidden.map((n) => `${n}=${counts[n]}`).join(', ')}; page ${pageBefore}→${pageAfter}`);
  await shootReport(browser, 'ex0.2-profiler-page.png', {
    title: 'Exercise 0.2 — Render isolation on page change',
    subtitle: 'Same render-commit hook as Exercise 0.1',
    steps: [
      'Open tab <code>Evidence</code>, wait for the grid, settle, clear the log.',
      `Click pagination button <code>Page 2</code> (current page before: ${esc(pageBefore)}, after: ${esc(pageAfter)}).`,
    ],
    table: { columns: ['Commit #', 'Time', 'Components rendered'], rows: commitRows(pageCommits, forbidden) },
    verdicts: forbidden.map((n) => ({ text: `${n} rendered: ${counts[n]} times`, pass: counts[n] === 0 })),
    notes: [
      'Highlighted in red: components expected NOT to render.',
      'Reading the source: <code>TabPanel</code> calls <code>useAppState()</code>, so it re-renders on every state change (including <code>currentPage</code>); its child <code>PanelContent</code> then returns a new <code>&lt;EvidencePanel /&gt;</code> element, so <code>EvidencePanel</code> re-renders too.',
    ],
  });

  await context.close();
}

async function ex02Network(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const t0 = Date.now();
  const reqs = [];
  const isEvidence = (r) => new URL(r.url()).pathname.endsWith('/evidence.json');
  page.on('request', (r) => {
    if (isEvidence(r)) reqs.push({ req: r, url: r.url(), start: Date.now() - t0, outcome: 'pending', end: null });
  });
  page.on('requestfinished', async (r) => {
    const e = reqs.find((x) => x.req === r);
    if (!e) return;
    const res = await r.response();
    e.outcome = `HTTP ${res ? res.status() : '?'}`;
    e.status = res?.status();
    e.end = Date.now() - t0;
  });
  page.on('requestfailed', (r) => {
    const e = reqs.find((x) => x.req === r);
    if (!e) return;
    e.outcome = `failed: ${r.failure()?.errorText ?? 'unknown'}`;
    e.aborted = /ERR_ABORTED/.test(r.failure()?.errorText ?? '');
    e.end = Date.now() - t0;
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.locator('#tab-evidence').click(); // open Evidence while the page is still loading
  await page.locator('.evidence-grid').waitFor();
  await page.waitForLoadState('networkidle');
  await sleep(300);
  await page.screenshot({ path: path.join(OUT_DIR, 'ex0.2-evidence-desktop.png') });
  console.log('[shot] docs/verification/ex0.2-evidence-desktop.png');

  const aborted = reqs.filter((r) => r.aborted).length;
  const ok = reqs.filter((r) => r.status === 200).length;
  const pass = aborted === 1 && ok === 1 && reqs.length === 2;
  record('0.2-A', 'StrictMode: 1 aborted + 1 HTTP 200 for evidence.json', pass,
    `requests=${reqs.length}, aborted=${aborted}, 200=${ok}`);
  await shootReport(browser, 'ex0.2-network-abort.png', {
    title: 'Exercise 0.2 — AbortController teardown (StrictMode)',
    subtitle: 'Playwright request / requestfinished / requestfailed events for evidence.json',
    steps: [
      'Fresh browser context (empty cache). Listeners attached before navigation.',
      'Navigate to the app, click tab <code>Evidence</code> as soon as the DOM is ready.',
      'StrictMode mounts → unmounts → re-mounts <code>EvidencePanel</code>; teardown calls <code>controller.abort()</code>.',
    ],
    table: {
      columns: ['#', 'URL', 'Status / failure', 'Started (ms)', 'Ended (ms)'],
      rows: reqs.map((r, i) => [String(i + 1), `<code>${esc(r.url)}</code>`, esc(r.outcome), String(r.start), String(r.end ?? '—')]),
    },
    verdicts: [{ text: `Requests: ${reqs.length} · aborted (net::ERR_ABORTED): ${aborted} · HTTP 200: ${ok} (expected 1 + 1)`, pass }],
    notes: ['Times are relative to the start of navigation.'],
  });
  await context.close();
}

async function ex02Mobile(browser) {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await openApp(context);
  await page.locator('#tab-evidence').click();
  await page.locator('.evidence-grid').waitFor();
  await page.waitForLoadState('networkidle');
  await sleep(300);
  const m = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    columns: getComputedStyle(document.querySelector('.evidence-grid')).gridTemplateColumns,
  }));
  const colCount = m.columns.trim().split(/\s+/).length;
  record('0.2-C1', 'Mobile 375px: no horizontal scroll', m.scrollWidth <= m.innerWidth,
    `scrollWidth=${m.scrollWidth}, innerWidth=${m.innerWidth}`);
  record('0.2-C2', 'Mobile 375px: evidence grid is 1 column', colCount === 1,
    `gridTemplateColumns="${m.columns}" → ${colCount} column(s)`);
  await page.screenshot({ path: path.join(OUT_DIR, 'ex0.2-mobile.png'), fullPage: true });
  console.log('[shot] docs/verification/ex0.2-mobile.png');
  await context.close();
}

// ---------------------------------------------------------------------------
async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`React ${versions.react} · Vite ${versions.vite} · Playwright ${versions.playwright} · ${osLabel}`);
  const server = await startDevServer();
  let browser;
  try {
    browser = await chromium.launch();
    await ex01AndPageChange(browser);
    await ex02Network(browser);
    await ex02Mobile(browser);
  } finally {
    await browser?.close();
    stopDevServer(server);
  }

  console.log('\n=== Summary ===');
  for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.id.padEnd(7)} ${r.label} — ${r.detail}`);
  if (results.some((r) => !r.pass)) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
