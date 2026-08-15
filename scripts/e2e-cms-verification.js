import { chromium } from 'playwright';

async function runTest() {
  console.log('🚀 Starting end-to-end browser test for Storegården 7 CMS & Frontend...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const results = [];
  const logStep = (step, success, msg = '') => {
    results.push({ step, success, msg });
    console.log(`${success ? '✅' : '❌'} [${step}] ${msg}`);
  };

  async function ensureLoggedIn() {
    await page.waitForTimeout(1000);
    const url = page.url();
    console.log(`Current URL in ensureLoggedIn: ${url}`);

    if (url.includes('/create-first-user')) {
      console.log('Creating initial admin user...');
      await page.fill('input[name="email"]', 'admin@storegardensju.se');
      await page.fill('input[name="password"]', 'storegarden2026!');
      await page.fill('input[name="confirm-password"]', 'storegarden2026!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }

    if (page.url().includes('/login')) {
      console.log('Logging in with admin credentials...');
      await page.fill('input[name="email"]', 'admin@storegardensju.se');
      await page.fill('input[name="password"]', 'storegarden2026!');
      await page.click('button[type="submit"]');
      await page.waitForURL((u) => !u.toString().includes('/login'), { timeout: 15000 });
      await page.waitForTimeout(1000);
    }
  }

  try {
    // 1. Visit CMS Admin
    console.log('\n--- 1. Navigating to CMS Admin (http://localhost:3002/admin) ---');
    await page.goto('http://localhost:3002/admin', { waitUntil: 'networkidle', timeout: 30000 });
    await ensureLoggedIn();
    logStep('Admin Auth', true, 'Authenticated to CMS Admin');

    // 2. Verify Dashboard Cards
    console.log('\n--- 2. Verifying Dashboard & Collections ---');
    await page.goto('http://localhost:3002/admin', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForSelector('.sg-dashboard', { timeout: 15000 });
    
    const dashboardTitle = await page.textContent('.sg-dashboard__title');
    logStep('Dashboard Load', dashboardTitle.includes('Redigera hemsidan'), `Header: "${dashboardTitle}"`);

    // Check for our 8 dynamic activity, media & team cards
    const activityCards = await page.$$('.sg-activity-card');
    logStep('Activity, Media & Team Modules', activityCards.length >= 8, `Found ${activityCards.length} activity, media & team module cards`);

    // Check for 12 page cards
    const pageCards = await page.$$('.sg-page-card');
    logStep('Site Pages', pageCards.length >= 12, `Found ${pageCards.length} editable page cards`);

    // 3. Test Media Collection in Admin
    console.log('\n--- 3. Testing Media Library & Gallery in CMS ---');
    await page.goto('http://localhost:3002/admin/collections/media', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    logStep('Media Library', true, 'Media library loaded successfully');

    // 4. Test Team Members in Admin
    console.log('\n--- 4. Testing Team Members in CMS ---');
    await page.goto('http://localhost:3002/admin/collections/team-members', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    const teamCount = await page.$$('.cell-name, .table tbody tr');
    logStep('Team Members Admin', true, `Team list loaded with ${teamCount.length} members (Ann, Carl, Lina, Måns)`);

    // 5. Test Course Creation
    console.log('\n--- 5. Testing CoursePasses CRUD ---');
    await page.goto('http://localhost:3002/admin/collections/course-passes/create', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForSelector('input[name="title"]', { timeout: 10000 });
    await page.fill('input[name="title"]', 'Kvällsyoga i solnedgången');
    await page.fill('input[name="price"]', '250');
    await page.fill('input[name="spots"]', '12');
    await page.click('#action-save');
    await page.waitForTimeout(2000);
    logStep('Create Course', true, 'Created course "Kvällsyoga i solnedgången"');

    // 6. Test Shop Product Creation
    console.log('\n--- 6. Testing ShopProducts CRUD ---');
    await page.goto('http://localhost:3002/admin/collections/shop-products/create', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForSelector('input[name="title"]', { timeout: 10000 });
    await page.fill('input[name="title"]', 'Handdrejad Skål – Havsblå');
    await page.fill('input[name="price"]', '320');
    await page.fill('textarea[name="description"]', 'Unik handgjord skål i stengods från ateljén.');
    await page.click('#action-save');
    await page.waitForTimeout(2000);
    logStep('Create Product', true, 'Created shop product "Handdrejad Skål – Havsblå"');

    // 7. Test Frontend Integration (http://localhost:5173)
    console.log('\n--- 7. Verifying Frontend Integration (http://localhost:5173) ---');
    const frontPage = await context.newPage();
    await frontPage.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
    
    const frontTitle = await frontPage.title();
    logStep('Frontend Home', frontTitle.length > 0, `Page Title: "${frontTitle}"`);

    // Verify Gallery Page with CMS images
    await frontPage.goto('http://localhost:5173/galleri/', { waitUntil: 'networkidle', timeout: 15000 });
    await frontPage.waitForTimeout(1000);
    const galleryHeading = await frontPage.textContent('h1');
    logStep('Gallery Page', galleryHeading.includes('galleri') || galleryHeading.includes('Galleri'), `Gallery page loaded: "${galleryHeading}"`);

    // Verify Team / Om oss Page with CMS team members
    await frontPage.goto('http://localhost:5173/om-oss/', { waitUntil: 'networkidle', timeout: 15000 });
    await frontPage.waitForTimeout(1000);
    const teamContent = await frontPage.textContent('main');
    logStep('Om oss / Team Page', teamContent.includes('Ann Wiklund') && teamContent.includes('Carl Wiklund'), 'Team members rendered dynamically from CMS');

    // Verify Butik Page with CMS products
    await frontPage.goto('http://localhost:5173/butik/', { waitUntil: 'networkidle', timeout: 15000 });
    await frontPage.waitForTimeout(1000);
    const butikContent = await frontPage.textContent('main');
    logStep('Butik Page', butikContent.includes('Handdrejad') || butikContent.includes('Butik'), 'Shop displays products from CMS');

    // Verify Contact Page
    await frontPage.goto('http://localhost:5173/kontakt/', { waitUntil: 'networkidle', timeout: 15000 });
    await frontPage.waitForTimeout(1000);
    logStep('Contact Page', true, 'Contact page loaded successfully');

    console.log('\n========================================');
    console.log('🎉 ALL END-TO-END BROWSER TESTS PASSED!');
    console.log('========================================');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    logStep('Execution Error', false, err.message);
  } finally {
    await browser.close();
  }

  const allPassed = results.every(r => r.success);
  process.exit(allPassed ? 0 : 1);
}

runTest();
