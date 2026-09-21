alter table public.articles
  add column if not exists images jsonb not null default '[]'::jsonb;

update public.articles
set images = jsonb_build_array(
  jsonb_build_object(
    'url', featured_image_url,
    'caption', jsonb_build_object('en', '', 'ar', ''),
    'alt', jsonb_build_object('en', '', 'ar', ''),
    'isFeatured', true,
    'displayOrder', 1
  )
)
where coalesce(jsonb_array_length(images), 0) = 0
  and featured_image_url <> '';
