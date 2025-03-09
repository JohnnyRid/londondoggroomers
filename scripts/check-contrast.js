const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function checkContrast() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set mobile viewport
    await page.setViewport({
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });

    // Set mobile user agent
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1');

    console.log('Loading page...');
    await page.goto('http://localhost:3000', { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });

    // Wait for content to be fully loaded
    await page.waitForSelector('main', { timeout: 5000 }).catch(() => console.log('Main content not found, continuing...'));

    // Get all text elements and their computed styles
    const contrastIssues = await page.evaluate(() => {
      const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, label, li');
      const issues = [];
      
      textElements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        const rgb = color.match(/\d+/g);
        const bgRgb = backgroundColor.match(/\d+/g);
        
        if (rgb && bgRgb) {
          // Calculate relative luminance
          const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
          const bgLuminance = (0.299 * bgRgb[0] + 0.587 * bgRgb[1] + 0.114 * bgRgb[2]) / 255;
          
          // Calculate contrast ratio
          const contrastRatio = (Math.max(luminance, bgLuminance) + 0.05) / (Math.min(luminance, bgLuminance) + 0.05);
          
          if (contrastRatio < 4.5) {
            issues.push({
              element: element.tagName.toLowerCase(),
              text: element.textContent.trim(),
              color,
              backgroundColor,
              contrastRatio: contrastRatio.toFixed(2),
              className: element.className
            });
          }
        }
      });
      
      return issues;
    });

    // Output results
    console.log('\nContrast Issues Found:');
    if (contrastIssues.length === 0) {
      console.log('No contrast issues found!');
    } else {
      contrastIssues.forEach((issue, index) => {
        console.log('\n' + '-'.repeat(80));
        console.log(`Issue #${index + 1}:`);
        console.log(`Element: ${issue.element}`);
        console.log(`Text: ${issue.text}`);
        console.log(`Color: ${issue.color}`);
        console.log(`Background: ${issue.backgroundColor}`);
        console.log(`Contrast Ratio: ${issue.contrastRatio} (should be at least 4.5)`);
        console.log(`Class: ${issue.className}`);
      });
    }

    // Take a screenshot for reference
    await page.screenshot({ 
      path: 'mobile-contrast-check.png',
      fullPage: true 
    });

    console.log('\nScreenshot saved as mobile-contrast-check.png');

  } catch (error) {
    console.error('Error during contrast check:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the contrast check
checkContrast();