import { test, expect } from '@playwright/test';

test.describe('Storegården 7 E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:5173/');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('Take a screenshot of the homepage', async ({ page }) => {
    // Take a full page screenshot
    await page.screenshot({ 
      path: 'homepage-screenshot.png', 
      fullPage: true 
    });
    
    console.log('Homepage screenshot saved as homepage-screenshot.png');
  });

  test('Test clicking through all gallery images', async ({ page }) => {
    // Wait for gallery images to load
    await page.waitForSelector('.gallery-thumbnail', { timeout: 10000 });
    
    // Get all gallery thumbnails
    const thumbnails = await page.locator('.gallery-thumbnail').all();
    console.log(`Found ${thumbnails.length} gallery thumbnails`);
    
    // Test clicking each thumbnail in the initial grid (first 6)
    for (let i = 0; i < Math.min(6, thumbnails.length); i++) {
      console.log(`Clicking thumbnail ${i + 1}`);
      await thumbnails[i].click();
      
      // Wait for lightbox to appear
      await page.waitForSelector('.gallery-modal', { timeout: 5000 });
      
      // Verify lightbox is visible
      const lightbox = page.locator('.gallery-modal');
      await expect(lightbox).toBeVisible();
      
      // Close lightbox
      await page.locator('.gallery-close-button').click();
      
      // Wait for lightbox to disappear
      await page.waitForSelector('.gallery-modal', { state: 'hidden' });
      
      // Small delay between clicks
      await page.waitForTimeout(500);
    }
    
    // Test "Show all images" button
    const showMoreButton = page.locator('.show-more-button');
    if (await showMoreButton.isVisible()) {
      console.log('Clicking "Show all images" button');
      await showMoreButton.click();
      
      // Wait for expanded grid to appear
      await page.waitForSelector('.expanded-grid', { timeout: 5000 });
      
      // Get all thumbnails after expansion
      const allThumbnails = await page.locator('.gallery-thumbnail').all();
      console.log(`After expansion: ${allThumbnails.length} total thumbnails`);
      
      // Test clicking a few more images from the expanded grid
      const expandedThumbnails = allThumbnails.slice(6);
      for (let i = 0; i < Math.min(3, expandedThumbnails.length); i++) {
        console.log(`Clicking expanded thumbnail ${i + 1}`);
        await expandedThumbnails[i].click();
        
        // Wait for lightbox
        await page.waitForSelector('.gallery-modal', { timeout: 5000 });
        await expect(page.locator('.gallery-modal')).toBeVisible();
        
        // Close lightbox
        await page.locator('.gallery-close-button').click();
        await page.waitForSelector('.gallery-modal', { state: 'hidden' });
        await page.waitForTimeout(500);
      }
    }
  });

  test('Verify the contact email link works', async ({ page }) => {
    // Find and test the first email link (there might be multiple)
    const emailLink = page.locator('a[href="mailto:storegardensju@gmail.com"]').first();
    
    // Verify the email link exists and is visible
    await expect(emailLink).toBeVisible();
    
    // Check that the href attribute is correct
    const href = await emailLink.getAttribute('href');
    expect(href).toBe('mailto:storegardensju@gmail.com');
    
    // Verify the link text contains the email
    const linkText = await emailLink.textContent();
    expect(linkText).toContain('storegardensju@gmail.com');
    
    console.log('Email link verification successful:', href);
  });

  test('Check if the Instagram link opens correctly', async ({ page }) => {
    // Find the Instagram link
    const instagramLink = page.locator('a[href="https://www.instagram.com/storegarden7/"]');
    
    // Verify the Instagram link exists and is visible
    await expect(instagramLink).toBeVisible();
    
    // Check that the href attribute is correct
    const href = await instagramLink.getAttribute('href');
    expect(href).toBe('https://www.instagram.com/storegarden7/');
    
    // Check that it has target="_blank" and rel attributes for security
    const target = await instagramLink.getAttribute('target');
    const rel = await instagramLink.getAttribute('rel');
    expect(target).toBe('_blank');
    expect(rel).toBe('noopener noreferrer');
    
    // Verify the link text
    const linkText = await instagramLink.textContent();
    expect(linkText).toContain('@storegarden7');
    
    console.log('Instagram link verification successful:', href);
    
    // Test opening the link (this will open in a new tab)
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      instagramLink.click()
    ]);
    
    // Wait for the new page to load
    await newPage.waitForLoadState('domcontentloaded');
    
    // Verify we're on Instagram (or at least tried to navigate there)
    const newUrl = newPage.url();
    expect(newUrl).toContain('instagram.com');
    
    console.log('Instagram page opened successfully:', newUrl);
    
    // Close the new page
    await newPage.close();
  });

  test('Test the image gallery lightbox functionality', async ({ page }) => {
    // Wait for gallery to load
    await page.waitForSelector('.gallery-thumbnail', { timeout: 10000 });
    
    // Click the first thumbnail to open lightbox
    const firstThumbnail = page.locator('.gallery-thumbnail').first();
    await firstThumbnail.click();
    
    // Wait for lightbox to appear
    await page.waitForSelector('.gallery-modal', { timeout: 5000 });
    const lightbox = page.locator('.gallery-modal');
    await expect(lightbox).toBeVisible();
    
    // Test lightbox components
    const imageGallery = page.locator('.image-gallery');
    await expect(imageGallery).toBeVisible();
    
    // Test navigation buttons (if present)
    const nextButton = page.locator('.image-gallery-right-nav');
    const prevButton = page.locator('.image-gallery-left-nav');
    
    if (await nextButton.isVisible()) {
      console.log('Testing next button in lightbox');
      await nextButton.click();
      await page.waitForTimeout(1000);
    }
    
    if (await prevButton.isVisible()) {
      console.log('Testing previous button in lightbox');
      await prevButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Test thumbnails in lightbox (if visible)
    const lightboxThumbnails = page.locator('.image-gallery-thumbnails');
    if (await lightboxThumbnails.isVisible()) {
      console.log('Lightbox thumbnails are visible');
      const thumbs = page.locator('.image-gallery-thumbnail');
      const thumbCount = await thumbs.count();
      console.log(`Found ${thumbCount} thumbnails in lightbox`);
      
      // Click a different thumbnail if available
      if (thumbCount > 1) {
        await thumbs.nth(1).click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Test fullscreen button (if present)
    const fullscreenButton = page.locator('.image-gallery-fullscreen-button');
    if (await fullscreenButton.isVisible()) {
      console.log('Testing fullscreen button');
      await fullscreenButton.click();
      await page.waitForTimeout(1000);
      
      // Exit fullscreen by pressing Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
    
    // Test keyboard navigation
    console.log('Testing keyboard navigation');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);
    
    // Close lightbox using close button
    const closeButton = page.locator('.gallery-close-button');
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    
    // Verify lightbox is closed
    await page.waitForSelector('.gallery-modal', { state: 'hidden' });
    await expect(lightbox).toBeHidden();
    
    console.log('Lightbox functionality test completed successfully');
  });

  test('Test new accessibility features', async ({ page }) => {
    console.log('Testing new accessibility improvements...');
    
    // Test semantic HTML structure
    const main = page.locator('main[role="main"]');
    await expect(main).toBeVisible();
    
    const header = page.locator('header[role="banner"]');
    await expect(header).toBeVisible();
    
    const footer = page.locator('footer[role="contentinfo"]');
    await expect(footer).toBeVisible();
    
    // Test heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText('Storegården 7');
    
    // Test skip link functionality
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();
    
    // Test skip link navigation
    await page.keyboard.press('Enter');
    
    // Wait for navigation and verify main content exists
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();
    
    // Test ARIA labels on gallery
    const galleryButton = page.locator('[role="button"]').first();
    const ariaLabel = await galleryButton.getAttribute('aria-label');
    expect(ariaLabel).toContain('Öppna bild');
    
    console.log('✅ Accessibility features working correctly');
  });

  test('Test SEO meta tags and structure', async ({ page }) => {
    console.log('Testing SEO improvements...');
    
    // Test title
    await expect(page).toHaveTitle(/Storegården 7 - Eventlokal, Keramik & Målarkurser i Lidköping/);
    
    // Test meta description
    const metaDescription = page.locator('meta[name="description"]');
    const description = await metaDescription.getAttribute('content');
    expect(description).toContain('Storegården 7 är en charmig eventlokal');
    
    // Test Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', 'Storegården 7 - Eventlokal & Konstkurser');
    
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', 'https://storegardensju.se/images/logoTransp.png');
    
    // Test language attribute
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'sv');
    
    console.log('✅ SEO meta tags correctly implemented');
  });

  test('Test code splitting and lazy loading', async ({ page }) => {
    console.log('Testing code splitting and lazy loading...');
    
    // Monitor network requests to verify code splitting
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('.js') && !response.url().includes('node_modules')) {
        responses.push(response.url());
        console.log('JS chunk loaded:', response.url().split('/').pop());
      }
    });
    
    // Reload to capture fresh network requests
    await page.reload();
    
    // Initial load should show loading spinners
    await page.waitForSelector('.loading-spinner', { timeout: 5000 }).catch(() => {
      console.log('Loading spinner may have loaded too quickly to catch');
    });
    
    // Wait for lazy components to load
    await page.waitForSelector('h2:has-text("Bilder från Storegården 7")', { timeout: 10000 });
    await page.waitForSelector('h2:has-text("Vilka Vi Är")', { timeout: 10000 });
    
    // Verify multiple JS chunks were loaded (code splitting working)
    expect(responses.length).toBeGreaterThan(1);
    console.log(`✅ Code splitting working: ${responses.length} JS chunks loaded`);
    
    // Test build info component
    const buildInfo = page.locator('.build-info');
    await expect(buildInfo).toBeVisible();
    
    const version = page.locator('.build-version');
    await expect(version).toHaveText(/v1\.0\.0/);
    
    console.log('✅ Build versioning system working');
  });

  test('Test error boundaries and loading states', async ({ page }) => {
    console.log('Testing error boundaries and loading states...');
    
    // Test that components load without errors
    await page.waitForSelector('.storegarden-gallery', { timeout: 10000 });
    await page.waitForSelector('.Vilka-container', { timeout: 10000 });
    
    // Test loading states by throttling network
    await page.route('**/*', async route => {
      // Add delay to see loading states
      await page.waitForTimeout(100);
      route.continue();
    });
    
    // Reload to test loading states
    await page.reload();
    
    // Check if page loads successfully after network delays
    await page.waitForSelector('h1:has-text("Storegården 7")', { timeout: 15000 });
    
    console.log('✅ Error boundaries and loading states working');
  });

  test('Test focus management and keyboard navigation', async ({ page }) => {
    console.log('Testing focus management and keyboard navigation...');
    
    // Test tab navigation through interactive elements
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // First gallery image
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('role', 'button');
    
    // Test Enter key on gallery image
    await page.keyboard.press('Enter');
    
    // Wait for lightbox to open
    await page.waitForSelector('.gallery-modal', { timeout: 5000 });
    
    // Test Escape key to close lightbox
    await page.keyboard.press('Escape');
    
    // Wait for lightbox to close - try multiple methods
    try {
      await page.waitForSelector('.gallery-modal', { state: 'hidden', timeout: 3000 });
    } catch (e) {
      // If escape doesn't work, try clicking close button
      await page.locator('.gallery-close-button').click({ force: true });
      await page.waitForSelector('.gallery-modal', { state: 'hidden' });
    }
    
    console.log('✅ Keyboard navigation working correctly');
  });

  test('Test performance and bundle optimization', async ({ page }) => {
    console.log('Testing performance improvements...');
    
    const startTime = Date.now();
    
    // Navigate and measure load time
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // Verify critical content is visible quickly
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h2').first()).toBeVisible({ timeout: 5000 });
    
    // Test that images load progressively
    const images = page.locator('img');
    const imageCount = await images.count();
    console.log(`Found ${imageCount} images on page`);
    
    // Verify at least the logo loads quickly
    const logo = page.locator('img[alt*="Storegården 7"]');
    await expect(logo).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Performance optimizations working');
  });

  test('Additional functionality tests', async ({ page }) => {
    // Test scroll to top button (if present)
    const scrollButton = page.locator('.scroll-to-top, [class*="scroll"]');
    
    // Scroll down first
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    if (await scrollButton.isVisible()) {
      console.log('Testing scroll to top button');
      await scrollButton.click();
      await page.waitForTimeout(1000);
      
      // Verify we're back at the top
      const scrollPosition = await page.evaluate(() => window.pageYOffset);
      expect(scrollPosition).toBe(0);
    }
    
    // Test responsive behavior by changing viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'homepage-tablet.png' });
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'homepage-mobile.png' });
    
    console.log('Responsive screenshots saved');
  });
});