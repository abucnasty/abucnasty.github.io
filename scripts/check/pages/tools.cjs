// The page content is hand-written (not in src/generated), so the outbound links
// are listed here. Add to this list when a tool, utility, mod or doc is added.
const LINKS = {
  'Belt': 'https://github.com/florishafkenscheid/belt',
  'belt-charts': 'https://github.com/abucnasty/belt-charts',
  'Clock Generator source': 'https://github.com/abucnasty/factorio-scripts',
  'Clock Generator app': 'https://clock-generator-self.vercel.app/',
  'Clock Generator Sidecar mod': 'https://mods.factorio.com/mod/clock-generator-sidecar',
  'Particle Free Disposal mod': 'https://mods.factorio.com/mod/particle_free_disposal',
  'Particle Free Disposal source': 'https://github.com/abucnasty/particle-free-disposal',
  'How to Benchmark guide': 'https://github.com/abucnasty/factorio-benchmarks/blob/master/docs/guides/how-to-benchmark.md',
  'How to Benchmark video': 'https://youtu.be/pXz01Be-9hE',
};

module.exports = {
  name: 'tools',
  async run({ open, expect, shot }) {
    for (const viewport of ['desktop', 'phone']) {
      const page = await open('/tools', viewport);
      await shot(page, `tools-${viewport}`);
      const title = await page.locator('main h1, main h2, main h3').first().textContent();
      expect(`${viewport}: page has a title`, title && title.trim() === 'Tools', title);
      const hrefs = await page.$$eval('main a[href^="http"]', (as) => as.map((a) => a.getAttribute('href')));
      for (const [what, url] of Object.entries(LINKS)) {
        expect(`${viewport}: link to ${what}`, hrefs.includes(url), url);
      }
      expect(`${viewport}: outbound links open in a new tab`, (await page.locator('main a[href^="http"]:not([target="_blank"])').count()) === 0);
    }
  },
};
