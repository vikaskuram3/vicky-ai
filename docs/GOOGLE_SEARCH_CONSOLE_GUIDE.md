# VICKY AI - Google Search Console Submission & SEO Guide

This guide explains how to verify your website ownership on Google Search Console, submit your sitemap, request immediate indexing, and rank for target AI video search keywords.

---

## Target Keywords Configured in VICKY AI:
- `Vicky AI`
- `Vicky AI Video Generator`
- `Free AI Video Generator`
- `Text to Video AI`
- `Image to Video AI`

---

## Step 1: Open Google Search Console
1. Navigate to: [https://search.google.com/search-console](https://search.google.com/search-console)
2. Sign in with your Google Account.
3. Click **Add Property** in the left sidebar dropdown.

---

## Step 2: Choose Property Type
Select **URL Prefix**:
```text
https://vickyai.com
```
*(If you are deploying first to Vercel before the custom domain, enter your Vercel URL e.g. `https://vicky-ai.vercel.app`)*.

---

## Step 3: Verify Ownership

Google provides multiple verification options. VICKY AI supports both methods:

### Method A: HTML Tag (Easiest)
1. In Search Console, select **HTML Tag**.
2. Copy the meta tag provided by Google, which looks like:
   ```html
   <meta name="google-site-verification" content="ABC123xyz_token_here" />
   ```
3. Copy the token string inside `content="..."`.
4. Open VICKY AI in your browser, navigate to the **Contact** page (`#contact`), paste the token into the **Google Search Console Verification** box, and click **Register Token with Server**.
   *Or open `frontend/index.html` line 34 and paste the token directly into:*
   ```html
   <meta name="google-site-verification" content="YOUR_TOKEN_HERE">
   ```
5. Deploy or push your commit to GitHub/Vercel.
6. Return to Google Search Console and click **Verify**.

### Method B: DNS TXT Record (Recommended for Custom Domains)
1. If you own `vickyai.com`, select the **Domain** verification or **DNS Record**.
2. Copy the `TXT` record string provided by Google (e.g. `google-site-verification=...`).
3. In your domain registrar (Cloudflare / Namecheap / Porkbun), add a new DNS record:
   - **Type**: `TXT`
   - **Name**: `@`
   - **Value**: Your Google verification string
4. Click **Verify** in Google Search Console.

---

## Step 4: Submit the XML Sitemap

Submitting your sitemap tells Googlebot to index all 11 studio pages immediately.

1. In Google Search Console, click on **Sitemaps** in the left sidebar menu under the "Indexing" section.
2. In the **Add a new sitemap** input field, type:
   ```text
   sitemap.xml
   ```
   *(Full URL: `https://vickyai.com/sitemap.xml`)*
3. Click **Submit**.
4. You will see a green status badge: **Success**.

---

## Step 5: Fast-Track Indexing via URL Inspection

To get Google to crawl and index your homepage within hours rather than weeks:
1. Click the top search bar in Google Search Console: **Inspect any URL in "https://vickyai.com"**.
2. Enter:
   ```text
   https://vickyai.com
   ```
3. Click **Test Live URL**.
4. Once verified that the page is mobile-friendly and accessible, click **Request Indexing**.
5. Repeat for:
   - `https://vickyai.com/generator`
   - `https://vickyai.com/text-to-video`
   - `https://vickyai.com/image-to-video`

---

## Step 6: Monitoring Your Search Rankings

Under the **Performance** tab in Google Search Console, you will be able to monitor:
- **Total Clicks**
- **Total Impressions**
- **Average CTR (Click-Through Rate)**
- **Average Position** for keywords: `Vicky AI`, `Free AI Video Generator`, and `Text to Video AI`.
