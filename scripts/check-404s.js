// check-404s.js
// A script to check for 404 errors in the website
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// First, let's scan the codebase for all links
function findLinks() {
  console.log('Scanning codebase for links...');
  
  // Get all files with potential links (TSX, TS, JSX, JS)
  const appDir = path.resolve(__dirname, '../app');
  const files = getAllFiles(appDir, ['.tsx', '.ts', '.jsx', '.js']);
  
  // Find all href attributes in the files
  const links = [];
  const routePatterns = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Look for Next.js Link components
    const nextLinkMatches = content.matchAll(/href=["']([^"']+)["']/g);
    for (const match of nextLinkMatches) {
      if (match[1] && !match[1].startsWith('http') && !match[1].startsWith('#')) {
        links.push(match[1]);
      }
    }
    
    // Look for dynamic route patterns in filenames
    const relativePath = path.relative(appDir, file);
    if (relativePath.includes('[') && relativePath.includes(']')) {
      routePatterns.push(relativePath);
    }
  }
  
  // Remove duplicates and sort
  const uniqueLinks = [...new Set(links)].sort();
  
  console.log(`Found ${uniqueLinks.length} unique internal links`);
  console.log(`Found ${routePatterns.length} dynamic route patterns`);
  
  return { links: uniqueLinks, routePatterns };
}

function getAllFiles(dir, extensions) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively get files from subdirectories
      results = results.concat(getAllFiles(filePath, extensions));
    } else {
      // Check if file has one of the specified extensions
      const ext = path.extname(filePath).toLowerCase();
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  }
  
  return results;
}

function analyzeRoutes() {
  console.log('Analyzing Next.js routes...');
  
  // Get the list of pages from the app directory
  const appDir = path.join(__dirname, '../app');
  const allPagesMap = new Map();
  
  // Function to recursively scan directories for page.tsx files
  function scanForPages(dir, routePath = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip route group folders (those starting with parentheses)
        if (item.startsWith('(')) continue;
        
        // Handle dynamic segments [param]
        let segmentPath = item;
        if (item.startsWith('[') && item.endsWith(']')) {
          segmentPath = `:${item.substring(1, item.length - 1)}`;
        }
        
        // Recursively scan subdirectory
        scanForPages(fullPath, `${routePath}/${segmentPath}`);
      } else if (item === 'page.tsx' || item === 'page.js') {
        // This is a page component
        const route = routePath || '/';
        allPagesMap.set(route, fullPath);
      }
    }
  }
  
  scanForPages(appDir);
  console.log(`Found ${allPagesMap.size} page routes`);
  
  return Array.from(allPagesMap.keys());
}

function checkForPotential404s(links, routes) {
  console.log('\nChecking for potential 404 issues...');
  
  const potential404s = [];
  const dynamicRoutes = routes.filter(r => r.includes(':'));
  const staticRoutes = routes.filter(r => !r.includes(':'));
  
  for (const link of links) {
    // Clean the link (remove query params and hash)
    let cleanLink = link.split('?')[0].split('#')[0];
    
    // If link ends with / and isn't just /, remove the trailing slash for comparison
    if (cleanLink.length > 1 && cleanLink.endsWith('/')) {
      cleanLink = cleanLink.slice(0, -1);
    }
    
    // Check if this link matches any static route
    const matchesStaticRoute = staticRoutes.some(route => {
      let cleanRoute = route;
      if (cleanRoute.length > 1 && cleanRoute.endsWith('/')) {
        cleanRoute = cleanRoute.slice(0, -1);
      }
      return cleanRoute === cleanLink;
    });
    
    if (matchesStaticRoute) continue; // Link is valid, matches a static route
    
    // Check if this link might match a dynamic route pattern
    const mightMatchDynamicRoute = dynamicRoutes.some(dynamicRoute => {
      const routeParts = dynamicRoute.split('/');
      const linkParts = cleanLink.split('/');
      
      if (routeParts.length !== linkParts.length) return false;
      
      // Check each segment
      return routeParts.every((routePart, i) => {
        return routePart.startsWith(':') || routePart === linkParts[i];
      });
    });
    
    if (mightMatchDynamicRoute) continue; // Link might match a dynamic route
    
    // This link doesn't match any known route - potential 404
    potential404s.push(link);
  }
  
  return potential404s;
}

// Main function
function main() {
  console.log('404 Checker - Analyzing your Next.js app for potential broken links');
  console.log('==================================================================\n');
  
  // Find all links in the codebase
  const { links } = findLinks();
  
  // Analyze the routes
  const routes = analyzeRoutes();
  
  // Check for potential 404s
  const potential404s = checkForPotential404s(links, routes);
  
  // Output results
  console.log('\nResults:');
  console.log('==================================================================');
  
  if (potential404s.length === 0) {
    console.log('\n✅ No potential 404 issues found!');
  } else {
    console.log(`\n⚠️ Found ${potential404s.length} links that might lead to 404 errors:`);
    potential404s.forEach(link => {
      console.log(`  - ${link}`);
    });
    console.log('\nNote: Some of these might be valid for dynamically generated pages.');
  }
  
  console.log('\nAdditionally, consider running a full site crawl when deployed.');
  console.log('==================================================================');
}

main();