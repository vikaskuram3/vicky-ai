/**
 * VICKY AI - Telugu AI Studio (Part 5D)
 * Brand: VICKY AI - "ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE."
 * Dedicated AI studio for Telugu Cinema (Tollywood) & Telugu Content Creators.
 * Supports:
 * - Pure Telugu narration & script
 * - Telugu-English mixed scripts ("Teluglish")
 * - 5 Tollywood cinematic presets (Mass Hero, Emotional, Sci-Fi 2050, Mythological, Village Action)
 * - Authentic Telugu voiceover synthesis and stylized Telugu subtitles.
 */

const VickyTeluguStudio = {
  activePreset: 'mass_hero',
  isSpeaking: false,

  presets: {
    mass_hero: {
      name: 'Mass Hero Elevation (హీరో ఎలివేషన్)',
      script_telugu: 'ఒక్క అడుగు ముందుకు వేస్తే చరిత్ర తిరగరాయడం ఖాయం. భయమనే పదం నా నిఘంటువులోనే లేదు!',
      script_teluglish: 'Mass elevation at its peak! Hero screen loki enter avvagane theatre lo goosebumps guarantee!',
      camera_prompt: 'Extreme low-angle slow-motion hero entry, dust storm explosion, fiery golden backlight, 24fps anamorphic lens',
      music: 'Thumping Dholak, Heavy Brass Elevation Horns & Electric Sitar'
    },
    emotional_flashback: {
      name: 'Emotional Flashback (ఎమోషనల్ ఫ్లాష్‌బ్యాక్)',
      script_telugu: 'కొన్ని బంధాలు కాలానికి అతీతం. ఎక్కడున్నా ఆ జ్ఞాపకాలు ఎప్పటికీ మనతోనే ఉంటాయి.',
      script_teluglish: 'Memory flashback scene... Prathi emotion gundello deep ga touch avthundi. Unforgettable nostalgic feel.',
      camera_prompt: 'Warm nostalgic sepia tone, soft rain particles on window, golden sunset backlight, 85mm portrait tracking',
      music: 'Soulful Acoustic Violin & Gentle Rain Melody'
    },
    scifi_andhra: {
      name: 'Sci-Fi Andhra 2050 (సైన్స్ ఫిక్షన్ 2050)',
      script_telugu: '2050 లో హైదరాబాద్ మరియు అమరావతి ఆకాశంలో తేలియాడే నగరాలు. క్వాంటమ్ యుగం కొత్త చరిత్ర రాస్తోంది.',
      script_teluglish: 'Cyberpunk Neo-Hyderabad lo quantum core activate aindi. Flying hyper-cars and neon temples in 2050!',
      camera_prompt: 'High altitude drone sweep over holographic cyberpunk temples, flying vehicles, neon purple & cyan aura',
      music: 'Pulsing Cyber Synthwave with Indian Percussion'
    },
    mythological_epic: {
      name: 'Mythological Epic (పౌరాణిక కావ్యం)',
      script_telugu: 'అధర్మం పెచ్చుమీరినప్పుడు... ధర్మ రక్షణ కోసం దివ్య అస్త్రాలు మేల్కొంటాయి. ఇది సత్య విజయం!',
      script_teluglish: 'Ancient Vedic kingdom lo divine cosmic energy unlock aindi. Grand golden palaces and radiant celestial astras.',
      camera_prompt: 'Majestic golden celestial kingdom, divine radiant lighting, glowing cosmic energy astras, 8K epic cinematography',
      music: 'Sacred Sanskrit Chants, Temple Shankham & Thunderous Damru'
    },
    village_action: {
      name: 'Village Action Thriller (పల్లెటూరి యాక్షన్)',
      script_telugu: 'ఈ నేల మీద అడుగుపెట్టిన వాడికి మాట తప్పడం రాదు. న్యాయం కోసం గొడ్డలి పట్టిన పల్లె వీరుడు!',
      script_teluglish: 'Raw rustic Rayalaseema action! Dust storm, intense revenge drama and uncompromising village power.',
      camera_prompt: 'Rustic red soil explosion, dust storm, intense sun flare, handheld camera tracking raw rustic action',
      music: 'High BPM Rural Folk Drums & Heavy Sub-Bass'
    }
  },

  init() {
    this.bindEvents();
    this.selectPreset('mass_hero');
  },

  bindEvents() {
    const btnProduce = document.getElementById('btnProduceTeluguVideo');
    if (btnProduce) {
      btnProduce.addEventListener('click', () => this.produceTeluguVideo());
    }

    const btnSpeak = document.getElementById('btnListenTeluguVoice');
    if (btnSpeak) {
      btnSpeak.addEventListener('click', () => this.previewTeluguVoice());
    }
  },

  selectPreset(presetKey) {
    this.activePreset = presetKey;
    const preset = this.presets[presetKey];
    if (!preset) return;

    // Update active pill styling
    document.querySelectorAll('.telugu-preset-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-preset') === presetKey);
    });

    const isTeluglish = document.getElementById('teluguModeToggle')?.checked;
    const scriptBox = document.getElementById('teluguScriptInput');
    const promptBox = document.getElementById('teluguVisualPrompt');
    const bgmLabel = document.getElementById('teluguBgmLabel');

    if (scriptBox) {
      scriptBox.value = isTeluglish ? preset.script_teluglish : preset.script_telugu;
    }
    if (promptBox) {
      promptBox.value = preset.camera_prompt;
    }
    if (bgmLabel) {
      bgmLabel.textContent = preset.music;
    }
  },

  toggleLanguageMode(isTeluglish) {
    const preset = this.presets[this.activePreset];
    const scriptBox = document.getElementById('teluguScriptInput');
    if (preset && scriptBox) {
      scriptBox.value = isTeluglish ? preset.script_teluglish : preset.script_telugu;
    }
  },

  insertTemplate(text) {
    const scriptBox = document.getElementById('teluguScriptInput');
    if (scriptBox) {
      scriptBox.value = text;
    }
  },

  // Preview Telugu speech synthesis using Web Speech API
  previewTeluguVoice() {
    const script = document.getElementById('teluguScriptInput')?.value.trim();
    if (!script) {
      if (window.VickyApp) VickyApp.showToast('Please enter Telugu script text to preview voice.', 'error');
      else alert('Please enter Telugu script text to preview voice.');
      return;
    }

    if (!('speechSynthesis' in window)) {
      if (window.VickyApp) VickyApp.showToast('Web Speech API is not supported in this browser. Voiceover will be synthesized on the server.', 'info');
      else alert('Web Speech API is not supported in this browser. Voiceover will be synthesized on the server.');
      return;
    }

    if (this.isSpeaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      const btn = document.getElementById('btnListenTeluguVoice');
      if (btn) btn.innerHTML = `<span>🔊 Test Telugu Voiceover</span>`;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(script);
    // Find Telugu voice or Indian English
    const voices = window.speechSynthesis.getVoices();
    const teluguVoice = voices.find(v => v.lang === 'te-IN' || v.lang.startsWith('te')) ||
                         voices.find(v => v.lang === 'en-IN') ||
                         voices[0];

    if (teluguVoice) utterance.voice = teluguVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const btn = document.getElementById('btnListenTeluguVoice');
    if (btn) btn.innerHTML = `<span>⏹️ Stop Voiceover</span>`;
    this.isSpeaking = true;

    utterance.onend = () => {
      this.isSpeaking = false;
      if (btn) btn.innerHTML = `<span>🔊 Test Telugu Voiceover</span>`;
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
      if (btn) btn.innerHTML = `<span>🔊 Test Telugu Voiceover</span>`;
    };

    window.speechSynthesis.speak(utterance);
  },

  // 1-Click Produce Telugu Cinematic Video
  async produceTeluguVideo() {
    const script = document.getElementById('teluguScriptInput')?.value.trim();
    const visualPrompt = document.getElementById('teluguVisualPrompt')?.value.trim();
    const aspect = document.getElementById('teluguAspectSelect')?.value || '16:9';
    const isTeluglish = document.getElementById('teluguModeToggle')?.checked;
    const btn = document.getElementById('btnProduceTeluguVideo');
    const resultBox = document.getElementById('teluguResultBox');

    if (!script) {
      if (window.VickyApp) VickyApp.showToast('Please enter a Telugu narration script.', 'error');
      else alert('Please enter a Telugu narration script.');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-sm"></span> Generating Telugu Cinematic Video...`;
    }

    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div class="render-progress-card">
          <div class="render-status-title">
            <span class="pulse-dot" style="background:#fbbf24;"></span>
            <span>Synthesizing Tollywood Cinematic Visuals & Telugu Audio...</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: 45%;"></div>
          </div>
          <div class="render-step-label">Rendering dynamic mass elevation camera and burning Telugu subtitles...</div>
        </div>
      `;
    }

    try {
      const activeChar = window.VickyCharacterMemory ? VickyCharacterMemory.getActive() : null;
      const res = await fetch('/api/generate/movie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Tollywood cinema: ${visualPrompt || script.slice(0, 80)}`,
          aspect_ratio: aspect,
          transition: 'crossfade',
          character_name: activeChar ? activeChar.name : 'Tollywood Hero',
          character_traits: activeChar ? activeChar.visual_traits : 'Intense heroic mass presence',
          genre: 'telugu_mass',
          language: isTeluglish ? 'teluglish' : 'telugu',
          is_teluglish: isTeluglish
        })
      });

      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.error || 'Failed to produce Telugu video.');
      }

      if (resultBox) {
        resultBox.innerHTML = `
          <div class="movie-completed-box" style="border-color:rgba(251, 191, 36, 0.4);">
            <div class="movie-success-banner" style="background:linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(239, 68, 68, 0.2)); color:#fef08a;">
              🎬 Telugu AI Cinematic Video Generated! (${data.duration_sec}s &bull; ${data.resolution} &bull; H.264 MP4)
            </div>

            <div class="movie-player-wrapper">
              <video src="${data.video_url}" controls autoplay playsinline class="movie-video-element"></video>
            </div>

            <!-- Telugu Script & Subtitle Preview -->
            <div style="background:rgba(15,23,42,0.8); border:1px solid rgba(251,191,36,0.3); border-radius:12px; padding:16px; margin:16px 0; text-align:left;">
              <div style="font-size:0.75rem; text-transform:uppercase; color:#fbbf24; font-weight:700; margin-bottom:6px;">Synced Telugu Narration:</div>
              <p style="font-size:1.05rem; line-height:1.6; color:#ffffff; font-family:'Noto Sans Telugu', sans-serif;">${script}</p>
            </div>

            <div class="movie-action-bar">
              <a href="/api/download?file=${data.filename}&name=Telugu_Cinema_${this.activePreset}.mp4" class="btn-cta" style="background:linear-gradient(135deg, #f59e0b, #ef4444); padding:10px 20px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Download Telugu Video (MP4)</span>
              </a>
              <button class="btn-outline" onclick="VickyMovieMaker.sendToEditor('${data.video_url}')">Edit in Video Editor</button>
              <button class="btn-outline" onclick="VickyMovieMaker.sendToThumbnail('${encodeURIComponent(script.slice(0, 25))}')">Generate Poster Thumbnail</button>
            </div>
          </div>
        `;
      }

      // Refresh project list
      if (window.VickyProjects) VickyProjects.loadProjects();

    } catch (err) {
      if (resultBox) {
        resultBox.innerHTML = `
          <div class="alert-banner error" style="display:block;">
            Failed to generate Telugu video: ${err.message}
          </div>
        `;
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>Produce Telugu Cinematic Video</span>
        `;
      }
    }
  }
};

window.VickyTeluguStudio = VickyTeluguStudio;
