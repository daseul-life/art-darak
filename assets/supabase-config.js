/* ============================================================
   아트다락방 — Supabase 연결 설정 + 새 필명 가입 알림 설정
   ------------------------------------------------------------
   아래 supabaseUrl / supabaseAnonKey 두 칸이 비어 있으면 '체험 모드'로 열립니다.
   체험 모드에서는 필명·작품·댓글이 이 브라우저(localStorage)에만 저장돼요.

   연결 방법 (자세한 순서는 README.md 참고)
   1) https://supabase.com 에서 새 프로젝트를 만듭니다. (무료)
   2) SQL Editor 에 supabase-schema.sql 내용을 붙여 넣고 실행합니다.
   3) Project Settings → API 에서 두 값을 복사해 아래에 넣습니다.
   4) 저장하고 페이지를 새로 고치면 'DB 연결됨'으로 바뀝니다.

   ※ anon public 키는 화면에 보여도 되는 공개용 키입니다.
     service_role 키는 절대 이 파일에 넣지 마세요.

   ── 새 필명 가입 알림 메일 (무료, 서버 0원) ─────────────────
   notifyWebhookUrl 에 Google Apps Script 웹앱 주소를 넣으면,
   새 필명이 가입할 때마다 notifyEmail 로 알림 메일이 갑니다.
   (notify-apps-script.gs 파일을 1분만에 배포하면 됩니다 — README '6번' 참고)

   · 주소를 비워 두면 알림을 보내지 않습니다. (가입은 평소처럼 됩니다)
   · 체험 모드(위 두 칸이 빈 상태)에서는 알림을 보내지 않습니다.
   ============================================================ */
window.DARAK_CONFIG = {
  supabaseUrl: '',      // 예: 'https://abcdefghijkl.supabase.co'
  supabaseAnonKey: '',  // 예: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

  // 작품 사진을 올릴 저장소(Storage) 이름 — supabase-schema.sql 이 만들어 둡니다.
  storageBucket: 'artworks',

  // 새 필명 가입 알림 — Apps Script 웹앱 주소(/exec 로 끝납니다)를 넣어 주세요.
  notifyWebhookUrl: '',          // 예: 'https://script.google.com/macros/s/AKfycb.../exec'
  notifyEmail: 'aa95925551@gmail.com',  // 알림을 받을 관리자 메일

  // 체험 모드(Supabase 미연결)에서 가입해도 알림을 받고 싶으면 true 로 바꿉니다.
  // 기본 false — 진짜 회원이 들어오는 DB 모드에서만 메일이 갑니다.
  notifyInTrialMode: false
};
