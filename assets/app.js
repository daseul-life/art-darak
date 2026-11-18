/* ============================================================
   아트다락방 (ART DARAK) — 1단계 화면 스크립트
   ------------------------------------------------------------
   · 모든 페이지 공통: 메뉴, 로그인/가입 창, 저장 모드 안내
   · 홈: 오늘의 작품 · 분야별 숫자
   · 갤러리: 분야·상태·검색·정렬
   · 작품 보기: 작품 소개 + 감상(댓글)
   · 작품 등록: 사진 고르기(자동 축소) + 등록
   · 내 다락방: 내 작품 · 받은 감상 · 벽지 고르기
   ============================================================ */
(function () {
  'use strict';

  var Store = window.DarakStore;

  var FIELDS = ['문학', '미술', '음악', '사진', '공예', '디자인'];
  var FIELD_EMOJI = {
    문학: '📖', 미술: '🎨', 음악: '🎵', 사진: '📷', 공예: '🧶', 디자인: '🖌️'
  };
  var FIELD_KEY = {
    문학: 'literature', 미술: 'art', 음악: 'music', 사진: 'photo', 공예: 'craft', 디자인: 'design'
  };
  var THEME_LABEL = {
    rose: '연분홍 벽', cream: '크림 오후', lavender: '라벤더 밤',
    mint: '세이지 창가', butter: '버터 햇살', sky: '새벽 하늘'
  };

  /* 다락방 사무실 — 작업실 분위기 4종 · 소품 10종 (store.js 의 attic_props 와 같은 키) */
  var MOODS = [
    { key: 'write', label: '창가 서재', sub: '창작 · 글쓰기', icon: 'pen' },
    { key: 'paint', label: '햇살 화실', sub: '그림 · 미술', icon: 'brush' },
    { key: 'music', label: '별빛 작업실', sub: '음악 · 사운드', icon: 'note' },
    { key: 'craft', label: '아늑한 공방', sub: '공예 · 디자인', icon: 'craft' }
  ];
  var MOOD_LABEL = {
    write: '창가 서재', paint: '햇살 화실', music: '별빛 작업실', craft: '아늑한 공방'
  };
  var PROPS = [
    { key: 'easel', label: '이젤 & 캔버스', icon: 'easel' },
    { key: 'desk', label: '원목 책상 & 노트북', icon: 'desk' },
    { key: 'lamp', label: '스탠드 조명', icon: 'lamp' },
    { key: 'guitar', label: '어쿠스틱 기타', icon: 'guitar' },
    { key: 'plant', label: '작은 화분', icon: 'plant' },
    { key: 'tea', label: '찻잔 세트', icon: 'tea' },
    { key: 'garland', label: '전구 가랜드', icon: 'garland' },
    { key: 'cat', label: '고양이 방석', icon: 'cat' },
    { key: 'books', label: '책 더미', icon: 'books' },
    { key: 'vinyl', label: '레코드판', icon: 'vinyl' }
  ];
  var PROP_LABEL = {
    easel: '이젤 & 캔버스', desk: '원목 책상 & 노트북', lamp: '스탠드 조명',
    guitar: '어쿠스틱 기타', plant: '작은 화분', tea: '찻잔 세트', garland: '전구 가랜드',
    cat: '고양이 방석', books: '책 더미', vinyl: '레코드판'
  };

  /* 방 안 캐릭터가 건네는 짧은 인사 — 누를 때마다 한 가지씩 돌아가며 말해요.
     (캐릭터 이름 대신 성향만 묻어 나게 쓴 문장입니다) */
  var ROOM_LINES = {
    seoyun: ['오늘도 한 줄 남겨 볼까요?', '적어 두면 마음이 조금 가벼워져요.', '이 문장, 꽤 마음에 들어요.'],
    haemil: ['색을 조금 더 섞어 볼게요!', '이 빛깔, 어때요?', '물감이 마르기 전에 보러 오세요.'],
    momo: ['밤에 모은 것들, 보여 줄까요?', '이 실 한 가닥이 참 좋아요.', '조용한 밤이 제일 좋아요.'],
    ian: ['조용히 손을 움직이는 시간이 좋아요.', '천천히 다듬으면 더 좋아져요.', '오늘은 나무 결이 참 예뻐요.'],
    haon: ['한 소절만 들려 드릴까요?', '이 선율, 마음에 드나요?', '손끝에서 소리가 피어나요.'],
    doyun: ['한 걸음 걸으면 한 문장이 와요.', '오늘은 어떤 문장을 만날까요?', '천천히 쓰면 더 오래 남아요.']
  };

  /* 소품 칩에 쓰는 작은 선 그림 (이모지 대신) */
  var STUDIO_ICONS = {
    pen: '<path d="M4 20l1.2-4.2L16.4 4.6a1.9 1.9 0 0 1 2.7 2.7L7.9 18.5 4 20z"/><path d="M14.6 6.4l3 3"/>',
    brush: '<path d="M14.5 4.5l5 5-8.2 8.2-5-5z"/><path d="M6.3 12.7L4 20l7.3-2.3"/>',
    note: '<path d="M9 17.5V6.2l10-2v11"/><circle cx="6.6" cy="17.6" r="2.4"/><circle cx="16.6" cy="15.6" r="2.4"/>',
    craft: '<path d="M4 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM4 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/><path d="M6 8l12 10M6 16L18 6"/>',
    easel: '<path d="M12 3v4"/><path d="M5 21l7-13 7 13"/><path d="M7.3 15.4h9.4"/><path d="M9.6 8.6h4.8v4.2H9.6z"/>',
    desk: '<path d="M3 10h18"/><path d="M5 10v11M19 10v11"/><path d="M8 6h8v4H8z"/><path d="M4 15h16"/>',
    lamp: '<path d="M8.4 3h7.2l3.2 7.4H5.2z"/><path d="M12 10.4V20"/><path d="M8.2 20h7.6"/>',
    guitar: '<path d="M9.8 13.4a3.8 3.8 0 1 0 5.4 5.4"/><path d="M9.8 13.4l-1-1M14 17.4c2.4-2.4 2-5.4 4.4-7.8l2-2"/><path d="M18.4 3.6l2 2"/>',
    plant: '<path d="M7 13h10l-1.2 8H8.2z"/><path d="M12 13c-4.6-1-6-5.4-3.8-9 3.4 1.2 4.6 5.6 3.8 9z"/><path d="M12 13c4.6-1 6-5.4 3.8-9-3.4 1.2-4.6 5.6-3.8 9z"/>',
    tea: '<path d="M4 9h11v4.6a4.4 4.4 0 0 1-4.4 4.4H8.4A4.4 4.4 0 0 1 4 13.6z"/><path d="M15 10.2c3.2-.4 4.6 1.4 3 4"/><path d="M7 5.2c0-1 1.4-1.4 1.4-3M11 5.2c0-1 1.4-1.4 1.4-3"/>',
    garland: '<path d="M2.6 6.4c3 6.2 5.4 6.2 8.4 0 3 6.2 5.4 6.2 8.4 0"/><circle cx="6.6" cy="10.4" r="1.2"/><circle cx="12" cy="11.2" r="1.2"/><circle cx="17.4" cy="10.4" r="1.2"/>',
    cat: '<path d="M4.6 19.6c0-4.6 3-7.6 7.4-7.6s7.4 3 7.4 7.6z"/><path d="M6.6 12.4l-1-4 3.4 2M17.4 12.4l1-4-3.4 2"/><path d="M19.4 15.4c2.2.2 2.6 3.2.4 4.2"/>',
    books: '<path d="M4 18.6h12.4V21H4z"/><path d="M5 14.2h12.4v4.4H5z"/><path d="M6 9.8h10.6v4.4H6z"/><path d="M16.6 9.2l3.2 1.2-2.6 8.4-3.2-1.2z"/>',
    vinyl: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1.2"/>'
  };

  function studioIcon(name) {
    return '<svg class="studio-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false" ' +
      'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      (STUDIO_ICONS[name] || '') + '</svg>';
  }

  /* ============================================================
     0. 작은 도우미
     ============================================================ */
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function nf(value) {
    return Number(value || 0).toLocaleString('ko-KR');
  }

  function initial(text) {
    var name = String(text || '').trim();
    return name ? name.slice(0, 1) : '✦';
  }

  /* ============================================================
     0-b. 다락방 캐릭터 (사진 아바타)
     ------------------------------------------------------------
     store.js 의 ATTIC_AVATARS 목록을 그대로 씁니다. 고른 값은
     profiles.attic_props.avatar 에 저장되고, 비어 있으면 예전처럼
     필명 첫 글자를 그립니다.
     ============================================================ */
  var AVATAR_DIR = 'images/avatars/';
  var GENDER_LABEL = { female: '여성', male: '남성' };

  function avatarEntry(key) {
    return Store && Store.avatarByKey ? Store.avatarByKey(key) : null;
  }

  function avatarImgHTML(key, cls) {
    return '<img class="' + cls + '" src="' + AVATAR_DIR + key + '.webp" alt="" ' +
      'width="340" height="340" loading="lazy" decoding="async">';
  }

  /* 아바타 자리(둥근 사각형)에 사진 또는 필명 첫 글자를 그립니다. */
  function paintAvatar(el, profile) {
    if (!el) return;
    var props = (profile && profile.attic_props) || {};
    var entry = avatarEntry(props.avatar);
    if (entry) {
      el.innerHTML = avatarImgHTML(entry.key, 'avatar-img');
      el.classList.add('has-photo');
      el.setAttribute('data-avatar-key', entry.key);
    } else {
      el.textContent = initial(profile && profile.pen_name);
      el.classList.remove('has-photo');
      el.removeAttribute('data-avatar-key');
    }
  }

  /* 성별 칩 — 선택 안 함('') · 여성 · 남성 */
  function genderChipsHTML() {
    return [['', '선택 안 함'], ['female', '여성'], ['male', '남성']].map(function (pair, index) {
      return '<button class="chip' + (index === 0 ? ' is-active' : '') + '" type="button" ' +
        'data-gender-value="' + pair[0] + '" aria-pressed="' + (index === 0) + '">' + pair[1] + '</button>';
    }).join('');
  }

  function createGenderChips(root, onChange) {
    if (!root) return null;
    var state = { value: '' };

    function sync() {
      root.querySelectorAll('[data-gender-value]').forEach(function (chip) {
        var on = chip.getAttribute('data-gender-value') === state.value;
        chip.classList.toggle('is-active', on);
        chip.setAttribute('aria-pressed', String(on));
      });
    }

    root.addEventListener('click', function (event) {
      var chip = event.target.closest ? event.target.closest('[data-gender-value]') : null;
      if (!chip) return;
      state.value = Store.normalizeGender(chip.getAttribute('data-gender-value'));
      sync();
      if (typeof onChange === 'function') onChange(state.value);
    });

    sync();
    return {
      get: function () { return state.value; },
      set: function (next) { state.value = Store.normalizeGender(next); sync(); },
      reset: function () { state.value = ''; sync(); }
    };
  }

  /* 캐릭터 카드 — 사진 + 칭호, 그리고 '글자 기본' 한 장.
     사진 아래에는 칭호만 적고 이름은 쓰지 않습니다.
     위쪽의 전체 / 여성 / 남성 칩으로 골라 볼 수 있습니다. */
  function avatarPickerHTML(modifier) {
    var cards = Store.ATTIC_AVATARS.map(function (item) {
      return '<button class="avatar-card" type="button" data-avatar-card data-avatar="' + item.key + '" ' +
        'data-gender="' + item.gender + '" aria-pressed="false">' +
        '<span class="avatar-card__photo">' + avatarImgHTML(item.key, 'avatar-card__img') +
        '<span class="avatar-card__check" aria-hidden="true">✓</span></span>' +
        '<span class="avatar-card__text"><b class="avatar-card__title">' + item.title + '</b></span>' +
        '</button>';
    }).join('');

    return '<div class="avatar-picker ' + (modifier || '') + '" data-avatar-picker>' +
      '<div class="avatar-filter" role="group" aria-label="성별로 골라 보기">' +
      '<button class="avatar-filter__chip is-active" type="button" data-avatar-filter="all" aria-pressed="true">전체</button>' +
      '<button class="avatar-filter__chip" type="button" data-avatar-filter="female" aria-pressed="false">여성</button>' +
      '<button class="avatar-filter__chip" type="button" data-avatar-filter="male" aria-pressed="false">남성</button>' +
      '</div>' +
      '<div class="avatar-grid">' +
      '<button class="avatar-card avatar-card--letter is-active" type="button" data-avatar-card data-avatar="" aria-pressed="true">' +
      '<span class="avatar-card__photo avatar-card__photo--letter" aria-hidden="true">✦</span>' +
      '<span class="avatar-card__text"><b>글자 기본</b><small>필명 첫 글자</small></span>' +
      '<span class="avatar-card__check" aria-hidden="true">✓</span>' +
      '</button>' + cards +
      '</div></div>';
  }

  function createAvatarPicker(root, onChange) {
    if (!root) return null;
    var state = { avatar: '', filter: 'all' };

    function syncCards() {
      root.querySelectorAll('[data-avatar-card]').forEach(function (card) {
        var on = (card.getAttribute('data-avatar') || '') === state.avatar;
        card.classList.toggle('is-active', on);
        card.setAttribute('aria-pressed', String(on));
        var gender = card.getAttribute('data-gender');
        card.hidden = !!gender && state.filter !== 'all' && gender !== state.filter;
      });
    }

    function syncFilter() {
      root.querySelectorAll('[data-avatar-filter]').forEach(function (chip) {
        var on = chip.getAttribute('data-avatar-filter') === state.filter;
        chip.classList.toggle('is-active', on);
        chip.setAttribute('aria-pressed', String(on));
      });
    }

    root.addEventListener('click', function (event) {
      var filter = event.target.closest ? event.target.closest('[data-avatar-filter]') : null;
      if (filter) {
        state.filter = filter.getAttribute('data-avatar-filter') || 'all';
        syncFilter();
        syncCards();
        return;
      }
      var card = event.target.closest ? event.target.closest('[data-avatar-card]') : null;
      if (!card) return;
      state.avatar = card.getAttribute('data-avatar') || '';
      syncCards();
      if (typeof onChange === 'function') onChange(state.avatar);
    });

    syncCards();
    syncFilter();
    return {
      get: function () { return state.avatar; },
      set: function (key) {
        state.avatar = avatarEntry(key) ? key : '';
        syncCards();
      },
      reset: function () {
        state.avatar = '';
        state.filter = 'all';
        syncCards();
        syncFilter();
      }
    };
  }

  function dateLabel(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return (d.getMonth() + 1) + '월 ' + d.getDate() + '일';
  }

  function timeAgo(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var diff = Date.now() - d.getTime();
    if (diff < 60 * 1000) return '방금';
    if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + '분 전';
    if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + '시간 전';
    if (diff < 7 * 24 * 60 * 60 * 1000) return Math.floor(diff / 86400000) + '일 전';
    return dateLabel(iso);
  }

  function daysSince(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return 1;
    return Math.max(1, Math.floor((Date.now() - d.getTime()) / 86400000) + 1);
  }

  function artClass(work) {
    if (work.is_sample && work.art) return 'art--' + work.art;
    return 'art--field-' + (FIELD_KEY[work.field] || 'literature');
  }

  function artInner(work) {
    if (work.image_url) {
      return '<img src="' + esc(work.image_url) + '" alt="" loading="lazy">';
    }
    return '<span class="work__emoji" aria-hidden="true">' +
      esc(work.emoji || FIELD_EMOJI[work.field] || '✦') + '</span>';
  }

  function setText(selector, text, root) {
    var el = (root || document).querySelector(selector);
    if (el) el.textContent = text;
  }

  function toast(message) {
    var el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.id = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-visible');
    window.clearTimeout(toast._timer);
    toast._timer = window.setTimeout(function () {
      el.classList.remove('is-visible');
    }, 3600);
  }

  /* ============================================================
     1. 작품 카드
     ============================================================ */
  function likeButtonHTML(work) {
    var liked = Store.isLiked(work.id);
    var count = work.like_count + (liked ? 1 : 0);
    return '<button class="like' + (liked ? ' is-liked' : '') + '" type="button" ' +
      'data-like-id="' + esc(work.id) + '" data-base="' + work.like_count + '" ' +
      'aria-pressed="' + (liked ? 'true' : 'false') + '" aria-label="마음 남기기">' +
      '<span class="like__icon" aria-hidden="true">' + (liked ? '♥' : '♡') + '</span>' +
      '<span class="like__count">' + nf(count) + '</span></button>';
  }

  function cardHTML(work) {
    var url = 'work.html?id=' + encodeURIComponent(work.id);
    var comments = work.comment_count
      ? '<span class="result-hint">💬 ' + nf(work.comment_count) + '</span>'
      : '<span class="result-hint"></span>';

    return '<article class="work" data-field="' + esc(work.field) + '" data-status="' + esc(work.status) + '" ' +
      'data-title="' + esc(work.title) + '" data-pen="' + esc(work.pen_name) + '" data-id="' + esc(work.id) + '">' +
      '<a class="work__art ' + artClass(work) + '" href="' + url + '" data-field="' + esc(work.field) + '" ' +
      'aria-label="' + esc(work.title) + ' — ' + esc(work.field) + ' 작품 보기">' +
      artInner(work) +
      '<span class="work__state">' + esc(work.status) + '</span>' +
      '</a>' +
      '<div class="work__body" data-field="' + esc(work.field) + '">' +
      '<div class="work__top"><span class="tag">' + esc(work.field) + '</span>' +
      (work.is_featured ? '<span class="badge-feature">추천</span>' : '') +
      (work.is_hidden ? '<span class="badge-hidden">관리자 숨김</span>' : '') +
      (work.is_sample ? '<span class="badge-sample">예시</span>' : '') + '</div>' +
      '<h3 class="work__title"><a href="' + url + '">' + esc(work.title) + '</a></h3>' +
      '<p class="work__meta">' + esc(work.pen_name) + ' · ' + dateLabel(work.created_at) + '</p>' +
      '<div class="work__foot">' + likeButtonHTML(work) + comments + '</div>' +
      '</div></article>';
  }

  function bindLikes() {
    if (bindLikes.done) return;
    bindLikes.done = true;
    document.addEventListener('click', function (event) {
      var button = event.target.closest ? event.target.closest('.like') : null;
      if (!button) return;
      event.preventDefault();
      var id = button.getAttribute('data-like-id');
      if (!id) return;
      var liked = Store.toggleLike(id);
      var base = Number(button.getAttribute('data-base')) || 0;
      button.classList.toggle('is-liked', liked);
      button.setAttribute('aria-pressed', String(liked));
      var icon = button.querySelector('.like__icon');
      var count = button.querySelector('.like__count');
      if (icon) icon.textContent = liked ? '♥' : '♡';
      if (count) count.textContent = nf(base + (liked ? 1 : 0));
    });
  }

  /* ============================================================
     2. 공통 — 메뉴 · 계정 · 저장 모드 안내
     ============================================================ */
  function setupNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function renderAccount(profile) {
    var buttons = document.querySelectorAll('[data-account]');
    Array.prototype.forEach.call(buttons, function (button) {
      var avatar = button.querySelector('[data-account-avatar]');
      var text = button.querySelector('[data-account-text]');
      if (profile) {
        button.classList.add('is-login');
        button.setAttribute('data-href', 'darakbang.html');
        button.setAttribute('aria-label', profile.pen_name + ' 님의 다락방 열기');
        paintAvatar(avatar, profile);
        if (text) text.textContent = profile.pen_name;
      } else {
        button.classList.remove('is-login');
        button.removeAttribute('data-href');
        button.setAttribute('aria-label', '필명으로 가입하거나 로그인하기');
        if (avatar) {
          avatar.textContent = '✦';
          avatar.classList.remove('has-photo');
          avatar.removeAttribute('data-avatar-key');
        }
        if (text) text.textContent = '필명으로 시작';
      }
    });
  }

  function renderModeNote() {
    var note = document.querySelector('[data-mode-note]');
    if (!note) return;
    if (Store.mode === 'cloud') {
      note.hidden = true;
      return;
    }
    note.hidden = false;
    var text = note.querySelector('[data-mode-text]');
    if (text) {
      text.textContent = '체험 모드 · 지금 남긴 필명과 작품은 이 브라우저에만 저장돼요';
    }
  }

  /* ============================================================
     3. 가입 · 로그인 창
     ============================================================ */
  var auth = { mode: 'signup', modal: null, form: null, errorEl: null, submit: null,
    avatarPicker: null, genderChips: null };

  function authModalHTML() {
    return '' +
      '<div class="modal" id="auth-modal" hidden>' +
      '<div class="modal__backdrop" data-auth-close></div>' +
      '<div class="modal__card" role="dialog" aria-modal="true" aria-labelledby="auth-title">' +
      '<button class="modal__close" type="button" data-auth-close aria-label="닫기">✕</button>' +
      '<p class="kicker">다락방 입주</p>' +
      '<h2 id="auth-title" data-auth-title>필명으로 바로 시작해요</h2>' +
      '<p class="modal__desc" data-auth-desc>이메일 없이 필명과 비밀번호만 정하면 됩니다. 실력이나 경력은 묻지 않아요.</p>' +
      '<div class="auth-tabs" role="tablist" aria-label="가입 또는 로그인">' +
      '<button type="button" class="is-active" data-auth-tab="signup" role="tab" aria-selected="true">처음 왔어요</button>' +
      '<button type="button" data-auth-tab="signin" role="tab" aria-selected="false">다시 왔어요</button>' +
      '</div>' +
      '<form id="auth-form" novalidate>' +
      '<label class="form-field"><span>필명</span>' +
      '<input class="input" name="pen" type="text" maxlength="12" autocomplete="username" placeholder="예: 달빛우물" required>' +
      '</label>' +
      '<label class="form-field"><span>비밀번호</span>' +
      '<input class="input" name="password" type="password" maxlength="72" autocomplete="current-password" placeholder="6자 이상" required>' +
      '</label>' +
      '<label class="form-field" data-signup-only><span>비밀번호 확인</span>' +
      '<input class="input" name="password2" type="password" maxlength="72" autocomplete="new-password" placeholder="한 번 더 적어 주세요">' +
      '</label>' +
      '<div class="form-field" data-signup-only><span>성별 <em>(선택)</em></span>' +
      '<div class="opt-chips" data-auth-genders>' + genderChipsHTML() + '</div>' +
      '<small class="form-note">고르면 내 다락방 프로필에 조그맣게 보여요.</small>' +
      '</div>' +
      '<div class="form-field" data-signup-only><span>다락방 캐릭터 <em>(선택)</em></span>' +
      '<div data-auth-avatar></div>' +
      '<small class="form-note">고르지 않으면 필명 첫 글자가 그려져요.</small>' +
      '</div>' +
      '<p class="form-note" data-signup-only>비밀번호는 다시 들어올 때 필요해요. 이메일은 받지 않습니다.</p>' +
      '<p class="form-error" data-auth-error role="alert" hidden></p>' +
      '<button class="btn btn--primary auth-submit" type="submit" data-auth-submit>다락방 열기</button>' +
      '</form>' +
      '</div></div>';
  }

  function ensureAuthModal() {
    if (document.getElementById('auth-modal')) return;
    document.body.insertAdjacentHTML('beforeend', authModalHTML());

    auth.modal = document.getElementById('auth-modal');
    auth.form = document.getElementById('auth-form');
    auth.errorEl = auth.modal.querySelector('[data-auth-error]');
    auth.submit = auth.modal.querySelector('[data-auth-submit]');

    var avatarRoot = auth.modal.querySelector('[data-auth-avatar]');
    if (avatarRoot) {
      avatarRoot.innerHTML = avatarPickerHTML('avatar-picker--modal');
      auth.avatarPicker = createAvatarPicker(avatarRoot.querySelector('[data-avatar-picker]'));
    }
    auth.genderChips = createGenderChips(auth.modal.querySelector('[data-auth-genders]'));

    auth.modal.addEventListener('click', function (event) {
      if (event.target.hasAttribute('data-auth-close')) closeAuth();
    });

    auth.modal.querySelectorAll('[data-auth-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        setAuthMode(tab.getAttribute('data-auth-tab'));
      });
    });

    auth.form.addEventListener('submit', submitAuth);
  }

  function setAuthMode(mode) {
    auth.mode = mode === 'signin' ? 'signin' : 'signup';
    if (!auth.modal) return;

    auth.modal.querySelectorAll('[data-auth-tab]').forEach(function (tab) {
      var on = tab.getAttribute('data-auth-tab') === auth.mode;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
    });
    auth.modal.querySelectorAll('[data-signup-only]').forEach(function (el) {
      el.hidden = auth.mode !== 'signup';
    });
    var title = auth.modal.querySelector('[data-auth-title]');
    var desc = auth.modal.querySelector('[data-auth-desc]');
    if (title) title.textContent = auth.mode === 'signup' ? '필명으로 바로 시작해요' : '다시 오셨네요';
    if (desc) {
      desc.textContent = auth.mode === 'signup'
        ? '이메일 없이 필명과 비밀번호만 정하면 됩니다. 실력이나 경력은 묻지 않아요.'
        : '필명과 비밀번호를 적어 주세요.';
    }
    if (auth.submit) auth.submit.textContent = auth.mode === 'signup' ? '다락방 열기' : '들어가기';
    var pw = auth.form.querySelector('[name="password"]');
    if (pw) pw.setAttribute('autocomplete', auth.mode === 'signup' ? 'new-password' : 'current-password');
    hideAuthError();
  }

  function showAuthError(message) {
    if (!auth.errorEl) return;
    auth.errorEl.textContent = message;
    auth.errorEl.hidden = false;
  }

  function hideAuthError() {
    if (!auth.errorEl) return;
    auth.errorEl.hidden = true;
    auth.errorEl.textContent = '';
  }

  function openAuth(mode) {
    ensureAuthModal();
    setAuthMode(mode || 'signup');
    auth.modal.hidden = false;
    document.body.classList.add('is-locked');
    window.setTimeout(function () {
      var pen = auth.form.querySelector('[name="pen"]');
      if (pen) pen.focus();
    }, 40);
  }

  function closeAuth() {
    if (!auth.modal) return;
    auth.modal.hidden = true;
    document.body.classList.remove('is-locked');
    hideAuthError();
  }

  /* ============================================================
     새 필명 가입 알림 (관리자 메일)
     ------------------------------------------------------------
     Supabase(진짜 DB)로 가입이 끝난 직후, 관리자 메일로 "새 필명이
     들어왔다"는 알림을 보냅니다. 서버가 따로 필요 없도록
     assets/supabase-config.js 의 notifyWebhookUrl (Google Apps Script
     웹앱 주소)로 가볍게 POST 만 합니다.

     · 체험 모드(localStorage)에서는 보내지 않습니다.
       (브라우저에만 남는 연습용 가입이라 알림이 쌓이면 오히려 방해가 됩니다)
       → DB를 붙이기 전에도 받고 싶으면 supabase-config.js 의
         notifyInTrialMode 를 true 로 바꾸면 됩니다.
     · 주소를 비워 두면 아무것도 하지 않습니다.
     · 무슨 일이 있어도 가입 흐름을 막지 않습니다. (catch 로 조용히 넘어감)
     ============================================================ */
  function notifyNewSignup(profile) {
    var cfg = window.DARAK_CONFIG || {};
    var url = String(cfg.notifyWebhookUrl || '').trim();
    if (!url) return Promise.resolve(false);

    var payload = {
      type: 'new_signup',
      pen_name: (profile && profile.pen_name) || '',
      created_at: (profile && profile.created_at) || new Date().toISOString(),
      to: cfg.notifyEmail || ''
    };

    try {
      return fetch(url, {
        method: 'POST',
        /* text/plain 으로 보내면 브라우저가 미리 확인(Preflight)을 하지 않아
           Apps Script 웹앱에서도 그대로 받습니다. 내용은 JSON 그대로입니다. */
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        keepalive: true
      }).then(function () { return true; }).catch(function (err) {
        console.warn('[아트다락방] 가입 알림을 보내지 못했어요. (가입은 정상)', err);
        return false;
      });
    } catch (err) {
      console.warn('[아트다락방] 가입 알림을 보내지 못했어요. (가입은 정상)', err);
      return Promise.resolve(false);
    }
  }

  /* 지금 이 가입을 알림으로 보낼지 — DB 모드이거나, 체험 모드 알림을 켜 둔 경우 */
  function shouldNotifySignup() {
    var cfg = window.DARAK_CONFIG || {};
    if (!String(cfg.notifyWebhookUrl || '').trim()) return false;
    return Store.mode === 'cloud' || cfg.notifyInTrialMode === true;
  }

  async function submitAuth(event) {
    event.preventDefault();
    hideAuthError();

    var data = new FormData(auth.form);
    var pen = String(data.get('pen') || '').trim();
    var password = String(data.get('password') || '');
    var password2 = String(data.get('password2') || '');

    if (!pen) return showAuthError('필명을 적어 주세요.');
    if (!password) return showAuthError('비밀번호를 적어 주세요.');
    if (auth.mode === 'signup' && password.length < 6) {
      return showAuthError('비밀번호는 6자 이상으로 정해 주세요.');
    }
    if (auth.mode === 'signup' && password !== password2) {
      return showAuthError('비밀번호가 서로 달라요. 같은 비밀번호를 두 번 적어 주세요.');
    }

    auth.submit.disabled = true;
    var label = auth.submit.textContent;
    auth.submit.textContent = '여는 중…';

    try {
      var pickedAvatar = auth.avatarPicker ? auth.avatarPicker.get() : '';
      var pickedGender = auth.genderChips ? auth.genderChips.get() : '';
      var extra = auth.mode === 'signup'
        ? { attic_props: { avatar: pickedAvatar, gender: pickedGender } }
        : undefined;
      var profile = auth.mode === 'signup'
        ? await Store.signUp(pen, password, extra)
        : await Store.signIn(pen, password);
      if (auth.mode === 'signup' && shouldNotifySignup()) {
        /* 관리자 메일 알림 — 기다리지 않고 보내고, 실패해도 가입은 그대로 진행됩니다. */
        notifyNewSignup(profile || { pen_name: pen });
      }
      auth.form.reset();
      if (auth.avatarPicker) auth.avatarPicker.reset();
      if (auth.genderChips) auth.genderChips.reset();
      closeAuth();
      toast((profile ? profile.pen_name : pen) + ' 님, 다락방 문이 열렸어요.');
    } catch (err) {
      showAuthError(err && err.message ? err.message : '잠시 뒤 다시 시도해 주세요.');
    } finally {
      auth.submit.disabled = false;
      auth.submit.textContent = auth.mode === 'signup' ? '다락방 열기' : '들어가기';
    }
  }

  function bindGlobalClicks() {
    document.addEventListener('click', function (event) {
      var account = event.target.closest ? event.target.closest('[data-account]') : null;
      if (account) {
        event.preventDefault();
        if (Store.profile()) window.location.href = 'darakbang.html';
        else openAuth('signup');
        return;
      }
      var open = event.target.closest ? event.target.closest('[data-open-auth]') : null;
      if (open) {
        event.preventDefault();
        openAuth(open.getAttribute('data-open-auth') || 'signup');
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && auth.modal && !auth.modal.hidden) closeAuth();
    });
  }

  /* ============================================================
     4. 사진 줄이기 (최대 1200px, JPEG)
     ============================================================ */
  function compressImage(file, maxSize, quality, depth) {
    depth = depth || 0;
    return new Promise(function (resolve, reject) {
      if (!file) return reject(new Error('사진을 고르지 않았어요.'));
      if (!/^image\//.test(file.type)) return reject(new Error('사진 파일만 올릴 수 있어요.'));

      var objectUrl = URL.createObjectURL(file);
      var image = new Image();

      image.onload = function () {
        var scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        var width = Math.max(1, Math.round(image.width * scale));
        var height = Math.max(1, Math.round(image.height * scale));

        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FCF5EA';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);
        URL.revokeObjectURL(objectUrl);

        var type = (window.createImageBitmap && file.type === 'image/png' && maxSize <= 1200)
          ? 'image/png'
          : 'image/jpeg';

        canvas.toBlob(function (blob) {
          if (!blob) return reject(new Error('사진을 줄이지 못했어요. 다른 사진으로 해 보세요.'));
          if (blob.size > 650 * 1024 && depth < 2) {
            compressImage(file, Math.max(600, Math.round(maxSize * 0.75)), 0.72, depth + 1)
              .then(resolve, reject);
            return;
          }
          resolve(blob);
        }, type, type === 'image/png' ? undefined : quality);
      };

      image.onerror = function () {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('사진을 읽지 못했어요. 다른 사진으로 해 보세요.'));
      };

      image.src = objectUrl;
    });
  }

  /* ============================================================
     5. 홈
     ============================================================ */
  async function initNoticeBand() {
    var band = document.querySelector('[data-notice-band]');
    if (!band) return;

    var notice = await Store.activeNotice();
    if (!notice) {
      band.hidden = true;
      return;
    }

    band.hidden = false;
    var title = band.querySelector('[data-notice-title]');
    var body = band.querySelector('[data-notice-body]');
    if (title) title.textContent = notice.title;
    if (body) body.textContent = notice.body || '';

    var close = band.querySelector('[data-notice-close]');
    if (close) {
      close.addEventListener('click', function () { band.hidden = true; });
    }
  }

  async function initHome() {
    var works = await Store.listArtworks();
    var grid = document.querySelector('[data-today-grid]');
    var empty = document.querySelector('[data-today-empty]');

    var featured = works.filter(function (work) { return work.is_featured; });
    var rest = works.filter(function (work) { return !work.is_featured; });
    var picks = featured.concat(rest).slice(0, 4);

    if (grid) {
      grid.innerHTML = picks.map(cardHTML).join('');
    }
    if (empty) empty.classList.toggle('is-visible', works.length === 0);

    initNoticeBand();

    var counts = {};
    var pens = {};
    works.forEach(function (work) {
      counts[work.field] = (counts[work.field] || 0) + 1;
      pens[work.pen_name.toLowerCase()] = 1;
    });

    document.querySelectorAll('[data-field-tile]').forEach(function (tile) {
      var field = tile.getAttribute('data-field');
      var count = tile.querySelector('[data-field-count]');
      if (count) count.textContent = (counts[field] || 0) + '점';
      tile.href = 'gallery.html?field=' + encodeURIComponent(field);
    });

    setText('[data-stat-works]', nf(works.length));
    setText('[data-stat-pens]', nf(Object.keys(pens).length));

    var cta = document.querySelector('[data-hero-cta]');
    if (cta) {
      if (Store.profile()) {
        cta.textContent = '작품 등록하기';
        cta.href = 'register.html';
      } else {
        cta.textContent = '필명으로 시작';
        cta.href = '#';
        cta.setAttribute('data-open-auth', 'signup');
      }
    }

    Store.onAuth(function (profile) {
      if (!cta) return;
      if (profile) {
        cta.textContent = '작품 등록하기';
        cta.href = 'register.html';
        cta.removeAttribute('data-open-auth');
      }
    });
  }

  /* ============================================================
     6. 갤러리
     ============================================================ */
  async function initGallery() {
    var works = await Store.listArtworks();
    var grid = document.getElementById('gallery-grid');
    var empty = document.getElementById('gallery-empty');
    var countEl = document.getElementById('result-count');
    var searchInput = document.getElementById('gallery-search');
    var searchBox = document.getElementById('search-box');
    var searchClear = document.getElementById('search-clear');
    var sortSelect = document.getElementById('gallery-sort');
    var statusSelect = document.getElementById('gallery-status');
    var resetBtn = document.getElementById('reset-filters');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filters .chip'));

    if (!grid) return;

    var params = new URLSearchParams(window.location.search);
    var state = {
      field: params.get('field') || '전체',
      status: '전체',
      query: params.get('q') || '',
      sort: 'new'
    };

    if (searchInput && state.query) {
      searchInput.value = state.query;
      if (searchBox) searchBox.classList.add('has-value');
    }

    /* 분야별 숫자 */
    var counts = { '전체': works.length };
    works.forEach(function (work) { counts[work.field] = (counts[work.field] || 0) + 1; });
    chips.forEach(function (chip) {
      var field = chip.getAttribute('data-filter');
      var badge = chip.querySelector('.chip__count');
      if (badge) badge.textContent = String(counts[field] || 0);
      if (field === state.field) {
        chips.forEach(function (c) { c.classList.remove('is-active'); c.setAttribute('aria-pressed', 'false'); });
        chip.classList.add('is-active');
        chip.setAttribute('aria-pressed', 'true');
      }
    });

    function haystack(work) {
      return [work.title, work.pen_name, work.field, work.description, work.status].join(' ').toLowerCase();
    }

    function apply() {
      var needle = state.query.trim().toLowerCase();
      var list = works.filter(function (work) {
        var fieldOk = state.field === '전체' || work.field === state.field;
        var statusOk = state.status === '전체' || work.status === state.status;
        var queryOk = !needle || haystack(work).indexOf(needle) !== -1;
        return fieldOk && statusOk && queryOk;
      });

      list.sort(function (a, b) {
        if (state.sort === 'likes') return b.like_count - a.like_count;
        if (state.sort === 'title') return String(a.title).localeCompare(String(b.title), 'ko');
        if (state.sort === 'comments') return b.comment_count - a.comment_count;
        return String(b.created_at).localeCompare(String(a.created_at));
      });

      grid.innerHTML = list.map(cardHTML).join('');
      grid.style.display = list.length ? '' : 'none';
      if (empty) empty.classList.toggle('is-visible', list.length === 0);
      if (countEl) countEl.textContent = String(list.length);

      var line = document.getElementById('result-line-hint');
      if (line) {
        line.textContent = state.query
          ? '“' + state.query + '” 로 찾은 작품이에요.'
          : '카드를 누르면 작품 소개와 감상을 볼 수 있어요.';
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.field = chip.getAttribute('data-filter') || '전체';
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', String(on));
        });
        apply();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.query = searchInput.value;
        if (searchBox) searchBox.classList.toggle('has-value', searchInput.value.length > 0);
        apply();
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', function () {
        if (!searchInput) return;
        searchInput.value = '';
        state.query = '';
        if (searchBox) searchBox.classList.remove('has-value');
        searchInput.focus();
        apply();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        state.sort = sortSelect.value;
        apply();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', function () {
        state.status = statusSelect.value;
        apply();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state.field = '전체';
        state.status = '전체';
        state.query = '';
        state.sort = 'new';
        if (searchInput) searchInput.value = '';
        if (searchBox) searchBox.classList.remove('has-value');
        if (sortSelect) sortSelect.value = 'new';
        if (statusSelect) statusSelect.value = '전체';
        chips.forEach(function (c, index) {
          c.classList.toggle('is-active', index === 0);
          c.setAttribute('aria-pressed', String(index === 0));
        });
        apply();
      });
    }

    apply();
  }

  /* ============================================================
     7. 작품 보기 + 감상
     ============================================================ */
  async function initWork() {
    var host = document.getElementById('work-detail');
    var id = new URLSearchParams(window.location.search).get('id');
    var work = id ? await Store.getArtwork(id) : null;

    if (!work) {
      if (host) {
        host.innerHTML = '<div class="empty is-visible">' +
          '<span class="empty__emoji" aria-hidden="true">🕯️</span>' +
          '<p><b>작품을 찾지 못했어요.</b><br>주소가 바뀌었거나 지워진 작품일 수 있어요.</p>' +
          '<a class="btn btn--ghost btn--sm" href="gallery.html">갤러리로 돌아가기</a></div>';
      }
      var commentsSection = document.getElementById('comments-section');
      if (commentsSection) commentsSection.hidden = true;
      return;
    }

    document.title = work.title + ' · 아트다락방';
    document.querySelectorAll('[data-work-title]').forEach(function (el) { el.textContent = work.title; });

    var me = Store.profile();
    var isOwner = !!(me && work.user_id && work.user_id === me.id);

    if (host) {
      host.outerHTML = '' +
        '<article class="work-detail" id="work-detail">' +
        '<div class="work-detail__art ' + artClass(work) + '" data-field="' + esc(work.field) + '">' +
        artInner(work) +
        '<span class="work__state">' + esc(work.status) + '</span>' +
        '</div>' +
        '<div class="work-detail__body">' +
        '<div class="work-detail__top"><span class="tag">' + esc(work.field) + '</span>' +
        (work.is_hidden ? '<span class="badge-hidden">관리자 숨김</span>' : '') +
        (work.is_sample ? '<span class="badge-sample">예시 작품</span>' : '') + '</div>' +
        '<h1 class="work-detail__title">' + esc(work.title) + '</h1>' +
        '<p class="work-detail__meta">' +
        (work.user_id
          ? '<a href="darakbang.html?pen=' + encodeURIComponent(work.pen_name) + '" title="' + esc(work.pen_name) + '님의 다락방 구경하기">' + esc(work.pen_name) + '</a>'
          : '<a href="gallery.html?q=' + encodeURIComponent(work.pen_name) + '">' + esc(work.pen_name) + '</a>') +
        '<span aria-hidden="true">·</span><span>' + dateLabel(work.created_at) + '</span>' +
        '</p>' +
        '<p class="work-detail__desc">' + (work.description ? esc(work.description) : '아직 작품 소개가 없어요.') + '</p>' +
        (work.link_url
          ? '<a class="btn btn--ghost btn--sm work-detail__link" href="' + esc(work.link_url) + '" target="_blank" rel="noopener noreferrer">작품 링크 열기 ↗</a>'
          : '') +
        '<div class="work-detail__foot">' +
        likeButtonHTML(work) +
        '<span class="result-hint">💬 <span data-comment-total>' + nf(work.comment_count) + '</span></span>' +
        '<a class="link-more" href="gallery.html">갤러리로 돌아가기 →</a>' +
        (isOwner ? '<button class="btn btn--ghost btn--sm work-detail__del" type="button" data-delete-work="' + esc(work.id) + '">작품 지우기</button>' : '') +
        '</div>' +
        '</div></article>';
    }

    bindLikes();
    document.getElementById('work-detail').addEventListener('click', async function (event) {
      var del = event.target.closest ? event.target.closest('[data-delete-work]') : null;
      if (!del) return;
      if (!window.confirm('이 작품을 다락방에서 지울까요? 남겨진 감상도 함께 사라져요.')) return;
      try {
        await Store.deleteArtwork(del.getAttribute('data-delete-work'));
        toast('작품을 지웠어요.');
        window.location.href = 'gallery.html';
      } catch (err) {
        toast(err.message);
      }
    });

    initComments(work);
  }

  function initComments(work) {
    var area = document.getElementById('comment-area');
    if (!area) return;

    async function render() {
      var me = Store.profile();
      var comments = await Store.listComments(work.id);

      area.innerHTML =
        (me
          ? '<form class="comment-form" id="comment-form">' +
            '<label class="sr-only" for="comment-body">감상 남기기</label>' +
            '<textarea id="comment-body" class="textarea" maxlength="500" rows="3" ' +
            'placeholder="이 작품을 보고 든 생각을 한 줄 남겨 주세요."></textarea>' +
            '<div class="comment-form__foot">' +
            '<span class="form-note"><span data-comment-length>0</span> / 500자</span>' +
            '<button class="btn btn--primary btn--sm" type="submit">감상 남기기</button>' +
            '</div></form>'
          : '<div class="comment-form comment-form--login">' +
            '<p><b>필명으로 시작하면 감상을 남길 수 있어요.</b><br>짧은 한 줄도 이 다락방에는 큰 힘이 됩니다.</p>' +
            '<button class="btn btn--primary btn--sm" type="button" data-open-auth="signup">필명 정하기</button>' +
            '</div>') +
        '<ul class="comment-list" id="comment-list">' +
        (comments.length
          ? comments.map(function (comment) { return commentHTML(comment, me); }).join('')
          : '<li class="comment-empty">아직 남겨진 감상이 없어요. 첫 번째 말을 남겨 보세요.</li>') +
        '</ul>';

      var total = document.querySelector('[data-comment-total]');
      if (total) total.textContent = nf(comments.length);

      var form = document.getElementById('comment-form');
      var body = document.getElementById('comment-body');
      var length = document.querySelector('[data-comment-length]');

      if (body && length) {
        body.addEventListener('input', function () { length.textContent = String(body.value.length); });
      }

      if (form) {
        form.addEventListener('submit', async function (event) {
          event.preventDefault();
          var button = form.querySelector('button[type="submit"]');
          button.disabled = true;
          try {
            await Store.addComment(work.id, body.value);
            toast('감상을 남겼어요. 고마워요!');
            await render();
          } catch (err) {
            toast(err.message);
          } finally {
            button.disabled = false;
          }
        });
      }

      area.querySelectorAll('[data-del-comment]').forEach(function (button) {
        button.addEventListener('click', async function () {
          if (!window.confirm('남긴 감상을 지울까요?')) return;
          try {
            await Store.deleteComment(button.getAttribute('data-del-comment'));
            await render();
          } catch (err) {
            toast(err.message);
          }
        });
      });
    }

    render();
    Store.onAuth(function () { render(); });
  }

  function commentHTML(comment, me) {
    var mine = me && comment.user_id && comment.user_id === me.id;
    return '<li class="comment">' +
      '<span class="comment__avatar" aria-hidden="true">' + esc(initial(comment.pen_name)) + '</span>' +
      '<div class="comment__main">' +
      '<div class="comment__head">' +
      '<span class="comment__name">' + esc(comment.pen_name) + '</span>' +
      '<span class="comment__time">' + timeAgo(comment.created_at) + '</span>' +
      (mine ? '<button class="comment__del" type="button" data-del-comment="' + esc(comment.id) + '">지우기</button>' : '') +
      '</div>' +
      '<p class="comment__body">' + esc(comment.body) + '</p>' +
      '</div></li>';
  }

  /* ============================================================
     8. 작품 등록
     ============================================================ */
  async function initRegister() {
    var form = document.getElementById('work-form');
    var gate = document.getElementById('register-gate');
    if (!form) return;

    var errorEl = form.querySelector('[data-form-error]');
    var fileInput = document.getElementById('work-image-file');
    var urlInput = form.querySelector('[name="image_url"]');
    var preview = document.getElementById('image-preview');
    var previewImg = preview ? preview.querySelector('img') : null;
    var previewNote = preview ? preview.querySelector('[data-image-note]') : null;
    var clearImage = document.getElementById('image-clear');
    var submit = form.querySelector('button[type="submit"]');
    var fieldButtons = Array.prototype.slice.call(form.querySelectorAll('[data-pick-field]'));
    var picked = { field: '문학', status: '완성' };
    var pendingImage = null;

    function showError(message) {
      if (!errorEl) return;
      errorEl.textContent = message;
      errorEl.hidden = false;
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function hideError() {
      if (errorEl) errorEl.hidden = true;
    }

    function syncAuth() {
      var me = Store.profile();
      if (gate) gate.hidden = !!me;
      form.hidden = !me;
      var author = form.querySelector('[data-author]');
      if (author) author.textContent = me ? me.pen_name : '';
    }

    fieldButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        picked.field = button.getAttribute('data-pick-field');
        fieldButtons.forEach(function (b) {
          var on = b === button;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        var hint = form.querySelector('[data-field-hint]');
        if (hint) hint.textContent = picked.field + ' 작품으로 걸립니다.';
      });
    });

    form.querySelectorAll('input[name="status"]').forEach(function (radio) {
      radio.addEventListener('change', function () { picked.status = radio.value; });
    });

    if (fileInput) {
      fileInput.addEventListener('change', async function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        hideError();
        try {
          var blob = await compressImage(file, 1200, 0.82);
          pendingImage = { blob: blob, name: file.name };
          if (preview && previewImg) {
            preview.hidden = false;
            previewImg.src = URL.createObjectURL(blob);
            if (previewNote) {
              previewNote.textContent = '사진 첨부됨 · ' + Math.round(blob.size / 1024) + 'KB (자동으로 줄였어요)';
            }
          }
        } catch (err) {
          showError(err.message);
        }
      });
    }

    if (clearImage) {
      clearImage.addEventListener('click', function () {
        pendingImage = null;
        if (fileInput) fileInput.value = '';
        if (preview) preview.hidden = true;
      });
    }

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      hideError();

      var data = new FormData(form);
      var title = String(data.get('title') || '').trim();
      var description = String(data.get('description') || '').trim();
      var imageUrl = String(data.get('image_url') || '').trim();
      var linkUrl = String(data.get('link_url') || '').trim();
      var status = picked.status || '완성';

      if (!title) return showError('작품 제목을 적어 주세요.');
      if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
        return showError('이미지 주소는 https:// 로 시작해야 해요.');
      }
      if (linkUrl && !/^https?:\/\//i.test(linkUrl)) {
        return showError('작품 링크는 https:// 로 시작해야 해요.');
      }

      submit.disabled = true;
      var label = submit.textContent;
      submit.textContent = '거는 중…';

      try {
        var finalImage = imageUrl || null;
        if (pendingImage) {
          submit.textContent = '사진 올리는 중…';
          finalImage = await Store.uploadImage(pendingImage.blob, pendingImage.name);
        }

        var work = await Store.createArtwork({
          title: title,
          field: picked.field,
          status: status,
          description: description,
          imageUrl: finalImage,
          linkUrl: linkUrl || null
        });

        toast('다락방에 작품을 걸었어요.');
        window.location.href = 'work.html?id=' + encodeURIComponent(work.id);
      } catch (err) {
        showError(err && err.message ? err.message : '작품을 걸지 못했어요.');
      } finally {
        submit.disabled = false;
        submit.textContent = label;
      }
    });

    syncAuth();
    Store.onAuth(syncAuth);
  }

  /* ============================================================
     9. 내 다락방
     ============================================================ */
  async function initDarakbang() {
    var guest = document.getElementById('darak-guest');
    var missing = document.getElementById('darak-missing');
    var main = document.getElementById('darak-main');
    var profileCard = document.getElementById('profile-card');
    var worksGrid = document.getElementById('my-works');
    var worksEmpty = document.getElementById('my-empty');
    var featured = document.getElementById('my-featured');
    var commentList = document.getElementById('received-comments');
    var commentEmpty = document.getElementById('received-empty');
    var receivedHead = document.getElementById('received-head');
    var invite = document.getElementById('darak-invite');
    var swatches = document.querySelector('[data-theme-picker]');
    var studio = document.getElementById('darak-studio');
    var editor = document.getElementById('studio-editor');
    var moodPicker = document.querySelector('[data-mood-picker]');
    var propPicker = document.querySelector('[data-prop-picker]');
    var visitOwn = document.querySelector('[data-visit-own]');
    var visitJoin = document.querySelector('[data-visit-join]');
    var editBtn = document.getElementById('edit-profile');
    var logoutBtn = document.querySelector('[data-logout]');
    var headTitle = document.querySelector('[data-head-title]');
    var headDesc = document.querySelector('[data-head-desc]');
    var headCrumb = document.querySelector('[data-head-crumb]');
    var avatarRoot = document.querySelector('[data-studio-avatar]');
    var roomChar = studio ? studio.querySelector('[data-room-char]') : null;
    var roomSay = document.querySelector('[data-room-say]');
    var roomSparks = document.querySelector('[data-room-sparks]');
    var roomLineAt = {};
    var roomGreetTimer = null;
    var roomSayTimer = null;
    var roomSparkTimer = null;

    /* ?pen=필명 으로 다른 사람의 다락방을 구경할 수 있습니다. */
    var penParam = (new URLSearchParams(window.location.search).get('pen') || '').trim();
    var target = null;
    var isOwner = false;
    var attic = { mood: 'write', props: [], avatar: '', gender: '' };
    var avatarPicker = null;
    var currentTheme = 'rose';
    var lastSignature = null;
    var saveChain = Promise.resolve();

    if (worksGrid) bindLikes();

    /* -------------------------------------------------- 사무실 그리기 */
    function samePen(a, b) {
      var key = function (value) {
        return String(value == null ? '' : value).trim().toLowerCase().replace(/\s+/g, '');
      };
      return !!key(a) && key(a) === key(b);
    }

    function readAttic(profile) {
      var normalized = Store.normalizeAtticProps(profile && profile.attic_props);
      return {
        mood: normalized.mood,
        props: normalized.props.slice(),
        avatar: normalized.avatar || '',
        gender: normalized.gender || ''
      };
    }

    function paintStudio() {
      if (!studio) return;
      var mood = MOOD_LABEL[attic.mood] ? attic.mood : 'write';
      ['write', 'paint', 'music', 'craft'].forEach(function (key) {
        studio.classList.toggle('droom--' + key, key === mood);
      });

      Store.ATTIC_PROPS.forEach(function (key) {
        var groups = studio.querySelectorAll('[data-prop="' + key + '"]');
        var on = attic.props.indexOf(key) !== -1;
        Array.prototype.forEach.call(groups, function (node) {
          node.classList.toggle('is-on', on);
        });
      });

      setText('[data-studio-mood]', MOOD_LABEL[mood]);
      setText('[data-studio-theme]', THEME_LABEL[currentTheme] || '');
      setText('[data-studio-count]', attic.props.length ? '소품 ' + attic.props.length + '개' : '소품 없이');

      var propNames = attic.props.map(function (key) { return PROP_LABEL[key]; }).filter(Boolean);
      studio.setAttribute('aria-label', MOOD_LABEL[mood] + ' 분위기의 다락방 사무실. ' +
        (propNames.length ? '소품: ' + propNames.join(', ') + '.' : '아직 놓은 소품이 없어요.'));

      if (moodPicker) {
        moodPicker.querySelectorAll('[data-mood]').forEach(function (chip) {
          var on = chip.getAttribute('data-mood') === mood;
          chip.classList.toggle('is-active', on);
          chip.setAttribute('aria-pressed', String(on));
        });
      }
      setText('[data-mood-name]', MOOD_LABEL[mood]);

      if (propPicker) {
        propPicker.querySelectorAll('[data-prop]').forEach(function (chip) {
          var on = attic.props.indexOf(chip.getAttribute('data-prop')) !== -1;
          chip.classList.toggle('is-active', on);
          chip.setAttribute('aria-pressed', String(on));
        });
      }
      setText('[data-props-count]', attic.props.length ? attic.props.length + '개 놓임' : '0개 놓임');
    }

    /* -------------------------------------------------- 방 안 캐릭터 */
    /* 고른 캐릭터 한 명만 방에 서고, 나머지는 방에서 빠집니다.
       글자 기본(빈 값)이면 방에 아무도 없어요. */
    function paintRoomCharacter() {
      if (!roomChar) return;
      sizeRoomOverlay();
      var key = attic.avatar || '';
      var shown = false;
      Array.prototype.forEach.call(roomChar.querySelectorAll('[data-char]'), function (node) {
        var on = !!key && node.getAttribute('data-char') === key;
        node.classList.toggle('is-on', on);
        node.setAttribute('aria-hidden', String(!on));
        if (on) shown = true;
      });
      roomChar.classList.toggle('is-on', shown);
      roomChar.setAttribute('aria-hidden', String(!shown));

      if (!shown) {
        hideRoomSay();
        Array.prototype.forEach.call(roomChar.querySelectorAll('[data-char]'), function (node) {
          node.classList.remove('is-greet');
        });
        if (roomSparks) roomSparks.innerHTML = '';
      }
    }

    function hideRoomSay() {
      if (roomSayTimer) {
        window.clearTimeout(roomSayTimer);
        roomSayTimer = null;
      }
      if (roomSay) roomSay.classList.remove('is-on');
    }

    function showRoomSay(text) {
      if (!roomSay || !text) return;
      hideRoomSay();
      roomSay.textContent = text;
      roomSay.classList.add('is-on');
      roomSayTimer = window.setTimeout(function () {
        if (roomSay) roomSay.classList.remove('is-on');
        roomSayTimer = null;
      }, 2500);
    }

    /* 별빛·하트가 캐릭터 주변에서 살짝 떠올랐다 사라집니다. */
    function popRoomSparks() {
      if (!roomSparks || !studio) return;
      var scale = (studio.clientWidth || 320) / 800;
      var marks = ['✦', '♡', '✧', '♡', '✦'];
      var spots = [[-58, -6], [-30, -22], [2, -30], [32, -20], [58, -4]];
      roomSparks.innerHTML = '';
      for (var i = 0; i < marks.length; i += 1) {
        var mark = document.createElement('span');
        mark.textContent = marks[i];
        mark.setAttribute('aria-hidden', 'true');
        var jitter = (Math.random() * 10) - 5;
        mark.style.setProperty('--dx', ((spots[i][0] + jitter) * scale).toFixed(1) + 'px');
        mark.style.setProperty('--dy', ((spots[i][1] + jitter) * scale).toFixed(1) + 'px');
        mark.style.setProperty('--drift', (((Math.random() * 2 - 1) * 10) * scale).toFixed(1) + 'px');
        mark.style.setProperty('--rise', (74 * scale).toFixed(1) + 'px');
        mark.style.animationDelay = (i * 0.07).toFixed(2) + 's';
        roomSparks.appendChild(mark);
      }
      if (roomSparkTimer) window.clearTimeout(roomSparkTimer);
      roomSparkTimer = window.setTimeout(function () {
        if (roomSparks) roomSparks.innerHTML = '';
        roomSparkTimer = null;
      }, 1700);
    }

    /* 캐릭터를 누르면 통통 튀고, 고개를 갸웃하고, 짧은 인사를 건넵니다. */
    function greetRoomCharacter(figure) {
      if (!figure || !figure.classList.contains('is-on') || !roomChar) return;
      var key = figure.getAttribute('data-char') || '';
      var lines = ROOM_LINES[key] || [];
      if (!lines.length) return;

      var at = roomLineAt[key] || 0;
      roomLineAt[key] = (at + 1) % lines.length;
      showRoomSay(lines[at]);

      Array.prototype.forEach.call(roomChar.querySelectorAll('[data-char]'), function (node) {
        node.classList.remove('is-greet');
      });
      void figure.getBoundingClientRect();
      figure.classList.add('is-greet');

      if (roomGreetTimer) window.clearTimeout(roomGreetTimer);
      roomGreetTimer = window.setTimeout(function () {
        figure.classList.remove('is-greet');
        roomGreetTimer = null;
      }, 1200);

      popRoomSparks();
    }

    /* 말풍선·반짝임·글자 크기를 방 크기에 맞춥니다. (--room-u = 방 너비 / 800) */
    function sizeRoomOverlay() {
      if (!studio) return;
      var width = studio.clientWidth || 320;
      studio.style.setProperty('--room-u', (width / 800).toFixed(4) + 'px');
    }

    function setupRoomCharacter() {
      if (!studio || !roomChar) return;
      sizeRoomOverlay();
      window.addEventListener('resize', sizeRoomOverlay);

      studio.addEventListener('click', function (event) {
        var figure = event.target && event.target.closest ? event.target.closest('[data-char]') : null;
        if (!figure || !roomChar.contains(figure)) return;
        greetRoomCharacter(figure);
      });

      /* 키보드: Enter · Space 로도 인사합니다. */
      studio.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
        var figure = event.target && event.target.closest ? event.target.closest('[data-char]') : null;
        if (!figure || !roomChar.contains(figure)) return;
        event.preventDefault();
        greetRoomCharacter(figure);
      });
    }

    /* 캐릭터 사진을 프로필·헤더 버튼·이름 옆 칭호에 바로 반영합니다.
       이름 대신 칭호만 보여 줍니다. */
    function paintCharacter(profile) {
      var source = profile || target || {};
      var entry = avatarEntry(attic.avatar);
      paintAvatar(document.querySelector('[data-me-avatar]'),
        { pen_name: source.pen_name, attic_props: { avatar: attic.avatar } });
      if (isOwner) {
        paintAvatar(document.querySelector('[data-account-avatar]'),
          { pen_name: source.pen_name, attic_props: { avatar: attic.avatar } });
      }
      var titleEl = document.querySelector('[data-me-title]');
      if (titleEl) {
        titleEl.hidden = !entry;
        titleEl.textContent = entry ? entry.title : '';
      }
      setText('[data-avatar-name]', entry ? entry.title : '글자 기본');
      if (avatarPicker && avatarPicker.get() !== attic.avatar) avatarPicker.set(attic.avatar);
      paintRoomCharacter();
    }

    function persistAttic(message) {
      if (!isOwner) return saveChain;
      var snapshot = {
        mood: attic.mood,
        props: attic.props.slice(),
        avatar: attic.avatar,
        gender: attic.gender
      };
      saveChain = saveChain
        .then(function () {
          return Store.updateProfile({ attic_props: snapshot });
        })
        .then(function () {
          if (message) toast(message);
        })
        .catch(function (err) {
          toast((err && err.message) || '다락방을 저장하지 못했어요.');
        });
      return saveChain;
    }

    function setupStudioEditor() {
      if (avatarRoot) {
        avatarRoot.innerHTML = avatarPickerHTML('avatar-picker--studio');
        avatarPicker = createAvatarPicker(avatarRoot.querySelector('[data-avatar-picker]'), function (key) {
          if (!isOwner) return;
          attic.avatar = key;
          paintCharacter(target);
          var entry = avatarEntry(key);
          persistAttic(entry ? entry.title + ' 캐릭터로 바꿨어요.' : '필명 첫 글자로 돌아갔어요.');
        });
      }

      if (swatches) {
        swatches.innerHTML = Store.ATTIC_THEMES.map(function (key) {
          return '<button class="attic-swatch attic-theme--' + key + '" type="button" data-theme="' + key + '" ' +
            'aria-pressed="false" aria-label="' + THEME_LABEL[key] + ' 벽지"></button>';
        }).join('');

        swatches.addEventListener('click', async function (event) {
          var dot = event.target.closest ? event.target.closest('[data-theme]') : null;
          if (!dot || !isOwner) return;
          var theme = dot.getAttribute('data-theme');
          if (!THEME_LABEL[theme] || currentTheme === theme) return;
          applyTheme(theme);
          paintStudio();
          try {
            await Store.updateProfile({ attic_theme: theme });
            toast(THEME_LABEL[theme] + ' 벽지로 바꿨어요.');
          } catch (err) {
            toast(err.message);
          }
        });
      }

      if (moodPicker) {
        moodPicker.innerHTML = MOODS.map(function (mood) {
          return '<button class="mood-chip" type="button" data-mood="' + mood.key + '" aria-pressed="false">' +
            '<span class="mood-chip__ico">' + studioIcon(mood.icon) + '</span>' +
            '<span class="mood-chip__text"><b>' + mood.label + '</b><small>' + mood.sub + '</small></span>' +
            '<span class="mood-chip__check" aria-hidden="true">✓</span>' +
            '</button>';
        }).join('');

        moodPicker.addEventListener('click', function (event) {
          var chip = event.target.closest ? event.target.closest('[data-mood]') : null;
          if (!chip || !isOwner) return;
          var mood = chip.getAttribute('data-mood');
          if (!MOOD_LABEL[mood] || attic.mood === mood) return;
          attic.mood = mood;
          paintStudio();
          persistAttic(MOOD_LABEL[mood] + ' 분위기로 바꿨어요.');
        });
      }

      if (propPicker) {
        propPicker.innerHTML = PROPS.map(function (prop) {
          return '<button class="prop-chip" type="button" data-prop="' + prop.key + '" aria-pressed="false">' +
            '<span class="prop-chip__ico">' + studioIcon(prop.icon) + '</span>' +
            '<span class="prop-chip__label">' + prop.label + '</span>' +
            '</button>';
        }).join('');

        propPicker.addEventListener('click', function (event) {
          var chip = event.target.closest ? event.target.closest('[data-prop]') : null;
          if (!chip || !isOwner) return;
          var key = chip.getAttribute('data-prop');
          if (!PROP_LABEL[key]) return;
          var index = attic.props.indexOf(key);
          if (index === -1) attic.props.push(key);
          else attic.props.splice(index, 1);
          paintStudio();
          persistAttic(PROP_LABEL[key] + ' 소품을 ' + (index === -1 ? '방에 놓았어요.' : '치웠어요.'));
        });
      }
    }

    /* -------------------------------------------------- 벽지 */
    function applyTheme(theme) {
      currentTheme = THEME_LABEL[theme] ? theme : 'rose';
      if (profileCard) {
        Store.ATTIC_THEMES.forEach(function (key) {
          profileCard.classList.toggle('attic-theme--' + key, key === currentTheme);
        });
      }
      setText('[data-theme-name]', THEME_LABEL[currentTheme] || '');
      setText('[data-studio-theme]', THEME_LABEL[currentTheme] || '');

      if (swatches) {
        swatches.querySelectorAll('[data-theme]').forEach(function (dot) {
          var on = dot.getAttribute('data-theme') === currentTheme;
          dot.classList.toggle('is-active', on);
          dot.setAttribute('aria-pressed', String(on));
          dot.title = THEME_LABEL[dot.getAttribute('data-theme')] || '';
        });
      }
    }

    /* -------------------------------------------------- 화면 */
    function profileSignature(profile) {
      if (!profile) return 'guest';
      var props = profile.attic_props || {};
      return [profile.id, profile.pen_name, profile.bio, profile.attic_note,
        (profile.fields || []).join(','), props.avatar || '', props.gender || ''].join('|');
    }

    function updateHead(profile, owner) {
      var name = profile ? profile.pen_name : '';
      var myRoom = owner || !penParam || !profile;
      if (headTitle) headTitle.textContent = myRoom ? '내 다락방' : name + '님의 다락방';
      if (headCrumb) headCrumb.textContent = myRoom ? '내 다락방' : name + '님의 다락방';
      if (headDesc) {
        headDesc.textContent = myRoom
          ? '필명 하나로 시작하는 나만의 방. 작품과 소개, 그리고 찾아온 사람들이 남긴 말이 함께 쌓입니다.'
          : name + '님이 꾸민 다락방 사무실과 걸어 둔 작품을 구경하는 중이에요.';
      }
      document.title = myRoom ? '내 다락방 · 아트다락방' : name + '님의 다락방 · 아트다락방';
    }

    function setupTools(owner, me) {
      if (editBtn) editBtn.hidden = !owner;
      if (logoutBtn) logoutBtn.hidden = !owner;
      if (visitOwn) visitOwn.hidden = owner || !me;
      if (visitJoin) visitJoin.hidden = owner || !!me;
      if (editor) editor.hidden = !owner;
      if (invite) invite.hidden = !owner;
      if (receivedHead) receivedHead.hidden = !owner;
      if (commentList) commentList.hidden = !owner;
      if (commentEmpty && !owner) commentEmpty.classList.remove('is-visible');
      if (worksEmpty && !owner) worksEmpty.classList.remove('is-visible');
    }

    function emptyWorkHTML(owner) {
      return '<div class="empty is-visible">' +
        '<span class="empty__emoji" aria-hidden="true">🪜</span>' +
        '<p><b>아직 걸린 작품이 없어요.</b><br>' +
        (owner ? '첫 작품을 걸면 이 자리가 다락방의 얼굴이 됩니다.' : '이 다락방은 아직 첫 작품을 기다리고 있어요.') +
        '</p>' +
        (owner ? '<a class="btn btn--primary btn--sm" href="register.html">첫 작품 걸기</a>' : '') +
        '</div>';
    }

    async function render() {
      var me = Store.profile();
      target = null;

      if (penParam && !(me && samePen(me.pen_name, penParam))) {
        target = await Store.profileByPen(penParam);
      } else {
        target = me;
      }
      isOwner = !!(me && target && target.id === me.id);

      setupTools(isOwner, me);

      if (guest) guest.hidden = !!(target || penParam);
      if (missing) missing.hidden = !(penParam && !target);
      if (main) main.hidden = !target;

      if (!target) {
        lastSignature = penParam ? 'missing' : 'guest';
        updateHead(null, !penParam);
        var missingText = document.querySelector('[data-missing-text]');
        if (missingText && penParam) {
          missingText.textContent = '“' + penParam + '” 필명의 다락방을 찾지 못했어요. ' +
            '주소의 필명이 바뀌었거나, 아직 문을 열지 않은 다락방일 수 있어요.';
        }
        return;
      }

      updateHead(target, isOwner);
      applyTheme(target.attic_theme || 'rose');
      attic = readAttic(target);
      paintStudio();

      setText('[data-me-pen]', target.pen_name);
      paintCharacter(target);
      setText('[data-me-bio]', target.bio ||
        (isOwner ? '아직 소개를 적지 않았어요. “프로필 꾸미기”로 한 줄 남겨 보세요.' : '아직 소개가 없어요.'));

      var note = document.querySelector('[data-me-note]');
      if (note) {
        note.hidden = !target.attic_note;
        note.textContent = target.attic_note ? '“' + target.attic_note + '”' : '';
      }

      var tags = document.querySelector('[data-me-fields]');
      if (tags) {
        var chips = (target.fields || []).map(function (field) {
          return '<span class="tag" data-field="' + esc(field) + '">' + esc(field) + '</span>';
        });
        if (attic.gender && GENDER_LABEL[attic.gender]) {
          chips.push('<span class="tag tag--gender">' + GENDER_LABEL[attic.gender] + '</span>');
        }
        chips.push('<span class="tag">' + dateLabel(target.created_at) + '부터</span>');
        tags.innerHTML = chips.join('');
      }

      var works = await Store.listArtworks({ userId: target.id });
      var received = await Store.commentsForAuthor(target.id);

      setText('[data-stat-works]', nf(works.length));
      setText('[data-stat-comments]', nf(received.length));
      setText('[data-stat-likes]', nf(works.reduce(function (sum, w) {
        return sum + w.like_count + (Store.isLiked(w.id) ? 1 : 0);
      }, 0)));
      setText('[data-stat-days]', nf(daysSince(target.created_at)));

      /* 대표 작품 */
      if (featured) {
        if (!works.length) {
          featured.innerHTML = emptyWorkHTML(isOwner);
        } else {
          var top = works[0];
          featured.innerHTML = '<article class="featured" data-field="' + esc(top.field) + '">' +
            '<div class="featured__art ' + artClass(top) + '">' + artInner(top) +
            '<span class="work__state">' + esc(top.status) + '</span></div>' +
            '<div class="featured__body">' +
            '<p class="featured__label">대표 작품 · ' + esc(top.field) + '</p>' +
            '<h3 class="featured__title"><a href="work.html?id=' + encodeURIComponent(top.id) + '">' + esc(top.title) + '</a></h3>' +
            '<p class="featured__text">' + esc(top.description ? top.description.slice(0, 160) : '작품 소개가 아직 없어요.') + '</p>' +
            '<div class="featured__meta"><span class="tag" data-field="' + esc(top.field) + '">' + esc(top.field) + '</span>' +
            '<span class="result-hint">' + dateLabel(top.created_at) + ' · 마음 ' + nf(top.like_count) + '</span></div>' +
            '</div></article>';
        }
      }

      /* 작품 목록 */
      if (worksGrid) {
        worksGrid.innerHTML = works.map(cardHTML).join('');
      }
      if (worksEmpty) worksEmpty.classList.toggle('is-visible', isOwner && works.length === 0);

      /* 받은 감상 (내용은 내 다락방에서만) */
      if (commentList && isOwner) {
        commentList.innerHTML = received.slice(0, 8).map(function (comment) {
          return '<li class="comment">' +
            '<span class="comment__avatar" aria-hidden="true">' + esc(initial(comment.pen_name)) + '</span>' +
            '<div class="comment__main">' +
            '<div class="comment__head"><span class="comment__name">' + esc(comment.pen_name) + '</span>' +
            '<span class="comment__time">' + timeAgo(comment.created_at) + '</span></div>' +
            '<p class="comment__body">' + esc(comment.body) + '</p>' +
            '<a class="comment__work" href="work.html?id=' + encodeURIComponent(comment.artwork_id) + '">' +
            '「' + esc(comment.artwork_title) + '」로 →</a>' +
            '</div></li>';
        }).join('');
      }
      if (commentEmpty) commentEmpty.classList.toggle('is-visible', isOwner && received.length === 0);

      lastSignature = profileSignature(target);
    }

    /* -------------------------------------------------- 이벤트 */
    setupStudioEditor();
    setupRoomCharacter();
    ensureProfileModal();

    if (editBtn) {
      editBtn.addEventListener('click', function () {
        if (isOwner) openProfileModal(Store.profile());
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function () {
        if (!window.confirm('다락방에서 나갈까요? 다시 필명으로 들어올 수 있어요.')) return;
        await Store.signOut();
        toast('다락방 문을 닫았어요. 또 오세요!');
      });
    }

    Store.onAuth(function (profile) {
      if (profileSignature(profile) === lastSignature) return;
      render();
    });

    await render();
  }

  function ensureProfileModal() {
    if (document.getElementById('profile-modal')) return;

    var fieldChips = FIELDS.map(function (field) {
      return '<button class="chip" type="button" data-profile-field="' + field + '" data-field="' + field + '" ' +
        'aria-pressed="false"><i class="dot" aria-hidden="true"></i>' + field + '</button>';
    }).join('');

    document.body.insertAdjacentHTML('beforeend', '' +
      '<div class="modal" id="profile-modal" hidden>' +
      '<div class="modal__backdrop" data-profile-close></div>' +
      '<div class="modal__card" role="dialog" aria-modal="true" aria-labelledby="profile-title">' +
      '<button class="modal__close" type="button" data-profile-close aria-label="닫기">✕</button>' +
      '<p class="kicker">다락방 꾸미기</p>' +
      '<h2 id="profile-title">내 방을 조금 더 나답게</h2>' +
      '<p class="modal__desc">소개와 다락방 한마디는 다른 사람이 내 다락방에 들어왔을 때 보입니다.</p>' +
      '<form id="profile-form">' +
      '<label class="form-field"><span>한 줄 소개</span>' +
      '<textarea class="textarea" name="bio" maxlength="300" rows="4" ' +
      'placeholder="천천히 쓰고 천천히 찍는 사람. 요즘은 밤의 다락방에서 짧은 글을 씁니다."></textarea>' +
      '</label>' +
      '<label class="form-field"><span>다락방 한마디 <em>(선택)</em></span>' +
      '<input class="input" name="attic_note" maxlength="80" placeholder="예: 오늘도 한 줄 남기고 갑니다">' +
      '<small class="form-note">벽지 색은 다락방 화면에서 바로 바꿀 수 있어요.</small>' +
      '</label>' +
      '<div class="form-field"><span>요즘 만드는 분야</span>' +
      '<div class="opt-chips" data-profile-fields>' + fieldChips + '</div></div>' +
      '<div class="form-field"><span>성별 <em>(선택)</em></span>' +
      '<div class="opt-chips" data-profile-genders>' + genderChipsHTML() + '</div></div>' +
      '<div class="form-field"><span>다락방 캐릭터 <em>(선택)</em></span>' +
      '<div data-profile-avatar></div>' +
      '<small class="form-note">고른 사진은 내 다락방 프로필과 위쪽 버튼에 함께 나타나요.</small>' +
      '</div>' +
      '<p class="form-error" data-profile-error role="alert" hidden></p>' +
      '<button class="btn btn--primary auth-submit" type="submit">저장하기</button>' +
      '</form></div></div>');

    var modal = document.getElementById('profile-modal');
    var form = document.getElementById('profile-form');
    var errorEl = modal.querySelector('[data-profile-error]');
    var selected = [];

    var avatarRoot = modal.querySelector('[data-profile-avatar]');
    avatarRoot.innerHTML = avatarPickerHTML('avatar-picker--modal');
    var profileAvatar = createAvatarPicker(avatarRoot.querySelector('[data-avatar-picker]'));
    var profileGender = createGenderChips(modal.querySelector('[data-profile-genders]'));

    modal.addEventListener('click', function (event) {
      if (event.target.hasAttribute('data-profile-close')) closeProfileModal();
    });

    modal.querySelectorAll('[data-profile-field]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var field = chip.getAttribute('data-profile-field');
        var index = selected.indexOf(field);
        if (index === -1) selected.push(field);
        else selected.splice(index, 1);
        chip.classList.toggle('is-active', selected.indexOf(field) !== -1);
        chip.setAttribute('aria-pressed', String(selected.indexOf(field) !== -1));
      });
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      errorEl.hidden = true;
      var data = new FormData(form);
      try {
        var me = Store.profile() || {};
        var currentAttic = Store.normalizeAtticProps(me.attic_props);
        await Store.updateProfile({
          bio: String(data.get('bio') || '').trim(),
          attic_note: String(data.get('attic_note') || '').trim(),
          fields: selected,
          attic_props: {
            mood: currentAttic.mood,
            props: currentAttic.props,
            avatar: profileAvatar ? profileAvatar.get() : '',
            gender: profileGender ? profileGender.get() : ''
          }
        });
        closeProfileModal();
        toast('다락방을 저장했어요.');
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.hidden = false;
      }
    });

    window.__openProfileModal = function (profile) {
      if (!profile) return;
      form.querySelector('[name="bio"]').value = profile.bio || '';
      form.querySelector('[name="attic_note"]').value = profile.attic_note || '';
      selected = (profile.fields || []).slice();
      var atticNow = Store.normalizeAtticProps(profile.attic_props);
      if (profileAvatar) profileAvatar.set(atticNow.avatar || '');
      if (profileGender) profileGender.set(atticNow.gender || '');
      modal.querySelectorAll('[data-profile-field]').forEach(function (chip) {
        var on = selected.indexOf(chip.getAttribute('data-profile-field')) !== -1;
        chip.classList.toggle('is-active', on);
        chip.setAttribute('aria-pressed', String(on));
      });
      errorEl.hidden = true;
      modal.hidden = false;
      document.body.classList.add('is-locked');
      window.setTimeout(function () {
        form.querySelector('[name="bio"]').focus();
      }, 40);
    };

    window.__closeProfileModal = function () {
      modal.hidden = true;
      document.body.classList.remove('is-locked');
    };

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.hidden) window.__closeProfileModal();
    });
  }

  function openProfileModal(profile) {
    if (window.__openProfileModal) window.__openProfileModal(profile);
  }

  function closeProfileModal() {
    if (window.__closeProfileModal) window.__closeProfileModal();
  }

  /* ============================================================
     9-2. 다락방 숨 고르기 (1분 · 3분 명상)
     ------------------------------------------------------------
     사무실 그림 아래의 작은 카드에서 열리는 호흡 코너입니다.
     들이쉬기 4초 → 멈추기 2초 → 내쉬기 4초 리듬에 맞춰 로즈밀크
     빛망울이 천천히 커졌다 작아지고, 안내 문구와 남은 시간이 보입니다.

     · 방문자도 그대로 쓸 수 있고, 다락방 설정(attic_props)은 건드리지 않습니다.
     · 잠시 멈춤 / 그만하기 / 다시 하기가 언제든 됩니다.
     · 시험할 때는 window.DarakCalm.setSpeed(배속) 으로 시간을 빠르게 돌립니다.
     ============================================================ */
  var CALM_CYCLE = 10;                     /* 4 + 2 + 4 = 10초 한 호흡 */
  var CALM_PHASES = [
    { key: 'inhale', label: '들이쉬기', sec: 4 },
    { key: 'hold', label: '멈추기', sec: 2 },
    { key: 'exhale', label: '내쉬기', sec: 4 }
  ];
  var CALM_MIN_SCALE = 0.72;
  var CALM_MAX_SCALE = 1;

  function setupCalmCorner() {
    var modal = document.getElementById('calm-modal');
    if (!modal) return;

    var card = document.querySelector('[data-calm-open]');
    var pick = modal.querySelector('[data-calm-pick]');
    var chips = Array.prototype.slice.call(modal.querySelectorAll('[data-calm-minutes]'));
    var stage = modal.querySelector('.calm-stage');
    var phaseEl = modal.querySelector('[data-calm-phase]');
    var beatEl = modal.querySelector('[data-calm-beat]');
    var timeEl = modal.querySelector('[data-calm-time]');
    var timeNote = modal.querySelector('[data-calm-time-note]');
    var orb = modal.querySelector('[data-calm-orb]');
    var halo = modal.querySelector('[data-calm-glow]');
    var startBtn = modal.querySelector('[data-calm-start]');
    var pauseBtn = modal.querySelector('[data-calm-pause]');
    var stopBtn = modal.querySelector('[data-calm-stop]');
    var doneEl = modal.querySelector('[data-calm-done]');
    if (!startBtn || !pauseBtn || !stopBtn || !phaseEl || !timeEl) return;

    var state = 'idle';        /* idle · running · paused · done */
    var minutes = 1;
    var elapsed = 0;           /* 지금까지 흐른 시간(초) */
    var baseElapsed = 0;       /* 멈췄다 이어갈 때의 기준 */
    var anchor = 0;
    var raf = 0;
    var speed = 1;             /* 시험용 배속 */

    function totalSeconds() { return minutes * 60; }

    function formatTime(seconds) {
      var left = Math.max(0, Math.ceil(seconds));
      var mm = Math.floor(left / 60);
      var ss = left % 60;
      return mm + ':' + (ss < 10 ? '0' : '') + ss;
    }

    function paintTime(seconds, note) {
      if (timeEl) timeEl.textContent = formatTime(seconds);
      if (timeNote) timeNote.textContent = note;
    }

    /* 0 → 1 → 0 으로 부드럽게 오가는 곡선 (양 끝이 천천히) */
    function smooth(p) {
      var v = Math.min(1, Math.max(0, p));
      return v * v * (3 - 2 * v);
    }

    function breathScale(t) {
      var pos = t % CALM_CYCLE;
      if (pos < 4) return CALM_MIN_SCALE + (CALM_MAX_SCALE - CALM_MIN_SCALE) * smooth(pos / 4);
      if (pos < 6) return CALM_MAX_SCALE;
      return CALM_MAX_SCALE - (CALM_MAX_SCALE - CALM_MIN_SCALE) * smooth((pos - 6) / 4);
    }

    function phaseAt(t) {
      var pos = t % CALM_CYCLE;
      var acc = 0;
      for (var i = 0; i < CALM_PHASES.length; i += 1) {
        if (pos < acc + CALM_PHASES[i].sec) {
          return { phase: CALM_PHASES[i], into: pos - acc };
        }
        acc += CALM_PHASES[i].sec;
      }
      return { phase: CALM_PHASES[0], into: 0 };
    }

    /* 안내 문구는 단계가 바뀔 때만 읽어 주고, 남은 초는 눈으로만 봅니다. */
    function paintPhase(label) {
      if (phaseEl.textContent !== label) phaseEl.textContent = label;
    }

    /* 빛망울 크기 · 빛 번짐 · 안내 문구를 한 번에 그립니다. */
    function paintBreath(t) {
      var scale = breathScale(t);
      var lift = (scale - CALM_MIN_SCALE) / (CALM_MAX_SCALE - CALM_MIN_SCALE);
      if (orb) orb.style.transform = 'scale(' + scale.toFixed(4) + ')';
      if (halo) halo.style.opacity = (0.26 + 0.5 * lift).toFixed(3);
      var info = phaseAt(t);
      var left = Math.max(1, Math.ceil(info.phase.sec - info.into));
      paintPhase(info.phase.label);
      var beat = left + '초';
      if (beatEl && beatEl.textContent !== beat) beatEl.textContent = beat;
      stage.setAttribute('data-phase', info.phase.key);
    }

    function paintIdle(message) {
      if (orb) orb.style.transform = 'scale(' + CALM_MIN_SCALE + ')';
      if (halo) halo.style.opacity = '0.26';
      stage.setAttribute('data-phase', 'idle');
      paintPhase(message || '준비되면 시작을 눌러 주세요.');
      if (beatEl) beatEl.textContent = '';
      paintTime(totalSeconds(), '남음');
    }

    function paintButtons() {
      var busy = state === 'running' || state === 'paused';
      startBtn.hidden = busy;
      pauseBtn.hidden = !busy;
      stopBtn.hidden = state === 'idle' || state === 'done';
      startBtn.textContent = state === 'done' ? '한 번 더 하기' : '시작하기';
      pauseBtn.textContent = state === 'paused' ? '이어하기' : '잠시 멈춤';
      chips.forEach(function (chip) { chip.disabled = busy; });
      if (pick) pick.classList.toggle('is-locked', busy);
      doneEl.hidden = state !== 'done';
      stage.classList.toggle('is-live', state === 'running');
    }

    function cancelFrame() {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    function loop() {
      if (state !== 'running') return;
      var now = window.performance && window.performance.now ? window.performance.now() : Date.now();
      elapsed = baseElapsed + ((now - anchor) / 1000) * speed;
      if (elapsed >= totalSeconds()) {
        elapsed = totalSeconds();
        paintBreath(elapsed);
        paintTime(0, '');
        finishSession();
        return;
      }
      paintBreath(elapsed);
      paintTime(totalSeconds() - elapsed, '남음');
      raf = window.requestAnimationFrame(loop);
    }

    function startSession() {
      cancelFrame();
      state = 'running';
      elapsed = 0;
      baseElapsed = 0;
      anchor = window.performance && window.performance.now ? window.performance.now() : Date.now();
      paintButtons();
      paintBreath(0);
      paintTime(totalSeconds(), '남음');
      loop();
    }

    function togglePause() {
      if (state === 'running') {
        baseElapsed = elapsed;
        state = 'paused';
        cancelFrame();
        paintPhase('잠시 멈췄어요. 숨을 편하게 두세요.');
        if (beatEl) beatEl.textContent = '';
        stage.setAttribute('data-phase', 'paused');
        paintButtons();
      } else if (state === 'paused') {
        state = 'running';
        anchor = window.performance && window.performance.now ? window.performance.now() : Date.now();
        paintButtons();
        loop();
      }
    }

    function stopSession(message) {
      cancelFrame();
      state = 'idle';
      elapsed = 0;
      baseElapsed = 0;
      paintIdle(message);
      paintButtons();
    }

    function finishSession() {
      cancelFrame();
      state = 'done';
      elapsed = 0;
      baseElapsed = 0;
      paintIdle('숨을 다 골랐어요');
      paintTime(0, '');
      paintButtons();
      if (doneEl) doneEl.hidden = false;
      if (startBtn) startBtn.focus({ preventScroll: true });
    }

    function chooseMinutes(value) {
      var next = Number(value);
      if (next !== 1 && next !== 3) return;
      minutes = next;
      chips.forEach(function (chip) {
        var on = Number(chip.getAttribute('data-calm-minutes')) === minutes;
        chip.classList.toggle('is-active', on);
        chip.setAttribute('aria-pressed', String(on));
      });
      if (state === 'idle' || state === 'done') {
        state = 'idle';
        paintIdle('준비되면 시작을 눌러 주세요.');
        paintButtons();
      }
    }

    function openCalm() {
      stopSession('준비되면 시작을 눌러 주세요.');
      modal.hidden = false;
      document.body.classList.add('is-locked');
      window.setTimeout(function () {
        if (startBtn) startBtn.focus({ preventScroll: true });
      }, 40);
    }

    function closeCalm() {
      stopSession('준비되면 시작을 눌러 주세요.');
      modal.hidden = true;
      document.body.classList.remove('is-locked');
      if (card) card.focus({ preventScroll: true });
    }

    /* ------------------------------------------------ 이벤트 */
    if (card) card.addEventListener('click', openCalm);

    modal.addEventListener('click', function (event) {
      var target = event.target;
      if (target && target.hasAttribute && target.hasAttribute('data-calm-close')) closeCalm();
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        if (chip.disabled) return;
        chooseMinutes(chip.getAttribute('data-calm-minutes'));
      });
    });

    startBtn.addEventListener('click', startSession);
    pauseBtn.addEventListener('click', togglePause);
    stopBtn.addEventListener('click', function () { stopSession('언제든 다시 시작할 수 있어요.'); });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || modal.hidden) return;
      closeCalm();
    });

    paintIdle();
    paintButtons();

    /* 시험용 창구 — 배속을 올리면 같은 리듬으로 시간만 빨리 흐릅니다. */
    window.DarakCalm = {
      open: openCalm,
      close: closeCalm,
      setSpeed: function (value) {
        var next = Number(value);
        if (!isFinite(next) || next <= 0) return speed;
        if (state === 'running') {
          baseElapsed = elapsed;
          anchor = window.performance && window.performance.now ? window.performance.now() : Date.now();
        }
        speed = next;
        return speed;
      },
      getSpeed: function () { return speed; },
      state: function () { return state; }
    };
  }

  /* 알림 기능을 직접 확인해 볼 때 쓰는 작은 창구 (README 참고) */
  window.DarakNotify = {
    newSignup: notifyNewSignup
  };

  /* ============================================================
     10. 시작
     ============================================================ */
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    var ok = window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (!ok) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* 오프라인 기능은 없어도 됩니다 */ });
    });
  }

  async function boot() {
    setupNav();
    ensureAuthModal();
    setupCalmCorner();
    bindGlobalClicks();
    bindLikes(document);

    try {
      await Store.init();
    } catch (err) {
      console.error('[아트다락방] 초기화에 실패했어요.', err);
    }

    renderModeNote();
    renderAccount(Store.profile());
    Store.onAuth(function (profile) { renderAccount(profile); });

    var page = document.body.getAttribute('data-page');
    try {
      if (page === 'home') await initHome();
      else if (page === 'gallery') await initGallery();
      else if (page === 'work') await initWork();
      else if (page === 'register') await initRegister();
      else if (page === 'darakbang') await initDarakbang();
    } catch (err) {
      console.error('[아트다락방] 화면을 그리지 못했어요.', err);
      toast('화면을 불러오지 못했어요. 잠시 뒤 새로 고쳐 주세요.');
    }

    registerServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
