import { expect, test } from "@playwright/test";

test("admin can upload a gallery image and refresh the category list", async ({
  page,
}) => {
  let uploadRequestCount = 0;
  const state = {
    gallery: {
      categories: [
        {
          id: "alla",
          name: "Alla bilder",
          slug: "alla-bilder",
          order: 0,
          images: [],
        },
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

  await page.route(/\/admin\/gallery\/uploads$/, async (route) => {
    uploadRequestCount += 1;
    if (uploadRequestCount === 1) {
      await route.fulfill({
        status: 429,
        headers: { "Retry-After": "1" },
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "rate_limited",
            message: "Too many requests",
            retryable: true,
          },
        }),
      });
      return;
    }
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
    const image = {
      id: "img_1",
      title: payload.title,
      alt: payload.alt,
      published: false,
      categoryId: "cat_1",
      categoryIds: ["cat_1", "alla"],
      storageKey: payload.storageKey,
      url: payload.url,
    };
    state.gallery.categories[0].images = [image];
    state.gallery.categories[1].images = [image];
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: image,
      }),
    });
  });

  await page.goto("/admin?view=gallery");

  await expect(page.getByRole("heading", { name: "Galleriöversikt" })).toBeVisible();
  await page.locator(".admin-gallery-category-dropdown-trigger").click();
  await page.getByRole("option", { name: /Keramik/ }).click();
  await expect(page.getByRole("heading", { name: "Keramik" })).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({
    name: "vas.png",
    mimeType: "image/png",
    buffer: Buffer.from("fake-image"),
  });

  await expect(page.getByText("1 bild redo")).toBeVisible();
  expect(uploadRequestCount).toBe(0);
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem("admin-gallery-upload-recovery-v1")
      )
    )
    .not.toBeNull();
  const unloadWasPrevented = await page.evaluate(
    () =>
      !window.dispatchEvent(
        new Event("beforeunload", { bubbles: false, cancelable: true })
      )
  );
  expect(unloadWasPrevented).toBe(true);
  await page.getByRole("button", { name: "Ladda upp 1 bild" }).click();
  await expect(page.getByText("Uppladdning klar.")).toBeVisible();
  expect(uploadRequestCount).toBe(2);
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem("admin-gallery-upload-recovery-v1")
      )
    )
    .toBeNull();
  await expect(
    page.locator(".admin-gallery-category-dropdown-name")
  ).toHaveText("Keramik");

  // The alt-text field lives in the image editor drawer, opened from the card.
  await page.locator(".admin-gallery-image-preview").first().click();
  await expect(page.getByLabel("Alternativtext")).toHaveValue("vas");
});
