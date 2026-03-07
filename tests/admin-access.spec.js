import { expect, test } from "@playwright/test";

test("admin falls back to access login on unauthorized session and can recover on retry", async ({
  page,
}) => {
  let ordersUnauthorized = true;

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
    if (ordersUnauthorized) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "unauthorized",
            message: "Unauthorized",
            requestId: "req_auth",
            retryable: false,
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
          data: [],
          has_more: false,
        },
      }),
    });
  });

  await page.goto("/admin?view=orders");

  await expect(page.getByRole("heading", { name: "Logga in till Admin" })).toBeVisible();
  await expect(
    page.getByText("Sessionen saknas eller har löpt ut.")
  ).toBeVisible();

  ordersUnauthorized = false;
  await page.getByRole("button", { name: "Jag är inloggad" }).click();

  await expect(page.getByText("Orderlista")).toBeVisible();
});

