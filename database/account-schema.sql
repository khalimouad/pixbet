create table public.pixbet_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (char_length(display_name) between 2 and 40),
 created_at timestamptz not null default now()
);
create table public.pixbet_favorites (
 user_id uuid not null references auth.users(id) on delete cascade,
 game_id text not null check (char_length(game_id) between 1 and 40),
 created_at timestamptz not null default now(),
 primary key(user_id,game_id)
);
create table public.pixbet_game_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 game_id text not null,
 game_name text not null,
 provider text not null,
 mode text not null default 'demo' check (mode='demo'),
 created_at timestamptz not null default now()
);
create index pixbet_sessions_owner_date on public.pixbet_game_sessions(user_id,created_at desc);
alter table public.pixbet_profiles enable row level security;
alter table public.pixbet_favorites enable row level security;
alter table public.pixbet_game_sessions enable row level security;
revoke all on public.pixbet_profiles,public.pixbet_favorites,public.pixbet_game_sessions from anon;
grant select,insert,update on public.pixbet_profiles to authenticated;
grant select,insert,delete on public.pixbet_favorites to authenticated;
grant select,insert on public.pixbet_game_sessions to authenticated;
create policy profiles_select on public.pixbet_profiles for select to authenticated using ((select auth.uid())=user_id);
create policy profiles_insert on public.pixbet_profiles for insert to authenticated with check ((select auth.uid())=user_id);
create policy profiles_update on public.pixbet_profiles for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy favorites_select on public.pixbet_favorites for select to authenticated using ((select auth.uid())=user_id);
create policy favorites_insert on public.pixbet_favorites for insert to authenticated with check ((select auth.uid())=user_id);
create policy favorites_delete on public.pixbet_favorites for delete to authenticated using ((select auth.uid())=user_id);
create policy sessions_select on public.pixbet_game_sessions for select to authenticated using ((select auth.uid())=user_id);
create policy sessions_insert on public.pixbet_game_sessions for insert to authenticated with check ((select auth.uid())=user_id);

