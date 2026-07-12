// ── VOCATOPIA AUTH ──
// Uses Supabase CDN (loaded before this file in index.html)

const authClient = supabase.createClient(
  'https://teivfkwjhrkzrdebutkz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlaXZma3dqaHJrenJkZWJ1dGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MDgxMTEsImV4cCI6MjA5NDM4NDExMX0.OZZyTyZvJQT6wx4HUnR__8N18WHEr6tg515If0C0zTg'
);

let currentUser    = null;
let currentProfile = null;
let _authCardOriginal = '';

// 共用：檢查暱稱是否已被使用。excludeUserId 用於「修改自己的暱稱」時排除自己這筆。
// 回傳 true = 已被使用（不可用）、false = 可用。
async function isUsernameTaken(name, excludeUserId) {
  let query = authClient.from('profiles').select('id').eq('username', name).limit(1);
  if (excludeUserId) query = query.neq('id', excludeUserId);
  const { data, error } = await query;
  if (error) { console.error('[isUsernameTaken] 查詢失敗：', error); return false; }
  return !!(data && data.length);
}

// 共用：取得目前登入者的 Supabase access token，未登入回傳 null
async function getAuthToken() {
  const { data: { session } } = await authClient.auth.getSession();
  return session?.access_token || null;
}

// ── SESSION INIT ──────────────────────────────────────────────
async function initAuth() {
  // 先設監聽器，確保能攔截 PASSWORD_RECOVERY（發生在 getSession 處理 URL hash 時）
  authClient.auth.onAuthStateChange(async (_event, session) => {
    if (_event === 'PASSWORD_RECOVERY') {
      showAuthOverlay();
      showSetNewPassword();
      return;
    }
    if ((_event === 'SIGNED_IN') && session?.user && !currentUser) {
      currentUser = session.user;
      await _loadProfile();
      closeAuthOverlay();
    }
  });

  // 備援：直接從 URL hash 偵測 recovery token（避免監聽器時序問題）
  if (window.location.hash.includes('type=recovery')) {
    showAuthOverlay();
    await authClient.auth.getSession(); // 讓 Supabase 處理 token，會觸發上方監聽器
    return false;
  }

  // 上次登入沒勾「記住我」：主動清掉持久化的 session，這次冷啟動強制回登入畫面。
  // 一定要在 getSession() 之前執行，不然已經還原的 session 就來不及擋了。
  if (localStorage.getItem('voca_remember_me') === '0') {
    await authClient.auth.signOut();
    localStorage.removeItem('voca_remember_me');
    return false;
  }

  const { data: { session } } = await authClient.auth.getSession();
  if (session?.user) {
    currentUser = session.user;
    await _loadProfile();
    return true;
  }
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
  if (typeof maybeShowTutorial === 'function') maybeShowTutorial();
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
    if (typeof refreshSubscriptionStatus === 'function') refreshSubscriptionStatus();
    if (typeof initRevenueCat === 'function') initRevenueCat(currentUser.id);

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
  // 首頁 header 精簡後不再有 #userPill/#loginBtn，登出改放進設定面板（#settingsLogoutBtn），
  // 登入沿用「未登入時點個人資料」既有的 showGuestProfileNotice() 流程。
  const goldEl = document.getElementById('hGold');
  if (goldEl) goldEl.textContent = (currentProfile?.gold || 0).toLocaleString();

  const logoutBtn = document.getElementById('settingsLogoutBtn');
  if (logoutBtn) logoutBtn.style.display = currentProfile ? '' : 'none';
}

// ── LOGIN ─────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn      = e.target.querySelector('.auth-submit');

  _setAuthLoading(btn, true, '登入中...');
  _clearAuthError();

  try {
    const { data, error } = await authClient.auth.signInWithPassword({ email, password });

    if (error) {
      _setAuthError(_friendlyAuthError(error, '登入'));
      _setAuthLoading(btn, false, '登入戰場');
      return;
    }

    // 記住我：沒勾選的話，記一個旗標，下次冷啟動 App 時 initAuth() 會主動登出，
    // 強制回到登入畫面；勾選（預設）就維持 Supabase 原本的 localStorage session 持久化。
    const rememberMe = document.getElementById('rememberMeCheckbox')?.checked !== false;
    localStorage.setItem('voca_remember_me', rememberMe ? '1' : '0');

    currentUser = data.user;
    await _loadProfile();
    _setAuthLoading(btn, false, '登入戰場');
    closeAuthOverlay();
    window.showToast && showToast(`✓ 歡迎回來，${currentProfile?.username || '勇者'}！`);
    if (typeof _identifySocket === 'function') _identifySocket();
    if (typeof _checkIncomingFriendRequests === 'function') _checkIncomingFriendRequests();
  } catch (err) {
    console.error('[handleLogin] 例外：', err);
    _setAuthError(_friendlyAuthError(err, '登入'));
    _setAuthLoading(btn, false, '登入戰場');
  }
}

// ── OAuth 登入（Google / Apple）──────────────────────────────
// 需要先在 Supabase Dashboard → Authentication → Providers 啟用對應的 provider
// 並填入 Google Cloud / Apple Developer 那邊申請到的 Client ID、Secret，
// 否則點下去會直接收到 Supabase 回傳的「provider is not enabled」錯誤。
async function signInWithOAuth(provider) {
  _clearAuthError();
  // OAuth 一律視為「記住我」，跟第三方帳號的登入狀態保持一致（沒有勾選框可以取消）
  localStorage.setItem('voca_remember_me', '1');
  try {
    const { error } = await authClient.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      _setAuthError(_friendlyAuthError(error, provider === 'google' ? 'Google 登入' : 'Apple 登入'));
    }
    // 成功的話 Supabase 會導去 Google/Apple 頁面，回來後由 onAuthStateChange 的
    // SIGNED_IN 監聽器接手（見 initAuth()），這裡不用再處理後續。
  } catch (err) {
    console.error('[signInWithOAuth] 例外：', err);
    _setAuthError(_friendlyAuthError(err, '第三方登入'));
  }
}

// ── REGISTER：暱稱即時可用性檢查 ──────────────────────────────
let _regUsernameCheckSeq = 0;
let _regUsernameTaken = false;
async function checkRegUsernameAvailability() {
  const input = document.getElementById('regUsername');
  const hint  = document.getElementById('regUsernameHint');
  const name  = input.value.trim();
  const mySeq = ++_regUsernameCheckSeq;
  if (name.length < 2) { hint.style.display = 'none'; _regUsernameTaken = false; return; }

  const taken = await isUsernameTaken(name);
  if (mySeq !== _regUsernameCheckSeq) return; // 使用者輸入更新了，這次查詢結果過期，丟棄
  _regUsernameTaken = taken;
  hint.style.display = taken ? 'block' : 'none';
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

  // 送出前再檢查一次（防止使用者打字後沒等 debounce 完就直接送出，或兩人同時搶同一個暱稱）
  if (await isUsernameTaken(username)) {
    document.getElementById('regUsernameHint').style.display = 'block';
    _setAuthError('這個暱稱已被使用，換一個試試');
    _setAuthLoading(btn, false, '建立角色');
    return;
  }

  // 新帳號預設記住登入狀態（註冊表單沒有勾選框）
  localStorage.setItem('voca_remember_me', '1');

  try {
    const { data, error } = await authClient.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (error) {
      _setAuthError(_friendlyAuthError(error, '註冊'));
      _setAuthLoading(btn, false, '建立角色');
      return;
    }

    currentUser = data.user;

    // 建立 profile（不用等 email confirm）
    const { error: profErr } = await authClient.from('profiles').insert({
      id: currentUser.id,
      username,
    });

    if (profErr && !(profErr.message || '').includes('duplicate')) {
      _setAuthError(_friendlyAuthError(profErr, '角色建立'));
      _setAuthLoading(btn, false, '建立角色');
      return;
    }

    await _loadProfile();

    // 若 Supabase 要求 email 確認
    if (!data.session) {
      _showConfirmScreen(email);
      return;
    }

    _setAuthLoading(btn, false, '建立角色');
    closeAuthOverlay();
    window.showToast && showToast(`🎉 角色「${username}」已建立！開始你的冒險吧！`);
    if (typeof _identifySocket === 'function') _identifySocket();
  } catch (err) {
    console.error('[handleRegister] 例外：', err);
    _setAuthError(_friendlyAuthError(err, '註冊'));
    _setAuthLoading(btn, false, '建立角色');
  }
}

// ── LOGOUT ───────────────────────────────────────────────────
async function logoutUser() {
  await authClient.auth.signOut();
  currentUser    = null;
  currentProfile = null;
  _updateHeaderUI();
  showAuthOverlay();
}

// ── GUEST MODE ───────────────────────────────────────────────
function continueAsGuest() {
  closeAuthOverlay();
  window.showToast && showToast('訪客模式：關閉後進度不會儲存');
  if (typeof maybeShowTutorial === 'function') maybeShowTutorial();
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

// ── FORGOT PASSWORD ──────────────────────────────────────────
function showForgotPassword() {
  const card = document.getElementById('authCard');
  _authCardOriginal = card.innerHTML;
  card.innerHTML = `
    <div class="auth-logo">VOCATOPIA</div>
    <div class="auth-subtitle">重設密碼</div>
    <form onsubmit="handleForgotPassword(event)" style="margin-top:16px">
      <input class="auth-input" id="forgotEmail" type="email" placeholder="請輸入註冊信箱" required autocomplete="email">
      <div class="auth-error" id="forgotError"></div>
      <button type="submit" class="auth-submit" id="forgotBtn">發送重設連結</button>
    </form>
    <button class="auth-guest" onclick="document.getElementById('authCard').innerHTML=_authCardOriginal">返回登入</button>
  `;
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('forgotEmail').value.trim();
  const btn   = document.getElementById('forgotBtn');
  const errEl = document.getElementById('forgotError');

  btn.disabled = true;
  btn.textContent = '發送中...';
  errEl.textContent = '';

  let error;
  try {
    const redirectTo = window.location.origin;
    ({ error } = await authClient.auth.resetPasswordForEmail(email, { redirectTo }));
  } catch (err) {
    console.error('[handleForgotPassword] 例外：', err);
    error = err;
  }

  if (error) {
    errEl.textContent = _friendlyAuthError(error, '發送重設連結');
    btn.disabled = false;
    btn.textContent = '發送重設連結';
    return;
  }

  const card = document.getElementById('authCard');
  card.innerHTML = `
    <div class="auth-logo">VOCATOPIA</div>
    <div style="text-align:center;padding:20px 0">
      <div style="font-size:40px;margin-bottom:16px">📬</div>
      <div style="font-family:Nunito;font-weight:700;color:var(--white);font-size:15px;margin-bottom:8px">重設連結已寄出！</div>
      <div style="font-size:12px;color:var(--gray);line-height:1.8">
        請前往 <b style="color:var(--green3)">${email}</b><br>點擊信中連結來設定新密碼
      </div>
    </div>
    <button class="auth-guest" onclick="document.getElementById('authCard').innerHTML=_authCardOriginal">返回登入</button>
  `;
}

function showSetNewPassword() {
  showAuthOverlay();
  const card = document.getElementById('authCard');
  card.innerHTML = `
    <div class="auth-logo">VOCATOPIA</div>
    <div class="auth-subtitle">設定新密碼</div>
    <form onsubmit="handleSetNewPassword(event)" style="margin-top:16px">
      <input class="auth-input" id="newPassword" type="password" placeholder="新密碼（至少 6 字元）" required minlength="6" autocomplete="new-password">
      <input class="auth-input" id="newPasswordConfirm" type="password" placeholder="再次輸入新密碼" required minlength="6" autocomplete="new-password">
      <div class="auth-error" id="newPwError"></div>
      <button type="submit" class="auth-submit" id="newPwBtn">確認更新密碼</button>
    </form>
  `;
}

async function handleSetNewPassword(e) {
  e.preventDefault();
  const pw1   = document.getElementById('newPassword').value;
  const pw2   = document.getElementById('newPasswordConfirm').value;
  const btn   = document.getElementById('newPwBtn');
  const errEl = document.getElementById('newPwError');

  if (pw1 !== pw2) { errEl.textContent = '兩次密碼不一致'; return; }

  btn.disabled = true;
  btn.textContent = '更新中...';
  errEl.textContent = '';

  let error;
  try {
    ({ error } = await authClient.auth.updateUser({ password: pw1 }));
  } catch (err) {
    console.error('[handleSetNewPassword] 例外：', err);
    error = err;
  }

  if (error) {
    errEl.textContent = _friendlyAuthError(error, '更新密碼');
    btn.disabled = false;
    btn.textContent = '確認更新密碼';
    return;
  }

  window.showToast && showToast('✓ 密碼已更新！請重新登入');
  await authClient.auth.signOut();
  currentUser = null;
  currentProfile = null;
  location.reload();
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

// 把 Supabase/網路錯誤轉成使用者看得懂的中文。
// 某些網路狀況（連不到 Supabase、被防火牆/代理擋下、跨網域被攔截等）會讓
// error.message 是空的、或整個 error 只是一個沒有 message 屬性的普通物件——
// 這種情況直接顯示會變成 "{}" 或 "[object Object]"，所以一律先檢查再決定要顯示什麼。
function _friendlyAuthError(error, action = '操作') {
  const msg = (error && typeof error.message === 'string') ? error.message.trim() : '';
  if (!msg || msg === '{}' || msg.startsWith('{') || msg === '[object Object]') {
    return `${action}失敗，請確認網路連線後再試一次`;
  }
  if (msg.includes('already registered'))   return '此信箱已被使用';
  if (msg.includes('Invalid login'))        return '帳號或密碼錯誤，請重新輸入';
  if (msg.includes('Email not confirmed'))  return '請先前往信箱確認帳號';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) return '無法連線到伺服器，請檢查網路連線';
  return msg;
}

function _clearAuthError() {
  const el = document.getElementById('authError');
  if (el) el.textContent = '';
}
