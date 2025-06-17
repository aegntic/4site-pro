import puppeteer from 'puppeteer';

async function quickTest() {
  console.log('🚀 Quick Test of project4site\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Loading http://localhost:5173...');
    await page.goto('http://localhost:5173', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    console.log('✅ Page loaded!');
    
    // Quick screenshot
    await page.screenshot({ path: 'quick-test.png' });
    console.log('📸 Screenshot saved: quick-test.png');
    
    // Check title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Check for key elements
    const hasLogo = await page.$('img[alt*="4site"]') !== null;
    const hasInput = await page.$('input') !== null;
    const hasButton = await page.$('button') !== null;
    
    console.log(`\n✅ Logo present: ${hasLogo}`);
    console.log(`✅ Input field present: ${hasInput}`);
    console.log(`✅ Button present: ${hasButton}`);
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // Keep browser open for 3 seconds
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

quickTest();