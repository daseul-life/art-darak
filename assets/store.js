/* ============================================================
   아트다락방 — 저장소 (Data store)
   ------------------------------------------------------------
   같은 코드가 두 가지 모드로 동작합니다.

   · 'cloud'  : assets/supabase-config.js 에 주소와 키가 들어 있으면
                Supabase(무료 DB)에 필명·작품·댓글을 저장합니다.
   · 'local'  : 키가 비어 있으면 브라우저 localStorage 에 저장합니다.
                (체험 모드 — 이 브라우저에서만 보입니다)

   화면 코드는 모드를 몰라도 되도록 아래 함수만 쓰면 됩니다.
   모든 함수는 Promise 를 돌려줍니다.
   ============================================================ */
(function () {
  'use strict';

  var CONFIG = window.DARAK_CONFIG || {};
  var SEED = window.DARAK_SEED || { artworks: [], comments: [] };

  var LOCAL_KEY = 'artdarak.v2';
  var LIKE_KEY = 'artdarak.v2.likes';
  var ADMIN_KEY = 'artdarak.v2.admin';
  var LOCAL_EMAIL_DOMAIN = 'artdarak.example';

  var FIELDS = ['문학', '미술', '음악', '사진', '공예', '디자인'];
  var STATUSES = ['완성', '과정 공개', '첫 도전'];
  /* 다락방 벽지(분위기) 프리셋 — supabase-schema.sql 의 attic_theme 값과 같습니다. */
  var ATTIC_THEMES = ['rose', 'cream', 'lavender', 'mint', 'butter', 'sky'];
  var DEFAULT_THEME = 'rose';

  /* 다락방 사무실 — 작업실 분위기 4종과 소품 17종.
     profiles.attic_props(jsonb)에 { mood, props: [], view?, pos: { 소품키: {x,y} } } 로 저장합니다.
     pos 는 방 안에서 손으로 끌어 옮긴 소품 자리(백분율)이고, 없으면 기본 자리입니다.
     view 는 큰 창밖 풍경(일출·일몰·바다)이고, 고르지 않으면 키 없이(분위기에 맞춘 기본 창) 둡니다.
     예전에 배열([])로 저장된 값도 그대로 읽히도록 normalizeAtticProps 가 받아 줍니다. */
  var ATTIC_MOODS = ['write', 'paint', 'music', 'craft'];
  var ATTIC_PROPS = [
    'easel', 'desk', 'lamp', 'guitar', 'plant', 'tea', 'garland', 'cat', 'books', 'vinyl',
    'coffee', 'beanbag', 'piano', 'candle', 'dessert', 'board', 'dog', 'camera'
  ];
  var DEFAULT_MOOD = 'write';
  /* 큰 창밖 풍경 — 'auto' 는 작업실 분위기에 맞춘 기본 창입니다. */
  var ATTIC_VIEWS = ['auto', 'sunrise', 'sunset', 'ocean'];
  var DEFAULT_VIEW = 'auto';

  /* 방 안 캐릭터의 자세 — 서기(기본)·앉기·작업하기·명상하기.
     stand 는 기본이라 저장 값에서 키를 뺍니다(attic_props.pose 가 없으면 서기). */
  var ATTIC_POSES = ['stand', 'sit', 'work', 'meditate'];
  var DEFAULT_POSE = 'stand';

  /* 다락방 캐릭터 — 여섯 아키타입 × 여자/남자 두 버전입니다.
     저장 값은 'seoyun:f' / 'seoyun:m' 처럼 아키타입 key 뒤에 성별을 붙입니다.
     (예전처럼 'seoyun' 하나만 저장된 값은 여자 버전으로 읽습니다.)
     화면에는 칭호만 보입니다(이름은 쓰지 않습니다). */
  var ATTIC_AVATARS = [
    { key: 'seoyun', title: '다락방의 기록자', photo: { f: 'seoyun-f', m: 'seoyun-m' } },
    { key: 'haemil', title: '색을 쫓는 몽상가', photo: { f: 'haemil-f', m: 'haemil-m' } },
    { key: 'momo', title: '밤을 지키는 작은 수집가', photo: { f: 'momo-f', m: 'momo-m' } },
    { key: 'ian', title: '고요한 손끝의 연금술사', photo: { f: 'ian-f', m: 'ian-m' } },
    { key: 'haon', title: '선율을 엮는 몽상가', photo: { f: 'haon-f', m: 'haon-m' } },
    { key: 'doyun', title: '문장을 빚는 산책자', photo: { f: 'doyun-f', m: 'doyun-m' } }
  ];
  var ATTIC_AVATAR_KEYS = ATTIC_AVATARS.map(function (item) { return item.key; });
  var ATTIC_GENDERS = ['female', 'male'];
  /* 캐릭터 성별 — 저장 값 뒤에 붙는 한 글자 */
  var CHARACTER_GENDERS = ['f', 'm'];
  var CHARACTER_GENDER_LABEL = { f: '여', m: '남' };
  var DEFAULT_CHARACTER_GENDER = 'f';

  function avatarBase(value) {
    var raw = String(value == null ? '' : value).trim();
    if (!raw) return '';
    var base = raw.split(':')[0];
    return ATTIC_AVATAR_KEYS.indexOf(base) !== -1 ? base : '';
  }

  /* 'seoyun'·'seoyun:f'·'seoyun:m' 을 모두 'seoyun:x' 모양으로 맞춥니다.
     모르는 값은 빈 문자열(글자 기본)이 됩니다. */
  function normalizeCharacter(value) {
    var base = avatarBase(value);
    if (!base) return '';
    var raw = String(value).trim();
    var gender = raw.indexOf(':') !== -1 ? raw.split(':')[1] : DEFAULT_CHARACTER_GENDER;
    if (CHARACTER_GENDERS.indexOf(gender) === -1) gender = DEFAULT_CHARACTER_GENDER;
    return base + ':' + gender;
  }

  function characterValue(base, gender) {
    if (ATTIC_AVATAR_KEYS.indexOf(base) === -1) return '';
    var g = CHARACTER_GENDERS.indexOf(gender) !== -1 ? gender : DEFAULT_CHARACTER_GENDER;
    return base + ':' + g;
  }

  /* 저장 값으로 아키타입·성별·사진 파일 이름을 한 번에 돌려줍니다. */
  function avatarByKey(value) {
    var normalized = normalizeCharacter(value);
    if (!normalized) return null;
    var parts = normalized.split(':');
    var entry = null;
    for (var i = 0; i < ATTIC_AVATARS.length; i += 1) {
      if (ATTIC_AVATARS[i].key === parts[0]) entry = ATTIC_AVATARS[i];
    }
    if (!entry) return null;
    return {
      key: entry.key,
      title: entry.title,
      gender: parts[1],
      genderLabel: CHARACTER_GENDER_LABEL[parts[1]] || CHARACTER_GENDER_LABEL[DEFAULT_CHARACTER_GENDER],
      value: normalized,
      photo: entry.photo[parts[1]] || entry.photo[DEFAULT_CHARACTER_GENDER]
    };
  }

  function normalizeGender(value) {
    return ATTIC_GENDERS.indexOf(value) !== -1 ? value : '';
  }

  /* 소품 자리 — { "<propKey>": { x: 0~100, y: 0~100 } }.
     x·y 는 방(800×500) 안에서 소품 중심이 놓인 자리를 백분율로 적은 값이라
     휴대폰·큰 화면 어디서 열어도 같은 자리에 보입니다.
     모르는 소품 키, 숫자가 아닌 값, 0~100 밖의 값은 조용히 버립니다. */
  function posNumber(value) {
    if (typeof value === 'number') return isFinite(value) ? value : null;
    if (typeof value === 'string' && value.trim() !== '') {
      var n = Number(value);
      return isFinite(n) ? n : null;
    }
    return null;
  }

  function normalizePropPos(value) {
    var out = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) return out;
    ATTIC_PROPS.forEach(function (key) {
      var raw = value[key];
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return;
      var x = posNumber(raw.x);
      var y = posNumber(raw.y);
      if (x == null || y == null) return;
      if (x < 0 || x > 100 || y < 0 || y > 100) return;
      out[key] = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
    });
    return out;
  }

  /* { mood, props, avatar?, gender?, pos? } — 예전 배열 값·모르는 값도 받아 줍니다.
     avatar/gender/pos 는 고른 적이 있을 때만 키를 남겨서, 예전 저장 값과 모양이 같습니다. */
  /* 창밖 풍경 — 모르는 값은 'auto'(분위기에 맞춘 기본 창)로 조용히 돌립니다. */
  function normalizeAtticView(value) {
    return ATTIC_VIEWS.indexOf(value) !== -1 ? value : DEFAULT_VIEW;
  }

  function normalizeAtticProps(value) {
    var raw = value;
    if (Array.isArray(raw)) raw = { props: raw };
    if (!raw || typeof raw !== 'object') raw = {};

    var mood = ATTIC_MOODS.indexOf(raw.mood) !== -1 ? raw.mood : DEFAULT_MOOD;
    var source = Array.isArray(raw.props) ? raw.props : [];
    var props = [];
    source.forEach(function (key) {
      if (ATTIC_PROPS.indexOf(key) === -1) return;
      if (props.indexOf(key) !== -1) return;
      props.push(key);
    });

    var next = { mood: mood, props: props };
    var view = normalizeAtticView(raw.view);
    if (view !== DEFAULT_VIEW) next.view = view;
    var pose = ATTIC_POSES.indexOf(raw.pose) !== -1 ? raw.pose : DEFAULT_POSE;
    if (pose !== DEFAULT_POSE) next.pose = pose;
    var avatar = normalizeCharacter(raw.avatar);
    if (avatar) next.avatar = avatar;
    var gender = normalizeGender(raw.gender);
    if (gender) next.gender = gender;
    var pos = normalizePropPos(raw.pos);
    if (Object.keys(pos).length) next.pos = pos;
    /* 소품 고정 — 켜 두면 손가락이 스쳐도 소품 자리가 움직이지 않습니다. */
    if (raw.locked === true) next.locked = true;
    return next;
  }

  var state = {
    mode: (CONFIG.supabaseUrl && CONFIG.supabaseAnonKey) ? 'cloud' : 'local',
    client: null,
    profile: null,
    lastError: null,
    listeners: []
  };

  /* -------------------------------------------------- 공통 도우미 */
  function uid(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' +
      Math.random().toString(36).slice(2, 8);
  }

  function normalizePen(pen) {
    return String(pen == null ? '' : pen).trim().replace(/\s+/g, ' ');
  }

  function penKey(pen) {
    return normalizePen(pen).toLowerCase().replace(/\s+/g, '');
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function num(value) {
    var n = Number(value);
    return isFinite(n) ? n : 0;
  }

  function notify() {
    state.listeners.forEach(function (fn) {
      try { fn(state.profile); } catch (err) { console.error(err); }
    });
  }

  /* -------------------------------------------------- localStorage */
  function readLocal() {
    try {
      var raw = window.localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn('[아트다락방] 저장된 내용을 읽지 못했어요.', err);
      return null;
    }
  }

  function writeLocal(data) {
    try {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('[아트다락방] 저장 공간이 부족해요.', err);
      throw new Error('브라우저 저장 공간이 가득 찼어요. 사진 크기를 줄이거나 오래된 작품을 정리해 주세요.');
    }
  }

  /* 예시 작품(is_sample)은 체험 모드 저장소에서도 걷어 냅니다.
     사이트 어디에도 사람이 올리지 않은 예시 작품이 보이지 않게 하기 위함입니다. */
  function purgeSampleArtworks(data) {
    if (!data || !Array.isArray(data.artworks)) return data;
    var removed = {};
    var before = data.artworks.length;
    data.artworks = data.artworks.filter(function (w) {
      if (w && w.is_sample) { removed[w.id] = 1; return false; }
      return true;
    });
    if (data.artworks.length !== before) {
      data.comments = (data.comments || []).filter(function (c) { return !removed[c.artwork_id]; });
      writeLocal(data);
    }
    return data;
  }

  function bootstrapLocal() {
    var data = readLocal();
    if (data && data.version === 2) return syncSampleLikes(purgeSampleArtworks(data));

    data = {
      version: 2,
      profiles: [],
      artworks: [],
      comments: [],
      guestbook: [],
      session: null,
      seededAt: nowIso()
    };

    (SEED.artworks || []).forEach(function (w) {
      data.artworks.push({
        id: w.id,
        user_id: null,
        pen_name: w.pen_name,
        title: w.title,
        field: w.field,
        status: w.status,
        description: w.description || '',
        image_url: w.image_url || null,
        link_url: w.link_url || null,
        like_count: num(w.like_count),
        is_sample: true,
        emoji: w.emoji || null,
        art: w.art || null,
        created_at: w.created_at
      });
    });

    (SEED.comments || []).forEach(function (c) {
      data.comments.push({
        id: c.id,
        artwork_id: c.artwork_id,
        user_id: null,
        pen_name: c.pen_name,
        body: c.body,
        created_at: c.created_at
      });
    });

    writeLocal(data);
    return data;
  }

  /* 예시 작품의 마음 수는 assets/seed.js 값을 그대로 따릅니다.
     이미 이 브라우저에 저장돼 있던 예시 작품의 숫자도 새 값으로 맞춰 줍니다.
     (마음을 누른 기록은 artdarak.v2.likes 에 따로 있어서 이 정리와 상관없어요.) */
  function syncSampleLikes(data) {
    if (!data || !Array.isArray(data.artworks)) return data;
    var seedLikes = {};
    (SEED.artworks || []).forEach(function (w) { seedLikes[w.id] = num(w.like_count); });
    var changed = false;
    data.artworks.forEach(function (w) {
      if (!w || !w.is_sample) return;
      if (!Object.prototype.hasOwnProperty.call(seedLikes, w.id)) return;
      if (w.like_count !== seedLikes[w.id]) {
        w.like_count = seedLikes[w.id];
        changed = true;
      }
    });
    if (changed) writeLocal(data);
    return data;
  }

  function localProfile() {
    var data = readLocal();
    if (!data || !data.session) return null;
    var row = (data.profiles || []).filter(function (p) { return p.id === data.session.id; })[0];
    return row ? publicProfile(row) : null;
  }

  function publicProfile(row) {
    var theme = ATTIC_THEMES.indexOf(row.attic_theme) !== -1 ? row.attic_theme : DEFAULT_THEME;
    return {
      id: row.id,
      pen_name: row.pen_name,
      bio: row.bio || '',
      fields: row.fields || [],
      attic_theme: theme,
      attic_note: row.attic_note || '',
      attic_props: normalizeAtticProps(row.attic_props),
      is_admin: !!row.is_admin,
      is_blocked: !!row.is_blocked,
      created_at: row.created_at
    };
  }

  /* 비밀번호 — 체험 모드 전용 간이 해시.
     (실제 서비스에서는 Supabase Auth 가 안전하게 보관합니다.) */
  function makeSalt() {
    return Math.random().toString(36).slice(2, 10);
  }

  function hashPassword(password, salt) {
    var text = salt + '|' + password;
    var h1 = 5381;
    var h2 = 52711;
    for (var i = 0; i < text.length; i += 1) {
      var code = text.charCodeAt(i);
      h1 = ((h1 << 5) + h1 + code) >>> 0;
      h2 = ((h2 << 4) + h2 + code) >>> 0;
    }
    return 'p1.' + salt + '.' + h1.toString(36) + h2.toString(36);
  }

  function verifyPassword(password, stored) {
    var parts = String(stored || '').split('.');
    if (parts.length !== 3) return false;
    return hashPassword(password, parts[1]) === stored;
  }

  /* -------------------------------------------------- Supabase */
  function penToEmail(pen) {
    var key = penKey(pen);
    var h1 = 5381;
    var h2 = 52711;
    for (var i = 0; i < key.length; i += 1) {
      var code = key.charCodeAt(i);
      h1 = ((h1 << 5) + h1 + code) >>> 0;
      h2 = ((h2 << 6) + h2 + code * 7) >>> 0;
    }
    return 'p' + h1.toString(36) + h2.toString(36) + '@' + LOCAL_EMAIL_DOMAIN;
  }

  function authErrorMessage(error) {
    var message = (error && error.message) || '';
    var lower = message.toLowerCase();

    if (lower.indexOf('invalid login credentials') !== -1) {
      return '필명이나 비밀번호가 맞지 않아요.';
    }
    if (lower.indexOf('already registered') !== -1 || lower.indexOf('already been registered') !== -1) {
      return '이미 쓰이고 있는 필명이에요. 다른 필명을 지어 주세요.';
    }
    if (lower.indexOf('password') !== -1 || lower.indexOf('at least') !== -1) {
      return '비밀번호는 6자 이상이어야 해요.';
    }
    if (lower.indexOf('rate limit') !== -1 || lower.indexOf('after') !== -1) {
      return '잠시 뒤에 다시 시도해 주세요.';
    }
    return message || '잠시 뒤에 다시 시도해 주세요.';
  }

  async function initCloud() {
    var module = await import('https://esm.sh/@supabase/supabase-js@2?bundle');
    state.client = module.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });

    var session = await state.client.auth.getSession();
    var user = session && session.data && session.data.session && session.data.session.user;
    if (user) state.profile = await fetchCloudProfile(user.id);

    state.client.auth.onAuthStateChange(function (event, nextSession) {
      if (event === 'SIGNED_OUT') {
        state.profile = null;
        notify();
        return;
      }
      if (event === 'SIGNED_IN' && nextSession && nextSession.user) {
        fetchCloudProfile(nextSession.user.id).then(function (profile) {
          state.profile = profile;
          notify();
        });
      }
    });
  }

  async function fetchCloudProfile(id) {
    var res = await state.client.from('profiles').select('*').eq('id', id).maybeSingle();
    if (res.error) {
      state.lastError = res.error.message;
      console.warn('[아트다락방] 프로필을 읽지 못했어요.', res.error);
      return null;
    }
    return res.data ? publicProfile(res.data) : null;
  }

  async function ensureCloudProfile(user, pen) {
    var profile = await fetchCloudProfile(user.id);
    if (profile) return profile;

    var res = await state.client
      .from('profiles')
      .insert({ id: user.id, pen_name: pen })
      .select('*')
      .single();
    if (res.error) throw new Error('프로필을 만들지 못했어요. supabase-schema.sql 을 실행했는지 확인해 주세요.');
    return publicProfile(res.data);
  }

  /* -------------------------------------------------- 인증 */
  async function signUp(pen, password, extra) {
    var name = normalizePen(pen);
    extra = extra || {};
    var startingAttic = normalizeAtticProps(extra.attic_props || {});
    var startingTheme = ATTIC_THEMES.indexOf(extra.attic_theme) !== -1 ? extra.attic_theme : DEFAULT_THEME;

    assert(name.length >= 2, '필명은 2자 이상으로 지어 주세요.');
    assert(name.length <= 12, '필명은 12자까지 쓸 수 있어요.');
    assert(String(password || '').length >= 6, '비밀번호는 6자 이상으로 정해 주세요.');

    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var exists = data.profiles.some(function (p) { return penKey(p.pen_name) === penKey(name); });
      if (exists) throw new Error('이미 쓰이고 있는 필명이에요. 다른 필명을 지어 주세요.');

      var salt = makeSalt();
      var profile = {
        id: uid('u'),
        pen_name: name,
        bio: extra.bio || '',
        fields: extra.fields || [],
        attic_theme: startingTheme,
        attic_note: '',
        attic_props: startingAttic,
        is_admin: false,
        is_blocked: false,
        hash: hashPassword(password, salt),
        created_at: nowIso()
      };
      data.profiles.push(profile);
      data.session = { id: profile.id };
      writeLocal(data);

      state.profile = publicProfile(profile);
      notify();
      return state.profile;
    }

    var dup = await state.client
      .from('profiles')
      .select('id')
      .ilike('pen_name', name)
      .maybeSingle();
    if (dup.data) throw new Error('이미 쓰이고 있는 필명이에요. 다른 필명을 지어 주세요.');

    var email = penToEmail(name);
    var res = await state.client.auth.signUp({
      email: email,
      password: String(password),
      options: { data: { pen_name: name } }
    });
    if (res.error) throw new Error(authErrorMessage(res.error));

    if (!res.data.session) {
      /* 이메일 확인(Confirm email)이 켜져 있으면 세션이 바로 오지 않습니다. */
      var again = await state.client.auth.signInWithPassword({ email: email, password: String(password) });
      if (again.error || !again.data.session) {
        throw new Error('가입은 접수됐지만 바로 들어가지지 않았어요. Supabase의 Confirm email 설정을 꺼 주세요.');
      }
      res = again;
    }

    state.profile = await ensureCloudProfile(res.data.session.user, name);
    /* 가입 직후 고른 벽지와 꾸민 다락방 전체를 프로필에 함께 저장합니다. */
    var atticRes = await state.client
      .from('profiles')
      .update({ attic_theme: startingTheme, attic_props: startingAttic })
      .eq('id', state.profile.id)
      .select('*')
      .single();
    if (atticRes.error) throw new Error('가입은 되었지만 꾸민 다락방을 저장하지 못했어요. ' + atticRes.error.message);
    state.profile = publicProfile(atticRes.data);
    notify();
    return state.profile;
  }

  async function signIn(pen, password) {
    var name = normalizePen(pen);
    assert(name.length >= 2, '필명을 적어 주세요.');
    assert(String(password || '').length > 0, '비밀번호를 적어 주세요.');

    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var row = data.profiles.filter(function (p) { return penKey(p.pen_name) === penKey(name); })[0];
      if (!row || !verifyPassword(String(password), row.hash)) {
        throw new Error('필명이나 비밀번호가 맞지 않아요.');
      }
      data.session = { id: row.id };
      writeLocal(data);
      state.profile = publicProfile(row);
      notify();
      return state.profile;
    }

    var res = await state.client.auth.signInWithPassword({
      email: penToEmail(name),
      password: String(password)
    });
    if (res.error) throw new Error(authErrorMessage(res.error));

    state.profile = await ensureCloudProfile(res.data.user, name);
    notify();
    return state.profile;
  }

  async function changePassword(currentPassword, newPassword) {
    assert(state.profile, '로그인한 뒤 이용해 주세요.');
    assert(String(newPassword || '').length >= 6, '새 비밀번호는 6자 이상으로 정해 주세요.');
    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var row = (data.profiles || []).filter(function (p) { return p.id === state.profile.id; })[0];
      if (!row || !verifyPassword(String(currentPassword || ''), row.hash)) {
        throw new Error('현재 비밀번호가 맞지 않아요.');
      }
      var salt = makeSalt();
      row.hash = hashPassword(String(newPassword), salt);
      writeLocal(data);
      return true;
    }
    var email = penToEmail(state.profile.pen_name);
    var verified = await state.client.auth.signInWithPassword({
      email: email, password: String(currentPassword || '')
    });
    if (verified.error) throw new Error('현재 비밀번호가 맞지 않아요.');
    var updated = await state.client.auth.updateUser({ password: String(newPassword) });
    if (updated.error) throw new Error(authErrorMessage(updated.error));
    return true;
  }

  async function signOut() {
    if (state.mode === 'cloud' && state.client) {
      await state.client.auth.signOut();
    } else {
      var data = bootstrapLocal();
      data.session = null;
      writeLocal(data);
    }
    state.profile = null;
    notify();
  }

  async function updateProfile(patch) {
    patch = patch || {};
    var me = state.profile;
    assert(me, '먼저 필명으로 시작해 주세요.');

    var bio = String(patch.bio == null ? me.bio : patch.bio).slice(0, 300);
    var fields = Array.isArray(patch.fields)
      ? patch.fields.filter(function (f) { return FIELDS.indexOf(f) !== -1; }).slice(0, 6)
      : me.fields;
    var theme = patch.attic_theme == null ? me.attic_theme : patch.attic_theme;
    if (ATTIC_THEMES.indexOf(theme) === -1) theme = DEFAULT_THEME;
    var note = String(patch.attic_note == null ? me.attic_note : patch.attic_note).slice(0, 80);
    var props = normalizeAtticProps(patch.attic_props === undefined ? me.attic_props : patch.attic_props);

    var patchRow = {
      bio: bio,
      fields: fields,
      attic_theme: theme,
      attic_note: note,
      attic_props: props
    };

    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var row = data.profiles.filter(function (p) { return p.id === me.id; })[0];
      if (!row) throw new Error('프로필을 찾지 못했어요.');
      Object.assign(row, patchRow);
      writeLocal(data);
    } else {
      var res = await state.client.from('profiles').update(patchRow).eq('id', me.id);
      if (res.error) throw new Error('다락방을 저장하지 못했어요. ' + res.error.message);
    }

    state.profile = Object.assign({}, me, patchRow);
    notify();
    return state.profile;
  }

  /* -------------------------------------------------- 작품 */
  function mapArtwork(row, commentCount) {
    return {
      id: row.id,
      user_id: row.user_id || null,
      pen_name: row.pen_name,
      title: row.title,
      field: row.field,
      status: row.status,
      description: row.description || '',
      image_url: row.image_url || null,
      link_url: row.link_url || null,
      like_count: num(row.like_count),
      is_sample: !!row.is_sample,
      is_featured: !!row.is_featured,
      is_hidden: !!row.is_hidden,
      emoji: row.emoji || null,
      art: row.art || null,
      comment_count: num(commentCount),
      created_at: row.created_at
    };
  }

  async function listArtworks(options) {
    options = options || {};
    var onlyMine = options.userId || null;
    var includeHidden = !!options.includeHidden;
    var works = [];

    if (state.mode === 'local') {
      var data = bootstrapLocal();
      works = data.artworks.slice();
      if (onlyMine) works = works.filter(function (w) { return w.user_id === onlyMine; });
      var counts = {};
      data.comments.forEach(function (c) { counts[c.artwork_id] = (counts[c.artwork_id] || 0) + 1; });
      works = works.map(function (w) { return mapArtwork(w, counts[w.id]); });

      if (!includeHidden) {
        var blocked = {};
        data.profiles.forEach(function (p) { if (p.is_blocked) blocked[p.id] = 1; });
        var myId = state.profile && state.profile.id;
        works = works.filter(function (w) {
          if (w.is_hidden && w.user_id !== myId) return false;
          if (w.user_id && blocked[w.user_id]) return false;
          return true;
        });
      }
    } else {
      var query = state.client
        .from('artworks')
        .select('*, comments(count)')
        .order('created_at', { ascending: false });
      if (onlyMine) query = query.eq('user_id', onlyMine);
      var res = await query;
      if (res.error) {
        state.lastError = res.error.message;
        console.warn('[아트다락방] 작품을 읽지 못했어요.', res.error);
        return [];
      }
      works = (res.data || []).map(function (row) {
        var count = row.comments && row.comments[0] ? row.comments[0].count : 0;
        return mapArtwork(row, count);
      });
    }

    /* 사람이 올린 작품만 — 예시 작품(is_sample)은 목록·집계·화면에서 모두 뺍니다. */
    works = works.filter(function (w) { return !w.is_sample; });

    works.sort(function (a, b) {
      return String(b.created_at).localeCompare(String(a.created_at));
    });

    return works;
  }

  async function getArtwork(id) {
    if (!id) return null;
    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var row = data.artworks.filter(function (w) { return w.id === id; })[0];
      if (!row) return null;
      var count = data.comments.filter(function (c) { return c.artwork_id === id; }).length;
      return mapArtwork(row, count);
    }

    var res = await state.client
      .from('artworks')
      .select('*, comments(count)')
      .eq('id', id)
      .maybeSingle();
    if (res.error) {
      console.warn('[아트다락방] 작품을 읽지 못했어요.', res.error);
      return null;
    }
    if (!res.data || res.data.is_sample) return null;
    var count2 = res.data.comments && res.data.comments[0] ? res.data.comments[0].count : 0;
    return mapArtwork(res.data, count2);
  }

  async function createArtwork(payload) {
    var me = state.profile;
    assert(me, '먼저 필명으로 시작해 주세요.');

    var title = String(payload.title || '').trim();
    assert(title.length >= 1, '작품 제목을 적어 주세요.');
    assert(title.length <= 60, '제목은 60자까지 쓸 수 있어요.');
    assert(FIELDS.indexOf(payload.field) !== -1, '분야를 하나 골라 주세요.');

    var status = STATUSES.indexOf(payload.status) !== -1 ? payload.status : '완성';
    var description = String(payload.description || '').slice(0, 2000);
    var imageUrl = payload.imageUrl || null;
    var linkUrl = payload.linkUrl || null;

    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var work = {
        id: uid('w'),
        user_id: me.id,
        pen_name: me.pen_name,
        title: title,
        field: payload.field,
        status: status,
        description: description,
        image_url: imageUrl,
        link_url: linkUrl,
        like_count: 0,
        is_sample: false,
        is_featured: false,
        is_hidden: false,
        created_at: nowIso()
      };
      data.artworks.unshift(work);
      writeLocal(data);
      return mapArtwork(work, 0);
    }

    var res = await state.client
      .from('artworks')
      .insert({
        user_id: me.id,
        pen_name: me.pen_name,
        title: title,
        field: payload.field,
        status: status,
        description: description,
        image_url: imageUrl,
        link_url: linkUrl
      })
      .select('*')
      .single();
    if (res.error) throw new Error('작품을 올리지 못했어요. ' + res.error.message);
    return mapArtwork(res.data, 0);
  }

  async function deleteArtwork(id) {
    var me = state.profile;
    assert(me, '먼저 필명으로 시작해 주세요.');

    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var row = data.artworks.filter(function (w) { return w.id === id; })[0];
      if (!row) return false;
      assert(row.user_id === me.id, '내가 올린 작품만 지울 수 있어요.');
      data.artworks = data.artworks.filter(function (w) { return w.id !== id; });
      data.comments = data.comments.filter(function (c) { return c.artwork_id !== id; });
      writeLocal(data);
      return true;
    }

    var res = await state.client.from('artworks').delete().eq('id', id).eq('user_id', me.id);
    if (res.error) throw new Error('작품을 지우지 못했어요. ' + res.error.message);
    return true;
  }

  /* -------------------------------------------------- 댓글 */
  function mapComment(row) {
    return {
      id: row.id,
      artwork_id: row.artwork_id,
      user_id: row.user_id || null,
      pen_name: row.pen_name,
      body: row.body,
      created_at: row.created_at
    };
  }

  async function listComments(artworkId) {
    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var blocked = {};
      data.profiles.forEach(function (p) { if (p.is_blocked) blocked[p.id] = 1; });
      return data.comments
        .filter(function (c) { return c.artwork_id === artworkId && !(c.user_id && blocked[c.user_id]); })
        .map(mapComment)
        .sort(function (a, b) { return String(a.created_at).localeCompare(String(b.created_at)); });
    }

    var res = await state.client
      .from('comments')
      .select('*')
      .eq('artwork_id', artworkId)
      .order('created_at', { ascending: true });
    if (res.error) {
      console.warn('[아트다락방] 댓글을 읽지 못했어요.', res.error);
      return [];
    }
    return (res.data || []).map(mapComment);
  }

  async function addComment(artworkId, body) {
    var me = state.profile;
    assert(me, '먼저 필명으로 시작해 주세요.');

    var text = String(body || '').trim();
    assert(text.length > 0, '한 줄 적어 주시면 남길 수 있어요.');
    assert(text.length <= 500, '감상은 500자까지 남길 수 있어요.');

    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var comment = {
        id: uid('c'),
        artwork_id: artworkId,
        user_id: me.id,
        pen_name: me.pen_name,
        body: text,
        created_at: nowIso()
      };
      data.comments.push(comment);
      writeLocal(data);
      return mapComment(comment);
    }

    var res = await state.client
      .from('comments')
      .insert({ artwork_id: artworkId, user_id: me.id, pen_name: me.pen_name, body: text })
      .select('*')
      .single();
    if (res.error) throw new Error('감상을 남기지 못했어요. ' + res.error.message);
    return mapComment(res.data);
  }

  async function deleteComment(id) {
    var me = state.profile;
    assert(me, '먼저 필명으로 시작해 주세요.');

    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var row = data.comments.filter(function (c) { return c.id === id; })[0];
      if (!row) return false;
      assert(row.user_id === me.id, '내가 남긴 감상만 지울 수 있어요.');
      data.comments = data.comments.filter(function (c) { return c.id !== id; });
      writeLocal(data);
      return true;
    }

    var res = await state.client.from('comments').delete().eq('id', id).eq('user_id', me.id);
    if (res.error) throw new Error('감상을 지우지 못했어요. ' + res.error.message);
    return true;
  }

  /* 내 작품에 달린 감상 (내 다락방) */
  async function commentsForAuthor(userId) {
    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var mine = {};
      data.artworks.forEach(function (w) { if (w.user_id === userId) mine[w.id] = w; });
      return data.comments
        .filter(function (c) { return mine[c.artwork_id]; })
        .map(function (c) {
          return Object.assign(mapComment(c), {
            artwork_title: mine[c.artwork_id].title,
            artwork_field: mine[c.artwork_id].field
          });
        })
        .sort(function (a, b) { return String(b.created_at).localeCompare(String(a.created_at)); });
    }

    var res = await state.client
      .from('comments')
      .select('*, artworks!inner(id, title, field, user_id)')
      .eq('artworks.user_id', userId)
      .order('created_at', { ascending: false });
    if (res.error) {
      console.warn('[아트다락방] 받은 감상을 읽지 못했어요.', res.error);
      return [];
    }
    return (res.data || []).map(function (row) {
      return Object.assign(mapComment(row), {
        artwork_title: row.artworks ? row.artworks.title : '',
        artwork_field: row.artworks ? row.artworks.field : ''
      });
    });
  }

  /* -------------------------------------------------- 다락방 방명록 */
  /* 다락방 주인에게 남기는 짧은 인사 한 줄입니다. (supabase-schema.sql 의 public.guestbook)
     · SELECT 누구나 / INSERT 남긴 사람만 / DELETE 남긴 사람 또는 다락방 주인
     아직 Supabase 에 guestbook 표를 만들지 않았거나(PGRST205·42P01·404),
     같은 이름의 다른 모양 표만 있을 때(42703)에는 붉은 오류 대신
     '준비 중' 상태로 넘어가 화면이 그대로 쓰이도록 합니다. */
  var GUESTBOOK_STATUS = 'unknown';   /* 'ok' | 'missing' | 'error' */

  function isGuestbookMissing(error) {
    if (!error) return false;
    var code = String(error.code || '');
    var message = String(error.message || error.details || error || '').toLowerCase();
    return code === 'PGRST205' || code === '42P01' || code === '42703' || code === '404' ||
      Number(error.status) === 404 ||
      message.indexOf('could not find the table') !== -1 ||
      message.indexOf('does not exist') !== -1 ||
      message.indexOf('schema cache') !== -1 ||
      message.indexOf('relation "public.guestbook"') !== -1;
  }

  function guestbookStatus() {
    return GUESTBOOK_STATUS;
  }

  function mapGuestbook(row) {
    return {
      id: row.id,
      owner_id: row.owner_id,
      author_id: row.author_id || null,
      author_pen: row.author_pen || '',
      body: row.body || '',
      created_at: row.created_at
    };
  }

  async function listGuestbook(ownerId) {
    if (!ownerId) return [];

    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var blocked = {};
      (data.profiles || []).forEach(function (p) { if (p.is_blocked) blocked[p.id] = 1; });
      GUESTBOOK_STATUS = 'ok';
      return (data.guestbook || [])
        .filter(function (g) {
          if (g.owner_id !== ownerId) return false;
          if (g.author_id && blocked[g.author_id]) return false;
          return true;
        })
        .map(mapGuestbook)
        .sort(function (a, b) {
          return String(b.created_at).localeCompare(String(a.created_at));
        });
    }

    var res = await state.client
      .from('guestbook')
      .select('id, owner_id, author_id, author_pen, body, created_at')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    if (res.error) {
      GUESTBOOK_STATUS = isGuestbookMissing(res.error) ? 'missing' : 'error';
      console.warn('[아트다락방] 방명록을 읽지 못했어요.', res.error.message || res.error);
      return [];
    }
    GUESTBOOK_STATUS = 'ok';
    return (res.data || []).map(mapGuestbook);
  }

  async function addGuestbook(ownerId, body) {
    var me = state.profile;
    assert(me, '먼저 필명으로 시작해 주세요.');
    assert(ownerId, '다락방을 찾지 못했어요.');

    var text = String(body || '').trim();
    assert(text.length > 0, '한 줄 적어 주시면 남길 수 있어요.');
    assert(text.length <= 200, '방명록은 200자까지 남길 수 있어요.');

    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var owner = (data.profiles || []).filter(function (p) { return p.id === ownerId; })[0];
      assert(owner, '다락방을 찾지 못했어요.');

      var row = {
        id: uid('g'),
        owner_id: ownerId,
        author_id: me.id,
        author_pen: me.pen_name,
        body: text,
        created_at: nowIso()
      };
      data.guestbook = data.guestbook || [];
      data.guestbook.push(row);
      writeLocal(data);
      GUESTBOOK_STATUS = 'ok';
      return mapGuestbook(row);
    }

    var res = await state.client
      .from('guestbook')
      .insert({ owner_id: ownerId, author_id: me.id, author_pen: me.pen_name, body: text })
      .select('*')
      .single();
    if (res.error) {
      if (isGuestbookMissing(res.error)) {
        GUESTBOOK_STATUS = 'missing';
        throw new Error('방명록 방이 아직 준비 중이에요. 잠시 뒤에 다시 남겨 주세요.');
      }
      throw new Error('방명록을 남기지 못했어요. ' + (res.error.message || '잠시 뒤에 다시 시도해 주세요.'));
    }
    GUESTBOOK_STATUS = 'ok';
    return mapGuestbook(res.data);
  }

  async function deleteGuestbook(id) {
    var me = state.profile;
    assert(me, '먼저 필명으로 시작해 주세요.');
    if (!id) return false;

    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var row = (data.guestbook || []).filter(function (g) { return g.id === id; })[0];
      if (!row) return false;
      assert(row.author_id === me.id || row.owner_id === me.id,
        '내가 남긴 인사나 내 다락방의 인사만 지울 수 있어요.');
      data.guestbook = (data.guestbook || []).filter(function (g) { return g.id !== id; });
      writeLocal(data);
      return true;
    }

    var res = await state.client.from('guestbook').delete().eq('id', id);
    if (res.error) {
      if (isGuestbookMissing(res.error)) {
        GUESTBOOK_STATUS = 'missing';
        return false;
      }
      throw new Error('방명록을 지우지 못했어요. ' + (res.error.message || '잠시 뒤에 다시 시도해 주세요.'));
    }
    return true;
  }

  /* -------------------------------------------------- 마음(좋아요) */
  /* 지금은 기기(브라우저)에만 기억합니다. 다음 단계에서 DB에 저장할 예정이에요. */
  function readLikes() {
    try {
      return JSON.parse(window.localStorage.getItem(LIKE_KEY) || '{}') || {};
    } catch (err) {
      return {};
    }
  }

  function writeLikes(map) {
    try {
      window.localStorage.setItem(LIKE_KEY, JSON.stringify(map));
    } catch (err) { /* 무시 */ }
  }

  function isLiked(id) {
    return !!readLikes()[id];
  }

  function toggleLike(id) {
    var map = readLikes();
    if (map[id]) delete map[id];
    else map[id] = 1;
    writeLikes(map);
    return !!map[id];
  }

  /* -------------------------------------------------- 사진 올리기 */
  async function uploadImage(blob, filename) {
    assert(blob, '사진을 읽지 못했어요.');
    var me = state.profile;
    assert(me, '먼저 필명으로 시작해 주세요.');

    if (state.mode === 'local') {
      return blobToDataUrl(blob);
    }

    var bucket = CONFIG.storageBucket || 'artworks';
    var name = (filename || 'photo.jpg').replace(/[^a-zA-Z0-9._-]/g, '') || 'photo.jpg';
    var path = me.id + '/' + Date.now().toString(36) + '-' + name;

    var res = await state.client.storage.from(bucket).upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: false
    });
    if (res.error) throw new Error('사진을 올리지 못했어요. ' + res.error.message);

    var pub = state.client.storage.from(bucket).getPublicUrl(path);
    return pub.data.publicUrl;
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(new Error('사진을 읽지 못했어요.')); };
      reader.readAsDataURL(blob);
    });
  }

  /* -------------------------------------------------- 공지사항 */
  function mapNotice(row) {
    return {
      id: row.id,
      title: row.title || '',
      body: row.body || '',
      is_active: row.is_active !== false,
      created_at: row.created_at,
      updated_at: row.updated_at || row.created_at
    };
  }

  async function listNotices(includeInactive) {
    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var list = (data.notices || []).slice();
      if (!includeInactive) list = list.filter(function (n) { return n.is_active; });
      return list.map(mapNotice).sort(function (a, b) {
        return String(b.created_at).localeCompare(String(a.created_at));
      });
    }

    var res = await state.client.from('notices').select('*').order('created_at', { ascending: false });
    if (res.error) {
      console.warn('[아트다락방] 공지를 읽지 못했어요.', res.error);
      return [];
    }
    var rows = (res.data || []).map(mapNotice);
    return includeInactive ? rows : rows.filter(function (n) { return n.is_active; });
  }

  async function activeNotice() {
    var list = await listNotices(false);
    return list[0] || null;
  }

  async function saveNotice(payload) {
    payload = payload || {};
    var title = String(payload.title || '').trim();
    var body = String(payload.body || '').trim();
    var isActive = payload.is_active !== false;
    assert(title.length >= 1, '공지 제목을 적어 주세요.');
    assert(title.length <= 60, '제목은 60자까지 쓸 수 있어요.');
    assert(body.length <= 600, '내용은 600자까지 쓸 수 있어요.');

    if (state.mode === 'local') {
      var data = bootstrapLocal();
      data.notices = data.notices || [];
      if (payload.id) {
        var row = data.notices.filter(function (n) { return n.id === payload.id; })[0];
        if (!row) throw new Error('공지를 찾지 못했어요.');
        Object.assign(row, { title: title, body: body, is_active: isActive, updated_at: nowIso() });
      } else {
        data.notices.push({
          id: uid('n'), title: title, body: body, is_active: isActive,
          created_at: nowIso(), updated_at: nowIso()
        });
      }
      writeLocal(data);
      return true;
    }

    var result;
    if (payload.id) {
      result = await state.client.from('notices')
        .update({ title: title, body: body, is_active: isActive, updated_at: nowIso() })
        .eq('id', payload.id);
    } else {
      result = await state.client.from('notices')
        .insert({ title: title, body: body, is_active: isActive });
    }
    if (result.error) throw new Error('공지를 저장하지 못했어요. ' + result.error.message);
    return true;
  }

  async function deleteNotice(id) {
    if (state.mode === 'local') {
      var data = bootstrapLocal();
      data.notices = (data.notices || []).filter(function (n) { return n.id !== id; });
      writeLocal(data);
      return true;
    }
    var res = await state.client.from('notices').delete().eq('id', id);
    if (res.error) throw new Error('공지를 지우지 못했어요. ' + res.error.message);
    return true;
  }

  /* -------------------------------------------------- 관리자 기능 */
  /* 관리자 여부: 연결 모드에서는 profiles.is_admin,
     체험 모드에서는 관리자 화면에서 비밀번호를 넣었을 때(sessionStorage)입니다. */
  function isAdmin() {
    if (readAdminFlag()) return true;
    return !!(state.profile && state.profile.is_admin);
  }

  function readAdminFlag() {
    try { return window.sessionStorage.getItem(ADMIN_KEY) === '1'; } catch (err) { return false; }
  }

  function setDemoAdmin(on) {
    try {
      if (on) window.sessionStorage.setItem(ADMIN_KEY, '1');
      else window.sessionStorage.removeItem(ADMIN_KEY);
    } catch (err) { /* 무시 */ }
    notify();
  }

  async function setArtworkFlags(id, patch) {
    patch = patch || {};
    var next = {};
    if (typeof patch.is_featured === 'boolean') next.is_featured = patch.is_featured;
    if (typeof patch.is_hidden === 'boolean') next.is_hidden = patch.is_hidden;
    assert(Object.keys(next).length > 0, '바꿀 내용이 없어요.');

    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var row = data.artworks.filter(function (w) { return w.id === id; })[0];
      if (!row) throw new Error('작품을 찾지 못했어요.');
      Object.assign(row, next);
      writeLocal(data);
      return true;
    }

    var res = await state.client.from('artworks').update(next).eq('id', id);
    if (res.error) throw new Error('작품 상태를 바꾸지 못했어요. ' + res.error.message);
    return true;
  }

  async function adminDeleteArtwork(id) {
    if (state.mode === 'local') {
      var data = bootstrapLocal();
      data.artworks = data.artworks.filter(function (w) { return w.id !== id; });
      data.comments = data.comments.filter(function (c) { return c.artwork_id !== id; });
      writeLocal(data);
      return true;
    }
    var res = await state.client.from('artworks').delete().eq('id', id);
    if (res.error) throw new Error('작품을 지우지 못했어요. ' + res.error.message);
    return true;
  }

  async function listAllComments() {
    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var titles = {};
      data.artworks.forEach(function (w) { titles[w.id] = w; });
      return data.comments.map(function (c) {
        var work = titles[c.artwork_id] || {};
        return Object.assign(mapComment(c), {
          artwork_title: work.title || '(지워진 작품)',
          artwork_field: work.field || ''
        });
      }).sort(function (a, b) { return String(b.created_at).localeCompare(String(a.created_at)); });
    }

    var res = await state.client
      .from('comments')
      .select('*, artworks(title, field)')
      .order('created_at', { ascending: false });
    if (res.error) {
      console.warn('[아트다락방] 댓글을 읽지 못했어요.', res.error);
      return [];
    }
    return (res.data || []).map(function (row) {
      return Object.assign(mapComment(row), {
        artwork_title: row.artworks ? row.artworks.title : '(지워진 작품)',
        artwork_field: row.artworks ? row.artworks.field : ''
      });
    });
  }

  async function adminDeleteComment(id) {
    if (state.mode === 'local') {
      var data = bootstrapLocal();
      data.comments = data.comments.filter(function (c) { return c.id !== id; });
      writeLocal(data);
      return true;
    }
    var res = await state.client.from('comments').delete().eq('id', id);
    if (res.error) throw new Error('댓글을 지우지 못했어요. ' + res.error.message);
    return true;
  }

  async function listProfiles() {
    if (state.mode === 'local') {
      var data = bootstrapLocal();
      return (data.profiles || []).map(function (p) {
        return Object.assign(publicProfile(p), { created_at: p.created_at });
      }).sort(function (a, b) { return String(a.created_at).localeCompare(String(b.created_at)); });
    }

    var res = await state.client.from('profiles').select('*').order('created_at', { ascending: true });
    if (res.error) {
      console.warn('[아트다락방] 회원을 읽지 못했어요.', res.error);
      return [];
    }
    return (res.data || []).map(publicProfile);
  }

  /* -------------------------------------------------- 이웃 다락방 */
  /* 문을 연(잠기지 않은) 입주자 목록 — '이웃 다락방 놀러가기' 카드에 씁니다.
     카드에 아바타·필명·소개·분야·벽지를 함께 보여 주려고 공개 칸만 골라 읽고,
     읽지 못해도 화면이 멈추지 않도록 빈 목록으로 조용히 넘어갑니다. */
  async function listNeighbors() {
    if (state.mode === 'local') {
      var data = bootstrapLocal();
      return (data.profiles || [])
        .filter(function (p) { return !p.is_blocked; })
        .map(function (p) {
          return Object.assign(publicProfile(p), { created_at: p.created_at });
        })
        .sort(function (a, b) {
          return String(b.created_at).localeCompare(String(a.created_at));
        });
    }

    var res = await state.client
      .from('profiles')
      .select('id, pen_name, bio, fields, attic_theme, attic_props, created_at')
      .eq('is_blocked', false)
      .order('created_at', { ascending: false });
    if (res.error) {
      state.lastError = res.error.message;
      console.warn('[아트다락방] 이웃 다락방을 읽지 못했어요.', res.error);
      return [];
    }
    return (res.data || []).map(function (row) {
      return Object.assign(publicProfile(row), { created_at: row.created_at });
    });
  }

  /* 다른 사람의 다락방 구경(?pen=필명) — 공개할 수 있는 프로필만 돌려줍니다. */
  async function profileByPen(pen) {
    var name = normalizePen(pen);
    if (!name) return null;

    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var row = (data.profiles || []).filter(function (p) {
        return penKey(p.pen_name) === penKey(name);
      })[0];
      if (!row || row.is_blocked) return null;
      return publicProfile(row);
    }

    var res = await state.client.from('profiles').select('*').ilike('pen_name', name).limit(5);
    if (res.error) {
      console.warn('[아트다락방] 다락방 주인을 찾지 못했어요.', res.error);
      return null;
    }
    var found = (res.data || []).filter(function (r) {
      return penKey(r.pen_name) === penKey(name);
    })[0];
    if (!found || found.is_blocked) return null;
    return publicProfile(found);
  }

  async function setProfileFlags(id, patch) {
    patch = patch || {};
    var next = {};
    if (typeof patch.is_blocked === 'boolean') next.is_blocked = patch.is_blocked;
    if (typeof patch.is_admin === 'boolean') next.is_admin = patch.is_admin;
    assert(Object.keys(next).length > 0, '바꿀 내용이 없어요.');

    if (state.mode === 'local') {
      var data = bootstrapLocal();
      var row = data.profiles.filter(function (p) { return p.id === id; })[0];
      if (!row) throw new Error('회원을 찾지 못했어요.');
      Object.assign(row, next);
      writeLocal(data);
      return true;
    }

    var res = await state.client.from('profiles').update(next).eq('id', id);
    if (res.error) throw new Error('회원 상태를 바꾸지 못했어요. ' + res.error.message);
    return true;
  }

  /* -------------------------------------------------- 바깥에 내놓는 것 */
  function resetLocal() {
    try {
      window.localStorage.removeItem(LOCAL_KEY);
      window.localStorage.removeItem(LIKE_KEY);
    } catch (err) { /* 무시 */ }
    state.profile = null;
    bootstrapLocal();
    notify();
  }

  window.DarakStore = {
    FIELDS: FIELDS,
    STATUSES: STATUSES,
    ATTIC_THEMES: ATTIC_THEMES,
    DEFAULT_THEME: DEFAULT_THEME,
    ATTIC_MOODS: ATTIC_MOODS,
    ATTIC_PROPS: ATTIC_PROPS,
    ATTIC_VIEWS: ATTIC_VIEWS,
    DEFAULT_VIEW: DEFAULT_VIEW,
    ATTIC_POSES: ATTIC_POSES,
    DEFAULT_POSE: DEFAULT_POSE,
    normalizeAtticView: normalizeAtticView,
    DEFAULT_MOOD: DEFAULT_MOOD,
    ATTIC_AVATARS: ATTIC_AVATARS,
    ATTIC_GENDERS: ATTIC_GENDERS,
    avatarByKey: avatarByKey,
    /* 친구 기능처럼 다른 파일이 같은 Supabase 연결을 함께 쓸 때 (연결 전이면 null) */
    get client() { return state.client; },
    normalizeCharacter: normalizeCharacter,
    characterValue: characterValue,
    CHARACTER_GENDER_LABEL: CHARACTER_GENDER_LABEL,
    normalizeGender: normalizeGender,
    normalizeAtticProps: normalizeAtticProps,
    normalizePropPos: normalizePropPos,
    init: async function () {
      if (state.mode === 'cloud') {
        try {
          await initCloud();
        } catch (err) {
          console.warn('[아트다락방] DB에 연결하지 못해 체험 모드로 엽니다.', err);
          state.mode = 'local';
          state.client = null;
          state.lastError = err && err.message;
          bootstrapLocal();
          state.profile = localProfile();
        }
      } else {
        bootstrapLocal();
        state.profile = localProfile();
      }
      return state.mode;
    },
    get mode() { return state.mode; },
    get lastError() { return state.lastError; },
    onAuth: function (fn) { state.listeners.push(fn); },
    profile: function () { return state.profile; },
    profileByPen: profileByPen,
    listNeighbors: listNeighbors,
    listGuestbook: listGuestbook,
    addGuestbook: addGuestbook,
    deleteGuestbook: deleteGuestbook,
    guestbookStatus: guestbookStatus,
    isGuestbookMissing: isGuestbookMissing,
    signUp: signUp,
    signIn: signIn,
    changePassword: changePassword,
    signOut: signOut,
    updateProfile: updateProfile,
    listArtworks: listArtworks,
    getArtwork: getArtwork,
    createArtwork: createArtwork,
    deleteArtwork: deleteArtwork,
    listComments: listComments,
    addComment: addComment,
    deleteComment: deleteComment,
    commentsForAuthor: commentsForAuthor,
    isLiked: isLiked,
    toggleLike: toggleLike,
    uploadImage: uploadImage,
    listNotices: listNotices,
    activeNotice: activeNotice,
    saveNotice: saveNotice,
    deleteNotice: deleteNotice,
    isAdmin: isAdmin,
    setDemoAdmin: setDemoAdmin,
    setArtworkFlags: setArtworkFlags,
    adminDeleteArtwork: adminDeleteArtwork,
    listAllComments: listAllComments,
    adminDeleteComment: adminDeleteComment,
    listProfiles: listProfiles,
    setProfileFlags: setProfileFlags,
    resetLocal: resetLocal
  };
})();
/* [3단계] 친구 신청·수락 - 데이터 부분 (store.js 맨 아래에 붙이기) */
(function (global) {
  'use strict';

  var TABLE = 'friendships';
  var DEMO_KEY = 'artdarak.friends.demo.v1';
  var _sb = null;

  var DEMO_FRIENDS = [
    { id: 'demo:1', pen_name: '달빛우물', bio: '밤마다 시를 한 줄씩 적어요.', attic_props: {} },
    { id: 'demo:2', pen_name: '솜사탕화실', bio: '분홍빛 수채화를 모으는 중이에요.', attic_props: {} }
  ];

  // 기존 store.js 에 Supabase 클라이언트 변수가 있으면 ① 줄을 그 이름으로 바꾸세요
  function getSb() {
    if (_sb) return _sb;
    if (global.DarakStore && global.DarakStore.client) return (_sb = global.DarakStore.client); // ①
    if (global.__darakSb) return (_sb = global.__darakSb);
    var cfg = global.DARAK_CONFIG || {};
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return null;
    if (!global.supabase || typeof global.supabase.createClient !== 'function') return null;
    _sb = global.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    return _sb;
  }

  function mode() { return getSb() ? 'db' : 'demo'; }

  /* 표가 아직 없거나, 있어도 열 권한이 없는 경우 — 화면은 조용한 '준비 중' 안내로 넘어갑니다. */
  function isMissing(err) {
    if (!err) return false;
    var code = String(err.code || '');
    var msg = String(err.message || '').toLowerCase();
    return code === 'PGRST205' || code === '42P01' || code === '42501' || code === '42703' || err.status === 404 ||
      msg.indexOf('could not find the table') !== -1 ||
      msg.indexOf('schema cache') !== -1 ||
      msg.indexOf('permission denied') !== -1 ||
      (msg.indexOf('relation') !== -1 && msg.indexOf('does not exist') !== -1) ||
      (msg.indexOf('column') !== -1 && msg.indexOf('does not exist') !== -1);
  }

  function fail(err) {
    return { ok: false, missing: isMissing(err), error: err || null, code: err && err.code };
  }

  function lsGet() {
    try { return JSON.parse(global.localStorage.getItem(DEMO_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function lsSet(o) {
    try { global.localStorage.setItem(DEMO_KEY, JSON.stringify(o)); } catch (e) {}
  }

  function norm(p) {
    if (!p) return null;
    var props = p.attic_props;
    if (typeof props === 'string') { try { props = JSON.parse(props); } catch (e) { props = {}; } }
    if (!props || typeof props !== 'object' || Array.isArray(props)) props = {};
    return { id: p.id, pen_name: p.pen_name || '', bio: p.bio || p.intro || '', attic_props: props };
  }

  async function profilesByIds(ids) {
    var map = {};
    if (!ids.length) return { ok: true, map: map };
    var r = await getSb().from('profiles').select('*').in('id', ids);
    if (r.error) return fail(r.error);
    (r.data || []).forEach(function (p) { map[p.id] = norm(p); });
    return { ok: true, map: map };
  }

  async function context(pen) {
    var sb = getSb();
    pen = (pen || '').trim();
    if (!sb) {
      /* 체험 모드 — 이 브라우저에 저장된 내 필명을 '나'로 씁니다. */
      var local = global.DarakStore && typeof global.DarakStore.profile === 'function'
        ? global.DarakStore.profile()
        : null;
      var key = function (value) { return String(value == null ? '' : value).trim().toLowerCase(); };
      return {
        mode: 'demo', loggedIn: !!local, me: local,
        owner: pen ? { id: 'demo:' + pen, pen_name: pen } : null,
        isOwn: !!(local && pen && key(local.pen_name) === key(pen))
      };
    }
    var uid = null;
    try {
      var s = await sb.auth.getSession();
      uid = s && s.data && s.data.session && s.data.session.user ? s.data.session.user.id : null;
    } catch (e) { uid = null; }

    var me = null;
    if (uid) {
      var mr = await sb.from('profiles').select('*').eq('id', uid).maybeSingle();
      me = mr.error ? null : norm(mr.data);
    }
    var owner = me;
    if (pen) {
      var or = await sb.from('profiles').select('*').eq('pen_name', pen).maybeSingle();
      owner = or.error ? null : norm(or.data);
    }
    return {
      mode: 'db', loggedIn: !!uid, me: me, owner: owner,
      isOwn: !!(me && owner && me.id === owner.id)
    };
  }

  async function status(meId, otherId) {
    if (mode() === 'demo') {
      var s = lsGet()[otherId];
      return { ok: true, state: s === 'sent' ? 'sent' : 'none', row: s ? { id: 'demo:' + otherId } : null };
    }
    var q = await getSb().from(TABLE).select('*')
      .or('and(requester_id.eq.' + meId + ',addressee_id.eq.' + otherId + '),' +
          'and(requester_id.eq.' + otherId + ',addressee_id.eq.' + meId + ')')
      .limit(1);
    if (q.error) return fail(q.error);
    var row = q.data && q.data[0] ? q.data[0] : null;
    var state = 'none';
    if (row) state = row.status === 'accepted' ? 'friends' : (row.requester_id === meId ? 'sent' : 'received');
    return { ok: true, state: state, row: row };
  }

  async function request(meId, otherId) {
    if (mode() === 'demo') {
      var m = lsGet(); m[otherId] = 'sent'; lsSet(m);
      return status(meId, otherId);
    }
    var ins = await getSb().from(TABLE)
      .insert({ requester_id: meId, addressee_id: otherId, status: 'pending' })
      .select().limit(1);
    if (ins.error) {
      if (ins.error.code === '23505') {
        var st = await status(meId, otherId);
        if (st.ok && st.state === 'received') return accept(st.row.id);
        return st;
      }
      return fail(ins.error);
    }
    return { ok: true, state: 'sent', row: ins.data && ins.data[0] ? ins.data[0] : null };
  }

  async function accept(rowId) {
    if (mode() === 'demo') return { ok: true, state: 'friends', row: { id: rowId } };
    var u = await getSb().from(TABLE).update({ status: 'accepted' })
      .eq('id', rowId).eq('status', 'pending').select();
    if (u.error) return fail(u.error);
    if (!u.data || !u.data.length) return { ok: false, stale: true };
    return { ok: true, state: 'friends', row: u.data[0] };
  }

  async function remove(rowId) {
    if (mode() === 'demo') {
      var key = String(rowId).replace(/^demo:/, '');
      var m = lsGet(); delete m[key]; lsSet(m);
      return { ok: true, state: 'none', row: null };
    }
    var d = await getSb().from(TABLE).delete().eq('id', rowId).select();
    if (d.error) return fail(d.error);
    return { ok: true, state: 'none', row: null };
  }

  async function listIncoming(meId) {
    if (mode() === 'demo') return { ok: true, data: [] };
    var q = await getSb().from(TABLE).select('*')
      .eq('addressee_id', meId).eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (q.error) return fail(q.error);
    var rows = q.data || [];
    var pr = await profilesByIds(rows.map(function (r) { return r.requester_id; }));
    if (!pr.ok) return pr;
    return {
      ok: true,
      data: rows.map(function (r) {
        return { rowId: r.id, created_at: r.created_at, profile: pr.map[r.requester_id] || null };
      }).filter(function (x) { return x.profile; })
    };
  }

  async function listFriends(meId) {
    if (mode() === 'demo') {
      return {
        ok: true, demo: true,
        data: DEMO_FRIENDS.map(function (p) { return { rowId: p.id, created_at: null, profile: p }; })
      };
    }
    var q = await getSb().from(TABLE).select('*')
      .eq('status', 'accepted')
      .or('requester_id.eq.' + meId + ',addressee_id.eq.' + meId)
      .order('created_at', { ascending: false });
    if (q.error) return fail(q.error);
    var rows = q.data || [];
    var otherOf = function (r) { return r.requester_id === meId ? r.addressee_id : r.requester_id; };
    var pr = await profilesByIds(rows.map(otherOf));
    if (!pr.ok) return pr;
    return {
      ok: true,
      data: rows.map(function (r) {
        return { rowId: r.id, created_at: r.created_at, profile: pr.map[otherOf(r)] || null };
      }).filter(function (x) { return x.profile; })
    };
  }

  global.DarakFriends = {
    mode: mode, context: context, status: status, request: request,
    accept: accept, cancel: remove, decline: remove, unfriend: remove,
    listIncoming: listIncoming, listFriends: listFriends, isMissing: isMissing
  };
})(window);
/* [3단계] 친구 신청·수락 - 화면 부분 (app.js 맨 아래에 붙이기) */
(function () {
  'use strict';

  var global = window;

  var MSG = {
    notReady: '친구 방을 준비하고 있어요.',
    failed: '처리하지 못했어요. 잠시 뒤 다시 눌러 주세요.',
    loadFailed: '친구 목록을 불러오지 못했어요. 새로 고침해 주세요.',
    loginHint: '로그인하면 친구 신청을 보낼 수 있어요.',
    demoNote: '체험 모드 · 이 브라우저에만 저장돼요.',
    demoFriends: '체험 모드 · 예시 친구예요. Supabase를 연결하고 가입하면 진짜 이웃과 친구가 될 수 있어요.',
    unfriendAsk: '친구를 끊을까요? 다시 친구가 되려면 새로 신청해야 해요.'
  };

  var SECTION_HTML = [
    '<section class="friends" id="friends-section" aria-labelledby="friends-title" hidden>',
    '  <div class="friends__head"><h3 id="friends-title">내 친구 다락방 <span class="friends__count" data-friends-count></span></h3></div>',
    '  <p class="friends__note" data-friends-note role="status" aria-live="polite" hidden></p>',
    '  <div class="friend-requests" data-friend-requests hidden>',
    '    <h4 class="friend-requests__title">받은 친구 신청 <span class="friends__count" data-requests-count></span></h4>',
    '    <ul class="friend-requests__list" data-requests-list></ul>',
    '  </div>',
    '  <ul class="friend-grid" data-friends-list></ul>',
    '  <p class="friends__empty" data-friends-empty hidden>아직 친구가 없어요. 이웃 다락방에 놀러 가서 [친구 신청]을 눌러 보세요.</p>',
    '</section>'
  ].join('\n');

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else n.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) {
      if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  function penUrl(pen) { return 'darakbang.html?pen=' + encodeURIComponent(pen); }

  var NO_PHOTO = { '': 1, letter: 1, none: 1, text: 1, default: 1 };
  function avatarNode(p) {
    var pen = (p && p.pen_name) || '';
    var letter = Array.from(pen)[0] || '✦';
    var box = el('span', { 'class': 'friend-avatar', 'aria-hidden': 'true' });
    var id = p && p.attic_props && p.attic_props.avatar;
    var entry = id && global.DarakStore && global.DarakStore.avatarByKey ? global.DarakStore.avatarByKey(id) : null;
    var photo = entry && entry.photo;
    if (typeof photo === 'string' && !NO_PHOTO[photo] && /^[a-z0-9_-]+$/i.test(photo)) {
      var img = el('img', { src: 'images/avatars/' + photo + '.webp', alt: '', loading: 'lazy', width: '48', height: '48' });
      img.addEventListener('error', function () { box.textContent = letter; });
      box.appendChild(img);
    } else {
      box.textContent = letter;
    }
    return box;
  }

  function ensureSection() {
    var sec = document.getElementById('friends-section');
    if (sec) return sec;
    var card = document.getElementById('profile-card');
    if (!card || !card.parentNode) return null;
    var tmp = document.createElement('div');
    tmp.innerHTML = SECTION_HTML;
    sec = tmp.firstElementChild;
    card.parentNode.insertBefore(sec, card.nextSibling);
    return sec;
  }

  function ensureActions() {
    var box = document.querySelector('[data-friend-actions]');
    if (box) return box;
    box = el('div', { 'class': 'friend-actions', 'data-friend-actions': true, hidden: true }, [
      el('div', { 'class': 'friend-actions__row', 'data-friend-buttons': true }),
      el('p', { 'class': 'friend-actions__note', 'data-friend-note': true, role: 'status', 'aria-live': 'polite' })
    ]);
    /* 이름·소개가 끝난 자리(분야 태그 아래)에 놓아 프로필을 가리지 않게 합니다. */
    var tags = document.querySelector('#profile-card .profile__tags');
    if (tags && tags.parentNode) { tags.parentNode.insertBefore(box, tags.nextSibling); return box; }
    var nameRow = document.querySelector('#profile-card .profile__name-row');
    if (nameRow && nameRow.parentNode) { nameRow.parentNode.insertBefore(box, nameRow.nextSibling); return box; }
    var top = document.querySelector('#profile-card .profile__top');
    if (top && top.parentNode) { top.parentNode.insertBefore(box, top.nextSibling); return box; }
    var body = document.querySelector('#profile-card .profile__body');
    if (body) { body.insertBefore(box, body.firstChild); return box; }
    return null;
  }

  /* 남의 다락방: 상태별 버튼 */
  function button(children, action, variant, data) {
    var attrs = { type: 'button', 'data-friend-act': action || '' };
    var cls = 'btn btn--sm ' + (variant || 'btn--ghost');
    Object.keys(data || {}).forEach(function (key) {
      var value = data[key];
      if (key === 'class') { if (value) cls += ' ' + value; }
      else if (value !== null && value !== undefined && value !== '') attrs[key] = value;
    });
    attrs['class'] = cls;
    return el('button', attrs, children || []);
  }

  function setNote(node, text) {
    if (!node) return;
    node.textContent = text || '';
    node.hidden = !text;
  }

  function failedNote(res) {
    return res && res.missing ? MSG.notReady : MSG.failed;
  }

  function samePen(a, b) {
    var key = function (value) {
      return String(value == null ? '' : value).trim().toLowerCase().replace(/\s+/g, '');
    };
    return !!key(a) && key(a) === key(b);
  }

  function ownPen() {
    return (new URLSearchParams(global.location.search).get('pen') || '').trim();
  }

  function myProfile() {
    return global.DarakStore && typeof global.DarakStore.profile === 'function'
      ? global.DarakStore.profile()
      : null;
  }

  /* 동작이 실패했을 때는 상태 버튼 자리에 그 까닭을 한 번 보여 줍니다. */
  var LAST_ERROR = '';
  function takeError() {
    var text = LAST_ERROR;
    LAST_ERROR = '';
    return text;
  }

  function hideActions() {
    var box = document.querySelector('[data-friend-actions]');
    if (box) box.hidden = true;
  }

  var BUSY = false;
  var SEQ = 0;

  /* -------------------------------------------------- 남의 다락방 */
  async function paintActions(pen, me, owner) {
    var F = global.DarakFriends;
    var box = ensureActions();
    if (!box) return;
    var row = box.querySelector('[data-friend-buttons]');
    var note = box.querySelector('[data-friend-note]');
    if (!row) return;

    var seq = ++SEQ;
    if (!F || !pen) { box.hidden = true; return; }

    /* 필명으로 들어오기 전 — 들어오면 친구 신청을 보낼 수 있어요. */
    if (!me) {
      row.innerHTML = '';
      row.appendChild(el('button', {
        'class': 'btn btn--ghost btn--sm', type: 'button', 'data-open-auth': 'signin'
      }, ['로그인하고 친구 신청']));
      setNote(note, takeError() || MSG.loginHint);
      box.hidden = false;
      return;
    }

    if (!owner) {
      try {
        var ctx = await F.context(pen);
        owner = ctx && ctx.owner;
      } catch (err) {
        owner = null;
      }
      if (seq !== SEQ) return;
    }
    if (!owner || owner.id === me.id) { box.hidden = true; return; }

    var res = null;
    try { res = await F.status(me.id, owner.id); } catch (err) { res = { ok: false, error: err }; }
    if (seq !== SEQ) return;

    row.innerHTML = '';
    if (!res || !res.ok) {
      setNote(note, takeError() || failedNote(res));
      box.hidden = false;
      return;
    }

    var data = { 'data-row': (res.row && res.row.id) || '', 'data-pen': owner.pen_name };
    var text = '';

    if (res.state === 'friends') {
      row.appendChild(button(['친구 끊기'], 'unfriend', 'btn--ghost', data));
      text = owner.pen_name + '님과 친구예요. 새 작품이 걸리면 놀러 와 보세요.';
    } else if (res.state === 'sent') {
      row.appendChild(button(['신청 취소'], 'cancel', 'btn--ghost', data));
      text = '친구 신청을 보냈어요. 상대가 수락하면 친구가 돼요.';
    } else if (res.state === 'received') {
      row.appendChild(button(['친구 신청 수락'], 'accept', 'btn--primary', data));
      row.appendChild(button(['거절'], 'decline', 'btn--ghost', data));
      text = owner.pen_name + '님에게서 친구 신청이 왔어요.';
    } else {
      row.appendChild(button(['친구 신청'], 'request', 'btn--primary', data));
      text = F.mode() === 'demo' ? MSG.demoNote : '';
    }

    setNote(note, takeError() || text);
    box.hidden = false;
  }

  /* -------------------------------------------------- 내 다락방 */
  function friendRow(p, rowId, demo) {
    var kids = [
      el('a', { 'class': 'friend-card__who', href: penUrl(p.pen_name) }, [
        avatarNode(p),
        el('span', { 'class': 'friend-card__text' }, [
          el('b', { 'class': 'friend-card__pen', text: p.pen_name }),
          el('span', { 'class': 'friend-card__bio', text: p.bio || '아직 소개가 없어요.' })
        ])
      ])
    ];
    if (!demo) {
      kids.push(button(['친구 끊기'], 'unfriend', 'btn--ghost', {
        'class': 'friend-card__more',
        'data-row': rowId,
        'data-pen': p.pen_name,
        'aria-label': p.pen_name + '님과 친구 끊기'
      }));
    }
    return el('li', { 'class': 'friend-card' }, kids);
  }

  function requestRow(item) {
    var p = item.profile || {};
    var data = { 'data-row': item.rowId, 'data-pen': p.pen_name };
    return el('li', { 'class': 'friend-request' }, [
      el('a', { 'class': 'friend-request__who', href: penUrl(p.pen_name) }, [
        avatarNode(p),
        el('span', { 'class': 'friend-request__text' }, [
          el('b', { 'class': 'friend-request__pen', text: p.pen_name }),
          el('span', { 'class': 'friend-request__bio', text: p.bio || '친구가 되고 싶어 해요.' })
        ])
      ]),
      el('span', { 'class': 'friend-request__actions' }, [
        button(['수락'], 'accept', 'btn--primary', data),
        button(['거절'], 'decline', 'btn--ghost', data)
      ])
    ]);
  }

  async function paintOwn(me) {
    var F = global.DarakFriends;
    var sec = ensureSection();
    if (!sec) return;
    hideActions();

    var note = sec.querySelector('[data-friends-note]');
    var friendsList = sec.querySelector('[data-friends-list]');
    var emptyEl = sec.querySelector('[data-friends-empty]');
    var countEl = sec.querySelector('[data-friends-count]');
    var reqBox = sec.querySelector('[data-friend-requests]');
    var reqList = sec.querySelector('[data-requests-list]');
    var reqCount = sec.querySelector('[data-requests-count]');

    if (!F || !me) {
      sec.hidden = true;
      return;
    }

    var seq = ++SEQ;
    var friends = null;
    var incoming = null;
    try { friends = await F.listFriends(me.id); } catch (err) { friends = { ok: false, error: err }; }
    try { incoming = await F.listIncoming(me.id); } catch (err) { incoming = { ok: false, error: err }; }
    if (seq !== SEQ) return;

    var friendItems = friends && friends.ok ? friends.data : [];
    var requestItems = incoming && incoming.ok ? incoming.data : [];
    var demo = !!(friends && friends.demo);
    var missing = !!((friends && friends.missing) || (incoming && incoming.missing));

    if (friendsList) {
      friendsList.innerHTML = '';
      friendItems.forEach(function (item) {
        if (item && item.profile) friendsList.appendChild(friendRow(item.profile, item.rowId, demo));
      });
      friendsList.hidden = friendItems.length === 0;
    }
    if (countEl) countEl.textContent = friendItems.length ? friendItems.length + '명' : '';
    if (emptyEl) emptyEl.hidden = friendItems.length > 0 || !(friends && friends.ok);

    if (reqList) {
      reqList.innerHTML = '';
      requestItems.forEach(function (item) { reqList.appendChild(requestRow(item)); });
    }
    if (reqBox) reqBox.hidden = requestItems.length === 0;
    if (reqCount) reqCount.textContent = requestItems.length ? requestItems.length + '개' : '';

    var text = '';
    if (missing) text = MSG.notReady;
    else if (!friends || !friends.ok || !incoming || !incoming.ok) text = MSG.loadFailed;
    else if (demo) text = MSG.demoFriends;

    setNote(note, takeError() || text);
    sec.hidden = false;
  }

  /* -------------------------------------------------- 한 곳에서 그리기 */
  function render(ctx) {
    ctx = ctx || {};
    var me = 'me' in ctx ? ctx.me : myProfile();
    var pen = 'pen' in ctx ? String(ctx.pen || '').trim() : ownPen();
    var other = pen && !(me && samePen(me.pen_name, pen)) ? pen : '';

    if (other) {
      var sec = document.getElementById('friends-section');
      if (sec) sec.hidden = true;
      var owner = ctx.target && samePen(ctx.target.pen_name, other) ? ctx.target : null;
      return paintActions(other, me, owner);
    }

    if (!me || ctx.draftMode) {
      var hidden = document.getElementById('friends-section');
      if (hidden) hidden.hidden = true;
      hideActions();
      return;
    }

    return paintOwn(me);
  }

  /* -------------------------------------------------- 버튼 누르기 */
  async function runAction(node) {
    var F = global.DarakFriends;
    var act = node.getAttribute('data-friend-act') || '';
    var rowId = node.getAttribute('data-row') || '';
    var pen = node.getAttribute('data-pen') || '';
    if (!F || !act || BUSY) return;

    var me = myProfile();
    if (!me) {
      LAST_ERROR = MSG.loginHint;
      return render();
    }
    if (act === 'unfriend' && typeof global.confirm === 'function' && !global.confirm(MSG.unfriendAsk)) return;

    BUSY = true;
    var label = node.textContent;
    node.disabled = true;
    node.textContent = '잠시만요…';

    try {
      var res = null;
      if (act === 'request') {
        var info = await F.context(pen);
        if (!info || !info.me || !info.owner) { LAST_ERROR = MSG.failed; return; }
        res = await F.request(info.me.id, info.owner.id);
      } else if (act === 'accept') res = await F.accept(rowId);
      else if (act === 'decline') res = await F.decline(rowId);
      else if (act === 'cancel') res = await F.cancel(rowId);
      else if (act === 'unfriend') res = await F.unfriend(rowId);

      if (!res || !res.ok) {
        LAST_ERROR = res && res.stale
          ? '이미 처리된 신청이에요. 새로 고쳐 볼게요.'
          : failedNote(res);
      }
    } catch (err) {
      LAST_ERROR = MSG.failed;
      if (global.console && console.warn) console.warn('[아트다락방] 친구 동작에 실패했어요.', err);
    } finally {
      BUSY = false;
      if (node.isConnected) {
        node.disabled = false;
        node.textContent = label;
      }
      render({ pen: pen });
    }
  }

  document.addEventListener('click', function (event) {
    var node = event.target && event.target.closest ? event.target.closest('[data-friend-act]') : null;
    if (!node) return;
    event.preventDefault();
    runAction(node);
  });

  global.DarakFriendsUI = { render: render };
})();
