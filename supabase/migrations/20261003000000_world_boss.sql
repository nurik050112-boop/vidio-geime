create table public.world_boss_state (
  id smallint primary key check (id = 1),
  hp numeric not null,
  max_hp numeric not null,
  updated_at timestamptz not null default now(),
  respawn_at timestamptz
);

insert into public.world_boss_state (id, hp, max_hp)
values (1, 10000000000000000000000, 10000000000000000000000);

create table public.world_boss_players (
  user_id uuid primary key references auth.users (id) on delete cascade,
  player_id text not null unique check (player_id ~ '^[A-Z0-9]{6}$'),
  nickname text not null,
  joined_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  last_attack_at timestamptz
);

alter table public.world_boss_state enable row level security;
alter table public.world_boss_players enable row level security;

create policy "authenticated users can view world boss"
  on public.world_boss_state for select to authenticated
  using (true);

create policy "authenticated users can view world boss players"
  on public.world_boss_players for select to authenticated
  using (true);

create or replace function public.world_boss_snapshot()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'hp', boss.hp,
    'maxHp', boss.max_hp,
    'respawnAt', boss.respawn_at,
    'players', coalesce((
      select jsonb_agg(jsonb_build_object(
        'playerId', player.player_id,
        'name', player.nickname,
        'joinedAt', player.joined_at
      ) order by player.joined_at)
      from public.world_boss_players player
      where player.last_seen > now() - interval '20 seconds'
    ), '[]'::jsonb)
  )
  from public.world_boss_state boss
  where boss.id = 1;
$$;

create or replace function public.join_world_boss(
  p_player_id text,
  p_nickname text,
  p_join_with_player_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_id text := upper(regexp_replace(coalesce(p_player_id, ''), '[^A-Za-z0-9]', '', 'g'));
  target_id text := nullif(upper(regexp_replace(coalesce(p_join_with_player_id, ''), '[^A-Za-z0-9]', '', 'g')), '');
  active_count integer;
begin
  if current_user_id is null then
    raise exception 'Войди в аккаунт, чтобы попасть в другое измерение.';
  end if;
  if length(normalized_id) <> 6 then
    raise exception 'Не удалось проверить ID игрока.';
  end if;

  perform 1 from public.world_boss_state where id = 1 for update;
  delete from public.world_boss_players where last_seen <= now() - interval '20 seconds';

  if target_id is not null and not exists (
    select 1 from public.world_boss_players
    where player_id = target_id and user_id <> current_user_id
  ) then
    raise exception 'Игрок с таким ID сейчас не в измерении.';
  end if;

  if not exists (select 1 from public.world_boss_players where user_id = current_user_id) then
    select count(*) into active_count from public.world_boss_players;
    if active_count >= 50 then
      raise exception 'Измерение заполнено: максимум 50 игроков.';
    end if;
  end if;

  insert into public.world_boss_players (user_id, player_id, nickname)
  values (current_user_id, normalized_id, left(coalesce(nullif(trim(p_nickname), ''), 'Игрок'), 30))
  on conflict (user_id) do update
    set player_id = excluded.player_id,
        nickname = excluded.nickname,
        last_seen = now();

  update public.world_boss_state
    set hp = max_hp, respawn_at = null, updated_at = now()
    where id = 1 and hp <= 0 and respawn_at <= now();

  return public.world_boss_snapshot();
end;
$$;

create or replace function public.attack_world_boss()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  saved_weapon_damage text;
  damage numeric;
begin
  if current_user_id is null then
    raise exception 'Войди в аккаунт, чтобы сражаться с мировым боссом.';
  end if;

  perform 1 from public.world_boss_state where id = 1 for update;
  if not exists (
    select 1 from public.world_boss_players
    where user_id = current_user_id and last_seen > now() - interval '20 seconds'
  ) then
    raise exception 'Сначала войди в измерение.';
  end if;

  update public.world_boss_players
    set last_seen = now(), last_attack_at = now()
    where user_id = current_user_id
      and (last_attack_at is null or last_attack_at <= now() - interval '1 second');
  if not found then
    raise exception 'Подожди секунду перед следующим ударом.';
  end if;

  select save_data #>> '{equippedWeapon,damage}' into saved_weapon_damage
    from public.game_saves where user_id = current_user_id;
  if saved_weapon_damage is not null
      and length(saved_weapon_damage) <= 30
      and saved_weapon_damage ~ '^[0-9]+([.][0-9]+)?$' then
    damage := greatest(1, least(saved_weapon_damage::numeric, 100000000000000000));
  else
    damage := 100;
  end if;

  update public.world_boss_state
    set hp = max_hp, respawn_at = null, updated_at = now()
    where id = 1 and hp <= 0 and respawn_at <= now();

  if (select hp <= 0 from public.world_boss_state where id = 1) then
    return public.world_boss_snapshot() || jsonb_build_object('damage', 0);
  end if;

  update public.world_boss_state
    set hp = greatest(0, hp - damage),
        respawn_at = case when hp - damage <= 0 then now() + interval '1 minute' else null end,
        updated_at = now()
    where id = 1;

  return public.world_boss_snapshot() || jsonb_build_object('damage', damage);
end;
$$;

create or replace function public.leave_world_boss()
returns void
language sql
security definer
set search_path = public, auth
as $$
  delete from public.world_boss_players where user_id = auth.uid();
$$;

revoke all on function public.world_boss_snapshot() from public, anon;
revoke all on function public.join_world_boss(text, text, text) from public, anon;
revoke all on function public.attack_world_boss() from public, anon;
revoke all on function public.leave_world_boss() from public, anon;
grant execute on function public.world_boss_snapshot() to authenticated;
grant execute on function public.join_world_boss(text, text, text) to authenticated;
grant execute on function public.attack_world_boss() to authenticated;
grant execute on function public.leave_world_boss() to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'world_boss_state'
  ) then
    alter publication supabase_realtime add table public.world_boss_state;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'world_boss_players'
  ) then
    alter publication supabase_realtime add table public.world_boss_players;
  end if;
end;
$$;
