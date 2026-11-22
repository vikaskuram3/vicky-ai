# VICKY AI - Open-Source Video Models Technical Architecture

VICKY AI relies entirely on open-source foundation models and community pipelines rather than paid proprietary APIs.

---

## Supported Open-Source Models

### 1. Wan 2.1 (T2V 14B & 1.3B)
- **Developer**: Alibaba Cloud WanX Team
- **Type**: Text-to-Video Diffusion Transformer (DiT)
- **Key Advantages**:
  - Unmatched 1080p spatial-temporal coherence
  - Exceptional text prompt alignment and realistic physics
  - Open model weights available under open research license on Hugging Face
- **Workflow**: Pre-configured in `backend/workflows/wan_t2v_workflow.json`

### 2. Stable Video Diffusion (SVD-XT 1.1)
- **Developer**: Stability AI
- **Type**: Image-to-Video Latent Video Diffusion Model
- **Key Advantages**:
  - Synthesizes 25 frames of smooth 576x1024 / 1080p video from a single still photograph
  - Configurable motion bucket ID (1 to 255) for subtle to high-energy animation
- **Workflow**: Pre-configured in `backend/workflows/svd_i2v_workflow.json`

### 3. AnimateDiff XL v3
- **Developer**: Gu et al. / Open-Source Community
- **Type**: Motion Adapter Module for Stable Diffusion XL
- **Key Advantages**:
  - High motion dynamics ideal for anime, stylized art, and fast camera orbits
  - Lightweight and fast rendering
- **Workflow**: Pre-configured in `backend/workflows/animatediff_workflow.json`

### 4. Generative Diffusion & FFmpeg Procedural Synthesis Engine
- **Role in VICKY AI**: Built-in visual kinematics generator that runs natively across any hardware (CPU, local developer machines, or edge servers) when external high-end GPUs are offline.
- Synthesizes multi-frame motion sequences with camera translations (zoom, pan, tilt, orbit), dynamic color harmonizing, volumetric lighting, and encodes genuine playable H.264 MP4 containers.
