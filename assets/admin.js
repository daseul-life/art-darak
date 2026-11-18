/* ============================================================
   아트다락방 — 관리자 화면
   ------------------------------------------------------------
   · 체험 모드(DB 미연결): 체험용 비밀번호 artdarak 또는 '미리 보기'
   · DB 연결 모드: profiles.is_admin = true 인 필명만 들어올 수 있습니다.
     (실제 쓰기 권한은 Supabase RLS 정책이 함께 막아 줍니다)
   ============================================================ */
(function () {
  'use strict';

  var Store = window.DarakStore;
  var DEMO_PASSWORD = 'artdarak';

  var FIELD_EMOJI = {
    문학: '📖', 미술: '🎨', 음악: '🎵', 사진: '📷', 공예: '🧶', 디자인: '🖌️'
  };

  var state = {
    works: [],
    comments: [],
    members: [],
    notices: [],
    workFilter: 'all'
  };

  /* -------------------------------------------------- 도우미 */
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function nf(value) { return Number(value || 0).toLocaleString('ko-KR'); }

  function initial(text) {
    var name = String(text || '').trim();
    return name ? name.slice(0, 1) : '✦';
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
    if (diff < 60000) return '방금';
    if (diff < 3600000) return Math.floor(diff / 60000) + '분 전';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '시간 전';
    if (diff < 7 * 86400000) return Math.floor(diff / 86400000) + '일 전';
    return dateLabel(iso);
  }

  function toast(message) {
    var el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('is-visible');
    window.clearTimeout(toast._timer);
    toast._timer = window.setTimeout(function () { el.classList.remove('is-visible'); }, 3400);
  }

  /* -------------------------------------------------- 들어가기 */
  function setupGate() {
    var localGate = document.getElementById('gate-local');
    var cloudGate = document.getElementById('gate-cloud');

    if (Store.mode === 'cloud') {
      cloudGate.hidden = false;
      localGate.hidden = true;
      var me = Store.profile();
      if (me && me.is_admin) enter();
      return;
    }

    localGate.hidden = false;
    cloudGate.hidden = true;
    if (Store.isAdmin()) enter();
  }

  function enter() {
    document.getElementById('admin-gate').hidden = true;
    document.getElementById('admin-shell').hidden = false;
    var label = document.getElementById('admin-mode-label');
    if (label) {
      label.textContent = Store.mode === 'cloud'
        ? 'Supabase에 연결된 실제 데이터를 관리하고 있어요.'
        : '체험 모드 · 이 브라우저에 저장된 내용을 관리하고 있어요.';
    }
    loadAll();
  }

  function leave() {
    if (Store.mode === 'local') Store.setDemoAdmin(false);
    window.location.reload();
  }

  function gateError(message) {
    var el = Store.mode === 'cloud'
      ? document.getElementById('admin-gate-error-cloud')
      : document.getElementById('admin-gate-error');
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
  }

  /* -------------------------------------------------- 데이터 */
  async function loadAll() {
    state.works = await Store.listArtworks({ includeHidden: true });
    state.comments = await Store.listAllComments();
    state.members = await Store.listProfiles();
    state.notices = await Store.listNotices(true);
    renderStats();
    renderNotices();
    renderWorks();
    renderComments();
    renderMembers();
  }

  function renderStats() {
    var featured = state.works.filter(function (w) { return w.is_featured; }).length;
    var hidden = state.works.filter(function (w) { return w.is_hidden; }).length;
    var activeNotices = state.notices.filter(function (n) { return n.is_active; }).length;

    var items = [
      ['작품', state.works.length],
      ['추천', featured],
      ['숨김', hidden],
      ['감상', state.comments.length],
      ['회원', state.members.length],
      ['공개 공지', activeNotices]
    ];

    document.getElementById('admin-stats').innerHTML = items.map(function (item) {
      return '<div class="admin-stat"><b>' + nf(item[1]) + '</b><span>' + item[0] + '</span></div>';
    }).join('');
  }

  /* -------------------------------------------------- 공지 */
  function renderNotices() {
    var host = document.getElementById('notice-list');
    var count = document.getElementById('notice-count');
    if (count) count.textContent = state.notices.length;

    if (!state.notices.length) {
      host.innerHTML = '<p class="admin-empty">아직 쓴 공지가 없어요. 위에서 첫 공지를 써 보세요.</p>';
      return;
    }

    host.innerHTML = state.notices.map(function (notice) {
      return '<div class="admin-row" data-notice-row="' + esc(notice.id) + '">' +
        '<div class="admin-row__thumb" aria-hidden="true">' + (notice.is_active ? '📌' : '🗂️') + '</div>' +
        '<div>' +
        '<p class="admin-row__title">' + esc(notice.title) +
        (notice.is_active ? ' <span class="admin-badge admin-badge--feature">공개 중</span>' : ' <span class="admin-badge">숨김</span>') +
        '</p>' +
        (notice.body ? '<p class="admin-row__body">' + esc(notice.body) + '</p>' : '') +
        '<p class="admin-row__meta">' + dateLabel(notice.created_at) + ' 작성</p>' +
        '</div>' +
        '<div class="admin-actions">' +
        '<button class="btn btn--ghost btn--tiny" type="button" data-edit-notice="' + esc(notice.id) + '">수정</button>' +
        '<button class="btn btn--ghost btn--tiny btn--danger" type="button" data-del-notice="' + esc(notice.id) + '">지우기</button>' +
        '</div></div>';
    }).join('');
  }

  function noticeForm() { return document.getElementById('notice-form'); }

  function fillNoticeForm(notice) {
    var form = noticeForm();
    form.querySelector('[name="id"]').value = notice ? notice.id : '';
    form.querySelector('[name="title"]').value = notice ? notice.title : '';
    form.querySelector('[name="body"]').value = notice ? notice.body : '';
    form.querySelector('[name="is_active"]').checked = notice ? notice.is_active : true;
    var error = document.getElementById('notice-error');
    error.hidden = true;
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    form.querySelector('[name="title"]').focus();
  }

  async function submitNotice(event) {
    event.preventDefault();
    var form = noticeForm();
    var error = document.getElementById('notice-error');
    error.hidden = true;

    var data = new FormData(form);
    try {
      await Store.saveNotice({
        id: String(data.get('id') || '') || null,
        title: String(data.get('title') || '').trim(),
        body: String(data.get('body') || '').trim(),
        is_active: data.get('is_active') === 'on'
      });
      toast('공지를 저장했어요.');
      fillNoticeForm(null);
      state.notices = await Store.listNotices(true);
      renderStats();
      renderNotices();
    } catch (err) {
      error.textContent = err.message;
      error.hidden = false;
    }
  }

  /* -------------------------------------------------- 작품 */
  function renderWorks() {
    var host = document.getElementById('work-list');
    var list = state.works.filter(function (work) {
      if (state.workFilter === 'featured') return work.is_featured;
      if (state.workFilter === 'hidden') return work.is_hidden;
      if (state.workFilter === 'sample') return work.is_sample;
      return true;
    });

    if (!list.length) {
      host.innerHTML = '<p class="admin-empty">조건에 맞는 작품이 없어요.</p>';
      return;
    }

    host.innerHTML = list.map(function (work) {
      var thumb = work.image_url
        ? '<img src="' + esc(work.image_url) + '" alt="">'
        : esc(work.emoji || FIELD_EMOJI[work.field] || '✦');

      return '<div class="admin-row" data-work-row="' + esc(work.id) + '">' +
        '<div class="admin-row__thumb" data-field="' + esc(work.field) + '">' + thumb + '</div>' +
        '<div>' +
        '<p class="admin-row__title"><a href="work.html?id=' + encodeURIComponent(work.id) + '" target="_blank" rel="noopener">' +
        esc(work.title) + '</a> ' +
        (work.is_featured ? '<span class="admin-badge admin-badge--feature">추천</span> ' : '') +
        (work.is_hidden ? '<span class="admin-badge admin-badge--hidden">숨김</span> ' : '') +
        (work.is_sample ? '<span class="admin-badge">예시</span>' : '') +
        '</p>' +
        '<p class="admin-row__meta">' + esc(work.pen_name) + ' · ' + esc(work.field) + ' · ' + esc(work.status) +
        ' · ' + dateLabel(work.created_at) + ' · 마음 ' + nf(work.like_count) + ' · 감상 ' + nf(work.comment_count) + '</p>' +
        '</div>' +
        '<div class="admin-actions">' +
        '<button class="btn btn--ghost btn--tiny" type="button" data-toggle-feature="' + esc(work.id) + '">' +
        (work.is_featured ? '추천 해제' : '오늘의 작품') + '</button>' +
        '<button class="btn btn--ghost btn--tiny" type="button" data-toggle-hidden="' + esc(work.id) + '">' +
        (work.is_hidden ? '다시 보이기' : '숨기기') + '</button>' +
        '<button class="btn btn--ghost btn--tiny btn--danger" type="button" data-del-work="' + esc(work.id) + '">지우기</button>' +
        '</div></div>';
    }).join('');
  }

  async function toggleFeatured(work) {
    try {
      await Store.setArtworkFlags(work.id, { is_featured: !work.is_featured });
      toast(work.is_featured ? '추천에서 내렸어요.' : '오늘의 작품으로 올렸어요.');
      await refreshWorks();
    } catch (err) { toast(err.message); }
  }

  async function toggleHidden(work) {
    try {
      await Store.setArtworkFlags(work.id, { is_hidden: !work.is_hidden });
      toast(work.is_hidden ? '다시 보이게 했어요.' : '갤러리에서 숨겼어요.');
      await refreshWorks();
    } catch (err) { toast(err.message); }
  }

  async function removeWork(work) {
    if (!window.confirm('「' + work.title + '」 작품을 지울까요? 남겨진 감상도 함께 사라집니다.')) return;
    try {
      await Store.adminDeleteArtwork(work.id);
      toast('작품을 지웠어요.');
      await loadAll();
    } catch (err) { toast(err.message); }
  }

  async function refreshWorks() {
    state.works = await Store.listArtworks({ includeHidden: true });
    renderStats();
    renderWorks();
  }

  /* -------------------------------------------------- 감상 */
  function renderComments() {
    var host = document.getElementById('comment-list');
    if (!state.comments.length) {
      host.innerHTML = '<p class="admin-empty">아직 남겨진 감상이 없어요.</p>';
      return;
    }

    host.innerHTML = state.comments.map(function (comment) {
      return '<div class="admin-row" data-comment-row="' + esc(comment.id) + '">' +
        '<div class="admin-row__thumb" aria-hidden="true">' + esc(initial(comment.pen_name)) + '</div>' +
        '<div>' +
        '<p class="admin-row__title">' + esc(comment.pen_name) +
        ' <span class="admin-row__meta">' + timeAgo(comment.created_at) + '</span></p>' +
        '<p class="admin-row__body">' + esc(comment.body) + '</p>' +
        '<p class="admin-row__meta">「' + esc(comment.artwork_title) + '」 · ' + esc(comment.artwork_field || '') + '</p>' +
        '</div>' +
        '<div class="admin-actions">' +
        '<button class="btn btn--ghost btn--tiny btn--danger" type="button" data-del-comment="' + esc(comment.id) + '">지우기</button>' +
        '</div></div>';
    }).join('');
  }

  async function removeComment(comment) {
    if (!window.confirm(comment.pen_name + ' 님의 감상을 지울까요?')) return;
    try {
      await Store.adminDeleteComment(comment.id);
      toast('감상을 지웠어요.');
      await loadAll();
    } catch (err) { toast(err.message); }
  }

  /* -------------------------------------------------- 회원 */
  function renderMembers() {
    var host = document.getElementById('member-list');

    if (!state.members.length) {
      host.innerHTML = '<p class="admin-empty">아직 가입한 필명이 없어요.</p>';
      return;
    }

    var workCount = {};
    state.works.forEach(function (work) {
      if (work.user_id) workCount[work.user_id] = (workCount[work.user_id] || 0) + 1;
    });
    var commentCount = {};
    state.comments.forEach(function (comment) {
      if (comment.user_id) commentCount[comment.user_id] = (commentCount[comment.user_id] || 0) + 1;
    });

    host.innerHTML = state.members.map(function (member) {
      return '<div class="admin-row" data-member-row="' + esc(member.id) + '">' +
        '<div class="admin-row__thumb" aria-hidden="true">' + esc(initial(member.pen_name)) + '</div>' +
        '<div>' +
        '<p class="admin-row__title">' + esc(member.pen_name) + ' ' +
        (member.is_admin ? '<span class="admin-badge admin-badge--admin">관리자</span> ' : '') +
        (member.is_blocked ? '<span class="admin-badge admin-badge--blocked">잠김</span>' : '') +
        '</p>' +
        '<p class="admin-row__meta">' + dateLabel(member.created_at) + '부터 · 작품 ' + nf(workCount[member.id]) +
        ' · 감상 ' + nf(commentCount[member.id]) + '</p>' +
        (member.bio ? '<p class="admin-row__body">' + esc(member.bio) + '</p>' : '') +
        '</div>' +
        '<div class="admin-actions">' +
        '<button class="btn btn--ghost btn--tiny" type="button" data-toggle-block="' + esc(member.id) + '">' +
        (member.is_blocked ? '잠금 풀기' : '다락방 잠그기') + '</button>' +
        '<button class="btn btn--ghost btn--tiny" type="button" data-toggle-admin="' + esc(member.id) + '">' +
        (member.is_admin ? '관리자 해제' : '관리자 지정') + '</button>' +
        '</div></div>';
    }).join('');
  }

  /* -------------------------------------------------- 이벤트 */
  function findWork(id) {
    return state.works.filter(function (w) { return w.id === id; })[0];
  }

  function bind() {
    /* 탭 */
    document.querySelectorAll('.admin-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var name = tab.getAttribute('data-tab');
        document.querySelectorAll('.admin-tab').forEach(function (other) {
          var on = other === tab;
          other.classList.toggle('is-active', on);
          other.setAttribute('aria-selected', String(on));
        });
        document.querySelectorAll('.admin-panel').forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-panel') !== name;
        });
      });
    });

    /* 공지 */
    document.getElementById('notice-form').addEventListener('submit', submitNotice);
    document.getElementById('notice-reset').addEventListener('click', function () { fillNoticeForm(null); });
    document.getElementById('notice-list').addEventListener('click', async function (event) {
      var edit = event.target.closest('[data-edit-notice]');
      if (edit) {
        var notice = state.notices.filter(function (n) { return n.id === edit.getAttribute('data-edit-notice'); })[0];
        if (notice) fillNoticeForm(notice);
        return;
      }
      var del = event.target.closest('[data-del-notice]');
      if (del) {
        if (!window.confirm('이 공지를 지울까요?')) return;
        try {
          await Store.deleteNotice(del.getAttribute('data-del-notice'));
          toast('공지를 지웠어요.');
          state.notices = await Store.listNotices(true);
          renderStats();
          renderNotices();
        } catch (err) { toast(err.message); }
      }
    });

    /* 작품 */
    document.getElementById('work-filters').addEventListener('click', function (event) {
      var chip = event.target.closest('[data-wfilter]');
      if (!chip) return;
      state.workFilter = chip.getAttribute('data-wfilter');
      document.querySelectorAll('[data-wfilter]').forEach(function (other) {
        var on = other === chip;
        other.classList.toggle('is-active', on);
        other.setAttribute('aria-pressed', String(on));
      });
      renderWorks();
    });

    document.getElementById('work-list').addEventListener('click', function (event) {
      var feature = event.target.closest('[data-toggle-feature]');
      if (feature) {
        var work = findWork(feature.getAttribute('data-toggle-feature'));
        if (work) toggleFeatured(work);
        return;
      }
      var hide = event.target.closest('[data-toggle-hidden]');
      if (hide) {
        var work2 = findWork(hide.getAttribute('data-toggle-hidden'));
        if (work2) toggleHidden(work2);
        return;
      }
      var del = event.target.closest('[data-del-work]');
      if (del) {
        var work3 = findWork(del.getAttribute('data-del-work'));
        if (work3) removeWork(work3);
      }
    });

    /* 감상 */
    document.getElementById('comment-list').addEventListener('click', function (event) {
      var del = event.target.closest('[data-del-comment]');
      if (!del) return;
      var comment = state.comments.filter(function (c) { return c.id === del.getAttribute('data-del-comment'); })[0];
      if (comment) removeComment(comment);
    });

    /* 회원 */
    document.getElementById('member-list').addEventListener('click', async function (event) {
      var block = event.target.closest('[data-toggle-block]');
      if (block) {
        var member = state.members.filter(function (m) { return m.id === block.getAttribute('data-toggle-block'); })[0];
        if (!member) return;
        var next = !member.is_blocked;
        if (next && !window.confirm(member.pen_name + ' 님의 다락방을 잠글까요? 작품과 감상이 다른 사람에게 보이지 않게 됩니다.')) return;
        try {
          await Store.setProfileFlags(member.id, { is_blocked: next });
          toast(next ? '다락방을 잠갔어요.' : '잠금을 풀었어요.');
          await loadAll();
        } catch (err) { toast(err.message); }
        return;
      }
      var admin = event.target.closest('[data-toggle-admin]');
      if (admin) {
        var person = state.members.filter(function (m) { return m.id === admin.getAttribute('data-toggle-admin'); })[0];
        if (!person) return;
        try {
          await Store.setProfileFlags(person.id, { is_admin: !person.is_admin });
          toast(person.is_admin ? '관리자 권한을 내렸어요.' : '관리자로 지정했어요.');
          await loadAll();
        } catch (err) { toast(err.message); }
      }
    });

    /* 들어가기 · 나가기 */
    document.getElementById('admin-exit').addEventListener('click', leave);

    var enterButton = document.getElementById('admin-enter');
    if (enterButton) {
      enterButton.addEventListener('click', function () {
        var input = document.getElementById('admin-password');
        if (input.value.trim() !== DEMO_PASSWORD) {
          gateError('비밀번호가 맞지 않아요. 체험용 비밀번호는 artdarak 입니다.');
          return;
        }
        Store.setDemoAdmin(true);
        enter();
      });
    }

    var previewButton = document.getElementById('admin-preview');
    if (previewButton) {
      previewButton.addEventListener('click', function () {
        Store.setDemoAdmin(true);
        enter();
      });
    }

    var loginButton = document.getElementById('admin-login');
    if (loginButton) {
      loginButton.addEventListener('click', async function () {
        var pen = document.getElementById('admin-pen').value.trim();
        var pw = document.getElementById('admin-pw').value;
        loginButton.disabled = true;
        try {
          var profile = await Store.signIn(pen, pw);
          if (!profile || !profile.is_admin) {
            gateError('이 필명은 관리자 권한이 없어요. Supabase에서 profiles.is_admin 을 true 로 바꿔 주세요.');
            return;
          }
          enter();
        } catch (err) {
          gateError(err.message);
        } finally {
          loginButton.disabled = false;
        }
      });
    }
  }

  /* -------------------------------------------------- 시작 */
  async function boot() {
    await Store.init();
    setupGate();
    bind();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
