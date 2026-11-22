/**
 * VICKY AI - Social Media Export & Downloads Center (Part 5F)
 * Brand: VICKY AI - "ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE."
 * Provides presets for:
 * - YouTube (16:9 1920x1080)
 * - YouTube Shorts (9:16 1080x1920)
 * - Instagram Reels (9:16 1080x1920 with safe zone guide)
 * - Facebook (1:1 1080x1080 / 16:9)
 * - TikTok (9:16 1080x1920)
 */

const VickySocialExport = {
  currentVideoUrl: '/samples/cyberpunk_city.mp4',
  currentVideoTitle: 'Cyberpunk Neon Metropolis',
  activePreset: 'youtube',

  presets: {
    youtube: {
      name: 'YouTube Landscape',
      aspect: '16:9',
      resolution: '1920x1080',
      badge: '16:9 Widescreen',
      recommended_fps: 24,
      icon: '▶️',
      description: 'Standard 16:9 widescreen format optimized for desktop & TV playback.'
    },
    shorts: {
      name: 'YouTube Shorts',
      aspect: '9:16',
      resolution: '1080x1920',
      badge: '9:16 Vertical',
      recommended_fps: 30,
      icon: '⚡',
      description: 'Vertical 9:16 full-screen format for viral YouTube Shorts feeds.'
    },
    reels: {
      name: 'Instagram Reels',
      aspect: '9:16',
      resolution: '1080x1920',
      badge: '9:16 Reels',
      recommended_fps: 30,
      icon: '📸',
      description: 'Vertical format with Instagram UI safe margins for maximum engagement.'
    },
    tiktok: {
      name: 'TikTok Feed',
      aspect: '9:16',
      resolution: '1080x1920',
      badge: '9:16 TikTok',
      recommended_fps: 30,
      icon: '🎵',
      description: 'Optimized high-bitrate vertical video for TikTok algorithm distribution.'
    },
    facebook: {
      name: 'Facebook Feed',
      aspect: '1:1',
      resolution: '1080x1080',
      badge: '1:1 Square',
      recommended_fps: 24,
      icon: '👥',
      description: 'Square 1:1 format commanding 78% more screen real estate on mobile news feeds.'
    }
  },

  init() {
    this.renderSocialPresets();
    this.loadDownloadQueue();
  },

  selectPreset(presetKey) {
    this.activePreset = presetKey;
    const preset = this.presets[presetKey];
    if (!preset) return;

    document.querySelectorAll('.social-preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-preset') === presetKey);
    });

    const info = document.getElementById('socialPresetInfo');
    if (info) {
      info.innerHTML = `
        <div style="font-size:0.9rem; font-weight:700; color:#ffffff; margin-bottom:4px;">${preset.name} (${preset.resolution})</div>
        <div style="font-size:0.8rem; color:#94a3b8;">${preset.description}</div>
      `;
    }

    // Toggle safe zone overlay if 9:16
    const overlay = document.getElementById('socialSafeZoneOverlay');
    if (overlay) {
      overlay.style.display = (preset.aspect === '9:16') ? 'block' : 'none';
    }
  },

  downloadForPlatform(presetKey) {
    const preset = this.presets[presetKey || this.activePreset];
    const safeTitle = (this.currentVideoTitle || 'vicky_ai_video').replace(/[^a-zA-Z0-9]/g, '_');
    const downloadName = `${safeTitle}_${preset.aspect.replace(':', 'x')}_${presetKey}.mp4`;
    const cleanUrl = this.currentVideoUrl;

    const downloadEndpoint = `/api/download?file=${encodeURIComponent(cleanUrl)}&name=${encodeURIComponent(downloadName)}`;
    const a = document.createElement('a');
    a.href = downloadEndpoint;
    a.download = downloadName;
    a.click();
  },

  renderSocialPresets() {
    const container = document.getElementById('socialPresetsGrid');
    if (!container) return;

    container.innerHTML = Object.entries(this.presets).map(([key, p]) => `
      <div class="social-preset-card ${key === this.activePreset ? 'active' : ''}" onclick="VickySocialExport.selectPreset('${key}')">
        <div class="social-icon">${p.icon}</div>
        <div class="social-title">${p.name}</div>
        <div class="social-badge">${p.badge}</div>
        <button class="btn-outline" style="width:100%; margin-top:10px; font-size:0.75rem;" onclick="event.stopPropagation(); VickySocialExport.downloadForPlatform('${key}')">
          Download ${p.aspect} MP4
        </button>
      </div>
    `).join('');
  },

  async loadDownloadQueue() {
    const listContainer = document.getElementById('downloadHistoryList');
    if (!listContainer) return;

    try {
      const apiEndpoint = (window.VickyConfig && window.VickyConfig.getApiUrl) ? window.VickyConfig.getApiUrl('/api/projects') : '/api/projects';
      const res = await fetch(apiEndpoint);
      const data = await res.json();
      const projects = (data && data.projects) || [];

      if (projects.length === 0) {
        listContainer.innerHTML = `<div style="text-align:center; padding:30px; color:#64748b;">No downloaded videos yet. Generate your first video or movie!</div>`;
        return;
      }

      listContainer.innerHTML = projects.map(p => `
        <div class="download-queue-item">
          <img src="${p.thumbnail_url || '/samples/cyberpunk_city_thumb.jpg'}" class="download-thumb" alt="${p.title}">
          <div class="download-meta">
            <div class="download-title">${p.title}</div>
            <div class="download-details">
              <span>${p.aspect_ratio || '16:9'}</span> &bull;
              <span>${p.duration || 3}s</span> &bull;
              <span>${p.type || 'text-to-video'}</span> &bull;
              <span>${new Date(p.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div class="download-actions">
            <a href="/api/download?file=${encodeURIComponent(p.video_url)}&name=${encodeURIComponent(p.title)}.mp4" class="btn-cta" style="padding:6px 14px; font-size:0.78rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Download MP4</span>
            </a>
          </div>
        </div>
      `).join('');

    } catch (e) {
      console.warn('Could not load download queue:', e.message);
    }
  }
};

window.VickySocialExport = VickySocialExport;
