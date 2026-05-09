/**
 * Parse the curated blueprints markdown into a structured JSON the UI can render.
 *
 * Schema (per category):
 *   { category: "Megabasing › Uncommon Science",
 *     entries: [
 *       { description, version?, author?, factoriobinUrl?, youtubeUrl?, deprecated }
 *     ],
 *     iconUrl?: string }
 *
 * Deprecation is inferred from:
 *   - text like "(deprecated)" anywhere in a row
 *   - an explicit "Deprecated:" / "Deprecated" sub-heading or paragraph immediately before a table
 */

/**
 * @typedef {{
 *   description: string,
 *   version?: string,
 *   author?: string,
 *   factoriobinUrl?: string,
 *   youtubeUrl?: string,
 *   deprecated: boolean
 * }} BlueprintEntry
 */

/**
 * @typedef {{
 *   id: string,
 *   parent: string,
 *   name: string,
 *   iconUrl?: string,
 *   entries: BlueprintEntry[]
 * }} BlueprintCategory
 */

/**
 * @param {string} markdown
 * @returns {BlueprintCategory[]}
 */
export function parseBlueprintsMarkdown(markdown) {
  const lines = markdown.split('\n');
  /** @type {BlueprintCategory[]} */
  const categories = [];

  let parent = '';
  /** @type {BlueprintCategory | null} */
  let current = null;
  /** @type {string | undefined} */
  let pendingIcon;
  let nextTableDeprecated = false;
  let categoryDeprecated = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h2 = /^##\s+(?!#)(.+?)\s*$/.exec(line);
    const h3 = /^###\s+(.+?)\s*$/.exec(line);

    if (h2) {
      const name = h2[1].trim();
      if (name.toLowerCase() === 'table of contents') {
        current = null;
        continue;
      }
      parent = name;
      current = null;
      pendingIcon = undefined;
      categoryDeprecated = false;
      continue;
    }

    if (h3) {
      const name = h3[1].trim();
      const isDeprecatedSection = /^deprecated$/i.test(name);
      current = {
        id: slugify(`${parent}-${name}`),
        parent,
        name,
        entries: [],
      };
      categories.push(current);
      pendingIcon = undefined;
      categoryDeprecated = isDeprecatedSection;
      nextTableDeprecated = isDeprecatedSection;
      continue;
    }

    if (!current) continue;

    // Standalone image just below a heading → category icon.
    const imgMatch = /^!\[[^\]]*\]\((\S+?)(?:\s+"[^"]*")?\)\s*$/.exec(line.trim());
    if (imgMatch && current.entries.length === 0 && !current.iconUrl) {
      current.iconUrl = imgMatch[1];
      pendingIcon = imgMatch[1];
      continue;
    }

    // "Deprecated:" or "Deprecated" line immediately above a table.
    if (/^deprecated:?\s*$/i.test(line.trim())) {
      nextTableDeprecated = true;
      continue;
    }

    // Detect a markdown table: header row followed by separator row.
    if (line.trim().startsWith('|') && lines[i + 1]?.trim().match(/^\|[\s:|-]+\|\s*$/)) {
      const headers = splitRow(line);
      const rows = [];
      let j = i + 2;
      while (j < lines.length && lines[j].trim().startsWith('|')) {
        rows.push(splitRow(lines[j]));
        j++;
      }
      i = j - 1;

      for (const row of rows) {
        const entry = rowToEntry(headers, row, nextTableDeprecated || categoryDeprecated);
        if (entry) current.entries.push(entry);
      }
      nextTableDeprecated = false;
      // Suppress unused-but-intentional linter warning
      void pendingIcon;
    }
  }

  return categories;
}

/** @param {string} line */
function splitRow(line) {
  const trimmed = line.trim();
  const inner = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
  const final = inner.endsWith('|') ? inner.slice(0, -1) : inner;
  return final.split('|').map((c) => c.trim());
}

/**
 * @param {string[]} headers
 * @param {string[]} row
 * @param {boolean} forceDeprecated
 * @returns {BlueprintEntry | null}
 */
function rowToEntry(headers, row, forceDeprecated) {
  /** @type {Record<string, string>} */
  const map = {};
  headers.forEach((h, idx) => {
    map[h.toLowerCase()] = row[idx] ?? '';
  });

  const description = map['description'] ?? row[0] ?? '';
  if (!description) return null;

  const version = map['version'];
  const author = map['author'];
  const linkCell = map['link'] ?? '';
  const videoCell = map['video'] ?? '';

  const factoriobinUrl = extractUrl(linkCell, /factoriobin\.com/);
  const youtubeUrl = extractUrl(videoCell, /(youtube\.com|youtu\.be)/);

  const inlineDeprecated =
    /\(deprecated\)/i.test(description) ||
    /\(deprecated\)/i.test(version ?? '') ||
    /\bdeprecated\b/i.test(description);

  return {
    description: description.replace(/\s*\(deprecated\)\s*/i, '').trim(),
    version: version ? version.replace(/\s*\(deprecated\)\s*/i, '').trim() : undefined,
    author: author || undefined,
    factoriobinUrl,
    youtubeUrl,
    deprecated: forceDeprecated || inlineDeprecated,
  };
}

/**
 * @param {string} cell
 * @param {RegExp} hostMatch
 */
function extractUrl(cell, hostMatch) {
  if (!cell) return undefined;
  // [label](url)
  const md = /\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g;
  let m;
  while ((m = md.exec(cell)) !== null) {
    if (hostMatch.test(m[1])) return m[1];
  }
  // bare URL
  const bare = /(https?:\/\/\S+)/.exec(cell);
  if (bare && hostMatch.test(bare[1])) return bare[1];
  return undefined;
}

/** @param {string} s */
function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
