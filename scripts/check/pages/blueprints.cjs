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
  },
};
