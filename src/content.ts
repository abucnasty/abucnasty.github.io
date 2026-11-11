// Types for the generated content index produced by scripts/sync-content.mjs.

export interface SourceRepo {
  owner: string;
  repo: string;
  branch: string;
}

export interface BenchmarkSave {
  /** File name only, e.g. "bench_44k_01_clock.zip". */
  name: string;
  /** Path within the source benchmark folder. */
  path: string;
  /** Direct download URL (github.com raw with ?download= for LFS support). */
  url: string;
}

export interface BenchmarkEntry {
  slug: string;
  source: string;
  title: string;
  date?: string;
  summary?: string;
  tags?: string[];
  featured?: boolean;
  factorioVersion?: string;
  platform?: string;
  githubUrl: string;
  readmeGithubUrl: string;
  saves: BenchmarkSave[];
  assetCount: number;
  /** True when scripts/sync-content.mjs emitted a timeseries.json next to the README. */
  timeseries?: boolean;
}

export interface ContentIndex {
  sourceRepo: SourceRepo;
  benchmarks: BenchmarkEntry[];
}

export interface BlueprintEntry {
  description: string;
  version?: string;
  author?: string;
  factoriobinUrl?: string;
  factoriobinPreviewUrl?: string;
  youtubeUrl?: string;
  deprecated: boolean;
}

export interface BlueprintCategory {
  id: string;
  parent: string;
  name: string;
  iconUrl?: string;
  entries: BlueprintEntry[];
}

export interface BlueprintIndex {
  categories: BlueprintCategory[];
}

/**
 * One save in `src/generated/saves.json`:
 * `[path within the source repo, size in bytes, git-lfs sha256 oid]`.
 * A tuple rather than an object so ~650 entries stay small.
 */
export type SaveIndexFile = [path: string, bytes: number, oid: string];

/** Metadata for a top-level folder (`benchmarks/<name>`, `competitions/<name>`). */
export interface SaveFolderMeta {
  /** Set, along with `benchmark_slug`, when the folder is a curated benchmark's `source`. */
  title?: string;
  benchmark_slug?: string;
  /** `YYYY-MM-DD`: from the manifest, else the folder-name prefix. */
  benchmark_date?: string;
  /** From the folder's README. */
  factorio_version?: string;
  /** From the folder's README, e.g. "linux-x86_64". */
  benchmark_machine_platform?: string;
}

/** Every `.zip` committed to the source repo. Loaded on demand by the /saves page. */
export interface SaveIndex {
  /** Download base: `${lfsWorkerUrl}/objects/<oid>/<file name>`. */
  lfsWorkerUrl: string;
  /** Sorted by path. */
  files: SaveIndexFile[];
  /** Keyed by top-level folder path. */
  meta: Record<string, SaveFolderMeta>;
}
