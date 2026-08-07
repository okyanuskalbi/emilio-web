-- Each row represents a purchasable SKU combination, e.g.
-- {"Yüzük ölçüsü": "14", "Karat": "0,50 ct", "Renk": "Altın"}.
-- Existing size/color/material data remains available for legacy products.
alter table public.product_variants
  add column if not exists options jsonb not null default '{}'::jsonb,
  add column if not exists active boolean not null default true;

alter table public.product_variants
  drop constraint if exists product_variants_options_is_object;

alter table public.product_variants
  add constraint product_variants_options_is_object
  check (jsonb_typeof(options) = 'object');

create index if not exists product_variants_product_active_idx
  on public.product_variants (product_id)
  where active = true;

-- Product options are catalogue data. Admin writes are performed exclusively by
-- authenticated server routes with the service role; the browser only reads
-- active variants for active products.
alter table public.product_variants enable row level security;

drop policy if exists "Public can read active product variants" on public.product_variants;
create policy "Public can read active product variants"
  on public.product_variants
  for select
  to anon, authenticated
  using (
    active = true
    and exists (
      select 1
      from public.products
      where products.id = product_variants.product_id
        and products.active = true
    )
  );
