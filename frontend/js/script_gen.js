/**
 * VICKY AI - AI Script Generator Controller
 * Generates structured video scripts and enables 1-click video + voiceover conversion.
 */

const VickyScriptGen = {
  lastGeneratedScript: null,

  init() {
    const btnGen = document.getElementById('btnGenerateScript');
    if (btnGen) {
      btnGen.addEventListener('click', () => this.generateScript());
    }

    const btnProduce = document.getElementById('btnSendScriptToVideo');
    if (btnProduce) {
      btnProduce.addEventListener('click', () => this.produceScript());
    }
  },

  async generateScript() {
    const topic = document.getElementById('scriptTopicInput').value.trim();
    const style = document.getElementById('scriptStyleSelect').value;
    const platform = document.getElementById('scriptPlatformSelect').value;

    if (!topic) {
      VickyApp.showToast('Please enter a video topic or concept.', 'error');
      return;
    }

    VickyApp.showToast('Synthesizing professional video script...', 'info');

    try {
      const res = await fetch('/api/generate/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, style, platform })
      });

      const script = await res.json();
      this.lastGeneratedScript = script;
      this.renderScript(script);
      VickyApp.showToast('AI Video Script generated successfully!', 'success');
    } catch (err) {
      console.error('Script generation error:', err);
      VickyApp.showToast('Failed to generate script. Please try again.', 'error');
    }
  },

  renderScript(script) {
    const container = document.getElementById('scriptResultContainer');
    const titleEl = document.getElementById('scriptResultTitle');
    const badgeEl = document.getElementById('scriptMetaBadge');
    const scenesList = document.getElementById('scriptScenesList');

    if (!container || !scenesList) return;

    titleEl.textContent = script.title;
    badgeEl.textContent = `Est. Duration: ${script.estimated_duration_sec}s • Style: ${script.style.toUpperCase()}`;

    scenesList.innerHTML = '';
    script.scenes.forEach(s => {
      const card = document.createElement('div');
      card.style.background = 'var(--bg-card)';
      card.style.border = '1px solid var(--border-subtle)';
      card.style.borderRadius = 'var(--radius-md)';
      card.style.padding = '16px';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = '8px';

      card.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:6px;">
          <span style="font-weight:700; color:var(--accent-primary);">Scene ${s.scene}: ${s.title}</span>
          <span style="font-size:0.75rem; color:var(--text-muted);">${s.duration_sec}s</span>
        </div>
        <div style="font-size:0.85rem;">
          <strong style="color:var(--text-secondary);">Visual Prompt:</strong> ${s.visual_prompt}
        </div>
        <div style="font-size:0.85rem;">
          <strong style="color:var(--text-secondary);">Camera Kinematics:</strong> <span style="color:#38bdf8;">${s.camera_motion}</span>
        </div>
        <div style="font-size:0.85rem; background:rgba(0,0,0,0.25); padding:8px; border-radius:var(--radius-sm);">
          <strong style="color:var(--success);">Voiceover Line:</strong> "${s.voiceover}"
        </div>
      `;
      scenesList.appendChild(card);
    });

    container.style.display = 'block';
  },

  async produceScript() {
    if (!this.lastGeneratedScript) return;

    VickyApp.showToast('Routing script to Voice Synthesizer & Video Generator...', 'info');

    // 1. Put prompt into generator
    const firstScene = this.lastGeneratedScript.scenes[0];
    const promptInput = document.getElementById('promptInput');
    if (promptInput) {
      promptInput.value = firstScene.visual_prompt;
    }

    // 2. Put full voiceover into voice generator
    const voiceInput = document.getElementById('voiceTextInput');
    if (voiceInput) {
      voiceInput.value = this.lastGeneratedScript.full_voiceover_script;
    }

    // Navigate to studio generator
    VickyApp.navigateTo('generator');
    VickyGenerator.generateVideo(firstScene.visual_prompt, 'text-to-video');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  VickyScriptGen.init();
});
