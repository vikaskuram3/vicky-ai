# VICKY AI VIDEO STUDIO - PRODUCTION DEPLOYMENT GUIDE

**Brand:** VICKY AI  
**Tagline:** ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE.  

---

## 1. Fast Deploy to Vercel (Frontend & Full-Stack Serverless)

The repository includes a production-ready `vercel.json` configuration supporting static assets, dedicated `/login` and `/signup` routes, and `@vercel/node` API routing.

### Step-by-Step Vercel Deployment:
1. Push your repository to GitHub / GitLab.
2. Go to [https://vercel.com/new](https://vercel.com/new) and select your **VICKY AI** repository.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `VICKY_SITE_URL`: Your Vercel production URL (e.g. `https://vicky-ai.vercel.app` or custom domain)
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Random 32-character string
4. Click **Deploy**.
5. Your application will be live at `https://your-project.vercel.app`.

---

## 2. Deploying Backend to Render / Railway / Docker (Optional Dedicated Video Worker)

If you prefer running a dedicated high-performance backend with FFmpeg and Python on a persistent server:

### Option A: Render
1. In Render, select **New Blueprint Instance** or **New Web Service** connected to your repo.
2. Select `Dockerfile` runtime.
3. The included `render.yaml` automatically sets up the service on port 3000 with health checks at `/health`.

### Option B: Railway
1. Go to [railway.app](https://railway.app), click **New Project** -> **Deploy from GitHub repo**.
2. Railway detects `railway.json` and builds the production `Dockerfile`.

### Option C: Self-Hosted Docker
```bash
docker-compose up -d --build
```

---

## 3. Configuring Supabase Production Database & Authentication

### Step 1: Run SQL Migration
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor**.
3. Copy and run the migration file from:
   `supabase/migrations/20261121000000_vicky_studio_init.sql`
4. This creates all 5 tables (`profiles`, `projects`, `characters`, `movies`, `thumbnails`), Row Level Security (RLS) policies, and performance indexes.

### Step 2: Configure Redirect URLs for Google OAuth & Email Auth
1. Go to **Authentication** -> **URL Configuration**.
2. Set **Site URL** to your production domain:
   ```
   https://your-project.vercel.app
   ```
3. In **Redirect URLs**, add the following authorized patterns:
   - `https://your-project.vercel.app/**`
   - `https://your-project.vercel.app/dashboard`
   - `https://your-project.vercel.app/login`
   - `https://*.vercel.app/**`
   - `https://*.vercel.app/dashboard`
   - `http://localhost:3000/**`
   - `http://localhost:3000/dashboard`

### Step 3: Enable Google OAuth
1. In Supabase Dashboard, go to **Authentication** -> **Providers** -> **Google**.
2. Toggle **Enable Google provider**.
3. Create a project in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
4. Under **OAuth 2.0 Client IDs**, set the **Authorized redirect URI** to:
   ```
   https://<your-supabase-project-id>.supabase.co/auth/v1/callback
   ```
5. Copy **Client ID** and **Client Secret** into your Supabase Google provider settings.

---

## 4. Connecting Separate Frontend & Backend (Zero CORS Issues)

If your frontend is on Vercel and your backend is on Render/Railway:
1. In the VICKY AI Studio Dashboard, click **Settings**.
2. In **Production Backend API URL**, enter:
   ```
   https://your-backend.onrender.com
   ```
3. Click **Save Production Settings**.
4. The client-side `VickyConfig` automatically routes all API requests (`/api/projects`, `/api/generate/movie`, `/api/characters`) to your backend while maintaining full CORS compliance.
