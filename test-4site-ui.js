import puppeteer from 'puppeteer';

async function testUI() {
  console.log('Testing 4site.pro UI...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Loading page...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    
    // Take a screenshot
    await page.screenshot({ path: 'ui-test-screenshot.png', fullPage: true });
    console.log('Screenshot saved as ui-test-screenshot.png');
    
    // Check for main elements
    const title = await page.$eval('h1', el => el.textContent);
    console.log('Page title:', title);
    
    const heading = await page.$eval('h2', el => el.textContent);
    console.log('Main heading:', heading);
    
    // Check for input field
    const inputExists = await page.$('input[type="url"]') !== null;
    console.log('URL input exists:', inputExists);
    
    // Check for button
    const buttonText = await page.$eval('button', el => el.textContent);
    console.log('Button text:', buttonText);
    
    // Check for enterprise section
    const enterpriseSection = await page.$eval('h3', el => el.textContent);
    console.log('Enterprise section:', enterpriseSection);
    
    // Test functionality
    console.log('\nTesting functionality...');
    await page.type('input[type="url"]', 'https://github.com/facebook/react');
    
    // Click the button
    await page.click('button');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take another screenshot
    await page.screenshot({ path: 'ui-test-after-input.png', fullPage: true });
    console.log('Screenshot after input saved as ui-test-after-input.png');
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testUI();