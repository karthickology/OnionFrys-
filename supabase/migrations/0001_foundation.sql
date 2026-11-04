-- OnionFrys Module 1: foundation schema.
-- Run this entire file once in Supabase SQL Editor.
-- This creates only the first foundation tables, not the complete 32-table plan.

create extension if not exists pgcrypto;

-- 1. Customer/admin profile. Passwords remain managed by Supabase Auth.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Admin check is evaluated in the database, not trusted from browser input.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 2. Product catalogue.
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null default 'Default',
  sku text not null unique,
  attributes jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory (
  variant_id uuid primary key references public.product_variants(id) on delete cascade,
  quantity_on_hand integer not null default 0 check (quantity_on_hand >= 0),
  reserved_quantity integer not null default 0 check (
    reserved_quantity >= 0 and reserved_quantity <= quantity_on_hand
  ),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists products_status_idx on public.products(status);
create index if not exists products_featured_idx on public.products(is_featured);
create index if not exists product_variants_product_idx on public.product_variants(product_id);
create index if not exists product_categories_category_idx on public.product_categories(category_id);

-- 3. Row Level Security.
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.product_images enable row level security;

drop policy if exists "Profiles readable by owner or admin" on public.profiles;
create policy "Profiles readable by owner or admin"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.is_admin());

drop policy if exists "Owners update own profile" on public.profiles;
create policy "Owners update own profile"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Column grants prevent customers from changing their own role.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, updated_at) on public.profiles to authenticated;

drop policy if exists "Public read active categories" on public.categories;
create policy "Public read active categories"
on public.categories for select to anon, authenticated
using (is_active = true or public.is_admin());

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
on public.categories for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read published products" on public.products;
create policy "Public read published products"
on public.products for select to anon, authenticated
using (status = 'published' or public.is_admin());

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
on public.products for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read published product categories" on public.product_categories;
create policy "Public read published product categories"
on public.product_categories for select to anon, authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_id and p.status = 'published'
  ) or public.is_admin()
);

drop policy if exists "Admins manage product categories" on public.product_categories;
create policy "Admins manage product categories"
on public.product_categories for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read active variants of published products" on public.product_variants;
create policy "Public read active variants of published products"
on public.product_variants for select to anon, authenticated
using (
  is_active = true and exists (
    select 1 from public.products p
    where p.id = product_id and p.status = 'published'
  )
  or public.is_admin()
);

drop policy if exists "Admins manage variants" on public.product_variants;
create policy "Admins manage variants"
on public.product_variants for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage inventory" on public.inventory;
create policy "Admins manage inventory"
on public.inventory for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read published product images" on public.product_images;
create policy "Public read published product images"
on public.product_images for select to anon, authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_id and p.status = 'published'
  ) or public.is_admin()
);

drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images"
on public.product_images for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Table privileges complement RLS.
grant select on public.categories, public.products, public.product_categories,
  public.product_variants, public.product_images to anon, authenticated;
grant insert, update, delete on public.categories, public.products,
  public.product_categories, public.product_variants, public.product_images to authenticated;
grant select, insert, update, delete on public.inventory to authenticated;

-- 4. Public product-image bucket. Upload/delete is admin-only.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects for update to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images' and public.is_admin());

-- 5. Small demonstration catalogue. Safe to run more than once.
insert into public.categories (name, slug, description, sort_order)
values
  ('Apparel', 'apparel', 'Wearable OnionFrys test merchandise.', 1),
  ('Desk & Tech', 'desk-tech', 'Useful and playful desk accessories.', 2),
  ('Just for Fun', 'just-for-fun', 'Odd little products for the experiment.', 3)
on conflict (slug) do nothing;

insert into public.products (name, slug, description, price, compare_at_price, currency, status, is_featured)
values
  ('OnionFrys Test Tee', 'onionfrys-test-tee', 'A demo product used to test the catalogue and customer journey.', 24.00, 29.00, 'USD', 'published', true),
  ('Emotional Support Potato', 'emotional-support-potato', 'A playful demo item for testing product discovery and merchandising.', 18.00, null, 'USD', 'published', true),
  ('Pixel Desk Mat', 'pixel-desk-mat', 'A sample desk accessory for ecommerce experiments.', 16.00, null, 'USD', 'published', false)
on conflict (slug) do nothing;

insert into public.product_categories (product_id, category_id)
select p.id, c.id
from public.products p
join public.categories c on c.slug = case
  when p.slug = 'onionfrys-test-tee' then 'apparel'
  when p.slug = 'pixel-desk-mat' then 'desk-tech'
  else 'just-for-fun'
end
where p.slug in ('onionfrys-test-tee', 'emotional-support-potato', 'pixel-desk-mat')
on conflict do nothing;

insert into public.product_variants (product_id, name, sku, is_default, is_active)
select p.id, 'Default', 'OF-' || upper(replace(p.slug, '-', '-')), true, true
from public.products p
where p.slug in ('onionfrys-test-tee', 'emotional-support-potato', 'pixel-desk-mat')
on conflict (sku) do nothing;

insert into public.inventory (variant_id, quantity_on_hand, reserved_quantity)
select v.id, 25, 0
from public.product_variants v
where v.sku in ('OF-ONIONFRYS-TEST-TEE', 'OF-EMOTIONAL-SUPPORT-POTATO', 'OF-PIXEL-DESK-MAT')
on conflict (variant_id) do nothing;

-- IMPORTANT:
-- Create your first user through Supabase Auth, then promote that user to admin
-- manually in the SQL Editor using the exact auth.users email:
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'YOUR_LOGIN_EMAIL');
