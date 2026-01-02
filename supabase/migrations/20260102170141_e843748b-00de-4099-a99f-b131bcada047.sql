-- Fix handle_new_user trigger to include email (required NOT NULL column) and license_state
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
BEGIN
  -- Insert profile data (including email from auth.users)
  INSERT INTO public.profiles (id, email, full_name, company_name, license_number, license_state, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'license_number',
    NEW.raw_user_meta_data->>'license_state',
    NEW.raw_user_meta_data->>'phone'
  );

  -- Get requested role from metadata, default to 'inspector'
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'inspector'::app_role);

  -- SECURITY: only allow a safe, non-privileged allowlist at self-signup
  IF user_role NOT IN (
    'inspector'::app_role,
    'appraiser'::app_role,
    'real_estate_agent'::app_role
  ) THEN
    user_role := 'inspector'::app_role;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$function$;