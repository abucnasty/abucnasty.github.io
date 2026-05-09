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
  /** Direct download URL (raw.githubusercontent.com). */
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
  githubUrl: string;
  readmeGithubUrl: string;
  saves: BenchmarkSave[];
  assetCount: number;
}

export interface ContentIndex {
  sourceRepo: SourceRepo;
  benchmarks: BenchmarkEntry[];
}
