-- ============================================================
--  아트다락방 (ART DARAK) — Supabase 스키마 v2
-- ------------------------------------------------------------
--  사용법
--   1) https://supabase.com 에서 새 프로젝트를 만듭니다. (무료)
--   2) 왼쪽 메뉴 SQL Editor → New query → 이 파일 전체를 붙여 넣고 RUN.
--   3) Authentication → Providers → Email 에서
--      "Confirm email" 을 꺼 주세요. (필명으로만 가입하기 때문에 메일을 받지 않습니다)
--   4) Project Settings → API 의 URL 과 anon public 키를
--      assets/supabase-config.js 에 넣습니다.
--   5) 사이트를 새로 고치면 'DB 연결됨' 상태가 됩니다.
--
--  ※ 이 파일은 여러 번 실행해도 안전하도록 만들었습니다.
--  ※ service_role 키는 절대 화면 코드에 넣지 마세요.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. 회원 (필명)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  pen_name    text not null,
  bio         text not null default '',
  fields      text[] not null default '{}',
  -- 다락방 꾸미기 (2·3단계에서 확장)
  attic_theme text not null default 'rose'
              check (attic_theme in ('rose', 'cream', 'lavender', 'mint', 'butter', 'sky')),
  -- 다락방 사무실 꾸미기(2단계) — 한 칸(jsonb)에 분위기와 소품을 함께 담습니다.
  --   { "mood": "write" | "paint" | "music" | "craft",
  --     "view": "sunrise" | "sunset" | "ocean",   (없으면 분위기에 맞춘 기본 창)
  --     "pose": "sit" | "work" | "meditate",      (없으면 서기 — 방 안 캐릭터 자세)
  --     "props": ["easel", "desk", "lamp", "guitar", "plant", "tea", "garland", "cat", "books", "vinyl",
  --               "coffee", "beanbag", "candle", "dessert", "board", "dog", "camera"],
  --     "pos": { "cat": { "x": 61.2, "y": 74.3 } } }
  --   ※ 예전에 배열([])로 저장한 값도 화면에서 그대로 읽습니다.
  attic_props jsonb not null default '{}'::jsonb,
  attic_note  text not null default '',
  -- 운영
  is_admin    boolean not null default false,
  is_blocked  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index if not exists profiles_pen_name_key
  on public.profiles (lower(pen_name));

-- ------------------------------------------------------------
-- 2. 작품
-- ------------------------------------------------------------
create table if not exists public.artworks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles (id) on delete cascade,
  pen_name    text not null,
  title       text not null check (char_length(title) between 1 and 60),
  field       text not null check (field in ('문학', '미술', '음악', '사진', '공예', '디자인')),
  status      text not null default '완성' check (status in ('완성', '과정 공개', '첫 도전')),
  description text not null default '' check (char_length(description) <= 2000),
  image_url   text,
  link_url    text,
  like_count  integer not null default 0 check (like_count >= 0),
  is_featured boolean not null default false,
  is_hidden   boolean not null default false,
  is_sample   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists artworks_created_idx on public.artworks (created_at desc);
create index if not exists artworks_field_idx   on public.artworks (field);
create index if not exists artworks_user_idx    on public.artworks (user_id, created_at desc);
create index if not exists artworks_featured_idx on public.artworks (is_featured) where is_featured;

-- ------------------------------------------------------------
-- 3. 감상(댓글)
-- ------------------------------------------------------------
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  user_id    uuid references public.profiles (id) on delete set null,
  pen_name   text not null,
  body       text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists comments_artwork_idx on public.comments (artwork_id, created_at);
create index if not exists comments_user_idx    on public.comments (user_id, created_at desc);

-- ------------------------------------------------------------
-- 4. 공지사항 (홈 맨 위 띠)
-- ------------------------------------------------------------
create table if not exists public.notices (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (char_length(title) between 1 and 60),
  body       text not null default '' check (char_length(body) <= 600),
  is_active  boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notices_active_idx on public.notices (is_active, created_at desc);

-- ------------------------------------------------------------
-- 5. 도우미 함수
-- ------------------------------------------------------------
-- 관리자 확인 (profiles 의 RLS 를 우회해야 해서 security definer)
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- updated_at 자동 갱신
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists artworks_touch on public.artworks;
create trigger artworks_touch before update on public.artworks
  for each row execute function public.touch_updated_at();

drop trigger if exists notices_touch on public.notices;
create trigger notices_touch before update on public.notices
  for each row execute function public.touch_updated_at();

-- 가입하면 profiles 행을 자동으로 만듭니다. (필명은 가입할 때 보낸 값)
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  pen text;
begin
  pen := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'pen_name', '')), '');
  if pen is null then
    pen := '창작자-' || substr(new.id::text, 1, 4);
  end if;

  insert into public.profiles (id, pen_name)
  values (new.id, pen)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 작품·감상을 쓸 때 작성자를 서버에서 정합니다. (필명 위조 방지)
create or replace function public.stamp_author()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  author public.profiles;
begin
  if me is null then
    return new;
  end if;

  select * into author from public.profiles where id = me;
  if author.id is null then
    return new;
  end if;

  new.user_id  := me;
  new.pen_name := author.pen_name;
  return new;
end;
$$;

drop trigger if exists artworks_stamp_author on public.artworks;
create trigger artworks_stamp_author before insert on public.artworks
  for each row execute function public.stamp_author();

drop trigger if exists comments_stamp_author on public.comments;
create trigger comments_stamp_author before insert on public.comments
  for each row execute function public.stamp_author();

-- 회원이 스스로 관리자/차단 상태를 바꾸지 못하게 막습니다.
create or replace function public.protect_profile_flags()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.is_admin   := old.is_admin;
    new.is_blocked := old.is_blocked;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_flags on public.profiles;
create trigger profiles_protect_flags before update on public.profiles
  for each row execute function public.protect_profile_flags();

-- 작품 주인도 추천/숨김/좋아요 수는 바꾸지 못하게 합니다. (관리자만)
create or replace function public.protect_artwork_flags()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.is_featured := old.is_featured;
    new.is_hidden   := old.is_hidden;
    new.is_sample   := old.is_sample;
    new.like_count  := old.like_count;
    new.user_id     := old.user_id;
    new.pen_name    := old.pen_name;
  end if;
  return new;
end;
$$;

drop trigger if exists artworks_protect_flags on public.artworks;
create trigger artworks_protect_flags before update on public.artworks
  for each row execute function public.protect_artwork_flags();

-- ------------------------------------------------------------
-- 6. RLS (행 단위 접근 규칙)
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.artworks enable row level security;
alter table public.comments enable row level security;
alter table public.notices  enable row level security;

-- 프로필: 필명·소개는 누구나 읽고, 고치기는 자기 것만
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select using (true);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (auth.uid() = id and is_admin = false and is_blocked = false);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- 작품: 숨김·차단된 것을 빼고 누구나 읽기 / 쓰기는 자기 것만
drop policy if exists artworks_read on public.artworks;
create policy artworks_read on public.artworks
  for select using (
    public.is_admin()
    or auth.uid() = user_id          -- 내 작품은 숨김 여부와 상관없이 내가 봅니다
    or (
      not is_hidden
      and (
        user_id is null
        or not exists (
          select 1 from public.profiles p
          where p.id = user_id and p.is_blocked
        )
      )
    )
  );

drop policy if exists artworks_insert on public.artworks;
create policy artworks_insert on public.artworks
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and not is_sample
    and not is_featured
    and not is_hidden
  );

drop policy if exists artworks_update on public.artworks;
create policy artworks_update on public.artworks
  for update to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists artworks_delete on public.artworks;
create policy artworks_delete on public.artworks
  for delete to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- 감상: 잠긴 회원의 글만 빼고 읽기 / 쓰기·지우기는 자기 것만 (관리자는 모두)
drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments
  for select using (
    public.is_admin()
    or user_id is null
    or not exists (
      select 1 from public.profiles p
      where p.id = user_id and p.is_blocked
    )
  );

drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments
  for delete to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- 공지: 공개된 것만 읽기, 쓰기는 관리자만
drop policy if exists notices_read on public.notices;
create policy notices_read on public.notices
  for select using (is_active or public.is_admin());

drop policy if exists notices_admin_write on public.notices;
create policy notices_admin_write on public.notices
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- 7. 작품 사진 저장소 (Supabase Storage — 버킷 이름 artworks)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'artworks', 'artworks', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists artworks_storage_read on storage.objects;
create policy artworks_storage_read on storage.objects
  for select using (bucket_id = 'artworks');

drop policy if exists artworks_storage_insert on storage.objects;
create policy artworks_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'artworks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists artworks_storage_update on storage.objects;
create policy artworks_storage_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'artworks'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists artworks_storage_delete on storage.objects;
create policy artworks_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'artworks'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- ------------------------------------------------------------
-- 8. 권한 (RLS 와 함께 동작합니다)
-- ------------------------------------------------------------
grant select on public.profiles, public.artworks, public.comments, public.notices
  to anon, authenticated;
grant insert, update, delete on public.profiles, public.artworks, public.comments, public.notices
  to authenticated;

-- ------------------------------------------------------------
-- 9. 처음 보여 줄 예시 작품 (지우고 싶으면 맨 아래 안내 참고)
-- ------------------------------------------------------------
insert into public.artworks
  (id, pen_name, title, field, status, description, like_count, is_sample, created_at)
values
  ('11111111-1111-4111-8111-000000000001', '달빛우물', '창가에 내려앉은 달', '문학', '과정 공개',
   '달을 세 번째로 그려 본 밤에 쓴 짧은 시입니다. 아직 마지막 연은 비워 두었어요. 오늘 밤에 한 줄 더 붙여 볼 생각입니다.', 0, true, now() - interval '3 hours'),
  ('11111111-1111-4111-8111-000000000002', '모래알공방', '손으로 빚은 작은 그릇', '공예', '완성',
   '처음으로 물레를 오래 돌려 본 날입니다. 세 번 무너졌지만 마지막 그릇에는 제 손 모양이 남아 있어요.', 0, true, now() - interval '5 hours'),
  ('11111111-1111-4111-8111-000000000003', '초록서랍', '비 오는 날의 정원', '사진', '완성',
   '우산을 접고 30분쯤 서 있었어요. 물방울이 잎 끝에서 떨어지는 순간을 기다리는 시간이 좋았습니다.', 0, true, now() - interval '1 day'),
  ('11111111-1111-4111-8111-000000000004', '하품하는고양이', '고양이를 위한 자장가', '음악', '첫 도전',
   '고양이가 소파에서 자고 있어서 기타를 내려놓았어요. 그 조용한 3분도 이 곡의 일부라고 생각합니다.', 0, true, now() - interval '1 day 3 hours'),
  ('11111111-1111-4111-8111-000000000005', '종이비행기', '첫 번째 스케치북', '미술', '과정 공개',
   '열여섯 장짜리 스케치북을 다 채웠습니다. 잘 그린 장은 세 장뿐이지만, 나머지 열세 장이 없었으면 그 세 장도 없었어요.', 0, true, now() - interval '2 days'),
  ('11111111-1111-4111-8111-000000000006', '밤의서점', '책갈피에 남긴 문장들', '문학', '완성',
   '일 년 동안 책갈피에 적어 둔 문장을 모았습니다. 읽다가 멈춘 자리들의 기록이에요.', 0, true, now() - interval '2 days 8 hours'),
  ('11111111-1111-4111-8111-000000000007', '민트유리', '유리병 속의 바다', '디자인', '완성',
   '여름에 찍은 바다 사진을 유리병 라벨로 다시 그려 봤습니다. 파도를 선으로만 남기니 조용한 바다가 되었어요.', 0, true, now() - interval '3 days'),
  ('11111111-1111-4111-8111-000000000008', '느린붓', '수묵으로 그린 겨울 산', '미술', '완성',
   '먹을 아끼려고 붓을 여러 번 말렸습니다. 여백을 많이 남긴 게 이번 그림에서 제일 잘한 일이에요.', 0, true, now() - interval '3 days 6 hours'),
  ('11111111-1111-4111-8111-000000000009', '솜사탕구름', '구름 모양 쿠션 만들기', '공예', '과정 공개',
   '재단은 끝났고 이제 솜을 채우는 단계입니다. 모서리를 둥글게 만드는 게 생각보다 어려워서 두 번 뜯었어요.', 0, true, now() - interval '4 days'),
  ('11111111-1111-4111-8111-000000000010', '여름의소리', '여름 저녁, 기타 한 곡', '음악', '완성',
   '해가 지기 전 20분 동안만 녹음했습니다. 중간에 한 번 틀렸지만 그 틀린 자리가 오히려 그날 저녁 같았어요.', 0, true, now() - interval '5 days'),
  ('11111111-1111-4111-8111-000000000011', '필름한장', '골목 끝의 노란 가로등', '사진', '완성',
   '현상한 필름 열두 장 중에 남은 한 장입니다. 불빛이 번져서 초점이 맞지 않았는데, 그 번짐이 좋았어요.', 0, true, now() - interval '6 days'),
  ('11111111-1111-4111-8111-000000000012', '다락방지기', '오늘의 작은 기록', '문학', '첫 도전',
   '아트다락방에 처음 글을 올려 봅니다. 오늘 아침 창문을 열었더니 공기가 어제와 달랐다는 것, 그 한 줄부터 시작합니다.', 0, true, now() - interval '7 days')
on conflict (id) do nothing;

insert into public.comments (id, artwork_id, pen_name, body, created_at)
values
  ('22222222-2222-4222-8222-000000000001', '11111111-1111-4111-8111-000000000001', '종이비행기',
   '첫 장부터 세 번째 장까지 다 보고 싶어요. 달이 내려앉는 순간이 이렇게 조용할 수 있네요.', now() - interval '2 hours'),
  ('22222222-2222-4222-8222-000000000002', '11111111-1111-4111-8111-000000000001', '밤의서점',
   '제목부터 마음에 듭니다. 마지막 연, 천천히 기다릴게요.', now() - interval '1 hour'),
  ('22222222-2222-4222-8222-000000000003', '11111111-1111-4111-8111-000000000003', '민트유리',
   '물방울 맺힌 잎 끝이 좋아요. 비 오는 날에만 볼 수 있는 사진이라 더 귀하게 느껴집니다.', now() - interval '20 hours'),
  ('22222222-2222-4222-8222-000000000004', '11111111-1111-4111-8111-000000000005', '느린붓',
   '지우지 않고 남겨 둔 첫 장이 제일 좋습니다. 저도 스케치북 뒤에 붙여 둬야겠어요.', now() - interval '1 day 6 hours')
on conflict (id) do nothing;

-- 처음 한 번만 들어가는 환영 공지
insert into public.notices (title, body, is_active)
select '아트다락방 1단계가 열렸어요',
       '필명으로 가입하고 첫 작품을 걸어 보세요. 완성되지 않은 과정도 충분한 작품입니다.',
       true
where not exists (select 1 from public.notices);

-- ------------------------------------------------------------
-- 10. 첫 관리자 지정 (한 번만 실행하세요)
-- ------------------------------------------------------------
-- 아래 '내 필명' 자리에 사이트에서 가입한 필명을 넣고 실행하면
-- 그 계정이 관리자 화면(admin.html)에 들어갈 수 있습니다.
--
-- update public.profiles
--    set is_admin = true
--  where lower(pen_name) = lower('내 필명');

-- ------------------------------------------------------------
-- 11. 예시 작품을 모두 지우고 싶을 때
-- ------------------------------------------------------------
-- delete from public.artworks where is_sample = true;
