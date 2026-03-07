import { expect, test } from "@playwright/test";

test("admin can quick edit and archive a product through stubbed APIs", async ({
  page,
}) => {
  const state = {
    active: [
      {
        id: "prod_1",
        name: "Vas",
        category: "Keramik",
        price: 10000,
        stock: 2,
        active: true,
      },
    ],
    archived: [],
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

  await page.route(/\/admin\/products(\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    const archived = url.searchParams.get("archived");
    const payload = archived === "true" ? state.archived : state.active;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: payload,
      }),
    });
  });

  await page.route(/\/admin\/products\/prod_1$/, async (route) => {
    if (route.request().method() === "PUT") {
      const formData = await route.request().postDataBuffer();
      const raw = formData.toString("utf8");
      if (raw.includes('name="stock"')) {
        state.active[0].stock = 7;
      }
      if (raw.includes('name="active"') && raw.includes("false")) {
        const archived = { ...state.active[0], active: false };
        state.active = [];
        state.archived = [archived];
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: { updated: true },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: state.active[0],
      }),
    });
  });

  page.on("dialog", (dialog) => dialog.accept());

  await page.goto("/admin?view=products");

  await expect(page.getByText("Produktlista")).toBeVisible();
  await expect(page.getByText("Vas")).toBeVisible();

  await page.getByRole("button", { name: "Snabbedit" }).click();
  await page.locator(".apl-edit-row input[type='number']").nth(1).fill("7");
  await page.getByRole("button", { name: "Spara" }).click();

  await expect(page.getByText(/Produkt uppdaterad/)).toBeVisible();
  await expect(page.getByRole("cell", { name: "7" })).toBeVisible();

  await page.locator(".apl-table .apl-btn-archive").click();
  await expect(page.getByText(/Produkt arkiverad/)).toBeVisible();
});
