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
          { id: "c", title: "Loftet 1", url: "/c.webp", order: 10, published: true, categoryIds: ["overvaning", "alla"], categoryOrders: { overvaning: 10, alla: 10 } },
          { id: "b", title: "Ladan 2", url: "/b.webp", order: 20, published: true, categoryIds: ["undervaning", "alla"], categoryOrders: { undervaning: 10, alla: 20 } },
          { id: "a", title: "Ladan 1", url: "/a.webp", order: 30, published: true, categoryIds: ["undervaning", "alla"], categoryOrders: { undervaning: 20, alla: 30 } },
        ],
      },
      {
        id: "undervaning",
        name: "Ladan",
        slug: "ladan",
        order: 1,
        images: [
          { id: "b", title: "Ladan 2", url: "/b.webp", order: 10, published: true, categoryIds: ["undervaning", "alla"], categoryOrders: { undervaning: 10, alla: 20 } },
          { id: "a", title: "Ladan 1", url: "/a.webp", order: 20, published: true, categoryIds: ["undervaning", "alla"], categoryOrders: { undervaning: 20, alla: 30 } },
        ],
      },
      {
        id: "overvaning",
        name: "Loftet",
        slug: "loftet",
        order: 2,
        images: [
          { id: "c", title: "Loftet 1", url: "/c.webp", order: 10, published: true, categoryIds: ["overvaning", "alla"], categoryOrders: { overvaning: 10, alla: 10 } },
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

  await page
    .locator(".admin-gallery-image-move")
    .first()
    .getByRole("button", { name: "Flytta ner" })
    .click();
  expect(await titles()).toEqual(["Ladan 2", "Loftet 1", "Ladan 1"]);

  await page.getByRole("button", { name: "Spara ändringar" }).click();
  await expect(page.getByText(/Ändringar sparade/)).toBeVisible();

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

  await page
    .locator(".admin-gallery-image-move")
    .first()
    .getByRole("button", { name: "Flytta ner" })
    .click();
  await page.getByRole("button", { name: "Spara ändringar" }).click();
  await expect(page.getByText(/Ändringar sparade/)).toBeVisible();

  // Only undervaning moves; each image keeps the alla order it arrived with.
  expect(patches.map((p) => p.categoryOrders).sort((a, b) => a.alla - b.alla)).toEqual([
    { undervaning: 20, alla: 20 },
    { undervaning: 10, alla: 30 },
  ]);
});
