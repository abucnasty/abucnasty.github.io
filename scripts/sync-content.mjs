#!/usr/bin/env node
/**
 * Content sync: copies curated benchmark folders from a local clone of
 * `factorio-benchmarks` into this site, rewriting markdown asset paths and
 * emitting a typed index that the React app imports.
 *
 * - README.md is rewritten and written to src/generated/benchmarks/<slug>/README.md
 * - All other non-`.zip` files are copied (preserving sub-paths) to public/benchmarks/<slug>/
 * - `.zip` files are NOT copied; raw GitHub URLs are emitted in the index instead.
 * - Blueprints README is copied to src/generated/blueprints.md
 *
 * Source repo path resolution:
 *   1. $FACTORIO_BENCHMARKS_PATH  (preferred — used in CI)
 *   2. ../factorio/factorio-benchmarks  (local dev fallback)
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const MANIFEST_PATH = path.join(ROOT, 'content', 'manifest.json');
const GENERATED_DIR = path.join(ROOT, 'src', 'generated');
const PUBLIC_BENCHMARKS_DIR = path.join(ROOT, 'public', 'benchmarks');

const SOURCE_REPO_PATH =
  process.env.FACTORIO_BENCHMARKS_PATH ??
  path.resolve(ROOT, '..', 'factorio', 'factorio-benchmarks');

/** @typedef {{ slug: string, source: string, title: string, date?: string, summary?: string, tags?: string[], featured?: boolean }} BenchmarkEntry */
/** @typedef {{ sourceRepo: { owner: string, repo: string, branch: string }, blueprintsSource: string, benchmarks: BenchmarkEntry[] }} Manifest */

async function main() {
  const manifest = /** @type {Manifest} */ (
    JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'))
  );

  await assertSourceExists();
  await resetOutputDirs();

  const githubBase = `https://github.com/${manifest.sourceRepo.owner}/${manifest.sourceRepo.repo}`;
  const rawBase = `https://raw.githubusercontent.com/${manifest.sourceRepo.owner}/${manifest.sourceRepo.repo}/${manifest.sourceRepo.branch}`;

  const benchmarks = [];
  for (const entry of manifest.benchmarks) {
    const result = await syncBenchmark(entry, githubBase, rawBase);
    benchmarks.push(result);
    log(`✓ ${entry.slug} (${result.assetCount} assets, ${result.saves.length} saves)`);
  }

  await syncBlueprints(manifest.blueprintsSource, rawBase);
  log(`✓ blueprints.md`);

  await fs.mkdir(GENERATED_DIR, { recursive: true });
  await fs.writeFile(
    path.join(GENERATED_DIR, 'index.json'),
    JSON.stringify({ sourceRepo: manifest.sourceRepo, benchmarks }, null, 2),
  );
  log(`✓ index.json (${benchmarks.length} benchmarks)`);
}

/**
 * @param {BenchmarkEntry} entry
 * @param {string} githubBase
 * @param {string} rawBase
 */
async function syncBenchmark(entry, githubBase, rawBase) {
  const srcDir = path.join(SOURCE_REPO_PATH, entry.source);
  await assertDir(srcDir, `benchmark source missing: ${entry.source}`);

  const outMdDir = path.join(GENERATED_DIR, 'benchmarks', entry.slug);
  const outAssetsDir = path.join(PUBLIC_BENCHMARKS_DIR, entry.slug);
  await fs.mkdir(outMdDir, { recursive: true });
  await fs.mkdir(outAssetsDir, { recursive: true });

  const files = await walk(srcDir);
  const saves = [];
  let assetCount = 0;

  for (const absFile of files) {
    const rel = path.relative(srcDir, absFile);
    const ext = path.extname(rel).toLowerCase();

    // Skip macOS noise
    if (path.basename(rel) === '.DS_Store') continue;

    if (ext === '.zip') {
      saves.push({
        name: path.basename(rel),
        path: rel.split(path.sep).join('/'),
        url: `${rawBase}/${entry.source}/${rel.split(path.sep).join('/')}`,
      });
      continue;
    }

    if (rel.toLowerCase() === 'readme.md') {
      const raw = await fs.readFile(absFile, 'utf8');
      const rewritten = rewriteMarkdownAssetPaths(raw, entry.slug);
      await fs.writeFile(path.join(outMdDir, 'README.md'), rewritten);
      continue;
    }

    // Everything else (images, svgs, csvs, supplementary md) → public assets.
    const dest = path.join(outAssetsDir, rel);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(absFile, dest);
    assetCount++;
  }

  return {
    ...entry,
    githubUrl: `${githubBase}/tree/${'master'}/${entry.source}`,
    readmeGithubUrl: `${githubBase}/blob/master/${entry.source}/README.md`,
    saves,
    assetCount,
  };
}

/**
 * Rewrite markdown asset references so they point at /benchmarks/<slug>/...
 * Handles ![alt](path), <img src="path">, and any href that starts with `./`.
 * Leaves absolute URLs (http://, https://, /), anchors (#), and `mailto:` alone.
 *
 * @param {string} markdown
 * @param {string} slug
 */
function rewriteMarkdownAssetPaths(markdown, slug) {
  const prefix = `/benchmarks/${slug}`;

  const rewritePath = (p) => {
    const trimmed = p.trim();
    if (!trimmed) return trimmed;
    if (/^[a-z]+:/i.test(trimmed)) return trimmed; // http:, https:, mailto:, data:
    if (trimmed.startsWith('#')) return trimmed;
    if (trimmed.startsWith('/')) return trimmed; // already site-absolute
    const normalized = trimmed.replace(/^\.\//, '');
    return `${prefix}/${normalized}`;
  };

  // ![alt](path "title"?)
  let out = markdown.replace(/(!\[[^\]]*\]\()([^)\s]+)([^)]*\))/g, (_m, pre, p, post) => {
    return `${pre}${rewritePath(p)}${post}`;
  });

  // <img src="..."> / <img src='...'>
  out = out.replace(/(<img\b[^>]*\bsrc\s*=\s*)(["'])([^"']+)(\2)/gi, (_m, pre, q, p, qq) => {
    return `${pre}${q}${rewritePath(p)}${qq}`;
  });

  return out;
}

/**
 * @param {string} blueprintsSource
 * @param {string} rawBase
 */
async function syncBlueprints(blueprintsSource, rawBase) {
  const srcFile = path.join(SOURCE_REPO_PATH, blueprintsSource);
  await assertFile(srcFile, `blueprints source missing: ${blueprintsSource}`);

  const raw = await fs.readFile(srcFile, 'utf8');
  // Rewrite local icon refs (e.g. ../icons/foo.png) → raw GitHub URLs so we
  // don't have to bundle the icon set into this repo.
  const baseDir = path.posix.dirname(blueprintsSource);
  const rewritten = raw.replace(
    /(!\[[^\]]*\]\()([^)\s]+)([^)]*\))/g,
    (_m, pre, p, post) => {
      const trimmed = p.trim();
      if (/^[a-z]+:/i.test(trimmed) || trimmed.startsWith('#')) return `${pre}${trimmed}${post}`;
      const resolved = path.posix.normalize(`${baseDir}/${trimmed}`);
      return `${pre}${rawBase}/${resolved}${post}`;
    },
  );

  await fs.mkdir(GENERATED_DIR, { recursive: true });
  await fs.writeFile(path.join(GENERATED_DIR, 'blueprints.md'), rewritten);
}

/** @param {string} dir */
async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (e.isFile()) {
      out.push(full);
    }
  }
  return out;
}

async function resetOutputDirs() {
  await fs.rm(path.join(GENERATED_DIR, 'benchmarks'), { recursive: true, force: true });
  await fs.rm(path.join(GENERATED_DIR, 'blueprints.md'), { force: true });
  await fs.rm(path.join(GENERATED_DIR, 'index.json'), { force: true });
  await fs.rm(PUBLIC_BENCHMARKS_DIR, { recursive: true, force: true });
  await fs.mkdir(GENERATED_DIR, { recursive: true });
  await fs.mkdir(PUBLIC_BENCHMARKS_DIR, { recursive: true });
}

async function assertSourceExists() {
  try {
    const stat = await fs.stat(SOURCE_REPO_PATH);
    if (!stat.isDirectory()) throw new Error('not a directory');
  } catch {
    throw new Error(
      `factorio-benchmarks source not found at: ${SOURCE_REPO_PATH}\n` +
        `Set FACTORIO_BENCHMARKS_PATH to point at your local clone.`,
    );
  }
}

/** @param {string} p @param {string} msg */
async function assertDir(p, msg) {
  try {
    const s = await fs.stat(p);
    if (!s.isDirectory()) throw new Error('not a directory');
  } catch {
    throw new Error(`${msg} (looked at ${p})`);
  }
}

/** @param {string} p @param {string} msg */
async function assertFile(p, msg) {
  try {
    const s = await fs.stat(p);
    if (!s.isFile()) throw new Error('not a file');
  } catch {
    throw new Error(`${msg} (looked at ${p})`);
  }
}

function log(msg) {
  // eslint-disable-next-line no-console
  console.log(`[sync-content] ${msg}`);
}

main().catch((err) => {
  console.error(`[sync-content] ✗ ${err.message}`);
  process.exit(1);
});
