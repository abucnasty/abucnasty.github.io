module.exports = {
  name: 'blueprints',
  async run({ open, expect, data, shot, box, aboveFold }) {
    const entries = data.blueprints.categories.flatMap((c) => c.entries);
    const active = entries.filter((e) => !e.deprecated).length;
    const activeCategories = data.blueprints.categories.filter((c) => c.entries.some((e) => !e.deprecated)).length;

    // Every row carries its description as a title attribute (for the truncated text).
    const rows = (page) => page.locator('main [title]').count();
    // A row is the element holding the description <p>, two levels up from it.
    const rowSel = 'main div:has(> div > p[title])';
    // Found by its accessible name (the aria-label reaches the <input> through slotProps).
    const toggle = (page) => page.getByRole('switch', { name: 'Show deprecated blueprints' });

    for (const viewport of ['desktop', 'phone']) {
      const page = await open('/blueprints', viewport);
      await shot(page, `blueprints-${viewport}`);
      const meta = (await page.locator('main h1').first().evaluate((h) => h.parentElement.textContent)) ?? '';
      expect(
        `${viewport}: header counts categories that have an active blueprint`,
        meta.includes(`${active} active blueprints across ${activeCategories} categories`),
        `${meta} (expected ${active} across ${activeCategories})`,
      );
      expect(`${viewport}: one row per non-deprecated entry`, (await rows(page)) === active, `${await rows(page)} rows, ${active} entries`);
      const rowEls = await page.locator(rowSel).count();
      expect(`${viewport}: row selector matches one element per row`, rowEls === active, `${rowEls} elements, ${active} entries`);
      const heights = await page.$$eval(rowSel, (els) => els.map((el) => el.getBoundingClientRect().height));
      if (viewport === 'desktop') {
        const h = (await box(page, rowSel))?.height ?? 0;
        expect('desktop: blueprint row is at most 36 px tall', h > 0 && h <= 36, `${h} px`);
        const above = await aboveFold(page, rowSel);
        expect('desktop: at least 13 blueprint rows above the fold', above >= 13, `${above} rows above the fold`);
      } else {
        const min = Math.min(...heights);
        expect('phone: every blueprint row is at least 44 px tall', heights.length > 0 && min >= 44, `shortest ${min} px`);
      }
      expect(`${viewport}: deprecated switch is off by default`, !(await toggle(page).isChecked()));
      await toggle(page).click();
      expect(`${viewport}: deprecated switch reveals the rest`, (await rows(page)) === entries.length, `${await rows(page)} rows, ${entries.length} entries`);
      await toggle(page).click();
      expect(`${viewport}: switching off hides them again`, (await rows(page)) === active);
    }

    // --- links to and from benchmarks ---------------------------------------------------------
    const topBar = 48;
    const mapped = [...new Set(data.index.topics.flatMap((t) => t.blueprintCategories ?? []))];
    // Where a category block is relative to the window: its top, bottom and the page's scroll.
    const place = (page, id) =>
      page.evaluate((i) => {
        const el = document.getElementById(i);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), win: window.innerHeight, scrollY: Math.round(window.scrollY) };
      }, id);
    const inView = (p) => p && p.top >= topBar && p.top < p.win;

    for (const viewport of ['desktop', 'phone']) {
      // A fresh load of /blueprints#<id>, for the first, the last and (if far down) every mapped category.
      for (const id of mapped) {
        const page = await open(`/blueprints#${id}`, viewport);
        await page.waitForTimeout(400);
        const p = await place(page, id);
        expect(`${viewport}: /blueprints#${id} brings the category into view below the top bar`, inView(p), JSON.stringify(p));
        if (id === mapped[mapped.length - 1]) await shot(page, `blueprints-hash-${viewport}`);
      }

      // A category whose entries are all deprecated is hidden by default; the hash does nothing.
      const hiddenCat = data.blueprints.categories.find((c) => c.entries.every((e) => e.deprecated));
      if (hiddenCat) {
        const page = await open(`/blueprints#${hiddenCat.id}`, viewport);
        await page.waitForTimeout(400);
        const y = await page.evaluate(() => Math.round(window.scrollY));
        expect(`${viewport}: /blueprints#${hiddenCat.id} (all deprecated, hidden) leaves the page at the top`, y === 0 && (await place(page, hiddenCat.id)) === null, `scrollY=${y}`);
      }
      const page2 = await open('/blueprints#no-such-category', viewport);
      await page2.waitForTimeout(200);
      expect(`${viewport}: an unknown hash leaves the page at the top`, (await page2.evaluate(() => Math.round(window.scrollY))) === 0);
    }

    // Topic links in a category's header: right target for a mapped category, none for the others.
    {
      const page = await open('/blueprints', 'desktop');
      for (const cat of data.blueprints.categories) {
        if (!cat.entries.some((e) => !e.deprecated)) continue;
        const want = data.index.topics
          .filter((t) => (t.blueprintCategories ?? []).includes(cat.id))
          .map((t) => [`/benchmarks?topic=${t.id}`, `${t.label} benchmarks`]);
        const got = await page.evaluate(
          (i) => [...document.querySelectorAll(`[id="${i}"] a[href^="/benchmarks"]`)].map((a) => [a.getAttribute('href'), a.textContent.trim()]),
          cat.id,
        );
        expect(
          `${cat.id}: ${want.length ? 'shows its topic link' : 'shows no topic link'}`,
          JSON.stringify(got) === JSON.stringify(want),
          `${JSON.stringify(got)} vs ${JSON.stringify(want)}`,
        );
      }
      const id = mapped[0];
      const link = page.locator(`[id="${id}"] a[href^="/benchmarks?topic="]`).first();
      const lb = await link.boundingBox();
      const hb = await page.locator(`[id="${id}"]`).boundingBox();
      expect(`${id}: topic link sits at the right edge of the category header`, lb && hb && Math.abs(lb.x + lb.width - (hb.x + hb.width)) <= 16, `${JSON.stringify(lb)} in ${JSON.stringify(hb)}`);
    }

    // From a benchmark page, each "… blueprints" link lands on /blueprints with the category in view.
    for (const t of data.index.topics.filter((x) => (x.blueprintCategories ?? []).length > 0)) {
      const b = data.index.benchmarks.find((x) => x.topic === t.id);
      for (const id of t.blueprintCategories) {
        const name = data.blueprints.categories.find((c) => c.id === id).name;
        const page = await open(`/benchmarks/${b.slug}`, 'desktop');
        await page.waitForSelector('main h1', { timeout: 10000 });
        await page.getByRole('link', { name: `${name} blueprints`, exact: true }).click();
        await page.waitForTimeout(500);
        const where = await page.evaluate(() => [location.pathname, location.hash]);
        const p = await place(page, id);
        expect(
          `${b.slug} -> "${name} blueprints": lands on /blueprints#${id} with the category in view`,
          where[0] === '/blueprints' && where[1] === `#${id}` && inView(p),
          `${where.join('')} ${JSON.stringify(p)}`,
        );
      }
    }
  },
};
