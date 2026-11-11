const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..', '..');
const generatedDir = path.join(root, 'src', 'generated', 'benchmarks');

// Elements that only exist inside the rendered README (not in the header, tabs or sidebar).
const BODY_SELECTOR = 'main p, main h2, main h3, main h4, main table, main ul, main ol, main pre, main img';

module.exports = {
  name: 'benchmark-detail',
  async run({ open, expect, data, shot }) {
    // --- generated READMEs: no contents list of their own -------------------------------
    const readmes = fs.existsSync(generatedDir)
      ? fs
          .readdirSync(generatedDir)
          .map((d) => path.join(generatedDir, d, 'README.md'))
          .filter((f) => fs.existsSync(f))
      : [];
    const tocHeading =
      /^ {0,3}(?:#{1,4}[ \t]+table of contents[ \t]*#*|<h[1-4](?:\s[^>]*)?>\s*table of contents\s*<\/h[1-4]>)[ \t]*$/im;
    const withToc = readmes.filter((f) => tocHeading.test(fs.readFileSync(f, 'utf8')));
    expect(
      'no generated README has a "Table of Contents" heading',
      readmes.length > 0 && withToc.length === 0,
      readmes.length === 0 ? 'no generated READMEs found' : withToc.map((f) => path.basename(path.dirname(f))).join(','),
    );

    const list = data.index.benchmarks;
    const newest = [...list].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];
    const withCharts = list.find((b) => b.timeseries);
    const withSaves = list.find((b) => b.saves.length > 0);
    const linuxVsWindows = list.find((b) => b.slug === '2026-01-25-linux-vs-windows');
    // Source READMEs that used to carry their own contents list.
    const hadToc = ['pollution-control', 'chests'].map((s) => list.find((b) => b.slug === s)).filter(Boolean);

    const cases = [['newest benchmark', newest]];
    if (withCharts) cases.push(['benchmark with charts', withCharts]);
    else expect('index has a benchmark with timeseries', false, 'nothing to check the charts tab against');
    if (withSaves) cases.push(['benchmark with saves', withSaves]);
    if (linuxVsWindows) cases.push(['linux vs windows', linuxVsWindows]);
    if (hadToc[0]) cases.push(['benchmark that had a contents list', hadToc[0]]);

    const seen = new Set();
    for (const [what, b] of cases) {
      if (seen.has(b.slug)) continue;
      seen.add(b.slug);
      for (const viewport of ['desktop', 'phone']) {
        const label = `${what} (${b.slug}), ${viewport}`;
        const page = await open(`/benchmarks/${b.slug}`, viewport);
        // README text arrives asynchronously; paragraphs only exist in the rendered markdown.
        await page.waitForSelector('main p', { timeout: 10000 }).catch(() => {});
        await shot(page, `benchmark-detail-${b.slug}-${viewport}`);
        const title = await page.locator('main h1').first().textContent();
        expect(`${label}: title shown`, title && title.trim() === b.title, title);
        expect(`${label}: README content rendered`, (await page.locator('main p').count()) > 0);

        const h1Size = await page.locator('main h1').first().evaluate((el) => getComputedStyle(el).fontSize);
        expect(`${label}: h1 is 28px`, h1Size === '28px', h1Size);

        const tabs = (await page.locator('[role="tab"]').allTextContents()).map((t) => t.trim());
        const hasCharts = Boolean(b.timeseries);
        const hasSaves = b.saves.length > 0;
        if (hasCharts || hasSaves) {
          expect(`${label}: README tab present`, tabs.includes('README'), tabs.join(','));
          expect(`${label}: charts tab ${hasCharts ? 'present' : 'absent'}`, tabs.includes('Interactive metrics') === hasCharts, tabs.join(','));
          expect(`${label}: save files tab ${hasSaves ? 'present' : 'absent'}`, tabs.includes('Save files') === hasSaves, tabs.join(','));
        } else {
          expect(`${label}: no tabs without charts or saves`, tabs.length === 0, tabs.join(','));
        }

        // Sidebar: the title is not repeated there.
        const titleInSidebar = await page
          .locator('main a:has-text("View on GitHub")')
          .first()
          .evaluate((a, t) => [...a.parentElement.querySelectorAll('*')].some((e) => e.textContent.trim() === t), b.title);
        expect(`${label}: sidebar does not repeat the title`, !titleInSidebar);

        // Header chips.
        const chips = page.locator('main header ~ div .MuiChip-root');
        const chipTexts = (await chips.allTextContents()).map((t) => t.trim());
        if (b.factorioVersion) {
          expect(`${label}: chip "Factorio ${b.factorioVersion}"`, chipTexts.includes(`Factorio ${b.factorioVersion}`), chipTexts.join(' | '));
        }
        if (hasSaves) {
          const chip = page.locator(`main a.MuiChip-root[href="/saves/${b.source}"]`);
          const text = ((await chip.count()) ? await chip.first().textContent() : '') ?? '';
          expect(
            `${label}: save files chip links to /saves/${b.source}`,
            (await chip.count()) === 1 && text.includes(String(b.saves.length)),
            `count=${await chip.count()} text=${text}`,
          );
        }
        if (viewport === 'phone') {
          const rights = await page.locator('main .MuiChip-root').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().right)));
          const width = await page.evaluate(() => document.documentElement.clientWidth);
          expect(`${label}: chips wrap inside the screen`, rights.every((r) => r <= width), `rights=${rights.join(',')} width=${width}`);
        }

        if (viewport === 'desktop') {
          const first = await page.locator(BODY_SELECTOR).first().boundingBox();
          expect(
            `${label}: README body starts above y = 330`,
            first !== null && first.y < 330,
            first ? `y=${Math.round(first.y)}` : 'no body element',
          );
        }

        if (hasCharts && viewport === 'desktop') {
          await page.getByRole('button', { name: 'Interactive metrics' }).click();
          const selected = await page.locator('[role="tab"][aria-selected="true"]').first().textContent();
          expect(`${label}: "Interactive metrics" chip shows the charts tab`, selected && selected.trim() === 'Interactive metrics', selected);
          await page.waitForSelector('main canvas, main svg.recharts-surface, main .recharts-wrapper, main .echarts-for-react', { timeout: 15000 }).catch(() => {});
          expect(
            `${label}: charts render`,
            (await page.locator('main canvas, main .recharts-wrapper, main .echarts-for-react').count()) > 0,
          );
        }
      }
    }

    // --- benchmarks whose source README had a contents list -----------------------------
    for (const b of hadToc) {
      const page = await open(`/benchmarks/${b.slug}`, 'desktop');
      await page.waitForSelector('main p, main h2', { timeout: 10000 }).catch(() => {});
      const text = await page.locator('main').innerText();
      expect(`${b.slug}: "Table of Contents" appears nowhere in main`, !/table of contents/i.test(text));
      const tocLinks = (await page.locator('main nav a').allTextContents()).map((t) => t.trim());
      expect(`${b.slug}: sidebar "On this page" lists headings`, tocLinks.length > 0, tocLinks.join(','));
      expect(`${b.slug}: sidebar list has no "Table of Contents"`, !tocLinks.some((t) => /table of contents/i.test(t)), tocLinks.join(','));
      // Every sidebar link must point at an id that exists in the rendered document.
      const hrefs = await page.locator('main nav a').evaluateAll((els) => els.map((e) => e.getAttribute('href').slice(1)));
      const found = await page.evaluate((hs) => hs.map((h) => document.getElementById(h) !== null), hrefs);
      const missing = hrefs.filter((_, i) => !found[i]);
      expect(
        `${b.slug}: every "On this page" link targets an id in the document`,
        hrefs.length > 0 && missing.length === 0,
        `missing: ${missing.join(', ')}`,
      );
      // A sidebar link scrolls to its heading.
      const id = hrefs[Math.min(2, hrefs.length - 1)];
      await page.locator(`main nav a[href="#${id}"]`).click();
      await page.waitForTimeout(1200);
      const top = await page.evaluate((i) => document.getElementById(i)?.getBoundingClientRect().top ?? null, id);
      expect(`${b.slug}: sidebar link scrolls to its heading`, top !== null && top >= -5 && top < 300, `top=${top}`);
    }
  },
};
