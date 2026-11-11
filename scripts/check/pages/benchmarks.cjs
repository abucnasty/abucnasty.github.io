module.exports = {
  name: 'benchmarks',
  async run({ open, expect, data, shot }) {
    const list = data.index.benchmarks;
    // Same order the page uses: newest first, undated last (stable sort).
    const sorted = [...list].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

    const page = await open('/benchmarks', 'desktop');
    // Each benchmark has exactly one link to its page in <main>: its title.
    await shot(page, 'benchmarks-desktop');
    const links = await page.$$eval('main a[href^="/benchmarks/"]', (as) => as.map((a) => ({ href: a.getAttribute('href'), text: a.textContent.trim() })));
    expect('one row per benchmark in the index', links.length === list.length, `${links.length} rows, ${list.length} benchmarks`);
    expect('first row is the newest benchmark', links[0]?.href === `/benchmarks/${sorted[0].slug}`, `${links[0]?.href} (newest: ${sorted[0].slug})`);
    expect('rows follow date order, newest first', links.every((l, i) => l.href === `/benchmarks/${sorted[i].slug}`));
    const wrong = links.filter((l) => {
      const b = list.find((x) => `/benchmarks/${x.slug}` === l.href);
      return !b || b.title !== l.text;
    });
    expect('every title links to /benchmarks/<slug>', wrong.length === 0, wrong.map((w) => w.href).join(', '));

    const phone = await open('/benchmarks', 'phone');
    await shot(phone, 'benchmarks-phone');
    expect('phone: one row per benchmark', (await phone.locator('main a[href^="/benchmarks/"]').count()) === list.length);
  },
};
