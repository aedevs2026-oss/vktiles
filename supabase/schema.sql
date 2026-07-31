-- VK Tiles Admin Panel Schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

create extension if not exists "pgcrypto";

-- Categories (top-level product lines)
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  blurb text,
  image text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Collections (PDF series / sub-ranges)
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category_slug text not null references categories(slug) on update cascade,
  blurb text,
  image text,
  source_pdf text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text not null default 'VK Tiles & Granites',
  category_slug text not null references categories(slug) on update cascade,
  subcategory text,
  collection_slug text references collections(slug) on update cascade,
  collection_name text,
  series text,
  description text,
  size text,
  sizes jsonb not null default '[]'::jsonb,
  finish text,
  finishes jsonb not null default '[]'::jsonb,
  surface text,
  pattern text,
  thickness text,
  thicknesses jsonb not null default '[]'::jsonb,
  packing jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  applications jsonb not null default '[]'::jsonb,
  specifications jsonb not null default '{}'::jsonb,
  image text,
  images jsonb not null default '[]'::jsonb,
  image_thumb text,
  image_medium text,
  availability text not null default 'In Stock',
  featured boolean not null default false,
  source_pdf text,
  source_page int,
  downloads jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_slug_idx on products(category_slug);
create index if not exists products_collection_slug_idx on products(collection_slug);
create index if not exists products_published_idx on products(published);
create index if not exists products_featured_idx on products(featured);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists categories_updated_at on categories;
create trigger categories_updated_at
  before update on categories
  for each row execute function set_updated_at();

drop trigger if exists collections_updated_at on collections;
create trigger collections_updated_at
  before update on collections
  for each row execute function set_updated_at();

drop trigger if exists products_updated_at on products;
create trigger products_updated_at
  before update on products
  for each row execute function set_updated_at();

-- Row Level Security
alter table categories enable row level security;
alter table collections enable row level security;
alter table products enable row level security;

-- Public read for published content
create policy "Public read published categories"
  on categories for select using (published = true);

create policy "Public read published collections"
  on collections for select using (published = true);

create policy "Public read published products"
  on products for select using (published = true);

-- Authenticated users full access (admin)
create policy "Admin all categories"
  on categories for all using (auth.role() = 'authenticated');

create policy "Admin all collections"
  on collections for all using (auth.role() = 'authenticated');

create policy "Admin all products"
  on products for all using (auth.role() = 'authenticated');
