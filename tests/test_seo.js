/**
 * VICKY AI - Automated SEO & Discoverability Test Suite
 * Validates search engine keywords, metadata, Open Graph, sitemap.xml, robots.txt, and Schema.org.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

function runSEOTests() {
  console.log('--- Starting VICKY AI SEO & Discoverability Test Suite ---');
  let passed = 0;
  let failed = 0;

  const htmlPath = path.join(__dirname, '..', 'frontend', 'index.html');
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');

  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  const robotsContent = fs.readFileSync(robotsPath, 'utf-8');

  // 1. Title Tag
  try {
    assert.ok(htmlContent.includes('<title>VICKY AI - Free AI Video Generator | Text to Video & Image to Video</title>'));
    console.log('✔ Test 1: SEO Page Title tag validated');
    passed++;
  } catch (e) {
    console.error('✘ Test 1 failed:', e.message);
    failed++;
  }

  // 2. Meta Description
  try {
    assert.ok(htmlContent.includes('<meta name="description"'));
    assert.ok(htmlContent.includes('Create stunning AI videos with VICKY AI'));
    console.log('✔ Test 2: Meta description tag validated');
    passed++;
  } catch (e) {
    console.error('✘ Test 2 failed:', e.message);
    failed++;
  }

  // 3. Target Search Keywords Verification
  const targetKeywords = [
    'Vicky AI',
    'Vicky AI Video Generator',
    'Free AI Video Generator',
    'Text to Video AI',
    'Image to Video AI'
  ];

  targetKeywords.forEach((kw, idx) => {
    try {
      const regex = new RegExp(kw, 'i');
      assert.ok(regex.test(htmlContent), `Missing target keyword: ${kw}`);
      console.log(`✔ Test 3.${idx + 1}: Keyword "${kw}" successfully present in DOM and metadata`);
      passed++;
    } catch (e) {
      console.error(`✘ Test 3.${idx + 1} failed:`, e.message);
      failed++;
    }
  });

  // 4. Schema.org JSON-LD Structured Data
  try {
    assert.ok(htmlContent.includes('application/ld+json'));
    assert.ok(htmlContent.includes('"@type": "SoftwareApplication"'));
    assert.ok(htmlContent.includes('"@type": "WebSite"'));
    assert.ok(htmlContent.includes('"@type": "FAQPage"'));
    console.log('✔ Test 4: Schema.org structured data (SoftwareApplication, WebSite, FAQPage) validated');
    passed++;
  } catch (e) {
    console.error('✘ Test 4 failed:', e.message);
    failed++;
  }

  // 5. Open Graph & Twitter Cards
  try {
    assert.ok(htmlContent.includes('property="og:title"'));
    assert.ok(htmlContent.includes('property="og:image"'));
    assert.ok(htmlContent.includes('name="twitter:card"'));
    console.log('✔ Test 5: Open Graph and Twitter Card tags validated');
    passed++;
  } catch (e) {
    console.error('✘ Test 5 failed:', e.message);
    failed++;
  }

  // 6. Google Search Console Verification Support
  try {
    assert.ok(htmlContent.includes('name="google-site-verification"'));
    console.log('✔ Test 6: Google Search Console verification meta tag present');
    passed++;
  } catch (e) {
    console.error('✘ Test 6 failed:', e.message);
    failed++;
  }

  // 7. Sitemap.xml Verification
  try {
    assert.ok(sitemapContent.includes('<urlset'));
    assert.ok(sitemapContent.includes('<loc>https://vickyai.com/</loc>'));
    assert.ok(sitemapContent.includes('<loc>https://vickyai.com/generator</loc>'));
    assert.ok(sitemapContent.includes('<loc>https://vickyai.com/text-to-video</loc>'));
    assert.ok(sitemapContent.includes('<loc>https://vickyai.com/image-to-video</loc>'));
    console.log('✔ Test 7: Sitemap.xml structure & URLs validated');
    passed++;
  } catch (e) {
    console.error('✘ Test 7 failed:', e.message);
    failed++;
  }

  // 8. Robots.txt Verification
  try {
    assert.ok(robotsContent.includes('User-agent: *'));
    assert.ok(robotsContent.includes('Allow: /'));
    assert.ok(robotsContent.includes('Sitemap: https://vickyai.com/sitemap.xml'));
    console.log('✔ Test 8: Robots.txt crawler permissions and sitemap link validated');
    passed++;
  } catch (e) {
    console.error('✘ Test 8 failed:', e.message);
    failed++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

runSEOTests();
