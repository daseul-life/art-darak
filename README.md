# 아트다락방 (ART DARAK) — 1단계 완성본

문학·미술·음악·사진·공예·디자인을 가리지 않는 창작 커뮤니티의 **1단계 웹앱**입니다.
순수 HTML/CSS/JS로 만들어져서 빌드 없이 바로 열 수 있고, 무료 Supabase를 붙이면 실제 회원·작품·감상이 저장됩니다.
Supabase가 없어도 이 브라우저(localStorage)에서 가입·작품 등록·감상이 모두 동작합니다.

화면 전체는 **포근한 파스텔 핑크(로즈밀크 · 벚꽃 · 블러쉬)** 톤으로 맞춰져 있습니다.
진한 핫핑크나 형광 핑크는 쓰지 않고, 눈이 편한 낮은 채도만 씁니다.

---

## 1. 지금 바로 써 보기

1. `index.html` 을 브라우저로 엽니다.
2. 오른쪽 위 **필명으로 시작** → 필명과 비밀번호(6자 이상)를 정합니다.
3. **작품 등록** 에서 제목·분야·단계·소개·사진을 넣고 “다락방에 걸기”를 누릅니다.
4. 작품 화면 아래에서 **감상(댓글)** 을 남겨 봅니다.
5. **내 다락방** 에서 내 작품·받은 감상을 보고, **다락방 사무실**(벽지 6색 · 큰 창밖 풍경 4종 · 작업실 분위기 4종 · 소품 17종)을 꾸며 봅니다.
   다른 필명의 작품에서 필명을 누르면 그 사람의 다락방(`darakbang.html?pen=필명`)도 구경할 수 있습니다.
6. **관리자**(`admin.html`)에서 공지를 쓰면 홈 맨 위 띠에 나타납니다.

> 체험 모드에서는 위쪽에 “체험 모드 · 이 브라우저에만 저장돼요” 띠가 보입니다.
> Supabase를 연결하면 이 띠가 사라지고 모두에게 보이는 데이터가 됩니다.

휴대폰에서 앱처럼 쓰려면: 크롬으로 사이트를 연 뒤 **⋮ → 홈 화면에 추가**. (PWA, 비용 0원)

---

## 2. Supabase 연결 (무료, 5분)

1. <https://supabase.com> 에서 새 프로젝트를 만듭니다.
2. **SQL Editor → New query** 에 `supabase-schema.sql` 전체를 붙여 넣고 **RUN**.
   - 테이블: `profiles`, `artworks`, `comments`, `notices`
   - Storage 버킷: `artworks` (작품 사진, 공개 읽기 / 로그인한 사람만 자기 폴더에 업로드)
   - 예시 작품 12점과 환영 공지가 함께 들어갑니다.
3. **Authentication → Providers → Email** 에서 **Confirm email 을 꺼 주세요.**
   - 아트다락방은 이메일 없이 필명으로만 가입하기 때문에, 켜져 있으면 로그인이 되지 않습니다.
4. **Project Settings → API** 의 `Project URL` 과 `anon public` 키를 복사해
   `assets/supabase-config.js` 에 넣습니다.

```js
window.DARAK_CONFIG = {
  supabaseUrl: 'https://내프로젝트.supabase.co',
  supabaseAnonKey: 'eyJhbGciOi...',
  storageBucket: 'artworks',
  notifyWebhookUrl: '',                       // 3번에서 설명 (가입 알림)
  notifyEmail: 'aa95925551@gmail.com',        // 알림 받을 관리자 메일
  notifyInTrialMode: false                    // 체험 모드 가입도 알림 받으려면 true
};
```

5. 사이트를 새로 고칩니다. 위쪽 체험 모드 띠가 사라지면 연결된 것입니다.

### 필명 로그인은 어떻게 동작하나요?

Supabase Auth는 이메일을 요구하므로, 필명을 **정해진 규칙으로 이메일 모양으로 바꿔** 가입시킵니다.
(예: `달빛우물` → `p1a2b3c4d5@artdarak.example`) 이 주소로는 메일을 주고받지 않고, 비밀번호는 Supabase Auth가 안전하게 보관합니다.
그래서 화면에서는 **필명 + 비밀번호** 두 칸만 쓰면 됩니다.

- 비밀번호를 잊으면 같은 필명으로 다시 들어올 수 없습니다. (이메일 재설정을 붙이면 해결 — 다음 단계)
- 필명은 2~12자, 비밀번호는 6자 이상, 중복은 가입할 때 확인합니다.

### 첫 관리자 만들기

SQL Editor에서 한 번만 실행하세요.

```sql
update public.profiles
   set is_admin = true
 where lower(pen_name) = lower('내 필명');
```

---

## 3. 새 필명 가입 알림 메일 (무료, 1분)

**새 필명이 가입하면 `aa95925551@gmail.com` 으로 알림 메일이 옵니다.**
서버도, 결제도 필요 없습니다. 구글 계정에 딸린 Apps Script 무료 한도 안에서만 돌아갑니다.

### 준비 (한 번만)

1. `aa95925551@gmail.com` 으로 로그인한 브라우저에서 <https://script.google.com> → **새 프로젝트**.
2. 왼쪽 `Code.gs` 내용을 모두 지우고 **`notify-apps-script.gs` 파일 내용 전체**를 붙여 넣습니다.
3. **저장** → **배포** → **새 배포**
   - 유형: **웹 앱**
   - 다음 사용자로 실행: **나 (aa95925551@gmail.com)**
   - 액세스 권한이 있는 사용자: **모든 사용자**
   - **배포** → 권한 확인(계정 선택 → 고급 → 이동 → 허용)
4. 나오는 **웹 앱 URL**(`.../exec` 로 끝납니다)을 복사해
   `assets/supabase-config.js` 의 `notifyWebhookUrl` 에 붙여 넣고 저장합니다.

```js
notifyWebhookUrl: 'https://script.google.com/macros/s/AKfycb..../exec',
notifyEmail: 'aa95925551@gmail.com'
```

### 잘 되는지 확인

- 그 URL을 브라우저에 그대로 열어 보세요. **“아트다락방 가입 알림이 준비됐어요”** 가 보이면 배포 성공입니다.
- Apps Script 편집기에서 `testSend()` 를 한 번 실행하면 실제 메일이 한 통 옵니다.
- 사이트에서 새 필명으로 가입해 보면 몇 초 안에 메일이 옵니다.

### 어떻게 동작하나요

- 가입이 **끝난 직후** `assets/app.js` 가 `notifyWebhookUrl` 로 아래 내용을 POST 합니다.
  (브라우저가 미리 확인(Preflight)을 하지 않도록 `Content-Type: text/plain` 으로 보내고, 내용은 JSON 그대로입니다)

```json
{ "type": "new_signup", "pen_name": "달빛우물", "created_at": "2026-11-18T03:20:00.000Z", "to": "aa95925551@gmail.com" }
```

- Apps Script가 `MailApp.sendEmail` 로 제목 `[아트다락방] 새 필명 가입: {필명}` 메일을 보냅니다.
  본문에는 필명과 한국 시간 가입 시각이 들어갑니다.
- **체험 모드(Supabase 미연결)에서는 보내지 않습니다.** 브라우저에만 남는 연습용 가입이라 알림이 쌓이면 방해가 됩니다.
  DB를 붙이기 전에도 알림을 받고 싶으면 `notifyInTrialMode: true` 로 바꾸면 됩니다. (기본값 false)
- `notifyWebhookUrl` 이 비어 있으면 아무것도 하지 않습니다.
- 알림 전송이 실패해도 **가입은 그대로 진행됩니다.** (오류는 조용히 콘솔에만 남습니다)
- 웹앱 주소는 공개 주소라서, 스크립트는 요청에 담긴 `to` 값을 무시하고 **항상 관리자 메일로만** 보냅니다.
  (그 값을 그대로 쓰면 엉뚱한 곳으로 메일이 갈 수 있습니다)
- 무료 한도: Apps Script는 하루 실행 횟수·메일 발송량 한도가 넉넉합니다. (개인 Gmail 기준 하루 수백 통)

> 나중에 알림을 끄고 싶으면 `notifyWebhookUrl` 만 비워 두면 됩니다.

---

## 4. 관리자 화면 (`admin.html`)

| 탭 | 할 수 있는 일 |
|---|---|
| 공지사항 | 홈 맨 위 공지 띠에 보일 글을 쓰고, 공개/숨김, 수정, 삭제 |
| 작품 관리 | **오늘의 작품(추천)** 지정·해제, 부적절한 작품 **숨김**(올린 사람에게만 ‘관리자 숨김’으로 보임), **삭제** |
| 감상 관리 | 모든 댓글을 최신순으로 보고 삭제 |
| 회원 관리 | 필명·가입일·작품 수·감상 수 확인, **다락방 잠그기**(작품·감상 비공개), 관리자 지정 |

- **체험 모드(DB 미연결)**: 체험용 비밀번호 `artdarak` 또는 **“비밀번호 없이 미리 보기”** 로 들어갑니다.
  여기서 고친 내용은 이 브라우저에만 저장되므로, 실제 서비스 전 미리보기용입니다.
- **DB 연결 모드**: `profiles.is_admin = true` 인 필명만 들어올 수 있습니다.
  화면에서 막는 것과 별개로, Supabase RLS 정책이 관리자가 아니면 추천·숨김·남의 글 삭제를 실제로 거부합니다.

> 계정 자체를 지우려면 Supabase **Authentication → Users** 에서 지우면 됩니다.
> (브라우저에서 남의 계정을 지우는 것은 안전상 막아 두었습니다.)

---

## 5. 1단계에서 되는 것

- **홈**: 짧은 소개 히어로 → 바로 아래 **오늘의 작품**(추천 작품 우선) → 분야별 둘러보기 → 가치 → 입주 안내
- **필명 가입·로그인**: 필명 + 비밀번호, 로그인 상태 유지, 다락방 나가기
- **가입 알림**: 새 필명이 가입하면 관리자 메일로 알림 (3번)
- **작품 등록**: 제목 · 분야 · 상태 배지(완성/과정 공개/첫 도전) · 소개 · **사진 파일**(최대 1200px로 자동 축소) 또는 이미지 주소 · 작품 링크
- **갤러리**: 분야·상태 필터, 검색(작품명·필명), 정렬(최신·마음·감상·가나다)
- **작품 보기**: 작품 소개, 작품 링크, 마음(♡), **감상(댓글) 작성·삭제**, 내 작품이면 삭제
- **내 다락방**: 필명·소개·분야, 작품/받은 감상/받은 마음/함께한 날, 대표 작품, 프로필 꾸미기
- **다락방 사무실**: 벽지 6색 + 큰 창밖 풍경 4종(기본 · 일출 · 일몰 · 바다) + 작업실 분위기 4종(창가 서재 · 햇살 화실 · 별빛 작업실 · 아늑한 공방) + 소품 17종(이젤, 책상·노트북, 스탠드, 기타, 화분, 찻잔, 전구 가랜드, 고양이 방석, 책 더미, 레코드판, 커피머신, 빈백 소파, 캔들 워머, 디저트 트레이, 엽서·사진 보드, 강아지 쿠션, 필름 카메라)을 누르면 방 그림에 바로 반영
- **큰 창밖 풍경**: 방 뒤쪽 아치 창을 예전(가로 200 · 세로 150)보다 크게(가로 256 · 세로 224) 키우고, 꾸미기 판의 **큰 창밖 풍경**에서 **기본(분위기에 맞춘 창) · 일출 · 일몰 · 바다**를 고릅니다. 일출은 떠오르는 해와 빛살·구름이, 일몰은 지는 해와 붉은 노을·새가, 바다는 잔물결·윤슬·작은 돛단배가 천천히 움직입니다(움직임은 `prefers-reduced-motion` 에서 멈춤). 고른 풍경은 `profiles.attic_props.view` 에 `sunrise`·`sunset`·`ocean` 으로 저장되고, 기본으로 두면 키 없이 예전 저장 값과 같은 모양입니다.
- **커피머신·캔들 모션**: 커피머신에서는 김이 모락모락 올라오고, 창턱의 캔들 워머는 불빛이 은은하게 흔들립니다.
- **다락방 캐릭터 · 성별**: 가입 창과 `내 다락방` 꾸미기 판·프로필 꾸미기에서 **사진 캐릭터 6명**(여성 3 · 남성 3, `전체 / 여성 / 남성` 칩으로 골라 보기)과 **'글자 기본'**(필명 첫 글자) 중 하나를 고르고, 성별(여성 · 남성 · 선택 안 함)도 함께 저장합니다. 고른 사진은 내 다락방 프로필·상단 버튼·이름 옆 칭호·다른 사람이 보는 다락방(`?pen=`)에 그대로 보입니다. 카드에는 사람 이름 대신 **칭호**만 적습니다.
- **방 안 캐릭터**: 고른 캐릭터 한 명이 다락방 사무실 러그 옆에 동화풍 미니어처로 서 있습니다(머리 모양·옷차림·든 소품이 사람마다 다름). 방 안 캐릭터를 터치/클릭하거나 Enter·Space로 부르면 통통 튀며 고개를 갸웃하는 1.2초 애니메이션과 함께 ✦·♡ 반짝임이 떠오르고, 성향에 맞는 짧은 문구 3개가 돌아가며 2.5초 pink 말풍선으로 뜹니다. '글자 기본'이면 방에 캐릭터가 없고, 다른 사람 다락방(`?pen=`)에서도 똑같이 움직입니다.
- **캐릭터 자세 · 움직임**: 꾸미기 판의 **캐릭터 자세**에서 **서기(기본) · 앉기 · 작업하기 · 명상하기**를 고릅니다. 열둘(여6·남6) 캐릭터마다 네 자세 그림이 있어, 앉기는 러그에 기대 앉아 쉬고, 작업하기는 무릎을 세우고 손에 든 붓·펜·기타·실로 작업하며, 명상하기는 눈을 감고 가부좌로 숨을 곱니다(그 앞에 자기 도구를 내려놓음). 자세마다 다른 은은한 움직임이 붙습니다 — 서기는 잔잔한 숨쉬기, 앉기는 천천히 기우는 흔들림, 작업하기는 집중하는 잔근질, 명상하기는 느린 호흡과 함께 번지는 빛무리·떠오르는 빛알갱이(`prefers-reduced-motion` 에서는 모두 정지). 고른 자세는 `profiles.attic_props.pose` 에 `sit`·`work`·`meditate` 로 저장되고, 서기(기본)면 키 없이 예전 저장 값과 같습니다. 방문자(`?pen=`) 화면에도 주인이 고른 자세와 움직임이 그대로 보입니다.
- **다락방 숨 고르기 (1분 · 3분 명상)**: 다락방 사무실 그림 바로 아래의 **🕯️ 작업 전 숨 고르기** 카드를 누르면 명상 창이 열립니다. **1분(가볍게) / 3분(차분히)** 중에 고르고 시작을 누르면, 로즈밀크 빛망울이 **들이쉬기 4초 → 멈추기 2초 → 내쉬기 4초** 리듬에 맞춰 천천히 커졌다 작아지고, 그 앞의 촛불과 함께 단계 안내·남은 시간이 보입니다. 언제든 **잠시 멈춤 / 이어하기 / 그만하기**가 되고, 다 채우면 *“이제 가벼운 마음으로 한 줄이나 한 획을 시작해 볼까요?”* 한 마디가 뜹니다. 방 주인은 물론 `?pen=`으로 찾아온 방문자도 쓸 수 있고, 다락방 설정(`attic_props`)은 건드리지 않습니다.
- **다른 다락방 구경**: `darakbang.html?pen=필명` — 그 사람이 꾸민 방과 작품이 보이고, 꾸미기 도구는 주인에게만 보입니다
- **관리자**: 공지 · 작품 추천/숨김/삭제 · 감상 삭제 · 회원 잠금
- **PWA**: `manifest.json`, 아이콘(192/512/maskable/애플터치/파비콘), 서비스 워커(오프라인에서도 마지막 화면)
- **디자인**: 전체 파스텔 핑크 톤 (바탕·카드·상단 바·버튼·포인트·앱 아이콘·테마 색)
- **저장 위치**: Supabase 연결 시 클라우드, 미연결 시 localStorage(같은 브라우저에서만)

### 아직 없는 것 (2·3단계)

창작 일지, 창작자 둘러보기, 커뮤니티, 팔로우, 방명록,
마음(♡)의 서버 저장 — 지금은 기기(브라우저)에만 기억됩니다.

---

## 6. 파일 구조

```
art-darak/v1/
├─ index.html            홈 (짧은 히어로 + 오늘의 작품)
├─ gallery.html          갤러리 (필터·검색·정렬)
├─ work.html             작품 보기 + 감상(댓글)
├─ register.html         작품 등록 (사진 자동 축소)
├─ darakbang.html        내 다락방 (다락방 사무실 · 벽지/분위기/소품)
├─ admin.html            관리자 화면
├─ soon.html             2단계 예고 (창작자·커뮤니티)
├─ manifest.json         PWA 설정 (theme_color·background_color = #FDF2F3)
├─ sw.js                 서비스 워커 (오프라인)
├─ notify-apps-script.gs 새 필명 가입 알림 메일 (Google Apps Script — 3번)
├─ favicon.ico
├─ images/
│   ├─ icon-192.png  icon-512.png  icon-maskable-512.png  apple-touch-icon.png
│   ├─ avatars/          다락방 캐릭터 사진 6장 (340×340 webp)
│   └─ (기존 참고 그림 gallery.png, hero*.png — 톤 기준으로 보관)
├─ assets/
│   ├─ styles.css        공통 디자인 (색·그림자·모양 모두 변수)
│   ├─ app.js            화면 동작 (가입·등록·감상·다락방·가입 알림)
│   ├─ store.js          저장소 (Supabase ↔ localStorage)
│   ├─ seed.js           처음 보여 줄 예시 작품 12점
│   ├─ supabase-config.js  ← Supabase 주소·키, 알림 메일 설정을 넣는 곳
│   └─ admin.js          관리자 화면
├─ supabase-schema.sql   Supabase에 붙여 넣을 스키마
└─ screenshots/          화면 미리보기
```

---

## 7. 디자인 기준 (파스텔 핑크)

- 글꼴: **Gowun Dodum**(본문) · **Gowun Batang**(제목) — 둘 다 구글 무료 글꼴
- 바탕: 로즈밀크 `#FDF2F3` · 카드 `#FFFAFB` · 벚꽃 핑크 `#F3D6DD` · 다스티 로즈(포인트) `#C88B96` · 모브 `#AF84A0`
- 글자: 본문 `#4A3239` · 보조 `#7A5F66` · 작은 안내 `#8A6D74` (핑크 바탕 위에서도 읽히도록 대비 확인)
- 버튼: `#F9DAE2 → #F0CAD9 → #E9C3D4` 그라디언트, 글자는 진한 플럼
- 분야 색(그대로 유지): 문학 `#EBCBCB` · 미술 `#D8CEE3` · 음악 `#C9DCE4` · 사진 `#CBDCCB` · 공예 `#EAD2B3` · 디자인 `#EADFB4`
- 따뜻한 금색(`#EAD3A4`)은 별빛과 추천 배지에만 아주 조금 남겼습니다.
- 다락방 그림(홈 히어로)은 **벽·바닥은 핑크**, 나무 선반·기타·이젤은 원래 나무색을 남겨 대비를 줍니다.
- 모든 색은 `assets/styles.css` 맨 위 **디자인 토큰**(`:root`)에서 바꿀 수 있습니다.
- 각 HTML의 `<meta name="theme-color">`, `manifest.json` 의 `theme_color`·`background_color` 도 `#FDF2F3` 로 통일했습니다.

---

## 8. 확인한 것 (2026-11-18)

헤드리스 크롬(390×844 모바일 / 1440×900 데스크톱)으로 직접 눌러 확인했습니다.

- **기존 동작 테스트 61개 항목 모두 통과, JS 오류 0건** (`art-darak/_build/test_app.py`)
- **다락방 사무실 테스트 55개 항목 모두 통과, JS 오류 0건** (`art-darak/_build/test_studio.py`)
  - 분위기 4종 · 소품 17종 · 벽지 6색 · 창밖 풍경 4종이 그림에 바로 반영되고, 분위기/소품/벽지/풍경이 새로 고침 후에도 유지
  - `profiles.attic_props` 에 `{ mood, props, view?, pose? }` 로 저장 (예전 배열 `['easel']` 값, `view`·`pose` 없는 값도 안전하게 읽음)
  - `?pen=` 다른 다락방: 그 사람의 방·작품이 보이고 꾸미기 도구는 숨김, 로그인 없이도 구경 가능
  - 모바일(390×844) 스크린샷: `screenshots/pink-darakbang-studio-mobile.png`
- **캐릭터·성별 테스트 66개 항목 모두 통과, JS 오류 0건** (`art-darak/_build/test_avatar.py`)
  - 가입 창·프로필 꾸미기·꾸미기 판에서 캐릭터 카드 6장 + '글자 기본', `전체 / 여성 / 남성` 필터가 성별대로 걸러 냄
  - 고른 캐릭터·성별이 `profiles.attic_props` 의 `avatar` · `gender` 로 저장되고 새로 고침 후에도 유지
  - 프로필 사진 · 상단 버튼 · 이름 옆 칭호 · 성별 태그 · `?pen=` 다른 다락방에 그대로 표시
  - 카드·배지 어디에도 캐릭터 이름이 새지 않고 칭호만 보임
  - 모바일(390×844) 스크린샷: `screenshots/pink-avatar-picker-mobile.png` · `pink-avatar-applied-mobile.png`
- **방 안 캐릭터 테스트 49개 항목 모두 통과, JS 오류 0건** (`art-darak/_build/test_room_char.py`)
  - 6명이 각각 방 안에 한 명만 서고, '글자 기본'이면 방에 아무도 없음
  - 누르면 움직임 클래스(is-greet) + ✦ · ♡ 반짝임 + 2.5초 말풍선, 문구 3개가 돌아가며 바뀌고 Enter·Space도 동작
  - `?pen=` 다른 다락방에서도 그 사람 캐릭터가 서고 터치하면 똑같이 움직임
  - 화면·alt·aria-label 어디에도 캐릭터 이름(서윤·해밀·이안·모모·하온·도윤)이 새지 않음
  - 모바일(390×844) 스크린샷: `screenshots/pink-room-character-mobile.png`
- **캐릭터 자세 테스트 49개 항목 모두 통과, JS 오류 0건** (`art-darak-char/_prev/test_character_pose.py`)
  - 자세 칩 4개(서기 · 앉기 · 작업하기 · 명상하기)가 꾸미기 판에 있고, 고르면 방 안 그림(href)이 그 자세 파일로 바뀜
  - 서기는 기본이라 `attic_props` 에 키가 없고, 나머지는 `pose` 로 저장·복원 — 새로 고침·프로필 저장 후에도 유지
  - 열두 캐릭터 × 세 자세(36장) 그림이 모두 서빙되고, 캐릭터를 바꿔도 그 캐릭터의 같은 자세로 바뀜
  - `?pen=` 방문자 화면에도 주인이 고른 자세와 모션이 그대로, 꾸미기 판은 숨김
  - 명상에는 빛무리(aura)가 함께 보이고, 자세별 모션은 `prefers-reduced-motion` 에서 모두 멈춤
  - 캐릭터 이름이 화면·alt·aria-label 어디에도 새지 않음
  - 모바일(390px) 스크린샷: `screenshots/character-pose-sit-mobile.png` · `character-pose-work-mobile.png` · `character-pose-meditate-mobile.png`
- **숨 고르기(1분·3분 명상) 테스트 67개 항목 모두 통과, JS 오류 0건** (`art-darak/_build/test_calm.py`)
  - 사무실 그림 바로 아래 카드가 본인·방문자(`?pen=`) 모두에게 보이고, 누르면 명상 창이 열림
  - 1분(가볍게) / 3분(차분히) 선택에 따라 남은 시간이 `1:00` · `3:00` 으로 바뀜
  - 시작하면 빛망울이 **들이쉬기 4초(작게→크게) → 멈추기 2초(가장 큼) → 내쉬기 4초(크게→작게)** 로 움직이고 남은 시간이 줄어듦
  - **잠시 멈춤**을 누르면 시간·빛망울이 그대로 멈추고, **이어하기**로 다시 흐름 / **그만하기**는 처음 상태로
  - 1분·3분을 끝까지 채우면 *“이제 가벼운 마음으로 한 줄이나 한 획을 시작해 볼까요?”* 와 함께 ‘한 번 더 하기’로 바뀜
  - Esc · ✕ · 바깥 누르기로 닫히고 화면 잠금도 풀림
  - 명상을 써도 `attic_props`·프로필·저장소 키가 **전혀 바뀌지 않음** (본인·방문자 모두)
  - 명상 중에도 캐릭터 이름이 화면·alt·aria-label 어디에도 새지 않음
  - 모바일(390×844) 스크린샷: `screenshots/pink-meditation-mobile.png`
- **가입 알림 테스트 38개 항목 모두 통과** (`art-darak/_build/test_notify.py`)
  - 체험 모드 가입에는 알림을 보내지 않음
  - 알림 내용이 `{type, pen_name, created_at, to}` 로 정확히 전송됨 (POST · text/plain)
  - 웹훅이 죽어 있어도 가입 화면에 오류가 나지 않음
  - **DB(Supabase) 모드로 가입을 끝내면 알림이 자동으로 나감** (가짜 Supabase로 가입 흐름을 돌려 확인)
  - `notifyInTrialMode: true` 로 켜면 체험 모드 가입도 알림이 나감
  - Apps Script 코드: 제목 `[아트다락방] 새 필명 가입: {필명}` · 한국 시간 표기 · 요청의 `to` 무시 · HTML 이스케이프

> 실제 Apps Script 배포와 실제 메일 수신은 다슬님 구글 계정에서 배포한 뒤에 확인할 수 있습니다.
> (배포 주소를 `notifyWebhookUrl` 에 넣고, 브라우저로 그 주소를 열어 “준비됐어요”가 나오는지 보면 됩니다)

기존 61개 항목이 확인하는 것:

- 필명 가입 → 새로 고침 후에도 로그인 유지 / 로그아웃 → 다시 로그인
- 틀린 비밀번호 안내, 중복 필명 막기
- 사진 파일 선택 → 1200px·700KB 이하로 자동 축소 → 등록 → 작품·갤러리·홈·내 다락방에 표시
- 감상 작성 → 작품 카드의 감상 수 반영 → 내 다락방 “받은 감상”에 표시
- 마음(♡) 누르기 · 새로 고침 후에도 유지
- 관리자: 공지 저장 → 홈 상단 띠 표시 / 공개 끄면 띠 사라짐 / 추천 지정 → 홈 맨 앞 / 숨김 → 갤러리에서 제외
- 모바일 메뉴, 분야·상태 필터, 검색, 정렬, 벽지 6색 전환
- PWA: manifest 연결, 서비스 워커 등록, 아이콘 3종 로드
- `index.html` 을 파일로 직접 열어도(file://) 가입·등록이 동작
- 처음 온 사람이 작품 등록 화면에서 바로 가입 → 등록까지 이어지는 흐름
- 없는 작품 주소로 들어왔을 때 안내 화면

### 스크린샷 (파스텔 핑크 적용 후)

| 파일 | 화면 |
|---|---|
| `screenshots/pink-home-mobile.png` · `pink-home-mobile-full.png` | 홈 (모바일 첫 화면 / 전체) |
| `screenshots/pink-darakbang-mobile.png` · `pink-darakbang-mobile-full.png` | 내 다락방 (모바일) |
| `screenshots/pink-darakbang-studio-mobile.png` · `pink-darakbang-studio-mobile-full.png` | 다락방 사무실 (모바일 · 소품 켠 상태) |
| `screenshots/window-view-sunrise-mobile.png` | 큰 창 · 일출 (모바일 390px · 새 소품 배치) |
| `screenshots/window-view-sunset-mobile.png` | 큰 창 · 일몰 (모바일 390px · 새 소품 배치) |
| `screenshots/window-view-ocean-mobile.png` | 큰 창 · 바다 (모바일 390px · 새 소품 배치) |
| `screenshots/window-view-new-props-mobile.png` | 새 소품 7종을 놓은 방 (모바일 390px) |
| `screenshots/character-pose-sit-mobile.png` · `character-pose-sit-room-mobile.png` | 캐릭터 **앉기** — 러그에 기대 앉은 모습 (모바일 390px / 방 그림) |
| `screenshots/character-pose-work-mobile.png` · `character-pose-work-room-mobile.png` | 캐릭터 **작업하기** — 무릎 세우고 노트에 쓰는 모습 (모바일 390px / 방 그림) |
| `screenshots/character-pose-meditate-mobile.png` · `character-pose-meditate-room-mobile.png` | 캐릭터 **명상하기** — 가부좌·빛무리 (모바일 390px / 방 그림) |
| `screenshots/character-pose-visitor-work-mobile.png` | 방문자 화면에서도 주인 자세(작업하기) 그대로 |
| `screenshots/character-pose-sit-desktop.png` | 앉기 자세 (데스크톱) |
| `screenshots/pink-darakbang-studio-mobile-empty.png` | 다락방 사무실 처음 모습 (소품 없이) |
| `screenshots/pink-darakbang-studio-visitor-mobile.png` | 다른 사람 다락방 구경 (모바일) |
| `screenshots/pink-darakbang-studio-desktop.png` | 다락방 사무실 (데스크톱) |
| `screenshots/pink-avatar-picker-mobile.png` | 다락방 캐릭터 고르기 (모바일) |
| `screenshots/pink-avatar-applied-mobile.png` | 고른 캐릭터가 적용된 내 다락방 (모바일) |
| `screenshots/pink-avatar-picker-desktop.png` | 다락방 캐릭터 고르기 (데스크톱) |
| `screenshots/pink-room-character-mobile.png` | 방 안 캐릭터가 인사하는 모습 — 말풍선 · 반짝임 (모바일) |
| `screenshots/pink-meditation-mobile.png` | 숨 고르기 명상 — 빛망울이 부푼 ‘멈추기’ 순간 (모바일) |
| `screenshots/pink-meditation-card-mobile.png` | 사무실 그림 아래의 🕯️ 작업 전 숨 고르기 카드 (모바일) |
| `screenshots/pink-meditation-desktop.png` | 숨 고르기 명상 창 (데스크톱) |
| `screenshots/pink-admin-mobile.png` · `pink-admin-mobile-full.png` · `pink-admin-gate-mobile.png` | 관리자 (모바일 · 입구) |
| `screenshots/pink-gallery-mobile.png` · `pink-work-mobile.png` · `pink-register-mobile.png` | 갤러리 · 작품 보기 · 작품 등록 |
| `screenshots/pink-home-desktop-top.png` · `pink-home-desktop-full.png` | 홈 (데스크톱) |
| `screenshots/v2-*.png` | 같은 화면의 이전 이름 파일 (동작 테스트가 함께 갱신) |
| `screenshots/previous/` | 1단계 시안 때 찍은 화면 (비교용 보관) |
