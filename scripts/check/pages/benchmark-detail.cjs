const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..', '..');
const generatedDir = path.join(root, 'src', 'generated', 'benchmarks');

// Elements that only exist inside the rendered README (not in the header, tabs or sidebar).
const BODY_SELECTOR = 'main p, main h2, main h3, main h4, main table, main ul, main ol, main pre, main img';

const LEAD = 'main section[aria-label="Question and answer"]';

// Top of the first README element: the same elements as BODY_SELECTOR, outside the lead.
const bodyStart = (page) =>
  page.evaluate(
    ([sel, lead]) => {
      const el = [...document.querySelectorAll(sel)].find((e) => !e.closest(lead));
      return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null;
    },
    [BODY_SELECTOR, LEAD],
  );

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

    // --- generated READMEs: links to raw.githubusercontent.com are files that browsers can open ----
    const rawLinks = [];
    for (const f of readmes) {
      const text = fs.readFileSync(f, 'utf8');
      for (const m of text.matchAll(/\]\((https:\/\/raw\.githubusercontent\.com\/[^)\s"']+)/g)) {
        rawLinks.push(`${path.basename(path.dirname(f))}: ${m[1]}`);
      }
    }
    const lastSegment = (u) => u.split('?')[0].split('#')[0].split('/').pop();
    const badFolder = rawLinks.filter((l) => {
      const u = l.slice(l.indexOf(': ') + 2).split('?')[0].split('#')[0];
      return u.endsWith('/') || !/\.[A-Za-z0-9]+$/.test(lastSegment(u));
    });
    expect(
      'no raw.githubusercontent.com link points at a folder',
      rawLinks.length > 0 && badFolder.length === 0,
      rawLinks.length === 0 ? 'no raw links found' : badFolder.join(' | '),
    );
    const badLfs = rawLinks.filter((l) => /\.(zip|csv|zst)(?:[?#].*)?$/i.test(l));
    expect('no raw.githubusercontent.com link points at a git-lfs file (.zip, .csv, .zst)', badLfs.length === 0, badLfs.join(' | '));

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
          const first = await bodyStart(page);
          if (b.question) {
            const leadBottom = await page.locator(LEAD).evaluate((e) => Math.round(e.getBoundingClientRect().bottom + window.scrollY));
            expect(`${label}: README body starts below the lead`, first !== null && first >= leadBottom, `y=${first} leadBottom=${leadBottom}`);
          } else {
            expect(`${label}: README body starts above y = 370`, first !== null && first < 370, `y=${first}`);
          }
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

    // --- question and answer at the top ------------------------------------------------
    const hasFile = (b, f) => fs.existsSync(path.join(generatedDir, b.slug, f));
    const byDate = (a, b) => (b.date ?? '').localeCompare(a.date ?? '');
    const withQA = [...list].filter((b) => b.question && hasFile(b, 'answer.md')).sort(byDate)[0];
    const questionOnly = list.find((b) => b.question && !hasFile(b, 'answer.md'));
    const noQuestion = list.find((b) => !b.question);
    const withTopic = list.find((b) => b.topic);
    const withCpu = list.find((b) => b.cpu);
    expect('index has a benchmark with a question and an answer', Boolean(withQA));
    expect('index has a benchmark with a question and no answer', Boolean(questionOnly));
    expect('index has a benchmark with no question', Boolean(noQuestion));

    for (const [what, b] of [['question and answer', withQA], ['question only', questionOnly], ['no question', noQuestion]]) {
      if (!b) continue;
      for (const viewport of ['desktop', 'phone']) {
        const label = `lead, ${what} (${b.slug}), ${viewport}`;
        const page = await open(`/benchmarks/${b.slug}`, viewport);
        await page.waitForSelector('main h1', { timeout: 10000 });
        await page.waitForSelector('main p, main ul, main h2', { timeout: 10000 }).catch(() => {});
        await shot(page, `benchmark-lead-${b.slug}-${viewport}`);
        const lead = page.locator(LEAD);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
        expect(`${label}: no sideways scroll`, !overflow);
        if (!b.question) {
          expect(`${label}: no lead section`, (await lead.count()) === 0);
          if (viewport === 'desktop') {
            const y = await bodyStart(page);
            expect(`${label}: README body starts above y = 370`, y !== null && y < 370, `y=${y}`);
          }
          continue;
        }
        expect(`${label}: one lead section`, (await lead.count()) === 1);
        const leadText = (await lead.innerText()).replace(/\s+/g, ' ').trim();
        const start = b.question.slice(0, 30);
        expect(`${label}: lead starts with the question`, leadText.startsWith(start), leadText.slice(0, 60));
        const first = lead.locator('p, li').first();
        const qSize = await first.evaluate((e) => getComputedStyle(e).fontSize);
        const want = viewport === 'desktop' ? '20px' : '18px';
        expect(`${label}: question is ${want}`, qSize === want, qSize);
        const listStyle = await first.evaluate((e) => (e.tagName === 'LI' ? getComputedStyle(e.parentElement).listStyleType : 'none'));
        expect(`${label}: question has no bullet`, listStyle === 'none', listStyle);
        const box = await lead.boundingBox();
        const q = await first.boundingBox();
        expect(`${label}: question is inset inside the lead`, q.x - box.x >= 12 && q.y - box.y >= 12, `dx=${q.x - box.x} dy=${q.y - box.y}`);
        const tabsBox = await page.locator('[role="tablist"]').first().boundingBox().catch(() => null);
        if (tabsBox) {
          expect(`${label}: lead is above the tab bar`, box.y + box.height <= tabsBox.y + 1, `leadBottom=${Math.round(box.y + box.height)} tabs=${Math.round(tabsBox.y)}`);
        }
        const hasAnswer = hasFile(b, 'answer.md');
        const afterQuestion = await lead.evaluate((l) => {
          const next = l.firstElementChild && l.firstElementChild.nextElementSibling;
          return next ? next.innerText.trim().length : 0;
        });
        expect(
          `${label}: ${hasAnswer ? 'lead has an answer after the question' : 'lead shows the question alone'}`,
          hasAnswer ? afterQuestion > 0 : afterQuestion === 0,
          `afterQuestion=${afterQuestion}`,
        );
        const heads = await page.locator('main h1, main h2, main h3, main h4').allTextContents();
        expect(`${label}: README has no "The Question" / "The Answer" heading`, heads.every((t) => !/^\s*(the )?(question|answer)\s*:?\s*$/i.test(t)), heads.join(' | '));
        // Nothing in the lead shares an id with the README below.
        const ids = await page.evaluate((l) => {
          const all = [...document.querySelectorAll('main [id]')].map((e) => e.id);
          return { dup: all.length - new Set(all).size, inLead: document.querySelector(l).querySelectorAll('[id]').length };
        }, LEAD);
        expect(`${label}: ids are unique and the lead has none`, ids.dup === 0 && ids.inLead === 0, JSON.stringify(ids));
        // The sidebar contents list comes from the README only.
        const toc = (await page.locator('main nav:not([aria-label="Breadcrumb"]) a').allTextContents()).join(' | ');
        expect(`${label}: sidebar list has nothing from the lead`, !toc.includes(start), toc.slice(0, 80));
        if (viewport === 'desktop') {
          const top = Math.round(box.y);
          expect(`${label}: lead starts above y = 240`, top < 240, `y=${top}`);
          if (tabsBox) expect(`${label}: tabs are on the first screen`, tabsBox.y + tabsBox.height < 800, `y=${Math.round(tabsBox.y)}`);
          const y = await bodyStart(page);
          expect(`${label}: README body starts below the lead`, y !== null && y >= top + box.height, `y=${y}`);
        }
      }
    }

    // A question written in lower case starts with a capital in the lead.
    const lowerStart = list.find((b) => {
      const f = path.join(generatedDir, b.slug, 'question.md');
      if (!b.question || !fs.existsSync(f)) return false;
      const first = fs.readFileSync(f, 'utf8').replace(/^\s*(?:[-*]\s+)?/, '')[0];
      return first && first !== first.toUpperCase();
    });
    if (lowerStart) {
      for (const viewport of ['desktop', 'phone']) {
        const page = await open(`/benchmarks/${lowerStart.slug}`, viewport);
        await page.waitForSelector(LEAD, { timeout: 10000 });
        await shot(page, `benchmark-lead-lower-${lowerStart.slug}-${viewport}`);
        const transform = await page
          .locator(LEAD)
          .locator('p, li')
          .first()
          .evaluate((e) => getComputedStyle(e, '::first-letter').textTransform);
        expect(`lower-case question (${lowerStart.slug}), ${viewport}: first letter is upper-case`, transform === 'uppercase', transform);
        const answerEl = page.locator(`${LEAD} > :nth-child(2)`);
        const answerTransform = (await answerEl.count())
          ? await answerEl.evaluate((e) => getComputedStyle(e.querySelector('p, li') ?? e, '::first-letter').textTransform)
          : 'none';
        expect(`lower-case question (${lowerStart.slug}), ${viewport}: answer is not transformed`, answerTransform !== 'uppercase', answerTransform);
      }
    }

    // The lead stays above the tabs on the other tabs.
    const tabbed = list.find((b) => b.question && (b.timeseries || b.saves.length > 0));
    if (tabbed) {
      const page = await open(`/benchmarks/${tabbed.slug}`, 'desktop');
      await page.waitForSelector(LEAD, { timeout: 10000 });
      await page.locator('[role="tab"]:not([aria-selected="true"])').first().click();
      expect(`${tabbed.slug}: lead stays visible on another tab`, await page.locator(LEAD).isVisible());
    }

    // Trail, topic, cpu and date.
    const trailSeen = new Set();
    for (const [what, b] of [['topic', withTopic], ['cpu', withCpu], ['no question', noQuestion]]) {
      if (!b || trailSeen.has(b.slug)) continue;
      trailSeen.add(b.slug);
      const label = `${what} (${b.slug})`;
      const page = await open(`/benchmarks/${b.slug}`, 'desktop');
      await page.waitForSelector('main h1', { timeout: 10000 });
      const trail = page.locator('nav[aria-label="Breadcrumb"]');
      const hrefs = await trail.locator('a').evaluateAll((els) => els.map((e) => [e.getAttribute('href'), e.textContent.trim()]));
      expect(`${label}: trail links to /benchmarks`, hrefs.some(([h]) => h === '/benchmarks'), JSON.stringify(hrefs));
      if (b.topic) {
        const t = data.index.topics.find((x) => x.id === b.topic);
        expect(
          `${label}: trail links to the topic`,
          hrefs.some(([h, text]) => h === `/benchmarks?topic=${b.topic}` && text === t.label),
          JSON.stringify(hrefs),
        );
      } else {
        expect(`${label}: trail has no topic link`, hrefs.length === 1, JSON.stringify(hrefs));
      }
      const trailBottom = await trail.evaluate((n) => Math.round(n.getBoundingClientRect().bottom));
      const h1Top = await page.locator('main h1').first().evaluate((e) => Math.round(e.getBoundingClientRect().top));
      expect(`${label}: trail is above the title`, trailBottom <= h1Top, `trail=${trailBottom} h1=${h1Top}`);
      if (b.cpu) {
        const chips = (await page.locator('main header ~ div .MuiChip-root').allTextContents()).map((t) => t.trim());
        expect(`${label}: chip shows the cpu`, chips.includes(b.cpu), chips.join(' | '));
      }
      if (b.date) {
        const row = await page.locator('main header ~ div').first().innerText();
        expect(`${label}: date is in the conditions row`, row.includes(b.date), row);
        const above = await page.locator('main header').first().innerText();
        const trailText = await trail.innerText();
        expect(`${label}: date is not above the title`, !above.includes(b.date) && !trailText.includes(b.date), above);
      }
    }

    // Moving between two benchmark pages never shows the previous question.
    if (withQA && noQuestion) {
      const page = await open(`/benchmarks/${withQA.slug}`, 'desktop');
      await page.waitForSelector(LEAD, { timeout: 10000 });
      const start = withQA.question.slice(0, 30);
      await page.evaluate((s) => {
        window.history.pushState({}, '', `/benchmarks/${s}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, noQuestion.slug);
      const seenOld = [];
      for (let i = 0; i < 20; i++) {
        seenOld.push(await page.locator('main').evaluate((m, st) => m.innerText.includes(st), start));
        await page.waitForTimeout(25);
      }
      await page.waitForSelector('main h1', { timeout: 10000 });
      const title = await page.locator('main h1').first().textContent();
      expect('client-side navigation shows the next page', title.trim() === noQuestion.title, title);
      expect('client-side navigation never shows the previous question', seenOld.every((x) => !x), seenOld.join(','));
    }

    // --- benchmarks whose source README had a contents list -----------------------------
    for (const b of hadToc) {
      const page = await open(`/benchmarks/${b.slug}`, 'desktop');
      await page.waitForSelector('main p, main h2', { timeout: 10000 }).catch(() => {});
      const text = await page.locator('main').innerText();
      expect(`${b.slug}: "Table of Contents" appears nowhere in main`, !/table of contents/i.test(text));
      const tocLinks = (await page.locator('main nav:not([aria-label="Breadcrumb"]) a').allTextContents()).map((t) => t.trim());
      expect(`${b.slug}: sidebar "On this page" lists headings`, tocLinks.length > 0, tocLinks.join(','));
      expect(`${b.slug}: sidebar list has no "Table of Contents"`, !tocLinks.some((t) => /table of contents/i.test(t)), tocLinks.join(','));
      // Every sidebar link must point at an id that exists in the rendered document.
      const hrefs = await page.locator('main nav:not([aria-label="Breadcrumb"]) a').evaluateAll((els) => els.map((e) => e.getAttribute('href').slice(1)));
      const found = await page.evaluate((hs) => hs.map((h) => document.getElementById(h) !== null), hrefs);
      const missing = hrefs.filter((_, i) => !found[i]);
      expect(
        `${b.slug}: every "On this page" link targets an id in the document`,
        hrefs.length > 0 && missing.length === 0,
        `missing: ${missing.join(', ')}`,
      );
      // A sidebar link scrolls to its heading.
      const id = hrefs[Math.min(2, hrefs.length - 1)];
      await page.locator(`main nav:not([aria-label="Breadcrumb"]) a[href="#${id}"]`).click();
      await page.waitForTimeout(1200);
      const top = await page.evaluate((i) => document.getElementById(i)?.getBoundingClientRect().top ?? null, id);
      expect(`${b.slug}: sidebar link scrolls to its heading`, top !== null && top >= -5 && top < 300, `top=${top}`);
    }
  },
};
