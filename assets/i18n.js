/* ART DARAK · Korean / English / Japanese / Chinese UI language switcher
 * This file intentionally does not modify app.js, store.js, or page HTML.
 * To activate it, each page must load this file with:
 * <script src="assets/i18n.js"></script>
 * · 지원 언어: ko(한국어) / en(English) / ja(日本語) / zh(中文 간체)
 * · 선택은 localStorage("artdarak_lang")에 저장되어 페이지를 옮겨도 유지됩니다.
 */
(() => {
  "use strict";

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

  const DICT_JA = {
    "아트다락방에 오신 걸 환영합니다.": "ART DARAKへようこそ。",
    "오늘은 어떤 작품을": "今日はどんな作品を",
    "만들어 볼까요?": "作ってみませんか？",
    "완성된 작품만이 아니라, 그 작품이 나오기까지의 과정도 함께 모으는 곳이에요.": "完成した作品だけでなく、そこに至るまでの過程も一緒に集める場所です。",
    "필명 하나면 시작할 수 있고, 잘 그리지 못해도 괜찮습니다.": "ペンネームひとつで始められます。絵が得意でなくても大丈夫です。",
    "당신의 창작으로 모든 것이 만들어지는 곳.": "あなたの創作から、あらゆるものが生まれる場所。",
    "갤러리 둘러보기": "ギャラリーを見る",
    "입주하기": "ART DARAKへ入居する",
    "가입": "入居",
    "지금 걸린 작품": "展示中の作品",
    "점": "点",
    "참여한 필명": "参加クリエイター",
    "명": "人",
    "모든 기능 무료": "すべての機能が無料",
    "오늘의 작품": "今日の作品",
    "지금 다락방에 걸린 작품들": "いま屋根裏に飾られている作品",
    "관리자가 고른 추천 작품과 새로 걸린 작품을 먼저 보여 드려요. 카드를 누르면 작품 소개와 감상이 이어집니다.": "管理者が選んだおすすめ作品と、新しく飾られた作品を先にご紹介します。カードを押すと作品紹介とコメントが続きます。",
    "갤러리 전체 보기": "ギャラリーをすべて見る",
    "아직 걸린 작품이 없어요.": "まだ飾られている作品はありません。",
    "첫 번째 작품의 주인이 되어 보세요.": "最初の作品の持ち主になってみませんか。",
    "첫 작품 걸기": "最初の作品を飾る",
    "분야별 둘러보기": "分野別に見る",
    "어떤 다락방부터 열어 볼까요?": "どの屋根裏から開けてみましょうか？",
    "분야를 가리지 않고 모으는 곳이라, 오늘은 글이고 내일은 도자가 되는 일이 자연스러워요.": "分野を問わず集まる場所なので、今日は文章、明日は陶芸、というのも自然なことです。",
    "분야별로 보기": "分野別に探す",
    "문학": "文学",
    "미술": "美術",
    "음악": "音楽",
    "사진": "写真",
    "공예": "工芸",
    "디자인": "デザイン",
    "홈": "ホーム",
    "갤러리": "ギャラリー",
    "작품 등록": "作品を登録",
    "창작 일지": "創作日誌",
    "공동 작업실": "共同作業室",
    "내 다락방": "わたしの屋根裏",
    "메뉴": "メニュー",
    "가입·로그인": "入居・ログイン",
    "필명으로 가입하거나 로그인하기": "ペンネームで入居またはログイン",
    "공지": "お知らせ",
    "공지 닫기": "お知らせを閉じる",
    "둘러보기": "見てまわる",
    "운영 안내": "運営案内",
    "관리자": "管理者",
    "문학 · 미술 · 음악 · 사진 · 공예 · 디자인을 가리지 않는 창작 커뮤니티.": "文学・美術・音楽・写真・工芸・デザインを問わない創作コミュニティ。",
    "광고가 아니라 작품으로 운영되는 곳을 목표로 합니다": "広告ではなく、作品で運営される場所を目指しています。",
    "페이지를 찾을 수 없어요.": "ページが見つかりません。",
    "홈으로 돌아가기": "ホームに戻る",
    "체험 모드 · 지금 남긴 필명과 작품은 이 브라우저에만 저장돼요": "体験モード・いま残したペンネームと作品はこのブラウザにのみ保存されます",
    "작품": "作品",
    "감상": "コメント",
    "이 작품에 남겨진 말": "この作品に残された言葉",
    "필명으로 짧게 남겨 주세요. 잘 쓰지 않아도, 한 줄이어도 괜찮아요.": "ペンネームで短く残してください。うまく書けなくても、一行でも大丈夫です。",
    "다음 작품": "次の作品",
    "다른 다락방의 작품도 둘러볼까요?": "ほかの屋根裏の作品も見てみませんか？",
    "이 작품이 마음에 들었다면, 같은 분야의 다른 작품도 금방 눈에 들어올 거예요.": "この作品が気に入ったなら、同じ分野のほかの作品もすぐに目に入るはずです。",
    "갤러리로 가기": "ギャラリーへ",
    "혼자 막힌 자리에는 다른 사람의 한마디가 잘 어울립니다. 피드백을 청하거나, 함께 만들 사람을 불러 보세요.": "ひとりで行き詰まったときは、誰かのひとことがよく合います。フィードバックを求めたり、一緒に作る人を誘ってみてください。",
    "공동 작업실을 준비하고 있어요. 조금 뒤에 다시 열어 주세요.": "共同作業室を準備しています。しばらくしてからもう一度開いてください。",
    "필명으로 시작하면 글을 올릴 수 있어요": "ペンネームで始めると投稿できます",
    "모집 글과 피드백 요청은 필명으로 남깁니다. 읽는 것은 가입하지 않아도 괜찮아요.": "募集の投稿とフィードバックのお願いはペンネームで残します。読むだけなら入居しなくても大丈夫です。",
    "필명 정하기": "ペンネームを決める",
    "필명": "ペンネーム",
    "님으로 올립니다": "さんとして投稿します",
    "제목": "タイトル",
    "분야": "分野",
    "어떤 글인가요?": "どんな投稿ですか？",
    "피드백 요청": "フィードバックのお願い",
    "미완성 작품에 의견을 듣고 싶어요": "未完成の作品について意見がほしい",
    "함께 작업": "共同制作",
    "같이 만들 창작자를 찾아요": "一緒に作るクリエイターを探しています",
    "내용": "内容",
    "어떤 작업을 하고 있고, 어떤 도움이 필요한지 적어 주세요.": "どんな作業をしていて、どんな助けが必要かを書いてください。",
    "작품·참고 링크": "作品・参考リンク",
    "선택": "任意",
    "글 올리기": "投稿する",
    "모집 글은 '열림'으로 시작하고, 다 모이면 직접 '마감'으로 바꿀 수 있어요.": "募集の投稿は「募集中」から始まり、集まったら自分で「締切」に変えられます。",
    "지금 함께하는 자리": "いま一緒に作る場",
    "글 종류": "投稿の種類",
    "전체": "すべて",
    "개의 글": "件の投稿",
    "아직 올라온 글이 없어요.": "まだ投稿はありません。",
    "첫 모집 글을 남겨 보세요.": "最初の募集を書いてみましょう。",
    "오늘의 과정": "今日の過程",
    "만드는 사이의 생각도 남겨 두세요": "作っている間の考えも残しておいてください",
    "창작 일지에 오늘의 기록을 남기면, 다음에 이어 갈 실마리가 됩니다.": "創作日誌に今日の記録を残すと、次に続く手がかりになります。",
    "창작 일지 보기": "創作日誌を見る",
    "필명 하나로 시작하는 나만의 방. 작품과 소개, 그리고 찾아온 사람들이 남긴 말이 함께 쌓입니다.": "ペンネームひとつで始まる自分だけの部屋。作品と紹介、そして訪れた人が残した言葉が一緒に積み重なります。",
    "아직 다락방 문이 닫혀 있어요": "まだ屋根裏の扉は閉まっています",
    "필명 하나만 정하면 바로 내 방이 열립니다. 이메일 없이, 실력이나 경력도 묻지 않아요.": "ペンネームを決めるだけで、すぐに自分の部屋が開きます。メールなし、実力や経歴も問いません。",
    "필명으로 시작하기": "ペンネームで始める",
    "그 필명의 다락방을 찾지 못했어요": "そのペンネームの屋根裏が見つかりませんでした",
    "주소의 필명이 바뀌었거나, 아직 문을 열지 않은 다락방일 수 있어요.": "アドレスのペンネームが変わったか、まだ扉を開けていない屋根裏かもしれません。",
    "갤러리에서 필명 찾기": "ギャラリーでペンネームを探す",
    "프로필 꾸미기": "プロフィールを整える",
    "비밀번호 변경": "パスワードを変更",
    "나가기": "退出する",
    "창작 일지에 오늘의 기록을 남겨 보세요.": "創作日誌に今日の記録を残してみましょう。",
    "기록하기": "記録する",
    "기록": "記録",
    "새 기록": "新しい記録",
    "저장": "保存",
    "취소": "キャンセル",
    "수정": "編集",
    "삭제": "削除",
    "닫기": "閉じる",
    "확인": "確認",
    "검색": "検索",
    "검색어를 입력해 주세요.": "検索語を入力してください。",
    "분야 선택": "分野を選ぶ",
    "모든 분야": "すべての分野",
    "최신순": "新しい順",
    "오래된순": "古い順",
    "추천순": "おすすめ順",
    "인기순": "人気順",
    "더 보기": "もっと見る",
    "목록으로": "一覧へ",
    "돌아가기": "戻る",
    "다시 시도": "再試行",
    "로그인": "ログイン",
    "로그아웃": "ログアウト",
    "회원가입": "入居する",
    "이메일": "メール",
    "비밀번호": "パスワード",
    "비밀번호 확인": "パスワードの確認",
    "필명을 입력해 주세요.": "ペンネームを入力してください。",
    "비밀번호를 입력해 주세요.": "パスワードを入力してください。",
    "로그인 정보를 확인해 주세요.": "ログイン情報を確認してください。",
    "로그인되었습니다.": "ログインしました。",
    "저장되었습니다.": "保存しました。",
    "삭제되었습니다.": "削除しました。",
    "오류가 발생했습니다.": "エラーが発生しました。",
    "잠시 후 다시 시도해 주세요.": "しばらくしてからもう一度お試しください。",
    "내용을 입력해 주세요.": "内容を入力してください。",
    "제목을 입력해 주세요.": "タイトルを入力してください。",
    "링크": "リンク",
    "링크 주소": "リンクURL",
    "소개": "紹介",
    "프로필": "プロフィール",
    "작품 소개": "作品紹介",
    "작품을 등록해 주세요.": "作品を登録してください。",
    "아직 등록된 작품이 없어요.": "まだ登録された作品はありません。",
    "감상을 남겨 주세요.": "コメントを残してください。",
    "감상 남기기": "コメントする",
    "작성자": "作者",
    "등록일": "登録日",
    "분야별": "分野別",
    "전체 작품": "すべての作品",
    "창작": "創作",
    "공동 작업 모집": "共同制作の募集",
    "모집 중": "募集中",
    "마감": "締切",
    "열림": "募集中",
    "상태": "状態",
    "참여하기": "参加する",
    "자세히 보기": "詳しく見る",
    "새로 등록된 작품": "新しく登録された作品",
    "추천 작품": "おすすめ作品",
    "작품을 찾을 수 없어요.": "作品が見つかりません。",
    "아직 작성한 기록이 없어요.": "まだ書いた記録はありません。",
    "첫 기록 남기기": "最初の記録を残す",
    "오늘": "今日",
    "어제": "昨日",
    "공개": "公開",
    "비공개": "非公開",
    "공개 설정": "公開設定",
    "이미지": "画像",
    "이미지 추가": "画像を追加",
    "파일 선택": "ファイルを選択",
    "선택된 파일 없음": "選択されたファイルはありません",
    "업로드": "アップロード",
    "업로드 중": "アップロード中",
    "필수": "必須",
    "선택 사항": "任意",
    "이름": "名前",
    "설명": "説明",
    "작성": "作成",
    "작성하기": "作成する",
    "새 작품 등록": "新しい作品を登録",
    "작품을 소개해 주세요.": "作品を紹介してください。",
    "창작의 과정을 함께 나눠요.": "創作の過程を一緒に分かち合いましょう。",
    "함께 만드는 즐거움": "一緒に作る楽しさ",
    "한 줄 감상": "ひとことコメント",
    "방명록": "あしあと帳",
    "방명록 남기기": "あしあと帳に残す",
    "아직 남겨진 말이 없어요.": "まだ残された言葉はありません。",
    "첫 번째 말을 남겨 보세요.": "最初のひとことを残してみませんか。",
    "필명으로 남기기": "ペンネームで残す",
    "다락방": "屋根裏",
    "내 작품": "わたしの作品",
    "내 소개": "わたしの紹介",
    "방문자": "訪問者",
    "작품 수": "作品数",
    "감상 수": "コメント数",
    "처음부터 다시": "最初からやり直す",
    "변경 사항 저장": "変更を保存",
    "이름을 입력해 주세요.": "名前を入力してください。",
    "소개를 입력해 주세요.": "紹介を入力してください。",
    "잠시만 기다려 주세요.": "少々お待ちください。",
    "불러오는 중": "読み込み中",
    "불러오지 못했어요.": "読み込めませんでした。",
    "아직 준비 중이에요.": "まだ準備中です。",
    "서비스 안내": "サービス案内",
    "이용 안내": "ご利用案内",
    "개인정보 처리방침": "個人情報の取り扱い",
    "이용약관": "利用規約",
    "모든 권리 보유": "すべての権利は留保されています",
    "작품으로 이어지는 작은 다락방": "作品でつながる小さな屋根裏",
  };

  const DICT_ZH = {
    "아트다락방에 오신 걸 환영합니다.": "欢迎来到 ART DARAK。",
    "오늘은 어떤 작품을": "今天想创作",
    "만들어 볼까요?": "什么样的作品呢？",
    "완성된 작품만이 아니라, 그 작품이 나오기까지의 과정도 함께 모으는 곳이에요.": "不只是完成的作品，这里也一起收藏作品诞生之前的过程。",
    "필명 하나면 시작할 수 있고, 잘 그리지 못해도 괜찮습니다.": "只要一个笔名就能开始，画得不够好也没关系。",
    "당신의 창작으로 모든 것이 만들어지는 곳.": "一个由你的创作生出一切的地方。",
    "갤러리 둘러보기": "浏览画廊",
    "입주하기": "入住 ART DARAK",
    "가입": "入驻",
    "지금 걸린 작품": "正在展出的作品",
    "점": "件",
    "참여한 필명": "参与的笔名",
    "명": "人",
    "모든 기능 무료": "所有功能免费",
    "오늘의 작품": "今日作品",
    "지금 다락방에 걸린 작품들": "此刻挂在阁楼里的作品",
    "관리자가 고른 추천 작품과 새로 걸린 작품을 먼저 보여 드려요. 카드를 누르면 작품 소개와 감상이 이어집니다.": "先为你展示管理员挑选的推荐作品和新挂上的作品。点击卡片即可查看作品介绍和评论。",
    "갤러리 전체 보기": "查看全部作品",
    "아직 걸린 작품이 없어요.": "还没有挂上的作品。",
    "첫 번째 작품의 주인이 되어 보세요.": "来成为第一件作品的主人吧。",
    "첫 작품 걸기": "挂上第一件作品",
    "분야별 둘러보기": "按领域浏览",
    "어떤 다락방부터 열어 볼까요?": "想先打开哪一间阁楼呢？",
    "분야를 가리지 않고 모으는 곳이라, 오늘은 글이고 내일은 도자가 되는 일이 자연스러워요.": "这里不分领域收纳创作，今天写文字、明天做陶艺都很自然。",
    "분야별로 보기": "按领域查看",
    "문학": "文学",
    "미술": "美术",
    "음악": "音乐",
    "사진": "摄影",
    "공예": "工艺",
    "디자인": "设计",
    "홈": "首页",
    "갤러리": "画廊",
    "작품 등록": "作品登记",
    "창작 일지": "创作日志",
    "공동 작업실": "共同工作室",
    "내 다락방": "我的阁楼",
    "메뉴": "菜单",
    "가입·로그인": "入驻·登录",
    "필명으로 가입하거나 로그인하기": "用笔名入驻或登录",
    "공지": "公告",
    "공지 닫기": "关闭公告",
    "둘러보기": "逛一逛",
    "운영 안내": "运营说明",
    "관리자": "管理员",
    "문학 · 미술 · 음악 · 사진 · 공예 · 디자인을 가리지 않는 창작 커뮤니티.": "一个不分文学、美术、音乐、摄影、工艺、设计的创作社区。",
    "광고가 아니라 작품으로 운영되는 곳을 목표로 합니다": "目标是靠作品运营，而不是靠广告。",
    "페이지를 찾을 수 없어요.": "找不到页面。",
    "홈으로 돌아가기": "回到首页",
    "체험 모드 · 지금 남긴 필명과 작품은 이 브라우저에만 저장돼요": "体验模式 · 现在留下的笔名和作品只保存在这个浏览器里",
    "작품": "作品",
    "감상": "评论",
    "이 작품에 남겨진 말": "留给这件作品的话",
    "필명으로 짧게 남겨 주세요. 잘 쓰지 않아도, 한 줄이어도 괜찮아요.": "用笔名简短地留一句吧。写不好、只有一行也没关系。",
    "다음 작품": "下一件作品",
    "다른 다락방의 작품도 둘러볼까요?": "也去看看别的阁楼的作品吧？",
    "이 작품이 마음에 들었다면, 같은 분야의 다른 작품도 금방 눈에 들어올 거예요.": "如果喜欢这件作品，同领域的其他作品也会很快进入你的眼睛。",
    "갤러리로 가기": "去画廊",
    "혼자 막힌 자리에는 다른 사람의 한마디가 잘 어울립니다. 피드백을 청하거나, 함께 만들 사람을 불러 보세요.": "独自卡住的时候，别人的一句话刚好合适。可以请求反馈，也可以邀请一起创作的人。",
    "공동 작업실을 준비하고 있어요. 조금 뒤에 다시 열어 주세요.": "共同工作室正在准备中，请稍后再来。",
    "필명으로 시작하면 글을 올릴 수 있어요": "用笔名开始就能发布帖子",
    "모집 글과 피드백 요청은 필명으로 남깁니다. 읽는 것은 가입하지 않아도 괜찮아요.": "招募帖和反馈请求都以笔名发布。阅读不需要入驻。",
    "필명 정하기": "起个笔名",
    "필명": "笔名",
    "님으로 올립니다": "的身份发布",
    "제목": "标题",
    "분야": "领域",
    "어떤 글인가요?": "这是什么帖子？",
    "피드백 요청": "请求反馈",
    "미완성 작품에 의견을 듣고 싶어요": "想听听对未完成作品的意见",
    "함께 작업": "一起创作",
    "같이 만들 창작자를 찾아요": "想找一起创作的伙伴",
    "내용": "内容",
    "어떤 작업을 하고 있고, 어떤 도움이 필요한지 적어 주세요.": "请写下你正在做什么、需要什么帮助。",
    "작품·참고 링크": "作品·参考链接",
    "선택": "可选",
    "글 올리기": "发布帖子",
    "모집 글은 '열림'으로 시작하고, 다 모이면 직접 '마감'으로 바꿀 수 있어요.": "招募帖以“进行中”开始，人齐了可以自己改成“已结束”。",
    "지금 함께하는 자리": "正在招募",
    "글 종류": "帖子类型",
    "전체": "全部",
    "개의 글": "条帖子",
    "아직 올라온 글이 없어요.": "还没有帖子。",
    "첫 모집 글을 남겨 보세요.": "来写下第一条招募吧。",
    "오늘의 과정": "今天的过程",
    "만드는 사이의 생각도 남겨 두세요": "把创作过程里的想法也留下来",
    "창작 일지에 오늘의 기록을 남기면, 다음에 이어 갈 실마리가 됩니다.": "在创作日志里留下今天的记录，就会成为下次接续的线索。",
    "창작 일지 보기": "查看创作日志",
    "필명 하나로 시작하는 나만의 방. 작품과 소개, 그리고 찾아온 사람들이 남긴 말이 함께 쌓입니다.": "从一个笔名开始，属于你自己的房间。作品、介绍，还有来访的人留下的话会一起积累起来。",
    "아직 다락방 문이 닫혀 있어요": "你的阁楼门还没打开",
    "필명 하나만 정하면 바로 내 방이 열립니다. 이메일 없이, 실력이나 경력도 묻지 않아요.": "只要起一个笔名，房间就立刻打开。不需要邮箱，也不问实力和经历。",
    "필명으로 시작하기": "用笔名开始",
    "그 필명의 다락방을 찾지 못했어요": "找不到这个笔名的阁楼",
    "주소의 필명이 바뀌었거나, 아직 문을 열지 않은 다락방일 수 있어요.": "地址里的笔名可能已经更改，也可能是还没开门的阁楼。",
    "갤러리에서 필명 찾기": "在画廊里找笔名",
    "프로필 꾸미기": "编辑资料",
    "비밀번호 변경": "修改密码",
    "나가기": "退出",
    "창작 일지에 오늘의 기록을 남겨 보세요.": "在创作日志里留下今天的记录吧。",
    "기록하기": "记录",
    "기록": "日志",
    "새 기록": "新记录",
    "저장": "保存",
    "취소": "取消",
    "수정": "编辑",
    "삭제": "删除",
    "닫기": "关闭",
    "확인": "确认",
    "검색": "搜索",
    "검색어를 입력해 주세요.": "请输入搜索词。",
    "분야 선택": "选择领域",
    "모든 분야": "所有领域",
    "최신순": "最新",
    "오래된순": "最早",
    "추천순": "推荐",
    "인기순": "热门",
    "더 보기": "查看更多",
    "목록으로": "返回列表",
    "돌아가기": "返回",
    "다시 시도": "重试",
    "로그인": "登录",
    "로그아웃": "退出登录",
    "회원가입": "注册",
    "이메일": "邮箱",
    "비밀번호": "密码",
    "비밀번호 확인": "确认密码",
    "필명을 입력해 주세요.": "请输入笔名。",
    "비밀번호를 입력해 주세요.": "请输入密码。",
    "로그인 정보를 확인해 주세요.": "请确认登录信息。",
    "로그인되었습니다.": "已登录。",
    "저장되었습니다.": "已保存。",
    "삭제되었습니다.": "已删除。",
    "오류가 발생했습니다.": "发生了错误。",
    "잠시 후 다시 시도해 주세요.": "请稍后再试。",
    "내용을 입력해 주세요.": "请输入内容。",
    "제목을 입력해 주세요.": "请输入标题。",
    "링크": "链接",
    "링크 주소": "链接地址",
    "소개": "介绍",
    "프로필": "个人资料",
    "작품 소개": "作品介绍",
    "작품을 등록해 주세요.": "请登记作品。",
    "아직 등록된 작품이 없어요.": "还没有登记的作品。",
    "감상을 남겨 주세요.": "请留下评论。",
    "감상 남기기": "发表评论",
    "작성자": "作者",
    "등록일": "登记日期",
    "분야별": "按领域",
    "전체 작품": "全部作品",
    "창작": "创作",
    "공동 작업 모집": "共同创作招募",
    "모집 중": "招募中",
    "마감": "已结束",
    "열림": "招募中",
    "상태": "状态",
    "참여하기": "参加",
    "자세히 보기": "查看详情",
    "새로 등록된 작품": "新登记的作品",
    "추천 작품": "推荐作品",
    "작품을 찾을 수 없어요.": "找不到这件作品。",
    "아직 작성한 기록이 없어요.": "还没有写下的记录。",
    "첫 기록 남기기": "写下第一条记录",
    "오늘": "今天",
    "어제": "昨天",
    "공개": "公开",
    "비공개": "私密",
    "공개 설정": "公开设置",
    "이미지": "图片",
    "이미지 추가": "添加图片",
    "파일 선택": "选择文件",
    "선택된 파일 없음": "未选择文件",
    "업로드": "上传",
    "업로드 중": "上传中",
    "필수": "必填",
    "선택 사항": "可选填",
    "이름": "名字",
    "설명": "说明",
    "작성": "撰写",
    "작성하기": "撰写",
    "새 작품 등록": "登记新作品",
    "작품을 소개해 주세요.": "请介绍你的作品。",
    "창작의 과정을 함께 나눠요.": "一起分享创作的过程。",
    "함께 만드는 즐거움": "一起创作的快乐",
    "한 줄 감상": "一句评论",
    "방명록": "留言板",
    "방명록 남기기": "在留言板留言",
    "아직 남겨진 말이 없어요.": "还没有留下的话。",
    "첫 번째 말을 남겨 보세요.": "来留下第一句话吧。",
    "필명으로 남기기": "用笔名留言",
    "다락방": "阁楼",
    "내 작품": "我的作品",
    "내 소개": "我的介绍",
    "방문자": "访客",
    "작품 수": "作品数",
    "감상 수": "评论数",
    "처음부터 다시": "从头再来",
    "변경 사항 저장": "保存更改",
    "이름을 입력해 주세요.": "请输入名字。",
    "소개를 입력해 주세요.": "请输入介绍。",
    "잠시만 기다려 주세요.": "请稍等。",
    "불러오는 중": "加载中",
    "불러오지 못했어요.": "加载失败。",
    "아직 준비 중이에요.": "还在准备中。",
    "서비스 안내": "服务说明",
    "이용 안내": "使用说明",
    "개인정보 처리방침": "隐私政策",
    "이용약관": "使用条款",
    "모든 권리 보유": "保留所有权利",
    "작품으로 이어지는 작은 다락방": "作品相连的小阁楼",
  };

  const STORAGE_KEY = "artdarak_lang";
  const DEFAULT_LANG = "ko";
  const LANGS = ["ko", "en", "ja", "zh"];
  const LANG_SET = new Set(LANGS);
  const DICTS = { en: DICT, ja: DICT_JA, zh: DICT_ZH };
  const LANG_CODES = { ko: "KR", en: "EN", ja: "JA", zh: "ZH" };
  const LANG_LABELS = { ko: "한국어", en: "English", ja: "日本語", zh: "中文" };

  const EXCLUDED_SELECTOR = [
    "[data-no-i18n]",
    "[data-i18n-picker]",
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
  const KEYS_BY_LENGTH = Object.keys(DICT).sort((a, b) => b.length - a.length);
  let currentLang = readLanguage();
  let observer = null;
  let picker = null;
  let pickerListenersBound = false;
  let translating = false;

  function readLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return LANG_SET.has(saved) ? saved : DEFAULT_LANG;
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

  function translateString(value, lang) {
    if (!value || typeof value !== "string") return value;
    const target = lang || currentLang;
    if (target === "ko") return value;
    const dict = DICTS[target];
    if (!dict) return value;
    if (Object.prototype.hasOwnProperty.call(dict, value)) {
      return dict[value] || DICT[value] || value;
    }

    let result = value;
    for (const key of KEYS_BY_LENGTH) {
      if (result.indexOf(key) === -1) continue;
      // 짧은 낱말(분야·필명 등)이 긴 한글 문장 속에서 치환되면 "여섯 Category가"처럼
      // 언어가 섞입니다. 짧은 키는 문장 전체가 그 낱말(숫자·기호 포함)일 때만,
      // 여러 문장을 덮는 긴 키는 그대로 치환합니다.
      if (key.length < 8 && /[\uAC00-\uD7A3]/.test(result.split(key).join(""))) continue;
      const replacement = dict[key] || DICT[key] || key;
      result = result.split(key).join(replacement);
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
    const translated = translateString(source, currentLang);
    if (node.nodeValue !== translated) node.nodeValue = translated;
  }

  function processAttributes(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE || isUserContent(element)) return;
    const names = ["placeholder", "aria-label", "title", "alt"];
    for (const name of names) {
      if (!element.hasAttribute(name)) continue;
      const source = rememberAttribute(element, name);
      if (source == null) continue;
      const next = currentLang === "ko" ? source : translateString(source, currentLang);
      if (element.getAttribute(name) !== next) element.setAttribute(name, next);
    }
  }

  function processElement(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
    if (isUserContent(element)) return;
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
    else title.textContent = translateString(source, currentLang);
  }

  const PICKER_STYLE = `
    .i18n-picker { position: relative; display: inline-flex; flex: 0 0 auto; }
    .i18n-toggle {
      appearance: none; display: inline-flex; align-items: center; justify-content: center;
      gap: 4px; min-width: 52px; height: 34px; padding: 0 9px;
      border: 1px solid #F7DDE3; border-radius: 999px;
      background: #FDF2F3; color: #BE7089;
      font: 700 11.5px/1 system-ui, sans-serif; letter-spacing: .04em;
      cursor: pointer; flex: 0 0 auto;
      transition: background .18s ease, border-color .18s ease;
    }
    .i18n-toggle:hover { background: #F7DDE3; border-color: #F0CCD7; }
    .i18n-toggle:focus-visible { outline: 2px solid #BE7089; outline-offset: 2px; }
    .i18n-toggle__code { font-weight: 800; }
    .i18n-toggle__caret { width: 7px; height: 7px; opacity: .65; }
    .i18n-menu {
      position: absolute; top: calc(100% + 8px); right: 0; z-index: 80;
      min-width: 132px; padding: 6px;
      display: flex; flex-direction: column; gap: 2px;
      border: 1px solid #F3D9E0; border-radius: 16px;
      background: #FFFDFC;
      box-shadow: 0 18px 32px -22px rgba(90, 56, 66, .55), 0 0 0 1px rgba(255, 255, 255, .9) inset;
    }
    .i18n-menu[hidden] { display: none; }
    .i18n-menu__item {
      appearance: none; border: 0; background: transparent;
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px; border-radius: 10px;
      font: 700 12.5px/1.2 "Gowun Dodum", system-ui, sans-serif; color: #6B4B53;
      text-align: left; cursor: pointer;
    }
    .i18n-menu__item:hover { background: #FDF2F3; }
    .i18n-menu__item[aria-checked="true"] { background: #FBE6EC; color: #BE7089; }
    .i18n-menu__code {
      flex: none; min-width: 22px; font: 800 10px/1 system-ui, sans-serif;
      letter-spacing: .06em; color: #C08A9B;
    }
    .i18n-menu__item[aria-checked="true"] .i18n-menu__code { color: #BE7089; }
    @media (max-width: 620px) {
      .i18n-toggle { min-width: 44px; height: 31px; padding: 0 6px; font-size: 10.5px; gap: 3px; }
      .i18n-menu { min-width: 124px; }
    }
    @media (max-width: 380px) {
      .i18n-toggle { min-width: 40px; height: 30px; padding: 0 5px; font-size: 10px; }
    }
  `;

  function closeMenu() {
    if (!picker) return;
    picker.classList.remove("is-open");
    const button = picker.querySelector("[data-i18n-toggle]");
    const menu = picker.querySelector("[data-i18n-menu]");
    if (button) button.setAttribute("aria-expanded", "false");
    if (menu) menu.hidden = true;
  }

  function ensurePicker() {
    const actions = document.querySelector(".header__actions");
    if (!actions) return;

    if (!picker || !picker.isConnected) {
      picker = document.querySelector("[data-i18n-picker]");
    }
    if (picker && picker.isConnected) {
      updatePicker();
      return;
    }

    picker = document.createElement("div");
    picker.className = "i18n-picker";
    picker.setAttribute("data-i18n-picker", "");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "i18n-toggle";
    button.setAttribute("data-i18n-toggle", "");
    button.setAttribute("aria-haspopup", "true");
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = '<span class="i18n-toggle__code" data-i18n-code>KR</span>' +
      '<svg class="i18n-toggle__caret" viewBox="0 0 10 10" aria-hidden="true" focusable="false">' +
      '<path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const menu = document.createElement("div");
    menu.className = "i18n-menu";
    menu.setAttribute("data-i18n-menu", "");
    menu.hidden = true;
    menu.setAttribute("role", "menu");
    for (const lang of LANGS) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "i18n-menu__item";
      item.setAttribute("role", "menuitemradio");
      item.setAttribute("data-lang", lang);
      item.setAttribute("aria-checked", "false");
      item.innerHTML = '<span class="i18n-menu__code">' + LANG_CODES[lang] + "</span>" +
        "<span>" + LANG_LABELS[lang] + "</span>";
      menu.appendChild(item);
    }

    picker.appendChild(button);
    picker.appendChild(menu);

    if (!document.querySelector("style[data-i18n-style]")) {
      const style = document.createElement("style");
      style.setAttribute("data-i18n-style", "");
      style.textContent = PICKER_STYLE;
      document.head.appendChild(style);
    }

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = menu.hidden;
      menu.hidden = !open;
      picker.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", (event) => {
      const item = event.target.closest("[data-lang]");
      if (!item) return;
      setLanguage(item.getAttribute("data-lang"));
      closeMenu();
    });
    if (!pickerListenersBound) {
      pickerListenersBound = true;
      document.addEventListener("click", (event) => {
        if (picker && !picker.contains(event.target)) closeMenu();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
      });
    }

    actions.insertBefore(picker, actions.firstChild);
    updatePicker();
  }

  function updatePicker() {
    if (!picker) return;
    const code = picker.querySelector("[data-i18n-code]");
    const button = picker.querySelector("[data-i18n-toggle]");
    if (code) code.textContent = LANG_CODES[currentLang];
    if (button) {
      button.setAttribute("aria-label", "Language · " + LANG_LABELS[currentLang]);
      button.setAttribute("title", LANG_LABELS[currentLang]);
    }
    picker.querySelectorAll("[data-lang]").forEach((item) => {
      const on = item.getAttribute("data-lang") === currentLang;
      item.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  function setLanguage(lang) {
    if (!LANG_SET.has(lang) || translating) return;
    translating = true;
    currentLang = lang;
    saveLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-language", lang);
    processDocumentTitle();
    processElement(document.body);
    ensurePicker();
    updatePicker();
    translating = false;
  }

  function start() {
    document.documentElement.lang = currentLang;
    document.documentElement.setAttribute("data-language", currentLang);
    processDocumentTitle();
    processElement(document.body);
    ensurePicker();

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
        if (!picker || !picker.isConnected) ensurePicker();
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
    languages: LANGS.slice(),
    getLanguage: () => currentLang,
    setLanguage,
    translate: translateString
  });
})();
