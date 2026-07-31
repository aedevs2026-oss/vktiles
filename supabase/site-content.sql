-- Site content tables for admin CMS
-- Run after schema.sql

create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  caption text not null,
  image text not null,
  thumb text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  avatar text,
  quote text not null,
  rating int not null default 5 check (rating >= 1 and rating <= 5),
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  inquiry_type text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists gallery_items_published_idx on gallery_items(published);
create index if not exists gallery_items_sort_idx on gallery_items(sort_order);
create index if not exists testimonials_published_idx on testimonials(published);
create index if not exists contact_enquiries_status_idx on contact_enquiries(status);

drop trigger if exists gallery_items_updated_at on gallery_items;
create trigger gallery_items_updated_at
  before update on gallery_items
  for each row execute function set_updated_at();

drop trigger if exists site_settings_updated_at on site_settings;
create trigger site_settings_updated_at
  before update on site_settings
  for each row execute function set_updated_at();

drop trigger if exists testimonials_updated_at on testimonials;
create trigger testimonials_updated_at
  before update on testimonials
  for each row execute function set_updated_at();

alter table site_settings enable row level security;
alter table gallery_items enable row level security;
alter table testimonials enable row level security;
alter table contact_enquiries enable row level security;

-- Public read published content
create policy "Public read gallery" on gallery_items for select using (published = true);
create policy "Public read testimonials" on testimonials for select using (published = true);
create policy "Public read site settings" on site_settings for select using (true);

-- Anyone can submit enquiry (insert only)
create policy "Public insert enquiries" on contact_enquiries for insert with check (true);

-- Admin full access
create policy "Admin all site_settings" on site_settings for all using (auth.role() = 'authenticated');
create policy "Admin all gallery" on gallery_items for all using (auth.role() = 'authenticated');
create policy "Admin all testimonials" on testimonials for all using (auth.role() = 'authenticated');
create policy "Admin all enquiries" on contact_enquiries for all using (auth.role() = 'authenticated');
