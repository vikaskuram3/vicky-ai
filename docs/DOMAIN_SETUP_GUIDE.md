# VICKY AI - Custom Domain Purchase & DNS Configuration Guide
**Domain Target: `vickyai.com`**

This guide provides step-by-step instructions for checking domain availability, purchasing your custom domain at the best price, configuring DNS records, and linking it to Vercel with automatic SSL certificates.

---

## 1. Checking Domain Availability

Never assume that `vickyai.com` is available. Domains are registered in real-time on global ICANN registries.

### How to Check:
1. Visit one of the recommended registrars:
   - **Cloudflare Registrar** ([cloudflare.com/products/registrar](https://www.cloudflare.com/products/registrar)): Sells domains at wholesale cost with **zero retail markup** and free WHOIS privacy.
   - **Porkbun** ([porkbun.com](https://porkbun.com)): Low transparent pricing, free SSL, free WHOIS privacy.
   - **Namecheap** ([namecheap.com](https://www.namecheap.com)): Popular, free privacy protection.
2. In the search box, enter:
   ```text
   vickyai.com
   ```
3. If `vickyai.com` is available, proceed to purchase immediately.
4. If `vickyai.com` is already taken, consider these high-ranking alternatives:
   - `vicky-ai.com`
   - `vickyai.app`
   - `vickyai.io`
   - `vickyai.video`
   - `vickystudio.ai`

---

## 2. Purchasing Your Domain

1. **Add to Cart**: Select the domain registration for 1 or 2 years.
2. **Enable WHOIS Privacy**: Always ensure WHOIS Privacy (Domain Privacy Protection) is turned **ON** (included free on Cloudflare and Porkbun). This hides your personal email, phone number, and physical address from spammers.
3. **Disable Unnecessary Upsells**: Decline paid email hosting, site builders, or paid SSL add-ons. Vercel provides enterprise-grade Let's Encrypt SSL certificates automatically for free.
4. **Complete Checkout**.

---

## 3. Configuring DNS Records for Vercel

Once your domain is purchased, you must point its DNS records to Vercel so public web traffic is routed to your VICKY AI application.

### Required DNS Records:

| Type | Name / Host | Value / Target | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (or leave blank for root) | `76.76.21.21` | Auto (or 3600) | Points `vickyai.com` to Vercel Global Edge Network |
| **CNAME** | `www` | `cname.vercel-dns.com` | Auto (or 3600) | Points `www.vickyai.com` to Vercel |

### If using Cloudflare for DNS:
- When adding the records in Cloudflare DNS management, you can keep the Proxy Status set to **DNS Only** during initial Vercel verification. Once verified, you may enable Cloudflare's orange cloud proxy for DDoS protection and edge caching.

---

## 4. Connecting Domain in Vercel Dashboard

1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click on your **vicky-ai** project.
3. Navigate to **Settings** > **Domains**.
4. In the input box, type:
   ```text
   vickyai.com
   ```
5. Click **Add**.
6. Vercel will recommend adding both `vickyai.com` and redirecting `www.vickyai.com`. Select the recommended redirect.
7. Vercel will detect the DNS records. Once the DNS propagates (typically 2 to 30 minutes), a green checkmark will appear:
   - `Valid Configuration`
   - `SSL Certificate Issued`

Your public website is now live at:
**`https://vickyai.com`**
