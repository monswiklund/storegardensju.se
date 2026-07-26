import { expect, test } from "@playwright/test";

// The two course hubs - /kurser/yoga and /kurser/konst - are
// durable pages whose dated passes are anchored sections rather than their own
// URLs. Those anchors are shared as links and are the url of every Event object
// in the page's structured data. ScrollToTop force-scrolls to the top on route
// changes, so a deep link only works because it special-cases the hash.
// Both hubs sit in a nav section with a subnav bar, so an anchor has to clear
// the navbar and that bar - ScrollToTop measures it at runtime rather than
// assuming a fixed height.
async function fixedChromeBottom(page) {
  return page.evaluate(() => {
    const navbar = document.querySelector(".navbar");
    const subnav = document.querySelector(".event-subnav.active");
    const bottom = (el) => (el ? el.getBoundingClientRect().bottom : 0);
    return Math.max(bottom(navbar), bottom(subnav));
  });
}

async function expectAnchorClearsChrome(page, selector) {
  const offset = await anchorOffset(page, selector);
  const chromeBottom = await fixedChromeBottom(page);

  expect(chromeBottom).toBeGreaterThan(0);
  expect(offset).toBeGreaterThanOrEqual(chromeBottom - 5);
  expect(offset).toBeLessThan(chromeBottom + 60);
}

const HUBS = [
  {
    path: "/kurser/yoga",
    faqSelector: "#fragor-och-svar",
    anchorPrefix: "yoga",
  },
  {
    path: "/kurser/konst",
    faqSelector: "#fragor-och-svar",
    anchorPrefix: "maleri",
  },
];

async function anchorOffset(page, selector) {
  const box = await page.locator(selector).boundingBox();
  return box.y;
}

test("deep link to a pass anchor lands on the section, clear of the navbar", async ({
  page,
}) => {
  await page.goto("/kurser/yoga#yoga-30-juli");
  await page.locator("#yoga-30-juli").waitFor();
  // ScrollToTop retries the hash scroll for up to 600ms while lazy content lays out.
  await page.waitForTimeout(900);

  await expectAnchorClearsChrome(page, "#yoga-30-juli");
});

for (const { path, faqSelector, anchorPrefix } of HUBS) {
  test(`deep link to the FAQ section on ${path} works the same way`, async ({
    page,
  }) => {
    await page.goto(`${path}${faqSelector}`);
    await page.locator(faqSelector).waitFor();
    await page.waitForTimeout(900);

    await expectAnchorClearsChrome(page, faqSelector);
  });

  test(`a plain load of ${path} still starts at the top`, async ({ page }) => {
    await page.goto(path);
    await page.locator(faqSelector).waitFor();
    await page.waitForTimeout(500);

    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(40);
  });

  test(`visible FAQ on ${path} matches the FAQPage structured data`, async ({
    page,
  }) => {
    // Google requires FAQ markup to match what a visitor can see; drifting apart
    // risks a manual action, so the page and the JSON-LD read the same data.
    await page.goto(path);
    await page.locator(faqSelector).waitFor();

    const rendered = await page.locator(".kurser-faq__item dt").allInnerTexts();
    const markedUp = await page.evaluate(() => {
      const script = document.querySelector('script[data-seo-jsonld="route"]');
      const faq = JSON.parse(script.textContent).find(
        (entry) => entry["@type"] === "FAQPage"
      );
      return faq.mainEntity.map((question) => question.name);
    });

    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered).toEqual(markedUp);
  });

  test(`every Event on ${path} points at an anchor that exists on the page`, async ({
    page,
  }) => {
    await page.goto(path);
    await page.locator(faqSelector).waitFor();

    const events = await page.evaluate(() => {
      const script = document.querySelector('script[data-seo-jsonld="route"]');
      return JSON.parse(script.textContent)
        .filter((entry) => entry["@type"] === "Event")
        .map((entry) => entry.url);
    });

    for (const url of events) {
      expect(new URL(url).pathname).toBe(`${path}/`);
      const anchor = new URL(url).hash;
      expect(anchor).toMatch(new RegExp(`^#${anchorPrefix}-\\d+-[a-zå-ö]+$`));
      await expect(page.locator(anchor)).toHaveCount(1);
    }
  });
}

test("the hubs cross-link so each one has a crawlable path to the other", async ({
  page,
}) => {
  await page.goto("/kurser/yoga");
  await expect(
    page.locator('a[href="/kurser/konst/"]').first()
  ).toBeVisible();

  await page.goto("/kurser/konst");
  await expect(page.locator('a[href="/kurser/yoga/"]').first()).toBeVisible();
});

test("the kurser index links to both hubs", async ({ page }) => {
  await page.goto("/kurser");

  await expect(page.locator('a[href="/kurser/yoga/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/kurser/konst/"]').first()).toBeVisible();
});

test("a legacy /konst link ends up on the maleri hub", async ({ page }) => {
  // GitHub Pages cannot 301, so the old URL is a static redirect page in prod
  // and a Navigate route in the SPA. Either way the visitor lands here.
  await page.goto("/konst");
  await page.waitForURL(/\/kurser\/konst\/?$/);

  await expect(page.locator("#fragor-och-svar")).toHaveCount(1);
});

test("a legacy /kurser anchor is forwarded to the same anchor on the yoga hub", async ({
  page,
}) => {
  // /kurser#yoga-30-juli was the url of every Event object before the split and
  // is out in the wild as a shared link.
  await page.goto("/kurser#yoga-30-juli");
  await page.waitForURL(/\/kurser\/yoga\/?#yoga-30-juli$/);
  await page.locator("#yoga-30-juli").waitFor();
  await page.waitForTimeout(900);

  await expectAnchorClearsChrome(page, "#yoga-30-juli");
});
