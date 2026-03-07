import { expect, test } from "@playwright/test";

test("admin can reorder and publish gallery images through stubbed APIs", async ({
  page,
}) => {
  const state = {
    gallery: {
      categories: [
        {
          id: "cat_1",
          name: "Keramik",
          slug: "keramik",
          order: 10,
          images: [
            {
              id: "img_1",
              title: "Vas 1",
              alt: "Vas 1",
              order: 10,
              published: false,
              categoryId: "cat_1",
              categoryIds: ["cat_1"],
              categoryOrders: { cat_1: 10 },
              url: "https://cdn.example.com/gallery/1.webp",
            },
            {
              id: "img_2",
              title: "Vas 2",
              alt: "Vas 2",
              order: 20,
              published: false,
              categoryId: "cat_1",
              categoryIds: ["cat_1"],
              categoryOrders: { cat_1: 20 },
              url: "https://cdn.example.com/gallery/2.webp",
            },
          ],
        },
      ],
    },
  };

  await page.route(/\/admin\/stats(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          totalOrders: 0,
          paidTotal: 0,
          averageOrder: 0,
          itemsTotal: 0,
          totalItems: 0,
          categories: [],
          series: [],
          generatedAt: 1734603600,
          cached: false,
        },
      }),
    });
  });

  await page.route(/\/admin\/orders(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          data: [],
          has_more: false,
        },
      }),
    });
  });

  await page.route(/\/admin\/gallery$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: state.gallery,
      }),
    });
  });

  await page.route(/\/admin\/gallery\/images\/(img_1|img_2)$/, async (route) => {
    const id = route.request().url().split("/").pop();
    const payload = JSON.parse(route.request().postData() || "{}");
    state.gallery.categories[0].images = state.gallery.categories[0].images.map((image) =>
      image.id === id
        ? {
            ...image,
            ...payload,
          }
        : image
    );
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: { updated: true },
      }),
    });
  });

  await page.goto("/admin?view=gallery");

  await expect(page.getByRole("heading", { name: "Galleriöversikt" })).toBeVisible();
  await page.locator(".admin-btn-move").nth(1).click();
  await expect(page.getByText("Bild flyttad ner.")).toBeVisible();
  await page.getByRole("button", { name: "Spara ordning" }).click();
  await expect(page.getByText(/Ändringar sparade/)).toBeVisible();

  await page.getByLabel("Markera alla bilder").check();
  await page.getByRole("button", { name: "Publicera markerade" }).click();
  await expect(page.getByText("Bilder publicerade.")).toBeVisible();
});
