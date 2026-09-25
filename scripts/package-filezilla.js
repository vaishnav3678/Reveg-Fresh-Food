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

// 1. Ensure dist/api exists and copy PHP scripts
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

// 2. Ensure dist/uploads/hero exists and copy security .htaccess
const distUploadsHeroDir = path.join(distDir, 'uploads', 'hero');
if (!fs.existsSync(distUploadsHeroDir)) {
  fs.mkdirSync(distUploadsHeroDir, { recursive: true });
}
const htaccessUploads = path.join(rootDir, 'public', 'uploads', 'hero', '.htaccess');
if (fs.existsSync(htaccessUploads)) {
  fs.copyFileSync(htaccessUploads, path.join(distUploadsHeroDir, '.htaccess'));
  console.log('    Copied uploads/hero/.htaccess security shield');
}

// 3. Ensure dist/data exists and copy hero.json & db.json
const distDataDir = path.join(distDir, 'data');
if (!fs.existsSync(distDataDir)) {
  fs.mkdirSync(distDataDir, { recursive: true });
}
const dataFiles = ['hero.json', 'db.json'];
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
   - api/ (upload-hero.php, hero.php, public-content.php, inquiries.php)
   - uploads/hero/ (.htaccess)
   - data/ (hero.json, db.json)
   - .htaccess
   - reveg-logo.svg
4. Ensure folder permissions:
   - /uploads/ and /uploads/hero/ should be chmod 755 (or 775)
   - /data/ should be chmod 755 (or 775)
5. Visit your domain in the browser. The website and Admin Dashboard are live!

Option B: Subfolder / Subdirectory (e.g., /public_html/site2/)
1. Open FileZilla and navigate to: /public_html/site2/
2. Upload all files from this ZIP directly into /public_html/site2/
3. All asset paths and API endpoints are relative, so it works out of the box
   at: https://yourdomain.com/site2/ and https://yourdomain.com/site2/admin!

------------------------------------------------------------------------
HERO IMAGE MANAGEMENT
------------------------------------------------------------------------
- Navigate to /admin (e.g., https://yourdomain.com/admin or https://yourdomain.com/site2/admin)
- Log in to the Admin Dashboard (default: admin / admin123 or your configured password)
- Open "Hero Image Management & Hero Settings"
- Click "Upload New Hero Image" or drag & drop (JPG, JPEG, PNG, WEBP)
- Preview the image before saving
- Click "Upload & Save as Hero Image"
- The image is saved dynamically in /uploads/hero/ and appears instantly on the live website!
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
