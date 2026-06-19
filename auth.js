// ── VOCATOPIA AUTH ──
// Uses Supabase CDN (loaded before this file in index.html)

const authClient = supabase.createClient(
  'https://teivfkwjhrkzrdebutkz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlaXZma3dqaHJrenJkZWJ1dGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDgxMTEsImV4cCI6MjA5NDM4NDExMX0.OZZyTyZvJQT6wx4HUnR__8N18WHEr6tg515If0C0zTg'
);

let currentUser    = null;
let currentProfile = null;
let _authCardOriginal = '';

// ── SESSION INIT ──────────────────────────────────────────────
async function initAuth() {
  const { data: { session } } = await authClient.auth.getSession();
  if (session?.user) {
    currentUser = session.user;
    await _loadProfile();
    return true;
  }
  // Listen for future auth changes (e.g. email confirm)
  authClient.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user && !currentUser) {
      currentUser = session.user;
      await _loadProfile();
      closeAuthOverlay();
    }
  });
  return false;
}

async function _loadProfile() {
  if (!currentUser) return;
  const { data } = await authClient
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();
  currentProfile = data;

  // 首次登入：呼叫 server 設定初始值，並遷移 localStorage 卡組
  if (currentProfile && !currentProfile.initialized) {
    await _initUserAccount();
  }

  // 將 profile 的角色屬性覆蓋 localStorage 的早期讀取值
  if (currentProfile && typeof STATS !== 'undefined') {
    STATS.str = currentProfile.str_stat ?? STATS.str;
    STATS.int = currentProfile.int_stat ?? STATS.int;
    STATS.fai = currentProfile.fai_stat ?? STATS.fai;
  }

  _updateHeaderUI();
}

async function _initUserAccount() {
  try {
    const { data: { session } } = await authClient.auth.getSession();
    const token = session?.access_token;
    if (!token) return;

    const res = await fetch('/api/user/init', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) return;
    const { profile } = await res.json();
    currentProfile = profile;

    // 遷移 localStorage 舊卡組到 Supabase（一次性）
    try {
      const localDecks = JSON.parse(localStorage.getItem('voca_custom_decks') || '[]');
      if (localDecks.length > 0 && currentUser) {
        await authClient.from('custom_decks').insert(
          localDecks.map(d => ({
            id:         d.id,
            user_id:    currentUser.id,
            name:       d.name,
            emoji:      d.emoji || '📚',
            word_ids:   d.wordIds || [],
            updated_at: new Date().toISOString(),
          }))
        );
        localStorage.removeItem('voca_custom_decks');
      }
    } catch (e) {
      console.warn('[auth] localStorage deck migration failed:', e);
    }
  } catch (e) {
    console.warn('[auth] _initUserAccount failed:', e);
  }
}

function _updateHeaderUI() {
  const pill     = document.getElementById('userPill');
  const loginBtn = document.getElementById('loginBtn');
  if (!pill) return;
  if (currentProfile) {
    document.getElementById('userPillName').textContent = currentProfile.username;
    document.getElementById('hStreak').textContent = currentProfile.streak || 0;
    document.getElementById('hWins').textContent   = currentProfile.wins   || 0;
    const goldEl = document.getElementById('hGold');
    if (goldEl) goldEl.textContent = (currentProfile.gold || 0).toLocaleString();
    pill.style.display = 'flex';
    if (loginBtn) loginBtn.style.display = 'none';
  } else {
    pill.style.display = 'none';
    if (loginBtn) loginBtn.style.display = '';
  }
}

// ── LOGIN ─────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn      = e.target.querySelector('.auth-submit');

  _setAuthLoading(btn, true, '登入中...');
  _clearAuthError();

  const { data, error } = await authClient.auth.signInWithPassword({ email, password });

  if (error) {
    _setAuthError(
      error.message.includes('Invalid login') ? '帳號或密碼錯誤，請重新輸入'
      : error.message.includes('Email not confirmed') ? '請先前往信箱確認帳號'
      : error.message
    );
    _setAuthLoading(btn, false, '登入戰場');
    return;
  }

  currentUser = data.user;
  await _loadProfile();
  closeAuthOverlay();
  window.showToast && showToast(`✓ 歡迎回來，${currentProfile?.username || '勇者'}！`);
}

// ── REGISTER ─────────────────────────────────────────────────
async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const btn      = e.target.querySelector('.auth-submit');

  if (username.length < 2) { _setAuthError('稱號至少需要 2 個字'); return; }
  if (password.length < 6) { _setAuthError('密碼至少需要 6 個字元'); return; }

  _setAuthLoading(btn, true, '建立中...');
  _clearAuthError();

  const { data, error } = await authClient.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    _setAuthError(
      error.message.includes('already registered') ? '此信箱已被使用'
      : error.message
    );
    _setAuthLoading(btn, false, '建立角色');
    return;
  }

  currentUser = data.user;

  // 建立 profile（不用等 email confirm）
  const { error: profErr } = await authClient.from('profiles').insert({
    id: currentUser.id,
    username,
  });

  if (profErr && !profErr.message.includes('duplicate')) {
    _setAuthError('角色建立失敗：' + profErr.message);
    _setAuthLoading(btn, false, '建立角色');
    return;
  }

  await _loadProfile();

  // 若 Supabase 要求 email 確認
  if (!data.session) {
    _showConfirmScreen(email);
    return;
  }

  closeAuthOverlay();
  window.showToast && showToast(`🎉 角色「${username}」已建立！開始你的冒險吧！`);
}

// ── LOGOUT ───────────────────────────────────────────────────
async function logoutUser() {
  await authClient.auth.signOut();
  currentUser    = null;
  currentProfile = null;
  const pill = document.getElementById('userPill');
  if (pill) pill.style.display = 'none';
  showAuthOverlay();
}

// ── GUEST MODE ───────────────────────────────────────────────
function continueAsGuest() {
  closeAuthOverlay();
  window.showToast && showToast('訪客模式：關閉後進度不會儲存');
}

// ── OVERLAY CONTROL ──────────────────────────────────────────
function showAuthOverlay() {
  const el = document.getElementById('authOverlay');
  if (el) el.classList.remove('hidden');
}

function closeAuthOverlay() {
  const el = document.getElementById('authOverlay');
  if (el) el.classList.add('hidden');
  _updateHeaderUI();
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) =>
    t.classList.toggle('active', (tab === 'login') === (i === 0))
  );
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
  _clearAuthError();
}

function _showConfirmScreen(email) {
  const card = document.getElementById('authCard');
  _authCardOriginal = card.innerHTML;
  card.innerHTML = `
    <div class="auth-logo">VOCATOPIA</div>
    <div class="auth-subtitle">單字烏托邦</div>
    <div style="text-align:center;padding:20px 0">
      <div style="font-size:40px;margin-bottom:16px">📬</div>
      <div style="font-family:Nunito;font-weight:700;color:var(--white);font-size:15px;margin-bottom:8px">確認信已寄出！</div>
      <div style="font-size:12px;color:var(--gray);line-height:1.8">
        請前往 <b style="color:var(--green3)">${email}</b><br>
        點擊信中連結後即可登入
      </div>
    </div>
    <button class="auth-guest" onclick="switchAuthTab('login');document.getElementById('authCard').innerHTML=_authCardOriginal">
      返回登入
    </button>
  `;
}

// ── WORD STATUS SYNC ─────────────────────────────────────────
async function syncWordStatus(wordId, status, correctStreak) {
  if (!currentUser || !wordId) return;
  await authClient.from('user_word_status').upsert({
    user_id:        currentUser.id,
    word_id:        wordId,
    status,
    correct_streak: correctStreak,
    updated_at:     new Date().toISOString(),
  }, { onConflict: 'user_id,word_id' });
}

async function loadUserWordStatus() {
  if (!currentUser) return;
  const { data } = await authClient
    .from('user_word_status')
    .select('word_id, status, correct_streak')
    .eq('user_id', currentUser.id);
  if (!data) return;
  const map = Object.fromEntries(data.map(r => [r.word_id, r]));
  // WORDS is defined in script.js — available by the time this runs
  if (typeof WORDS !== 'undefined') {
    WORDS.forEach(w => {
      if (map[w.id]) {
        w.st = map[w.id].status;
        w._correctStreak = map[w.id].correct_streak;
      }
    });
  }
}

async function syncXP(newXp) {
  if (!currentUser) return;
  await authClient.from('profiles')
    .update({ xp: newXp })
    .eq('id', currentUser.id);
}

async function syncGold(newGold) {
  if (!currentUser) return;
  if (currentProfile) currentProfile.gold = newGold;
  await authClient.from('profiles')
    .update({ gold: newGold })
    .eq('id', currentUser.id);
}

async function syncStats(str, int_, fai) {
  if (!currentUser) return;
  await authClient.from('profiles')
    .update({ str_stat: str, int_stat: int_, fai_stat: fai })
    .eq('id', currentUser.id);
}

// ── HELPERS ──────────────────────────────────────────────────
function _setAuthLoading(btn, loading, label) {
  btn.disabled    = loading;
  btn.textContent = label;
}

function _setAuthError(msg) {
  const el = document.getElementById('authError');
  if (el) el.textContent = msg;
}

function _clearAuthError() {
  const el = document.getElementById('authError');
  if (el) el.textContent = '';
}
