/**
 * VICKY AI - AI Story Director (Part 5C)
 * Brand: VICKY AI - "ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE."
 * Automatically creates:
 * - Story premise & logline
 * - Screenplay script
 * - Scene breakdown with camera instructions
 * - Voiceover narration
 * - Synchronized SRT subtitles
 */

const VickyStoryDirector = {
  currentDirectorData: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const btnGen = document.getElementById('btnGenerateStoryDirector');
    if (btnGen) {
      btnGen.addEventListener('click', () => this.generateStory());
    }
  },

  onCharacterChanged() {
    // Optionally update active character in story director
  },

  async generateStory() {
    const promptInput = document.getElementById('storyDirectorPrompt');
    const prompt = (promptInput ? promptInput.value : '').trim();
    if (!prompt) {
      if (window.VickyApp) VickyApp.showToast('Please enter a story concept or logline for the AI Story Director.', 'error');
      else alert('Please enter a story concept or logline for the AI Story Director.');
      return;
    }

    const genre = document.getElementById('storyDirectorGenre')?.value || 'cinematic';
    const lang = document.getElementById('storyDirectorLang')?.value || 'english';
    const isTeluglish = lang === 'teluglish';
    const activeChar = window.VickyCharacterMemory ? VickyCharacterMemory.getActive() : null;

    const btn = document.getElementById('btnGenerateStoryDirector');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-sm"></span> Directing Story & Screenplay...`;
    }

    try {
      const apiEndpoint = (window.VickyConfig && window.VickyConfig.getApiUrl) ? window.VickyConfig.getApiUrl('/api/director/generate') : '/api/director/generate';
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          genre,
          language: isTeluglish ? 'teluglish' : lang,
          is_teluglish: isTeluglish,
          character_name: activeChar ? activeChar.name : null,
          character_traits: activeChar ? activeChar.visual_traits : null
        })
      });

      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.error || 'Failed to generate story direction.');
      }

      this.currentDirectorData = data;
      this.renderStoryDirectorUI(data);

    } catch (err) {
      if (window.VickyApp) VickyApp.showToast('Story Director error: ' + err.message, 'error');
      else alert('Story Director error: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
          <span>Direct Complete Story & Script</span>
        `;
      }
    }
  },

  renderStoryDirectorUI(data) {
    const container = document.getElementById('storyDirectorResultsContainer');
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = `
      <div class="director-output-card">
        <!-- Story Logline Banner -->
        <div class="director-logline-box">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
            <span class="pulse-dot" style="background:#00f0ff;"></span>
            <span class="director-badge">AI STORY DIRECTOR OUTPUT</span>
          </div>
          <h2 style="font-size:1.4rem; color:#ffffff; font-family:'Space Grotesk',sans-serif; margin-bottom:6px;">${data.title}</h2>
          <p style="color:#cbd5e1; font-size:0.92rem; line-height:1.5;"><strong>Logline:</strong> ${data.logline}</p>
          <div style="display:flex; gap:12px; margin-top:10px; font-size:0.8rem; color:#94a3b8;">
            <span>🎵 <strong>Music:</strong> ${data.background_music}</span>
            <span>⏱️ <strong>Est. Runtime:</strong> ${data.estimated_duration_sec}s</span>
            <span>👤 <strong>Protagonist:</strong> ${data.character.name}</span>
          </div>
        </div>

        <!-- Director Tabs -->
        <div class="director-tabs">
          <button class="director-tab-btn active" onclick="VickyStoryDirector.switchTab('breakdown', this)">Scene Breakdown (${data.scenes.length})</button>
          <button class="director-tab-btn" onclick="VickyStoryDirector.switchTab('screenplay', this)">Full Screenplay</button>
          <button class="director-tab-btn" onclick="VickyStoryDirector.switchTab('subtitles', this)">SRT Subtitles</button>
        </div>

        <!-- 1. Scene Breakdown Tab -->
        <div id="directorTabBreakdown" class="director-tab-content active">
          <div class="scene-director-grid">
            ${data.scenes.map(s => `
              <div class="director-scene-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span class="scene-act-pill">${s.act}</span>
                  <span style="font-size:0.75rem; color:#94a3b8; font-weight:600;">${s.duration_sec} seconds</span>
                </div>
                <h4 style="color:#ffffff; font-size:1rem; margin-bottom:8px;">${s.title}</h4>
                <div class="director-param">
                  <strong>🎥 Camera Instructions:</strong>
                  <p style="color:#38bdf8; font-size:0.85rem; margin-top:2px;">${s.camera_instruction}</p>
                </div>
                <div class="director-param">
                  <strong>🎨 Visual Prompt:</strong>
                  <p style="color:#cbd5e1; font-size:0.85rem; margin-top:2px;">${s.visual_prompt}</p>
                </div>
                <div class="director-param">
                  <strong>🎙️ Narration / Dialogue:</strong>
                  <p style="color:#f1f5f9; font-style:italic; font-size:0.88rem; margin-top:2px;">"${s.voiceover}"</p>
                </div>
                <div class="director-param">
                  <strong>💬 Subtitle Cue:</strong>
                  <p style="color:#fbbf24; font-size:0.82rem; margin-top:2px;">${s.subtitles}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 2. Screenplay Tab -->
        <div id="directorTabScreenplay" class="director-tab-content">
          <div class="screenplay-viewer">
            <pre style="white-space:pre-wrap; font-family:'Courier New', monospace; font-size:0.85rem; color:#e2e8f0; line-height:1.6;">${data.screenplay}</pre>
          </div>
        </div>

        <!-- 3. Subtitles Tab -->
        <div id="directorTabSubtitles" class="director-tab-content">
          <div class="subtitles-viewer">
            <pre style="white-space:pre-wrap; font-family:'Courier New', monospace; font-size:0.82rem; color:#38bdf8; line-height:1.5;">${data.srt_subtitles}</pre>
          </div>
        </div>

        <!-- Action Dispatchers -->
        <div class="director-actions-bar">
          <button class="btn-cta" onclick="VickyStoryDirector.pushToMovieMaker()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>Produce in One-Prompt Movie Maker</span>
          </button>
          <button class="btn-outline" onclick="VickyStoryDirector.pushToTeluguStudio()">
            <span>Send to Telugu AI Studio</span>
          </button>
          <button class="btn-outline" onclick="VickyStoryDirector.copyScreenplay()">
            <span>Copy Screenplay</span>
          </button>
          <button class="btn-outline" onclick="VickyStoryDirector.downloadSRT()">
            <span>Download .SRT</span>
          </button>
        </div>
      </div>
    `;
  },

  switchTab(tabName, btnEl) {
    document.querySelectorAll('.director-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.director-tab-content').forEach(c => c.classList.remove('active'));

    btnEl.classList.add('active');
    const target = document.getElementById(`directorTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (target) target.classList.add('active');
  },

  pushToMovieMaker() {
    if (!this.currentDirectorData) return;
    if (window.VickyApp) VickyApp.navigateTo('create-movie');
    if (window.VickyMovieMaker) {
      VickyMovieMaker.currentMovie = this.currentDirectorData;
      VickyMovieMaker.renderSceneTimeline(this.currentDirectorData);
      const produceBtn = document.getElementById('btnProduceMovie');
      if (produceBtn) produceBtn.disabled = false;
    }
  },

  pushToTeluguStudio() {
    if (!this.currentDirectorData) return;
    if (window.VickyApp) VickyApp.navigateTo('telugu-studio');
    const teluguText = document.getElementById('teluguScriptInput');
    if (teluguText) {
      teluguText.value = this.currentDirectorData.scenes.map(s => s.voiceover).join('\n\n');
    }
  },

  copyScreenplay() {
    if (!this.currentDirectorData) return;
    navigator.clipboard.writeText(this.currentDirectorData.screenplay);
    if (window.VickyApp) VickyApp.showToast('Screenplay copied to clipboard!', 'success');
    else alert('Screenplay copied to clipboard!');
  },

  downloadSRT() {
    if (!this.currentDirectorData) return;
    const blob = new Blob([this.currentDirectorData.srt_subtitles], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentDirectorData.title.replace(/[^a-zA-Z0-9]/g, '_')}_subtitles.srt`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

window.VickyStoryDirector = VickyStoryDirector;
