// Publish only website assets; keep SQL and setup notes out of the public site.
const fs = require('fs');
const path = require('path');
const output = path.join(__dirname, 'public');
fs.mkdirSync(output, { recursive: true });
for (const name of ['index.html', 'robots.txt', 'sitemap.xml']) {
  fs.copyFileSync(path.join(__dirname, name), path.join(output, name));
}
console.log('Website assets copied to public/');
