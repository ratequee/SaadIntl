alter table public.documents
  add column if not exists has_expiry boolean not null default false,
  add column if not exists expires_at timestamptz,
  add column if not exists files jsonb not null default '[]'::jsonb;

update public.documents
set files = jsonb_build_array(
  jsonb_build_object(
    'url', file_url,
    'fileName', file_name,
    'fileType', file_type,
    'fileSize', file_size
  )
)
where coalesce(jsonb_array_length(files), 0) = 0
  and coalesce(file_url, '') <> '';
