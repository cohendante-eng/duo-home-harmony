create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),

  partner_connection_id uuid not null references public.partner_connections(id) on delete cascade,

  type text not null,
  state text not null default 'requested',

  owner_id uuid not null references auth.users(id) on delete cascade,
  creator_id uuid not null references auth.users(id) on delete cascade,

  payload jsonb not null default '{}'::jsonb,

  due_at timestamptz,
  reminder_sent_at timestamptz,

  block_count integer not null default 0,

  modifier text,
  modifier_for uuid references auth.users(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cards enable row level security;

drop policy if exists "Users can view cards in their partner connection"
on public.cards;

drop policy if exists "Users can create cards in their partner connection"
on public.cards;

drop policy if exists "Users can update cards in their partner connection"
on public.cards;

create policy "Users can view cards in their partner connection"
on public.cards
for select
to authenticated
using (
  exists (
    select 1
    from public.partner_connections pc
    where pc.id = cards.partner_connection_id
      and pc.status = 'active'
      and (
        pc.user_a_id = auth.uid()
        or pc.user_b_id = auth.uid()
      )
  )
);

create policy "Users can create cards in their partner connection"
on public.cards
for insert
to authenticated
with check (
  creator_id = auth.uid()
  and exists (
    select 1
    from public.partner_connections pc
    where pc.id = cards.partner_connection_id
      and pc.status = 'active'
      and (
        pc.user_a_id = auth.uid()
        or pc.user_b_id = auth.uid()
      )
  )
);

create policy "Users can update cards in their partner connection"
on public.cards
for update
to authenticated
using (
  exists (
    select 1
    from public.partner_connections pc
    where pc.id = cards.partner_connection_id
      and pc.status = 'active'
      and (
        pc.user_a_id = auth.uid()
        or pc.user_b_id = auth.uid()
      )
  )
)
with check (
  exists (
    select 1
    from public.partner_connections pc
    where pc.id = cards.partner_connection_id
      and pc.status = 'active'
      and (
        pc.user_a_id = auth.uid()
        or pc.user_b_id = auth.uid()
      )
  )
);