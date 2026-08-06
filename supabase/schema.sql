  -- ============================================================
  -- Rocafella Finance - Supabase schema
  -- Run this in the Supabase SQL Editor (Dashboard > SQL > New query)
  -- ============================================================

  -- ---------- Tables ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  role text not null default 'client',
  account_number text unique,
  email_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- migrate existing databases (create table if not exists does not alter)
alter table public.profiles add column if not exists account_number text unique;
alter table public.profiles add column if not exists email_verified boolean not null default false;

  create table if not exists public.transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    type text not null check (type in ('income', 'expense')),
    category text not null,
    description text,
    amount numeric(12, 2) not null check (amount > 0),
    date date not null default current_date,
    created_at timestamptz not null default now()
  );

  create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    client text not null,
    item text not null,
    amount numeric(12, 2) not null,
    status text not null default 'Pending'
      check (status in ('Completed', 'In Progress', 'Pending')),
    created_at timestamptz not null default now()
  );

  create table if not exists public.portfolio_snapshots (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    period date not null,
    value numeric(12, 2) not null,
    created_at timestamptz not null default now(),
    unique (user_id, period)
  );

  create table if not exists public.clients (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    email text,
    created_at timestamptz not null default now()
  );

  -- ---------- Row Level Security ----------

  alter table public.profiles enable row level security;
  alter table public.transactions enable row level security;
  alter table public.orders enable row level security;
  alter table public.portfolio_snapshots enable row level security;
  alter table public.clients enable row level security;

  drop policy if exists "Users can view own profile" on public.profiles;
  create policy "Users can view own profile"
    on public.profiles for select using (auth.uid() = id);
  drop policy if exists "Users can update own profile" on public.profiles;
  create policy "Users can update own profile"
    on public.profiles for update using (auth.uid() = id);

  drop policy if exists "Users can view own transactions" on public.transactions;
  create policy "Users can view own transactions"
    on public.transactions for select using (auth.uid() = user_id);
  drop policy if exists "Users can insert own transactions" on public.transactions;
  create policy "Users can insert own transactions"
    on public.transactions for insert with check (auth.uid() = user_id);
  drop policy if exists "Users can update own transactions" on public.transactions;
  create policy "Users can update own transactions"
    on public.transactions for update using (auth.uid() = user_id);
  drop policy if exists "Users can delete own transactions" on public.transactions;
  create policy "Users can delete own transactions"
    on public.transactions for delete using (auth.uid() = user_id);

  drop policy if exists "Users can view own orders" on public.orders;
  create policy "Users can view own orders"
    on public.orders for select using (auth.uid() = user_id);
  drop policy if exists "Users can insert own orders" on public.orders;
  create policy "Users can insert own orders"
    on public.orders for insert with check (auth.uid() = user_id);
  drop policy if exists "Users can update own orders" on public.orders;
  create policy "Users can update own orders"
    on public.orders for update using (auth.uid() = user_id);
  drop policy if exists "Users can delete own orders" on public.orders;
  create policy "Users can delete own orders"
    on public.orders for delete using (auth.uid() = user_id);

  drop policy if exists "Users can view own portfolio snapshots" on public.portfolio_snapshots;
  create policy "Users can view own portfolio snapshots"
    on public.portfolio_snapshots for select using (auth.uid() = user_id);
  drop policy if exists "Users can insert own portfolio snapshots" on public.portfolio_snapshots;
  create policy "Users can insert own portfolio snapshots"
    on public.portfolio_snapshots for insert with check (auth.uid() = user_id);
  drop policy if exists "Users can update own portfolio snapshots" on public.portfolio_snapshots;
  create policy "Users can update own portfolio snapshots"
    on public.portfolio_snapshots for update using (auth.uid() = user_id);
  drop policy if exists "Users can delete own portfolio snapshots" on public.portfolio_snapshots;
  create policy "Users can delete own portfolio snapshots"
    on public.portfolio_snapshots for delete using (auth.uid() = user_id);

  drop policy if exists "Users can view own clients" on public.clients;
  create policy "Users can view own clients"
    on public.clients for select using (auth.uid() = user_id);
  drop policy if exists "Users can insert own clients" on public.clients;
  create policy "Users can insert own clients"
    on public.clients for insert with check (auth.uid() = user_id);
  drop policy if exists "Users can update own clients" on public.clients;
  create policy "Users can update own clients"
    on public.clients for update using (auth.uid() = user_id);
  drop policy if exists "Users can delete own clients" on public.clients;
  create policy "Users can delete own clients"
    on public.clients for delete using (auth.uid() = user_id);

  -- ---------- Indexes ----------

  create index if not exists transactions_user_date_idx
    on public.transactions (user_id, date);
  create index if not exists orders_user_created_idx
    on public.orders (user_id, created_at desc);
  create index if not exists snapshots_user_period_idx
    on public.portfolio_snapshots (user_id, period);
  create index if not exists clients_user_idx
    on public.clients (user_id);

  -- ---------- Realtime ----------

  do $$
  begin
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'transactions') then
      alter publication supabase_realtime add table public.transactions;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders') then
      alter publication supabase_realtime add table public.orders;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'portfolio_snapshots') then
      alter publication supabase_realtime add table public.portfolio_snapshots;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'clients') then
      alter publication supabase_realtime add table public.clients;
    end if;
  end $$;

  -- ============================================================
  -- Seed demo data for every newly created user.
  -- Every signup automatically gets realistic dashboard data.
  -- ============================================================

  create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer set search_path = public
  as $$
  declare
    new_account text;
  begin
    -- unique 10-digit account number
    loop
      new_account := lpad(floor(random() * 10000000000)::bigint::text, 10, '0');
      exit when not exists (select 1 from public.profiles where account_number = new_account);
    end loop;

    -- profile
    insert into public.profiles (id, full_name, email, role, account_number, email_verified)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      new.email,
      'client',
      new_account,
      new.email_confirmed_at is not null
    );

    -- income, one per month for the last 6 months
    insert into public.transactions (user_id, type, category, description, amount, date)
    select
      new.id, 'income', 'Sales', 'Monthly revenue',
      (array[4200.00, 3800.00, 5100.00, 4600.00, 5400.00, 6200.00])[n + 1],
      (date_trunc('month', now()) - (n * interval '1 month'))::date
    from generate_series(5, 0, -1) as n;

    -- expenses split across categories per month
    insert into public.transactions (user_id, type, category, description, amount, date)
    select
      new.id, 'expense', c.category, c.description,
      round(((array[2800.00, 3100.00, 2600.00, 3300.00, 2900.00, 3500.00])[n + 1] * c.weight)::numeric, 2),
      (date_trunc('month', now()) - (n * interval '1 month'))::date
    from generate_series(5, 0, -1) as n
    cross join (
      values
        ('Shopping', 'Boutique purchases', 0.40),
        ('Bills', 'Utilities & rent', 0.25),
        ('Food', 'Dining & groceries', 0.20),
        ('Transport', 'Travel & fuel', 0.10),
        ('Other', 'Miscellaneous', 0.05)
    ) as c(category, description, weight);

    -- portfolio snapshots
    insert into public.portfolio_snapshots (user_id, period, value)
    select
      new.id,
      (date_trunc('month', now()) - (n * interval '1 month'))::date,
      (array[18400.00, 19200.00, 20800.00, 21500.00, 23200.00, 24890.00])[n + 1]
    from generate_series(5, 0, -1) as n;

    -- orders
    insert into public.orders (user_id, client, item, amount, status, created_at) values
      (new.id, 'Sarah Johnson', 'Summer Collection', 1200.00, 'Completed', now() - interval '6 days'),
      (new.id, 'Marcus Lee', 'Tailored Suit', 3400.00, 'In Progress', now() - interval '4 days'),
      (new.id, 'Elena Rodriguez', 'Accessories Set', 680.00, 'Completed', now() - interval '3 days'),
      (new.id, 'David Kim', 'Winter Coat', 2100.00, 'Pending', now() - interval '1 day'),
      (new.id, 'Amara Okafor', 'Custom Dress', 1850.00, 'In Progress', now() - interval '5 hours');

    -- clients
    insert into public.clients (user_id, name, email) values
      (new.id, 'Sarah Johnson', 'sarah@example.com'),
      (new.id, 'Marcus Lee', 'marcus@example.com'),
      (new.id, 'Elena Rodriguez', 'elena@example.com'),
      (new.id, 'David Kim', 'david@example.com'),
      (new.id, 'Amara Okafor', 'amara@example.com'),
      (new.id, 'Liam Chen', 'liam@example.com'),
      (new.id, 'Nadia Hassan', 'nadia@example.com'),
      (new.id, 'Oliver Wright', 'oliver@example.com'),
      (new.id, 'Sofia Rossi', 'sofia@example.com'),
      (new.id, 'Mateo Alvarez', 'mateo@example.com'),
      (new.id, 'Isla Murray', 'isla@example.com'),
      (new.id, 'Hiro Tanaka', 'hiro@example.com');

    return new;
  end;
  $$;

  drop trigger if exists on_auth_user_created on auth.users;
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

  -- keep email_verified in sync when the user confirms their email
  create or replace function public.sync_email_verified()
  returns trigger
  language plpgsql
  security definer set search_path = public
  as $$
  begin
    update public.profiles
    set email_verified = new.email_confirmed_at is not null
    where id = new.id;
    return new;
  end;
  $$;

  drop trigger if exists on_auth_user_email_confirmed on auth.users;
  create trigger on_auth_user_email_confirmed
    after update of email_confirmed_at on auth.users
    for each row execute procedure public.sync_email_verified();

  -- ---------- Backfill for existing users ----------

  update public.profiles p
  set email_verified = u.email_confirmed_at is not null
  from auth.users u
  where u.id = p.id and p.email_verified is distinct from (u.email_confirmed_at is not null);

  do $$
  declare
    r record;
    new_account text;
  begin
    for r in select id from public.profiles where account_number is null loop
      loop
        new_account := lpad(floor(random() * 10000000000)::bigint::text, 10, '0');
        exit when not exists (select 1 from public.profiles where account_number = new_account);
      end loop;
      update public.profiles set account_number = new_account where id = r.id;
    end loop;
  end $$;
