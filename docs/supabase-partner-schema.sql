create table if not exists public.partner_invitations (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invitee_email text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create table if not exists public.partner_connections (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references auth.users(id) on delete cascade,
  user_b_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.partner_invitations enable row level security;
alter table public.partner_connections enable row level security;

drop policy if exists "Users can create their own invitations"
on public.partner_invitations;

drop policy if exists "Users can view invitations they sent or received"
on public.partner_invitations;

drop policy if exists "Users can update invitations they sent"
on public.partner_invitations;

drop policy if exists "Users can view their own partner connections"
on public.partner_connections;

drop policy if exists "Users can create their own partner connections"
on public.partner_connections;

drop policy if exists "Users can update their own partner connections"
on public.partner_connections;

create policy "Users can create their own invitations"
on public.partner_invitations
for insert
to authenticated
with check (
  inviter_id = auth.uid()
);

create policy "Users can view invitations they sent or received"
on public.partner_invitations
for select
to authenticated
using (
  inviter_id = auth.uid()
  or invitee_email = auth.jwt() ->> 'email'
);

create policy "Users can update invitations they sent"
on public.partner_invitations
for update
to authenticated
using (
  inviter_id = auth.uid()
)
with check (
  inviter_id = auth.uid()
);

create policy "Users can view their own partner connections"
on public.partner_connections
for select
to authenticated
using (
  user_a_id = auth.uid()
  or user_b_id = auth.uid()
);

create policy "Users can create their own partner connections"
on public.partner_connections
for insert
to authenticated
with check (
  user_a_id = auth.uid()
  or user_b_id = auth.uid()
);

create policy "Users can update their own partner connections"
on public.partner_connections
for update
to authenticated
using (
  user_a_id = auth.uid()
  or user_b_id = auth.uid()
)
with check (
  user_a_id = auth.uid()
  or user_b_id = auth.uid()
);