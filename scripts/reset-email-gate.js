const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to localhost
  await page.goto('http://localhost:3000', {
    waitUntil: 'networkidle0',
  });

  // Clear the email submitted flag
  await page.evaluate(() => {
    localStorage.removeItem('newsletter-world-email-submitted');
    localStorage.removeItem('newsletter-world-unlocked-level');
    localStorage.removeItem('newsletter-world-selected-level');
    console.log('✅ Cleared email gate and progress');
  });

  console.log('✅ Email gate reset! You will see the email gate after completing Level 1.');

  await browser.close();
})();
