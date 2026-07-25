// V26: "Alla bilder" is a real membership category with its own sort_order, so
// each category — including that one — has an independent sequence. These two
// tests pin the invariant that reordering in one view never rewrites another's.
import { test, expect } from "@playwright/test";

const gallery = () => ({
  ok: true,
  data: {
    categories: [
      {
        id: "alla",
        name: "Alla bilder",
        slug: "alla-bilder",
        order: -1,
        images: [
          { id: "c", title: "Loftet 1", url: "/images/slides/slide1.webp", order: 10, published: true, categoryIds: ["overvaning", "alla"], categoryOrders: { overvaning: 10, alla: 10 } },
          { id: "b", title: "Ladan 2", url: "/images/slides/slide2.webp", order: 20, published: true, categoryIds: ["undervaning", "alla"], categoryOrders: { undervaning: 10, alla: 20 } },
          { id: "a", title: "Ladan 1", url: "/images/slides/slide3.webp", order: 30, published: true, categoryIds: ["undervaning", "alla"], categoryOrders: { undervaning: 20, alla: 30 } },
        ],
      },
      {
        id: "undervaning",
        name: "Ladan",
        slug: "ladan",
        order: 1,
        images: [
          { id: "b", title: "Ladan 2", url: "/images/slides/slide2.webp", order: 10, published: true, categoryIds: ["undervaning", "alla"], categoryOrders: { undervaning: 10, alla: 20 } },
          { id: "a", title: "Ladan 1", url: "/images/slides/slide3.webp", order: 20, published: true, categoryIds: ["undervaning", "alla"], categoryOrders: { undervaning: 20, alla: 30 } },
        ],
      },
      {
        id: "overvaning",
        name: "Loftet",
        slug: "loftet",
        order: 2,
        images: [
          { id: "c", title: "Loftet 1", url: "/images/slides/slide1.webp", order: 10, published: true, categoryIds: ["overvaning", "alla"], categoryOrders: { overvaning: 10, alla: 10 } },
        ],
      },
    ],
  },
});

test("reordering Alla bilder writes the alla sort_order only", async ({ page }) => {
  const patches = [];
  await page.addInitScript(() => window.localStorage.setItem("admin_key", "dev"));
  await page.route(/\/admin\/gallery\/images\/[a-z]$/, async (route) => {
    patches.push(JSON.parse(route.request().postData() || "{}"));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { updated: true } }),
    });
  });
  await page.route(/\/admin\/gallery$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(gallery()),
    })
  );

  await page.goto("/admin?view=gallery");
  await expect(page.getByRole("heading", { name: "Galleriöversikt" })).toBeVisible();

  // Alla bilder is the default category and must now be reorderable.
  const titles = () =>
    page.locator(".admin-gallery-image-meta-title").allTextContents();
  expect(await titles()).toEqual(["Loftet 1", "Ladan 2", "Ladan 1"]);

  await page.getByRole("button", { name: "Ordna bilder" }).click();
  const loftetPosition = page.getByLabel(
    "Placering för Loftet 1 i Alla bilder"
  );
  await loftetPosition.fill("2");
  await loftetPosition.press("Enter");
  await expect(
    page.locator(".admin-gallery-public-preview-grid img").first()
  ).toHaveAttribute("alt", "Ladan 2");
  await page.getByRole("button", { name: "Spara ordning" }).click();
  await expect(page.getByText(/Bildordningen sparad/)).toBeVisible();

  // Only the two swapped images, and only the alla sequence changes.
  expect(patches.map((p) => [p.categoryId, p.categoryOrders]).sort()).toEqual(
    [
      ["overvaning", { overvaning: 10, alla: 20 }],
      ["undervaning", { undervaning: 10, alla: 10 }],
    ].sort()
  );
  patches.forEach((p) => expect(p.categoryIds).toContain("alla"));
  expect(patches.find((p) => p.categoryId === "overvaning").categoryIds).toEqual([
    "overvaning",
    "alla",
  ]);
});

test("reordering a specific category leaves the Alla bilder sequence alone", async ({
  page,
}) => {
  const patches = [];
  await page.addInitScript(() => window.localStorage.setItem("admin_key", "dev"));
  await page.route(/\/admin\/gallery\/images\/[a-z]$/, async (route) => {
    patches.push(JSON.parse(route.request().postData() || "{}"));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { updated: true } }),
    });
  });
  await page.route(/\/admin\/gallery$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(gallery()),
    })
  );

  await page.goto("/admin?view=gallery");
  await expect(page.getByRole("heading", { name: "Galleriöversikt" })).toBeVisible();

  await page.getByRole("button", { name: /Välj kategori|Alla bilder/ }).first().click();
  await page.getByRole("option", { name: /Ladan/ }).click();
  await expect(
    page.locator(".admin-gallery-image-meta-title")
  ).toHaveText(["Ladan 2", "Ladan 1"]);

  await page.getByRole("button", { name: "Ordna bilder" }).click();
  const ladanPosition = page.getByLabel("Placering för Ladan 2 i Ladan");
  await ladanPosition.fill("2");
  await ladanPosition.press("Enter");
  await page.getByRole("button", { name: "Spara ordning" }).click();
  await expect(page.getByText(/Bildordningen sparad/)).toBeVisible();

  // Only undervaning moves; each image keeps the alla order it arrived with.
  expect(patches.map((p) => p.categoryOrders).sort((a, b) => a.alla - b.alla)).toEqual([
    { undervaning: 20, alla: 20 },
    { undervaning: 10, alla: 30 },
  ]);
});

// V27: the drawer sets the position per category. Standing in one category and
// repositioning the image in another must write only that other category's
// sort_order — the case the dedicated ordering view does not express because it
// intentionally works with one active category at a time.
test("the drawer sets a position in Alla bilder while standing in a category", async ({
  page,
}) => {
  const patches = [];
  await page.addInitScript(() => window.localStorage.setItem("admin_key", "dev"));
  await page.route(/\/admin\/gallery\/images\/[a-z]$/, async (route) => {
    patches.push(JSON.parse(route.request().postData() || "{}"));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { updated: true } }),
    });
  });
  await page.route(/\/admin\/gallery$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(gallery()),
    })
  );

  await page.goto("/admin?view=gallery");
  await expect(page.getByRole("heading", { name: "Galleriöversikt" })).toBeVisible();

  await page.getByRole("button", { name: /Välj kategori|Alla bilder/ }).first().click();
  await page.getByRole("option", { name: /Loftet/ }).click();
  await expect(page.locator(".admin-gallery-image-meta-title")).toHaveText([
    "Loftet 1",
  ]);

  await page
    .locator(".admin-gallery-image-actions")
    .first()
    .getByRole("button", { name: "Redigera" })
    .click();

  // Both memberships are offered, Alla bilder first.
  await expect(page.locator(".admin-gallery-order-row-name")).toHaveText([
    "Alla bilder",
    "Loftet",
  ]);
  await page.getByRole("button", { name: /Ordning/ }).click();
  const allaPosition = page.getByLabel("Position i Alla bilder");
  await expect(allaPosition).toHaveValue("1");

  await allaPosition.fill("3");
  await allaPosition.press("Enter");
  await expect(page.getByLabel("Position i Alla bilder")).toHaveValue("3");

  await page.getByRole("button", { name: "Spara bild" }).click();
  await expect(page.getByText(/Bilden sparad|Ändringar sparade/)).toBeVisible();

  // Loftet has one image, so its own sequence cannot move — only alla changes.
  const moved = patches.find((patch) => patch.categoryId === "overvaning");
  expect(moved.categoryOrders).toEqual({ overvaning: 10, alla: 30 });
  expect(moved.categoryIds).toEqual(["overvaning", "alla"]);
});

test("the ordering workspace previews, drags and saves one category", async ({
  page,
}) => {
  const patches = [];
  await page.addInitScript(() => window.localStorage.setItem("admin_key", "dev"));
  await page.route(/\/admin\/gallery\/images\/[a-z]$/, async (route) => {
    patches.push(JSON.parse(route.request().postData() || "{}"));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { updated: true } }),
    });
  });
  await page.route(/\/admin\/gallery$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(gallery()),
    })
  );

  await page.goto("/admin?view=gallery");
  await page.getByRole("button", { name: "Ordna bilder" }).click();

  await expect(
    page.getByRole("heading", { name: "Ordna bilder · Alla bilder" })
  ).toBeVisible();
  await expect(
    page.locator(".admin-gallery-public-preview-categories button.is-active")
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("dialog").locator(".admin-ui-drawer-content")
  ).toHaveCount(0);
  await expect(
    page.locator(".admin-gallery-public-preview").getByRole("heading", {
      name: "Bildgalleri",
    })
  ).toBeVisible();
  const previewTitles = () =>
    page
      .locator(".admin-gallery-public-preview-grid img")
      .evaluateAll((images) => images.map((image) => image.alt));
  expect(await previewTitles()).toEqual(["Loftet 1", "Ladan 2", "Ladan 1"]);
  const previewGrid = page.locator(".admin-gallery-public-preview-grid");
  await expect(previewGrid).toHaveClass(/is-3-columns/);
  await page.getByRole("button", { name: "Visa 2 kolumner" }).click();
  await expect(previewGrid).toHaveClass(/is-2-columns/);

  const previewItems = previewGrid.locator("figure");
  await previewItems.nth(0).dragTo(previewItems.nth(1));
  expect(await previewTitles()).toEqual(["Ladan 2", "Loftet 1", "Ladan 1"]);

  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Avbryt", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Ordna bilder · Alla bilder" })
  ).not.toBeVisible();
  await expect(page.locator(".admin-gallery-image-meta-title")).toHaveText([
    "Loftet 1",
    "Ladan 2",
    "Ladan 1",
  ]);

  await page.getByRole("button", { name: "Ordna bilder" }).click();
  const loftetPosition = page.getByLabel(
    "Placering för Loftet 1 i Alla bilder"
  );
  await loftetPosition.fill("3");
  await loftetPosition.press("Enter");
  expect(await previewTitles()).toEqual(["Ladan 2", "Ladan 1", "Loftet 1"]);
  await page.getByRole("button", { name: "Spara ordning" }).click();
  await expect(page.getByText(/Bildordningen sparad/)).toBeVisible();

  expect(patches).toHaveLength(3);
  const loftet = patches.find((patch) => patch.categoryId === "overvaning");
  expect(loftet.categoryOrders).toEqual({ overvaning: 10, alla: 30 });
  expect(loftet.categoryIds).toEqual(["overvaning", "alla"]);
});
