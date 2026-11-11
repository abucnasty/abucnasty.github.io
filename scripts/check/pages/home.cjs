module.exports = {
  name: 'home',
  async run({ open, expect, shot }) {
    for (const viewport of ['desktop', 'phone']) {
      const page = await open('/', viewport);
      await shot(page, `home-${viewport}`);
      expect(`${viewport}: renders a heading`, (await page.locator('main h1, main h2').count()) > 0);
      expect(`${viewport}: links to at least one benchmark page`, (await page.locator('main a[href^="/benchmarks/"]').count()) > 0);
    }
  },
};
