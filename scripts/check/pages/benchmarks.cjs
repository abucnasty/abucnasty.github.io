module.exports = {
  name: 'benchmarks',
  async run({ open, expect, data, shot, aboveFold }) {
    const list = data.index.benchmarks;
    // Same order the page uses: newest first, undated last (stable sort).
    const sorted = [...list].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

    // Per body row, what is visible: title href, chart marker count, save links.
    const readRows = (page) => page.$$eval('main tbody tr', (trs) => {
      const visible = (el) => el.getClientRects().length > 0;
      return trs.map((tr) => {
        const title = tr.querySelector('a[href^="/benchmarks/"]');
        const saves = [...tr.querySelectorAll('a[href^="/saves/"]')].filter(visible);
        return {
          href: title ? title.getAttribute('href') : null,
          height: tr.getBoundingClientRect().height,
          charts: [...tr.querySelectorAll('[aria-label="Interactive charts"]')].filter(visible).length,
          saves: saves.map((a) => ({ href: a.getAttribute('href'), label: a.getAttribute('aria-label'), text: a.textContent.trim() })),
        };
      });
    });
    const saveHref = (source) => `/saves/${source.split('/').map(encodeURIComponent).join('/')}`;

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

    const desktopRows = await readRows(page);
    const tallest = Math.max(...desktopRows.map((r) => r.height));
    expect('desktop: body row height is at most 36 px', desktopRows.length > 0 && tallest <= 36, `tallest ${tallest} px over ${desktopRows.length} rows`);
    const fold = await aboveFold(page, 'main tbody tr');
    expect('desktop: at least 18 body rows above the fold', fold >= 18, `${fold} rows above the fold`);

    const markers = (rows, label) => {
      const bad = [];
      rows.forEach((r, i) => {
        const b = sorted[i];
        const problems = [];
        if (r.href !== `/benchmarks/${b.slug}`) problems.push(`row is ${r.href}`);
        if (r.charts !== (b.timeseries ? 1 : 0)) problems.push(`charts ${r.charts}, expected ${b.timeseries ? 1 : 0}`);
        if (b.saves.length > 0) {
          const s = r.saves;
          if (s.length !== 1) problems.push(`${s.length} save links`);
          else {
            if (s[0].href !== saveHref(b.source)) problems.push(`save link ${s[0].href}`);
            if (s[0].text !== String(b.saves.length)) problems.push(`save count "${s[0].text}"`);
            if (s[0].label !== `${b.saves.length} save files for ${b.title}`) problems.push(`save label "${s[0].label}"`);
          }
        } else if (r.saves.length > 0) problems.push('save link on a row with no saves');
        if (problems.length) bad.push(`${b.slug}: ${problems.join('; ')}`);
      });
      expect(`${label}: chart and save markers match data.index`, bad.length === 0 && rows.length === sorted.length, bad.slice(0, 5).join(' | ') || `${rows.length} rows, ${sorted.length} benchmarks`);
    };
    markers(desktopRows, 'desktop');

    const phone = await open('/benchmarks', 'phone');
    await shot(phone, 'benchmarks-phone');
    expect('phone: one row per benchmark', (await phone.locator('main a[href^="/benchmarks/"]').count()) === list.length);
    const phoneRows = await readRows(phone);
    const shortest = Math.min(...phoneRows.map((r) => r.height));
    expect('phone: no row is shorter than 44 px', phoneRows.length > 0 && shortest >= 44, `shortest ${shortest} px`);
    markers(phoneRows, 'phone');
  },
};
