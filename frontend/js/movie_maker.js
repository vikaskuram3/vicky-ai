/**
 * VICKY AI - ONE-PROMPT MOVIE MAKER (Part 5A)
 * Brand: VICKY AI - "ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE."
 * Converts one text prompt into a complete multi-scene video with consistent characters,
 * narrative structure, camera motion, narration, and subtitles.
 */

const VickyMovieMaker = {
  currentMovie: null,
  isGenerating: false,
  activeSceneIndex: 0,

  init() {
    this.bindEvents();
    if (window.VickyCharacterMemory) {
      VickyCharacterMemory.renderCharacterSelector('movieCharacterSelector');
    }
  },

  bindEvents() {
    const btnDeconstruct = document.getElementById('btnDeconstructMovie');
    if (btnDeconstruct) {
      btnDeconstruct.addEventListener('click', () => this.deconstructPrompt());
    }

    const btnGenerate = document.getElementById('btnProduceMovie');
    if (btnGenerate) {
      btnGenerate.addEventListener('click', () => this.produceMovie());
    }
  },

  onCharacterChanged() {
    if (this.currentMovie && this.currentMovie.prompt) {
      // Refresh character badge
      const activeChar = VickyCharacterMemory.getActive();
      const badge = document.getElementById('movieActiveCharBadge');
      if (badge && activeChar) {
        badge.textContent = `Character Locked: ${activeChar.name}`;
      }
    }
  },

  // 1. Convert one prompt into multi-scene breakdown
  async deconstructPrompt() {
    const promptInput = document.getElementById('moviePromptInput');
    const prompt = (promptInput ? promptInput.value : '').trim();
    if (!prompt) {
      if (window.VickyApp) VickyApp.showToast('Please enter a story prompt for your movie.', 'error');
      else alert('Please enter a story prompt for your movie.');
      return;
    }

    const genre = document.getElementById('movieGenreSelect')?.value || 'cinematic';
    const language = document.getElementById('movieLangSelect')?.value || 'english';
    const isTeluglish = language === 'teluglish';
    const activeChar = window.VickyCharacterMemory ? VickyCharacterMemory.getActive() : null;

    const btn = document.getElementById('btnDeconstructMovie');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-sm"></span> Deconstructing Story into Acts...`;
    }

    try {
      const apiEndpoint = (window.VickyConfig && window.VickyConfig.getApiUrl) ? window.VickyConfig.getApiUrl('/api/director/generate') : '/api/director/generate';
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          genre,
          language: isTeluglish ? 'teluglish' : language,
          is_teluglish: isTeluglish,
          character_name: activeChar ? activeChar.name : null,
          character_traits: activeChar ? activeChar.visual_traits : null
        })
      });

      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.error || 'Failed to analyze story breakdown.');
      }

      this.currentMovie = data;
      this.currentMovie.prompt = prompt;
      this.renderSceneTimeline(data);

      const produceBtn = document.getElementById('btnProduceMovie');
      if (produceBtn) produceBtn.disabled = false;

    } catch (err) {
      if (window.VickyApp) VickyApp.showToast('Story deconstruction error: ' + err.message, 'error');
      else alert('Story deconstruction error: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span>Deconstruct & Plan Scenes</span>
        `;
      }
    }
  },

  // 2. Render multi-scene breakdown cards
  renderSceneTimeline(directorData) {
    const container = document.getElementById('movieSceneTimelineContainer');
    if (!container) return;

    const scenes = directorData.scenes || [];
    container.innerHTML = `
      <div class="movie-breakdown-card">
        <div class="movie-meta-header">
          <div>
            <h3 class="movie-logline-title">${directorData.title}</h3>
            <p class="movie-logline-desc"><strong>Logline:</strong> ${directorData.logline}</p>
          </div>
          <div class="movie-stats-pill">
            <span>🎬 ${scenes.length} Scenes</span>
            <span>⏱️ ${directorData.estimated_duration_sec}s Total</span>
            <span id="movieActiveCharBadge" style="color:#00f0ff;">Character: ${directorData.character?.name || 'Locked'}</span>
          </div>
        </div>

        <div class="scene-cards-grid">
          ${scenes.map((s, idx) => `
            <div class="scene-card" id="sceneCard_${idx}">
              <div class="scene-card-header">
                <span class="scene-act-badge">${s.act}</span>
                <span class="scene-timing-badge">${s.duration_sec}s</span>
              </div>
              <div class="scene-title">${s.title}</div>
              <div class="scene-field">
                <span class="scene-label">📷 Camera:</span>
                <span class="scene-val">${s.camera_instruction}</span>
              </div>
              <div class="scene-field">
                <span class="scene-label">🎨 Visual:</span>
                <span class="scene-val">${s.visual_prompt.slice(0, 95)}...</span>
              </div>
              <div class="scene-field">
                <span class="scene-label">🎙️ Narration:</span>
                <span class="scene-val" style="color:#e2e8f0; font-style:italic;">"${s.voiceover}"</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 3. Produce Complete Movie: Render multi-scene MP4
  async produceMovie() {
    if (!this.currentMovie || !this.currentMovie.scenes) {
      if (window.VickyApp) VickyApp.showToast('Please deconstruct a story prompt into scenes first.', 'error');
      else alert('Please deconstruct a story prompt into scenes first.');
      return;
    }

    const btn = document.getElementById('btnProduceMovie');
    const statusBox = document.getElementById('movieRenderStatus');
    const aspect = document.getElementById('movieAspectSelect')?.value || '16:9';
    const transition = document.getElementById('movieTransitionSelect')?.value || 'crossfade';
    const activeChar = window.VickyCharacterMemory ? VickyCharacterMemory.getActive() : null;

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-sm"></span> Synthesizing Complete Movie...`;
    }

    if (statusBox) {
      statusBox.style.display = 'block';
      statusBox.innerHTML = `
        <div class="render-progress-card">
          <div class="render-status-title">
            <span class="pulse-dot"></span>
            <span>Synthesizing Multi-Scene Movie with H.264 & AAC Streams...</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" id="movieProgressFill" style="width: 25%;"></div>
          </div>
          <div class="render-step-label" id="movieProgressLabel">Rendering Scene 1: Camera push-in and particle kinematics...</div>
        </div>
      `;
    }

    // Animate progress simulation while worker synthesizes
    let p = 25;
    const interval = setInterval(() => {
      p = Math.min(p + 15, 90);
      const fill = document.getElementById('movieProgressFill');
      const label = document.getElementById('movieProgressLabel');
      if (fill) fill.style.width = `${p}%`;
      if (label) {
        if (p < 50) label.textContent = 'Rendering Scene 2: Parallax orbit and character style injection...';
        else if (p < 75) label.textContent = 'Rendering Scene 3: Climax elevation burst and transition crossfade...';
        else label.textContent = 'Finalizing container: Multiplexing H.264 video, AAC audio, and subtitle tracks...';
      }
    }, 1200);

    try {
      const apiEndpoint = (window.VickyConfig && window.VickyConfig.getApiUrl) ? window.VickyConfig.getApiUrl('/api/generate/movie') : '/api/generate/movie';
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: this.currentMovie.prompt,
          aspect_ratio: aspect,
          transition: transition,
          scenes: this.currentMovie.scenes,
          character_name: activeChar ? activeChar.name : null,
          character_traits: activeChar ? activeChar.visual_traits : null,
          genre: this.currentMovie.genre || 'cinematic',
          language: this.currentMovie.language || 'english',
          is_teluglish: this.currentMovie.is_teluglish
        })
      });

      clearInterval(interval);
      const movieResult = await res.json();

      if (!res.ok || movieResult.status !== 'success') {
        throw new Error(movieResult.error || 'Failed to render movie.');
      }

      // Display Final Video Player
      if (statusBox) {
        statusBox.innerHTML = `
          <div class="movie-completed-box">
            <div class="movie-success-banner">
              ✨ Complete Movie Generated Successfully! (${movieResult.scene_count} Scenes &bull; ${movieResult.duration_sec}s &bull; ${movieResult.resolution})
            </div>
            
            <div class="movie-player-wrapper">
              <video id="moviePlayer" src="${movieResult.video_url}" controls autoplay playsinline class="movie-video-element"></video>
            </div>

            <div class="movie-action-bar">
              <a href="/api/download?file=${movieResult.filename}&name=${encodeURIComponent(this.currentMovie.title)}.mp4" class="btn-cta" style="padding:10px 20px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Download Complete Movie (MP4)</span>
              </a>
              <button class="btn-outline" onclick="VickyMovieMaker.sendToEditor('${movieResult.video_url}')">Open in Video Editor</button>
              <button class="btn-outline" onclick="VickyMovieMaker.sendToThumbnail('${encodeURIComponent(this.currentMovie.title)}')">Create Thumbnail</button>
            </div>
          </div>
        `;
      }

      // Refresh My Creations if present
      if (window.VickyProjects) VickyProjects.loadProjects();

    } catch (err) {
      clearInterval(interval);
      if (statusBox) {
        statusBox.innerHTML = `
          <div class="alert-banner error" style="display:block;">
            Failed to render movie: ${err.message}
          </div>
        `;
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>Produce Complete Movie</span>
        `;
      }
    }
  },

  sendToEditor(videoUrl) {
    if (window.VickyApp) VickyApp.navigateTo('video-editor');
    const editorVideo = document.getElementById('editorVideoSource');
    if (editorVideo) {
      editorVideo.src = videoUrl;
      editorVideo.load();
    }
  },

  sendToThumbnail(title) {
    if (window.VickyApp) VickyApp.navigateTo('thumbnail-generator');
    const titleInput = document.getElementById('thumbTextMain');
    if (titleInput) {
      titleInput.value = decodeURIComponent(title).toUpperCase();
      if (window.VickyThumbnailStudio) VickyThumbnailStudio.render();
    }
  }
};

window.VickyMovieMaker = VickyMovieMaker;
