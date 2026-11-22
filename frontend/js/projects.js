/**
 * VICKY AI - Projects & History Portfolio Controller
 * Manages saved generations, replay, re-prompting, and deletions.
 */

const VickyProjects = {
  projects: [],

  init() {
    this.loadProjects();
  },

  async loadProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    try {
      const user = window.VickyAuth && window.VickyAuth.currentUser ? window.VickyAuth.currentUser : null;
      const token = localStorage.getItem('vicky_token') || (user ? user.token || user.id : '');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (user && user.id) headers['x-user-id'] = user.id;

      const res = await fetch('/api/projects', { headers });
      const data = await res.json();
      this.projects = data.projects || [];
      this.renderProjects(this.projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  },

  renderProjects(projects) {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    if (!projects || projects.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:50px; color:var(--text-muted);">
          <div style="font-size:2rem; margin-bottom:10px;">🎬</div>
          <div style="font-size:1.1rem; font-weight:600; color:var(--text-primary); margin-bottom:6px;">No Projects Yet</div>
          <p style="margin-bottom:16px;">Generate your first AI video to populate your studio portfolio.</p>
          <a href="#generator" class="btn-cta" style="display:inline-flex;">Create Video Now</a>
        </div>
      `;
      return;
    }

    grid.innerHTML = projects.map(p => `
      <div class="showcase-card" id="card-${p.id}">
        <div class="showcase-media">
          <span class="showcase-badge">${p.aspect_ratio || '16:9'} • ${p.model || 'Wan 2.1'}</span>
          <video class="showcase-video" src="${p.video_url}" controls playsinline preload="metadata" poster="${p.thumbnail_url || ''}"></video>
        </div>
        <div class="showcase-body">
          <div style="font-weight:700; font-size:0.95rem; margin-bottom:4px;">${p.title}</div>
          <div class="showcase-prompt">${p.prompt}</div>
          <div class="showcase-footer">
            <span>${new Date(p.created_at).toLocaleDateString()}</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <button class="btn-outline" style="padding:4px 8px; font-size:0.75rem;" onclick="VickyProjects.reprompt('${p.id}')">Re-Prompt</button>
              <a href="/api/download?file=${encodeURIComponent(p.video_url.split('/').pop())}&name=${encodeURIComponent(p.title ? p.title.replace(/[^a-zA-Z0-9_-]/g, '_') : 'vicky_ai')}.mp4" download="${(p.title || 'vicky_video').replace(/[^a-zA-Z0-9_-]/g, '_')}.mp4" class="btn-cta" style="padding:4px 8px; font-size:0.75rem;">Download MP4</a>
              <button class="btn-icon" style="width:28px; height:28px; color:var(--danger);" onclick="VickyProjects.deleteProject('${p.id}')" title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  },

  reprompt(id) {
    const proj = this.projects.find(p => p.id === id);
    if (!proj) return;

    VickyApp.navigateTo('generator');
    const pInput = document.getElementById('promptInput');
    if (pInput) pInput.value = proj.prompt;

    VickyApp.showToast(`Prompt loaded from "${proj.title}"`, 'info');
  },

  async deleteProject(id) {
    if (!confirm('Are you sure you want to delete this video project?')) return;

    try {
      const user = window.VickyAuth && window.VickyAuth.currentUser ? window.VickyAuth.currentUser : null;
      const token = localStorage.getItem('vicky_token') || (user ? user.token || user.id : '');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (user && user.id) headers['x-user-id'] = user.id;

      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (data.success) {
        this.projects = this.projects.filter(p => p.id !== id);
        const card = document.getElementById(`card-${id}`);
        if (card) card.remove();
        VickyApp.showToast('Project deleted successfully.', 'info');
      } else {
        VickyApp.showToast(data.error || 'Failed to delete project.', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      VickyApp.showToast('Failed to delete project.', 'error');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  VickyProjects.init();
});
