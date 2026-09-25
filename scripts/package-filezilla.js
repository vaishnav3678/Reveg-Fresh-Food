#!/usr/bin/env node
/**
 * RevEg Fresh Foods - FileZilla Production ZIP Packager
 * Packages the built SPA, PHP backend APIs, uploads directory, data storage,
 * and Apache .htaccess into a production-ready ZIP file for direct FileZilla upload.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const zipFilename = 'reveg-fresh-foods-filezilla.zip';
const outputZip = path.join(rootDir, zipFilename);
const publicZip = path.join(rootDir, 'public', zipFilename);

console.log('==> Step 1: Building production frontend with Vite (base: ./) ...');
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

console.log('==> Step 2: Preparing Apache PHP runtime directories in dist/ ...');

// 1. Ensure dist/api exists and copy all PHP scripts
const distApiDir = path.join(distDir, 'api');
const publicApiDir = path.join(rootDir, 'public', 'api');
if (!fs.existsSync(distApiDir)) {
  fs.mkdirSync(distApiDir, { recursive: true });
}

if (fs.existsSync(publicApiDir)) {
  const phpFiles = fs.readdirSync(publicApiDir);
  for (const file of phpFiles) {
    if (file.endsWith('.php')) {
      fs.copyFileSync(path.join(publicApiDir, file), path.join(distApiDir, file));
      console.log(`    Copied PHP endpoint: api/${file}`);
    }
  }
}

// 2. Ensure dist/uploads and subfolders (hero, products) exist and copy existing images
const distUploadsDir = path.join(distDir, 'uploads');
const distUploadsHeroDir = path.join(distUploadsDir, 'hero');
const distUploadsProductsDir = path.join(distUploadsDir, 'products');

for (const dir of [distUploadsDir, distUploadsHeroDir, distUploadsProductsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy hero upload files
const heroDirs = [path.join(rootDir, 'public', 'uploads', 'hero'), path.join(rootDir, 'uploads', 'hero')];
for (const hDir of heroDirs) {
  if (fs.existsSync(hDir)) {
    for (const file of fs.readdirSync(hDir)) {
      const src = path.join(hDir, file);
      const dest = path.join(distUploadsHeroDir, file);
      if (fs.statSync(src).isFile() && !fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
        console.log(`    Copied hero upload: uploads/hero/${file}`);
      }
    }
  }
}

// Copy products upload files
const prodDirs = [path.join(rootDir, 'public', 'uploads', 'products'), path.join(rootDir, 'uploads', 'products')];
for (const pDir of prodDirs) {
  if (fs.existsSync(pDir)) {
    for (const file of fs.readdirSync(pDir)) {
      const src = path.join(pDir, file);
      const dest = path.join(distUploadsProductsDir, file);
      if (fs.statSync(src).isFile() && !fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
        console.log(`    Copied product upload: uploads/products/${file}`);
      }
    }
  }
}

// 3. Ensure dist/data exists and copy hero.json, db.json, inquiries.json
const distDataDir = path.join(distDir, 'data');
if (!fs.existsSync(distDataDir)) {
  fs.mkdirSync(distDataDir, { recursive: true });
}
const dataFiles = ['hero.json', 'db.json', 'inquiries.json'];
for (const file of dataFiles) {
  const srcPath = path.join(rootDir, 'data', file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(distDataDir, file));
    console.log(`    Copied data store: data/${file}`);
  }
}

// 4. Ensure dist/.htaccess exists
const rootHtaccess = path.join(rootDir, 'public', '.htaccess');
if (fs.existsSync(rootHtaccess)) {
  fs.copyFileSync(rootHtaccess, path.join(distDir, '.htaccess'));
  console.log('    Copied Apache root .htaccess');
}

// 5. Add FILEZILLA_README.txt into dist
const instructions = `========================================================================
RevEg Fresh Foods - FileZilla / Apache PHP Hosting Deployment Guide
========================================================================

This package is 100% ready for Apache PHP hosting (Hostinger, cPanel, GoDaddy,
Namecheap, LiteSpeed, VPS, etc.). No Node.js, npm, Vite, or Bun is needed.

------------------------------------------------------------------------
DEPLOYMENT INSTRUCTIONS (STEP BY STEP)
------------------------------------------------------------------------

Option A: Root Domain (e.g., https://example.com/)
1. Open FileZilla and connect to your hosting server.
2. Navigate to your website root folder: /public_html/
3. Extract and upload all files from this ZIP directly into /public_html/
   - index.html
   - assets/
   - api/ (all PHP API endpoints: products, hero, inquiries, etc.)
   - uploads/ (hero/ and products/ image folders)
   - data/ (db.json, hero.json, inquiries.json)
   - .htaccess
   - reveg-logo.svg
4. Ensure folder permissions:
   - /uploads/ and /uploads/products/, /uploads/hero/ should be chmod 755 (or 775)
   - /data/ should be chmod 755 (or 775)
5. Visit your domain in the browser. The website and Admin Dashboard are live!

Option B: Subfolder / Subdirectory (e.g., /public_html/site2/)
1. Open FileZilla and navigate to: /public_html/site2/
2. Upload all files from this ZIP directly into /public_html/site2/
3. All asset paths and API endpoints are relative, so it works out of the box
   at: https://yourdomain.com/site2/ and https://yourdomain.com/site2/admin!

------------------------------------------------------------------------
DYNAMIC PRODUCT IMAGE & CATALOGUE MANAGEMENT
------------------------------------------------------------------------
- Navigate to /admin (e.g., https://yourdomain.com/admin or https://yourdomain.com/site2/admin)
- Log in to the Admin Dashboard (default: admin / admin123)
- Click "Products Catalogue" in the sidebar navigation
- Click "Edit" on any product (Besan Ladoo, Motichoor Ladoo, Chakli, Shankarpali, etc.)
- Use "Upload from Device" or "Replace Image" to select a new product image (JPG, PNG, WEBP)
- Or click "Delete / Reset Image" to remove the current image
- Preview the image immediately in real-time
- Click "Save Changes" / "Add Product"
- The new image is stored dynamically in uploads/products/ and saved in data/db.json
- The new image automatically updates everywhere that product is displayed across the customer website!

------------------------------------------------------------------------
DYNAMIC HERO IMAGE MANAGEMENT
------------------------------------------------------------------------
- In Admin Dashboard, open "Hero Image & Settings"
- Click "Upload Image" or replace existing hero image
- The image automatically updates on the live frontend Hero banner without editing any code!
========================================================================
`;
fs.writeFileSync(path.join(distDir, 'FILEZILLA_README.txt'), instructions, 'utf-8');

console.log('==> Step 3: Creating FileZilla production ZIP archive ...');
try {
  const pyScript = `import zipfile, os, sys
dist_dir = sys.argv[1]
output_zip = sys.argv[2]
if os.path.exists(output_zip):
    os.remove(output_zip)
with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            if file == '.DS_Store' or file.endswith('.map') or file == os.path.basename(output_zip):
                continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, dist_dir)
            zipf.write(file_path, arcname)
print(f"Archive written successfully to {output_zip}")
`;
  const pyScriptPath = path.join(rootDir, 'scripts', 'create_zip.py');
  fs.writeFileSync(pyScriptPath, pyScript, 'utf-8');

  execSync(`python3 "${pyScriptPath}" "${distDir}" "${outputZip}"`, { stdio: 'inherit' });

  // Copy to public folder so it can also be downloaded directly from the web app
  fs.copyFileSync(outputZip, publicZip);
  fs.copyFileSync(outputZip, path.join(distDir, zipFilename));
  console.log(`==> SUCCESS: Created ${zipFilename} (${(fs.statSync(outputZip).size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`    Saved to: ${outputZip}`);
  console.log(`    Copied to: ${publicZip}`);
} catch (e) {
  console.error('ZIP creation error:', e.message);
}
