/**
 * VICKY AI - Multi-Track Studio Video Editor (Part 5E & 6)
 * Brand: VICKY AI - "ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE."
 * Coordinates video, voiceover, background music mixing, transitions, and final MP4 export.
 */

const VickyEditor = {
  currentTransition: 'fade',
  currentBgm: 'ambient_tech.wav',
  bgmVolume: 0.25,
  burnSubtitles: true,

  init() {
    this.bindControls();
    this.bindExport();
  },

  bindControls() {
    const transSel = document.getElementById('editorTransitionSelect');
    const bgmSel = document.getElementById('editorBgmSelect');
    const volSlider = document.getElementById('bgmVolumeSlider');
    const volVal = document.getElementById('bgmVolumeVal');
    const checkSubs = document.getElementById('checkBurnSubtitles');

    if (transSel) {
      transSel.addEventListener('change', (e) => {
        this.currentTransition = e.target.value;
      });
    }

    if (bgmSel) {
      bgmSel.addEventListener('change', (e) => {
        this.currentBgm = e.target.value;
      });
    }

    if (volSlider && volVal) {
      volSlider.addEventListener('input', (e) => {
        this.bgmVolume = parseInt(e.target.value) / 100;
        volVal.textContent = `${e.target.value}%`;
      });
    }

    if (checkSubs) {
      checkSubs.addEventListener('change', (e) => {
        this.burnSubtitles = e.target.checked;
      });
    }
  },

  async renderAndExport() {
    const editorPlayer = document.getElementById('editorVideoSource') || document.getElementById('editorPreviewPlayer');
    const videoSrc = (editorPlayer && editorPlayer.src) ? editorPlayer.src : '/samples/cyberpunk_city.mp4';

    const btn = document.getElementById('btnExportFinalVideo') || document.getElementById('btnEditorRender');
    const originalText = btn ? btn.innerHTML : '';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-sm"></span> Compositing Tracks with FFmpeg...`;
    }

    if (window.VickyApp) {
      VickyApp.showToast('Rendering multi-track video composition with FFmpeg...', 'info');
    }

    try {
      let bgmFilename = this.currentBgm;
      if (this.currentBgm === 'synthwave') bgmFilename = 'ambient_tech.wav';
      else if (this.currentBgm === 'orchestral') bgmFilename = 'cinematic_epic.wav';
      else if (this.currentBgm === 'tollywood') bgmFilename = 'lofi_chill.wav';

      const transSel = document.getElementById('editorTransitionSelect');
      const transition = transSel ? transSel.value : this.currentTransition;

      const payload = {
        video_url: videoSrc,
        audio_url: window.VickyVoiceGen ? window.VickyVoiceGen.lastAudioUrl : null,
        bgm_url: bgmFilename !== 'none' ? `/audio/${bgmFilename}` : null,
        transition: transition,
        burn_subtitles: this.burnSubtitles
      };

      const apiEndpoint = (window.VickyConfig && window.VickyConfig.getApiUrl) ? window.VickyConfig.getApiUrl('/api/editor/render') : '/api/editor/render';
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to render unified video');
      }

      const outUrl = data.output_url || data.video_url || videoSrc;
      const filename = data.filename || `vicky_ai_master_${Date.now()}.mp4`;
      const downloadUrl = `/api/download?file=${encodeURIComponent(filename)}&name=${encodeURIComponent(filename)}`;

      // Update preview video
      if (editorPlayer) {
        editorPlayer.src = outUrl;
        editorPlayer.load();
        editorPlayer.play().catch(() => {});
      }

      // Trigger direct download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      if (window.VickyApp) {
        VickyApp.showToast('Master video rendered and downloaded successfully! (H.264 / AAC MP4)', 'success');
      }

      if (window.VickyProjects && typeof window.VickyProjects.loadProjects === 'function') {
        window.VickyProjects.loadProjects();
      }

    } catch (err) {
      console.error('Editor export error:', err);
      if (window.VickyApp) {
        VickyApp.showToast(`Rendering error: ${err.message}`, 'error');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText || `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
          <span>Render & Export MP4</span>
        `;
      }
    }
  },

  bindExport() {
    const btn = document.getElementById('btnExportFinalVideo') || document.getElementById('btnEditorRender');
    if (btn) {
      btn.addEventListener('click', () => this.renderAndExport());
    }
  }
};

window.VickyEditor = VickyEditor;

document.addEventListener('DOMContentLoaded', () => {
  VickyEditor.init();
});
