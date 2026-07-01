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
