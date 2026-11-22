/**
 * VICKY AI - User Authentication & Account Controller
 * Manages user sessions, credentials, persistent token storage, and credit usage.
 */

const VickyAuth = {
  currentUser: JSON.parse(localStorage.getItem('vicky_user')) || {
    id: 'usr_vicky_creator',
    name: 'Vicky Creator',
    email: 'creator@vickyai.com',
    plan: 'Pro Studio Creator',
    credits_total: 500,
    credits_used: 12
  },
  isLoginMode: true,

  init() {
    this.updateUserUI();
    this.bindAuthTabs();
    this.bindAuthForm();
    this.bindDemoAccountButton();
    this.bindAccountSignOut();
  },

  updateUserUI() {
    const avatar = document.getElementById('sidebarAvatar');
    const name = document.getElementById('sidebarUserName');
    const credits = document.getElementById('sidebarUserCredits');
    const headerContainer = document.getElementById('authHeaderContainer');

    const loggedInCard = document.getElementById('authLoggedInCard');
    const formCard = document.getElementById('authFormCard');
    const accountAvatar = document.getElementById('accountAvatar');
    const accountName = document.getElementById('accountName');
    const accountEmail = document.getElementById('accountEmail');
    const accountCredits = document.getElementById('accountCredits');

    const remaining = Math.max(0, (this.currentUser.credits_total || 500) - (this.currentUser.credits_used || 0));

    if (avatar) avatar.textContent = (this.currentUser.name || 'V')[0].toUpperCase();
    if (name) name.textContent = this.currentUser.name || 'AI Creator';
    if (credits) credits.textContent = `${remaining} Credits Remaining`;

    // Account Page Card View
    if (this.currentUser && this.currentUser.email) {
      if (loggedInCard) loggedInCard.style.display = 'block';
      if (formCard) formCard.style.display = 'block';
      if (accountAvatar) accountAvatar.textContent = (this.currentUser.name || 'V')[0].toUpperCase();
      if (accountName) accountName.textContent = this.currentUser.name || 'AI Creator';
      if (accountEmail) accountEmail.textContent = this.currentUser.email;
      if (accountCredits) accountCredits.textContent = `✨ ${remaining} Generation Credits Available`;
    } else {
      if (loggedInCard) loggedInCard.style.display = 'none';
      if (formCard) formCard.style.display = 'block';
    }

    // Top Header Auth Bar
    if (headerContainer) {
      if (this.currentUser && this.currentUser.email) {
        headerContainer.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="display:flex; align-items:center; gap:6px; cursor:pointer;" onclick="VickyApp.navigateTo('auth')">
              <div class="user-avatar" style="width:28px; height:28px; font-size:0.75rem;">${(this.currentUser.name || 'V')[0].toUpperCase()}</div>
              <span style="font-size:0.82rem; font-weight:600; color:var(--text-primary); max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${this.currentUser.name}</span>
            </div>
            <button class="btn-outline" style="padding:3px 8px; font-size:0.72rem; border-color:var(--border-subtle);" onclick="VickyAuth.logout()">Sign Out</button>
          </div>
        `;
      } else {
        headerContainer.innerHTML = `
          <div style="display:flex; align-items:center; gap:6px;">
            <button class="btn-outline" style="padding:4px 10px; font-size:0.78rem;" onclick="VickyAuth.openLogin()">Sign In</button>
            <button class="btn-cta" style="padding:4px 10px; font-size:0.78rem;" onclick="VickyAuth.openRegister()">Sign Up</button>
          </div>
        `;
      }
    }
  },

  openLogin() {
    this.isLoginMode = true;
    VickyApp.navigateTo('auth');
    const tabLogin = document.getElementById('authTabLogin');
    if (tabLogin) tabLogin.click();
  },

  openRegister() {
    this.isLoginMode = false;
    VickyApp.navigateTo('auth');
    const tabRegister = document.getElementById('authTabRegister');
    if (tabRegister) tabRegister.click();
  },

  logout() {
    this.currentUser = {
      id: `usr_guest_${Date.now()}`,
      name: 'Guest Creator',
      email: '',
      plan: 'Free Trial',
      credits_total: 50,
      credits_used: 0
    };
    localStorage.removeItem('vicky_user');
    localStorage.removeItem('vicky_token');
    this.updateUserUI();
    if (window.VickyProjects && typeof window.VickyProjects.loadProjects === 'function') {
      window.VickyProjects.loadProjects();
    }
    VickyApp.showToast('You have been signed out successfully.', 'info');
    VickyApp.navigateTo('auth');
  },

  useCredit() {
    this.currentUser.credits_used = (this.currentUser.credits_used || 0) + 1;
    localStorage.setItem('vicky_user', JSON.stringify(this.currentUser));
    this.updateUserUI();
  },

  bindAuthTabs() {
    const tabLogin = document.getElementById('authTabLogin');
    const tabRegister = document.getElementById('authTabRegister');
    const nameField = document.getElementById('authNameField');
    const btnSubmit = document.getElementById('btnSubmitAuth');

    if (tabLogin && tabRegister) {
      tabLogin.addEventListener('click', (e) => {
        e.preventDefault();
        this.isLoginMode = true;
        tabLogin.style.borderBottom = '2px solid var(--accent-primary)';
        tabLogin.style.color = 'var(--text-primary)';
        tabRegister.style.borderBottom = 'none';
        tabRegister.style.color = 'var(--text-muted)';
        if (nameField) nameField.style.display = 'none';
        if (btnSubmit) btnSubmit.querySelector('span').textContent = 'Sign In to Studio';
      });

      tabRegister.addEventListener('click', (e) => {
        e.preventDefault();
        this.isLoginMode = false;
        tabRegister.style.borderBottom = '2px solid var(--accent-primary)';
        tabRegister.style.color = 'var(--text-primary)';
        tabLogin.style.borderBottom = 'none';
        tabLogin.style.color = 'var(--text-muted)';
        if (nameField) nameField.style.display = 'block';
        if (btnSubmit) btnSubmit.querySelector('span').textContent = 'Create Free Account';
      });
    }
  },

  bindDemoAccountButton() {
    const btnDemo = document.getElementById('btnFillDemoAccount');
    if (btnDemo) {
      btnDemo.addEventListener('click', () => {
        const emailInput = document.getElementById('authEmailInput');
        const passInput = document.getElementById('authPasswordInput');
        const tabLogin = document.getElementById('authTabLogin');
        if (tabLogin) tabLogin.click();
        if (emailInput) emailInput.value = 'creator@vickyai.com';
        if (passInput) passInput.value = 'password123';
        VickyApp.showToast('Demo creator credentials filled. Click "Sign In" to continue.', 'info');
      });
    }
  },

  bindAccountSignOut() {
    const btnSignOut = document.getElementById('btnAccountSignOut');
    if (btnSignOut) {
      btnSignOut.addEventListener('click', () => this.logout());
    }
  },

  bindAuthForm() {
    const form = document.getElementById('authForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('authEmailInput').value.trim();
      const password = document.getElementById('authPasswordInput').value;
      const name = document.getElementById('authNameInput') ? document.getElementById('authNameInput').value.trim() : '';

      if (!email || !email.includes('@')) {
        VickyApp.showToast('Please enter a valid email address.', 'error');
        return;
      }

      if (!password || password.length < 4) {
        VickyApp.showToast('Password must be at least 4 characters long.', 'error');
        return;
      }

      const endpoint = this.isLoginMode ? '/api/auth/login' : '/api/auth/register';
      const payload = { email, password, name: name || email.split('@')[0] };

      const btnSubmit = document.getElementById('btnSubmitAuth');
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.querySelector('span').textContent = this.isLoginMode ? 'Signing In...' : 'Creating Account...';
      }

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.querySelector('span').textContent = this.isLoginMode ? 'Sign In to Studio' : 'Create Free Account';
        }

        if (res.ok && data.success && data.user) {
          this.currentUser = data.user;
          if (data.token) {
            this.currentUser.token = data.token;
            localStorage.setItem('vicky_token', data.token);
          }
          localStorage.setItem('vicky_user', JSON.stringify(this.currentUser));
          this.updateUserUI();

          if (window.VickyProjects && typeof window.VickyProjects.loadProjects === 'function') {
            window.VickyProjects.loadProjects();
          }

          VickyApp.showToast(`Welcome ${this.currentUser.name}! You have ${this.currentUser.credits_total || 500} AI generation credits.`, 'success');
          VickyApp.navigateTo('generator');
        } else {
          const errMsg = data.error || (this.isLoginMode ? 'Invalid email or password.' : 'Signup failed. Please try again.');
          VickyApp.showToast(errMsg, 'error');
        }
      } catch (err) {
        console.error('Auth request error:', err);
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.querySelector('span').textContent = this.isLoginMode ? 'Sign In to Studio' : 'Create Free Account';
        }
        VickyApp.showToast('Network error connecting to auth server. Please try again.', 'error');
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  VickyAuth.init();
});
