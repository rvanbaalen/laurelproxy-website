#!/usr/bin/env node
/**
 * Post-build guard.
 *
 * Astro's Cloudflare adapter prerenders inside workerd. When a prerender throws
 * (e.g. a missing `nodejs_compat` flag breaking `node:path/posix`), it logs the
 * error, writes a 0-byte HTML file, and the build still exits 0. That shipped a
 * fully blank site to production once already, so the build now verifies its own
 * output instead of trusting the exit code.
 *
 * Fails the build if any prerendered page is empty or structurally incomplete.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const CLIENT_DIR = "dist/client";
// Real pages here are 18KB+. 1KB is far below any legitimate page but well
// above the 0-byte failure mode, so it catches truncation without false alarms.
const MIN_BYTES = 1024;

function findHtml(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findHtml(path));
    else if (entry.name.endsWith(".html")) out.push(path);
  }
  return out;
}

let pages;
try {
  pages = findHtml(CLIENT_DIR);
} catch {
  console.error(`\n✗ Build verification failed: ${CLIENT_DIR}/ does not exist.`);
  process.exit(1);
}

if (pages.length === 0) {
  console.error(`\n✗ Build verification failed: no HTML emitted into ${CLIENT_DIR}/.`);
  process.exit(1);
}

const failures = [];
for (const page of pages) {
  const size = statSync(page).size;
  const rel = relative(CLIENT_DIR, page);

  if (size === 0) {
    failures.push(`${rel} — 0 bytes (prerender almost certainly threw)`);
    continue;
  }
  if (size < MIN_BYTES) {
    failures.push(`${rel} — only ${size} bytes (expected >= ${MIN_BYTES})`);
    continue;
  }

  const html = readFileSync(page, "utf8");
  if (!html.includes("</html>")) {
    failures.push(`${rel} — missing closing </html> (truncated output)`);
  } else if (!/<title>[^<]+<\/title>/.test(html)) {
    failures.push(`${rel} — missing a non-empty <title>`);
  }
}

if (failures.length > 0) {
  console.error(`\n✗ Build verification failed — ${failures.length}/${pages.length} page(s) bad:\n`);
  for (const failure of failures) console.error(`    ${failure}`);
  console.error(
    "\n  If every page failed, check that wrangler.jsonc still sets the" +
      '\n  "nodejs_compat" compatibility flag — the prerender runs in workerd.\n'
  );
  process.exit(1);
}

console.log(`✓ Build verified: ${pages.length} pages, all non-empty and well-formed.`);
