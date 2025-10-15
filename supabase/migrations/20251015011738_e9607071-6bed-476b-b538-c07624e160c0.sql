-- Fix security warnings: Add search_path to trigger functions

-- Fix trigger_calculate_grade function
CREATE OR REPLACE FUNCTION public.trigger_calculate_grade()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.checklist_ratings IS DISTINCT FROM OLD.checklist_ratings THEN
    PERFORM public.calculate_inspection_grade(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;