import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000/portfolio/add/cash');
    await page.waitForTimeout(1000); // Wait for hydration
    
    // Type bank slowly
    await page.type('input[placeholder="e.g. HDFC Savings Account"]', 'HDFC', { delay: 100 });
    const b1 = await page.inputValue('input[placeholder="e.g. HDFC Savings Account"]');
    console.log("Bank after typing:", b1);
    
    await page.waitForTimeout(2000);
    const b2 = await page.inputValue('input[placeholder="e.g. HDFC Savings Account"]');
    console.log("Bank after 2s:", b2);
    
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
