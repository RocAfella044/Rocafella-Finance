
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  phone text unique,
  role text not null default 'client',
  account_number text unique,
  email_verified boolean not null default false,
  password_changed_at timestamptz,
  created_at timestamptz not null default now()
);

-- migrate existing databases (create table if not exists does not alter)
alter table public.profiles add column if not exists phone text unique;
alter table public.profiles add column if not exists account_number text unique;
alter table public.profiles add column if not exists email_verified boolean not null default false;
alter table public.profiles add column if not exists password_changed_at timestamptz;

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

  create table if not exists public.clients (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    email text,
    created_at timestamptz not null default now()
  );

  create table if not exists public.deposits (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    label text not null default 'Fixed Deposit',
    amount numeric(12, 2) not null check (amount > 0),
    rate numeric(4, 2) not null default 4.5,
    maturity_date date,
    created_at timestamptz not null default now()
  );

  -- ---------- Row Level Security ----------

  alter table public.profiles enable row level security;
  alter table public.transactions enable row level security;
  alter table public.orders enable row level security;
  alter table public.clients enable row level security;
  alter table public.deposits enable row level security;

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

  drop policy if exists "Users can view own deposits" on public.deposits;
  create policy "Users can view own deposits"
    on public.deposits for select using (auth.uid() = user_id);
  drop policy if exists "Users can insert own deposits" on public.deposits;
  create policy "Users can insert own deposits"
    on public.deposits for insert with check (auth.uid() = user_id);
  drop policy if exists "Users can update own deposits" on public.deposits;
  create policy "Users can update own deposits"
    on public.deposits for update using (auth.uid() = user_id);
  drop policy if exists "Users can delete own deposits" on public.deposits;
  create policy "Users can delete own deposits"
    on public.deposits for delete using (auth.uid() = user_id);

  -- ---------- Indexes ----------

  create index if not exists transactions_user_date_idx
    on public.transactions (user_id, date);
  create index if not exists orders_user_created_idx
    on public.orders (user_id, created_at desc);
  create index if not exists clients_user_idx
    on public.clients (user_id);
  create index if not exists deposits_user_idx
    on public.deposits (user_id);

  -- ---------- Realtime ----------

  do $$
  begin
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'transactions') then
      alter publication supabase_realtime add table public.transactions;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders') then
      alter publication supabase_realtime add table public.orders;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'clients') then
      alter publication supabase_realtime add table public.clients;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'deposits') then
      alter publication supabase_realtime add table public.deposits;
    end if;
  end $$;

  -- ============================================================
  -- New users start with a fresh, empty account.
  -- No seeded transactions, orders, clients or deposits.
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
    insert into public.profiles (id, full_name, email, phone, role, account_number, email_verified)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      new.email,
      new.raw_user_meta_data->>'phone',
      'client',
      new_account,
      new.email_confirmed_at is not null
    );

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

  create or replace function public.send_transfer(
    p_recipient_phone text,
    p_amount numeric
  )
  returns table (success boolean, message text)
  language plpgsql
  security definer set search_path = public
  as $$
  declare
    v_recipient_id uuid;
    v_recipient_name text;
    v_balance numeric;
    v_sender_id uuid := auth.uid();
  begin
    if v_sender_id is null then
      return query select false, 'You must be signed in to transfer.';
      return;
    end if;

    if p_amount <= 50 then
      return query select false, 'Transfer amount must be more than NPR 50.';
      return;
    end if;

    select id, full_name into v_recipient_id, v_recipient_name
    from public.profiles
    where regexp_replace(regexp_replace(regexp_replace(phone, '[^0-9]', '', 'g'), '^977', ''), '^0+', '')
        = regexp_replace(regexp_replace(regexp_replace(p_recipient_phone, '[^0-9]', '', 'g'), '^977', ''), '^0+', '')
    limit 1;

    if v_recipient_id is null then
      return query select false, 'No account found for that phone number. Transfer failed.';
      return;
    end if;

    if v_recipient_id = v_sender_id then
      return query select false, 'You cannot transfer to your own account.';
      return;
    end if;

    select coalesce(sum(case when type = 'income' then amount else -amount end), 0)
    into v_balance
    from public.transactions
    where user_id = v_sender_id;

    if v_balance < p_amount then
      return query select false, format('Insufficient balance. Available balance: %s.', round(v_balance, 2));
      return;
    end if;

    insert into public.transactions (user_id, type, category, description, amount, date)
    values
      (v_sender_id, 'expense', 'Transfer', format('Transfer to %s (%s)', v_recipient_name, p_recipient_phone), p_amount, current_date),
      (v_recipient_id, 'income', 'Transfer', format('Transfer from %s', p_recipient_phone), p_amount, current_date);

    return query select true, format('Transfer of %s sent to %s.', p_amount, v_recipient_name);
  end;
  $$;

  -- ---------- Backfill for existing users ----------

  -- normalize older phones stored without the +977 country code
  update public.profiles
  set phone = '+977' || phone
  where phone ~ '^[0-9]{10}$';

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
