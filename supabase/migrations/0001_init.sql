-- Wildcats Den schema. Run once in the Supabase SQL editor (or `supabase db push`).

create extension if not exists pg_cron;

-- Staff and admins. Customers never log in; they check out as guests.
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null default '',
  role text not null check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  category text not null default 'Tees',
  price integer not null check (price >= 0), -- whole pesos
  images text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  size text not null,
  stock integer not null default 0 check (stock >= 0),
  sort integer not null default 0,
  unique (product_id, size)
);

-- status: pending -> ready -> claimed, or cancelled. paid_at is set when staff verify GCash or when cash is collected.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default upper(substr(md5(random()::text), 1, 6)),
  name text not null,
  email text not null,
  phone text not null,
  cit_student boolean not null,
  student_id text,
  payment_method text not null check (payment_method in ('gcash', 'cash')),
  gcash_ref text,
  receipt_path text,
  status text not null default 'pending' check (status in ('pending', 'ready', 'claimed', 'cancelled')),
  total integer not null,
  paid_at timestamptz,
  ready_at timestamptz,
  claimed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  variant_id uuid references public.variants on delete set null,
  product_name text not null,
  size text not null,
  price integer not null,
  qty integer not null check (qty > 0)
);

create index on public.orders (status, created_at);
create index on public.order_items (order_id);

-- Role helpers (security definer so policies can read profiles without recursion).
create function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "read own profile, admins read all" on public.profiles for select
  using (id = auth.uid() or public.my_role() = 'admin');
create policy "admins manage profiles" on public.profiles for all
  using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

create policy "anyone reads active products" on public.products for select
  using (active or public.my_role() is not null);
create policy "staff manage products" on public.products for all
  using (public.my_role() is not null) with check (public.my_role() is not null);

create policy "anyone reads variants" on public.variants for select using (true);
create policy "staff manage variants" on public.variants for all
  using (public.my_role() is not null) with check (public.my_role() is not null);

-- Guests never touch orders directly: checkout and the order page go through the server.
create policy "staff manage orders" on public.orders for all
  using (public.my_role() is not null) with check (public.my_role() is not null);
create policy "staff manage order items" on public.order_items for all
  using (public.my_role() is not null) with check (public.my_role() is not null);

-- Places an order and takes the stock in one transaction. items: [{"variant_id": "...", "qty": 1}]
create function public.place_order(
  p_name text, p_email text, p_phone text, p_cit_student boolean, p_student_id text,
  p_payment_method text, p_gcash_ref text, p_items jsonb
) returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  o public.orders;
  it jsonb;
  v record;
  q integer;
  t integer := 0;
begin
  if jsonb_array_length(p_items) = 0 then raise exception 'Your bag is empty'; end if;
  insert into orders (name, email, phone, cit_student, student_id, payment_method, gcash_ref, total)
  values (p_name, p_email, p_phone, p_cit_student, nullif(p_student_id, ''), p_payment_method, nullif(p_gcash_ref, ''), 0)
  returning * into o;
  for it in select * from jsonb_array_elements(p_items) loop
    q := (it->>'qty')::integer;
    if q is null or q < 1 or q > 20 then raise exception 'Invalid quantity'; end if;
    select va.id, va.size, va.stock, p.name, p.price into v
      from variants va join products p on p.id = va.product_id
      where va.id = (it->>'variant_id')::uuid and p.active
      for update of va;
    if v.id is null then raise exception 'An item in your bag is no longer available'; end if;
    if v.stock < q then raise exception '% (%) has only % left', v.name, v.size, v.stock; end if;
    update variants set stock = stock - q where id = v.id;
    insert into order_items (order_id, variant_id, product_name, size, price, qty)
      values (o.id, v.id, v.name, v.size, v.price, q);
    t := t + v.price * q;
  end loop;
  update orders set total = t where id = o.id returning * into o;
  return o;
end $$;

-- Cancels an open order and puts its stock back.
create function public.cancel_order(p_order uuid, p_reason text) returns void
language plpgsql security definer set search_path = public as $$
begin
  update orders set status = 'cancelled', cancelled_at = now(), cancel_reason = p_reason
    where id = p_order and status in ('pending', 'ready');
  if not found then return; end if;
  update variants va set stock = va.stock + oi.qty
    from order_items oi where oi.order_id = p_order and oi.variant_id = va.id;
end $$;

-- Unpaid orders not claimed within 7 days are forfeited. Verified GCash orders are never auto-cancelled.
create function public.auto_cancel_orders() returns integer
language plpgsql security definer set search_path = public as $$
declare r record; n integer := 0;
begin
  for r in select id from orders
    where status in ('pending', 'ready') and paid_at is null and created_at < now() - interval '7 days'
  loop
    perform cancel_order(r.id, 'Not claimed within 7 days');
    n := n + 1;
  end loop;
  return n;
end $$;

-- Only the server (service role) may run these; staff cancel through the admin page, which checks the role first.
revoke execute on function public.place_order, public.cancel_order, public.auto_cancel_orders from public, anon, authenticated;
grant execute on function public.place_order, public.cancel_order, public.auto_cancel_orders to service_role;

select cron.schedule('auto-cancel-orders', '0 * * * *', 'select public.auto_cancel_orders()');

-- Storage: product photos are public, GCash receipts are private (staff see them through signed links).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('products', 'products', true, 2097152, array['image/webp', 'image/jpeg', 'image/png']),
  ('receipts', 'receipts', false, 5242880, array['image/webp', 'image/jpeg', 'image/png']);

create policy "staff upload product photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and public.my_role() is not null);
create policy "staff delete product photos" on storage.objects for delete to authenticated
  using (bucket_id = 'products' and public.my_role() is not null);
