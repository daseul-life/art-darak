/* ============================================================
   아트다락방 — 창작 일지(journal.html) · 협업·피드백(cowork.html)
   ------------------------------------------------------------
   · 필명 가입·작품 등록 뒤에 이어지는 3~4단계 화면입니다.
   · Supabase 표(public.journals / cowork_posts / cowork_replies)가
     아직 만들어지지 않았거나 열 권한이 없으면, 화면을 멈추지 않고
     조용한 '준비 중' 안내만 보여 줍니다.
   · 디자인은 기존 로즈밀크 팔레트와 Gowun 글꼴, styles.css 토큰만 씁니다.
   ============================================================ */
(function () {
  'use strict';

  var Store = window.DarakStore;
  var FIELDS = ['문학', '미술', '음악', '사진', '공예', '디자인'];
  var KINDS = ['피드백 요청', '함께 작업'];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function toast(message) {
    var box = document.getElementById('toast');
    if (!box) return;
    box.textContent = message;
    box.classList.add('is-visible');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { box.classList.remove('is-visible'); }, 2600);
  }

  function day(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var now = new Date();
    var same = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    var hh = d.getHours(); var mm = d.getMinutes();
    var clock = (hh < 12 ? '오전 ' : '오후 ') + ((hh % 12) || 12) + ':' + (mm < 10 ? '0' + mm : mm);
    if (same) return clock;
    return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + clock;
  }

  function me() { return Store && Store.profile ? Store.profile() : null; }
  function db() { return Store && Store.client ? Store.client : null; }

  /* 표가 없거나(404) 권한이 없을 때(401/42501) — '준비 중' 안내로 넘깁니다. */
  function missing(err) {
    if (!err) return true;
    var code = String(err.code || '');
    var msg = String(err.message || '').toLowerCase();
    return code === 'PGRST205' || code === '42P01' || code === '42501' || code === '42703' || err.status === 404 ||
      msg.indexOf('could not find the table') !== -1 ||
      msg.indexOf('schema cache') !== -1 ||
      msg.indexOf('permission denied') !== -1 ||
      (msg.indexOf('relation') !== -1 && msg.indexOf('does not exist') !== -1);
  }

  /* Supabase 클라이언트가 열릴 때까지 잠깐 기다립니다 (앱 첫 연결). */
  function whenReady() {
    return new Promise(function (resolve) {
      var tries = 0;
      (function tick() {
        if (db() || (Store && Store.mode === 'local') || tries > 40) return resolve();
        tries += 1;
        setTimeout(tick, 150);
      })();
    });
  }

  /* 칩 하나만 켜기 (분야 고르기) */
  function pickChips(wrap) {
    if (!wrap) return { get: function () { return ''; } };
    var chips = $$('.chip', wrap);
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', String(on));
        });
      });
    });
    return {
      get: function () {
        var on = chips.filter(function (c) { return c.classList.contains('is-active'); })[0];
        return on ? on.getAttribute('data-pick-field') : '';
      },
      set: function (field) {
        chips.forEach(function (c) {
          var on = c.getAttribute('data-pick-field') === field;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', String(on));
        });
      }
    };
  }

  function showNotice(box, text) {
    if (!box) return;
    box.hidden = false;
    var t = $('[data-jsetup-text], [data-csetup-text]', box);
    if (t && text) t.textContent = text;
  }

  function hide(box) { if (box) box.hidden = true; }

  /* ============================================================
     1) 창작 일지
     ============================================================ */
  var Journal = {
    list: async function () {
      var c = db();
      if (!c) return { ok: false, missing: true };
      var res = await c.from('journals')
        .select('*, journal_cheers(count)')
        .order('created_at', { ascending: false })
        .limit(80);
      if (res.error) return { ok: false, missing: missing(res.error), error: res.error };

      var rows = res.data || [];
      var mine = me();
      var cheered = {};
      if (rows.length && mine) {
        var ids = rows.map(function (r) { return r.id; });
        var ch = await c.from('journal_cheers').select('journal_id').eq('user_id', mine.id).in('journal_id', ids);
        (ch.data || []).forEach(function (r) { cheered[r.journal_id] = 1; });
      }
      return {
        ok: true,
        rows: rows.map(function (r) {
          var count = r.journal_cheers && r.journal_cheers[0] ? r.journal_cheers[0].count : 0;
          return {
            id: r.id, user_id: r.user_id, pen_name: r.pen_name, body: r.body,
            field: r.field || '', is_public: r.is_public !== false,
            cheer_count: Number(count) || 0, cheered: !!cheered[r.id],
            created_at: r.created_at, updated_at: r.updated_at
          };
        })
      };
    },

    save: async function (payload) {
      var c = db(); var mine = me();
      if (!c || !mine) return { ok: false, message: '먼저 필명으로 시작해 주세요.' };
      var row = { pen_name: mine.pen_name, body: payload.body, field: payload.field || null, is_public: payload.is_public !== false };
      var res;
      if (payload.id) {
        res = await c.from('journals').update(row).eq('id', payload.id).eq('user_id', mine.id).select('id');
      } else {
        row.user_id = mine.id;
        res = await c.from('journals').insert(row).select('id');
      }
      if (res.error) return { ok: false, missing: missing(res.error), error: res.error };
      return { ok: true };
    },

    remove: async function (id) {
      var c = db(); var mine = me();
      if (!c || !mine) return { ok: false };
      var res = await c.from('journals').delete().eq('id', id).eq('user_id', mine.id);
      if (res.error) return { ok: false, missing: missing(res.error), error: res.error };
      return { ok: true };
    },

    cheer: async function (id, on) {
      var c = db(); var mine = me();
      if (!c || !mine) return { ok: false, needLogin: true };
      var res = on
        ? await c.from('journal_cheers').insert({ journal_id: id, user_id: mine.id })
        : await c.from('journal_cheers').delete().eq('journal_id', id).eq('user_id', mine.id);
      if (res.error && !(on && String(res.error.code) === '23505')) {
        return { ok: false, missing: missing(res.error), error: res.error };
      }
      return { ok: true };
    }
  };

  function journalCard(row) {
    var mine = me();
    var own = mine && row.user_id === mine.id;
    var field = row.field && FIELDS.indexOf(row.field) !== -1 ? row.field : '';
    return '' +
      '<article class="feed-card feed-card--journal" data-journal="' + esc(row.id) + '"' + (field ? ' data-field="' + esc(field) + '"' : '') + '>' +
        '<header class="feed-card__head">' +
          '<a class="feed-card__who" href="darakbang.html?pen=' + encodeURIComponent(row.pen_name || '') + '">' + esc(row.pen_name) + '</a>' +
          (field ? '<span class="feed-card__tag">' + esc(field) + '</span>' : '') +
          (row.is_public ? '' : '<span class="feed-card__tag feed-card__tag--quiet">나만 보기</span>') +
          '<time class="feed-card__time">' + esc(day(row.created_at)) + '</time>' +
        '</header>' +
        '<p class="feed-card__body">' + esc(row.body).replace(/\n/g, '<br>') + '</p>' +
        '<footer class="feed-card__foot">' +
          '<button class="cheer' + (row.cheered ? ' is-on' : '') + '" type="button" data-cheer="' + esc(row.id) + '" data-on="' + (row.cheered ? '1' : '0') + '" aria-pressed="' + String(!!row.cheered) + '">' +
            '<span aria-hidden="true">♡</span> 응원 <b data-cheer-count>' + (row.cheer_count || 0) + '</b>' +
          '</button>' +
          (own ? '<span class="feed-card__own">' +
            '<button class="btn btn--ghost btn--sm" type="button" data-jedit="' + esc(row.id) + '">고치기</button>' +
            '<button class="btn btn--ghost btn--sm" type="button" data-jdelete="' + esc(row.id) + '">지우기</button>' +
          '</span>' : '') +
        '</footer>' +
      '</article>';
  }

  async function initJournal() {
    var setup = $('[data-jsetup]');
    var gate = $('[data-jgate]');
    var form = $('#journal-form');
    var list = $('[data-jlist]');
    var empty = $('[data-jempty]');
    var countEl = $('[data-jcount]');
    if (!list) return;

    await whenReady();

    if (Store.mode !== 'cloud' || !db()) {
      showNotice(setup, '창작 일지는 Supabase를 연결하면 열려요. 지금은 체험 모드예요.');
      hide(gate); hide(form); hide(empty);
      return;
    }

    var picker = pickChips($('[data-jfield-picker]'));
    var body = form ? form.querySelector('[name="body"]') : null;
    var editing = null;
    var rows = [];

    function syncGate() {
      var mine = me();
      if (form) form.hidden = !mine;
      if (gate) gate.hidden = !!mine;
      var author = $('[data-jauthor]');
      if (author && mine) author.textContent = mine.pen_name;
    }

    function paint() {
      list.innerHTML = rows.map(journalCard).join('');
      if (countEl) countEl.textContent = String(rows.length);
      if (empty) empty.classList.toggle('is-visible', rows.length === 0);
      list.style.display = rows.length ? '' : 'none';
    }

    async function load() {
      var res = await Journal.list();
      if (!res.ok) {
        if (res.missing) showNotice(setup);
        else showNotice(setup, '일지를 불러오지 못했어요. 잠시 뒤 새로 고쳐 주세요.');
        list.innerHTML = '';
        if (countEl) countEl.textContent = '0';
        return;
      }
      hide(setup);
      rows = res.rows;
      paint();
    }

    function resetForm() {
      if (!form) return;
      editing = null;
      form.reset();
      picker.set('문학');
      if (body) body.value = '';
      var len = $('[data-jlen]');
      if (len) len.textContent = '0';
      var cancel = $('[data-jcancel]');
      if (cancel) cancel.hidden = true;
      var submit = $('[data-jsubmit]');
      if (submit) submit.textContent = '일지 남기기';
      var foot = $('[data-jfoot]');
      if (foot) foot.textContent = '짧아도 괜찮아요. 한 줄이면 충분합니다.';
      var err = $('[data-jerror]');
      if (err) { err.hidden = true; err.textContent = ''; }
    }

    syncGate();

    if (body) {
      body.addEventListener('input', function () {
        var len = $('[data-jlen]');
        if (len) len.textContent = String(body.value.length);
      });
    }

    if (form) {
      form.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (!me()) return;
        var err = $('[data-jerror]');
        var text = body ? body.value.trim() : '';
        if (!text) {
          if (err) { err.textContent = '오늘의 기록을 한 줄이라도 적어 주세요.'; err.hidden = false; }
          return;
        }
        var submit = $('[data-jsubmit]');
        if (submit) submit.disabled = true;
        var res = await Journal.save({
          id: editing, body: text, field: picker.get(),
          is_public: form.querySelector('[name="visibility"]:checked').value !== 'private'
        });
        if (submit) submit.disabled = false;
        if (!res.ok) {
          if (res.missing) showNotice(setup);
          if (err) { err.textContent = res.message || '일지를 남기지 못했어요. 잠시 뒤 다시 시도해 주세요.'; err.hidden = false; }
          return;
        }
        toast(editing ? '일지를 고쳤어요.' : '오늘의 일지를 남겼어요.');
        resetForm();
        await load();
      });
    }

    var cancel = $('[data-jcancel]');
    if (cancel) cancel.addEventListener('click', resetForm);

    list.addEventListener('click', async function (event) {
      var editBtn = event.target.closest('[data-jedit]');
      var delBtn = event.target.closest('[data-jdelete]');
      var cheerBtn = event.target.closest('[data-cheer]');

      if (cheerBtn) {
        if (!me()) { toast('필명으로 시작하면 응원을 보낼 수 있어요.'); return; }
        var on = cheerBtn.getAttribute('data-on') !== '1';
        cheerBtn.disabled = true;
        var res = await Journal.cheer(cheerBtn.getAttribute('data-cheer'), on);
        cheerBtn.disabled = false;
        if (!res.ok) { toast('응원을 보내지 못했어요. 잠시 뒤 다시 눌러 주세요.'); return; }
        cheerBtn.setAttribute('data-on', on ? '1' : '0');
        cheerBtn.setAttribute('aria-pressed', String(on));
        cheerBtn.classList.toggle('is-on', on);
        var cnt = cheerBtn.querySelector('[data-cheer-count]');
        if (cnt) cnt.textContent = String(Math.max(0, Number(cnt.textContent || 0) + (on ? 1 : -1)));
        return;
      }

      if (editBtn) {
        var id = editBtn.getAttribute('data-jedit');
        var row = rows.filter(function (r) { return r.id === id; })[0];
        if (!row || !form) return;
        editing = id;
        if (body) body.value = row.body;
        picker.set(row.field || '문학');
        var vis = form.querySelector('[name="visibility"][value="' + (row.is_public ? 'public' : 'private') + '"]');
        if (vis) vis.checked = true;
        var len = $('[data-jlen]');
        if (len) len.textContent = String(row.body.length);
        var submit2 = $('[data-jsubmit]');
        if (submit2) submit2.textContent = '고치기 저장';
        var cancelBtn = $('[data-jcancel]');
        if (cancelBtn) cancelBtn.hidden = false;
        var foot2 = $('[data-jfoot]');
        if (foot2) foot2.textContent = '고치는 중이에요. 저장하면 바로 반영됩니다.';
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (body) body.focus();
        return;
      }

      if (delBtn) {
        var delId = delBtn.getAttribute('data-jdelete');
        if (window.confirm('이 일지를 지울까요? 지운 글은 되돌릴 수 없어요.')) {
          var dres = await Journal.remove(delId);
          if (!dres.ok) { toast('지우지 못했어요. 잠시 뒤 다시 눌러 주세요.'); return; }
          toast('일지를 지웠어요.');
          if (editing === delId) resetForm();
          await load();
        }
      }
    });

    Store.onAuth(function () { syncGate(); load(); });
    await load();
  }

  /* ============================================================
     2) 협업 · 피드백
     ============================================================ */
  var Cowork = {
    list: async function () {
      var c = db();
      if (!c) return { ok: false, missing: true };
      var res = await c.from('cowork_posts')
        .select('*, cowork_replies(count)')
        .order('created_at', { ascending: false })
        .limit(60);
      if (res.error) return { ok: false, missing: missing(res.error), error: res.error };
      return {
        ok: true,
        rows: (res.data || []).map(function (r) {
          var count = r.cowork_replies && r.cowork_replies[0] ? r.cowork_replies[0].count : 0;
          return {
            id: r.id, user_id: r.user_id, pen_name: r.pen_name, title: r.title,
            field: r.field || '', kind: r.kind || '피드백 요청', body: r.body || '',
            link_url: r.link_url || '', status: r.status || '열림',
            reply_count: Number(count) || 0, created_at: r.created_at
          };
        })
      };
    },

    create: async function (payload) {
      var c = db(); var mine = me();
      if (!c || !mine) return { ok: false, message: '먼저 필명으로 시작해 주세요.' };
      var res = await c.from('cowork_posts').insert({
        user_id: mine.id, pen_name: mine.pen_name, title: payload.title,
        field: payload.field, kind: payload.kind, body: payload.body,
        link_url: payload.link_url || null, status: '열림'
      }).select('id');
      if (res.error) return { ok: false, missing: missing(res.error), error: res.error };
      return { ok: true };
    },

    setStatus: async function (id, status) {
      var c = db(); var mine = me();
      if (!c || !mine) return { ok: false };
      var res = await c.from('cowork_posts').update({ status: status }).eq('id', id).eq('user_id', mine.id).select('id');
      if (res.error) return { ok: false, error: res.error };
      return { ok: true };
    },

    remove: async function (id) {
      var c = db(); var mine = me();
      if (!c || !mine) return { ok: false };
      var res = await c.from('cowork_posts').delete().eq('id', id).eq('user_id', mine.id);
      if (res.error) return { ok: false, error: res.error };
      return { ok: true };
    },

    replies: async function (postId) {
      var c = db();
      if (!c) return { ok: false, rows: [] };
      var res = await c.from('cowork_replies')
        .select('*').eq('post_id', postId).order('created_at', { ascending: true }).limit(100);
      if (res.error) return { ok: false, missing: missing(res.error), rows: [] };
      return { ok: true, rows: res.data || [] };
    },

    reply: async function (postId, body) {
      var c = db(); var mine = me();
      if (!c || !mine) return { ok: false, needLogin: true };
      var res = await c.from('cowork_replies').insert({
        post_id: postId, user_id: mine.id, pen_name: mine.pen_name, body: body
      }).select('id');
      if (res.error) return { ok: false, missing: missing(res.error), error: res.error };
      return { ok: true };
    }
  };

  function replyHTML(row) {
    return '<li class="reply"><b class="reply__who">' + esc(row.pen_name) + '</b>' +
      '<time class="reply__time">' + esc(day(row.created_at)) + '</time>' +
      '<p class="reply__body">' + esc(row.body).replace(/\n/g, '<br>') + '</p></li>';
  }

  function coworkCard(row) {
    var mine = me();
    var own = mine && row.user_id === mine.id;
    var closed = row.status === '마감';
    var field = row.field && FIELDS.indexOf(row.field) !== -1 ? row.field : '';
    return '' +
      '<article class="feed-card feed-card--cowork' + (closed ? ' is-closed' : '') + '" data-post="' + esc(row.id) + '"' + (field ? ' data-field="' + esc(field) + '"' : '') + '>' +
        '<header class="feed-card__head">' +
          '<span class="feed-card__kind">' + esc(row.kind) + '</span>' +
          (field ? '<span class="feed-card__tag">' + esc(field) + '</span>' : '') +
          '<span class="feed-card__status' + (closed ? ' is-closed' : '') + '">' + (closed ? '모집 마감' : '모집 중') + '</span>' +
          '<time class="feed-card__time">' + esc(day(row.created_at)) + '</time>' +
        '</header>' +
        '<h3 class="feed-card__title">' + esc(row.title) + '</h3>' +
        '<p class="feed-card__body">' + esc(row.body).replace(/\n/g, '<br>') + '</p>' +
        (row.link_url ? '<p class="feed-card__link"><a href="' + esc(row.link_url) + '" target="_blank" rel="noopener noreferrer">참고 링크 열기</a></p>' : '') +
        '<footer class="feed-card__foot">' +
          '<a class="feed-card__who" href="darakbang.html?pen=' + encodeURIComponent(row.pen_name || '') + '">' + esc(row.pen_name) + '</a>' +
          '<button class="btn btn--ghost btn--sm" type="button" data-replies="' + esc(row.id) + '" aria-expanded="false">댓글 <b data-reply-count>' + (row.reply_count || 0) + '</b></button>' +
          (own ? '<span class="feed-card__own">' +
            '<button class="btn btn--ghost btn--sm" type="button" data-status="' + esc(row.id) + '" data-next="' + (closed ? '열림' : '마감') + '">' + (closed ? '다시 열기' : '모집 마감') + '</button>' +
            '<button class="btn btn--ghost btn--sm" type="button" data-cdelete="' + esc(row.id) + '">지우기</button>' +
          '</span>' : '') +
        '</footer>' +
        '<div class="replies" data-replies-box="' + esc(row.id) + '" hidden>' +
          '<ul class="replies__list" data-replies-list></ul>' +
          (me() ? '<form class="reply-form" data-reply-form="' + esc(row.id) + '">' +
            '<textarea class="textarea" name="body" rows="2" maxlength="400" placeholder="참여 의사나 짧은 피드백을 남겨 주세요."></textarea>' +
            '<button class="btn btn--primary btn--sm" type="submit">남기기</button>' +
          '</form>' : '<p class="reply-note">필명으로 시작하면 댓글을 남길 수 있어요.</p>') +
        '</div>' +
      '</article>';
  }

  async function initCowork() {
    var setup = $('[data-csetup]');
    var gate = $('[data-cgate]');
    var form = $('#cowork-form');
    var list = $('[data-clist]');
    var empty = $('[data-cempty]');
    var countEl = $('[data-ccount]');
    if (!list) return;

    await whenReady();

    if (Store.mode !== 'cloud' || !db()) {
      showNotice(setup, '협업 게시판은 Supabase를 연결하면 열려요. 지금은 체험 모드예요.');
      hide(gate); hide(form); hide(empty);
      return;
    }

    var picker = pickChips($('[data-cfield-picker]'));
    var body = form ? form.querySelector('[name="body"]') : null;
    var filter = '전체';
    var rows = [];

    function syncGate() {
      var mine = me();
      if (form) form.hidden = !mine;
      if (gate) gate.hidden = !!mine;
      var author = $('[data-cauthor]');
      if (author && mine) author.textContent = mine.pen_name;
    }

    function paint() {
      var shown = rows.filter(function (r) { return filter === '전체' || r.kind === filter; });
      list.innerHTML = shown.map(coworkCard).join('');
      if (countEl) countEl.textContent = String(shown.length);
      if (empty) empty.classList.toggle('is-visible', shown.length === 0);
      list.style.display = shown.length ? '' : 'none';
    }

    async function load() {
      var res = await Cowork.list();
      if (!res.ok) {
        if (res.missing) showNotice(setup);
        else showNotice(setup, '글을 불러오지 못했어요. 잠시 뒤 새로 고쳐 주세요.');
        list.innerHTML = '';
        if (countEl) countEl.textContent = '0';
        return;
      }
      hide(setup);
      rows = res.rows;
      paint();
    }

    syncGate();

    if (body) {
      body.addEventListener('input', function () {
        var len = $('[data-clen]');
        if (len) len.textContent = String(body.value.length);
      });
    }

    if (form) {
      form.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (!me()) return;
        var err = $('[data-cerror]');
        var title = form.querySelector('[name="title"]').value.trim();
        var text = body ? body.value.trim() : '';
        if (!title || !text) {
          if (err) { err.textContent = '제목과 내용을 함께 적어 주세요.'; err.hidden = false; }
          return;
        }
        var submit = $('[data-csubmit]');
        if (submit) submit.disabled = true;
        var res = await Cowork.create({
          title: title, body: text, field: picker.get(),
          kind: form.querySelector('[name="kind"]:checked').value,
          link_url: form.querySelector('[name="link_url"]').value.trim()
        });
        if (submit) submit.disabled = false;
        if (!res.ok) {
          if (res.missing) showNotice(setup);
          if (err) { err.textContent = res.message || '글을 올리지 못했어요. 잠시 뒤 다시 시도해 주세요.'; err.hidden = false; }
          return;
        }
        toast('모집 글을 올렸어요. 댓글로 참여 의사가 모일 거예요.');
        form.reset();
        picker.set('문학');
        if (body) body.value = '';
        var len = $('[data-clen]');
        if (len) len.textContent = '0';
        if (err) { err.hidden = true; err.textContent = ''; }
        await load();
      });
    }

    $$('[data-kfilter] .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        filter = chip.getAttribute('data-kind') || '전체';
        $$('[data-kfilter] .chip').forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', String(on));
        });
        paint();
      });
    });

    list.addEventListener('click', async function (event) {
      var replyBtn = event.target.closest('[data-replies]');
      var statusBtn = event.target.closest('[data-status]');
      var delBtn = event.target.closest('[data-cdelete]');

      if (replyBtn) {
        var id = replyBtn.getAttribute('data-replies');
        var box = list.querySelector('[data-replies-box="' + id + '"]');
        if (!box) return;
        var open = box.hidden;
        box.hidden = !open;
        replyBtn.setAttribute('aria-expanded', String(open));
        if (open) {
          var res = await Cowork.replies(id);
          var ul = box.querySelector('[data-replies-list]');
          if (ul) {
            ul.innerHTML = res.ok && res.rows.length
              ? res.rows.map(replyHTML).join('')
              : '<li class="reply reply--empty">' + (res.ok ? '아직 댓글이 없어요. 첫 마디를 남겨 볼까요?' : '댓글을 불러오지 못했어요.') + '</li>';
          }
        }
        return;
      }

      if (statusBtn) {
        var pid = statusBtn.getAttribute('data-status');
        var next = statusBtn.getAttribute('data-next');
        var sres = await Cowork.setStatus(pid, next);
        if (!sres.ok) { toast('상태를 바꾸지 못했어요. 잠시 뒤 다시 눌러 주세요.'); return; }
        toast(next === '마감' ? '모집을 마감했어요.' : '다시 모집을 열었어요.');
        await load();
        return;
      }

      if (delBtn) {
        var did = delBtn.getAttribute('data-cdelete');
        if (window.confirm('이 글을 지울까요? 달린 댓글도 함께 지워져요.')) {
          var dres = await Cowork.remove(did);
          if (!dres.ok) { toast('지우지 못했어요. 잠시 뒤 다시 눌러 주세요.'); return; }
          toast('글을 지웠어요.');
          await load();
        }
      }
    });

    list.addEventListener('submit', async function (event) {
      var replyForm = event.target.closest('[data-reply-form]');
      if (!replyForm) return;
      event.preventDefault();
      if (!me()) { toast('필명으로 시작하면 댓글을 남길 수 있어요.'); return; }
      var postId = replyForm.getAttribute('data-reply-form');
      var area = replyForm.querySelector('[name="body"]');
      var text = area ? area.value.trim() : '';
      if (!text) return;
      var btn = replyForm.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      var res = await Cowork.reply(postId, text);
      if (btn) btn.disabled = false;
      if (!res.ok) { toast('댓글을 남기지 못했어요. 잠시 뒤 다시 눌러 주세요.'); return; }
      if (area) area.value = '';
      toast('댓글을 남겼어요.');
      var box = list.querySelector('[data-replies-box="' + postId + '"]');
      var ul = box ? box.querySelector('[data-replies-list]') : null;
      if (box && ul) {
        var again = await Cowork.replies(postId);
        if (again.ok) {
          ul.innerHTML = again.rows.map(replyHTML).join('') || '<li class="reply reply--empty">아직 댓글이 없어요.</li>';
        }
      }
      var row = rows.filter(function (r) { return r.id === postId; })[0];
      if (row) {
        row.reply_count += 1;
        var counter = list.querySelector('[data-post="' + postId + '"] [data-reply-count]');
        if (counter) counter.textContent = String(row.reply_count);
      }
    });

    Store.onAuth(function () { syncGate(); load(); });
    await load();
  }

  /* ---------------------------------------------------- 시작 */
  function boot() {
    var page = document.body ? document.body.getAttribute('data-page') : '';
    if (page === 'journal') initJournal();
    else if (page === 'cowork') initCowork();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.DarakJournal = Journal;
  window.DarakCowork = Cowork;
})();
