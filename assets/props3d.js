/* ============================================================
 * assets/props3d.js  (새 파일)
 * 1) 방의 SVG 소품(g[data-prop])을 3D 이미지로 바꿔요. 기존 그림은 지우지 않고 투명하게만 해 둬요.
 *    → 드래그·고정·클릭은 그대로, 이미지를 못 불러오면 예전 그림이 그대로 보여요.
 * 2) seoyun:f 가 소품을 쓸 때 '사용 컷'(캐릭터+소품)으로 바꿔 끼우고, 움직임 효과를 줘요.
 * 3) 주소 끝에 ?props3d=tune 을 붙이면 위치·크기를 폰에서 직접 맞추는 패널이 떠요.
 * ============================================================ */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var XL = 'http://www.w3.org/1999/xlink';
  var BASE = 'images/room-3d/';

  // 사이트의 data-prop 이름이 아래와 다르면 여기에 직접 적어 주세요. 예: { '내소파': 'sofa' }
  // 다락방의 'beanbag' 은 화면에서 '2인용 소파'라서 sofa 그림을 씁니다.
  var CUSTOM = { beanbag: 'sofa' };

  // data-prop 이름(소문자·영문만 비교) → 파일 이름
  var ALIAS = {
    sofa: ['sofa', 'couch', 'twoseatsofa', 'loveseat', 'sofa2'],
    desk: ['desk', 'laptopdesk', 'workdesk', 'notebookdesk', 'laptop', 'woodendesk'],
    piano: ['piano', 'uprightpiano'],
    easel: ['easel', 'canvas'],
    coffee: ['coffee', 'coffeemachine', 'coffeemaker', 'dripcoffee'],
    guitar: ['guitar', 'acousticguitar'],
    candle: ['candle', 'candlewarmer', 'warmer'],
    lamp: ['lamp', 'standlamp', 'floorlamp', 'standinglamp', 'standlight'],
    plant: ['plant', 'pot', 'flowerpot', 'smallplant', 'pottedplant'],
    lights: ['lights', 'garland', 'stringlights', 'bulbgarland', 'fairylights'],
    cat: ['cat', 'catcushion', 'catbed'],
    books: ['books', 'bookstack', 'bookpile', 'bookspile'],
    record: ['record', 'recordplayer', 'vinyl', 'turntable'],
    dessert: ['dessert', 'desserttray', 'sweets', 'cakestand'],
    board: ['board', 'postcards', 'photoboard', 'postcardboard', 'corkboard'],
    dog: ['dog', 'dogcushion', 'dogbed'],
    tea: ['tea', 'teaset', 'teacup', 'cup'],
    camera: ['camera', 'filmcamera']
  };

  // 사용 컷을 보여 줄 캐릭터 (여기에 없는 캐릭터는 기존 자세가 그대로 나와요)
  var SCENE_CHARS = { 'seoyun:f': 'seoyun-f', 'seoyun:m': 'seoyun-m', 'ian:f': 'ian-f', 'ian:m': 'ian-m',
    'momo:f': 'momo-f', 'momo:m': 'momo-m', 'doyun:f': 'doyun-f', 'doyun:m': 'doyun-m',
    'haemil:f': 'haemil-f', 'haemil:m': 'haemil-m', 'haon:f': 'haon-f', 'haon:m': 'haon-m' };

  // 사용 컷 맞춤값  r: 소품 크기 비율, ax: 소품 가로 중심(그림 너비 중 몇 %),
  // d0: 그림 아래 끝을 소품 바닥선에 맞춘 뒤 더 내릴 양(기준 컷 픽셀)
  // w0/h0: 기준 컷(seoyun:f)의 원본 픽셀 크기 — 12명 모두 이 기준 틀에 맞춰 놓습니다.
  //   (예전에는 ay 를 '그 컷 높이의 몇 %'로 썼는데, 컷마다 잘린 높이가 달라 12명의 발/좌석 높이가
  //    제각각이었어요. 이제는 '컷 아래 끝 = 소품 바닥선'으로 모든 캐릭터를 같은 선에 세웁니다.)
  var DEF = { r: 0.78, ax: 0.5, d0: 7 };
  var FIT = {
    sofa: { r: 0.78, ax: 0.5, d0: 9, w0: 270, h0: 223 },
    desk: { r: 0.69, ax: 0.5, d0: 7, w0: 191, h0: 239 },
    piano: { r: 0.88, ax: 0.5, d0: 7, w0: 206, h0: 233 },
    easel: { r: 0.74, ax: 0.24, d0: 8, w0: 243, h0: 256 },
    coffee: { r: 0.6, ax: 0.3, d0: 8, w0: 178, h0: 254 },
    guitar: { r: 0.7, ax: 0.3, d0: 10, w0: 190, h0: 249 },
    candle: { r: 0.6, ax: 0.27, d0: 7, w0: 183, h0: 238 },
    lamp: { r: 0.85, ax: 0.15, d0: 7, w0: 169, h0: 237 },
    plant: { r: 0.7, ax: 0.12, d0: 9, w0: 178, h0: 179 },
    lights: { r: 0.78, ax: 0.5, d0: 146, w0: 188, h0: 192 },
    cat: { r: 0.75, ax: 0.75, d0: 11, w0: 189, h0: 163 },
    books: { r: 0.75, ax: 0.22, d0: 9, w0: 207, h0: 185 },
    record: { r: 0.8, ax: 0.27, d0: 7, w0: 170, h0: 222 },
    dessert: { r: 0.75, ax: 0.18, d0: 7, w0: 153, h0: 227 },
    board: { r: 0.8, ax: 0.3, d0: 27, w0: 188, h0: 227 },
    dog: { r: 0.75, ax: 0.3, d0: 12, w0: 211, h0: 172 },
    tea: { r: 0.7, ax: 0.5, d0: 10, w0: 91, h0: 238 },
    camera: { r: 0.7, ax: 0.5, d0: 9, w0: 103, h0: 228 }
  };

  // 움직임: f=몸 움직임, p=[효과, x%, y%, 개수, 간격(초), 가로퍼짐%, {추가값}]
  //   x·y 는 '기준 컷(seoyun:f)' 그림 안의 위치(%)예요. 12명 모두 이 기준 틀로 효과를 띄워서,
  //   캐릭터가 바뀌어도 음표·반짝임이 같은 자리에서 나옵니다.
  var FX = {
    sofa: { f: 'breathe', p: [['spark', 56, 20, 2, 0.9, 14]] },
    desk: { f: 'typing', p: [['key', 44, 56, 3, 0.16, 9]] },
    piano: { f: 'sway', p: [['note', 40, 40, 3, 0.85, 6]] },
    easel: { f: 'brush', p: [['paint', 36, 33, 3, 0.45, 6]] },
    coffee: { f: 'pour', p: [['drop', 34, 30, 2, 0.35, 0, { fall: 6 }], ['steam', 31, 42, 3, 0.9, 5]] },
    guitar: { f: 'sway', p: [['note', 30, 38, 3, 0.85, 8]] },
    candle: { f: 'breathe', p: [['glow', 32, 47, 1, 0, 0, { s: 7 }]] },
    lamp: { f: 'breathe', p: [['glow', 17, 20, 1, 0, 0, { s: 9 }]] },
    plant: { f: 'pour', p: [['drop', 17, 64, 3, 0.3, 0, { fall: 5 }]] },
    lights: { f: 'float', p: [['bulb', 47, 20, 5, 0.3, 14]] },
    cat: { f: 'breathe', p: [['zzz', 78, 66, 3, 1, 6]] },
    books: { f: 'breathe', p: [['spark', 44, 44, 2, 1, 16]] },
    record: { f: 'sway', p: [['note', 30, 38, 3, 0.85, 6]] },
    dessert: { f: 'float', p: [['spark', 72, 30, 2, 0.9, 12]] },
    board: { f: 'breathe', p: [['spark', 34, 28, 2, 0.9, 18]] },
    dog: { f: 'breathe', p: [['heart', 38, 48, 3, 1, 6]] },
    tea: { f: 'breathe', p: [['steam', 40, 30, 3, 0.9, 5]] },
    camera: { f: 'float', p: [['flash', 40, 22, 1, 0, 0]] }
  };

  // 지우면 안 되는 부분(눌림 영역·잠금 표시·선택 테두리 등)은 투명하게 만들지 않아요
  var KEEP = '[class*="hit"],[class*="lock"],[class*="handle"],[class*="ring"],[class*="outline"],[class*="select"],[data-keep]';

  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z]/g, ''); }
  var LOOKUP = {};
  Object.keys(ALIAS).forEach(function (k) { ALIAS[k].forEach(function (a) { LOOKUP[a] = k; }); });
  function keyOf(name) { return CUSTOM[name] || LOOKUP[norm(name)] || null; }

  /* ── CSS (이 파일이 스스로 넣어요) ───────────────────── */
  var css = [
    '.has-3d>.p3d-old{opacity:0}',
    '[data-room-char].p3d-away{display:none}',
    '[data-prop-front].p3d-away{display:none!important}',
    '.has-3d.p3d-using>.prop3d{display:none}',
    '.p3d-scene{transform-box:fill-box;transform-origin:50% 100%}',
    '.p3d-f-breathe{animation:p3d-breathe 4.6s ease-in-out infinite alternate}',
    '.p3d-f-typing{animation:p3d-typing .46s ease-in-out infinite alternate}',
    '.p3d-f-sway{animation:p3d-sway 2.8s ease-in-out infinite alternate}',
    '.p3d-f-brush{animation:p3d-brush 1.4s ease-in-out infinite alternate}',
    '.p3d-f-pour{transform-origin:40% 100%;animation:p3d-brush 3.4s ease-in-out infinite alternate}',
    '.p3d-f-float{animation:p3d-float 3.2s ease-in-out infinite alternate}',
    '.p3d-p{opacity:0;pointer-events:none;transform-box:fill-box;transform-origin:center;animation-duration:var(--dur,2.6s);animation-delay:calc(var(--i)*var(--gap,.8s));animation-iteration-count:infinite;animation-timing-function:ease-out}',
    '.p3d-note,.p3d-zzz{fill:#C88B96;animation-name:p3d-rise}',
    '.p3d-heart{fill:#E58CA0;animation-name:p3d-rise}',
    '.p3d-spark{fill:#E7B45E;--dur:1.9s;animation-name:p3d-pop}',
    '.p3d-paint{--dur:1.5s;animation-name:p3d-pop}',
    '.p3d-steam{fill:#fff;--dur:2.8s;animation-name:p3d-steam}',
    '.p3d-drop{fill:#9CC8E8;--dur:.95s;animation-name:p3d-drop}',
    '.p3d-key{fill:#C88B96;--dur:.5s;animation-name:p3d-tap;animation-timing-function:ease-in-out}',
    '.p3d-bulb{fill:#FFD98A;--dur:1.8s;animation-name:p3d-twinkle;animation-timing-function:ease-in-out;animation-direction:alternate}',
    '.p3d-glow{fill:url(#p3dGlow);--dur:2.4s;animation-name:p3d-glow;animation-timing-function:ease-in-out;animation-direction:alternate}',
    '.p3d-flash{fill:url(#p3dFlash);--dur:3.2s;animation-name:p3d-flash}',
    '@keyframes p3d-breathe{from{transform:scale(1,1)}to{transform:scale(1.006,1.014)}}',
    '@keyframes p3d-typing{from{transform:translateY(0)}to{transform:translateY(-.8px) rotate(.12deg)}}',
    '@keyframes p3d-sway{from{transform:rotate(-.6deg)}to{transform:rotate(.6deg)}}',
    '@keyframes p3d-brush{from{transform:rotate(0)}to{transform:rotate(1deg)}}',
    '@keyframes p3d-float{from{transform:translateY(0)}to{transform:translateY(-1.5px)}}',
    '@keyframes p3d-rise{0%{opacity:0;transform:translate(0,0) scale(.8)}15%{opacity:1}100%{opacity:0;transform:translate(calc(var(--dx,1)*var(--u)*2px),calc(var(--u)*-14px)) rotate(12deg) scale(1.1)}}',
    '@keyframes p3d-steam{0%{opacity:0;transform:translateY(0) scaleX(.8)}30%{opacity:.8}100%{opacity:0;transform:translateY(calc(var(--u)*-10px)) scaleX(1.7)}}',
    '@keyframes p3d-drop{0%{opacity:0;transform:translateY(0)}15%{opacity:1}100%{opacity:0;transform:translateY(calc(var(--fall,5)*var(--u)*1px))}}',
    '@keyframes p3d-pop{0%{opacity:0;transform:scale(0)}40%{opacity:1;transform:scale(1.1) rotate(20deg)}100%{opacity:0;transform:scale(.4)}}',
    '@keyframes p3d-tap{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1.4)}}',
    '@keyframes p3d-twinkle{from{opacity:.2}to{opacity:1}}',
    '@keyframes p3d-glow{from{opacity:.3;transform:scale(.9)}to{opacity:.95;transform:scale(1.15)}}',
    '@keyframes p3d-flash{0%,86%,100%{opacity:0;transform:scale(.6)}91%{opacity:.95;transform:scale(1.2)}}',
    // 동작 줄이기: 움직임과 효과를 모두 끔
    '@media (prefers-reduced-motion:reduce){.p3d-scene{animation:none!important}.p3d-p{display:none}}'
  ].join('\n');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ── 이미지 불러오기 ─────────────────────────────────── */
  var loaded = {};
  var pending = {};
  function load(url) {
    if (pending[url]) return pending[url];
    pending[url] = new Promise(function (res) {
      var im = new Image();
      im.onload = function () { loaded[url] = im; res(im); };
      im.onerror = function () { delete pending[url]; res(null); };   // 다음에 다시 시도할 수 있게
      im.src = url;
    });
    return pending[url];
  }
  function svgImage(url, x, y, w, h, cls) {
    var e = document.createElementNS(NS, 'image');
    e.setAttribute('href', url);
    e.setAttributeNS(XL, 'xlink:href', url);
    e.setAttribute('x', x); e.setAttribute('y', y);
    e.setAttribute('width', w); e.setAttribute('height', h);
    e.setAttribute('preserveAspectRatio', 'none');
    e.setAttribute('class', cls);
    e.setAttribute('aria-hidden', 'true');
    return e;
  }

  /* ── 1) 소품 이미지 교체 ─────────────────────────────── */
  function setup(g) {
    if (g.__p3d && g.contains(g.__p3d.img)) return;
    g.__p3d = null;
    var key = keyOf(g.getAttribute('data-prop'));
    if (!key) return;
    var keep = Array.prototype.slice.call(g.querySelectorAll(KEEP));
    keep.forEach(function (e) { e.__d = e.style.display; e.style.display = 'none'; });
    var bb = null;
    try { bb = g.getBBox(); } catch (e) { bb = null; }
    keep.forEach(function (e) { e.style.display = e.__d || ''; });
    if (!bb || bb.width < 2 || bb.height < 2) return;   // 아직 화면에 안 보임 → 나중에 다시
    g.__p3d = { key: key, loading: true };
    load(BASE + 'props/' + key + '.webp').then(function (im) {
      if (!im || !g.isConnected) { g.__p3d = null; return; }
      var s = Math.min(bb.width / im.naturalWidth, bb.height / im.naturalHeight);
      var w = im.naturalWidth * s, h = im.naturalHeight * s;
      var x = bb.x + (bb.width - w) / 2, y = bb.y + bb.height - h;
      var img = svgImage(BASE + 'props/' + key + '.webp', x, y, w, h, 'prop3d');
      Array.prototype.forEach.call(g.children, function (c) {
        if (!c.matches(KEEP)) c.classList.add('p3d-old');
      });
      g.insertBefore(img, g.firstChild);
      g.classList.add('has-3d');
      g.__p3d = { key: key, img: img, rect: { x: x, y: y, w: w, h: h }, nw: im.naturalWidth };
      // 3D 그림에는 가구 앞면이 함께 그려져 있어요. 예전 2D 앞면(건반·기타 몸통 등)은 감춥니다.
      var fronts = document.querySelectorAll('[data-prop-front="' + g.getAttribute('data-prop') + '"]');
      Array.prototype.forEach.call(fronts, function (fr) { fr.classList.add('p3d-away'); });
      preloadScenes(key);
    });
  }
  /* 화면에 선 캐릭터의 컷만 미리 받아 둡니다. 예전에는 18소품 × 12명 = 216장을 한꺼번에 받아서
     느린 폰에서는 첫 누름에 컷이 늦게 뜨거나 안 뜨는 일이 있었어요. 캐릭터를 바꾸면 그 캐릭터 것만 받습니다. */
  function preloadScenes(key) {
    var c = SCENE_CHARS[roomCharKey()];
    if (c) load(BASE + 'scenes/' + c + '-' + key + '.webp');
  }

  /* ── 2) 사용 컷 바꿔 끼우기 ──────────────────────────── */
  var cur = null;
  function findG(name) {
    var all = document.querySelectorAll('g[data-prop]');
    for (var i = 0; i < all.length; i++) {
      if (all[i].getAttribute('data-prop') === name) return all[i];
    }
    return null;
  }
  function defs(svg) {
    var d = svg.querySelector('#p3d-defs');
    if (d) return;
    d = document.createElementNS(NS, 'defs');
    d.id = 'p3d-defs';
    d.innerHTML =
      '<radialGradient id="p3dGlow"><stop offset="0" stop-color="#FFD68C" stop-opacity=".85"/><stop offset="1" stop-color="#FFD68C" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="p3dFlash"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>';
    svg.insertBefore(d, svg.firstChild);
  }
  var TXT = { note: ['♪', '♫', '♩'], spark: ['✦'], heart: ['♥'], zzz: ['z'] };
  var PAINT = ['#E58CA0', '#8DB8D9', '#E7B45E'];
  function particle(kind, i, px, py, u, extra) {
    var e;
    if (TXT[kind]) {
      e = document.createElementNS(NS, 'text');
      e.setAttribute('x', px); e.setAttribute('y', py);
      e.setAttribute('font-size', u * 8);
      e.setAttribute('text-anchor', 'middle');
      e.textContent = TXT[kind][i % TXT[kind].length];
    } else if (kind === 'steam' || kind === 'drop') {
      e = document.createElementNS(NS, 'ellipse');
      e.setAttribute('cx', px); e.setAttribute('cy', py);
      e.setAttribute('rx', kind === 'steam' ? u * 0.9 : u * 0.5);
      e.setAttribute('ry', kind === 'steam' ? u * 2.6 : u * 0.9);
    } else if (kind === 'glow' || kind === 'flash') {
      e = document.createElementNS(NS, 'circle');
      e.setAttribute('cx', px); e.setAttribute('cy', py);
      e.setAttribute('r', u * (extra.s || 11));
    } else {
      e = document.createElementNS(NS, 'circle');
      e.setAttribute('cx', px); e.setAttribute('cy', py);
      e.setAttribute('r', kind === 'bulb' ? u * 0.8 : (kind === 'key' ? u * 0.5 : u * 0.7));
      if (kind === 'paint') e.setAttribute('fill', PAINT[i % 3]);
    }
    e.setAttribute('class', 'p3d-p p3d-' + kind);
    e.style.setProperty('--u', u);
    e.style.setProperty('--i', i);
    e.style.setProperty('--dx', (i % 2 ? 1 : -1) * (0.5 + i * 0.25));
    if (extra.fall) e.style.setProperty('--fall', extra.fall);
    return e;
  }
  /* 사용 컷은 소품 <g> 안에 그려지는데, SVG 는 DOM 차례대로 그려서 뒤에 있는 소품
     (예: 소파)이 컷 위를 덮어 캐릭터 머리가 잘렸어요. 컷이 떠 있는 동안만 그 <g>를
     방의 맨 앞(빛줄기·먼지 바로 아래)으로 옮기고, 끝나면 원래 다음 형제 앞으로
     되돌립니다. 소품 차례·끌기·고정 표시는 원래대로 남습니다. */
  function liftProp(g) {
    if (g.__p3dHome) return;
    var svg = g.ownerSVGElement;
    if (!svg || !svg.children) return;
    var home = { parent: g.parentNode, next: g.nextSibling };
    var sky = svg.querySelector('.droom__beam, .droom__dust');   // 분위기 레이어는 소품 위에 그대로
    if (sky && sky.parentNode === home.parent) home.parent.insertBefore(g, sky);
    else home.parent.appendChild(g);
    g.__p3dHome = home;
    settleAnim(g);
  }
  function dropProp(g) {
    var home = g.__p3dHome;
    if (!home) return;
    g.__p3dHome = null;
    if (!g.isConnected || !home.parent || !home.parent.isConnected) return;
    if (home.next && home.next.parentNode === home.parent) home.parent.insertBefore(g, home.next);
    else home.parent.appendChild(g);
    settleAnim(g);
  }
  /* 자리를 옮기면 소품에 걸린 등장 효과(droomPop)가 처음부터 다시 돌아 깜빡여요. 방금 끝난 상태로 붙잡아 둡니다. */
  function settleAnim(g) {
    try { if (g.getAnimations) g.getAnimations().forEach(function (a) { a.finish(); }); } catch (e) { /* 효과가 없어도 괜찮아요 */ }
  }
  function endUse() {
    if (!cur) return;
    if (cur.img.parentNode) cur.img.parentNode.removeChild(cur.img);
    if (cur.fx.parentNode) cur.fx.parentNode.removeChild(cur.fx);
    cur.g.classList.remove('p3d-using');           // 빈 소품이 다시 보여요
    dropProp(cur.g);                                // 소품을 원래 차례로 되돌려요
    cur = null;
    keepLayers(false);                              // 방 캐릭터를 다시 보이게
  }
  // propName: data-prop 값, charKey: 예) 'seoyun:f'.  true 를 돌려주면 3D 컷이 나온 거예요(기존 자세는 건너뛰기)
  function start(propName, charKey) {
    var g = findG(propName);
    var sc = SCENE_CHARS[charKey];
    if (!g || !g.__p3d || !g.__p3d.img || !sc) return false;
    var key = g.__p3d.key;
    var url = BASE + 'scenes/' + sc + '-' + key + '.webp';
    var im = loaded[url];
    if (!im) {
      /* 그림을 아직 못 받았으면, 받은 뒤에 한 번 더 시도합니다.
         (예전에는 이 순간 그냥 false 라서 '눌렀는데 자세가 안 바뀌는' 것처럼 보였어요.) */
      load(url).then(function (got) {
        if (!got || cur) return;
        if (roomCharKey() !== charKey || !g.classList.contains('is-on')) return;
        if (roomStudio && roomStudio.getAttribute('data-char-activity') !== propName) return;
        if (start(propName, charKey)) keepLayers(true);
      });
      return false;
    }
    endUse();
    var R = g.__p3d.rect, f = FIT[key] || DEF;
    var k = (R.w / g.__p3d.nw) / f.r;
    /* 캐릭터마다 컷이 잘린 크기가 달라서, 기준 컷(seoyun:f)과 같은 크기로 그립니다.
       (예전에는 컷 원본 크기를 그대로 썼기 때문에 누구는 크고 누구는 작게 보였어요.) */
    var sc = (f.h0 || im.naturalHeight) / im.naturalHeight;
    var w = im.naturalWidth * k * sc, h = im.naturalHeight * k * sc;
    var x = R.x + R.w / 2 - f.ax * w;
    /* 세로는 '그 컷의 몇 %'가 아니라 '컷 아래 끝 = 소품 바닥선'으로 맞춥니다.
       컷마다 잘린 높이가 달라도 12명 모두 같은 바닥선에 서고 앉습니다. */
    var y = R.y + R.h - h + (f.d0 || 0) * k;
    /* 효과(음표·반짝임·김)는 각 컷이 아니라 기준 컷 자리에 띄워서 12명이 똑같이 보이게 합니다. */
    var wb = (f.w0 || im.naturalWidth) * k, hb = (f.h0 || im.naturalHeight) * k;
    var xb = R.x + R.w / 2 - f.ax * wb, yb = R.y + R.h - hb + (f.d0 || 0) * k;
    var fxd = FX[key] || { f: 'breathe', p: [] };
    var img = svgImage(im.src, x, y, w, h, 'p3d-scene p3d-f-' + fxd.f);
    var fx = document.createElementNS(NS, 'g');
    fx.setAttribute('aria-hidden', 'true');
    var u = wb / 100;
    defs(g.ownerSVGElement);
    fxd.p.forEach(function (s) {
      for (var i = 0; i < s[3]; i++) {
        var px = xb + (s[1] + (i - (s[3] - 1) / 2) * s[5]) / 100 * wb;
        var py = yb + s[2] / 100 * hb;
        var e = particle(s[0], i, px, py, u, s[6] || {});
        e.style.setProperty('--gap', s[4] + 's');
        fx.appendChild(e);
      }
    });
    g.insertBefore(img, g.__p3d.img.nextSibling);
    g.insertBefore(fx, img.nextSibling);
    g.classList.add('p3d-using');
    liftProp(g);                                   // 다른 소품에 가려지지 않게 맨 앞으로
    cur = { g: g, img: img, fx: fx, name: propName, char: charKey };
    return true;
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') endUse(); });
  window.addEventListener('pagehide', endUse);

  /* ── 시작: 소품 찾기 ─────────────────────────────────── */
  function scan() {
    document.querySelectorAll('g[data-prop]').forEach(setup);
    /* 캐릭터가 바뀌면 그 캐릭터의, 방에 놓인 소품 컷만 미리 받아 둡니다. */
    if (roomCharKey() !== warmedChar) { warmedChar = roomCharKey(); warmScenes(); }
    syncUse();
    if (panel) panel.refresh();
  }
  var warmedChar = null;
  function warmScenes() {
    var c = SCENE_CHARS[roomCharKey()];
    if (!c) return;
    document.querySelectorAll('g[data-prop]').forEach(function (g) {
      if (g.__p3d && g.__p3d.img && g.classList.contains('is-on')) {
        load(BASE + 'scenes/' + c + '-' + g.__p3d.key + '.webp');
      }
    });
  }
  var timer = null;
  function later() { clearTimeout(timer); timer = setTimeout(scan, 150); }
  var tries = 0;
  var iv = setInterval(function () { scan(); if (++tries > 25) clearInterval(iv); }, 400);
  new MutationObserver(later).observe(document.documentElement, { childList: true, subtree: true });

  /* ── 3) 맞춤 패널 (?props3d=tune) ────────────────────── */
  var panel = null;
  if (/[?&]props3d=tune/.test(location.search)) {
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));z-index:99999;background:#FFFAFB;color:#4A3239;border:1px solid #F3D6DD;border-radius:16px;padding:10px 12px;font:14px/1.5 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.2);max-height:55vh;overflow:auto';
    box.innerHTML =
      '<div id="p3d-info" style="font-size:12px;color:#7A5F66;margin-bottom:6px"></div>' +
      '<select id="p3d-sel" style="width:100%;min-height:44px;font-size:16px"></select>' +
      '<label style="display:block">크기 <b id="p3d-rv"></b><input id="p3d-r" type="range" min="0.3" max="1.3" step="0.01" style="width:100%"></label>' +
      '<label style="display:block">가로 위치 <b id="p3d-axv"></b><input id="p3d-ax" type="range" min="-0.2" max="1.2" step="0.01" style="width:100%"></label>' +
      '<label style="display:block">세로 내림 <b id="p3d-ayv"></b><input id="p3d-ay" type="range" min="-20" max="80" step="1" style="width:100%"></label>' +
      '<div style="display:flex;gap:6px;margin-top:6px"><button id="p3d-go" style="flex:1;min-height:44px">사용 컷 보기</button>' +
      '<button id="p3d-stop" style="flex:1;min-height:44px">끝내기</button>' +
      '<button id="p3d-copy" style="flex:1;min-height:44px">숫자 복사</button></div>';
    document.body.appendChild(box);
    var $ = function (id) { return box.querySelector('#p3d-' + id); };
    var sel = $('sel');
    function cfg() { var k = sel.value; var c = (FIT[k] = FIT[k] || { r: DEF.r, ax: DEF.ax, d0: DEF.d0 }); if (c.d0 == null) c.d0 = DEF.d0; return c; }
    function show() {
      var c = cfg();
      $('r').value = c.r; $('ax').value = c.ax; $('ay').value = c.d0;
      $('rv').textContent = c.r; $('axv').textContent = c.ax; $('ayv').textContent = c.d0;
    }
    function redo() {
      var c = cfg();
      c.r = +$('r').value; c.ax = +$('ax').value; c.d0 = +$('ay').value;
      show();
      var name = sel.options[sel.selectedIndex].getAttribute('data-name');
      if (cur) start(name, 'seoyun:f');
    }
    ['r', 'ax', 'ay'].forEach(function (id) { $(id).addEventListener('input', redo); });
    sel.addEventListener('change', show);
    $('go').addEventListener('click', function () {
      var name = sel.options[sel.selectedIndex].getAttribute('data-name');
      if (!start(name, 'seoyun:f')) alert('사용 컷을 못 불러왔어요. 이미지 파일 경로를 확인해 주세요.');
    });
    $('stop').addEventListener('click', endUse);
    $('copy').addEventListener('click', function () {
      var t = JSON.stringify(FIT);
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { alert('복사했어요. 채팅에 붙여 주세요.'); }, function () { window.prompt('이 글을 복사해 주세요', t); });
      else window.prompt('이 글을 복사해 주세요', t);
    });
    panel = {
      refresh: function () {
        var gs = document.querySelectorAll('g[data-prop]'), ok = [], no = [], opts = '';
        gs.forEach(function (g) {
          var n = g.getAttribute('data-prop'), k = keyOf(n);
          if (k && g.__p3d && g.__p3d.img) { ok.push(n); opts += '<option value="' + k + '" data-name="' + n.replace(/"/g, '') + '">' + n + '</option>'; }
          else no.push(n + (k ? '(대기)' : '✗'));
        });
        $('info').textContent = '바뀐 소품 ' + ok.length + '개 · 안 바뀐 것: ' + (no.join(', ') || '없음');
        if (sel.innerHTML !== opts) { var prev = sel.value; sel.innerHTML = opts; if (prev) sel.value = prev; show(); }
      }
    };
    panel.refresh();
  }

  /* ── 4) 다락방 소품 누름과 잇기 ─────────────────────────
     다락방 화면(app.js)은 소품을 눌렀을 때 말풍선·소리·자세만 바꾸고
     이 파일을 부르지는 않아요. 그래서 여기서 '소품 누름'을 직접 듣고
     사용 컷을 켜고 끕니다. (다른 파일은 건드리지 않아요)
     사용 컷에는 소품과 캐릭터가 함께 그려져 있어서, 컷이 떠 있는 동안만
     방 캐릭터와 그 소품의 가구 앞면(2D)을 잠시 감춥니다. */
  var roomStudio = document.getElementById('darak-studio');

  // 사용 컷이 떠 있는 동안 감출 것: 방 캐릭터 (컷에 캐릭터가 함께 그려져 있어요)
  function keepLayers(on) {
    var rc = document.querySelector('[data-room-char]');
    if (rc) rc.classList.toggle('p3d-away', !!on);
  }

  function roomCharKey() {
    var on = document.querySelector('[data-room-char] [data-char].is-on') || document.querySelector('[data-char].is-on');
    return on ? on.getAttribute('data-char') : '';
  }

  // 손가락·마우스가 찍은 자리에 깔린 소품 (다른 소품이 겹쳐 있어도 찾아냅니다)
  /* 소품 3D 그림은 투명한 여백까지 눌림 영역이에요. 그래서 뒤에 있는 소품(예: 책상)을 누를 때
     앞 소품(피아노)의 투명한 부분이 먼저 잡히는 일이 있었습니다. 그림의 투명도를 24×24로
     미리 읽어 두고, 실제로 그림이 있는 소품을 고릅니다. */
  var GRID = 24, grids = {};
  function gridFor(g) {
    var p = g && g.__p3d;
    if (!p || !p.img) return null;
    var url = p.img.getAttribute('href');
    if (url in grids) return grids[url];
    var im = loaded[url];
    if (!im) return null;
    try {
      var c = document.createElement('canvas');
      c.width = GRID; c.height = GRID;
      var cx = c.getContext('2d');
      cx.drawImage(im, 0, 0, GRID, GRID);
      var d = cx.getImageData(0, 0, GRID, GRID).data, out = new Uint8Array(GRID * GRID);
      for (var i = 0; i < out.length; i += 1) out[i] = d[i * 4 + 3];
      grids[url] = out;
      return out;
    } catch (e) { grids[url] = null; return null; }
  }
  function alphaHit(g, x, y) {
    var p = g && g.__p3d;
    if (!p || !p.img) return true;                 // 정보가 없으면 예전처럼 통과
    var gd = gridFor(g);
    if (!gd) return true;
    var img = p.img, svg = img.ownerSVGElement;
    var m = img.getScreenCTM && img.getScreenCTM();
    if (!svg || !m) return true;
    var pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
    var u = pt.matrixTransform(m.inverse());
    var nw = img.width.baseVal.value || 1, nh = img.height.baseVal.value || 1;
    var gx = Math.floor((u.x / nw) * GRID), gy = Math.floor((u.y / nh) * GRID);
    if (gx < 0 || gy < 0 || gx >= GRID || gy >= GRID) return false;
    return gd[gy * GRID + gx] > 60;
  }
  function propAt(x, y) {
    var list = document.elementsFromPoint ? (document.elementsFromPoint(x, y) || []) : [];
    var fallback = null;
    for (var i = 0; i < list.length; i += 1) {
      var g = list[i] && list[i].closest ? list[i].closest('g[data-prop]') : null;
      if (!g || !g.classList.contains('is-on') || (roomStudio && !roomStudio.contains(g))) continue;
      if (!fallback) fallback = g;
      if (alphaHit(g, x, y)) return g;             // 그 자리에 실제로 그림이 있는 소품
    }
    return fallback;
  }

  if (roomStudio) {
    var downAt = null;
    document.addEventListener('pointerdown', function (e) {
      downAt = { x: e.clientX, y: e.clientY };
    }, true);
    /* app.js 는 이 소품을 켰을 때만 data-char-activity 를 남깁니다.
       이미 다른 캐릭터가 쓰던 소품을 누르면 오히려 '끄기'가 되니, 그때는 컷을 띄우지 않아요.
       app.js 가 켜고 끈 결과를 보고 판단하도록, 결정은 클릭 처리가 끝난 뒤로 미룹니다. */
    document.addEventListener('click', function (e) {
      if (!e.target || !roomStudio.contains(e.target)) return;
      // 끌어서 자리를 옮긴 경우는 누름으로 보지 않아요
      if (downAt && (Math.abs(e.clientX - downAt.x) > 6 || Math.abs(e.clientY - downAt.y) > 6)) return;
      var name = null;
      var g = propAt(e.clientX, e.clientY);
      if (!g) {
        var t = e.target.closest ? e.target.closest('g[data-prop]') : null;
        if (t && t.classList.contains('is-on')) g = t;
      }
      if (!g) return;
      name = g.getAttribute('data-prop');
      if (!name) return;
      setTimeout(function () {
        var on = !!(g.isConnected && g.classList.contains('is-on'));
        var after = roomStudio.getAttribute('data-char-activity');
        if (!on) { if (cur) endUse(); return; }
        if (cur && cur.name === name) { endUse(); return; }                    // 같은 소품을 다시 누르면 원래대로
        /* 다락방 화면은 소품을 '이용 중'으로 켰을 때만 data-char-activity 에 그 소품을 적어 둡니다.
           적혀 있지 않으면 켜진 게 아니니(예전 캐릭터의 이용을 끈 경우) 컷을 띄우지 않아요. */
        if (after !== name) { if (cur) endUse(); return; }
        if (start(name, roomCharKey())) keepLayers(true);
        else if (cur) endUse();
      }, 0);
    }, true);
  }

  // 캐릭터를 바꾸거나, 소품 이용이 끝나거나(자세 버튼 등), 소품을 치우면 떠 있던 컷도 함께 정리합니다.
  function syncUse() {
    if (!cur) return;
    var act = roomStudio ? roomStudio.getAttribute('data-char-activity') : null;
    if (act !== cur.name) { endUse(); return; }        // 소품 이용이 끝났으면 컷도 내립니다
    if (roomCharKey() !== cur.char || !cur.g.classList.contains('is-on') || !cur.g.isConnected) endUse();
  }

  window.Props3D = { start: start, end: endUse, fit: FIT, propAt: propAt };
})();
