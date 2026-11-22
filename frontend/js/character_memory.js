/**
 * VICKY AI - Character Memory Module
 * Brand: VICKY AI - "ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE."
 * Maintains consistent characters across generated scenes using reference images and model conditioning.
 */

const VickyCharacterMemory = {
  // Pre-loaded cinematic characters
  characters: [
    {
      id: 'char_kalyan',
      name: 'Kalyan',
      archetype: 'Mass Cyberpunk Hero',
      avatar: '/samples/ai_robot_portrait_thumb.jpg',
      visual_traits: 'Athletic 30yo Indian hero, sharp jawline, intense focused gaze, silver-streaked dark hair, neon teal cybernetic visor, weathered leather tactical jacket with glowing purple accents',
      conditioning_tokens: '[Character: Kalyan, consistent male protagonist, futuristic Indian warrior, neon teal cyber visor, dark hair with silver streak, leather tactical jacket]',
      voice_profile: 'te-IN / Cinematic Male Deep',
      seed: 88421
    },
    {
      id: 'char_sita',
      name: 'Commander Sita',
      archetype: 'Galactic Commander',
      avatar: '/samples/cosmic_nebula_thumb.jpg',
      visual_traits: '32yo female commander, majestic silver braid hair, radiant amber eyes, sleek golden and midnight-blue composite space armor, calm authoritative presence',
      conditioning_tokens: '[Character: Commander Sita, consistent female protagonist, galactic commander, silver braided hair, golden celestial armor, amber eyes]',
      voice_profile: 'en-US-JennyNeural / Expressive Female',
      seed: 55219
    },
    {
      id: 'char_vikram',
      name: 'Dr. Vikram',
      archetype: 'Ancient Tech Archaeologist',
      avatar: '/samples/nature_waterfall_thumb.jpg',
      visual_traits: '38yo scholar adventurer, rimmed holographic monocle, weathered brown trench coat, antique bronze Vedic gauntlet, inquisitive intense expression',
      conditioning_tokens: '[Character: Dr. Vikram, consistent male adventurer, brown trench coat, antique bronze gauntlet, holographic monocle, rugged explorer]',
      voice_profile: 'en-IN-PrabhatNeural / Indian English',
      seed: 31415
    },
    {
      id: 'char_aria',
      name: 'Aria Kane',
      archetype: 'Neo-Tokyo Investigator',
      avatar: '/samples/cyberpunk_city_thumb.jpg',
      visual_traits: '26yo cyberpunk detective, sleek dark bob cut with electric-blue underlights, glowing violet cybernetic iris, black high-collar trench coat, transparent umbrella',
      conditioning_tokens: '[Character: Aria Kane, consistent female detective, cyber eye, blue highlights in dark bob, high collar trench coat, cyberpunk style]',
      voice_profile: 'en-GB-SoniaNeural / UK Expressive',
      seed: 92834
    }
  ],

  activeCharacterId: 'char_kalyan',

  async init() {
    const saved = localStorage.getItem('vicky_characters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.characters = parsed;
        }
      } catch (e) {}
    }

    // Also fetch latest from backend
    try {
      const apiEndpoint = (window.VickyConfig && window.VickyConfig.getApiUrl) ? window.VickyConfig.getApiUrl('/api/characters') : '/api/characters';
      const res = await fetch(apiEndpoint);
      if (res.ok) {
        const data = await res.json();
        if (data.characters && data.characters.length > 0) {
          this.characters = data.characters;
          this.save();
        }
      }
    } catch (e) {}

    const savedActive = localStorage.getItem('vicky_active_character');
    if (savedActive && this.getCharacter(savedActive)) {
      this.activeCharacterId = savedActive;
    }
    this.renderCharacterSelector();
  },

  getAll() {
    return this.characters;
  },

  getActive() {
    return this.characters.find(c => c.id === this.activeCharacterId) || this.characters[0];
  },

  getCharacter(id) {
    return this.characters.find(c => c.id === id);
  },

  setActive(id) {
    this.activeCharacterId = id;
    localStorage.setItem('vicky_active_character', id);
    this.renderCharacterSelector();
    this.notifyChange();
  },

  async addCharacter(char) {
    const newChar = {
      id: `char_${Date.now()}`,
      name: char.name || 'New Character',
      archetype: char.archetype || 'Protagonist',
      avatar: char.avatar || '/samples/ai_robot_portrait_thumb.jpg',
      visual_traits: char.visual_traits || 'Distinct cinematic hero traits',
      conditioning_tokens: `[Character: ${char.name}, ${char.visual_traits}]`,
      voice_profile: char.voice_profile || 'en-US-GuyNeural',
      seed: Math.floor(Math.random() * 90000) + 10000
    };
    this.characters.unshift(newChar);
    this.save();
    this.setActive(newChar.id);

    // Sync to backend
    try {
      const apiEndpoint = (window.VickyConfig && window.VickyConfig.getApiUrl) ? window.VickyConfig.getApiUrl('/api/characters') : '/api/characters';
      await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChar)
      });
    } catch (e) {}

    return newChar;
  },

  async deleteCharacter(id) {
    if (this.characters.length <= 1) {
      if (window.VickyApp) VickyApp.showToast('You must keep at least one character in your Character Memory.', 'error');
      else alert('You must keep at least one character in your Character Memory.');
      return;
    }
    this.characters = this.characters.filter(c => c.id !== id);
    if (this.activeCharacterId === id) {
      this.activeCharacterId = this.characters[0].id;
    }
    this.save();
    this.renderCharacterSelector();
    this.notifyChange();

    try {
      const delEndpoint = (window.VickyConfig && window.VickyConfig.getApiUrl) ? window.VickyConfig.getApiUrl(`/api/characters/${id}`) : `/api/characters/${id}`;
      await fetch(delEndpoint, { method: 'DELETE' });
    } catch (e) {}
  },

  save() {
    localStorage.setItem('vicky_characters', JSON.stringify(this.characters));
  },

  injectConditioning(prompt) {
    const active = this.getActive();
    if (!active) return prompt;
    // Inject consistency conditioning tokens
    return `${active.conditioning_tokens} ${prompt}`;
  },

  renderCharacterSelector(containerId = 'characterSelectorContainer') {
    const containers = document.querySelectorAll(`.${containerId}, #${containerId}`);
    containers.forEach(container => {
      if (!container) return;
      const active = this.getActive();
      container.innerHTML = `
        <div class="character-memory-bar">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="pulse-dot" style="background:#a855f7;"></span>
              <span style="font-size:0.85rem; font-weight:700; color:#e2e8f0; text-transform:uppercase; letter-spacing:0.05em;">Character Memory Lock</span>
            </div>
            <button type="button" class="btn-outline" style="padding:3px 8px; font-size:0.72rem; border-color:rgba(168,85,247,0.4);" onclick="VickyCharacterMemory.openCreateCharacterModal()">+ New Character</button>
          </div>

          <div class="character-card-list">
            ${this.characters.map(c => `
              <div class="character-pill ${c.id === this.activeCharacterId ? 'active' : ''}" onclick="VickyCharacterMemory.setActive('${c.id}')">
                <img src="${c.avatar}" class="char-avatar-mini" alt="${c.name}">
                <div class="char-meta">
                  <div class="char-name">${c.name}</div>
                  <div class="char-archetype">${c.archetype}</div>
                </div>
                ${c.id === this.activeCharacterId ? '<span class="char-locked-badge">LOCKED</span>' : ''}
              </div>
            `).join('')}
          </div>

          ${active ? `
            <div class="character-active-traits">
              <span style="color:#c084fc; font-weight:600;">Active Identity:</span> ${active.name} &bull; <span style="color:#94a3b8;">${active.visual_traits.slice(0, 110)}...</span>
            </div>
          ` : ''}
        </div>
      `;
    });
  },

  openCreateCharacterModal() {
    const name = prompt('Character Name:', 'Kalyan Neo');
    if (!name) return;
    const archetype = prompt('Archetype / Role:', 'Cyber Rebel');
    const traits = prompt('Physical Traits & Style (Hair, Outfit, Gear):', 'Sharp gaze, silver hair streak, glowing cyan cyber visor, dark trench coat');
    this.addCharacter({
      name,
      archetype,
      visual_traits: traits
    });
  },

  notifyChange() {
    if (window.VickyMovieMaker) VickyMovieMaker.onCharacterChanged();
    if (window.VickyStoryDirector) VickyStoryDirector.onCharacterChanged();
  }
};

window.VickyCharacterMemory = VickyCharacterMemory;
