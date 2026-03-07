import { expect, test } from "@playwright/test";

test("admin can create and deactivate a coupon through stubbed APIs", async ({
  page,
}) => {
  const state = {
    coupons: [],
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

  await page.route(/\/admin\/coupons(\?.*)?$/, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: state.coupons,
        }),
      });
      return;
    }

    const payload = JSON.parse(route.request().postData() || "{}");
    const coupon = {
      id: "promo_1",
      code: payload.code,
      couponId: "cpn_1",
      percentOff: payload.percentOff,
      amountOff: payload.amountOff,
      active: true,
      timesRedeemed: 0,
    };
    state.coupons = [coupon];
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: coupon,
      }),
    });
  });

  await page.route(/\/admin\/coupons\/promo_1$/, async (route) => {
    state.coupons = state.coupons.map((coupon) =>
      coupon.id === "promo_1" ? { ...coupon, active: false } : coupon
    );
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: { archived: true },
      }),
    });
  });

  page.on("dialog", (dialog) => dialog.accept());

  await page.goto("/admin?view=coupons");

  await page.getByPlaceholder("KOD123").fill("SOMMAR20");
  await page.getByPlaceholder("20").fill("20");
  await page.getByRole("button", { name: "Skapa Kod" }).click();

  await expect(page.getByText('Koden "SOMMAR20" skapad!')).toBeVisible();
  await expect(page.locator("table strong").getByText("SOMMAR20")).toBeVisible();

  await page.getByRole("button", { name: "Avaktivera" }).click();
  await expect(page.getByText("Kod avaktiverad")).toBeVisible();
});
