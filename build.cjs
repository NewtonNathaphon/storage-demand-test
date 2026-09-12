// Publish only website assets; keep SQL and setup notes out of the public site.
const fs = require('fs');
const path = require('path');
const output = path.join(__dirname, 'public');
fs.mkdirSync(output, { recursive: true });
for (const name of ['index.html', 'backoffice.html', 'assets/backoffice.js', 'assets/line_official.jpg', 'robots.txt', 'sitemap.xml', '_headers', '_routes.json',
  'assets/home_space.webp', 'assets/business_storage.webp', 'assets/document_storage.webp',
  'assets/buddy_banner_th.webp', 'assets/buddy_banner_en.webp',
  'assets/buddy_banner_fat_th.webp', 'assets/buddy_banner_fat_en.webp',
  'assets/storagebuddy_logo_20260912.png', 'assets/storagebuddy_logo.webp', 'assets/storagebuddy_banner.webp', 'assets/storagebuddy_banner_th.webp']) {
  fs.mkdirSync(path.dirname(path.join(output, name)), { recursive: true });
  fs.copyFileSync(path.join(__dirname, name), path.join(output, name));
}
const rooms = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8').replace('<link rel="canonical" href="https://storagebuddyth.com/">', '<link rel="canonical" href="https://storagebuddyth.com/rooms">');
fs.writeFileSync(path.join(output, 'rooms.html'), rooms);
console.log('Website assets copied to public/');
