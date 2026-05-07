
-- Roles enum and table
create type public.app_role as enum ('admin', 'student');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  register_no text unique,
  college text,
  department text,
  year text,
  phone text,
  active_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);

-- Security definer role check
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Menu
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text not null,
  image_url text,
  available boolean not null default true,
  stock int not null default 50,
  best_seller boolean not null default false,
  rating numeric(2,1) default 4.8,
  eta_min int default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subtotal numeric(10,2) not null,
  gst numeric(10,2) not null,
  total numeric(10,2) not null,
  status text not null default 'preparing',
  payment_method text,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  name text not null,
  price numeric(10,2) not null,
  quantity int not null
);

-- Inventory
create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  item_name text not null unique,
  unit text not null,
  total_stock numeric(10,2) not null default 0,
  used numeric(10,2) not null default 0,
  low_threshold numeric(10,2) not null default 5,
  updated_at timestamptz not null default now()
);

create table public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null references public.inventory(id) on delete cascade,
  amount numeric(10,2) not null,
  kind text not null,
  note text,
  created_at timestamptz not null default now()
);

-- Updated-at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger menu_items_updated before update on public.menu_items
  for each row execute function public.touch_updated_at();
create trigger inventory_updated before update on public.inventory
  for each row execute function public.touch_updated_at();

-- Auto profile + student role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name, register_no, college, department, year, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'register_no',
    new.raw_user_meta_data->>'college',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'year',
    new.raw_user_meta_data->>'phone'
  );
  insert into public.user_roles (user_id, role) values (new.id, 'student');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_logs enable row level security;

-- Profiles policies
create policy "Users view own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = user_id);
create policy "Admins view all profiles" on public.profiles for select using (public.has_role(auth.uid(), 'admin'));

-- Roles policies
create policy "Users view own roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "Admins manage roles" on public.user_roles for all using (public.has_role(auth.uid(), 'admin'));

-- Menu policies
create policy "Anyone authed can view menu" on public.menu_items for select using (auth.uid() is not null);
create policy "Admins manage menu" on public.menu_items for all using (public.has_role(auth.uid(), 'admin'));

-- Orders policies
create policy "Users view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users create own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins view all orders" on public.orders for select using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update orders" on public.orders for update using (public.has_role(auth.uid(), 'admin'));

create policy "Users view own order items" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Users create order items" on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Admins view all order items" on public.order_items for select using (public.has_role(auth.uid(), 'admin'));

-- Inventory policies
create policy "Authed view inventory" on public.inventory for select using (auth.uid() is not null);
create policy "Admins manage inventory" on public.inventory for all using (public.has_role(auth.uid(), 'admin'));
create policy "Authed view inv logs" on public.inventory_logs for select using (auth.uid() is not null);
create policy "Admins manage inv logs" on public.inventory_logs for all using (public.has_role(auth.uid(), 'admin'));

-- Seed menu
insert into public.menu_items (name, description, price, category, best_seller, eta_min) values
  ('Idli Sambar Combo', 'Soft idlis with hot sambar & chutneys', 40, 'Breakfast', true, 8),
  ('Masala Dosa', 'Crispy golden dosa with potato masala', 50, 'Breakfast', false, 10),
  ('Chicken Biryani', 'Aromatic basmati rice with tender chicken', 120, 'Lunch', true, 15),
  ('Veg Meals', 'Rice, sambar, rasam, poriyal & curd', 80, 'Lunch', false, 12),
  ('Masala Chai', 'Hot, spiced & freshly brewed', 15, 'Drinks', false, 4),
  ('Filter Coffee', 'Authentic South Indian filter coffee', 20, 'Drinks', false, 5),
  ('Samosa', 'Crispy fried with potato filling', 15, 'Snacks', false, 5),
  ('Vada Pav', 'Mumbai street style', 25, 'Snacks', false, 6);

-- Seed inventory
insert into public.inventory (item_name, unit, total_stock, low_threshold) values
  ('Milk', 'litres', 50, 10),
  ('Sugar', 'kg', 25, 5),
  ('Rice', 'kg', 100, 20),
  ('Oil', 'litres', 20, 5),
  ('Wheat Flour', 'kg', 50, 10);
