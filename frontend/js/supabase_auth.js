/**
 * VICKY AI - Supabase & Unified Authentication Controller
 * Brand: VICKY AI - "ONE PROMPT. ONE STORY. ONE COMPLETE MOVIE."
 * Supports:
 * - Supabase Cloud Authentication (when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are provided)
 * - Built-in High-Availability Local Session Engine (offline/dev fallback with localStorage persistence)
 * - Email/Password Login, Registration, Google OAuth, Password Reset, Logout
 * - Protected Dashboard Guard & Session Persistence
 */

const VickyAuth = {
  supabase: null,
  isSupabaseConfigured: false,
  currentUser: null,
  authListeners: [],

  async init() {
    // 1. Fetch public configuration from backend
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const config = await res.json();
        const sbUrl = config.supabase_url;
        const sbKey = config.supabase_anon_key;

        if (sbUrl && sbKey && !sbUrl.includes('your-project') && window.supabase) {
          this.supabase = window.supabase.createClient(sbUrl, sbKey);
          this.isSupabaseConfigured = true;
          console.log('[VICKY AI Auth] Connected to live Supabase Auth instance:', sbUrl);
        } else {
          console.log('[VICKY AI Auth] Using persistent local session engine (ready for Supabase credentials in .env).');
        }
      }
    } catch (e) {
      console.warn('[VICKY AI Auth] Config fetch note:', e.message);
    }

    // 2. Restore active session
    await this.restoreSession();
    return this.currentUser;
  },

  async restoreSession() {
    // Check Supabase session first if connected
    if (this.isSupabaseConfigured && this.supabase) {
      try {
        const { data: { session }, error } = await this.supabase.auth.getSession();
        if (session && session.user) {
          this.currentUser = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'AI Creator',
            email: session.user.email,
            token: session.access_token,
            provider: session.user.app_metadata?.provider || 'supabase',
            plan: 'Pro Studio Creator',
            credits_total: 500,
            credits_used: 10
          };
          localStorage.setItem('vicky_session_user', JSON.stringify(this.currentUser));
          this.notifyListeners();
          return this.currentUser;
        }
      } catch (err) {
        console.warn('[VICKY AI Auth] Supabase session restore note:', err.message);
      }
    }

    // Restore local session from localStorage
    const saved = localStorage.getItem('vicky_session_user');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        this.currentUser = null;
      }
    }

    if (!this.currentUser) {
      // Check if remember_me email exists
      const rememberedEmail = localStorage.getItem('vicky_remember_email');
      this.currentUser = rememberedEmail ? {
        id: 'usr_guest',
        name: rememberedEmail.split('@')[0],
        email: rememberedEmail,
        is_guest: true
      } : null;
    }

    this.notifyListeners();
    return this.currentUser;
  },

  // 1. Email & Password Login
  async login(email, password, rememberMe = false) {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 4) {
      throw new Error('Please enter your password (minimum 4 characters).');
    }

    if (rememberMe) {
      localStorage.setItem('vicky_remember_email', email);
    } else {
      localStorage.removeItem('vicky_remember_email');
    }

    // Try Supabase Auth if configured
    if (this.isSupabaseConfigured && this.supabase) {
      try {
        const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data && data.user) {
          this.currentUser = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
            email: data.user.email,
            token: data.session?.access_token || `token_${Date.now()}`,
            provider: 'supabase',
            plan: 'Pro Studio Creator',
            credits_total: 500,
            credits_used: 0
          };
          localStorage.setItem('vicky_session_user', JSON.stringify(this.currentUser));
          this.notifyListeners();
          return { success: true, user: this.currentUser, method: 'supabase' };
        }
      } catch (sbErr) {
        console.warn('[VICKY AI Auth] Supabase login error:', sbErr.message);
        throw sbErr;
      }
    }

    // Fallback: Authenticate with backend API & persistent local database
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Authentication failed. Please verify credentials.');
    }

    this.currentUser = result.user || {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      token: result.token,
      plan: 'Pro Studio Creator',
      credits_total: 500,
      credits_used: 0
    };

    localStorage.setItem('vicky_session_user', JSON.stringify(this.currentUser));
    this.notifyListeners();
    return { success: true, user: this.currentUser, method: 'local_engine' };
  },

  // 2. Email & Password Registration
  async register(fullName, email, password, agreedToTerms = true) {
    if (!agreedToTerms) {
      throw new Error('Please accept the Terms of Service and Privacy Policy to proceed.');
    }
    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Please enter your full name.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // Try Supabase Auth if configured
    if (this.isSupabaseConfigured && this.supabase) {
      try {
        const { data, error } = await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        const userObj = {
          id: data.user?.id || `usr_${Date.now()}`,
          name: fullName,
          email: email,
          token: data.session?.access_token || `token_${Date.now()}`,
          provider: 'supabase',
          plan: 'Pro Studio Creator',
          credits_total: 500,
          credits_used: 0,
          requires_email_confirmation: !data.session
        };
        this.currentUser = userObj;
        localStorage.setItem('vicky_session_user', JSON.stringify(this.currentUser));
        this.notifyListeners();
        return { success: true, user: userObj, requires_verification: !data.session, method: 'supabase' };
      } catch (sbErr) {
        console.warn('[VICKY AI Auth] Supabase signup error:', sbErr.message);
        throw sbErr;
      }
    }

    // Fallback: Register with backend API & persistent local database
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fullName, email, password })
    });
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Registration failed.');
    }

    this.currentUser = result.user;
    localStorage.setItem('vicky_session_user', JSON.stringify(this.currentUser));
    this.notifyListeners();
    return { success: true, user: this.currentUser, requires_verification: true, method: 'local_engine' };
  },

  // 3. Google OAuth
  async signInWithGoogle() {
    if (this.isSupabaseConfigured && this.supabase) {
      try {
        const { data, error } = await this.supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/dashboard'
          }
        });
        if (error) throw error;
        return { success: true, url: data.url };
      } catch (e) {
        console.warn('[VICKY AI Auth] Supabase Google OAuth notice:', e.message);
      }
    }

    // Simulation / Local OAuth Bridge
    const promptEmail = prompt('Enter your Google Account email for instant sign in:', 'creator@gmail.com');
    if (!promptEmail || !promptEmail.includes('@')) return;

    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: promptEmail,
        name: promptEmail.split('@')[0].replace('.', ' ')
      })
    });
    const result = await res.json();
    if (result.success && result.user) {
      this.currentUser = result.user;
      localStorage.setItem('vicky_session_user', JSON.stringify(this.currentUser));
      this.notifyListeners();
      window.location.href = '/dashboard';
    }
  },

  // 4. Password Reset
  async resetPassword(email) {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address to receive password reset instructions.');
    }

    if (this.isSupabaseConfigured && this.supabase) {
      try {
        const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/login'
        });
        if (error) throw error;
        return { success: true, message: `Password reset link dispatched via Supabase to ${email}.` };
      } catch (e) {
        console.warn('[VICKY AI Auth] Supabase reset error:', e.message);
      }
    }

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to dispatch password reset request.');
    }
    return result;
  },

  // 5. Logout
  async logout() {
    if (this.isSupabaseConfigured && this.supabase) {
      try {
        await this.supabase.auth.signOut();
      } catch (e) {}
    }

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}

    this.currentUser = null;
    localStorage.removeItem('vicky_session_user');
    this.notifyListeners();
    window.location.href = '/login';
  },

  // Guard Protected Dashboard Route
  requireAuth(redirectUrl = '/login') {
    if (!this.isAuthenticated()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  },

  isAuthenticated() {
    return !!(this.currentUser && this.currentUser.email && !this.currentUser.is_guest);
  },

  onAuthStateChange(listener) {
    this.authListeners.push(listener);
    if (this.currentUser) listener(this.currentUser);
  },

  updateUserUI() {
    const user = this.currentUser || {
      name: 'AI Creator',
      email: 'creator@vickyai.com',
      credits_total: 500,
      credits_used: 0
    };
    const remaining = Math.max(0, (user.credits_total || 500) - (user.credits_used || 0));

    // Sidebar
    const avatar = document.getElementById('sidebarAvatar');
    const name = document.getElementById('sidebarUserName');
    const credits = document.getElementById('sidebarUserCredits');
    if (avatar) avatar.textContent = (user.name || 'V')[0].toUpperCase();
    if (name) name.textContent = user.name || 'AI Creator';
    if (credits) credits.textContent = `${remaining} Credits Free`;

    // Header Auth Container
    const headerContainer = document.getElementById('authHeaderContainer');
    if (headerContainer) {
      if (this.isAuthenticated()) {
        headerContainer.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="display:flex; align-items:center; gap:6px; cursor:pointer;" onclick="VickyApp.navigateTo('settings')">
              <div class="user-avatar" style="width:28px; height:28px; font-size:0.75rem;">${(user.name || 'V')[0].toUpperCase()}</div>
              <span style="font-size:0.82rem; font-weight:600; color:var(--text-primary); max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${user.name}</span>
            </div>
            <button class="btn-outline" style="padding:3px 8px; font-size:0.72rem; border-color:var(--border-subtle);" onclick="VickyAuth.logout()">Sign Out</button>
          </div>
        `;
      } else {
        headerContainer.innerHTML = `
          <a href="/login" class="btn-outline" style="padding:4px 12px; font-size:0.8rem;">Sign In</a>
          <a href="/signup" class="btn-cta" style="padding:4px 12px; font-size:0.8rem;">Sign Up</a>
        `;
      }
    }

    // Settings
    const sName = document.getElementById('settingsUserName');
    const sEmail = document.getElementById('settingsUserEmail');
    if (sName) sName.textContent = user.name || 'AI Creator';
    if (sEmail) sEmail.textContent = user.email || 'creator@vickyai.com';
  },

  useCredit() {
    if (!this.currentUser) {
      this.currentUser = {
        name: 'AI Creator',
        email: 'creator@vickyai.com',
        credits_total: 500,
        credits_used: 0
      };
    }
    this.currentUser.credits_used = (this.currentUser.credits_used || 0) + 1;
    localStorage.setItem('vicky_session_user', JSON.stringify(this.currentUser));
    this.updateUserUI();
  },

  notifyListeners() {
    this.updateUserUI();
    this.authListeners.forEach(fn => {
      try { fn(this.currentUser); } catch (e) {}
    });
  }
};

// Auto-initialize on load
if (typeof window !== 'undefined') {
  window.VickyAuth = VickyAuth;
  document.addEventListener('DOMContentLoaded', () => VickyAuth.init());
}
