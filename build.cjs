// Publish only website assets; keep SQL and setup notes out of the public site.
const fs = require('fs');
const path = require('path');
const output = path.join(__dirname, 'public');
fs.mkdirSync(output, { recursive: true });
for (const name of ['index.html', 'robots.txt', 'sitemap.xml', '_headers', '_routes.json',
  'assets/home_space.webp', 'assets/business_storage.webp', 'assets/document_storage.webp',
  'assets/buddy_banner_th.webp', 'assets/buddy_banner_en.webp',
  'assets/buddy_banner_fat_th.webp', 'assets/buddy_banner_fat_en.webp',
  'assets/storagebuddy_logo.webp', 'assets/storagebuddy_banner.webp', 'assets/storagebuddy_banner_th.webp']) {
  fs.mkdirSync(path.dirname(path.join(output, name)), { recursive: true });
  fs.copyFileSync(path.join(__dirname, name), path.join(output, name));
}
console.log('Website assets copied to public/');
