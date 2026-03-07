import { expect, test } from "@playwright/test";

test("admin can upload a gallery image and refresh the category list", async ({
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
          images: [],
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

  await page.route(/\/admin\/uploads\/images$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          uploadId: "upl_gallery_1",
          storageKey: "gallery/2026/03/vas.webp",
          publicUrl: "https://cdn.example.com/gallery/2026/03/vas.webp",
          filename: "vas.webp",
        },
      }),
    });
  });

  await page.route(/\/admin\/gallery\/images$/, async (route) => {
    const payload = JSON.parse(route.request().postData() || "{}");
    state.gallery.categories[0].images = [
      {
        id: "img_1",
        title: payload.title,
        alt: payload.alt,
        published: false,
        categoryId: "cat_1",
        categoryIds: ["cat_1"],
        storageKey: payload.storageKey,
        url: payload.url,
      },
    ];
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: state.gallery.categories[0].images[0],
      }),
    });
  });

  await page.goto("/admin?view=gallery");

  await expect(page.getByRole("heading", { name: "Galleriöversikt" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Keramik" })).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({
    name: "vas.png",
    mimeType: "image/png",
    buffer: Buffer.from("fake-image"),
  });

  await expect(page.getByText("Uppladdning klar.")).toBeVisible();
  await expect(page.locator('input[value="vas"]').first()).toBeVisible();
});
