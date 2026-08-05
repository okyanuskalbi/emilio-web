-- SINANHOCAKOYU: explicitly remove anon access from SECURITY DEFINER RPCs.
-- Admin RPCs remain callable by authenticated users and still enforce
-- public.is_admin() internally.

revoke execute on function public.admin_approve_member(uuid) from anon;
revoke execute on function public.admin_reject_member(uuid) from anon;
revoke execute on function public.is_admin() from anon;

-- Trigger-only; not intended as a public RPC.
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
revoke execute on function public.handle_new_user() from service_role;
