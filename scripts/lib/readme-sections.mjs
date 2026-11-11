/**
 * Pure helpers for pulling named sections ("The Question", "The Answer", ...) out of a
 * benchmark README. No I/O.
 */

const HEADING_RE = /^ {0,3}(#{1,4})[ \t]+(.*?)[ \t]*#*[ \t]*$/;
const FENCE_RE = /^ {0,3}(`{3,}|~{3,})/;

/** @param {string} text */
function normalizeHeading(text) {
  return text.trim().replace(/:$/, '').trim().toLowerCase();
}

/**
 * Level 1-4 ATX headings outside fenced code blocks, as `{ index, level, text }`.
 * @param {string[]} lines
 */
function listHeadings(lines) {
  const headings = [];
  let fence = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\r$/, '');
    const f = line.match(FENCE_RE);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
      continue;
    }
    if (fence) continue;
    const m = line.match(HEADING_RE);
    if (m) headings.push({ index: i, level: m[1].length, text: m[2] });
  }
  return headings;
}

/**
 * Find a section by heading text. A section runs from its heading to the next heading of
 * the same or a higher level (fewer or equal `#`), or the end of the file; deeper headings
 * belong to it.
 *
 * @param {string} markdown
 * @param {string[]} names  Heading texts to match, compared case-insensitively after
 *                          trimming whitespace and a trailing colon.
 * @returns {{ start: number, end: number, body: string } | null}
 *          Line indexes of the heading line and of the first line after the section;
 *          `body` is the section without its heading line, trimmed.
 */
export function findSection(markdown, names) {
  const wanted = new Set(names.map(normalizeHeading));
  const lines = markdown.split('\n');
  const headings = listHeadings(lines);
  const at = headings.findIndex((h) => wanted.has(normalizeHeading(h.text)));
  if (at < 0) return null;
  const head = headings[at];
  const next = headings.slice(at + 1).find((h) => h.level <= head.level);
  const end = next ? next.index : lines.length;
  return {
    start: head.index,
    end,
    body: lines.slice(head.index + 1, end).join('\n').trim(),
  };
}

/**
 * The markdown with that section (heading and body) removed, one blank line left in its place.
 *
 * @param {string} markdown
 * @param {{ start: number, end: number }} section
 * @returns {string}
 */
export function removeSection(markdown, section) {
  const lines = markdown.split('\n');
  const before = lines.slice(0, section.start);
  const after = lines.slice(section.end);
  while (before.length && before[before.length - 1].trim() === '') before.pop();
  while (after.length && after[0].trim() === '') after.shift();
  if (before.length === 0) return after.join('\n');
  if (after.length === 0) return before.join('\n') + '\n';
  return [...before, '', ...after].join('\n');
}

const LIST_ITEM_RE = /^[ \t]*(?:[-*+]|\d+[.)])(?:[ \t]+|$)/;

/**
 * First paragraph of a section body as plain text, or '' when the body does not start
 * with prose (a table, an image, an HTML block, a heading or a fenced code block).
 *
 * @param {string} body
 * @param {number} [maxLength=280]
 * @returns {string}
 */
export function plainFirstParagraph(body, maxLength = 280) {
  const all = body.replace(/\r/g, '').split('\n');
  while (all.length && all[0].trim() === '') all.shift();
  let block = [];
  for (const line of all) {
    if (line.trim() === '') break;
    block.push(line);
  }
  if (block.length === 0) return '';

  const first = block[0].trim();
  if (
    first.startsWith('|') ||
    first.startsWith('![') ||
    /^<[a-z/!]/i.test(first) ||
    first.startsWith('#') ||
    /^(`{3,}|~{3,})/.test(first)
  ) {
    return '';
  }

  if (LIST_ITEM_RE.test(block[0])) {
    // First item only: up to the next list marker.
    const next = block.findIndex((l, i) => i > 0 && LIST_ITEM_RE.test(l));
    if (next > 0) block = block.slice(0, next);
    block[0] = block[0].replace(LIST_ITEM_RE, '');
  }

  let text = block.join(' ');
  text = text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // inline images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url)
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1') // [text][ref]
    .replace(/<[^>]*>/g, '') // HTML tags
    .replace(/`/g, '')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/(^|[\s(])_([^_]+)_(?=[\s).,;:!?]|$)/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  text = text[0].toUpperCase() + text.slice(1);

  if (text.length > maxLength) {
    const cut = text.lastIndexOf(' ', maxLength);
    text = text.slice(0, cut > 0 ? cut : maxLength).replace(/[\s,;:]+$/, '') + '…';
  }
  return text;
}
