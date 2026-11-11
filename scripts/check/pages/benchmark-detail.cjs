module.exports = {
  name: 'benchmark-detail',
  // README tables are wider than a phone and push the whole page sideways (about
  // 110 px on the newest benchmark). Existing defect; the benchmark-page package
  // is meant to fix it and should delete this entry.
  knownIssues: [{ match: 'phone: no sideways scroll', why: 'wide README tables overflow the page on phones' }],
  async run({ open, expect, data, shot }) {
    const list = data.index.benchmarks;
    const newest = [...list].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];
    const withCharts = list.find((b) => b.timeseries);
    const cases = [['newest benchmark', newest]];
    if (withCharts) cases.push(['benchmark with charts', withCharts]);
    else expect('index has a benchmark with timeseries', false, 'nothing to check the charts tab against');

    for (const [what, b] of cases) {
      for (const viewport of ['desktop', 'phone']) {
        const label = `${what} (${b.slug}), ${viewport}`;
        const page = await open(`/benchmarks/${b.slug}`, viewport);
        // README text arrives asynchronously; paragraphs only exist in the rendered markdown.
        await page.waitForSelector('main p', { timeout: 10000 }).catch(() => {});
        await shot(page, `benchmark-detail-${b.slug}-${viewport}`);
        const title = await page.locator('main h1, main h2, main h3').first().textContent();
        expect(`${label}: title shown`, title && title.trim() === b.title, title);
        expect(`${label}: README content rendered`, (await page.locator('main p').count()) > 0);

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
      }
    }
  },
};
