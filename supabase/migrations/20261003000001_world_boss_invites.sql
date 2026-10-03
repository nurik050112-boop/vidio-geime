create table public.world_boss_online_players (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid not null,
  player_id text not null check (player_id ~ '^[A-Z0-9]{6}$'),
  nickname text not null,
  last_seen timestamptz not null default now(),
  unique (user_id, session_id)
);

create index world_boss_online_players_last_seen_idx
  on public.world_boss_online_players (last_seen desc);
create index world_boss_online_players_player_id_idx
  on public.world_boss_online_players (player_id);

create table public.world_boss_invites (
  id uuid primary key default gen_random_uuid(),
  sender_user_id uuid not null references auth.users (id) on delete cascade,
  recipient_user_id uuid not null references auth.users (id) on delete cascade,
  sender_player_id text not null check (sender_player_id ~ '^[A-Z0-9]{6}$'),
  sender_name text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '2 minutes',
  check (sender_user_id <> recipient_user_id)
);

create index world_boss_invites_recipient_pending_idx
  on public.world_boss_invites (recipient_user_id, created_at desc)
  where status = 'pending';

alter table public.world_boss_online_players enable row level security;
alter table public.world_boss_invites enable row level security;

create or replace function public.heartbeat_world_boss_presence(
  p_session_id uuid,
  p_player_id text,
  p_nickname text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_id text := upper(regexp_replace(coalesce(p_player_id, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if current_user_id is null then
    raise exception 'Войди в аккаунт, чтобы появиться в списке игроков онлайн.';
  end if;
  if length(normalized_id) <> 6 then
    raise exception 'Не удалось проверить ID игрока.';
  end if;

  insert into public.world_boss_online_players (user_id, session_id, player_id, nickname)
  values (current_user_id, p_session_id, normalized_id, left(coalesce(nullif(trim(p_nickname), ''), 'Игрок'), 30))
  on conflict (user_id, session_id) do update
    set player_id = excluded.player_id,
        nickname = excluded.nickname,
        last_seen = now();

  delete from public.world_boss_online_players
    where last_seen <= now() - interval '30 seconds';
  delete from public.world_boss_invites
    where expires_at <= now() or status <> 'pending';
end;
$$;

create or replace function public.leave_world_boss_presence(p_session_id uuid)
returns void
language sql
security definer
set search_path = public, auth
as $$
  delete from public.world_boss_online_players
  where user_id = auth.uid() and session_id = p_session_id;
$$;

create or replace function public.list_world_boss_online_players()
returns jsonb
language sql
security definer
set search_path = public, auth
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'playerId', player.player_id,
    'name', player.nickname,
    'lastSeen', player.last_seen
  ) order by player.nickname), '[]'::jsonb)
  from public.world_boss_online_players player
  where player.user_id <> auth.uid()
    and player.last_seen > now() - interval '20 seconds';
$$;

create or replace function public.send_world_boss_invite(p_target_player_id text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_target text := upper(regexp_replace(coalesce(p_target_player_id, ''), '[^A-Za-z0-9]', '', 'g'));
  target_user_id uuid;
  active_sender record;
begin
  if current_user_id is null then
    raise exception 'Войди в аккаунт, чтобы приглашать игроков.';
  end if;
  if length(normalized_target) <> 6 then
    raise exception 'Введи корректный ID игрока.';
  end if;

  select player_id, nickname into active_sender
    from public.world_boss_online_players
    where user_id = current_user_id and last_seen > now() - interval '20 seconds';
  if not found then
    raise exception 'Тебя нет в списке игроков онлайн. Перезайди в игру.';
  end if;

  select user_id into target_user_id
    from public.world_boss_online_players
    where player_id = normalized_target
      and user_id <> current_user_id
      and last_seen > now() - interval '20 seconds'
    limit 1;
  if target_user_id is null then
    raise exception 'Игрок с таким ID сейчас не в сети.';
  end if;

  if exists (
    select 1 from public.world_boss_invites
    where sender_user_id = current_user_id
      and recipient_user_id = target_user_id
      and status = 'pending'
      and expires_at > now()
  ) then
    raise exception 'Приглашение этому игроку уже отправлено.';
  end if;

  if (
    select count(*) from public.world_boss_invites
    where sender_user_id = current_user_id
      and created_at > now() - interval '1 minute'
  ) >= 10 then
    raise exception 'Подожди немного перед следующими приглашениями.';
  end if;

  insert into public.world_boss_invites (
    sender_user_id, recipient_user_id, sender_player_id, sender_name
  )
  values (
    current_user_id, target_user_id, active_sender.player_id, active_sender.nickname
  );
end;
$$;

create or replace function public.list_world_boss_invites()
returns jsonb
language sql
security definer
set search_path = public, auth
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', invite.id,
    'playerId', invite.sender_player_id,
    'name', invite.sender_name,
    'createdAt', invite.created_at
  ) order by invite.created_at desc), '[]'::jsonb)
  from public.world_boss_invites invite
  where invite.recipient_user_id = auth.uid()
    and invite.status = 'pending'
    and invite.expires_at > now();
$$;

create or replace function public.respond_world_boss_invite(
  p_invite_id uuid,
  p_accept boolean,
  p_player_id text,
  p_nickname text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  invite public.world_boss_invites%rowtype;
  boss_snapshot jsonb;
begin
  if current_user_id is null then
    raise exception 'Войди в аккаунт, чтобы принять приглашение.';
  end if;

  select * into invite from public.world_boss_invites
    where id = p_invite_id
      and recipient_user_id = current_user_id
      and status = 'pending'
      and expires_at > now()
    for update;
  if not found then
    raise exception 'Приглашение уже истекло или было обработано.';
  end if;

  if p_accept then
    boss_snapshot := public.join_world_boss(p_player_id, p_nickname, null);
    update public.world_boss_invites set status = 'accepted' where id = invite.id;
    return boss_snapshot;
  end if;

  update public.world_boss_invites set status = 'declined' where id = invite.id;
  return jsonb_build_object('declined', true);
end;
$$;

revoke all on function public.heartbeat_world_boss_presence(uuid, text, text) from public, anon;
revoke all on function public.leave_world_boss_presence(uuid) from public, anon;
revoke all on function public.list_world_boss_online_players() from public, anon;
revoke all on function public.send_world_boss_invite(text) from public, anon;
revoke all on function public.list_world_boss_invites() from public, anon;
revoke all on function public.respond_world_boss_invite(uuid, boolean, text, text) from public, anon;
grant execute on function public.heartbeat_world_boss_presence(uuid, text, text) to authenticated;
grant execute on function public.leave_world_boss_presence(uuid) to authenticated;
grant execute on function public.list_world_boss_online_players() to authenticated;
grant execute on function public.send_world_boss_invite(text) to authenticated;
grant execute on function public.list_world_boss_invites() to authenticated;
grant execute on function public.respond_world_boss_invite(uuid, boolean, text, text) to authenticated;
