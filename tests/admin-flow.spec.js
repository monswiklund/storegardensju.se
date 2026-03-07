import { expect, test } from "@playwright/test";

test("admin order status update refreshes list and detail via stubbed API", async ({
  page,
}) => {
  let ordersRequestCount = 0;
  let fulfillmentUpdateCount = 0;
  const state = {
    orders: [
      {
        id: "ord_1",
        created: 1734600000,
        status: "complete",
        paymentStatus: "paid",
        amountTotal: 124900,
        currency: "sek",
        customerEmail: "kund@exempel.se",
        fulfillment: "new",
        fulfillmentUpdatedAt: 1734603600,
      },
    ],
    detail: {
      id: "ord_1",
      created: 1734600000,
      status: "complete",
      paymentStatus: "paid",
      amountTotal: 124900,
      currency: "sek",
      customerEmail: "kund@exempel.se",
      customerName: "Kund Exempel",
      fulfillment: "new",
      adminNote: "",
      trackingNumber: "",
      trackingCarrier: "auto",
      fulfillmentUpdatedAt: 1734603600,
      lineItems: [],
      events: [{ type: "created", timestamp: 1734600000 }],
    },
  };

  await page.route(/\/admin\/stats(\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          totalOrders: 1,
          paidTotal: 124900,
          averageOrder: 124900,
          itemsTotal: 1,
          totalItems: 1,
          categories: [],
          series: [],
          generatedAt: 1734603600,
          cached: false,
        },
      }),
    });
  });

  await page.route(/\/admin\/orders\/ord_1\/fulfillment$/, async (route) => {
    fulfillmentUpdateCount += 1;
    const payload = JSON.parse(route.request().postData() || "{}");
    state.orders[0].fulfillment = payload.status || state.orders[0].fulfillment;
    state.detail.fulfillment = payload.status || state.detail.fulfillment;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { updated: true } }),
    });
  });

  await page.route(/\/admin\/orders\/ord_1$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: state.detail }),
    });
  });

  await page.route(/\/admin\/orders(\?.*)?$/, async (route) => {
    ordersRequestCount += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          data: state.orders,
          has_more: false,
        },
      }),
    });
  });

  await page.goto("/admin?view=orders");

  await expect(page.getByText("Orderlista")).toBeVisible();
  await expect(page.locator(".admin-order-email").first()).toHaveText("kund@exempel.se");
  await expect(page.locator("#status")).toHaveValue("new");

  await page.locator("#status").selectOption("ship");
  await page.getByRole("button", { name: "Spara ändringar" }).click();

  await expect(page.locator("#status")).toHaveValue("ship");
  await expect(page.getByText(/Order uppdaterad|Status uppdaterad/)).toBeVisible();
  await expect.poll(() => fulfillmentUpdateCount).toBe(1);
  await expect.poll(() => ordersRequestCount).toBeGreaterThan(1);
});
