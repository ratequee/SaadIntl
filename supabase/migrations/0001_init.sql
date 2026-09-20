-- SAAD International Projects — Supabase schema
-- Apply in the Supabase SQL editor or via CLI.
-- Public website reads published rows only. Admin writes use the service role.

create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id text primary key default (gen_random_uuid()::text),
  slug text unique not null,
  type text not null check (type in ('project', 'article', 'document', 'service')),
  name_en text not null,
  name_ar text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key default (gen_random_uuid()::text),
  slug text unique not null,
  title_en text not null,
  title_ar text not null,
  excerpt_en text not null default '',
  excerpt_ar text not null default '',
  description_en text not null default '',
  description_ar text not null default '',
  category_id text references public.categories(id) on delete set null,
  location_en text not null default '',
  location_ar text not null default '',
  client text not null default '',
  status text not null default 'planning' check (status in ('planning', 'in_progress', 'completed')),
  start_date date,
  completion_date date,
  contract_value text not null default '',
  services text[] not null default '{}',
  featured_image_url text not null default '',
  progress int,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  display_order int not null default 0,
  seo_title_en text not null default '',
  seo_title_ar text not null default '',
  seo_description_en text not null default '',
  seo_description_ar text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.project_images (
  id text primary key default (gen_random_uuid()::text),
  project_id text not null references public.projects(id) on delete cascade,
  url text not null,
  caption_en text not null default '',
  caption_ar text not null default '',
  alt_en text not null default '',
  alt_ar text not null default '',
  is_featured boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id text primary key default (gen_random_uuid()::text),
  slug text unique not null,
  title_en text not null,
  title_ar text not null,
  excerpt_en text not null default '',
  excerpt_ar text not null default '',
  content_en text not null default '',
  content_ar text not null default '',
  category_id text references public.categories(id) on delete set null,
  featured_image_url text not null default '',
  author_en text not null default '',
  author_ar text not null default '',
  reading_time_minutes int not null default 3,
  is_published boolean not null default false,
  published_at timestamptz,
  seo_title_en text not null default '',
  seo_title_ar text not null default '',
  seo_description_en text not null default '',
  seo_description_ar text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id text primary key default (gen_random_uuid()::text),
  slug text unique not null,
  title_en text not null,
  title_ar text not null,
  description_en text not null default '',
  description_ar text not null default '',
  category_id text references public.categories(id) on delete set null,
  file_url text not null,
  file_name text not null,
  file_type text not null,
  file_size int not null default 0,
  thumbnail_url text not null default '',
  is_published boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.testimonials (
  id text primary key default (gen_random_uuid()::text),
  quote_en text not null,
  quote_ar text not null,
  client_name_en text not null,
  client_name_ar text not null,
  client_role_en text not null,
  client_role_ar text not null,
  initials text not null default '',
  is_published boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id text primary key default (gen_random_uuid()::text),
  name text not null,
  email text not null,
  phone text not null default '',
  subject text not null,
  message text not null,
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.articles enable row level security;
alter table public.documents enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "public read published projects" on public.projects;
create policy "public read published projects" on public.projects
  for select using (is_published = true);

drop policy if exists "public read project images" on public.project_images;
create policy "public read project images" on public.project_images
  for select using (
    exists (select 1 from public.projects p where p.id = project_id and p.is_published)
  );

drop policy if exists "public read published articles" on public.articles;
create policy "public read published articles" on public.articles
  for select using (is_published = true);

drop policy if exists "public read published documents" on public.documents;
create policy "public read published documents" on public.documents
  for select using (is_published = true);

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories
  for select using (true);

drop policy if exists "public read testimonials" on public.testimonials;
create policy "public read testimonials" on public.testimonials
  for select using (is_published = true);

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings
  for select using (true);

drop policy if exists "public insert contact" on public.contact_messages;
create policy "public insert contact" on public.contact_messages
  for insert with check (true);

drop policy if exists "admin all projects" on public.projects;
create policy "admin all projects" on public.projects
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin all project images" on public.project_images;
create policy "admin all project images" on public.project_images
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin all articles" on public.articles;
create policy "admin all articles" on public.articles
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin all documents" on public.documents;
create policy "admin all documents" on public.documents
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin all categories" on public.categories;
create policy "admin all categories" on public.categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin all testimonials" on public.testimonials;
create policy "admin all testimonials" on public.testimonials
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin all settings" on public.site_settings;
create policy "admin all settings" on public.site_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin read messages" on public.contact_messages;
create policy "admin read messages" on public.contact_messages
  for select using (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "Public read media" on storage.objects;
create policy "Public read media"
  on storage.objects for select
  to public
  using (bucket_id = 'media');

drop policy if exists "Authenticated write media" on storage.objects;
create policy "Authenticated write media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');
