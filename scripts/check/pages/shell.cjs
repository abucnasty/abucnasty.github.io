// Header, footer, not-found page and the GitHub Pages 404 shim.
module.exports = {
  name: 'shell',
  async run({ open, expect, data, shot }) {
    const page = await open('/', 'desktop');

    await shot(page, 'shell-home');
    expect('header renders', await page.locator('header').first().isVisible());
    expect('footer renders', await page.locator('footer').first().isVisible());

    for (const href of ['/benchmarks', '/saves', '/blueprints', '/tools', '/blog']) {
      expect(`header menu links to ${href}`, (await page.locator(`header a[href="${href}"]`).count()) > 0);
    }

    const missing = await open('/no-such-page', 'desktop');
    const text = await missing.locator('main').innerText();
    expect('unknown URL shows the not-found page', /page not found/i.test(text), text.slice(0, 80));
    expect('not-found page keeps the header', await missing.locator('header').first().isVisible());

    // public/404.html turns a deep link into /?path=<encoded path>; index.html puts it back.
    const tools = await open('/?path=' + encodeURIComponent('/tools'), 'desktop');
    expect('/?path= shim lands on /tools', new URL(tools.url()).pathname === '/tools', tools.url());
    expect('/?path= shim renders that page', /tools/i.test(await tools.locator('main').first().innerText()));

    const newest = [...data.index.benchmarks].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];
    const detail = await open('/?path=' + encodeURIComponent(`/benchmarks/${newest.slug}`), 'desktop');
    expect(
      '/?path= shim lands on a benchmark page',
      new URL(detail.url()).pathname === `/benchmarks/${newest.slug}` && (await detail.locator('main').innerText()).includes(newest.title),
      detail.url(),
    );
  },
};
