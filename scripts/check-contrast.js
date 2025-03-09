const fs = require('fs');
const path = require('path');
const glob = require('glob');
const axe = require('axe-core');
const puppeteer = require('puppeteer');

async function checkContrast() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to mobile size to check mobile view specifically
  await page.setViewport({
    width: 375,
    height: 667,
    deviceScaleFactor: 1,
  });

  try {
    // Start the Next.js development server if not already running
    console.log('Loading page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Inject axe-core
    await page.evaluate(() => {
      if (!window.axe) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js';
        document.head.appendChild(script);
      }
    });

    // Run the accessibility check
    const results = await page.evaluate(() => {
      return new Promise(resolve => {
        window.axe.run({
          rules: [
            {
              id: 'color-contrast',
              enabled: true
            }
          ]
        }, (err, results) => {
          resolve(results);
        });
      });
    });

    // Output results
    console.log('\nContrast Issues Found:');
    if (results.violations.length === 0) {
      console.log('No contrast issues found!');
    } else {
      results.violations.forEach(violation => {
        console.log('\n' + '-'.repeat(80));
        console.log(`Issue: ${violation.help}`);
        console.log(`Impact: ${violation.impact}`);
        violation.nodes.forEach(node => {
          console.log('\nElement:', node.html);
          console.log('Location:', node.target);
          console.log('Fix suggestion:', node.failureSummary);
        });
      });
    }

  } catch (error) {
    console.error('Error during contrast check:', error);
  } finally {
    await browser.close();
  }
}

checkContrast();