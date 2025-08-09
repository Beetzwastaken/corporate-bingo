const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch({headless: 'new'});
    const page = await browser.newPage();
    await page.setViewport({width: 1200, height: 800});
    
    // Navigate to the app
    await page.goto('http://localhost:5176');
    await page.waitForTimeout(2000);
    
    // Take desktop view screenshot
    await page.screenshot({
      path: './testing/screenshots/redesigned-sidebar-desktop.png', 
      fullPage: true
    });
    
    // Take mobile view screenshot
    await page.setViewport({width: 375, height: 667});
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: './testing/screenshots/redesigned-sidebar-mobile.png', 
      fullPage: true
    });
    
    await browser.close();
    console.log('Screenshots saved to testing/screenshots/');
  } catch (error) {
    console.error('Error taking screenshots:', error);
  }
})();