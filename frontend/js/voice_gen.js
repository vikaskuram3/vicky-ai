/**
 * VICKY AI - Voice Generator & Subtitles Controller
 * Synthesizes free neural voiceovers, displays word timestamps, and triggers downloads.
 */

const VickyVoiceGen = {
  lastAudioUrl: null,
  lastSrtUrl: null,

  init() {
    const btnSyn = document.getElementById('btnSynthesizeVoice');
    if (btnSyn) {
      btnSyn.addEventListener('click', () => this.synthesizeVoice());
    }
  },

  async synthesizeVoice() {
    const text = document.getElementById('voiceTextInput').value.trim();
    const voice = document.getElementById('voiceActorSelect').value;

    if (!text) {
      VickyApp.showToast('Please enter text for the voiceover.', 'error');
      return;
    }

    VickyApp.showToast('Generating neural voiceover and synchronized subtitles...', 'info');

    try {
      const res = await fetch('/api/generate/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice })
      });

      const data = await res.json();
      this.lastAudioUrl = data.audio_url;
      this.lastSrtUrl = data.srt_url;

      // Update Audio Player
      const player = document.getElementById('voiceAudioPlayer');
      if (player) {
        player.src = data.audio_url;
        player.load();
        player.play().catch(() => {});
      }

      // Update Download Links
      const btnAudio = document.getElementById('btnDownloadVoice');
      const btnSrt = document.getElementById('btnDownloadSrt');
      if (btnAudio) btnAudio.href = data.audio_url;
      if (btnSrt) btnSrt.href = data.srt_url;

      // Render Cues
      const cuesList = document.getElementById('subtitlesList');
      if (cuesList && data.cues) {
        cuesList.innerHTML = data.cues.map(c => `
          <div style="padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
            <span style="color:var(--accent-primary);">[${c.start}s - ${c.end}s]</span>: "${c.text}"
          </div>
        `).join('');
      }

      const resultBox = document.getElementById('voiceResultBox');
      if (resultBox) resultBox.style.display = 'block';

      VickyApp.showToast('Voiceover & subtitles successfully generated!', 'success');
    } catch (err) {
      console.error('Voice generation error:', err);
      VickyApp.showToast('Voiceover synthesis failed. Check console.', 'error');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  VickyVoiceGen.init();
});
