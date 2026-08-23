-- 1. Remove public (unauthenticated) read access to properties, which exposed owner PII
DROP POLICY IF EXISTS "Public properties are viewable" ON public.properties;

-- 2. Lock down SECURITY DEFINER functions: revoke broad EXECUTE from PUBLIC/anon/authenticated
REVOKE ALL ON FUNCTION public.calculate_category_grades(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.calculate_category_grades_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.calculate_inspection_grade(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.calculate_inspection_grade_v2(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_inspection_reminder() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_inspector_stats(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_any_role(uuid, public.app_role[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.inspector_has_property_access(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.migrate_checklist_data() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalculate_all_inspection_grades() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trigger_calculate_grade() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.user_owns_inspection_property(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.user_owns_property(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- 3. Re-grant only what the application genuinely needs.
-- RLS policy helpers must remain executable by the roles evaluating those policies.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, public.app_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_owns_property(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_owns_inspection_property(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.inspector_has_property_access(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

-- Grading RPCs are invoked by signed-in users through edge functions and enforce ownership internally.
GRANT EXECUTE ON FUNCTION public.calculate_inspection_grade(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_inspection_grade_v2(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_category_grades(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_inspector_stats(uuid) TO authenticated;