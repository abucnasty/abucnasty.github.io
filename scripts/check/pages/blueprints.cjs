module.exports = {
  name: 'blueprints',
  async run({ open, expect, data, shot }) {
    const entries = data.blueprints.categories.flatMap((c) => c.entries);
    const active = entries.filter((e) => !e.deprecated).length;

    // Every row carries its description as a title attribute (for the truncated text).
    const rows = (page) => page.locator('main [title]').count();
    // The Switch's aria-label does not reach its <input> (MUI 7 ignores `inputProps` here), so select by role.
    const toggle = 'main input[role="switch"]';

    for (const viewport of ['desktop', 'phone']) {
      const page = await open('/blueprints', viewport);
      await shot(page, `blueprints-${viewport}`);
      expect(`${viewport}: one row per non-deprecated entry`, (await rows(page)) === active, `${await rows(page)} rows, ${active} entries`);
      expect(`${viewport}: deprecated switch is off by default`, !(await page.locator(toggle).isChecked()));
      await page.locator(toggle).click();
      expect(`${viewport}: deprecated switch reveals the rest`, (await rows(page)) === entries.length, `${await rows(page)} rows, ${entries.length} entries`);
      await page.locator(toggle).click();
      expect(`${viewport}: switching off hides them again`, (await rows(page)) === active);
    }
  },
};
