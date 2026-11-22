/**
 * VICKY AI - AI Thumbnail Studio (Part 5G)
 * Brand: VICKY AI - "ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE."
 * Generates custom high-impact thumbnails and movie poster covers with
 * cinematic typography, badges, color grades, and instant PNG export.
 */

const VickyThumbnailStudio = {
  canvas: null,
  ctx: null,
  aspectRatio: '16:9',
  bgImage: null,
  currentPreset: 'youtube_yellow',

  styles: {
    youtube_yellow: {
      fill: '#fde047',
      stroke: '#000000',
      strokeWidth: 10,
      glow: 'rgba(0, 0, 0, 0.9)',
      glowBlur: 15,
      font: '900 68px "Plus Jakarta Sans", sans-serif'
    },
    cyber_neon: {
      fill: '#00f0ff',
      stroke: '#8b5cf6',
      strokeWidth: 6,
      glow: '#00f0ff',
      glowBlur: 28,
      font: '900 64px "Space Grotesk", sans-serif'
    },
    hollywood_gold: {
      fill: '#fbbf24',
      stroke: '#78350f',
      strokeWidth: 8,
      glow: 'rgba(251, 191, 36, 0.7)',
      glowBlur: 20,
      font: '800 66px "Space Grotesk", sans-serif'
    },
    tollywood_mass: {
      fill: '#ef4444',
      stroke: '#fef08a',
      strokeWidth: 7,
      glow: 'rgba(239, 68, 68, 0.8)',
      glowBlur: 24,
      font: '900 68px "Plus Jakarta Sans", sans-serif'
    }
  },

  init() {
    this.canvas = document.getElementById('thumbnailCanvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindControls();
      this.render();
    }
  },

  bindControls() {
    ['thumbTextMain', 'thumbTextSub', 'thumbBadgeSelect', 'thumbStyleSelect', 'thumbVignetteToggle', 'thumbLetterboxToggle'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.render());
        el.addEventListener('change', () => this.render());
      }
    });

    const fileInput = document.getElementById('thumbBgUpload');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    const btnDownload = document.getElementById('btnDownloadThumbnail');
    if (btnDownload) {
      btnDownload.addEventListener('click', () => this.downloadThumbnail());
    }
  },

  setAspectRatio(ratio) {
    this.aspectRatio = ratio;
    if (ratio === '9:16') {
      this.canvas.width = 720;
      this.canvas.height = 1280;
    } else {
      this.canvas.width = 1280;
      this.canvas.height = 720;
    }
    this.render();
  },

  handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        this.bgImage = img;
        this.render();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  },

  captureFromVideo(videoEl) {
    if (!videoEl) return;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = videoEl.videoWidth || 1280;
    offCanvas.height = videoEl.videoHeight || 720;
    const offCtx = offCanvas.getContext('2d');
    offCtx.drawImage(videoEl, 0, 0, offCanvas.width, offCanvas.height);
    const img = new Image();
    img.onload = () => {
      this.bgImage = img;
      this.render();
    };
    img.src = offCanvas.toDataURL('image/jpeg');
  },

  generateAiBackground() {
    const prompt = document.getElementById('thumbAiPrompt')?.value || 'Cinematic cyberpunk neon portal';
    // Synthesize rich procedural cinematic backdrop on canvas
    this.bgImage = null;
    this.renderProceduralBackground(prompt);
  },

  renderProceduralBackground(prompt = '') {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const p = prompt.toLowerCase();

    // Base dark cinematic gradient
    const grad = this.ctx.createLinearGradient(0, 0, w, h);
    if (p.includes('cyber') || p.includes('neon') || p.includes('tech')) {
      grad.addColorStop(0, '#0a031e');
      grad.addColorStop(0.5, '#2e0854');
      grad.addColorStop(1, '#062038');
    } else if (p.includes('mass') || p.includes('hero') || p.includes('fire')) {
      grad.addColorStop(0, '#2d0505');
      grad.addColorStop(0.5, '#7f1d1d');
      grad.addColorStop(1, '#1c1917');
    } else {
      grad.addColorStop(0, '#040714');
      grad.addColorStop(0.6, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
    }
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    // Dynamic light orbs
    const radGrad1 = this.ctx.createRadialGradient(w * 0.7, h * 0.3, 20, w * 0.7, h * 0.3, w * 0.5);
    radGrad1.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
    radGrad1.addColorStop(1, 'rgba(168, 85, 247, 0)');
    this.ctx.fillStyle = radGrad1;
    this.ctx.fillRect(0, 0, w, h);

    const radGrad2 = this.ctx.createRadialGradient(w * 0.2, h * 0.7, 30, w * 0.2, h * 0.7, w * 0.45);
    radGrad2.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
    radGrad2.addColorStop(1, 'rgba(6, 182, 212, 0)');
    this.ctx.fillStyle = radGrad2;
    this.ctx.fillRect(0, 0, w, h);

    // Horizon line / beam
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, h * 0.65);
    this.ctx.lineTo(w, h * 0.65);
    this.ctx.stroke();
    this.ctx.restore();
  },

  render() {
    if (!this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Background
    if (this.bgImage) {
      ctx.drawImage(this.bgImage, 0, 0, w, h);
    } else {
      const prompt = document.getElementById('thumbAiPrompt')?.value || 'Cinematic movie backdrop';
      this.renderProceduralBackground(prompt);
    }

    // 2. Color Grade / Contrast Layer
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(0, 0, w, h);

    // 3. Dark Vignette Effect
    const hasVignette = document.getElementById('thumbVignetteToggle')?.checked ?? true;
    if (hasVignette) {
      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.75);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    }

    // 4. Cinematic Letterbox Bars
    const hasLetterbox = document.getElementById('thumbLetterboxToggle')?.checked;
    if (hasLetterbox && this.aspectRatio === '16:9') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h * 0.08);
      ctx.fillRect(0, h * 0.92, w, h * 0.08);
    }

    // 5. Badge / Sticker
    const badgeText = document.getElementById('thumbBadgeSelect')?.value;
    if (badgeText && badgeText !== 'none') {
      ctx.save();
      ctx.translate(50, 60);
      ctx.fillStyle = badgeText.includes('4K') ? '#dc2626' : (badgeText.includes('NEW') ? '#0284c7' : '#a855f7');
      ctx.beginPath();
      ctx.roundRect(0, 0, 160, 42, 8);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '900 18px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, 80, 21);
      ctx.restore();
    }

    // 6. Viral Typography Overlay
    const mainText = (document.getElementById('thumbTextMain')?.value || 'SHOCKING TWIST!').toUpperCase();
    const subText = (document.getElementById('thumbTextSub')?.value || 'ONE PROMPT. ONE COMPLETE MOVIE.').toUpperCase();
    const styleKey = document.getElementById('thumbStyleSelect')?.value || 'youtube_yellow';
    const style = this.styles[styleKey] || this.styles.youtube_yellow;

    ctx.save();
    ctx.textAlign = 'center';

    // Subtitle / Kicker
    if (subText) {
      ctx.font = '800 24px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 10;
      ctx.fillText(subText, w / 2, h * 0.72);
    }

    // Main Headline Text with Stroke & Glow
    ctx.font = this.aspectRatio === '9:16' ? '900 48px "Plus Jakarta Sans", sans-serif' : style.font;
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = style.glowBlur;

    // Stroke
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.strokeWidth;
    ctx.lineJoin = 'round';
    ctx.strokeText(mainText, w / 2, h * 0.83);

    // Fill
    ctx.fillStyle = style.fill;
    ctx.fillText(mainText, w / 2, h * 0.83);

    ctx.restore();

    // VICKY AI Watermark
    ctx.save();
    ctx.font = '700 16px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'right';
    ctx.fillText('VICKY AI STUDIO', w - 40, h - 35);
    ctx.restore();
  },

  downloadThumbnail() {
    if (!this.canvas) return;
    const dataUrl = this.canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Vicky_AI_Thumbnail_${Date.now()}.png`;
    a.click();

    // Persist to backend thumbnail gallery
    try {
      const apiEndpoint = (window.VickyConfig && window.VickyConfig.getApiUrl) ? window.VickyConfig.getApiUrl('/api/thumbnails') : '/api/thumbnails';
      fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: document.getElementById('thumbTextMain')?.value || 'SHOCKING TWIST!',
          subtext: document.getElementById('thumbTextSub')?.value || '',
          style_preset: document.getElementById('thumbStyleSelect')?.value || 'youtube_yellow',
          badge: document.getElementById('thumbBadgeSelect')?.value || 'none',
          aspect_ratio: this.aspectRatio,
          image_data: dataUrl
        })
      });
    } catch (e) {}
  }
};

window.VickyThumbnailStudio = VickyThumbnailStudio;
