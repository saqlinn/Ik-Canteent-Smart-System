-- Allow handle_new_user to assign role from signup metadata (admin or student)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  _role public.app_role;
begin
  insert into public.profiles (user_id, full_name, register_no, college, department, year, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'register_no',
    new.raw_user_meta_data->>'college',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'year',
    new.raw_user_meta_data->>'phone'
  );

  _role := case
    when new.raw_user_meta_data->>'role' = 'admin' then 'admin'::public.app_role
    else 'student'::public.app_role
  end;

  insert into public.user_roles (user_id, role) values (new.id, _role);
  return new;
end; $function$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();