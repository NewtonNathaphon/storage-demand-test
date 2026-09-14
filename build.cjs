// Publish only allowlisted site files; never copy docs or SQL.
const fs=require('fs');
const path=require('path');
const {pages}=require('./seo-pages.cjs');
const {renderEnglishHomepage}=require('./html-localization.cjs');
const output=path.join(__dirname,'public');
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});
const allowlist=['index.html','404.html','backoffice.html','googlec5a82ac63469f274.html','assets/backoffice.js','assets/line_official.jpg','assets/seo-pages.css','robots.txt','sitemap.xml','_headers','_routes.json','_redirects',
  'assets/buddy_support.png','assets/buddy_support-640.webp','assets/buddy_support-1280.webp','assets/buddy_hero_banner3.png','assets/buddy_hero_banner3-640.webp','assets/buddy_hero_banner3-1280.webp','assets/buddy_size_advisor_v2.png','assets/buddy_size_advisor_v2-640.webp','assets/buddy_size_advisor_v2-1280.webp','assets/home_space.webp','assets/business_storage.webp','assets/document_storage.webp',
  'assets/buddy_banner_th.webp','assets/buddy_banner_en.webp','assets/buddy_banner_fat_th.webp','assets/buddy_banner_fat_en.webp','assets/storagebuddy_logo_20260912.png','assets/storagebuddy_logo.webp','assets/storagebuddy_banner.webp','assets/storagebuddy_banner_th.webp'];
for(const name of allowlist){const target=path.join(output,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(__dirname,name),target);}
const thai=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const english=renderEnglishHomepage(thai);
const enTarget=path.join(output,'en/index.html');fs.mkdirSync(path.dirname(enTarget),{recursive:true});fs.writeFileSync(enTarget,english);
for(const item of pages){const target=path.join(output,item.file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,item.html);}
console.log(`Built ${2+pages.length} canonical pages into public/`);
