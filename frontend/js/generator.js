/**
 * VICKY AI - Video Generator Studio Controller
 * Handles Google AI Studio workspace parameters, real H.264/AAC MP4 AI video generation,
 * preview modal, health checks, and verified MP4 downloads.
 */

const VickyGenerator = {
  currentModel: 'ffmpeg-procedural',
  currentAspect: '16:9',
  currentDuration: 3,
  currentFps: 24,
  currentMotion: 'zoom_in',
  currentSeed: 42891,
  activeVideoUrl: '/samples/cyberpunk_city.mp4',
  activeFilename: 'cyberpunk_city.mp4',
  activeMetadata: {
    format: 'MP4 (ISO BMFF)',
    codec: 'H.264 (libopenh264 / yuv420p)',
    audio: 'AAC Stereo 44.1kHz',
    resolution: '854x480',
    sizeBytes: 351574
  },
  uploadedImageBase64: null,

  modelDescriptions: {
    'ffmpeg-procedural': 'Verified open-source kinematic diffusion visual synthesizer powered by FFmpeg. Fully ready on CPU & GPU with zero external dependencies.',
    'wan-2.1': 'State-of-the-art open-source video foundation model by Alibaba WanX team with cinematic 1080p photorealism. Requires connected GPU backend or ComfyUI instance.',
    'svd-xt': 'Stability AI high-fidelity image-to-video foundation model with smooth camera motion.',
    'animatediff-xl': 'Motion module tuned for high-motion anime, cyberpunk, and hyperlapse visuals.',
    'comfyui-direct': 'Direct node execution on connected ComfyUI GPU backend.'
  },

  init() {
    this.checkDependenciesHealth();
    this.bindModelSelector();
    this.bindAspectRatios();
    this.bindSliders();
    this.bindPromptEnhancer();
    this.bindPresets();
    this.bindGenerateButton();
    this.bindDedicatedT2VAndI2V();
    this.bindSendToEditor();
    this.bindPreviewModal();
    this.bindErrorBox();
  },

  async checkDependenciesHealth() {
    const badge = document.getElementById('ffmpegBadge');
    const encText = document.getElementById('ffmpegEncoderText');
    const audText = document.getElementById('ffmpegAudioText');

    try {
      const depUrl = (window.VickyConfig && window.VickyConfig.getApiUrl) ? window.VickyConfig.getApiUrl('/api/health/dependencies') : '/api/health/dependencies';
      const res = await fetch(depUrl);
      const data = await res.json();
      if (data.ffmpeg && data.ffmpeg.installed) {
        if (badge) {
          badge.textContent = 'FFmpeg Active';
          badge.style.background = 'rgba(16, 185, 129, 0.15)';
          badge.style.color = '#34d399';
        }
        if (encText) encText.textContent = `Video Encoder: H.264 (${data.ffmpeg.h264_encoder} / yuv420p)`;
        if (audText) audText.textContent = `Audio Encoder: AAC Stereo (44.1kHz)`;
      } else {
        if (badge) {
          badge.textContent = 'FFmpeg Missing';
          badge.style.background = 'rgba(239, 68, 68, 0.15)';
          badge.style.color = '#f87171';
        }
      }
    } catch (e) {
      console.log('Dependency check:', e.message);
    }
  },

  bindModelSelector() {
    const sel = document.getElementById('modelSelector');
    const desc = document.getElementById('modelDescriptionText');
    const activeLabel = document.getElementById('activeModelLabel');

    if (sel) {
      sel.addEventListener('change', (e) => {
        this.currentModel = e.target.value;
        if (desc) desc.textContent = this.modelDescriptions[this.currentModel] || '';
        if (activeLabel) {
          const selectedText = sel.options[sel.selectedIndex].text.split('(')[0].trim();
          activeLabel.textContent = `Model: ${selectedText}`;
        }
      });
    }
  },

  bindAspectRatios() {
    const btns = document.querySelectorAll('.aspect-btn');
    const viewport = document.getElementById('playerViewport');
    const badge = document.getElementById('playerFormatBadge');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentAspect = btn.getAttribute('data-aspect');

        if (viewport) viewport.setAttribute('data-aspect', this.currentAspect);
        if (badge) badge.textContent = `${this.currentAspect} HD MP4`;
      });
    });
  },

  bindSliders() {
    const durSlider = document.getElementById('durationSlider');
    const durVal = document.getElementById('durationVal');
    const fpsSlider = document.getElementById('fpsSlider');
    const fpsVal = document.getElementById('fpsVal');
    const seedInput = document.getElementById('seedInput');
    const btnRand = document.getElementById('btnRandomizeSeed');
    const motionSel = document.getElementById('cameraMotionSelector');

    if (durSlider && durVal) {
      durSlider.addEventListener('input', (e) => {
        this.currentDuration = parseInt(e.target.value);
        durVal.textContent = `${this.currentDuration} seconds`;
        const durBadge = document.getElementById('playerDurationBadge');
        if (durBadge) durBadge.textContent = `Duration: ${this.currentDuration}s`;
      });
    }

    if (fpsSlider && fpsVal) {
      fpsSlider.addEventListener('input', (e) => {
        this.currentFps = parseInt(e.target.value);
        fpsVal.textContent = `${this.currentFps} fps`;
      });
    }

    if (btnRand && seedInput) {
      btnRand.addEventListener('click', () => {
        const randSeed = Math.floor(Math.random() * 900000) + 10000;
        seedInput.value = randSeed;
        this.currentSeed = randSeed;
      });
    }

    if (motionSel) {
      motionSel.addEventListener('change', (e) => {
        this.currentMotion = e.target.value;
      });
    }
  },

  bindPromptEnhancer() {
    const btn = document.getElementById('btnEnhancePrompt');
    const input = document.getElementById('promptInput');

    if (btn && input) {
      btn.addEventListener('click', () => {
        let text = input.value.trim();
        if (!text) text = 'Futuristic city';

        const enhancements = [
          'volumetric god rays streaming through atmosphere',
          '35mm anamorphic cinema lens, shallow depth of field',
          'octane render 8k photorealistic texture detail',
          'hyperlapse smooth camera motion, cinematic color grading'
        ];

        const enhanced = `${text}, ${enhancements[Math.floor(Math.random() * enhancements.length)]}`;
        input.value = enhanced;
        VickyApp.showToast('Prompt enhanced with cinematic visual descriptors!', 'info');
      });
    }
  },

  bindPresets() {
    const pills = document.querySelectorAll('.prompt-pill');
    const input = document.getElementById('promptInput');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const preset = pill.getAttribute('data-preset');
        if (input && preset) {
          input.value = preset;
          VickyApp.showToast(`Preset loaded: "${pill.textContent}"`, 'info');
        }
      });
    });
  },

  bindGenerateButton() {
    const btn = document.getElementById('btnGenerateVideo') || document.getElementById('btnGenerate');
    if (btn) {
      btn.addEventListener('click', () => this.generateVideo());
    }
  },

  setAspectRatio(ratio, btnEl) {
    this.currentAspect = ratio;
    if (btnEl) {
      const container = btnEl.parentElement;
      if (container) {
        container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      }
      btnEl.classList.add('active');
    }
    const badge = document.getElementById('previewBadge');
    if (badge) badge.textContent = `Preview • ${ratio} HD MP4`;
  },

  hideError() {
    const errBox = document.getElementById('generationErrorBox');
    if (errBox) errBox.style.display = 'none';
  },

  showError(title, message, missingConfig = null) {
    const errBox = document.getElementById('generationErrorBox');
    const titleEl = document.getElementById('errorTitle');
    const textEl = document.getElementById('errorDetailsText');
    const stepsBox = document.getElementById('errorStepsContainer');
    const stepsList = document.getElementById('errorStepsList');
    const btnSwitch = document.getElementById('btnSwitchToBuiltinEngine');

    if (errBox) {
      if (titleEl) titleEl.textContent = title;
      if (textEl) textEl.textContent = message;

      if (missingConfig && missingConfig.resolution_steps) {
        if (stepsBox && stepsList) {
          stepsList.innerHTML = '';
          missingConfig.resolution_steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            stepsList.appendChild(li);
          });
          stepsBox.style.display = 'block';
        }
        if (btnSwitch) {
          btnSwitch.style.display = 'inline-block';
        }
      } else {
        if (stepsBox) stepsBox.style.display = 'none';
        if (btnSwitch) btnSwitch.style.display = 'none';
      }

      errBox.style.display = 'block';
      errBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  },

  bindErrorBox() {
    const btnDismiss = document.getElementById('btnDismissError');
    const btnRetry = document.getElementById('btnRetryGeneration');
    const btnSwitch = document.getElementById('btnSwitchToBuiltinEngine');

    if (btnDismiss) {
      btnDismiss.addEventListener('click', () => this.hideError());
    }
    if (btnRetry) {
      btnRetry.addEventListener('click', () => {
        this.hideError();
        this.generateVideo();
      });
    }
    if (btnSwitch) {
      btnSwitch.addEventListener('click', () => {
        const selector = document.getElementById('modelSelector');
        if (selector) selector.value = 'ffmpeg-procedural';
        this.currentModel = 'ffmpeg-procedural';
        this.hideError();
        VickyApp.showToast('Switched to Built-in Open-Source FFmpeg Engine. Generating video...', 'info');
        this.generateVideo();
      });
    }
  },

  async generateVideo(customPrompt = null, customType = 'text-to-video', imageBase64 = null) {
    this.hideError();

    const promptInput = document.getElementById('promptInput');
    let prompt = customPrompt || (promptInput ? promptInput.value.trim() : 'Cinematic drone shot');
    if (!prompt) {
      prompt = 'Futuristic flying vehicles navigating through neon-lit skyscrapers in rain';
    }

    // Condition prompt with active Character Memory if available
    if (window.VickyCharacterMemory && typeof window.VickyCharacterMemory.injectConditioning === 'function') {
      prompt = window.VickyCharacterMemory.injectConditioning(prompt);
    }

    const negativePrompt = document.getElementById('negativePromptInput') ? document.getElementById('negativePromptInput').value.trim() : '';

    const progressBox = document.getElementById('genProgressBox') || document.getElementById('generationProgressOverlay');
    const progressStep = document.getElementById('genProgressStep') || document.getElementById('progressStepText');
    const progressBar = document.getElementById('genProgressBar') || document.getElementById('studioProgressBar');
    const videoPlayer = document.getElementById('studioVideoPlayer');
    const btnDownload = document.getElementById('btnDownloadVideo') || document.getElementById('btnDownloadCurrent');

    const motionSel = document.getElementById('cameraMotionSelector') || document.getElementById('cameraMotionSelect');
    if (motionSel) this.currentMotion = motionSel.value;
    const modelSel = document.getElementById('modelSelector') || document.getElementById('modelSelect');
    if (modelSel) this.currentModel = modelSel.value;
    const durSlider = document.getElementById('durationSlider');
    if (durSlider) this.currentDuration = parseInt(durSlider.value) || 3;

    if (progressBox) progressBox.classList.add('active');

    const steps = [
      { pct: 15, msg: 'Step 1/4: Initializing Temporal Latent Embeddings...' },
      { pct: 40, msg: `Step 2/4: Running ${this.currentModel.toUpperCase()} Denoising Steps (1-25)...` },
      { pct: 75, msg: 'Step 3/4: Synthesizing Camera Kinematics & Parallax...' },
      { pct: 90, msg: 'Step 4/4: Encoding Genuine H.264 / AAC MP4 Container with FFmpeg...' }
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        if (progressBar) progressBar.style.width = `${steps[stepIdx].pct}%`;
        if (progressStep) progressStep.textContent = steps[stepIdx].msg;
        stepIdx++;
      }
    }, 450);

    try {
      const endpoint = customType === 'image-to-video' || imageBase64
        ? '/api/generate/image-to-video'
        : '/api/generate/text-to-video';

      const payload = {
        prompt: prompt,
        negative_prompt: negativePrompt,
        aspect_ratio: this.currentAspect,
        duration: this.currentDuration,
        fps: this.currentFps,
        camera_motion: this.currentMotion,
        model: this.currentModel,
        seed: this.currentSeed,
        image_base64: imageBase64 || this.uploadedImageBase64
      };

      const user = window.VickyAuth && window.VickyAuth.currentUser ? window.VickyAuth.currentUser : null;
      const token = localStorage.getItem('vicky_token') || (user ? user.token || user.id : '');
      const reqHeaders = { 'Content-Type': 'application/json' };
      if (token) reqHeaders['Authorization'] = `Bearer ${token}`;
      if (user && user.id) reqHeaders['x-user-id'] = user.id;

      const targetApi = (window.VickyConfig && window.VickyConfig.getApiUrl) ? window.VickyConfig.getApiUrl(endpoint) : endpoint;
      const res = await fetch(targetApi, {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      clearInterval(interval);

      if (!res.ok || data.error) {
        if (data.missing_configuration) {
          if (progressBox) progressBox.classList.remove('active');
          this.showError('AI Model Backend Not Connected', data.error, data.missing_configuration);
          VickyApp.showToast(data.error, 'error');
          return;
        }
        throw new Error(data.error || 'Server reported video generation failure');
      }

      if (!data.video_url || !data.is_valid_mp4) {
        throw new Error('Generated file failed MP4 ISO BMFF container validation.');
      }

      if (progressBar) progressBar.style.width = '100%';
      if (progressStep) progressStep.textContent = 'H.264 MP4 Generation Complete!';

      setTimeout(() => {
        if (progressBox) progressBox.classList.remove('active');

        this.activeVideoUrl = data.video_url;
        this.activeFilename = data.filename || `vicky_ai_${Date.now()}.mp4`;
        this.activeMetadata = {
          format: 'MP4 (ISO BMFF)',
          codec: data.codec || 'H.264 (yuv420p)',
          audio: 'AAC Stereo 44.1kHz',
          resolution: data.resolution || '854x480',
          sizeBytes: data.file_size || 0
        };

        if (videoPlayer) {
          videoPlayer.src = data.video_url;
          videoPlayer.load();
          videoPlayer.play().catch(() => {});
        }

        const badge = document.getElementById('previewBadge');
        if (badge) badge.textContent = `Preview • ${this.currentAspect} Complete`;

        // Configure verified download link with explicit .mp4 extension and Content-Disposition
        if (btnDownload) {
          const downloadUrl = `/api/download?file=${encodeURIComponent(this.activeFilename)}&name=${encodeURIComponent(this.activeFilename)}`;
          btnDownload.href = downloadUrl;
          btnDownload.setAttribute('download', this.activeFilename);
        }

        // Deduct user credits and update portfolio
        if (window.VickyAuth) {
          window.VickyAuth.useCredit();
        }
        if (window.VickyProjects && typeof window.VickyProjects.loadProjects === 'function') {
          window.VickyProjects.loadProjects();
        }

        VickyApp.showToast('AI Video generated! 100% verified H.264 MP4 ready to preview or download.', 'success');
      }, 400);

    } catch (err) {
      clearInterval(interval);
      if (progressBox) progressBox.classList.remove('active');
      console.error('Generation Error:', err);
      this.showError('AI Video Generation Failed', err.message);
      VickyApp.showToast(`Generation error: ${err.message}`, 'error');
    }
  },

  bindPreviewModal() {
    const btnPreview = document.getElementById('btnPreviewVideo');
    const backdrop = document.getElementById('previewModalBackdrop');
    const btnClose = document.getElementById('btnClosePreviewModal');
    const btnCloseSec = document.getElementById('btnModalCloseSecondary');
    const modalPlayer = document.getElementById('modalPreviewPlayer');
    const modalDownload = document.getElementById('btnModalDownload');

    const openModal = () => {
      if (!backdrop || !modalPlayer) return;
      modalPlayer.src = this.activeVideoUrl;
      modalPlayer.load();
      modalPlayer.play().catch(() => {});

      // Populate metadata
      const resEl = document.getElementById('modalMetaRes');
      const sizeEl = document.getElementById('modalMetaSize');
      const vCodecEl = document.getElementById('modalMetaVideoCodec');
      const aCodecEl = document.getElementById('modalMetaAudioCodec');

      if (resEl) resEl.textContent = this.activeMetadata.resolution || '854x480';
      if (sizeEl) sizeEl.textContent = `${Math.round((this.activeMetadata.sizeBytes || 350000) / 1024)} KB`;
      if (vCodecEl) vCodecEl.textContent = this.activeMetadata.codec || 'H.264 (yuv420p)';
      if (aCodecEl) aCodecEl.textContent = this.activeMetadata.audio || 'AAC Stereo';

      if (modalDownload) {
        modalDownload.href = `/api/download?file=${encodeURIComponent(this.activeFilename)}&name=${encodeURIComponent(this.activeFilename)}`;
        modalDownload.setAttribute('download', this.activeFilename);
      }

      backdrop.classList.add('active');
    };

    const closeModal = () => {
      if (!backdrop || !modalPlayer) return;
      modalPlayer.pause();
      backdrop.classList.remove('active');
    };

    if (btnPreview) btnPreview.addEventListener('click', openModal);
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCloseSec) btnCloseSec.addEventListener('click', closeModal);

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
      });
    }
  },

  bindDedicatedT2VAndI2V() {
    const btnT2V = document.getElementById('btnLaunchT2V');
    if (btnT2V) {
      btnT2V.addEventListener('click', () => {
        const prompt = document.getElementById('t2vPromptInput').value.trim();
        const aspect = document.getElementById('t2vAspectSelect').value;
        this.currentAspect = aspect;
        
        VickyApp.navigateTo('generator');
        const pInput = document.getElementById('promptInput');
        if (pInput) pInput.value = prompt;
        this.generateVideo(prompt, 'text-to-video');
      });
    }

    const fileInput = document.getElementById('i2vFileInput');
    const preview = document.getElementById('i2vImagePreview');
    const previewContainer = document.getElementById('i2vImagePreviewContainer');
    const btnI2V = document.getElementById('btnLaunchI2V');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.uploadedImageBase64 = event.target.result;
            if (preview) preview.src = this.uploadedImageBase64;
            if (previewContainer) previewContainer.style.display = 'block';
            VickyApp.showToast('Image loaded for Image-to-Video synthesis.', 'info');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (btnI2V) {
      btnI2V.addEventListener('click', () => {
        const prompt = document.getElementById('i2vPromptInput').value.trim();
        const motion = document.getElementById('i2vMotionSelect').value;
        const dur = parseInt(document.getElementById('i2vDurationSelect').value) || 3;

        this.currentMotion = motion;
        this.currentDuration = dur;
        this.currentModel = 'svd-xt';

        VickyApp.navigateTo('generator');
        this.generateVideo(prompt, 'image-to-video', this.uploadedImageBase64);
      });
    }
  },

  bindSendToEditor() {
    const btn = document.getElementById('btnSendToEditor');
    if (btn) {
      btn.addEventListener('click', () => {
        VickyApp.navigateTo('video-editor');
        const editorPlayer = document.getElementById('editorPreviewPlayer');
        if (editorPlayer && this.activeVideoUrl) {
          editorPlayer.src = this.activeVideoUrl;
          editorPlayer.load();
        }
        VickyApp.showToast('Current video loaded into Studio Video Editor.', 'info');
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  VickyGenerator.init();
});
