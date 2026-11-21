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
    { key: 'vinyl', label: '레코드판', icon: 'vinyl' },
    { key: 'coffee', label: '커피머신', icon: 'coffee' },
    { key: 'beanbag', label: '2인용 소파', icon: 'beanbag' },
    { key: 'piano', label: '피아노', icon: 'note' },
    { key: 'candle', label: '캔들 워머', icon: 'candle' },
    { key: 'dessert', label: '디저트 트레이', icon: 'dessert' },
    { key: 'board', label: '엽서·사진 보드', icon: 'board' },
    { key: 'dog', label: '강아지 쿠션', icon: 'dog' },
    { key: 'camera', label: '필름 카메라', icon: 'camera' }
  ];
  var PROP_LABEL = {
    easel: '이젤 & 캔버스', desk: '원목 책상 & 노트북', lamp: '스탠드 조명',
    guitar: '어쿠스틱 기타', plant: '작은 화분', tea: '찻잔 세트', garland: '전구 가랜드',
    cat: '고양이 방석', books: '책 더미', vinyl: '레코드판',
    coffee: '커피머신', beanbag: '2인용 소파', piano: '피아노', candle: '캔들 워머', dessert: '디저트 트레이',
    board: '엽서·사진 보드', dog: '강아지 쿠션', camera: '필름 카메라'
  };

  /* 큰 창밖 풍경 — 'auto' 는 작업실 분위기에 맞춘 기본 창입니다. (store.js 의 attic_props.view) */
  var VIEWS = [
    { key: 'auto', label: '기본', sub: '분위기 따라' },
    { key: 'sunrise', label: '일출', sub: '아침 빛' },
    { key: 'sunset', label: '일몰', sub: '노을 빛' },
    { key: 'ocean', label: '바다', sub: '윤슬·잔물결' }
  ];
  var VIEW_LABEL = { auto: '기본 창', sunrise: '일출', sunset: '일몰', ocean: '바다' };
  var VIEW_SUBLABEL = { auto: '분위기에 맞춘 창', sunrise: '떠오는 아침 해', sunset: '지는 노을', ocean: '반짝이는 바다' };

  /* 방 안 캐릭터의 자세 — 서기(기본) · 앉기 · 작업하기 · 명상하기.
     store.js 의 attic_props.pose 와 같은 키이고, stand 일 때는 키를 저장하지 않습니다. */
  var POSES = [
    { key: 'stand', label: '서기', sub: '기본', icon: 'stand' },
    { key: 'sit', label: '앉기', sub: '러그에 앉아', icon: 'sit' },
    { key: 'work', label: '작업하기', sub: '집중하는 손', icon: 'work' },
    { key: 'meditate', label: '명상하기', sub: '눈 감고 호흡', icon: 'meditate' }
  ];
  var POSE_LABEL = { stand: '서기', sit: '앉기', work: '작업하기', meditate: '명상하기' };
  var POSE_TOAST = {
    stand: '캐릭터가 다시 서 있어요.',
    sit: '캐릭터가 러그에 앉았어요.',
    work: '캐릭터가 작업을 시작했어요.',
    meditate: '캐릭터가 눈을 감고 숨을 골라요.'
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
    vinyl: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1.2"/>',
    coffee: '<path d="M5 3.6h11v10H5z"/><path d="M5 7.4h11"/><circle cx="12.8" cy="5.6" r="1"/><path d="M8 13.6v2.2M12.6 13.6v2.2"/><path d="M8.4 16.2h6.4a2.1 2.1 0 0 1-2.1 3.2h-2.2a2.1 2.1 0 0 1-2.1-3.2z"/><path d="M6 21h11"/>',
    beanbag: '<path d="M5.4 19.6c-2 0-3.4-1.5-3.4-3.4C2 11.4 5.6 8 12 8s10 3.4 10 8.2c0 1.9-1.4 3.4-3.4 3.4z"/><path d="M5.8 19.4c.7-2.9 3.2-4.4 6.2-4.4s5.5 1.5 6.2 4.4"/><path d="M8.2 8.4C8.2 6.2 9.9 4.6 12 4.6s3.8 1.6 3.8 3.8"/>',
    candle: '<path d="M8.8 21h6.4"/><path d="M9.6 21v-7h4.8v7"/><path d="M12 14v-2"/><path d="M12 12c1.4-1.2 2-2 2-2.9a2 2 0 1 0-4 0c0 .9.6 1.7 2 2.9z"/><path d="M5.4 9.6l-1.5-1.5M18.6 9.6l1.5-1.5M4 15.4H2.4M20 15.4h1.6"/>',
    dessert: '<path d="M3 18.6h18"/><path d="M6.4 18.6c0-3 2.5-5.2 5.6-5.2s5.6 2.2 5.6 5.2"/><path d="M12 13.4V11"/><circle cx="12" cy="9.6" r="1.5"/><path d="M17.8 14.6c1.7-.5 2.9.4 2.6 1.9"/>',
    board: '<rect x="2.6" y="4" width="18.8" height="14" rx="2.4"/><path d="M2.6 8.2h18.8"/><path d="M10.8 8.2v9.8M15.2 8.2v9.8"/><circle cx="6.6" cy="12.2" r="1.7"/><path d="M14 18.4l5.6-6"/>',
    dog: '<path d="M6.2 20c0-3.2 2.6-5.4 5.8-5.4s5.8 2.2 5.8 5.4z"/><circle cx="12" cy="10" r="3.8"/><path d="M8.4 7.6L6 5.6c-.6 1.9.2 3.7 1.8 4.6M15.6 7.6l2.4-2c.6 1.9-.2 3.7-1.8 4.6"/><path d="M10.6 10.4h.01M13.4 10.4h.01"/><path d="M11.2 12.1h1.6"/>',
    camera: '<rect x="2.8" y="7.4" width="18.4" height="11.6" rx="2.6"/><path d="M8.6 7.4l1.4-2.6h4l1.4 2.6"/><circle cx="12" cy="13.4" r="3.4"/><circle cx="12" cy="13.4" r="1.4"/><path d="M17.8 10.4h.01"/>',
    stand: '<circle cx="12" cy="4.6" r="2.4"/><path d="M12 7.2v7.2M12 14.4l-2.8 6M12 14.4l2.8 6M7.6 9.6l4.4 1.4 4.4-1.4"/>',
    sit: '<circle cx="12" cy="4.6" r="2.4"/><path d="M12 7.4v4.2l-4.2 1.6"/><path d="M12 11.6h3.4l1.2 5.4"/><path d="M6.4 20h11.4"/><path d="M16.6 11.2l1.8 3.2"/>',
    work: '<circle cx="12" cy="4.6" r="2.4"/><path d="M12 7.4v4.4"/><path d="M12 11.8c-2.4 0-4.2 1.6-4.2 4.2"/><path d="M12 11.8c2.4 0 4.2 1.6 4.2 4.2"/><path d="M8.6 16.6l-1 3.8M15.4 16.6l1 3.8"/><path d="M12.6 13.4l4.6-3.2"/>',
    meditate: '<circle cx="12" cy="4.8" r="2.4"/><path d="M12 7.6v3.2"/><path d="M12 10.8c-1.8 0-3 1.2-3 2.6 0 1.4 1.2 2.4 3 2.4s3-1 3-2.4c0-1.4-1.2-2.6-3-2.6z"/><path d="M9 10.8L5.2 13.6M15 10.8l3.8 2.8"/><path d="M5.2 13.6c-.8 1 .2 2.2 1.6 2.2M18.8 13.6c.8 1-.2 2.2-1.6 2.2"/><path d="M6.4 20c3.4-1.6 7.8-1.6 11.2 0"/>',
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
      el.innerHTML = avatarImgHTML(entry.photo, 'avatar-img');
      el.classList.add('has-photo');
      el.setAttribute('data-avatar-key', entry.photo);
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
     같은 여섯 아키타입을 여자/남자로 바꿔 볼 수 있습니다. */
  function avatarPickerHTML(modifier) {
    var cards = Store.ATTIC_AVATARS.map(function (item) {
      return '<button class="avatar-card" type="button" data-avatar-card data-avatar-base="' + item.key + '" ' +
        'aria-pressed="false">' +
        '<span class="avatar-card__photo">' + avatarImgHTML(item.photo.f, 'avatar-card__img') +
        '<span class="avatar-card__check" aria-hidden="true">✓</span></span>' +
        '<span class="avatar-card__text"><b class="avatar-card__title">' + item.title + '</b></span>' +
        '</button>';
    }).join('');

    return '<div class="avatar-picker ' + (modifier || '') + '" data-avatar-picker>' +
      '<div class="avatar-filter" role="group" aria-label="캐릭터 성별 고르기">' +
      '<button class="avatar-filter__chip is-active" type="button" data-avatar-gender="f" aria-pressed="true">여자</button>' +
      '<button class="avatar-filter__chip" type="button" data-avatar-gender="m" aria-pressed="false">남자</button>' +
      '</div>' +
      '<div class="avatar-grid">' +
      '<button class="avatar-card avatar-card--letter is-active" type="button" data-avatar-card data-avatar-base="" aria-pressed="true">' +
      '<span class="avatar-card__photo avatar-card__photo--letter" aria-hidden="true">✦</span>' +
      '<span class="avatar-card__text"><b>글자 기본</b><small>필명 첫 글자</small></span>' +
      '<span class="avatar-card__check" aria-hidden="true">✓</span>' +
      '</button>' + cards +
      '</div></div>';
  }

  function createAvatarPicker(root, onChange) {
    if (!root) return null;
    var state = { avatar: '', gender: 'f' };

    /* 고른 성별의 사진으로 카드 여섯 장을 바꿉니다. */
    function paintCardPhotos() {
      root.querySelectorAll('[data-avatar-base]').forEach(function (card) {
        var base = card.getAttribute('data-avatar-base');
        if (!base) return;
        var entry = Store.avatarByKey(Store.characterValue(base, state.gender));
        var img = card.querySelector('img');
        if (entry && img && img.getAttribute('src') !== AVATAR_DIR + entry.photo + '.webp') {
          img.setAttribute('src', AVATAR_DIR + entry.photo + '.webp');
        }
      });
    }

    function syncGender() {
      root.querySelectorAll('[data-avatar-gender]').forEach(function (chip) {
        var on = chip.getAttribute('data-avatar-gender') === state.gender;
        chip.classList.toggle('is-active', on);
        chip.setAttribute('aria-pressed', String(on));
      });
    }

    function syncCards() {
      root.querySelectorAll('[data-avatar-card]').forEach(function (card) {
        var base = card.getAttribute('data-avatar-base') || '';
        var on = !!base && state.avatar === Store.characterValue(base, state.gender);
        card.classList.toggle('is-active', on);
        card.setAttribute('aria-pressed', String(on));
      });
    }

    root.addEventListener('click', function (event) {
      var gender = event.target.closest ? event.target.closest('[data-avatar-gender]') : null;
      if (gender) {
        var next = gender.getAttribute('data-avatar-gender') === 'm' ? 'm' : 'f';
        if (next === state.gender) return;
        state.gender = next;
        var current = Store.normalizeCharacter(state.avatar);
        var base = current ? current.split(':')[0] : '';
        if (base) state.avatar = Store.characterValue(base, next);
        paintCardPhotos();
        syncGender();
        syncCards();
        if (base && typeof onChange === 'function') onChange(state.avatar);
        return;
      }
      var card = event.target.closest ? event.target.closest('[data-avatar-card]') : null;
      if (!card) return;
      var picked = card.getAttribute('data-avatar-base') || '';
      state.avatar = picked ? Store.characterValue(picked, state.gender) : '';
      syncCards();
      if (typeof onChange === 'function') onChange(state.avatar);
    });

    paintCardPhotos();
    syncGender();
    syncCards();
    return {
      get: function () { return state.avatar; },
      gender: function () { return state.gender; },
      set: function (value) {
        var entry = avatarEntry(value);
        if (entry) {
          state.avatar = entry.value;
          state.gender = entry.gender;
        } else {
          state.avatar = '';
        }
        paintCardPhotos();
        syncGender();
        syncCards();
      },
      reset: function () {
        state.avatar = '';
        state.gender = 'f';
        paintCardPhotos();
        syncGender();
        syncCards();
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
  /* 마음은 아직 아무도 누르지 않았으면 ♡ 만 보이고,
     실제로 마음이 하나라도 모였을 때만 숫자를 붙입니다. */
  function likeButtonHTML(work) {
    var liked = Store.isLiked(work.id);
    var count = work.like_count + (liked ? 1 : 0);
    return '<button class="like' + (liked ? ' is-liked' : '') + '" type="button" ' +
      'data-like-id="' + esc(work.id) + '" data-base="' + work.like_count + '" ' +
      'aria-pressed="' + (liked ? 'true' : 'false') + '" aria-label="마음 남기기">' +
      '<span class="like__icon" aria-hidden="true">' + (liked ? '♥' : '♡') + '</span>' +
      '<span class="like__count"' + (count > 0 ? '' : ' hidden') + '>' + nf(count) + '</span></button>';
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
      if (count) {
        var next = base + (liked ? 1 : 0);
        count.textContent = nf(next);
        if (next > 0) count.removeAttribute('hidden');
        else count.setAttribute('hidden', '');
      }
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
        if (text) text.textContent = '가입·로그인';
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
  var pendingDarakDraft = null;
  var darakSaveRequest = null;

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
        ? (pendingDarakDraft
          ? { attic_theme: pendingDarakDraft.attic_theme, attic_props: pendingDarakDraft.attic_props }
          : { attic_props: { avatar: pickedAvatar, gender: pickedGender } })
        : undefined;
      var profile = auth.mode === 'signup'
        ? await Store.signUp(pen, password, extra)
        : await Store.signIn(pen, password);
      if (auth.mode === 'signup' && shouldNotifySignup()) {
        /* 관리자 메일 알림 — 기다리지 않고 보내고, 실패해도 가입은 그대로 진행됩니다. */
        notifyNewSignup(profile || { pen_name: pen });
      }
      pendingDarakDraft = null;
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
        else if (document.body.getAttribute('data-page') === 'darakbang' && darakSaveRequest) darakSaveRequest();
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
    var viewPicker = document.querySelector('[data-view-picker]');
    var posePicker = document.querySelector('[data-pose-picker]');
    var propPicker = document.querySelector('[data-prop-picker]');
    var propsReset = document.querySelector('[data-props-reset]');
    var propsLock = document.querySelector('[data-props-lock]');
    var roomReset = document.querySelector('[data-room-reset]');
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
    var activityProp = '';
    var activityPoseOverride = '';
    var lastPropDragAt = 0;
    var lastPropTapAt = 0;
    var audioContext = null, audioMaster = null, audioEnabled = false, audioTimer = null;

    /* 이웃 다락방 · 방명록 */
    var neighborGrid = document.getElementById('neighbor-grid');
    var neighborEmpty = document.getElementById('neighbors-empty');
    var neighborCount = document.querySelector('[data-neighbors-count]');
    var neighborMore = document.getElementById('neighbors-more');
    var guestbookTitle = document.querySelector('[data-guestbook-title]');
    var guestbookDesc = document.querySelector('[data-guestbook-desc]');
    var guestbookCount = document.querySelector('[data-guestbook-count]');
    var guestbookForm = document.querySelector('[data-guestbook-form]');
    var guestbookGate = document.querySelector('[data-guestbook-gate]');
    var guestbookSetup = document.querySelector('[data-guestbook-setup]');
    var guestbookList = document.getElementById('guestbook-list');
    var guestbookEmpty = document.getElementById('guestbook-empty');
    var guestbookEmptyText = document.querySelector('[data-guestbook-empty-text]');
    var guestbookBody = document.getElementById('guestbook-body');
    var guestbookHint = document.querySelector('[data-guestbook-hint]');
    var guestbookSubmit = document.querySelector('[data-guestbook-submit]');
    var guestbookBusy = false;
    var guestbookHintBase = '짧은 인사 한 줄이면 충분해요.';
    var neighborMap = {};
    var NEIGHBOR_LIMIT = 12;

    /* ?pen=필명 으로 다른 사람의 다락방을 구경할 수 있습니다. */
    var penParam = (new URLSearchParams(window.location.search).get('pen') || '').trim();
    var target = null;
    var isOwner = false;
    var canCustomize = false;
    var draftMode = false;
    var attic = { mood: 'write', props: [], view: 'auto', pose: 'stand', avatar: '', gender: '', pos: {}, locked: false };
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
        view: normalized.view || 'auto',
        pose: normalized.pose || 'stand',
        avatar: normalized.avatar || '',
        gender: normalized.gender || '',
        pos: normalized.pos ? Object.assign({}, normalized.pos) : {},
        locked: normalized.locked === true
      };
    }

    function paintStudio() {
      if (!studio) return;
      var mood = MOOD_LABEL[attic.mood] ? attic.mood : 'write';
      ['write', 'paint', 'music', 'craft'].forEach(function (key) {
        studio.classList.toggle('droom--' + key, key === mood);
      });

      /* 창밖 풍경 — 방에 droom--view-* 를 붙여 SVG 안 풍경 한 벌만 보이게 합니다. */
      var view = VIEW_LABEL[attic.view] ? attic.view : 'auto';
      VIEWS.forEach(function (item) {
        studio.classList.toggle('droom--view-' + item.key, item.key === view);
      });
      studio.setAttribute('data-view', view);

      /* 캐릭터 자세 — 방 전체에 data-char-pose 를 붙여 이미지와 움직임을 바꿉니다. */
      var pose = POSE_LABEL[attic.pose] ? attic.pose : 'stand';
      studio.setAttribute('data-char-pose', pose);

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
      setText('[data-studio-view]', VIEW_LABEL[view]);
      setText('[data-studio-pose]', POSE_LABEL[pose]);

      var propNames = attic.props.map(function (key) { return PROP_LABEL[key]; }).filter(Boolean);
      studio.setAttribute('aria-label', MOOD_LABEL[mood] + ' 분위기의 다락방 사무실. 창밖은 ' +
        VIEW_SUBLABEL[view] + '. ' +
        (attic.avatar ? '캐릭터는 ' + POSE_LABEL[pose] + ' 자세로 있어요. ' : '') +
        (propNames.length ? '소품: ' + propNames.join(', ') + '.' : '아직 놓은 소품이 없어요.') +
        (canCustomize ? ' 소품은 끌어서 자리를 옮길 수 있어요.' : ''));

      paintPropPositions();
      paintPropLock();

      if (moodPicker) {
        moodPicker.querySelectorAll('[data-mood]').forEach(function (chip) {
          var on = chip.getAttribute('data-mood') === mood;
          chip.classList.toggle('is-active', on);
          chip.setAttribute('aria-pressed', String(on));
        });
      }
      setText('[data-mood-name]', MOOD_LABEL[mood]);

      if (viewPicker) {
        viewPicker.querySelectorAll('[data-view]').forEach(function (chip) {
          var on = chip.getAttribute('data-view') === view;
          chip.classList.toggle('is-active', on);
          chip.setAttribute('aria-pressed', String(on));
        });
      }
      setText('[data-view-name]', VIEW_LABEL[view]);

      if (posePicker) {
        posePicker.querySelectorAll('[data-pose]').forEach(function (chip) {
          var on = chip.getAttribute('data-pose') === pose;
          chip.classList.toggle('is-active', on);
          chip.setAttribute('aria-pressed', String(on));
        });
      }
      setText('[data-pose-name]', POSE_LABEL[pose]);

      if (propPicker) {
        propPicker.querySelectorAll('[data-prop]').forEach(function (chip) {
          var on = attic.props.indexOf(chip.getAttribute('data-prop')) !== -1;
          chip.classList.toggle('is-active', on);
          chip.setAttribute('aria-pressed', String(on));
        });
      }
      setText('[data-props-count]', attic.props.length ? attic.props.length + '개 놓임' : '0개 놓임');
    }

    /* -------------------------------------------------- 소품 끌어 옮기기 */
    /* 소품 자리는 방(800×500) 안에서 소품의 한가운데가 놓인 곳을 백분율로 기억합니다.
       그래서 휴대폰에서 옮긴 자리가 큰 화면에서도 같은 비율로 보입니다.
       pos 에 적힌 적이 없는 소품은 손대지 않아 지금까지의 기본 자리 그대로 보입니다. */
    var ROOM_W = 800;
    var ROOM_H = 500;
    var propDrag = null;

    function propGroups(key) {
      if (!studio) return [];
      return Array.prototype.slice.call(studio.querySelectorAll('[data-prop="' + key + '"]'));
    }

    /* 캐릭터보다 앞에 그리는 가구 앞면 레이어(소파 앞면·책상 상판·건반·기타 몸통).
       원본 소품과 같은 이동량을 받으므로 소품을 끌어 옮기면 함께 따라갑니다. */
    function propFrontGroups(key) {
      if (!studio) return [];
      return Array.prototype.slice.call(studio.querySelectorAll('[data-prop-front="' + key + '"]'));
    }

    /* 한 소품의 원본과 앞면 레이어에 같은 자리 이동을 겁니다. */
    function setPropFamilyOffset(key, dx, dy) {
      propGroups(key).forEach(function (node) {
        if (!node.classList.contains('is-on')) return;
        setPropOffset(node, dx, dy);
      });
      propFrontGroups(key).forEach(function (front) {
        setPropOffset(front, dx, dy);
      });
    }

    function propBBox(node) {
      if (!node) return null;
      try {
        var box = node.getBBox();
        if (!box || !box.width || !box.height) return null;
        return box;
      } catch (err) {
        return null;
      }
    }

    /* 소품이 방 밖으로 나가지 않게 옮길 수 있는 범위를 좁힙니다. */
    function clampPropOffset(box, dx, dy) {
      var minX = -box.x;
      var maxX = ROOM_W - (box.x + box.width);
      var minY = -box.y;
      var maxY = ROOM_H - (box.y + box.height);
      if (maxX < minX) minX = maxX = (ROOM_W - box.width) / 2 - box.x;
      if (maxY < minY) minY = maxY = (ROOM_H - box.height) / 2 - box.y;
      return {
        dx: Math.min(Math.max(dx, minX), maxX),
        dy: Math.min(Math.max(dy, minY), maxY)
      };
    }

    function propOffset(box, pos) {
      if (!box) return { dx: 0, dy: 0 };
      if (!pos) return { dx: 0, dy: 0 };
      var cx = box.x + box.width / 2;
      var cy = box.y + box.height / 2;
      return clampPropOffset(box, (pos.x / 100) * ROOM_W - cx, (pos.y / 100) * ROOM_H - cy);
    }

    function setPropOffset(node, dx, dy) {
      if (!node) return;
      if (!dx && !dy) {
        node.style.transform = '';
        return;
      }
      node.style.transform = 'translate(' + dx.toFixed(2) + 'px, ' + dy.toFixed(2) + 'px)';
    }

    /* 저장된 자리를 방 안 소품에 하나하나 적용합니다.
       소품과 그 앞면 레이어는 언제나 같은 이동량을 씁니다. */
    function paintPropPositions() {
      Store.ATTIC_PROPS.forEach(function (key) {
        var nodes = propGroups(key);
        var shown = nodes.filter(function (node) { return node.classList.contains('is-on'); });
        nodes.forEach(function (node) {
          if (!node.classList.contains('is-on')) node.style.transform = '';
        });
        var source = shown[0] || nodes[0];
        var offset = source ? propOffset(propBBox(source), attic.pos[key]) : { dx: 0, dy: 0 };
        var fronts = propFrontGroups(key);
        fronts.forEach(function (front) {
          front.classList.toggle('is-on', shown.length > 0);
          setPropOffset(front, offset.dx, offset.dy);
        });
        shown.forEach(function (node) {
          setPropOffset(node, offset.dx, offset.dy);
        });
      });
    }

    /* 화면 좌표 → 방(SVG viewBox) 좌표 */
    function roomPoint(node, clientX, clientY) {
      var svg = node && node.ownerSVGElement;
      if (!svg || !svg.getScreenCTM) return null;
      var ctm = svg.getScreenCTM();
      if (!ctm) return null;
      var point = svg.createSVGPoint();
      point.x = clientX;
      point.y = clientY;
      var local = point.matrixTransform(ctm.inverse());
      return { x: local.x, y: local.y };
    }

    function startPropDrag(event) {
      if (!studio || !canCustomize || propDrag) return;
      /* 소품 고정을 켜 두면 손가락이 스쳐도 자리가 움직이지 않습니다. */
      if (attic.locked) return;
      if (event.button != null && event.button !== 0) return;
      var node = event.target && event.target.closest ? event.target.closest('.droom__prop') : null;
      if (!node || !studio.contains(node) || !node.classList.contains('is-on')) return;
      var key = node.getAttribute('data-prop');
      if (!key || !PROP_LABEL[key]) return;
      var box = propBBox(node);
      var start = roomPoint(node, event.clientX, event.clientY);
      if (!box || !start) return;
      var offset = propOffset(box, attic.pos[key]);
      propDrag = {
        key: key,
        node: node,
        box: box,
        pointerId: event.pointerId,
        startX: start.x,
        startY: start.y,
        startClientX: event.clientX,
        startClientY: event.clientY,
        baseDx: offset.dx,
        baseDy: offset.dy,
        dx: offset.dx,
        dy: offset.dy,
        moved: false
      };
      node.classList.add('is-dragging');
      try { node.setPointerCapture(event.pointerId); } catch (err) { /* 잡지 못해도 아래에서 계속 */ }
      event.preventDefault();
    }

    function movePropDrag(event) {
      if (!propDrag || event.pointerId !== propDrag.pointerId) return;
      /* 손가락이 화면에서 6px 넘게 움직였을 때만 끌기로 봅니다. 방 좌표(0.5)로 재면
         누를 때의 미세한 흔들림도 끌기로 잡혀 탭이 먹히지 않았습니다. */
      if (Math.abs(event.clientX - propDrag.startClientX) > 6 ||
          Math.abs(event.clientY - propDrag.startClientY) > 6) {
        propDrag.moved = true;
      }
      if (!propDrag.moved) return;
      var point = roomPoint(propDrag.node, event.clientX, event.clientY);
      if (!point) return;
      var moved = clampPropOffset(propDrag.box,
        propDrag.baseDx + (point.x - propDrag.startX),
        propDrag.baseDy + (point.y - propDrag.startY));
      propDrag.dx = moved.dx;
      propDrag.dy = moved.dy;
      setPropFamilyOffset(propDrag.key, moved.dx, moved.dy);
      event.preventDefault();
    }

    function finishPropDrag(event) {
      if (!propDrag) return;
      if (event && event.pointerId != null && event.pointerId !== propDrag.pointerId) return;
      var drag = propDrag;
      propDrag = null;
      drag.node.classList.remove('is-dragging');
      if (drag.moved) lastPropDragAt = Date.now();
      try { drag.node.releasePointerCapture(drag.pointerId); } catch (err) { /* 이미 풀렸어요 */ }

      /* 그냥 눌렀다 뗀 것이라면 자리를 건드리지 않고 소품을 이용합니다.
         (터치 화면에서는 pointerdown 의 기본 동작을 막으면 click 이 오지 않아
          예전처럼 click 만 기다리면 소품이 눌리지 않았습니다.) */
      if (!drag.moved) {
        var back = propOffset(drag.box, attic.pos[drag.key]);
        setPropFamilyOffset(drag.key, back.dx, back.dy);
        tapProp(drag.node);
        return;
      }

      var pos = {
        x: Math.min(100, Math.max(0, (drag.box.x + drag.box.width / 2 + drag.dx) / ROOM_W * 100)),
        y: Math.min(100, Math.max(0, (drag.box.y + drag.box.height / 2 + drag.dy) / ROOM_H * 100))
      };
      attic.pos[drag.key] = {
        x: Math.round(pos.x * 10) / 10,
        y: Math.round(pos.y * 10) / 10
      };
      /* 저장값(소수 한 자리)과 화면을 똑같이 맞춥니다. */
      var settled = propOffset(drag.box, attic.pos[drag.key]);
      setPropFamilyOffset(drag.key, settled.dx, settled.dy);
      /* 소품을 쓰던 중이면 캐릭터도 옮긴 자리를 따라갑니다. */
      paintRoomCharacter();
      persistAttic(PROP_LABEL[drag.key] + ' 소품을 옮겨 두었어요.');
    }

    function cancelPropDrag(event) {
      if (!propDrag) return;
      if (event && event.pointerId != null && event.pointerId !== propDrag.pointerId) return;
      var drag = propDrag;
      propDrag = null;
      drag.node.classList.remove('is-dragging');
      var offset = propOffset(drag.box, attic.pos[drag.key]);
      setPropFamilyOffset(drag.key, offset.dx, offset.dy);
    }

    /* 소품을 눌렀을 때 — 고정 여부와 상관없이 이용(앉기·작업)만 켭니다. */
    function tapProp(node) {
      if (!node) return;
      var key = node.getAttribute('data-prop');
      if (!key) return;
      lastPropTapAt = Date.now();
      activatePropInteraction(key);
    }

    /* 손가락·마우스가 찍은 자리에 깔린 소품 — 캐릭터가 앞을 가려도 소품을 찾아냅니다. */
    function propUnderPoint(x, y) {
      if (!studio || !document.elementsFromPoint) return null;
      var list = document.elementsFromPoint(x, y) || [];
      for (var i = 0; i < list.length; i += 1) {
        var el = list[i];
        var prop = el && el.closest ? el.closest('.droom__prop.is-on') : null;
        if (prop && studio.contains(prop)) return prop;
      }
      return null;
    }

    function setupPropDrag() {
      if (!studio) return;
      studio.addEventListener('pointerdown', startPropDrag);
      studio.addEventListener('pointermove', movePropDrag);
      studio.addEventListener('pointerup', function (event) {
        if (propDrag) { finishPropDrag(event); return; }
        /* 고정 중에는 끌기가 아예 시작되지 않으니, 뗀 자리에서 소품을 눌렀는지 봅니다. */
        if (!attic.locked) return;
        var prop = (event.target && event.target.closest ? event.target.closest('.droom__prop.is-on') : null) ||
          propUnderPoint(event.clientX, event.clientY);
        if (prop && studio.contains(prop)) tapProp(prop);
      });
      studio.addEventListener('click', function (event) {
        var prop = event.target && event.target.closest ? event.target.closest('.droom__prop.is-on') : null;
        if (!prop || !studio.contains(prop)) return;
        /* 이미 pointerup 에서 켰으면 click 으로 또 켜지 않게 합니다. */
        if (Date.now() - lastPropTapAt < 450) return;
        if (Date.now() - lastPropDragAt < 350) return;
        tapProp(prop);
      });
      studio.addEventListener('pointercancel', cancelPropDrag);
      studio.addEventListener('lostpointercapture', function (event) {
        if (propDrag && event.pointerId === propDrag.pointerId) finishPropDrag(event);
      });
      /* 소품을 잡고 있는 동안에는 화면이 스크롤되지 않게 합니다.
         (SVG 안쪽 요소의 touch-action 만으로는 브라우저가 스크롤을 시작해 버려서
          touchmove 를 한 번 더 막아 줍니다.) */
      studio.addEventListener('touchmove', function (event) {
        if (propDrag && event.cancelable) event.preventDefault();
      }, { passive: false });
    }

    /* -------------------------------------------------- 방 안 캐릭터 */
    /* 자세 그림 파일 이름 — 고른 자세의 그림(room-3d/<key>-<pose>.webp)을 씁니다.
       'sofa' 는 소파 전용 자세라 고르는 자세(POSE_LABEL)에는 없지만 그림은 따로 있습니다. */
    var POSE_IMG = { stand: 1, sit: 1, work: 1, meditate: 1, sofa: 1 };
    var roomPoseProbe = {};
    function roomPoseSrc(charKey, pose) {
      /* data-char 는 'seoyun:f' 모양이라 파일 이름('seoyun-f')에 맞춰 바꿉니다. */
      var key = String(charKey || '').replace(':', '-');
      if (!key) return '';
      var p = POSE_IMG[pose] ? pose : 'stand';
      /* 전용 그림이 없는 캐릭터는 소파에 앉은 그림으로 대신합니다. */
      if (p === 'sofa' && roomPoseProbe[key + '-sofa'] === 'miss') p = 'sit';
      return 'images/room-3d/' + key + (p === 'stand' ? '' : '-' + p) + '.webp';
    }

    /* 전용 자세 그림이 있는지 미리 한 번 확인합니다 — 없으면 roomPoseSrc 가 -sit 로 폴백합니다. */
    function probeRoomPose(charKey, pose) {
      var key = String(charKey || '').replace(':', '-');
      var id = key + '-' + pose;
      if (!key || roomPoseProbe[id]) return;
      roomPoseProbe[id] = 'ok';
      var probe = new Image();
      probe.onerror = function () {
        roomPoseProbe[id] = 'miss';
        if (roomChar && activityPoseOverride === pose) paintRoomCharacter();
      };
      probe.src = 'images/room-3d/' + id + '.webp';
    }

    /* -------------------------------------------------- 소품 상호작용 설정
       소품 하나에 대해 누를 때의 자세 · 자리 · 말 · 효과 · 소리 · 앞면 레이어를
       한 곳에서 관리합니다. 새 소품을 더할 때도 이 표만 고치면 됩니다.

       x, y     : 소품 SVG 박스 안에서 발끝(앉은 자세는 엉덩이 아래)이 놓일 곳의 비율(%)
       dx, dy   : 박스 비율만으로는 안 맞는 실제 좌석 · 바닥 위치까지의 보정값(SVG 단위)
       scale    : 캐릭터 크기 (서 있는 그림 240 기준)
       facing   : 1 그대로, -1 좌우로 뒤집어 소품 쪽을 바라보게
       pose     : 쓰는 자세 그림 — stand · sit · work · meditate 넷 중에서 고릅니다
                  (전용 그림이 따로 없는 소품은 가장 가까운 자세를 골라 씁니다)
       seat     : 앉은 자세에서 좌석 호흡(data-char-seat)을 켤지 — 소파 · 피아노만
       fx       : 활동별 미세 모션 이름 (CSS 의 [data-char-activity] 가 받습니다)
       sound    : 누를 때 날 소리 (typing · candle)
       playing  : 활동 중 소품 자체 효과(건반 음표 · 커피 김)를 켤지
       foreground: 캐릭터 앞에 다시 그리는 가구 앞면 레이어가 있는지 (darakbang.html)
       say      : 캐릭터가 건네는 한 마디 */
    var PROP_INTERACTIONS = {
      /* 소파 — 쿠션 위에 기대어 다리를 소파 위로 길게 뻗고 책을 읽습니다.
         전용 그림(-sofa)의 아래 가운데가 엉덩이라, 그 점을 쿠션 윗면(385+93×100% = 478 에서 50 올린 428)에 맞춥니다. */
      beanbag: {
        x: 63.8, y: 100, dy: -44, scale: 0.76, facing: 1, pose: 'sofa', seat: true,
        fx: 'breathe', playing: false, foreground: true,
        say: '소파에 편히 기대어 쉬는 중...'
      },
      /* 책상 — 의자에 앉아 상판 너머로 노트북을 마주합니다. */
      desk: {
        x: 50, y: 100, dy: -52, scale: 0.80, facing: 1, pose: 'work', seat: false,
        fx: 'type', sound: 'typing', playing: false, foreground: true,
        say: '노트북으로 작업 중...'
      },
      /* 피아노 — 건반 앞 의자에 앉아 연주합니다. */
      piano: {
        x: 80.9, y: 100, dy: -17, scale: 0.78, facing: 1, pose: 'sit', seat: true,
        fx: 'notes', playing: true, foreground: true,
        say: '피아노 연주하는 중...'
      },
      /* 이젤 — 캔버스 옆에 비켜 서서 그림을 그립니다. */
      easel: {
        x: 100, y: 100, dx: 28, dy: 28, scale: 0.86, facing: 1, pose: 'stand', seat: false,
        fx: 'paint', playing: false, foreground: false,
        say: '캔버스에 그림 그리는 중...'
      },
      /* 커피머신 — 탁자 위가 아니라 탁자 옆 바닥에 서서 머신을 봅니다. */
      coffee: {
        x: 0, y: 100, dx: -22, dy: 154, scale: 0.82, facing: -1, pose: 'stand', seat: false,
        fx: 'steam', playing: true, foreground: false,
        say: '따뜻한 커피 내리는 중...'
      },
      /* 기타 — 바닥에 앉아 기타를 안고 뜯습니다. */
      guitar: {
        x: 90, y: 100, dy: 8, scale: 0.78, facing: 1, pose: 'sit', seat: false,
        fx: 'strum', playing: false, foreground: true,
        say: '기타 선율 고르는 중...'
      },
      /* 캔들 워머 — 자세 없이 소리와 말만 (불꽃은 소품 자체 모션). */
      candle: {
        sound: 'candle',
        say: '촛불이 조용히 타닥이고 있어요.'
      },

      /* ---- 장식 소품 — 다가가 바라보거나 곁에 앉아 한 마디 건넵니다 ---- */
      /* 스탠드 조명 — 불빛 옆에 서서 올려다봅니다. */
      lamp: {
        x: 50, y: 100, dx: -68, dy: -6, scale: 0.84, facing: -1, pose: 'stand',
        fx: 'look', say: '스탠드 불빛이 참 포근해요.'
      },
      /* 작은 화분 — 화분 옆에 서서 잎을 봅니다. */
      plant: {
        x: 50, y: 100, dx: 42, dy: -4, scale: 0.84, facing: 1, pose: 'stand',
        fx: 'look', say: '잎이 하나 더 자랐어요.'
      },
      /* 찻잔 세트 — 탁자 옆에 서서 차를 내립니다. */
      tea: {
        x: 50, y: 100, dx: 49, dy: 5, scale: 0.84, facing: 1, pose: 'stand',
        fx: 'look', say: '따뜻한 차 한 모금, 좋아요.'
      },
      /* 전구 가랜드 — 불빛 아래에 서서 올려다봅니다. */
      garland: {
        x: 50, y: 100, dy: 334, scale: 0.84, facing: 1, pose: 'stand',
        fx: 'look', say: '가랜드 불빛이 은은하게 내려와요.'
      },
      /* 고양이 방석 — 방석 옆에 앉아 같이 쉽니다. */
      cat: {
        x: 50, y: 100, dx: -74, dy: -6, scale: 0.76, facing: -1, pose: 'sit',
        fx: 'rest', say: '고양이 옆에서 같이 쉬는 중...'
      },
      /* 책 더미 — 책 옆에 앉아 한 장 넘깁니다. */
      books: {
        x: 50, y: 100, dx: -54, dy: -6, scale: 0.76, facing: -1, pose: 'sit',
        fx: 'rest', say: '책장 넘기는 소리가 좋아요.'
      },
      /* 레코드판 — 벽에 걸린 음반 아래에 서서 올려다봅니다. */
      vinyl: {
        x: 50, y: 100, dy: 226, scale: 0.84, facing: 1, pose: 'stand',
        fx: 'look', say: '이 음반, 몇 번을 들어도 좋아요.'
      },
      /* 디저트 트레이 — 창턱 아래에 서서 바라봅니다. */
      dessert: {
        x: 50, y: 100, dx: 4, dy: 197, scale: 0.82, facing: 1, pose: 'stand',
        fx: 'look', say: '디저트가 자꾸 눈에 밟혀요.'
      },
      /* 엽서·사진 보드 — 보드 아래에 서서 올려다봅니다. */
      board: {
        x: 50, y: 100, dy: 228, scale: 0.84, facing: 1, pose: 'stand',
        fx: 'look', say: '엽서에 담긴 마음이 따뜻해요.'
      },
      /* 강아지 쿠션 — 쿠션 옆에 앉아 기대어 봅니다. */
      dog: {
        x: 50, y: 100, dx: 58, dy: -5, scale: 0.76, facing: 1, pose: 'sit',
        fx: 'rest', say: '강아지 쿠션에 기대어 앉았어요.'
      },
      /* 필름 카메라 — 선반 아래에 서서 올려다봅니다. */
      camera: {
        x: 50, y: 100, dy: 190, scale: 0.84, facing: 1, pose: 'stand',
        fx: 'look', say: '필름 카메라로 한 장 찍어 볼까요.'
      }
    };
    /* 자세 그림에서 머리끝이 차지하는 높이(그림 아래 240 기준) — 말풍선을 머리 위에 놓습니다. */
    var POSE_HEAD = { stand: 234.4, sit: 156.1, work: 166.4, meditate: 178.6, sofa: 72.7 };
    var CHAR_IMG_W = 150, CHAR_IMG_H = 240, CHAR_ANCHOR_X = 75;
    var roomCharNow = null;
    var roomCharFrame = 0;

    function parseCharSpot(value) {
      var m = /translate\(\s*(-?[\d.]+)\s*[ ,]\s*(-?[\d.]+)\s*\)\s*scale\(\s*(-?[\d.]+)(?:\s*[, ]\s*(-?[\d.]+))?\s*\)/.exec(String(value || ''));
      if (!m) return null;
      return { x: parseFloat(m[1]), y: parseFloat(m[2]), s: Math.abs(parseFloat(m[3])), facing: parseFloat(m[3]) < 0 ? -1 : 1 };
    }

    /* 발끝 앵커를 기준으로 SVG 캐릭터의 좌우 방향까지 반영합니다. */
    function spotToTransform(spot) {
      var facing = spot.facing === -1 ? -1 : 1;
      return { x: spot.x - CHAR_ANCHOR_X * spot.s * facing, y: spot.y - CHAR_IMG_H * spot.s, s: spot.s, facing: facing };
    }

    function hasReducedMotion() {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function applyCharTransform(node, t) {
      if (!node) return;
      var facing = t.facing === -1 ? -1 : 1;
      node.setAttribute('transform', 'translate(' + t.x.toFixed(1) + ',' + t.y.toFixed(1) + ') scale(' + (t.s * facing) + ',' + t.s + ')');
    }

    /* 캐릭터를 새 자리로 옮깁니다 — 순간 이동하지 않고 0.4초 동안 부드럽게 미끄러집니다. */
    function moveRoomCharacter(spot, immediate) {
      if (!roomChar) return;
      var nodes = Array.prototype.slice.call(roomChar.querySelectorAll('[data-char]'));
      if (!nodes.length) return;
      var to = spotToTransform(spot);
      var from = roomCharNow;
      if (!from) {
        var base = parseCharSpot(nodes[0].getAttribute('data-base-transform') || nodes[0].getAttribute('transform'));
        from = base || to;
      }
      if (roomCharFrame) { window.cancelAnimationFrame(roomCharFrame); roomCharFrame = 0; }
      from.facing = from.facing === -1 ? -1 : 1;
      var settled = Math.abs(from.x - to.x) < 0.4 && Math.abs(from.y - to.y) < 0.4 &&
        Math.abs(from.s - to.s) < 0.002 && from.facing === to.facing;
      if (immediate || settled || hasReducedMotion()) {
        roomCharNow = to;
        nodes.forEach(function (node) { applyCharTransform(node, to); });
        return;
      }
      var start = 0;
      var duration = 420;
      function step(now) {
        if (!start) start = now;
        var p = Math.min(1, (now - start) / duration);
        var e = 1 - Math.pow(1 - p, 3);
        var cur = {
          x: from.x + (to.x - from.x) * e,
          y: from.y + (to.y - from.y) * e,
          s: from.s + (to.s - from.s) * e,
          facing: p < 0.5 ? from.facing : to.facing
        };
        roomCharNow = cur;
        nodes.forEach(function (node) { applyCharTransform(node, cur); });
        roomCharFrame = p < 1 ? window.requestAnimationFrame(step) : 0;
      }
      roomCharFrame = window.requestAnimationFrame(step);
    }

    /* 소품 박스 안의 비율로 발끝 위치를 계산합니다.
       소품을 직접 옮겼다면 저장된 이동량도 앵커에 함께 반영합니다. */
    function roomCharSpotFor(key) {
      var spec = PROP_INTERACTIONS[key];
      if (!spec || !studio || !spec.pose) return null;
      var propNode = studio.querySelector('[data-prop="' + key + '"]');
      var box = propBBox(propNode);
      if (!box) return null;
      var offset = propOffset(box, attic.pos[key]);
      var xp = spec.x == null ? 50 : spec.x;
      var yp = spec.y == null ? 100 : spec.y;
      var anchorX = box.x + box.width * xp / 100 + (spec.dx || 0);
      var anchorY = box.y + box.height * yp / 100 + (spec.dy || 0);
      return {
        x: Math.max(40, Math.min(ROOM_W - 40, anchorX + offset.dx)),
        y: Math.max(60, Math.min(ROOM_H - 6, anchorY + offset.dy)),
        s: spec.scale, facing: spec.facing, pose: spec.pose,
        fx: spec.fx, seat: spec.seat === true
      };
    }

    /* 말풍선·반짝임이 캐릭터 머리 위에 오도록 방 안 비율을 맞춥니다. */
    function paintRoomOverlay(spot, pose) {
      if (!studio) return;
      if (!spot) {
        studio.style.removeProperty('--room-char-x');
        studio.style.removeProperty('--room-say-bottom');
        return;
      }
      studio.style.setProperty('--room-char-x', Math.max(6, Math.min(94, (spot.x / ROOM_W) * 100)).toFixed(2) + '%');
      var head = POSE_HEAD[pose] || POSE_HEAD.stand;
      var headTop = spot.y - head * spot.s;
      var bottomPct = ((ROOM_H - (headTop - 14)) / ROOM_H) * 100;
      studio.style.setProperty('--room-say-bottom', Math.max(6, Math.min(88, bottomPct)).toFixed(2) + '%');
    }

    /* 고른 캐릭터 한 명만 방에 서고, 나머지는 방에서 빠집니다.
       글자 기본(빈 값)이면 방에 아무도 없어요. */
    function paintRoomCharacter(immediate) {
      if (!roomChar) return;
      sizeRoomOverlay();
      var key = attic.avatar || '';
      var pose = activityPoseOverride || (POSE_LABEL[attic.pose] ? attic.pose : 'stand');
      if (activityPoseOverride) probeRoomPose(attic.avatar, activityPoseOverride);
      var shown = false;
      var spot = null;
      Array.prototype.forEach.call(roomChar.querySelectorAll('[data-char]'), function (node) {
        var on = !!key && node.getAttribute('data-char') === key;
        node.classList.toggle('is-on', on);
        node.setAttribute('aria-hidden', String(!on));
        if (!node.hasAttribute('data-base-transform')) node.setAttribute('data-base-transform', node.getAttribute('transform') || '');
        if (on) {
          shown = true;
          if (activityProp) spot = roomCharSpotFor(activityProp);
          var img = node.querySelector('.droom__char-3d-img');
          var src = roomPoseSrc(node.getAttribute('data-char'), pose);
          if (img && src && img.getAttribute('href') !== src) img.setAttribute('href', src);
        }
      });
      if (shown) {
        var base = parseCharSpot(roomChar.querySelector('[data-char].is-on').getAttribute('data-base-transform')) ||
          { x: 401, y: 249.2, s: 0.92 };
        if (spot) {
          moveRoomCharacter(spot, immediate);
          paintRoomOverlay(spot, pose);
        } else {
          moveRoomCharacter({
            x: base.x + CHAR_ANCHOR_X * base.s * (base.facing === -1 ? -1 : 1),
            y: base.y + CHAR_IMG_H * base.s,
            s: base.s,
            facing: base.facing === -1 ? -1 : 1
          }, immediate);
          paintRoomOverlay(null, pose);
        }
      }
      roomChar.classList.toggle('is-on', shown);
      roomChar.setAttribute('aria-hidden', String(!shown));
      if (studio) {
        studio.setAttribute('data-char-pose', pose);
        studio.toggleAttribute('data-char-seat', !!(spot && spot.seat));
      }

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
      placeRoomSay();
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
      var key = String(figure.getAttribute('data-char') || '').split(':')[0];
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
      if (roomSay && roomSay.classList.contains('is-on')) placeRoomSay();
    }

    /* 말풍선이 방 밖으로 밀려나지 않게 — 캐릭터 머리 위에 두되 방 안으로 붙잡아 둡니다. */
    function placeRoomSay() {
      if (!roomSay || !studio) return;
      var W = studio.clientWidth || 320;
      var pct = parseFloat(studio.style.getPropertyValue('--room-char-x'));
      var center = W * ((isFinite(pct) ? pct : 58.6) / 100);
      var width = roomSay.offsetWidth || 0;
      var half = width / 2;
      var margin = Math.max(4, W * 0.02);
      var placed = center;
      if (width + margin * 2 >= W) {
        placed = W / 2;
      } else {
        placed = Math.max(margin + half, Math.min(W - margin - half, center));
      }
      roomSay.style.setProperty('--say-left', placed.toFixed(1) + 'px');
      roomSay.style.setProperty('--say-tail', (center - placed).toFixed(1) + 'px');
    }

    function setupRoomCharacter() {
      if (!studio || !roomChar) return;
      sizeRoomOverlay();
      window.addEventListener('resize', sizeRoomOverlay);

      studio.addEventListener('click', function (event) {
        var figure = event.target && event.target.closest ? event.target.closest('[data-char]') : null;
        if (!figure || !roomChar.contains(figure)) return;
        /* 캐릭터가 소품 앞을 가리고 있어도, 그 자리에 소품이 있으면 소품을 누른 것으로 봅니다. */
        var prop = propUnderPoint(event.clientX, event.clientY);
        if (prop) {
          if (Date.now() - lastPropTapAt >= 450) tapProp(prop);
          return;
        }
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
      setText('[data-avatar-name]', entry ? entry.title + '(' + entry.genderLabel + ')' : '글자 기본');
      if (avatarPicker && avatarPicker.get() !== attic.avatar) avatarPicker.set(attic.avatar);
      paintRoomCharacter();
    }

    function persistAttic(message) {
      if (!isOwner) return saveChain;
      var snapshot = {
        mood: attic.mood,
        props: attic.props.slice(),
        view: attic.view,
        pose: attic.pose,
        avatar: attic.avatar,
        gender: attic.gender,
        pos: Object.assign({}, attic.pos),
        locked: attic.locked === true
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
          if (!canCustomize) return;
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
          if (!dot || !canCustomize) return;
          var theme = dot.getAttribute('data-theme');
          if (!THEME_LABEL[theme] || currentTheme === theme) return;
          applyTheme(theme);
          paintStudio();
          if (!isOwner) return;
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
          if (!chip || !canCustomize) return;
          var mood = chip.getAttribute('data-mood');
          if (!MOOD_LABEL[mood] || attic.mood === mood) return;
          attic.mood = mood;
          paintStudio();
          persistAttic(MOOD_LABEL[mood] + ' 분위기로 바꿨어요.');
        });
      }

      /* 창밖 풍경 고르기 — 기본 · 일출 · 일몰 · 바다 */
      if (viewPicker) {
        viewPicker.innerHTML = VIEWS.map(function (view) {
          return '<button class="view-chip view-chip--' + view.key + '" type="button" data-view="' + view.key + '" aria-pressed="false">' +
            '<span class="view-chip__sky" aria-hidden="true"><i class="view-chip__sun"></i><i class="view-chip__line"></i></span>' +
            '<span class="view-chip__text"><b>' + view.label + '</b><small>' + view.sub + '</small></span>' +
            '<span class="view-chip__check" aria-hidden="true">✓</span>' +
            '</button>';
        }).join('');

        viewPicker.addEventListener('click', function (event) {
          var chip = event.target.closest ? event.target.closest('[data-view]') : null;
          if (!chip || !canCustomize) return;
          var view = chip.getAttribute('data-view');
          if (!VIEW_LABEL[view] || attic.view === view) return;
          attic.view = view;
          paintStudio();
          persistAttic(view === 'auto' ? '창밖을 기본 창으로 되돌렸어요.' : '창밖이 ' + VIEW_LABEL[view] + '로 바뀌었어요.');
        });
      }

      /* 캐릭터 자세 고르기 — 서기 · 앉기 · 작업하기 · 명상하기 */
      if (posePicker) {
        posePicker.innerHTML = POSES.map(function (pose) {
          return '<button class="pose-chip pose-chip--' + pose.key + '" type="button" data-pose="' + pose.key + '" aria-pressed="false">' +
            '<span class="pose-chip__ico">' + studioIcon(pose.icon) + '</span>' +
            '<span class="pose-chip__text"><b>' + pose.label + '</b><small>' + pose.sub + '</small></span>' +
            '<span class="pose-chip__check" aria-hidden="true">✓</span>' +
            '</button>';
        }).join('');

        posePicker.addEventListener('click', function (event) {
          var chip = event.target.closest ? event.target.closest('[data-pose]') : null;
          if (!chip || !canCustomize) return;
          var pose = chip.getAttribute('data-pose');
          if (!POSE_LABEL[pose] || attic.pose === pose) return;
          attic.pose = pose;
          if (pose === 'meditate') playSound('bowl');
          paintStudio();
          paintRoomCharacter();
          persistAttic(!attic.avatar
            ? '자세를 골랐어요. 방에 세울 캐릭터도 함께 골라 주세요.'
            : POSE_TOAST[pose]);
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
          if (!chip || !canCustomize) return;
          var key = chip.getAttribute('data-prop');
          if (!PROP_LABEL[key]) return;
          var index = attic.props.indexOf(key);
          if (index === -1) attic.props.push(key);
          else attic.props.splice(index, 1);
          paintStudio();
          persistAttic(PROP_LABEL[key] + ' 소품을 ' + (index === -1 ? '방에 놓았어요.' : '치웠어요.'));
        });
      }

      if (roomReset) roomReset.addEventListener('click', function () { restoreRoomActivity(); showRoomSay('기본 자리와 자세로 돌아왔어요.'); });
      /* 소품 자리 되돌리기 — 끌어 옮긴 자리를 모두 기본 자리로 돌립니다. */
      if (propsReset) {
        propsReset.addEventListener('click', function () {
          if (!canCustomize) return;
          if (!Object.keys(attic.pos || {}).length) {
            toast('소품이 모두 처음 자리에 있어요.');
            return;
          }
          attic.pos = {};
          paintStudio();
          persistAttic('소품을 처음 자리로 되돌렸어요.');
        });
      }
      /* 소품 고정 — 켜 두면 손가락이 스쳐도 자리가 움직이지 않고, 눌러서 이용만 할 수 있어요. */
      if (propsLock) {
        propsLock.addEventListener('click', function () {
          if (!canCustomize) return;
          attic.locked = !attic.locked;
          paintPropLock();
          persistAttic(attic.locked
            ? '소품을 고정했어요. 눌러서 이용만 할 수 있어요.'
            : '소품 고정을 풀었어요. 다시 끌어 옮길 수 있어요.');
        });
      }
    }

    /* 소품 고정 상태를 화면(버튼·방)에 반영합니다. */
    function paintPropLock() {
      var on = attic.locked === true;
      if (studio) studio.classList.toggle('droom--locked', on);
      if (!propsLock) return;
      propsLock.classList.toggle('is-active', on);
      propsLock.setAttribute('aria-pressed', String(on));
      propsLock.title = on ? '소품이 고정되어 있어요. 누르면 다시 옮길 수 있어요.' : '소품이 스쳐도 움직이지 않게 고정해요.';
      var label = propsLock.querySelector('[data-props-lock-label]');
      if (label) label.textContent = on ? '소품 고정됨' : '소품 고정';
    }


    function restoreRoomActivity() {
      activityProp = ''; activityPoseOverride = '';
      if (studio) {
        studio.querySelectorAll('.droom__prop.is-playing').forEach(function (node) { node.classList.remove('is-playing'); });
        studio.removeAttribute('data-char-seat');
        studio.removeAttribute('data-char-activity');
        studio.removeAttribute('data-char-fx');
      }
      stopAmbientAudio();
      paintRoomCharacter();
    }
    function activatePropInteraction(key) {
      var spec = PROP_INTERACTIONS[key];
      if (!spec) return;
      if (activityProp === key) { restoreRoomActivity(); showRoomSay('원래 자리와 자세로 돌아왔어요.'); return; }
      /* 다른 소품으로 넘어가기 전에 지난 활동의 표시를 먼저 닦아 둡니다. */
      if (studio) {
        studio.querySelectorAll('.droom__prop.is-playing').forEach(function (node) { node.classList.remove('is-playing'); });
        studio.removeAttribute('data-char-activity');
        studio.removeAttribute('data-char-fx');
      }
      /* 자세 없이 소리·말만 있는 소품(캔들) */
      if (!spec.pose) {
        paintRoomCharacter();
        if (spec.sound) playSound(spec.sound);
        if (spec.say) showRoomSay(spec.say);
        return;
      }
      if (!roomChar) return;
      if (!attic.avatar) { showRoomSay('방에 세울 캐릭터를 먼저 골라 주세요.'); return; }

      activityProp = key;
      activityPoseOverride = spec.pose;
      /* paintRoomCharacter 가 자세(data-char-pose)와 좌석 호흡(data-char-seat)을 함께 맞춥니다. */
      paintRoomCharacter();
      studio.setAttribute('data-char-activity', key);
      studio.setAttribute('data-char-fx', spec.fx || '');
      if (spec.playing) {
        var activeProp = studio.querySelector('[data-prop="' + key + '"]');
        if (activeProp) activeProp.classList.add('is-playing');
      }
      if (spec.sound) playSound(spec.sound);
      showRoomSay(spec.say);
    }
    function ensureAudio() {
      if (audioContext) return audioContext;
      var C=window.AudioContext||window.webkitAudioContext; if(!C)return null;
      audioContext=new C(); audioMaster=audioContext.createGain(); audioMaster.gain.value=.35; audioMaster.connect(audioContext.destination); return audioContext;
    }
    function playSound(type) {
      var ctx=ensureAudio(); if(!ctx)return; if(ctx.state==='suspended')ctx.resume();
      var now=ctx.currentTime;
      if(type==='bowl') [432,648,864].forEach(function(freq,i){
        var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;
        g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.075/(i+1),now+.04);g.gain.exponentialRampToValueAtTime(.0001,now+4.8+i*.3);
        o.connect(g);g.connect(audioMaster);o.start(now);o.stop(now+5.2+i*.3);
      });
      else if(type==='typing') for(var i=0;i<6;i++){
        var ot=ctx.createOscillator(),gt=ctx.createGain(),at=now+i*.075;ot.type='triangle';ot.frequency.value=680+(i%3)*130;
        gt.gain.setValueAtTime(.0001,at);gt.gain.exponentialRampToValueAtTime(.035,at+.004);gt.gain.exponentialRampToValueAtTime(.0001,at+.04);
        ot.connect(gt);gt.connect(audioMaster);ot.start(at);ot.stop(at+.045);
      } else if(type==='candle') {
        /* 촛불은 긴 백색소음 대신 짧고 불규칙한 장작 심지의 타닥임으로 만듭니다. */
        for(var i=0;i<9;i++){
          var at=now+Math.random()*1.45;
          var duration=.018+Math.random()*.045;
          var len=Math.max(1,Math.floor(ctx.sampleRate*duration));
          var buf=ctx.createBuffer(1,len,ctx.sampleRate),data=buf.getChannelData(0);
          for(var n=0;n<len;n++){
            var fade=1-(n/len);
            data[n]=(Math.random()*2-1)*fade;
          }
          var src=ctx.createBufferSource(),high=ctx.createBiquadFilter(),low=ctx.createBiquadFilter(),gn=ctx.createGain();
          src.buffer=buf;high.type='highpass';high.frequency.value=850+Math.random()*700;
          low.type='lowpass';low.frequency.value=3200+Math.random()*1500;
          var peak=.012+Math.random()*.022;
          gn.gain.setValueAtTime(.0001,at);
          gn.gain.linearRampToValueAtTime(peak,at+.004);
          gn.gain.exponentialRampToValueAtTime(.0001,at+duration);
          src.connect(high);high.connect(low);low.connect(gn);gn.connect(audioMaster);
          src.start(at);src.stop(at+duration+.005);
        }
      } else {
        var len=Math.floor(ctx.sampleRate*.65),buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
        for(var n=0;n<len;n++)d[n]=(Math.random()*2-1)*.17;
        var src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gn=ctx.createGain();src.buffer=buf;filter.type='lowpass';filter.frequency.value=1350;
        gn.gain.setValueAtTime(.0001,now);gn.gain.linearRampToValueAtTime(.04,now+.07);gn.gain.linearRampToValueAtTime(.0001,now+.65);
        src.connect(filter);filter.connect(gn);gn.connect(audioMaster);src.start(now);src.stop(now+.66);
      }
    }
    function stopAmbientAudio(){if(audioTimer)window.clearInterval(audioTimer);audioTimer=null;}
    function startAmbientAudio(){
      stopAmbientAudio();if(!audioEnabled)return;var sel=document.querySelector('[data-sound-type]'),type=sel?sel.value:'bowl';playSound(type);
      audioTimer=window.setInterval(function(){if(audioEnabled)playSound(type);},type==='bowl'?6500:type==='typing'?950:1900);
    }
    function setupRoomAudio(){
      var toggle=document.querySelector('[data-sound-toggle]'),sel=document.querySelector('[data-sound-type]'),vol=document.querySelector('[data-sound-volume]'),bowl=document.querySelector('[data-sound-bowl]');
      if(toggle)toggle.addEventListener('click',function(){audioEnabled=!audioEnabled;toggle.setAttribute('aria-pressed',String(audioEnabled));toggle.textContent=audioEnabled?'♪ 소리 끄기':'♪ 소리 켜기';if(audioEnabled)startAmbientAudio();else stopAmbientAudio();});
      if(sel)sel.addEventListener('change',function(){if(audioEnabled)startAmbientAudio();else playSound(sel.value);});
      if(vol)vol.addEventListener('input',function(){var c=ensureAudio();if(c)audioMaster.gain.value=Number(vol.value)/100;});
      if(bowl)bowl.addEventListener('click',function(){playSound('bowl');});
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
        (profile.fields || []).join(','), props.avatar || '', props.gender || '',
        props.pose || 'stand'].join('|');
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

    function setupTools(owner, me, editable) {
      if (editBtn) editBtn.hidden = !owner;
      if (logoutBtn) logoutBtn.hidden = !owner;
      if (studio) studio.classList.toggle('droom--moveable', editable);
      if (visitOwn) visitOwn.hidden = owner || !me;
      if (visitJoin) visitJoin.hidden = editable || !!me;
      if (editor) editor.hidden = !editable;
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

    /* -------------------------------------------------- 이웃 다락방 */
    /* 카드 한 장 — 아바타(성별·캐릭터 반영) · 필명 · 한 줄 소개 · 분야 · 벽지 배지.
       캐릭터의 사람 이름은 쓰지 않고, 고른 사진 또는 필명 첫 글자만 보여 줍니다. */
    function neighborCardHTML(profile, me, current) {
      var theme = THEME_LABEL[profile.attic_theme] ? profile.attic_theme : 'rose';
      var entry = avatarEntry((profile.attic_props || {}).avatar);
      var fields = (profile.fields || []).slice(0, 2);
      var bio = String(profile.bio || '').trim();
      if (!bio) bio = fields.length ? fields.join(' · ') + ' 창작자' : '아직 소개가 없어요.';

      var flag = '';
      if (current) flag = '<span class="neighbor-card__flag">지금 보는 다락방</span>';
      else if (me && profile.id === me.id) flag = '<span class="neighbor-card__flag neighbor-card__flag--mine">내 다락방</span>';

      return '<a class="neighbor-card attic-theme--' + theme + '" ' +
        'href="darakbang.html?pen=' + encodeURIComponent(profile.pen_name) + '">' +
        '<span class="neighbor-card__avatar' + (entry ? ' has-photo' : '') + '" aria-hidden="true">' +
          (entry ? avatarImgHTML(entry.photo, 'avatar-img') : esc(initial(profile.pen_name))) +
        '</span>' +
        '<span class="neighbor-card__main">' +
          '<span class="neighbor-card__top"><b class="neighbor-card__pen">' + esc(profile.pen_name) + '</b>' + flag + '</span>' +
          '<span class="neighbor-card__bio">' + esc(bio) + '</span>' +
          '<span class="neighbor-card__meta">' +
            '<span class="neighbor-card__theme">' + esc(THEME_LABEL[theme]) + '</span>' +
            fields.map(function (field) {
              return '<span class="neighbor-card__field" data-field="' + esc(field) + '">' + esc(field) + '</span>';
            }).join('') +
          '</span>' +
        '</span></a>';
    }

    async function renderNeighbors() {
      if (!neighborGrid) return;
      var me = Store.profile();
      var list = [];
      try { list = await Store.listNeighbors(); } catch (err) { list = []; }

      neighborMap = {};
      list.forEach(function (person) {
        neighborMap[String(person.pen_name || '').trim().toLowerCase()] = person;
      });

      if (neighborCount) {
        neighborCount.hidden = list.length === 0;
        neighborCount.textContent = list.length ? '이웃 ' + nf(list.length) + '곳' : '';
      }

      /* 지금 보고 있는 다락방을 맨 앞에 두고, 나머지는 새로 문을 연 순서입니다. */
      var current = null;
      var rest = [];
      list.forEach(function (person) {
        if (target && person.id === target.id) current = person;
        else rest.push(person);
      });
      var ordered = current ? [current].concat(rest) : rest;
      var shown = ordered.slice(0, NEIGHBOR_LIMIT);

      neighborGrid.hidden = shown.length === 0;
      neighborGrid.innerHTML = shown.map(function (person) {
        return neighborCardHTML(person, me, !!(target && person.id === target.id));
      }).join('');

      if (neighborEmpty) neighborEmpty.classList.toggle('is-visible', list.length === 0);
      if (neighborMore) {
        neighborMore.hidden = list.length <= NEIGHBOR_LIMIT;
        neighborMore.textContent = '이웃 ' + nf(list.length) + '곳 가운데 ' + NEIGHBOR_LIMIT +
          '곳을 먼저 보여 드려요. 더 찾아보려면 갤러리를 둘러보세요.';
      }
    }

    /* -------------------------------------------------- 다락방 방명록 */
    function guestbookEntryHTML(entry) {
      var me = Store.profile();
      var author = neighborMap[String(entry.author_pen || '').trim().toLowerCase()];
      var entryAvatar = author ? avatarEntry((author.attic_props || {}).avatar) : null;
      var canDelete = !!(me && target && (me.id === entry.author_id || me.id === target.id));
      var isHost = !!(target && entry.author_id && entry.author_id === target.id);

      return '<li class="dgb-item" data-guestbook-id="' + esc(entry.id) + '">' +
        '<span class="dgb-item__avatar' + (entryAvatar ? ' has-photo' : '') + '" aria-hidden="true">' +
          (entryAvatar ? avatarImgHTML(entryAvatar.photo, 'avatar-img') : esc(initial(entry.author_pen))) +
        '</span>' +
        '<div class="dgb-item__main">' +
          '<div class="dgb-item__head">' +
            '<span class="dgb-item__name">' + esc(entry.author_pen) + '</span>' +
            (isHost ? '<span class="dgb-item__host">다락방 주인</span>' : '') +
            '<span class="comment__time">' + timeAgo(entry.created_at) + '</span>' +
            (canDelete ? '<button class="comment__del" type="button" data-guestbook-del="' + esc(entry.id) + '">지우기</button>' : '') +
          '</div>' +
          '<p class="dgb-item__body">' + esc(entry.body) + '</p>' +
        '</div></li>';
    }

    async function renderGuestbook() {
      if (!guestbookList || !target) return;
      var me = Store.profile();
      var entries = [];
      if (!draftMode) {
        try { entries = await Store.listGuestbook(target.id); } catch (err) { entries = []; }
      }
      var missing = !!(Store.guestbookStatus && Store.guestbookStatus() === 'missing');

      if (guestbookTitle) {
        guestbookTitle.textContent = (isOwner || draftMode) ? '다락방 방명록' : target.pen_name + '님의 다락방 방명록';
      }
      if (guestbookDesc) {
        guestbookDesc.textContent = (isOwner || draftMode)
          ? '찾아온 사람들이 남긴 인사가 여기에 쌓입니다. 내 방에도 한 줄 남겨 볼 수 있어요.'
          : target.pen_name + '님의 다락방에 짧은 인사를 남겨 보세요. 남긴 사람과 다락방 주인은 그 인사를 지울 수 있어요.';
      }
      if (guestbookCount) {
        guestbookCount.hidden = missing || entries.length === 0;
        guestbookCount.textContent = entries.length ? nf(entries.length) + '줄' : '';
      }

      if (guestbookSetup) guestbookSetup.hidden = !missing;
      if (guestbookForm) guestbookForm.hidden = missing || !me;
      if (guestbookGate) guestbookGate.hidden = missing || !!me;

      guestbookHintBase = (isOwner || draftMode)
        ? '찾아온 사람이 남긴 인사를 여기서 볼 수 있어요. 내 방에도 한 줄 남겨 볼 수 있어요.'
        : '짧은 인사 한 줄이면 충분해요.';
      if (guestbookHint) {
        guestbookHint.textContent = guestbookBody && guestbookBody.value.trim()
          ? guestbookBody.value.trim().length + '/200자'
          : guestbookHintBase;
      }

      guestbookList.hidden = missing;
      guestbookList.innerHTML = missing ? '' : entries.map(guestbookEntryHTML).join('');

      if (guestbookEmpty) guestbookEmpty.classList.toggle('is-visible', !missing && entries.length === 0);
      if (guestbookEmptyText) {
        guestbookEmptyText.innerHTML = (isOwner || draftMode)
          ? '<b>아직 방명록이 비어 있어요.</b><br>찾아온 사람이 한 줄 남기면 여기에 쌓여요.'
          : '<b>아직 방명록이 비어 있어요.</b><br>첫 한 줄을 남겨 보세요.';
      }
    }

    async function render() {
      var me = Store.profile();
      target = null;
      draftMode = !penParam && !me;

      if (penParam && !(me && samePen(me.pen_name, penParam))) {
        target = await Store.profileByPen(penParam);
      } else {
        target = me;
      }
      if (draftMode) {
        target = { id: '__darak_preview__', pen_name: '나의 다락방', bio: '', fields: [],
          attic_theme: 'rose', attic_note: '', attic_props: {}, created_at: new Date().toISOString() };
      }
      isOwner = !!(me && target && target.id === me.id);
      canCustomize = draftMode || isOwner;
      setupTools(isOwner, me, canCustomize);
      if (draftMode) {
        darakSaveRequest = function () {
          pendingDarakDraft = {
            attic_theme: currentTheme,
            attic_props: { mood: attic.mood, props: attic.props.slice(), view: attic.view,
              pose: attic.pose, avatar: attic.avatar, gender: attic.gender, pos: Object.assign({}, attic.pos),
              locked: attic.locked === true }
          };
          openAuth('signup');
        };
      } else {
        darakSaveRequest = null;
      }

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

      updateHead(target, isOwner || draftMode);
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
        if (!draftMode) chips.push('<span class="tag">' + dateLabel(target.created_at) + '부터</span>');
        tags.innerHTML = chips.join('');
      }

      var works = draftMode ? [] : await Store.listArtworks({ userId: target.id });
      var received = draftMode ? [] : await Store.commentsForAuthor(target.id);

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

      /* 이웃 다락방 · 방명록 (주인·방문자 모두) */
      await renderNeighbors();
      await renderGuestbook();

      /* 친구 다락방 — 내 방이면 친구 목록, 남의 방이면 친구 신청 버튼 */
      if (window.DarakFriendsUI && typeof window.DarakFriendsUI.render === 'function') {
        try {
          window.DarakFriendsUI.render({ target: target, me: me, isOwner: isOwner, draftMode: draftMode });
        } catch (err) {
          console.warn('[아트다락방] 친구 칸을 그리지 못했어요.', err);
        }
      }

      lastSignature = profileSignature(target);
    }

    /* -------------------------------------------------- 이벤트 */
    setupStudioEditor();
    setupRoomCharacter();
    setupPropDrag();
    setupRoomAudio();
    ensureProfileModal();

    /* 방명록 — 짧은 인사 남기기 */
    if (guestbookBody) {
      guestbookBody.addEventListener('input', function () {
        var length = guestbookBody.value.trim().length;
        if (guestbookHint) guestbookHint.textContent = length ? length + '/200자' : guestbookHintBase;
      });
    }

    if (guestbookForm) {
      guestbookForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (guestbookBusy || !target) return;
        var text = guestbookBody ? guestbookBody.value.trim() : '';
        if (!text) {
          toast('한 줄 적어 주시면 남길 수 있어요.');
          if (guestbookBody) guestbookBody.focus();
          return;
        }
        if (text.length > 200) {
          toast('방명록은 200자까지 남길 수 있어요.');
          return;
        }

        guestbookBusy = true;
        if (guestbookSubmit) {
          guestbookSubmit.disabled = true;
          guestbookSubmit.textContent = '남기는 중…';
        }
        try {
          await Store.addGuestbook(target.id, text);
          if (guestbookBody) guestbookBody.value = '';
          await renderGuestbook();
          toast(isOwner ? '내 방명록에 한 줄 남겼어요.' : target.pen_name + '님의 방명록에 인사를 남겼어요.');
        } catch (err) {
          toast((err && err.message) || '방명록을 남기지 못했어요.');
          if (Store.guestbookStatus && Store.guestbookStatus() === 'missing') await renderGuestbook();
        } finally {
          guestbookBusy = false;
          if (guestbookSubmit) {
            guestbookSubmit.disabled = false;
            guestbookSubmit.textContent = '한 줄 남기기';
          }
        }
      });
    }

    if (guestbookList) {
      guestbookList.addEventListener('click', async function (event) {
        var button = event.target.closest ? event.target.closest('[data-guestbook-del]') : null;
        if (!button || guestbookBusy) return;
        var id = button.getAttribute('data-guestbook-del');
        if (!id) return;
        if (!window.confirm('이 방명록 인사를 지울까요?')) return;

        guestbookBusy = true;
        button.disabled = true;
        try {
          await Store.deleteGuestbook(id);
          await renderGuestbook();
          toast('방명록 인사를 지웠어요.');
        } catch (err) {
          toast((err && err.message) || '방명록을 지우지 못했어요.');
          button.disabled = false;
        } finally {
          guestbookBusy = false;
        }
      });
    }

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
            view: currentAttic.view || 'auto',
            pose: currentAttic.pose || 'stand',
            avatar: profileAvatar ? profileAvatar.get() : '',
            gender: profileGender ? profileGender.get() : '',
            pos: currentAttic.pos || {},
            locked: currentAttic.locked === true
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
