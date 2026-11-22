# VICKY AI - Production Deployment & GPU Infrastructure Guide

This guide details the two-tier architecture of VICKY AI:
1. **Frontend & Gateway Layer**: Hosted on **Vercel** (Global Edge, fast static delivery, zero cold starts, SSL).
2. **Heavy AI Inference Layer**: Hosted on **RunPod**, **Modal**, or **Hugging Face Spaces** (CUDA GPU acceleration for Wan 2.1, Stable Video Diffusion, and AnimateDiff).

---

## Part 1: Deploying the Frontend & Gateway to Vercel

### Step 1: Push Source Code to GitHub
1. Create a new repository on GitHub:
   - Name: `vicky-ai`
   - Privacy: Public or Private
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial release of VICKY AI - Create Anything. Generate Everything."
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/vicky-ai.git
   git push -u origin main
   ```

### Step 2: Import into Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** > **Project**.
3. Select your repository: `vicky-ai`.
4. Vercel automatically detects `vercel.json` and configures routes.
5. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `VICKY_SITE_URL`: `https://vickyai.com` (or your initial vercel preview URL)
   - `DEFAULT_MODEL`: `wan-2.1`
6. Click **Deploy**.
7. In ~30 seconds, your site is publicly live at:
   `https://vicky-ai-<username>.vercel.app` (or custom domain).

---

## Part 2: Heavy Open-Source AI Video Generation on GPU

Heavy open-source video models like Wan 2.1 (14B parameter) and Stable Video Diffusion require 16GB-24GB VRAM for high-throughput inference.

### Recommended GPU Providers:

| Provider | Best For | Typical Hourly Cost | Setup Ease |
| :--- | :--- | :--- | :--- |
| **RunPod** | Dedicated RTX 4090 / A100 with ComfyUI Template | $0.44 - $1.89/hr | Easiest (One-Click Template) |
| **Modal** | Serverless GPU (auto-scales from 0, pay per second) | ~$0.0006/sec (Only when generating) | Best for low idle cost |
| **Hugging Face Spaces** | Community open-source Docker GPU Spaces | Free - $0.60/hr | Very Simple |

---

### Deploying ComfyUI on RunPod:
1. Sign up at [RunPod.io](https://www.runpod.io).
2. In the Pods catalog, select **ComfyUI Official Template**.
3. Choose a GPU with 24GB VRAM (e.g., NVIDIA RTX 4090 or RTX 6000 Ada).
4. Download the open-source model weights:
   - **Wan 2.1**: Download `wan2.1_t2v_14B.safetensors` to `/workspace/ComfyUI/models/checkpoints/`
   - **SVD-XT**: Download `svd_xt_1_1.safetensors` to `/workspace/ComfyUI/models/checkpoints/`
   - **AnimateDiff**: Download `animatediff_v3_adapter.safetensors` to `/workspace/ComfyUI/custom_nodes/ComfyUI-AnimateDiff-Evolved/models/`
5. Note the public proxy URL or HTTP address of your RunPod (e.g. `https://xxxx-8188.proxy.runpod.net`).
6. In your Vercel Project Settings > Environment Variables:
   - Set `COMFYUI_HOST` = `xxxx-8188.proxy.runpod.net`
   - Set `COMFYUI_ENABLED` = `true`
7. Redeploy Vercel. Now whenever a user clicks "Generate Video", VICKY AI automatically streams the prompt into the RunPod GPU cluster!
