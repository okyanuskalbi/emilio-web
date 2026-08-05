-- SINANHOCAKOYU: keep admin RPCs available to signed-in users only.
-- The functions still perform their own public.is_admin() check.

revoke execute on function public.admin_approve_member(uuid) from public;
revoke execute on function public.admin_reject_member(uuid) from public;
revoke execute on function public.is_admin() from public;
revoke execute on function public.handle_new_user() from public;

grant execute on function public.admin_approve_member(uuid) to authenticated, service_role;
grant execute on function public.admin_reject_member(uuid) to authenticated, service_role;
grant execute on function public.is_admin() to authenticated, service_role;

-- handle_new_user() is invoked by the auth.users trigger; it should not be
-- exposed as a public RPC.
