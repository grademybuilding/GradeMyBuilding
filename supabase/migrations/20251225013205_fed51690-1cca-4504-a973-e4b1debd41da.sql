-- Fix: Prevent users from self-assigning admin role during signup
-- The handle_new_user() function now rejects 'admin' role from client metadata

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Insert profile data
  INSERT INTO public.profiles (id, full_name, company_name, license_number, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'license_number',
    NEW.raw_user_meta_data->>'phone'
  );

  -- Get requested role from metadata, default to 'inspector'
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'inspector'::app_role);
  
  -- SECURITY: Reject admin role from self-signup - admin accounts must be created manually
  IF user_role = 'admin'::app_role THEN
    user_role := 'inspector'::app_role;
  END IF;
  
  -- Assign the validated role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;