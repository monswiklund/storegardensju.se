import { expect, test } from "@playwright/test";

test("admin can upload an event image and save the event through stubbed APIs", async ({
  page,
}) => {
  const state = {
    events: [],
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

  await page.route(/\/admin\/events$/, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            events: state.events,
          },
        }),
      });
      return;
    }

    const payload = JSON.parse(route.request().postData() || "{}");
    const created = {
      id: "event_1",
      computedBucket: "upcoming",
      ...payload,
    };
    state.events = [created];
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: created,
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
          uploadId: "upl_evt_1",
          storageKey: "events/2026/03/poster.webp",
          publicUrl: "https://cdn.example.com/events/2026/03/poster.webp",
          filename: "poster.webp",
        },
      }),
    });
  });

  await page.goto("/admin?view=events");

  await expect(page.getByText("Evenemangslista")).toBeVisible();
  await page.getByRole("button", { name: "+ Nytt" }).click();

  await page.locator('input[class="admin-input"]').first().fill("Vårsalong");
  await page.locator('input[type="datetime-local"]').nth(0).fill("2026-03-20T18:00");
  await page.locator('input[type="datetime-local"]').nth(1).fill("2026-03-20T21:00");

  await page.locator('input[type="file"]').setInputFiles({
    name: "poster.png",
    mimeType: "image/png",
    buffer: Buffer.from("fake-image"),
  });

  await expect(
    page.getByText("Bilder uppladdade och optimerade. Spara eventet för att publicera ändringarna.")
  ).toBeVisible();

  await page.getByRole("button", { name: "Spara händelse" }).click();

  await expect(page.getByText("Event skapat.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Vårsalong/ })).toBeVisible();
});
