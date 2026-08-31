import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000/portfolio/add/cash');
    
    // Type bank
    await page.fill('input[placeholder="e.g. HDFC Savings Account"]', 'HDFC');
    console.log("Filled bank");
    
    // Type balance
    await page.fill('input[placeholder="e.g. 500000"]', '50000');
    console.log("Filled balance");
    
    const bankVal = await page.inputValue('input[placeholder="e.g. HDFC Savings Account"]');
    const balanceVal = await page.inputValue('input[placeholder="e.g. 500000"]');
    console.log("Bank value:", bankVal);
    console.log("Balance value:", balanceVal);
    
    // Click submit
    await page.click('button[type="submit"]');
    console.log("Clicked submit");
    
    await page.waitForTimeout(1000);
    console.log("Current URL:", page.url());
    
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
