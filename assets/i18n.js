/* ART DARAK · Korean / English UI language switcher
 * This file intentionally does not modify app.js, store.js, or page HTML.
 * To activate it, each page must load this file with:
 * <script src="assets/i18n.js"></script>
 */
(() => {
  "use strict";

  const STORAGE_KEY = "artdarak_lang";
  const DEFAULT_LANG = "ko";
  const LANGS = new Set(["ko", "en"]);

  const DICT = {
    "아트다락방에 오신 걸 환영합니다.": "Welcome to ART DARAK.",
    "오늘은 어떤 작품을": "What would you like to",
    "만들어 볼까요?": "create today?",
    "완성된 작품만이 아니라, 그 작품이 나오기까지의 과정도 함께 모으는 곳이에요.": "A place to share not only finished works, but also the process behind them.",
    "필명 하나면 시작할 수 있고, 잘 그리지 못해도 괜찮습니다.": "All you need is a pen name to begin. You don't have to be an expert.",
    "당신의 창작으로 모든 것이 만들어지는 곳.": "A place shaped by your creativity.",
    "갤러리 둘러보기": "Explore the Gallery",
    "입주하기": "Join ART DARAK",
    "가입": "Join",
    "지금 걸린 작품": "Works on display",
    "점": " works",
    "참여한 필명": "Creators",
    "명": " people",
    "모든 기능 무료": "Everything is free",
    "오늘의 작품": "Featured Works",
    "지금 다락방에 걸린 작품들": "Works on Display",
    "관리자가 고른 추천 작품과 새로 걸린 작품을 먼저 보여 드려요. 카드를 누르면 작품 소개와 감상이 이어집니다.": "Discover featured and newly added works. Select a card to read about the work and leave your thoughts.",
    "갤러리 전체 보기": "View All Works",
    "아직 걸린 작품이 없어요.": "There are no works on display yet.",
    "첫 번째 작품의 주인이 되어 보세요.": "Be the first to share your work.",
    "첫 작품 걸기": "Share Your First Work",
    "분야별 둘러보기": "Explore by Category",
    "어떤 다락방부터 열어 볼까요?": "Which creative room would you like to explore?",
    "분야를 가리지 않고 모으는 곳이라, 오늘은 글이고 내일은 도자가 되는 일이 자연스러워요.": "Every creative field belongs here. Today it may be writing; tomorrow, pottery.",
    "분야별로 보기": "Browse Categories",
    "문학": "Literature",
    "미술": "Visual Arts",
    "음악": "Music",
    "사진": "Photography",
    "공예": "Crafts",
    "디자인": "Design",
    "홈": "Home",
    "갤러리": "Gallery",
    "작품 등록": "Submit Work",
    "창작 일지": "Creative Journal",
    "공동 작업실": "Collaboration Studio",
    "내 다락방": "My Attic",
    "메뉴": "Menu",
    "가입·로그인": "Sign in",
    "필명으로 가입하거나 로그인하기": "Sign up or sign in with a pen name",
    "공지": "Notice",
    "공지 닫기": "Close notice",
    "둘러보기": "Explore",
    "운영 안내": "Information",
    "관리자": "Admin",
    "당신의 창작으로 모든 것이 만들어지는 곳.": "A place shaped by your creativity.",
    "문학 · 미술 · 음악 · 사진 · 공예 · 디자인을 가리지 않는 창작 커뮤니티.": "A creative community for literature, visual arts, music, photography, crafts, and design.",
    "광고가 아니라 작품으로 운영되는 곳을 목표로 합니다": "Built around creativity, not advertising.",
    "페이지를 찾을 수 없어요.": "Page not found.",
    "홈으로 돌아가기": "Back to Home",
    "체험 모드 · 지금 남긴 필명과 작품은 이 브라우저에만 저장돼요": "Guest mode · Your pen name and works are saved only in this browser.",
    "작품": "Work",
    "감상": "Comments",
    "이 작품에 남겨진 말": "Thoughts on This Work",
    "필명으로 짧게 남겨 주세요. 잘 쓰지 않아도, 한 줄이어도 괜찮아요.": "Leave a short note under your pen name. A single line is more than enough.",
    "다음 작품": "What's Next",
    "다른 다락방의 작품도 둘러볼까요?": "Explore works from other creative rooms",
    "이 작품이 마음에 들었다면, 같은 분야의 다른 작품도 금방 눈에 들어올 거예요.": "If you enjoyed this work, you may find something else you love in the same category.",
    "갤러리로 가기": "Go to Gallery",
    "혼자 막힌 자리에는 다른 사람의 한마디가 잘 어울립니다. 피드백을 청하거나, 함께 만들 사람을 불러 보세요.": "A fresh perspective can help when you're stuck. Ask for feedback or find someone to create with.",
    "공동 작업실을 준비하고 있어요. 조금 뒤에 다시 열어 주세요.": "The Collaboration Studio is getting ready. Please check back soon.",
    "필명으로 시작하면 글을 올릴 수 있어요": "Choose a pen name to start posting",
    "모집 글과 피드백 요청은 필명으로 남깁니다. 읽는 것은 가입하지 않아도 괜찮아요.": "Posts and feedback requests are shared under your pen name. You can browse without signing up.",
    "필명 정하기": "Choose a Pen Name",
    "필명": "Pen name",
    "님으로 올립니다": " is posting",
    "제목": "Title",
    "분야": "Category",
    "어떤 글인가요?": "What kind of post is this?",
    "피드백 요청": "Feedback Request",
    "미완성 작품에 의견을 듣고 싶어요": "I'd like feedback on a work in progress",
    "함께 작업": "Collaboration",
    "같이 만들 창작자를 찾아요": "I'm looking for a creative partner",
    "내용": "Description",
    "어떤 작업을 하고 있고, 어떤 도움이 필요한지 적어 주세요.": "Describe what you're working on and what kind of help you need.",
    "작품·참고 링크": "Work / Reference Link",
    "선택": "Optional",
    "글 올리기": "Publish Post",
    "모집 글은 '열림'으로 시작하고, 다 모이면 직접 '마감'으로 바꿀 수 있어요.": "Posts start as Open. You can change the status to Closed when you've found collaborators.",
    "지금 함께하는 자리": "Open Calls",
    "글 종류": "Post Type",
    "전체": "All",
    "개의 글": " posts",
    "아직 올라온 글이 없어요.": "There are no posts yet.",
    "첫 모집 글을 남겨 보세요.": "Be the first to post an invitation.",
    "오늘의 과정": "Today's Process",
    "만드는 사이의 생각도 남겨 두세요": "Keep a record of the thoughts behind your work",
    "창작 일지에 오늘의 기록을 남기면, 다음에 이어 갈 실마리가 됩니다.": "A note in your Creative Journal today can help you pick up where you left off tomorrow.",
    "창작 일지 보기": "View Creative Journal",
    "필명 하나로 시작하는 나만의 방. 작품과 소개, 그리고 찾아온 사람들이 남긴 말이 함께 쌓입니다.": "Your own room, starting with a pen name. Gather your works, introduction, and messages from visitors.",
    "아직 다락방 문이 닫혀 있어요": "Your creative room is not open yet",
    "필명 하나만 정하면 바로 내 방이 열립니다. 이메일 없이, 실력이나 경력도 묻지 않아요.": "Choose a pen name to open your room. No email, experience, or credentials required.",
    "필명으로 시작하기": "Get Started with a Pen Name",
    "그 필명의 다락방을 찾지 못했어요": "We couldn't find that creative room",
    "주소의 필명이 바뀌었거나, 아직 문을 열지 않은 다락방일 수 있어요.": "The pen name in the address may have changed, or the room may not be open yet.",
    "갤러리에서 필명 찾기": "Find a Creator in the Gallery",
    "프로필 꾸미기": "Edit Profile",
    "비밀번호 변경": "Change Password",
    "나가기": "Sign Out",
    "창작 일지에 오늘의 기록을 남겨 보세요.": "Add today's entry to your Creative Journal.",
    "기록하기": "Write an Entry",
    "기록": "Journal",
    "새 기록": "New Entry",
    "저장": "Save",
    "취소": "Cancel",
    "수정": "Edit",
    "삭제": "Delete",
    "닫기": "Close",
    "확인": "Confirm",
    "검색": "Search",
    "검색어를 입력해 주세요.": "Enter a search term.",
    "분야 선택": "Choose a Category",
    "모든 분야": "All Categories",
    "최신순": "Newest",
    "오래된순": "Oldest",
    "추천순": "Featured",
    "인기순": "Popular",
    "더 보기": "Load More",
    "목록으로": "Back to List",
    "돌아가기": "Go Back",
    "다시 시도": "Try Again",
    "로그인": "Sign In",
    "로그아웃": "Sign Out",
    "회원가입": "Sign Up",
    "이메일": "Email",
    "비밀번호": "Password",
    "비밀번호 확인": "Confirm Password",
    "필명을 입력해 주세요.": "Please enter a pen name.",
    "비밀번호를 입력해 주세요.": "Please enter a password.",
    "로그인 정보를 확인해 주세요.": "Please check your sign-in details.",
    "로그인되었습니다.": "You are now signed in.",
    "저장되었습니다.": "Saved successfully.",
    "삭제되었습니다.": "Deleted successfully.",
    "오류가 발생했습니다.": "Something went wrong.",
    "잠시 후 다시 시도해 주세요.": "Please try again in a moment.",
    "내용을 입력해 주세요.": "Please enter some content.",
    "제목을 입력해 주세요.": "Please enter a title.",
    "링크": "Link",
    "링크 주소": "Link URL",
    "소개": "About",
    "프로필": "Profile",
    "작품 소개": "About This Work",
    "작품을 등록해 주세요.": "Please submit a work.",
    "아직 등록된 작품이 없어요.": "No works have been submitted yet.",
    "감상을 남겨 주세요.": "Leave a comment.",
    "감상 남기기": "Post a Comment",
    "작성자": "Creator",
    "등록일": "Date Added",
    "분야별": "By Category",
    "전체 작품": "All Works",
    "창작": "Creative Work",
    "공동 작업 모집": "Collaboration Call",
    "모집 중": "Open",
    "마감": "Closed",
    "열림": "Open",
    "상태": "Status",
    "참여하기": "Join",
    "자세히 보기": "Learn More",
    "새로 등록된 작품": "Recently Added Works",
    "추천 작품": "Featured Works",
    "작품을 찾을 수 없어요.": "We couldn't find this work.",
    "아직 작성한 기록이 없어요.": "There are no journal entries yet.",
    "첫 기록 남기기": "Write Your First Entry",
    "오늘": "Today",
    "어제": "Yesterday",
    "공개": "Public",
    "비공개": "Private",
    "공개 설정": "Visibility",
    "이미지": "Image",
    "이미지 추가": "Add Image",
    "파일 선택": "Choose File",
    "선택된 파일 없음": "No file selected",
    "업로드": "Upload",
    "업로드 중": "Uploading",
    "필수": "Required",
    "선택 사항": "Optional",
    "이름": "Name",
    "설명": "Description",
    "작성": "Write",
    "작성하기": "Create",
    "새 작품 등록": "Submit a New Work",
    "작품을 소개해 주세요.": "Tell us about your work.",
    "창작의 과정을 함께 나눠요.": "Share your creative process.",
    "함께 만드는 즐거움": "The Joy of Creating Together",
    "한 줄 감상": "A Short Comment",
    "방명록": "Guestbook",
    "방명록 남기기": "Sign the Guestbook",
    "아직 남겨진 말이 없어요.": "No messages yet.",
    "첫 번째 말을 남겨 보세요.": "Be the first to leave a message.",
    "필명으로 남기기": "Post with Your Pen Name",
    "다락방": "Creative Room",
    "내 작품": "My Works",
    "내 소개": "About Me",
    "방문자": "Visitors",
    "작품 수": "Number of Works",
    "감상 수": "Comments",
    "처음부터 다시": "Start Over",
    "변경 사항 저장": "Save Changes",
    "이름을 입력해 주세요.": "Please enter a name.",
    "소개를 입력해 주세요.": "Please enter an introduction.",
    "잠시만 기다려 주세요.": "Please wait.",
    "불러오는 중": "Loading",
    "불러오지 못했어요.": "Could not load the content.",
    "아직 준비 중이에요.": "Coming soon.",
    "서비스 안내": "About the Service",
    "이용 안내": "How It Works",
    "개인정보 처리방침": "Privacy Policy",
    "이용약관": "Terms of Use",
    "모든 권리 보유": "All rights reserved",
    "작품으로 이어지는 작은 다락방": "A little attic for creative connections"
  };

  const EXCLUDED_SELECTOR = [
    "[data-no-i18n]",
    "[data-user-content]",
    ".work-card__title",
    ".work-card__desc",
    ".work-detail__title",
    ".work-detail__body",
    ".profile__bio",
    ".profile__message",
    ".journal__content",
    ".journal-entry__body",
    ".comment__body",
    ".comment__content",
    ".guestbook__message",
    ".guestbook__body",
    ".feed-card__title",
    ".feed-card__body",
    ".user-content",
    ".user-generated"
  ].join(",");

  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  let currentLang = readLanguage();
  let observer = null;
  let toggleButton = null;
  let translating = false;

  function readLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return LANGS.has(saved) ? saved : DEFAULT_LANG;
    } catch (_) {
      return DEFAULT_LANG;
    }
  }

  function saveLanguage(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
  }

  function isUserContent(element) {
    return !!(element && element.nodeType === 1 &&
      (element.matches(EXCLUDED_SELECTOR) || element.closest(EXCLUDED_SELECTOR)));
  }

  function isProtectedTextNode(node) {
    const parent = node && node.parentElement;
    if (!parent) return true;
    if (isUserContent(parent)) return true;
    if (parent.closest("script,style,noscript,code,pre,textarea,input,select,option,[contenteditable='true'],[contenteditable='']")) return true;
    return false;
  }

  function translateString(value) {
    if (!value || typeof value !== "string") return value;
    if (Object.prototype.hasOwnProperty.call(DICT, value)) return DICT[value];

    let result = value;
    const keys = Object.keys(DICT).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (result.includes(key)) result = result.split(key).join(DICT[key]);
    }
    return result;
  }

  function rememberAttribute(element, name) {
    let map = originalAttributes.get(element);
    if (!map) {
      map = new Map();
      originalAttributes.set(element, map);
    }
    if (!map.has(name)) map.set(name, element.getAttribute(name));
    return map.get(name);
  }

  function processTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE || isProtectedTextNode(node)) return;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const source = originalText.get(node);
    if (currentLang === "ko") {
      if (node.nodeValue !== source) node.nodeValue = source;
      return;
    }
    const translated = translateString(source);
    if (node.nodeValue !== translated) node.nodeValue = translated;
  }

  function processAttributes(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE || isUserContent(element)) return;
    const names = ["placeholder", "aria-label", "title", "alt"];
    for (const name of names) {
      if (!element.hasAttribute(name)) continue;
      const source = rememberAttribute(element, name);
      if (source == null) continue;
      const next = currentLang === "ko" ? source : translateString(source);
      if (element.getAttribute(name) !== next) element.setAttribute(name, next);
    }
  }

  function processElement(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
    if (element.matches("[data-i18n-toggle]")) {
      updateToggleButton();
      return;
    }
    processAttributes(element);
    if (element.matches("input,textarea,select,option,[contenteditable='true'],[contenteditable='']")) return;
    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) processTextNode(child);
      else if (child.nodeType === Node.ELEMENT_NODE) processElement(child);
    }
  }

  function processDocumentTitle() {
    const title = document.querySelector("head > title");
    if (!title) return;
    if (!originalText.has(title.firstChild) && title.firstChild) {
      originalText.set(title.firstChild, title.textContent);
    }
    const source = title.firstChild ? originalText.get(title.firstChild) : title.textContent;
    if (currentLang === "ko") title.textContent = source;
    else title.textContent = translateString(source);
  }

  function updateToggleButton() {
    if (!toggleButton) return;
    toggleButton.textContent = currentLang === "ko" ? "EN" : "KR";
    toggleButton.setAttribute("aria-label", currentLang === "ko" ? "Switch to English" : "한국어로 전환");
    toggleButton.setAttribute("title", currentLang === "ko" ? "Switch to English" : "한국어로 전환");
  }

  function ensureToggleButton() {
    const actions = document.querySelector(".header__actions");
    if (!actions) return;
    if (toggleButton && toggleButton.isConnected) return;

    toggleButton = document.querySelector("[data-i18n-toggle]");
    if (toggleButton) {
      updateToggleButton();
      return;
    }

    toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "i18n-toggle";
    toggleButton.setAttribute("data-i18n-toggle", "");
    toggleButton.setAttribute("aria-label", "Switch to English");
    toggleButton.setAttribute("title", "Switch to English");
    toggleButton.textContent = currentLang === "ko" ? "EN" : "KR";
    toggleButton.addEventListener("click", () => setLanguage(currentLang === "ko" ? "en" : "ko"));

    const style = document.createElement("style");
    style.textContent = `
      .i18n-toggle {
        appearance: none; border: 1px solid #F7DDE3; border-radius: 999px;
        background: #FDF2F3; color: #BE7089; min-width: 42px; height: 34px;
        padding: 0 12px; display: inline-flex; align-items: center;
        justify-content: center; font: 700 12px/1 system-ui, sans-serif;
        letter-spacing: .04em; cursor: pointer; flex: 0 0 auto;
        transition: background .18s ease, transform .18s ease;
      }
      .i18n-toggle:hover { background: #F7DDE3; }
      .i18n-toggle:focus-visible { outline: 2px solid #BE7089; outline-offset: 2px; }
      .header__actions .i18n-toggle { order: -1; }
      @media (max-width: 640px) {
        .header__actions { flex-wrap: nowrap; gap: 8px; }
        .header__actions .i18n-toggle { min-width: 38px; height: 32px; padding: 0 9px; }
      }
    `;
    document.head.appendChild(style);
    actions.insertBefore(toggleButton, actions.firstChild);
  }

  function setLanguage(lang) {
    if (!LANGS.has(lang) || translating) return;
    translating = true;
    currentLang = lang;
    saveLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-language", lang);
    processDocumentTitle();
    processElement(document.body);
    ensureToggleButton();
    updateToggleButton();
    translating = false;
  }

  function start() {
    document.documentElement.lang = currentLang;
    document.documentElement.setAttribute("data-language", currentLang);
    processDocumentTitle();
    processElement(document.body);
    ensureToggleButton();

    if (observer) observer.disconnect();
    observer = new MutationObserver((records) => {
      if (translating) return;
      for (const record of records) {
        if (record.type === "characterData") {
          processTextNode(record.target);
          continue;
        }
        for (const node of record.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) processTextNode(node);
          else if (node.nodeType === Node.ELEMENT_NODE) processElement(node);
        }
        ensureToggleButton();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  window.ARTDARAK_I18N = Object.freeze({
    getLanguage: () => currentLang,
    setLanguage,
    translate: translateString
  });
})();
