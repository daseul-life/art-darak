-- ============================================================
--  아트다락방 — 3~4단계 통합 SQL (한 번만 실행)
-- ------------------------------------------------------------
--  사용법
--   1) https://supabase.com → 내 프로젝트 → 왼쪽 SQL Editor → New query
--   2) 이 파일 전체를 복사해 붙여 넣고 RUN
--   3) 사이트를 새로 고치면 창작 일지(journal.html)와
--      협업·피드백(cowork.html)이 열리고, 예시 작품이 사라집니다.
--
--  이 파일이 하는 일
--   ① 예시 작품(is_sample) 영구 삭제 — 사이트에 예시가 하나도 남지 않습니다
--   ② friendships 표 권한 정리 — 친구 신청·수락이 열립니다
--   ③ journals / journal_cheers 표 — 창작 일지 + 응원(공감)
--   ④ cowork_posts / cowork_replies 표 — 협업·피드백 모집 글 + 댓글
--
--  ※ 여러 번 실행해도 안전합니다. (표는 if not exists, 정책은 drop 후 재생성)
--  ※ 표가 없거나 권한이 없어도 사이트는 '준비 중' 안내만 보여 주고 멈추지 않습니다.
-- ============================================================

-- ============================================================
-- ① 예시 작품(is_sample) 영구 삭제
--    사람이 올리지 않은 예시 작품만 지웁니다. (is_sample = false 는 그대로)
--    익명(anon) 키로는 RLS 때문에 지울 수 없어, 여기서 한 번에 정리합니다.
-- ============================================================
delete from public.comments
 where artwork_id in (select id from public.artworks where is_sample = true);

delete from public.artworks
 where is_sample = true;

-- ============================================================
-- ② friendships — 친구 신청·수락 표와 권한
--    (표는 이미 있고 권한만 비어 있던 상태를 고칩니다)
-- ============================================================
-- 0. uuid 기본값을 만드는 확장 (이미 있으면 그대로)
create extension if not exists pgcrypto;

-- 1. 표
create table if not exists public.friendships (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 예전에 만들어진 같은 이름의 표라면 빠진 칸만 더합니다.
alter table public.friendships add column if not exists requester_id uuid;
alter table public.friendships add column if not exists addressee_id uuid;
alter table public.friendships add column if not exists status       text not null default 'pending';
alter table public.friendships add column if not exists created_at   timestamptz not null default now();
alter table public.friendships add column if not exists updated_at   timestamptz not null default now();

-- id 가 uuid 인 표에만 기본값을 답니다. (예전 표가 숫자 id 를 쓰면 그대로 둡니다)
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'friendships'
       and column_name = 'id' and data_type = 'uuid'
  ) then
    execute 'alter table public.friendships alter column id set default gen_random_uuid()';
  end if;
end;
$$;

-- 예전 표의 다른 칸이 '반드시 채워야 함'으로 되어 있으면 새 신청이 막히므로 풀어 둡니다.
do $$
declare
  col record;
begin
  for col in
    select column_name from information_schema.columns
     where table_schema = 'public' and table_name = 'friendships'
       and is_nullable = 'NO'
       and column_default is null
       and column_name not in ('id', 'requester_id', 'addressee_id', 'status')
  loop
    execute format('alter table public.friendships alter column %I drop not null', col.column_name);
  end loop;
end;
$$;

-- 상태 값은 pending(신청) · accepted(친구) 둘뿐 (기존 줄이 있으면 그 줄은 건너뜀)
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'friendships_status_check' and conrelid = 'public.friendships'::regclass
  ) then
    alter table public.friendships add constraint friendships_status_check
      check (status is null or status in ('pending', 'accepted')) not valid;
  end if;
end;
$$;

-- 나 자신에게는 신청할 수 없습니다 (기존 줄이 있으면 그 줄은 건너뜀)
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'friendships_self_check' and conrelid = 'public.friendships'::regclass
  ) then
    alter table public.friendships add constraint friendships_self_check
      check (requester_id is null or addressee_id is null or requester_id <> addressee_id) not valid;
  end if;
end;
$$;

-- 두 사람 사이의 신청은 한 줄만 (이미 친구이거나 신청 중이면 다시 만들지 않습니다)
-- 예전 표에 같은 두 사람의 줄이 여러 개 있어도 표를 지우지 않고 이 규칙만 건너뜁니다.
do $$
begin
  if not exists (select 1 from pg_class where relname = 'friendships_pair_uidx') then
    begin
      execute 'create unique index friendships_pair_uidx on public.friendships '
              '(least(requester_id, addressee_id), greatest(requester_id, addressee_id))';
    exception when unique_violation then
      raise notice 'friendships: 같은 두 사람 사이의 줄이 여러 개라 고유 인덱스는 건너뜁니다.';
    end;
  end if;
end;
$$;

-- profiles 와의 연결(계정이 지워지면 신청도 함께) — 이미 있으면 건너뜀
do $$
begin
  if not exists (
    select 1 from pg_constraint c
      join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
     where c.conrelid = 'public.friendships'::regclass and c.contype = 'f' and a.attname = 'requester_id'
  ) then
    alter table public.friendships add constraint friendships_requester_fk
      foreign key (requester_id) references public.profiles (id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint c
      join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
     where c.conrelid = 'public.friendships'::regclass and c.contype = 'f' and a.attname = 'addressee_id'
  ) then
    alter table public.friendships add constraint friendships_addressee_fk
      foreign key (addressee_id) references public.profiles (id) on delete cascade not valid;
  end if;
end;
$$;

create index if not exists friendships_requester_idx on public.friendships (requester_id, created_at desc);
create index if not exists friendships_addressee_idx on public.friendships (addressee_id, created_at desc);

-- 2. 고칠 때마다 updated_at 을 새로 적습니다
create or replace function public.touch_friendships()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists friendships_touch on public.friendships;
create trigger friendships_touch before update on public.friendships
  for each row execute function public.touch_friendships();

-- 3. 접근 규칙 (RLS) — 신청한 사람과 받은 사람만 보고 고칠 수 있습니다
alter table public.friendships enable row level security;

-- 같은 이름의 예전 표에 붙어 있던 접근 규칙을 먼저 정리합니다.
do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
     where schemaname = 'public' and tablename = 'friendships'
  loop
    execute format('drop policy if exists %I on public.friendships', pol.policyname);
  end loop;
end;
$$;

drop policy if exists friendships_read on public.friendships;
create policy friendships_read on public.friendships
  for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- 신청: 로그인한 사람이 자기 이름으로만, 아직 수락되지 않은 상태로
drop policy if exists friendships_insert on public.friendships;
create policy friendships_insert on public.friendships
  for insert to authenticated
  with check (auth.uid() = requester_id and status = 'pending');

-- 수락: 받은 사람만. 신청한 사람은 기다리기만 합니다.
drop policy if exists friendships_update on public.friendships;
create policy friendships_update on public.friendships
  for update to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id)
  with check (auth.uid() = requester_id or auth.uid() = addressee_id);

-- 취소·거절·친구 끊기: 두 사람 중 누구나
drop policy if exists friendships_delete on public.friendships;
create policy friendships_delete on public.friendships
  for delete to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- 4. 권한 (표에 접근할 수 있는 역할을 정합니다)
grant select on public.friendships to anon, authenticated;
grant insert, update, delete on public.friendships to authenticated;

-- ============================================================
--  확인용 (선택) — 아래 두 줄의 주석을 풀고 실행하면 표가 보입니다.
-- ============================================================
-- select count(*) from public.friendships;
-- select * from public.friendships order by created_at desc limit 5;

-- ============================================================
-- ③ 창작 일지 — journals / journal_cheers
-- ============================================================
create extension if not exists pgcrypto;

create table if not exists public.journals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  pen_name    text not null default '',
  body        text not null,
  field       text,
  is_public   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists journals_created_idx on public.journals (created_at desc);
create index if not exists journals_user_idx    on public.journals (user_id);

create table if not exists public.journal_cheers (
  journal_id uuid not null references public.journals (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (journal_id, user_id)
);

alter table public.journals       enable row level security;
alter table public.journal_cheers enable row level security;

drop policy if exists journals_read   on public.journals;
drop policy if exists journals_insert on public.journals;
drop policy if exists journals_update on public.journals;
drop policy if exists journals_delete on public.journals;

-- 공개 일지는 누구나, 나만 보기 일지는 쓴 사람만 읽습니다.
create policy journals_read on public.journals
  for select using (is_public or auth.uid() = user_id);

create policy journals_insert on public.journals
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy journals_update on public.journals
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy journals_delete on public.journals
  for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists journal_cheers_read   on public.journal_cheers;
drop policy if exists journal_cheers_insert on public.journal_cheers;
drop policy if exists journal_cheers_delete on public.journal_cheers;

create policy journal_cheers_read on public.journal_cheers
  for select using (true);

create policy journal_cheers_insert on public.journal_cheers
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy journal_cheers_delete on public.journal_cheers
  for delete to authenticated
  using (auth.uid() = user_id);

grant select on public.journals to anon, authenticated;
grant insert, update, delete on public.journals to authenticated;
grant select on public.journal_cheers to anon, authenticated;
grant insert, delete on public.journal_cheers to authenticated;

-- ============================================================
-- ④ 협업 · 피드백 — cowork_posts / cowork_replies
-- ============================================================
create table if not exists public.cowork_posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  pen_name    text not null default '',
  title       text not null,
  field       text,
  kind        text not null default '피드백 요청' check (kind in ('피드백 요청', '함께 작업')),
  body        text not null,
  link_url    text,
  status      text not null default '열림' check (status in ('열림', '마감')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists cowork_posts_created_idx on public.cowork_posts (created_at desc);
create index if not exists cowork_posts_user_idx    on public.cowork_posts (user_id);

create table if not exists public.cowork_replies (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.cowork_posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  pen_name   text not null default '',
  body       text not null,
  created_at timestamptz not null default now()
);

create index if not exists cowork_replies_post_idx on public.cowork_replies (post_id);

alter table public.cowork_posts   enable row level security;
alter table public.cowork_replies enable row level security;

drop policy if exists cowork_posts_read   on public.cowork_posts;
drop policy if exists cowork_posts_insert on public.cowork_posts;
drop policy if exists cowork_posts_update on public.cowork_posts;
drop policy if exists cowork_posts_delete on public.cowork_posts;

create policy cowork_posts_read on public.cowork_posts
  for select using (true);

create policy cowork_posts_insert on public.cowork_posts
  for insert to authenticated
  with check (auth.uid() = user_id);

-- 작성자만 모집 상태(열림/마감)를 바꾸고 내용을 고칩니다.
create policy cowork_posts_update on public.cowork_posts
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy cowork_posts_delete on public.cowork_posts
  for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists cowork_replies_read   on public.cowork_replies;
drop policy if exists cowork_replies_insert on public.cowork_replies;
drop policy if exists cowork_replies_delete on public.cowork_replies;

create policy cowork_replies_read on public.cowork_replies
  for select using (true);

create policy cowork_replies_insert on public.cowork_replies
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy cowork_replies_delete on public.cowork_replies
  for delete to authenticated
  using (auth.uid() = user_id);

grant select on public.cowork_posts to anon, authenticated;
grant insert, update, delete on public.cowork_posts to authenticated;
grant select on public.cowork_replies to anon, authenticated;
grant insert, delete on public.cowork_replies to authenticated;

-- ============================================================
-- ⑤ 확인 — 실행 뒤 아래 결과가 보이면 준비 완료입니다
--    (남은 예시 작품 = 0)
-- ============================================================
select '남은 예시 작품' as 항목, count(*)::text as 값 from public.artworks where is_sample = true
union all
select '사람이 올린 작품', count(*)::text from public.artworks where is_sample = false
union all
select '창작 일지 표', case when to_regclass('public.journals') is null then '없음' else '준비됨' end
union all
select '협업 표', case when to_regclass('public.cowork_posts') is null then '없음' else '준비됨' end;
