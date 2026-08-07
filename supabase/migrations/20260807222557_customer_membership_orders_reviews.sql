-- Customer membership, order tracking, cart activity and moderated reviews.
-- All browser-visible tables use Row Level Security. Admin routes use only the
-- server-side service-role client after the ADMIN_EMAILS allow-list is checked.

create extension if not exists pgcrypto;

-- Member profile ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists avatar_url text,
  add column if not exists created_at timestamp with time zone not null default now(),
  add column if not exists updated_at timestamp with time zone not null default now();

-- Order header and immutable order-line snapshots ---------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  order_number text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total numeric(12, 2) not null default 0,
  shipping_address text,
  shipping_amount numeric(12, 2) not null default 0,
  currency text not null default 'TRY',
  customer_name text,
  customer_email text,
  customer_phone text,
  shipping_city text,
  tracking_provider text,
  tracking_number text,
  tracking_url text,
  payment_provider text,
  payment_ref text,
  paid_at timestamp with time zone,
  shipped_at timestamp with time zone,
  delivered_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.orders
  add column if not exists order_number text,
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists customer_phone text,
  add column if not exists shipping_city text,
  add column if not exists shipping_amount numeric(12, 2) not null default 0,
  add column if not exists currency text not null default 'TRY',
  add column if not exists tracking_provider text,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text,
  add column if not exists paid_at timestamp with time zone,
  add column if not exists shipped_at timestamp with time zone,
  add column if not exists delivered_at timestamp with time zone,
  add column if not exists cancelled_at timestamp with time zone,
  add column if not exists updated_at timestamp with time zone not null default now();

create unique index if not exists orders_order_number_unique_idx
  on public.orders (order_number)
  where order_number is not null;

create index if not exists orders_user_created_at_idx
  on public.orders (user_id, created_at desc);

create index if not exists orders_status_created_at_idx
  on public.orders (status, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  product_slug text not null,
  material text,
  image_url text,
  variant_details text,
  engraving text,
  unit_price numeric(12, 2) not null,
  quantity integer not null check (quantity > 0 and quantity <= 99),
  created_at timestamp with time zone not null default now()
);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  visible_to_customer boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone not null default now()
);

create index if not exists order_events_order_created_at_idx
  on public.order_events (order_id, created_at asc);

-- Moderated, purchase-verified reviews -------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  author_name text not null,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  verified_purchase boolean not null default false,
  admin_note text,
  approved_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.reviews
  add column if not exists product_id uuid references public.products(id) on delete cascade,
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists order_id uuid references public.orders(id) on delete set null,
  add column if not exists author_name text,
  add column if not exists rating smallint,
  add column if not exists title text,
  add column if not exists body text,
  add column if not exists status text not null default 'pending',
  add column if not exists verified_purchase boolean not null default false,
  add column if not exists admin_note text,
  add column if not exists approved_at timestamp with time zone,
  add column if not exists created_at timestamp with time zone not null default now(),
  add column if not exists updated_at timestamp with time zone not null default now();

create index if not exists reviews_product_status_created_at_idx
  on public.reviews (product_id, status, created_at desc);

create index if not exists reviews_user_created_at_idx
  on public.reviews (user_id, created_at desc);

-- Cart data is private to the customer and sent only through a verified
-- server route. Snapshots support the admin's current-cart overview while
-- events retain an audit trail of additions, removals and quantity changes.
create table if not exists public.cart_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  item_count integer not null default 0 check (item_count >= 0),
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  last_action text,
  updated_at timestamp with time zone not null default now()
);

create index if not exists cart_snapshots_updated_at_idx
  on public.cart_snapshots (updated_at desc);

create table if not exists public.cart_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('restore', 'add', 'quantity_change', 'remove', 'clear', 'checkout')),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  item_count integer not null default 0 check (item_count >= 0),
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  created_at timestamp with time zone not null default now()
);

create index if not exists cart_events_user_created_at_idx
  on public.cart_events (user_id, created_at desc);

-- Auth trigger. User metadata is used only for a display value; authorization
-- is never based on it.
create or replace function public.handle_new_customer_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Müşteri'
    )
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

revoke all on function public.handle_new_customer_profile() from public;
grant execute on function public.handle_new_customer_profile() to supabase_auth_admin;

drop trigger if exists on_auth_user_created_customer_profile on auth.users;
create trigger on_auth_user_created_customer_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_customer_profile();

create or replace function public.touch_customer_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.touch_customer_updated_at() from public;

drop trigger if exists profiles_touch_customer_updated_at on public.profiles;
create trigger profiles_touch_customer_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_customer_updated_at();

drop trigger if exists orders_touch_customer_updated_at on public.orders;
create trigger orders_touch_customer_updated_at
  before update on public.orders
  for each row execute procedure public.touch_customer_updated_at();

drop trigger if exists reviews_touch_customer_updated_at on public.reviews;
create trigger reviews_touch_customer_updated_at
  before update on public.reviews
  for each row execute procedure public.touch_customer_updated_at();

-- RLS and Data API grants ---------------------------------------------------
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.reviews enable row level security;
alter table public.cart_snapshots enable row level security;
alter table public.cart_events enable row level security;

grant select on public.reviews to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.orders, public.order_items, public.order_events to authenticated;

drop policy if exists "Members read their own profile" on public.profiles;
create policy "Members read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Members update their own profile" on public.profiles;
create policy "Members update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Members read their own orders" on public.orders;
create policy "Members read their own orders"
  on public.orders
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Members read their own order lines" on public.order_items;
create policy "Members read their own order lines"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = (select auth.uid())
    )
  );

drop policy if exists "Members read their own order events" on public.order_events;
create policy "Members read their own order events"
  on public.order_events
  for select
  to authenticated
  using (
    visible_to_customer = true
    and exists (
      select 1
      from public.orders
      where orders.id = order_events.order_id
        and orders.user_id = (select auth.uid())
    )
  );

drop policy if exists "Visitors read approved reviews" on public.reviews;
create policy "Visitors read approved reviews"
  on public.reviews
  for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "Members read their own reviews" on public.reviews;
create policy "Members read their own reviews"
  on public.reviews
  for select
  to authenticated
  using ((select auth.uid()) = user_id);
