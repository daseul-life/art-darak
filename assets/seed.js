/* ============================================================
   아트다락방 — 처음 열었을 때 보여 줄 예시 작품
   ------------------------------------------------------------
   · Supabase를 연결하지 않은 '체험 모드'에서 이 작품들이 먼저 걸립니다.
   · Supabase를 연결하면 supabase-schema.sql 안의 같은 예시 작품이 쓰입니다.
     (지우고 싶으면 SQL 파일 맨 아래의 안내를 따라 주세요.)
   · 예시 작품은 카드에 '예시' 표시가 붙고, 내 다락방에는 들어가지 않습니다.
   ============================================================ */
window.DARAK_SEED = {
  artworks: [
    {
      id: 'sample-1',
      pen_name: '달빛우물',
      title: '창가에 내려앉은 달',
      field: '문학',
      status: '과정 공개',
      emoji: '🌙',
      art: 'moon',
      like_count: 128,
      created_at: '2026-11-17T09:20:00+09:00',
      description:
        '달을 세 번째로 그려 본 밤에 쓴 짧은 시입니다. 첫 장은 너무 진했고, 두 번째는 물을 너무 많이 섞었어요. 세 번째는 손이 가는 대로 두었더니 마음에 드는 밤이 나왔습니다.\n\n아직 마지막 연은 비워 두었어요. 오늘 밤에 한 줄 더 붙여 볼 생각입니다.'
    },
    {
      id: 'sample-2',
      pen_name: '모래알공방',
      title: '손으로 빚은 작은 그릇',
      field: '공예',
      status: '완성',
      emoji: '🏺',
      art: 'clay',
      like_count: 214,
      created_at: '2026-11-17T08:05:00+09:00',
      description:
        '처음으로 물레를 오래 돌려 본 날입니다. 높이를 맞추는 게 어려워서 세 번 무너졌지만, 마지막 그릇은 조금 기울어도 제 손 모양이 남아 있어요.\n\n차 한 잔을 담아 두고 매일 쓰고 있습니다.'
    },
    {
      id: 'sample-3',
      pen_name: '초록서랍',
      title: '비 오는 날의 정원',
      field: '사진',
      status: '완성',
      emoji: '🌿',
      art: 'garden',
      like_count: 187,
      created_at: '2026-11-16T21:40:00+09:00',
      description:
        '우산을 접고 30분쯤 서 있었어요. 물방울이 잎 끝에서 떨어지는 순간을 기다리는 시간이 생각보다 좋았습니다.\n\n비가 그친 뒤에 다시 가 보니 같은 자리에 같은 빛이 없더라고요. 그래서 이 사진이 더 좋습니다.'
    },
    {
      id: 'sample-4',
      pen_name: '하품하는고양이',
      title: '고양이를 위한 자장가',
      field: '음악',
      status: '첫 도전',
      emoji: '🎵',
      art: 'lullaby',
      like_count: 96,
      created_at: '2026-11-16T19:10:00+09:00',
      description:
        '자장가를 만들다가 중간에 멈춘 이유가 있습니다. 고양이가 소파에서 자고 있어서, 깨우지 않으려고 기타를 내려놓았어요.\n\n그 조용한 3분도 이 곡의 일부라고 생각하기로 했습니다. 아직 녹음은 못 했고, 악보만 남아 있어요.'
    },
    {
      id: 'sample-5',
      pen_name: '종이비행기',
      title: '첫 번째 스케치북',
      field: '미술',
      status: '과정 공개',
      emoji: '✏️',
      art: 'sketch',
      like_count: 302,
      created_at: '2026-11-15T22:15:00+09:00',
      description:
        '열여섯 장짜리 스케치북을 다 채웠습니다. 잘 그린 장은 세 장뿐이지만, 나머지 열세 장이 없었으면 그 세 장도 없었을 거예요.\n\n버리지 않고 뒤표지에 다 붙여 두었습니다.'
    },
    {
      id: 'sample-6',
      pen_name: '밤의서점',
      title: '책갈피에 남긴 문장들',
      field: '문학',
      status: '완성',
      emoji: '📖',
      art: 'bookmark',
      like_count: 75,
      created_at: '2026-11-15T11:30:00+09:00',
      description:
        '일 년 동안 책갈피에 적어 둔 문장을 모았습니다. 다 제가 쓴 문장은 아니고, 읽다가 멈춘 자리들의 기록이에요.\n\n누군가에게는 그 문장이 하루를 버티게 하는 문장일 수도 있겠다는 생각으로 옮겨 적었습니다.'
    },
    {
      id: 'sample-7',
      pen_name: '민트유리',
      title: '유리병 속의 바다',
      field: '디자인',
      status: '완성',
      emoji: '🫧',
      art: 'glass',
      like_count: 164,
      created_at: '2026-11-14T20:00:00+09:00',
      description:
        '여름에 찍은 바다 사진을 유리병 라벨로 다시 그려 봤습니다. 파도를 선으로만 남기니 훨씬 조용한 바다가 되었어요.\n\n작은 굿즈로 만들어 보고 싶어서 인쇄용 파일까지 정리해 두었습니다.'
    },
    {
      id: 'sample-8',
      pen_name: '느린붓',
      title: '수묵으로 그린 겨울 산',
      field: '미술',
      status: '완성',
      emoji: '🖌️',
      art: 'ink',
      like_count: 243,
      created_at: '2026-11-14T09:05:00+09:00',
      description:
        '먹을 아끼려고 붓을 여러 번 말렸습니다. 그래서 산이 조금 더 멀게 보이는 것 같아요.\n\n여백을 많이 남긴 게 이번 그림에서 제일 잘한 일입니다.'
    },
    {
      id: 'sample-9',
      pen_name: '솜사탕구름',
      title: '구름 모양 쿠션 만들기',
      field: '공예',
      status: '과정 공개',
      emoji: '☁️',
      art: 'cushion',
      like_count: 118,
      created_at: '2026-11-13T18:20:00+09:00',
      description:
        '재단은 끝났고, 이제 솜을 채우는 단계입니다. 모서리를 둥글게 만드는 게 생각보다 어려워서 두 번 뜯었어요.\n\n완성되면 거실 창가에 두려고 합니다.'
    },
    {
      id: 'sample-10',
      pen_name: '여름의소리',
      title: '여름 저녁, 기타 한 곡',
      field: '음악',
      status: '완성',
      emoji: '🎸',
      art: 'guitar',
      like_count: 89,
      created_at: '2026-11-12T21:00:00+09:00',
      description:
        '해가 지기 전 20분 동안만 녹음했습니다. 중간에 한 번 틀렸지만 다시 하지 않았어요.\n\n그 틀린 자리가 오히려 그날 저녁 같아서 그대로 두었습니다.'
    },
    {
      id: 'sample-11',
      pen_name: '필름한장',
      title: '골목 끝의 노란 가로등',
      field: '사진',
      status: '완성',
      emoji: '💡',
      art: 'lamp',
      like_count: 156,
      created_at: '2026-11-11T23:10:00+09:00',
      description:
        '현상한 필름 열두 장 중에 남은 한 장입니다. 가로등 불빛이 번져서 초점이 맞지 않았는데, 그 번짐이 마음에 들어 골랐어요.\n\n필름은 한 장 한 장 아껴 쓰게 되는 게 좋습니다.'
    },
    {
      id: 'sample-12',
      pen_name: '다락방지기',
      title: '오늘의 작은 기록',
      field: '문학',
      status: '첫 도전',
      emoji: '🗒️',
      art: 'note',
      like_count: 61,
      created_at: '2026-11-10T07:40:00+09:00',
      description:
        '아트다락방에 처음 글을 올려 봅니다. 잘 쓰지 못해도 괜찮다고 해서 용기를 냈어요.\n\n오늘 아침 창문을 열었더니 공기가 어제와 달랐다는 것, 그 한 줄부터 시작합니다.'
    }
  ],

  comments: [
    {
      id: 'sample-c1',
      artwork_id: 'sample-1',
      pen_name: '종이비행기',
      body: '첫 장부터 세 번째 장까지 다 보고 싶어요. 달이 내려앉는 순간이 이렇게 조용할 수 있네요.',
      created_at: '2026-11-17T10:02:00+09:00'
    },
    {
      id: 'sample-c2',
      artwork_id: 'sample-1',
      pen_name: '밤의서점',
      body: '제목부터 마음에 듭니다. 마지막 연, 천천히 기다릴게요.',
      created_at: '2026-11-17T11:15:00+09:00'
    },
    {
      id: 'sample-c3',
      artwork_id: 'sample-3',
      pen_name: '민트유리',
      body: '물방울 맺힌 잎 끝이 좋아요. 비 오는 날에만 볼 수 있는 사진이라 더 귀하게 느껴집니다.',
      created_at: '2026-11-17T08:30:00+09:00'
    },
    {
      id: 'sample-c4',
      artwork_id: 'sample-5',
      pen_name: '느린붓',
      body: '지우지 않고 남겨 둔 첫 장이 제일 좋습니다. 저도 스케치북 뒤에 붙여 둬야겠어요.',
      created_at: '2026-11-16T09:12:00+09:00'
    }
  ]
};
