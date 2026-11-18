/**
 * ============================================================
 *  아트다락방 — 새 필명 가입 알림 메일 (Google Apps Script)
 * ------------------------------------------------------------
 *  쓰는 법 (1분, 무료):
 *   1) 다슬님 Gmail(aa95925551@gmail.com)로 로그인한 브라우저에서
 *      https://script.google.com → [새 프로젝트] 를 엽니다.
 *   2) 왼쪽 'Code.gs' 안의 내용을 모두 지우고, 이 파일 내용 전체를 붙여 넣습니다.
 *   3) 위쪽 [저장] → [배포] → [새 배포]
 *        · 유형 선택: 웹 앱
 *        · 설명: 아트다락방 가입 알림
 *        · 다음 사용자로 실행: 나 (aa95925551@gmail.com)
 *        · 액세스 권한이 있는 사용자: 모든 사용자
 *      → [배포] → 권한 확인(구글 계정 선택 → 고급 → 이동 → 허용)
 *   4) 나오는 '웹 앱 URL'(.../exec 로 끝남)을 복사해
 *      assets/supabase-config.js 의 notifyWebhookUrl 에 붙여 넣습니다.
 *   5) 잘 되는지 확인: 브라우저에 그 URL 을 그대로 열어 보세요.
 *      "아트다락방 가입 알림이 준비됐어요" 가 보이면 성공입니다.
 *      (편집기에서 testSend() 를 실행하면 실제 메일 한 통이 옵니다)
 *
 *  · 서버도, 결제도 필요 없습니다. Apps Script 무료 한도 안에서 돌아갑니다.
 *  · 요청에 담긴 to 값은 참고만 하고, 실제 발송은 아래 ADMIN_EMAIL 로만 합니다.
 *    (웹앱 주소는 공개 주소라서, 그 값을 그대로 쓰면 엉뚱한 곳으로 메일이 갈 수 있습니다)
 * ============================================================
 */

/** 알림을 받을 관리자 메일 — 여기만 바꾸면 됩니다. */
var ADMIN_EMAIL = 'aa95925551@gmail.com';

/** 메일 제목 앞에 붙는 이름 */
var SITE_NAME = '아트다락방';

/**
 * 사이트가 가입 직후 POST 로 보내는 곳.
 * 보내는 내용: { type: 'new_signup', pen_name, created_at, to }
 */
function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    // 가입 알림만 처리합니다.
    if (body.type && body.type !== 'new_signup') {
      return jsonOut({ ok: false, error: 'unknown_type' });
    }

    var penName = clean_(body.pen_name, 40) || '(필명 없음)';
    var createdAt = parseDate_(body.created_at);

    var subject = '[' + SITE_NAME + '] 새 필명 가입: ' + penName;
    var plain =
      '새 필명이 다락방 문을 열었어요.\n\n' +
      '· 필명: ' + penName + '\n' +
      '· 가입 시각: ' + formatKst_(createdAt) + '\n\n' +
      '관리자 화면(admin.html) → 회원 관리에서 확인할 수 있어요.\n\n' +
      '— ' + SITE_NAME + ' 가입 알림';

    var html =
      '<div style="font-family:Apple SD Gothic Neo,Malgun Gothic,sans-serif;' +
      'max-width:520px;padding:22px 24px;border-radius:18px;' +
      'background:#FDF2F3;color:#4A3239;line-height:1.7">' +
      '<div style="font-size:13px;letter-spacing:.12em;color:#C88B96;font-weight:700">' +
      SITE_NAME + ' · 새 필명</div>' +
      '<div style="font-family:Georgia,serif;font-size:24px;font-weight:700;margin-top:6px">' +
      escape_(penName) + ' 님, 다락방 문이 열렸어요</div>' +
      '<table style="margin-top:16px;font-size:14px;border-collapse:collapse">' +
      '<tr><td style="padding:4px 14px 4px 0;color:#8A6D74">가입 시각</td><td>' +
      escape_(formatKst_(createdAt)) + '</td></tr>' +
      '<tr><td style="padding:4px 14px 4px 0;color:#8A6D74">필명</td><td>' +
      escape_(penName) + '</td></tr>' +
      '</table>' +
      '<p style="margin-top:18px;font-size:13px;color:#8A6D74">' +
      '관리자 화면 → 회원 관리에서 새 필명을 확인할 수 있어요.</p>' +
      '</div>';

    MailApp.sendEmail({
      to: ADMIN_EMAIL,          // 요청의 to 는 쓰지 않습니다.
      subject: subject,
      body: plain,
      htmlBody: html,
      name: SITE_NAME
    });

    return jsonOut({ ok: true, sent_to: ADMIN_EMAIL, pen_name: penName });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

/** 브라우저로 주소를 열었을 때 '준비됐어요' 를 보여 줍니다. (배포 확인용) */
function doGet() {
  return ContentService
    .createTextOutput(SITE_NAME + ' 가입 알림이 준비됐어요.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/** 편집기에서 한 번 실행하면 실제 알림 메일이 한 통 옵니다. (배포 확인용) */
function testSend() {
  doPost({
    postData: {
      contents: JSON.stringify({
        type: 'new_signup',
        pen_name: '테스트필명',
        created_at: new Date().toISOString(),
        to: ADMIN_EMAIL
      })
    }
  });
}

/* -------------------------------------------------- 작은 도우미 */

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean_(value, max) {
  return String(value == null ? '' : value)
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max || 40);
}

function parseDate_(value) {
  var date = value ? new Date(value) : new Date();
  return isNaN(date.getTime()) ? new Date() : date;
}

/** 한국 시간(KST)으로 '2026년 11월 18일 (수) 오전 12:19' 처럼 보여 줍니다. */
function formatKst_(date) {
  var weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  var kst = new Date(date.getTime() + 9 * 60 * 60 * 1000); // UTC → KST
  var hour = kst.getUTCHours();
  var ampm = hour < 12 ? '오전' : '오후';
  var hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return kst.getUTCFullYear() + '년 ' + (kst.getUTCMonth() + 1) + '월 ' +
    kst.getUTCDate() + '일 (' + weekdays[kst.getUTCDay()] + ') ' +
    ampm + ' ' + hour12 + ':' + ('0' + kst.getUTCMinutes()).slice(-2);
}

function escape_(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
