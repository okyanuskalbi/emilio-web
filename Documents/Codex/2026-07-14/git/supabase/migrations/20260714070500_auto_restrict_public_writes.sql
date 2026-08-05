-- AUTO: remove public write/delete access from catalog and settings tables.
-- Public analytics/lead inserts are intentionally left in place.

drop policy if exists brands_anon_insert on public.brands;
drop policy if exists brands_anon_delete on public.brands;

drop policy if exists categories_anon_insert on public.categories;
drop policy if exists categories_anon_delete on public.categories;

drop policy if exists products_anon_insert on public.products;
drop policy if exists products_anon_update on public.products;
drop policy if exists products_anon_delete on public.products;

drop policy if exists settings_insert on public.site_settings;
drop policy if exists settings_update on public.site_settings;

drop policy if exists leads_public_update on public.whatsapp_leads;
