import { test, expect } from '@playwright/test';

const cmsUrl = process.env.CMS_PREVIEW_URL;
const editorEmail = process.env.CMS_PREVIEW_EMAIL;
const editorPassword = process.env.CMS_PREVIEW_PASSWORD;

test.skip(!cmsUrl || !editorEmail || !editorPassword, 'Requires an authenticated local CMS preview environment');

test('CMS field and frontend preview stay visually linked', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(`${cmsUrl}/admin/login`);
  await page.locator('input[name="email"]').fill(editorEmail);
  await page.locator('input[name="password"]').fill(editorPassword);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin(?:\/)?$/);

  await expect(page.locator('.sg-editor-nav')).toBeVisible();
  await page.goto(`${cmsUrl}/admin/collections/pages?page=2`);
  await page.getByRole('link', { name: /Startsida/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Texter på sidan' })).toBeVisible();

  const revertDraft = page.getByRole('button', { name: /Revert to published/i });
  if (await revertDraft.isVisible().catch(() => false)) {
    await revertDraft.click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  }

  const previewIframe = page.locator('iframe[src^="http://localhost:5173"]');
  if (await previewIframe.count() === 0) {
    await page.getByRole('button', { name: /^Live Preview$/i }).click();
  }
  await expect(previewIframe).toBeVisible();
  const frame = previewIframe.contentFrame();
  const servicesHeading = frame.locator('h2', { hasText: 'Vad vi erbjuder' });
  await expect(servicesHeading).toBeAttached({ timeout: 15000 });

  const serviceImages = frame.locator('.service-card__image');
  await expect(serviceImages).toHaveCount(18);
  await expect.poll(() => serviceImages.evaluateAll((images) => images
    .filter((image) => !image.complete || image.naturalWidth === 0)
    .map((image) => image.currentSrc || image.src))).toEqual([]);

  const titleInput = page.getByLabel('Välkomstsektion – rubrik');
  const originalTitle = await titleInput.inputValue();
  try {
    await titleInput.fill('Previewtest utan publicering');
    const previewTitle = frame.getByText('Previewtest utan publicering', { exact: true });
    await expect(previewTitle).toBeVisible();
    await expect(previewTitle).toHaveClass(/sg-live-preview-highlight/);
    await previewTitle.click();
    await expect(titleInput).toBeFocused();
  } finally {
    await titleInput.fill(originalTitle);
    await expect(frame.getByText(originalTitle, { exact: true }).first()).toBeVisible();
  }
});
