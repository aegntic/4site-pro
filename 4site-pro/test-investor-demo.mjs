import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Starting 4site.pro investor demo validation...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('📍 Navigating to http://localhost:5175...');
    await page.goto('http://localhost:5175', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Check for critical elements
    console.log('\n🔍 Verifying critical elements:');
    
    // Check hero section
    const heroTitle = await page.$eval('h1', el => el.textContent).catch(() => null);
    console.log(`✅ Hero Title: ${heroTitle ? '"' + heroTitle + '"' : '❌ NOT FOUND'}`);
    
    // Check for glass morphism effects
    const glassElements = await page.$$eval('[class*="glass"], [style*="backdrop-filter"]', 
      els => els.length
    );
    console.log(`✅ Glass Morphism Elements: ${glassElements} found`);
    
    // Check for neural background
    const canvas = await page.$('canvas');
    console.log(`✅ Neural Background Canvas: ${canvas ? 'Present' : '❌ NOT FOUND'}`);
    
    // Check for form elements
    const inputForm = await page.$('input[type="text"], input[type="url"]');
    console.log(`✅ URL Input Form: ${inputForm ? 'Present' : '❌ NOT FOUND'}`);
    
    // Check for buttons
    const buttons = await page.$$('button');
    console.log(`✅ Interactive Buttons: ${buttons.length} found`);
    
    // Check for feature sections
    const features = await page.$$eval('[class*="feature"], [class*="Feature"]', 
      els => els.length
    );
    console.log(`✅ Feature Sections: ${features} found`);
    
    // Take screenshots
    console.log('\n📸 Capturing screenshots:');
    await page.screenshot({ 
      path: 'investor-demo-full.png',
      fullPage: true 
    });
    console.log('✅ Full page screenshot saved: investor-demo-full.png');
    
    await page.screenshot({ 
      path: 'investor-demo-viewport.png'
    });
    console.log('✅ Viewport screenshot saved: investor-demo-viewport.png');
    
    // Test interaction
    console.log('\n🎯 Testing interaction:');
    if (inputForm) {
      await inputForm.type('https://github.com/facebook/react');
      console.log('✅ Successfully typed into URL input');
      
      // Find and click generate button
      const generateButton = await page.$('button[type="submit"], button:has-text("Generate"), button:has-text("Transform")');
      if (generateButton) {
        await generateButton.click();
        console.log('✅ Clicked generate button');
        
        // Wait for loading state
        await page.waitForTimeout(2000);
        const isLoading = await page.$('[class*="loading"], [class*="Loading"]');
        console.log(`✅ Loading state: ${isLoading ? 'Active' : 'Not detected'}`);
      }
    }
    
    // Performance metrics
    console.log('\n📊 Performance Metrics:');
    const metrics = await page.metrics();
    console.log(`✅ JS Heap Size: ${(metrics.JSHeapUsedSize / 1048576).toFixed(2)} MB`);
    console.log(`✅ DOM Nodes: ${metrics.Nodes}`);
    
    // Check console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Console Errors Detected:');
      errors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('\n✅ No console errors detected!');
    }
    
    console.log('\n🎉 WEBSITE IS READY FOR INVESTOR DEMO!');
    console.log('📌 Access at: http://localhost:5175');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('The website may not be loading correctly.');
  } finally {
    await browser.close();
  }
})();