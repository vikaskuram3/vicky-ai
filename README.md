# VICKY AI VIDEO STUDIO 🎬✨
### **ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Brand](https://img.shields.io/badge/Brand-VICKY%20AI-8b5cf6.svg)](#brand-identity)
[![Tagline](https://img.shields.io/badge/Tagline-One%20Prompt.%20One%20Story.%20One%20Complete%20Movie-00f0ff.svg)](#brand-identity)
[![Database: Supabase](https://img.shields.io/badge/Auth%20%26%20DB-Supabase%20Ready-10b981.svg)](#supabase-integration)
[![Automated Tests](https://img.shields.io/badge/Tests-35%20Passing-success.svg)](#testing)

**VICKY AI VIDEO STUDIO** is a state-of-the-art cinematic AI video-generation platform designed with an original, dark cinematic interface. It transforms a single text prompt into an end-to-end multi-scene movie with consistent character memory, automated story direction, Telugu cinema studio workflows, viral thumbnail generation, and multi-platform social media exports. Zero paid API dependencies.

---

## 🌟 Brand Identity (Part 1)

- **Brand Name**: VICKY AI
- **Tagline**: ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE.
- **Brand Personality**: Futuristic, Cinematic, Creative, Premium, Beginner-friendly.
- **Design System**: 
  - Dark cinematic interface with deep black canvas (`#030308`, `#060714`).
  - Electric purple (`#8b5cf6`, `#a855f7`) and electric-blue (`#06b6d4`, `#00f0ff`) glowing gradients.
  - Glassmorphic panels with subtle glowing neon borders (`rgba(139, 92, 246, 0.25)`).
  - Smooth cinematic animations, dynamic particle nebula canvas, and modern geometric typography (*Space Grotesk* and *Plus Jakarta Sans*).

---

## 🚀 7 Original AI Features (Part 5)

### A. One-Prompt Movie Maker
Convert **one text prompt** into a complete multi-scene cinematic movie! The system deconstructs the story into a 4-act narrative arc (Awakening, Conflict, Climax, Resolution), calculates scene camera paths, synthesizes visuals, applies crossfade transitions, mixes synchronized voiceover and cinematic soundtracks, and renders a complete downloadable MP4 container.

### B. Character Memory
Maintains consistent characters across generated scenes using reference traits, style parameters, and seed conditioning. Includes pre-loaded character presets (Kalyan - Tollywood Mass Hero, Sita - Galactic Commander, Vikram - Vedic Tech Explorer, Aria - Neo-Tokyo Detective) and support for custom character creation with reference avatars.

### C. AI Story Director
Automatically generates:
- High-level Story Premise & Logline.
- Full Screenplay Script with scene headings, action lines, and character dialogue.
- Scene Breakdown with framing and lighting parameters.
- Cinematic Camera Instructions (Dolly-In, 360 Orbit, Tracking Pan, Crane Down, Dutch Angle).
- Scene-by-scene Narration script.
- Synchronized Subtitles with precise timing offsets in standard `.SRT` format.

### D. Telugu AI Studio (తెలుగు AI స్టూడియో)
A dedicated studio for Telugu cinema (Tollywood) and content creators:
- Pure Telugu Script & Voiceover Narration.
- Telugu-English Mixed Scripts ("Teluglish" bilingual popular format).
- 5 Tollywood Presets:
  1. **Mass Hero Elevation (హీరో ఎలివేషన్)**
  2. **Emotional Flashback (ఎమోషనల్ ఫ్లాష్‌బ్యాక్)**
  3. **Sci-Fi Andhra 2050 (సైన్స్ ఫిక్షన్ 2050)**
  4. **Mythological Epic (పౌరాణిక కావ్యం)**
  5. **Village Action Thriller (పల్లెటూరి యాక్షన్)**
- Web Speech API Telugu voice synthesizer (`te-IN`) and authentic Telugu typography subtitles.

### E. Auto Video Editor
Multi-track browser timeline editor:
- Scene Track with re-orderable scene cards and transition selectors (Crossfade, Dissolve, Glitch, Zoom).
- Voiceover Track with synchronized audio waveforms and volume ducking.
- Background Music Track with cinematic synth, orchestral brass, and rural folk drums.
- Subtitle Burn-In with bold yellow karaoke highlights.
- Live video player with scrub bar, timecode, and H.264/AAC composition export.

### F. Social Media Export
Platform-calibrated presets with safe-zone UI overlays:
- **YouTube** (16:9 1920x1080 Landscape)
- **YouTube Shorts** (9:16 1080x1920 Vertical)
- **Instagram Reels** (9:16 1080x1920 Vertical with safe margin UI guide)
- **Facebook** (1:1 1080x1080 Square or 16:9 Feed)
- **TikTok** (9:16 1080x1920 Vertical)

### G. AI Thumbnail Studio
Canvas-based viral thumbnail and movie poster editor:
- Formats: 16:9 YouTube Thumbnails and 9:16 Reels/Shorts covers.
- Viral Typography Styles: 3D Hollywood Gold, Cyber Neon Cyan/Purple, YouTube High-CTR Bold Yellow, Tollywood Fire Red.
- Badges: `4K UHD`, `OFFICIAL TRAILER`, `NEW RELEASE`, `MUST WATCH`.
- Overlays: Dark Vignette, High Contrast Pop, Cinematic Letterbox bars.
- 1-Click High-Res PNG Download.

---

## 🔐 Authentication & Supabase Integration (Part 2, 3, 4)

- **Dedicated Login Page**: `/login` featuring animated particle canvas, email/password inputs, show/hide password toggle, remember me, forgot password modal, and Google OAuth.
- **Dedicated Signup Page**: `/signup` featuring full name, email, password, confirm password validation, terms agreement, and email verification notification modal.
- **Supabase Authentication**: Integrated via official Supabase JS SDK v2 with automatic fallback to persistent browser session management when keys are unconfigured.
- **Protected Dashboard**: Restricts private projects and actions with persistent token synchronization.
- **Database Migrations**: Located at `data/migrations/20261121000000_vicky_studio_init.sql` and `supabase/migrations/20261121000000_vicky_studio_init.sql` with full Row Level Security (RLS) policies for `profiles`, `projects`, `characters`, `movies`, and `thumbnails`.

---

## 🛠️ Quick Start

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

Configure your Supabase credentials:
```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Launch the VICKY AI Server
```bash
npm start
```
Open **`http://localhost:3000`** in your browser.

---

## 🧪 Automated Testing

Run the unified test suite:
```bash
npm test
```

### Test Results Summary:
- **In-Memory API Suite**: 10/10 Passed (Health, Models, Voices, Projects, Script Gen, Auth, FFmpeg Dependencies, Stream Probing, Multi-Tenant Security).
- **SEO & Discoverability Suite**: 12/12 Passed (Title tag, Meta description, 5 Target Keywords, Schema.org JSON-LD, Open Graph, Sitemap.xml, Robots.txt).
- **Video Generation & MP4 Integrity Suite**: 3/3 Passed (16:9 Landscape, 9:16 Shorts, 1:1 Square MP4s).
- **Feature Verification Test Suite**: 10/10 Passed (Login Page, Signup Page, Supabase Config, Auth Flows, Story Director, Telugu Studio, One-Prompt Movie Maker, Download Hub, Character Memory CRUD, Thumbnail Persistence).
- **Total**: **35 Passed, 0 Failed (100% Success)**.
