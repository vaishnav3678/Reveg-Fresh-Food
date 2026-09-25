# RevEg Fresh Foods — FileZilla / Apache PHP Hosting Deployment Guide

This project is built and optimized for direct upload via **FileZilla** to any standard **Apache / LiteSpeed PHP hosting** (Hostinger, cPanel, GoDaddy, Namecheap, Bluehost, VPS, etc.).

No Node.js, npm, Vite, or Bun is required on your hosting server!

---

## 📦 What is in the Production ZIP (`reveg-fresh-foods-filezilla.zip`)

| File / Folder | Purpose |
|---------------|---------|
| `index.html` | High-performance single page application (SPA) with relative paths (`./assets/...`) |
| `assets/` | Optimized JavaScript, CSS, and SVG assets |
| `api/upload-hero.php` | Secure PHP upload handler supporting JPG, JPEG, PNG, WEBP (up to 10MB) |
| `api/hero.php` | Dynamic PHP hero banner config endpoint (GET, POST/PUT, DELETE) |
| `api/public-content.php` | PHP endpoint serving products, categories, sections, and live hero config |
| `api/inquiries.php` | Customer inquiries storage & CRM endpoint in PHP |
| `uploads/hero/` | Folder where uploaded Hero images are stored, protected with `.htaccess` |
| `data/hero.json` | Persistent dynamic storage for Hero image & settings |
| `data/db.json` | Persistent store for products, categories, and settings |
| `.htaccess` | Apache configuration with SPA routing, compression, caching & security |
| `reveg-logo.svg` | Authentic brand logo |

---

## 🚀 How to Deploy via FileZilla (Quick Steps)

### Scenario 1: Deploying to Root Domain (`https://yourdomain.com/`)

1. Open **FileZilla** and enter your hosting credentials (Host, Username, Password, Port 21 or 22).
2. On the **Remote Site** panel (right side), navigate to:
   ```
   /public_html/
   ```
3. Extract `reveg-fresh-foods-filezilla.zip` on your computer.
4. Upload all extracted files directly into `/public_html/`.
5. Check directory permissions (right-click in FileZilla → *File permissions*):
   - `/uploads/` and `/uploads/hero/` ➔ `755` (or `775`)
   - `/data/` ➔ `755` (or `775`)
6. Open `https://yourdomain.com/` in your browser. Done!

---

### Scenario 2: Deploying to a Subfolder / Subdirectory (`/public_html/site2/`)

1. In FileZilla, navigate to or create the subfolder:
   ```
   /public_html/site2/
   ```
2. Upload all files from the ZIP directly into `/public_html/site2/`.
3. Because all asset links (`./assets/...`) and API endpoints (`api/...`) use relative paths, the website and Admin Dashboard will work immediately at:
   - **Frontend:** `https://yourdomain.com/site2/`
   - **Admin Dashboard:** `https://yourdomain.com/site2/admin`

---

## 🎨 Hero Image Management via Admin Dashboard

The Admin Dashboard enables full dynamic management of the Hero Image without touching any code:

1. Visit `/admin` on your website (e.g. `https://yourdomain.com/admin` or `https://yourdomain.com/site2/admin`).
2. Log in with admin credentials.
3. Open **Hero Image Management & Hero Settings**:
   - **Upload New Hero Image:** Drag and drop or browse for any JPG, JPEG, PNG, or WEBP image (up to 10MB).
   - **Pre-Save Preview:** The dashboard renders an interactive live preview of your chosen image with dimensions and file size before saving.
   - **Upload & Save:** Click *Upload & Save as Hero Image*. The image is uploaded to `uploads/hero/`, saved to `data/hero.json`, and updates the live homepage immediately.
   - **Replace Image:** Pick a new image anytime to replace the existing one.
   - **Delete Image:** Click *Delete Current Image* to remove it from the server and revert to the authentic default heritage image.
4. Refresh your website — the selected Hero image remains saved permanently!
