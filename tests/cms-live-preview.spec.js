import { test, expect } from '@playwright/test';

const cmsUrl = process.env.CMS_PREVIEW_URL;
const editorEmail = process.env.CMS_PREVIEW_EMAIL;
const editorPassword = process.env.CMS_PREVIEW_PASSWORD;

test.skip(!cmsUrl || !editorEmail || !editorPassword, 'Requires an authenticated local CMS preview environment');
test.describe.configure({ timeout: 60_000 });

async function login(page) {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(`${cmsUrl}/admin/login`);
  await page.locator('input[name="email"]').fill(editorEmail);
  await page.locator('input[name="password"]').fill(editorPassword);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin(?:\/)?$/);
}

async function pageId(page, slug) {
  const response = await page.request.get(`${cmsUrl}/api/pages?limit=100&depth=0`);
  const data = await response.json();
  return data.docs.find((doc) => doc.slug === slug).id;
}

async function showContentTab(page) {
  const heading = page.getByRole('heading', { name: 'Texter på sidan' });
  await expect(async () => {
    if (!(await heading.isVisible().catch(() => false))) {
      await page.getByRole('button', { name: 'Sidans innehåll' }).click();
    }
    await expect(heading).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 20000 });
}

async function openPreview(page, slug) {
  await page.goto(`${cmsUrl}/admin/collections/pages/${await pageId(page, slug)}`);
  const revertDraft = page.getByRole('button', { name: /Revert to published/i });
  if (await revertDraft.isVisible().catch(() => false)) {
    await revertDraft.click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  }
  await expect(page.getByRole('button', { name: 'Sidans innehåll' })).toBeVisible({ timeout: 20000 });
  await showContentTab(page);
  const previewIframe = page.locator('iframe').first();
  if (await previewIframe.count() === 0) {
    await page.getByRole('button', { name: /^Live Preview$/i }).click({ timeout: 3000 }).catch(async (error) => {
      if (await previewIframe.count() === 0) throw error;
    });
  }
  await expect(previewIframe).toBeVisible();
  await showContentTab(page);
  return previewIframe.contentFrame();
}

test('CMS field and frontend preview stay visually linked', async ({ page }) => {
  await login(page);

  await expect(page.locator('.sg-editor-nav')).toBeVisible();
  const frame = await openPreview(page, 'home');

  const servicesHeading = frame.locator('h2', { hasText: 'Vad vi erbjuder' });
  await expect(servicesHeading).toBeAttached({ timeout: 15000 });

  const serviceImages = frame.locator('.service-card__image');
  await expect(serviceImages).toHaveCount(18);
  await expect.poll(() => serviceImages.evaluateAll((images) => images
    .filter((image) => !image.complete || image.naturalWidth === 0)
    .map((image) => image.currentSrc || image.src))).toEqual([]);

  const heroSection = page.getByRole('button', { name: /Sidhuvud & Välkomstsektion/ });
  if ((await heroSection.getAttribute('aria-expanded')) !== 'true') await heroSection.click();
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

  await page.getByRole('button', { name: /Erbjudanden & Utbud/ }).click();
  const imageButton = page.getByRole('button', { name: 'Byt bild' }).first();
  await imageButton.click();
  const cards = page.locator('.sg-media-picker__card');
  await expect(cards.first()).toBeVisible();
  const originalIndex = await cards.evaluateAll((items) => items.findIndex((item) => item.getAttribute('aria-pressed') === 'true'));
  const replacementIndex = originalIndex === 0 ? 1 : 0;
  const replacementSrc = await cards.nth(replacementIndex).locator('img').getAttribute('src');
  try {
    await cards.nth(replacementIndex).click();
    const replacementFile = new URL(replacementSrc, cmsUrl).pathname.split('/').pop();
    await expect.poll(() => frame.locator('img').evaluateAll((images, filename) => images.some((image) =>
      (image.currentSrc || image.src).includes(filename) && image.complete && image.naturalWidth > 0), replacementFile)).toBe(true);
  } finally {
    await expect(page.getByRole('heading', { name: 'Texter på sidan' })).toBeVisible({ timeout: 20000 });
    const section = page.getByRole('button', { name: /Erbjudanden & Utbud/ });
    if ((await section.getAttribute('aria-expanded')) !== 'true') await section.click();
    await page.getByRole('button', { name: 'Byt bild' }).first().click();
    const restoreCards = page.locator('.sg-media-picker__card');
    await expect(restoreCards.first()).toBeVisible();
    await restoreCards.nth(originalIndex).click();
  }
});

test('nested list rows update, reorder, add and remove without publishing', async ({ page }) => {
  await login(page);
  const frame = await openPreview(page, 'wedding');
  await page.getByRole('button', { name: /Dagen & Planering/ }).click();

  const list = page.locator('.sg-content-list').filter({ hasText: 'Ett möjligt upplägg – steg' });
  const item = list.locator('.sg-content-list__item').first();
  const titleInput = item.locator('input').nth(1);
  const originalTitle = await titleInput.inputValue();
  try {
    await titleInput.fill('Välkomna previewgästerna');
    await expect(frame.getByText('Välkomna previewgästerna', { exact: true })).toBeVisible();

    await item.getByRole('button', { name: 'Flytta raden nedåt' }).click();
    await expect(list.locator('.sg-content-list__item').nth(1).locator('input').nth(1)).toHaveValue('Välkomna previewgästerna');
    await list.locator('.sg-content-list__item').nth(1).getByRole('button', { name: 'Flytta raden uppåt' }).click();

    await list.getByRole('button', { name: 'Lägg till rad' }).click();
    const added = list.locator('.sg-content-list__item').last();
    await added.locator('label').filter({ hasText: 'Rubrik eller fråga' }).locator('input').fill('Tillfällig previewrad');
    await added.locator('label').filter({ hasText: 'Text eller svar' }).locator('textarea').fill('Syns direkt och tas sedan bort.');
    await expect(frame.getByText('Tillfällig previewrad', { exact: true })).toBeVisible();
    await added.getByRole('button', { name: 'Ta bort raden' }).click();
    await expect(frame.getByText('Tillfällig previewrad', { exact: true })).toHaveCount(0);
  } finally {
    await titleInput.fill(originalTitle, { timeout: 5000 }).catch(() => {});
  }
});

test('URL fields and appearance controls update their real preview targets', async ({ page }) => {
  await page.route('**/api/instagram', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      items: [{ id: 'preview-post', media_type: 'IMAGE', media_url: 'https://example.com/preview.jpg' }],
    }),
  }));
  await login(page);
  const frame = await openPreview(page, 'home');

  await page.getByRole('button', { name: 'Sidans innehåll' }).click();
  const otherSection = page.getByRole('button', { name: /Övriga texter/ });
  if ((await otherSection.getAttribute('aria-expanded')) !== 'true') await otherSection.click();
  const profileUrl = page.getByLabel('Instagramtelefon – profillänk');
  const originalUrl = await profileUrl.inputValue();
  const previewUrl = 'https://example.com/live-preview-test';
  try {
    await profileUrl.fill(previewUrl);
    const linkedTarget = frame.locator(`a[href="${previewUrl}"]`).first();
    await expect(linkedTarget).toBeVisible();
    await expect(linkedTarget).toHaveAttribute('data-cms-fields', /instagram\.profile-url/);
    await expect(linkedTarget).toHaveClass(/sg-live-preview-highlight/);
  } finally {
    await profileUrl.fill(originalUrl);
  }

  await page.getByRole('button', { name: 'Utseende & delning' }).click();
  const theme = page.getByRole('combobox').first();
  try {
    await theme.click();
    await page.getByText('Linne – varm och neutral', { exact: true }).click();
    await expect(frame.locator('[data-cms-theme="linen"]')).toBeAttached();
  } finally {
    await theme.click();
    await page.getByText('Original – salvia och linne', { exact: true }).click();
  }
});

test('live preview exposes mobile, tablet and desktop modes', async ({ page }) => {
  await login(page);
  await openPreview(page, 'home');
  const breakpoint = page.locator('.live-preview-toolbar-controls__breakpoint button').first();
  const width = page.locator('input[name="live-preview-width"]');

  for (const [label, expectedWidth] of [['Mobil', '375'], ['Surfplatta', '768'], ['Dator', '1440']]) {
    await breakpoint.click();
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(width).toHaveValue(expectedWidth);
  }
});

test('all public page structures receive editable preview targets', async ({ page }) => {
  await login(page);
  for (const slug of ['home', 'event', 'wedding', 'group-days', 'courses', 'yoga', 'art', 'gallery', 'shop', 'about', 'contact']) {
    const frame = await openPreview(page, slug);
    await expect.poll(() => frame.locator('[data-cms-fields]').count()).toBeGreaterThan(0);
  }
});
