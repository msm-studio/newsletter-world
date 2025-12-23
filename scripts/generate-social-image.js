const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set viewport to Open Graph recommended size: 1200x630
  await page.setViewport({
    width: 1200,
    height: 630,
    deviceScaleFactor: 2, // For retina quality
  });

  // Navigate to the production site
  await page.goto('https://newsletter-world.vercel.app', {
    waitUntil: 'networkidle0',
  });

  // Wait a bit for fonts to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Take screenshot
  await page.screenshot({
    path: 'public/social-share.png',
    type: 'png',
  });

  console.log('✅ Social sharing image created at public/social-share.png (1200x630)');

  await browser.close();
})();
