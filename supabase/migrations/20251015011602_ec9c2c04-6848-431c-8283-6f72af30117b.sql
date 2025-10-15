-- =============================================
-- PHASE 1: Core Authentication & Role Management
-- =============================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM (
  'admin',
  'inspector', 
  'appraiser',
  'real_estate_agent',
  'assessor',
  'underwriter'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  company_email TEXT,
  license_number TEXT,
  license_state TEXT,
  credentials_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (CRITICAL - separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Security definer functions (prevent RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY assigned_at ASC
  LIMIT 1
$$;

-- Auto-create profile and assign role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, phone, company_name, 
    company_email, license_number, license_state
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'company_email',
    NEW.raw_user_meta_data->>'license_number',
    NEW.raw_user_meta_data->>'license_state'
  );

  -- Assign role from metadata (default to inspector if not provided)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'inspector'::app_role)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- PHASE 2: Properties & Inspections Schema
-- =============================================

-- Properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  property_type TEXT NOT NULL,
  owner_name TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  year_built INTEGER,
  square_footage INTEGER,
  lot_size TEXT,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspections table with grade calculation fields
CREATE TABLE public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  inspector_id UUID REFERENCES auth.users(id) NOT NULL,
  inspection_date DATE NOT NULL,
  inspection_time TIME,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'submitted', 'approved')),
  
  -- Inspection details
  weather_conditions TEXT[],
  temperature NUMERIC,
  occupancy TEXT,
  attendance TEXT[],
  building_types TEXT[],
  
  -- Grade calculation fields (A: 90-100, B: 80-89, C: 60-79, D: 35-59, F: 0-34)
  total_items_rated INTEGER DEFAULT 0,
  total_points_possible INTEGER DEFAULT 0,
  total_points_earned NUMERIC DEFAULT 0,
  final_grade_numeric NUMERIC,
  final_grade_letter TEXT,
  grade_calculated_at TIMESTAMP WITH TIME ZONE,
  
  -- Rating counts
  excellent_count INTEGER DEFAULT 0,
  very_good_count INTEGER DEFAULT 0,
  good_count INTEGER DEFAULT 0,
  poor_count INTEGER DEFAULT 0,
  replace_count INTEGER DEFAULT 0,
  not_inspected_count INTEGER DEFAULT 0,
  partial_inspected_count INTEGER DEFAULT 0,
  
  -- Checklist data (JSONB)
  checklist_data JSONB DEFAULT '{}'::jsonb,
  checklist_ratings JSONB DEFAULT '{}'::jsonb,
  checklist_notes JSONB DEFAULT '{}'::jsonb,
  selected_defects JSONB DEFAULT '{}'::jsonb,
  category_scores JSONB DEFAULT '{}'::jsonb,
  
  notes TEXT,
  photos TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspection assignments
CREATE TABLE public.inspection_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) NOT NULL,
  role app_role NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'declined')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE (inspection_id, assigned_to, role)
);

-- Indexes
CREATE INDEX idx_properties_created_by ON public.properties(created_by);
CREATE INDEX idx_properties_public ON public.properties(is_public) WHERE is_public = true;
CREATE INDEX idx_inspections_property ON public.inspections(property_id);
CREATE INDEX idx_inspections_inspector ON public.inspections(inspector_id);
CREATE INDEX idx_inspections_status ON public.inspections(status);
CREATE INDEX idx_inspections_grade ON public.inspections(final_grade_letter);
CREATE INDEX idx_inspection_assignments_inspection ON public.inspection_assignments(inspection_id);
CREATE INDEX idx_inspection_assignments_assigned_to ON public.inspection_assignments(assigned_to);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_assignments ENABLE ROW LEVEL SECURITY;

-- RLS for properties
CREATE POLICY "Users can view own properties"
  ON public.properties FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Inspectors can view assigned properties"
  ON public.properties FOR SELECT
  USING (
    public.has_role(auth.uid(), 'inspector') AND
    id IN (SELECT property_id FROM public.inspections WHERE inspector_id = auth.uid())
  );

CREATE POLICY "Public properties are viewable"
  ON public.properties FOR SELECT
  USING (is_public = true);

CREATE POLICY "Admins can view all properties"
  ON public.properties FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() = created_by);

-- RLS for inspections
CREATE POLICY "Inspectors can manage own inspections"
  ON public.inspections FOR ALL
  USING (auth.uid() = inspector_id);

CREATE POLICY "Admins can manage all inspections"
  ON public.inspections FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Assigned users can view inspections"
  ON public.inspections FOR SELECT
  USING (
    id IN (
      SELECT inspection_id 
      FROM public.inspection_assignments 
      WHERE assigned_to = auth.uid()
    )
  );

CREATE POLICY "Property owners can view inspections"
  ON public.inspections FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE created_by = auth.uid()
    )
  );

-- RLS for assignments
CREATE POLICY "Inspectors can create assignments"
  ON public.inspection_assignments FOR INSERT
  WITH CHECK (
    public.has_any_role(auth.uid(), ARRAY['inspector', 'admin']::app_role[])
  );

CREATE POLICY "Users can view own assignments"
  ON public.inspection_assignments FOR SELECT
  USING (
    assigned_to = auth.uid() OR
    assigned_by = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Assigned users can update assignments"
  ON public.inspection_assignments FOR UPDATE
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- =============================================
-- PHASE 3: Grade Calculation System
-- UPDATED MAPPING: A: 90-100, B: 80-89, C: 60-79, D: 35-59, F: 0-34
-- =============================================

CREATE OR REPLACE FUNCTION public.calculate_inspection_grade(
  _inspection_id UUID
)
RETURNS TABLE (
  grade_numeric NUMERIC,
  grade_letter TEXT
)
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_checklist_ratings JSONB;
  v_excellent_count INTEGER := 0;
  v_very_good_count INTEGER := 0;
  v_good_count INTEGER := 0;
  v_poor_count INTEGER := 0;
  v_replace_count INTEGER := 0;
  v_not_inspected_count INTEGER := 0;
  v_partial_inspected_count INTEGER := 0;
  v_total_items_rated INTEGER := 0;
  v_total_points_earned NUMERIC := 0;
  v_total_points_possible INTEGER := 0;
  v_percentage NUMERIC := 0;
  v_grade_letter TEXT;
  v_item_key TEXT;
  v_rating TEXT;
BEGIN
  SELECT checklist_ratings INTO v_checklist_ratings
  FROM public.inspections
  WHERE id = _inspection_id;

  IF v_checklist_ratings IS NULL OR v_checklist_ratings = '{}'::JSONB THEN
    UPDATE public.inspections
    SET 
      total_items_rated = 0,
      total_points_earned = 0,
      total_points_possible = 0,
      final_grade_numeric = 0,
      final_grade_letter = 'F',
      grade_calculated_at = NOW()
    WHERE id = _inspection_id;
    
    RETURN QUERY SELECT 0::NUMERIC, 'F'::TEXT;
    RETURN;
  END IF;

  -- Count ratings
  FOR v_item_key IN SELECT jsonb_object_keys(v_checklist_ratings)
  LOOP
    v_rating := v_checklist_ratings->>v_item_key;
    
    CASE v_rating
      WHEN 'Excellent' THEN v_excellent_count := v_excellent_count + 1;
      WHEN 'Very Good' THEN v_very_good_count := v_very_good_count + 1;
      WHEN 'Good' THEN v_good_count := v_good_count + 1;
      WHEN 'Poor' THEN v_poor_count := v_poor_count + 1;
      WHEN 'Replace' THEN v_replace_count := v_replace_count + 1;
      WHEN 'Not Inspected' THEN v_not_inspected_count := v_not_inspected_count + 1;
      WHEN 'Partial Inspected' THEN v_partial_inspected_count := v_partial_inspected_count + 1;
    END CASE;
  END LOOP;

  v_total_items_rated := v_excellent_count + v_very_good_count + v_good_count + v_poor_count + v_replace_count;

  IF v_total_items_rated = 0 THEN
    UPDATE public.inspections
    SET 
      total_items_rated = 0,
      total_points_earned = 0,
      total_points_possible = 0,
      final_grade_numeric = 0,
      final_grade_letter = 'F',
      excellent_count = 0,
      very_good_count = 0,
      good_count = 0,
      poor_count = 0,
      replace_count = 0,
      not_inspected_count = v_not_inspected_count,
      partial_inspected_count = v_partial_inspected_count,
      grade_calculated_at = NOW()
    WHERE id = _inspection_id;
    
    RETURN QUERY SELECT 0::NUMERIC, 'F'::TEXT;
    RETURN;
  END IF;

  -- Points: Excellent=5, Very Good=4, Good=3, Poor=1, Replace=0
  v_total_points_earned := (v_excellent_count * 5) + (v_very_good_count * 4) + (v_good_count * 3) + (v_poor_count * 1);
  v_total_points_possible := v_total_items_rated * 5;
  v_percentage := (v_total_points_earned::NUMERIC / v_total_points_possible::NUMERIC) * 100;

  -- UPDATED GRADE MAPPING
  IF v_percentage >= 90 THEN
    v_grade_letter := 'A';
  ELSIF v_percentage >= 80 THEN
    v_grade_letter := 'B';
  ELSIF v_percentage >= 60 THEN
    v_grade_letter := 'C';
  ELSIF v_percentage >= 35 THEN
    v_grade_letter := 'D';
  ELSE
    v_grade_letter := 'F';
  END IF;

  UPDATE public.inspections
  SET 
    total_items_rated = v_total_items_rated,
    total_points_earned = v_total_points_earned,
    total_points_possible = v_total_points_possible,
    final_grade_numeric = v_percentage,
    final_grade_letter = v_grade_letter,
    excellent_count = v_excellent_count,
    very_good_count = v_very_good_count,
    good_count = v_good_count,
    poor_count = v_poor_count,
    replace_count = v_replace_count,
    not_inspected_count = v_not_inspected_count,
    partial_inspected_count = v_partial_inspected_count,
    grade_calculated_at = NOW()
  WHERE id = _inspection_id;

  RETURN QUERY SELECT v_percentage, v_grade_letter;
END;
$$;

-- Trigger to auto-calculate grade
CREATE OR REPLACE FUNCTION public.trigger_calculate_grade()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  IF NEW.checklist_ratings IS DISTINCT FROM OLD.checklist_ratings THEN
    PERFORM public.calculate_inspection_grade(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_checklist_update
  AFTER UPDATE OF checklist_ratings ON public.inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_calculate_grade();

-- =============================================
-- PHASE 4: Role-Specific Features
-- =============================================

-- Inspection templates (Inspector)
CREATE TABLE public.inspection_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  building_type TEXT NOT NULL,
  template_data JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.inspection_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inspectors can view own templates"
  ON public.inspection_templates FOR SELECT
  USING (created_by = auth.uid() OR is_public = true);

CREATE POLICY "Inspectors can create templates"
  ON public.inspection_templates FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'inspector') AND
    created_by = auth.uid()
  );

CREATE INDEX idx_templates_created_by ON public.inspection_templates(created_by);

-- Valuations (Appraiser)
CREATE TABLE public.valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  appraiser_id UUID REFERENCES auth.users(id) NOT NULL,
  estimated_value NUMERIC NOT NULL,
  grade_adjustment_factor NUMERIC DEFAULT 0,
  market_value NUMERIC,
  comparable_properties JSONB DEFAULT '[]'::JSONB,
  valuation_report_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'submitted')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.valuations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Appraisers can manage own valuations"
  ON public.valuations FOR ALL
  USING (appraiser_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Property owners can view valuations"
  ON public.valuations FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE created_by = auth.uid()
    )
  );

CREATE INDEX idx_valuations_appraiser ON public.valuations(appraiser_id);
CREATE INDEX idx_valuations_property ON public.valuations(property_id);

-- Inspection shares (Real Estate Agent)
CREATE TABLE public.inspection_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES auth.users(id) NOT NULL,
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64'),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.inspection_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can create shares"
  ON public.inspection_shares FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'real_estate_agent') AND
    shared_by = auth.uid()
  );

CREATE POLICY "Users can view own shares"
  ON public.inspection_shares FOR SELECT
  USING (shared_by = auth.uid());

CREATE INDEX idx_shares_inspection ON public.inspection_shares(inspection_id);
CREATE INDEX idx_shares_token ON public.inspection_shares(share_token) WHERE is_active = true;

-- Assessment exports (Assessor)
CREATE TABLE public.assessment_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessor_id UUID REFERENCES auth.users(id) NOT NULL,
  export_type TEXT NOT NULL CHECK (export_type IN ('csv', 'excel', 'pdf', 'json')),
  jurisdiction TEXT,
  grade_range TEXT[],
  date_range_start DATE,
  date_range_end DATE,
  property_types TEXT[],
  total_records INTEGER,
  file_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.assessment_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assessors can manage own exports"
  ON public.assessment_exports FOR ALL
  USING (assessor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_exports_assessor ON public.assessment_exports(assessor_id);

-- Risk analyses (Underwriter)
CREATE TABLE public.risk_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE NOT NULL,
  underwriter_id UUID REFERENCES auth.users(id) NOT NULL,
  risk_score NUMERIC,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  grade_risk_factor NUMERIC,
  defects_risk_factor NUMERIC,
  decision TEXT CHECK (decision IN ('approved', 'declined', 'needs_review', 'pending')),
  decision_notes TEXT,
  decided_at TIMESTAMP WITH TIME ZONE,
  requires_additional_inspection BOOLEAN DEFAULT false,
  flagged_categories TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.risk_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Underwriters can manage own analyses"
  ON public.risk_analyses FOR ALL
  USING (underwriter_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_analyses_underwriter ON public.risk_analyses(underwriter_id);
CREATE INDEX idx_analyses_inspection ON public.risk_analyses(inspection_id);

-- Audit logs (Admin)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_resource ON public.audit_logs(resource_type, resource_id);

-- =============================================
-- PHASE 5: Helper Functions
-- =============================================

-- Fixed: Avoid nested aggregates by using a subquery
CREATE OR REPLACE FUNCTION public.get_inspector_stats(_inspector_id UUID)
RETURNS TABLE (
  total_inspections BIGINT,
  completed_this_month BIGINT,
  average_grade NUMERIC,
  pending_submissions BIGINT,
  grade_distribution JSONB
)
LANGUAGE PLPGSQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total BIGINT;
  v_completed_month BIGINT;
  v_avg_grade NUMERIC;
  v_pending BIGINT;
  v_grade_dist JSONB;
BEGIN
  -- Get basic counts and average
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (
      WHERE status = 'completed' 
      AND DATE_TRUNC('month', updated_at) = DATE_TRUNC('month', NOW())
    ),
    AVG(final_grade_numeric) FILTER (WHERE final_grade_numeric IS NOT NULL),
    COUNT(*) FILTER (WHERE status IN ('draft', 'in_progress'))
  INTO v_total, v_completed_month, v_avg_grade, v_pending
  FROM public.inspections
  WHERE inspector_id = _inspector_id;
  
  -- Get grade distribution separately
  SELECT jsonb_object_agg(final_grade_letter, grade_count)
  INTO v_grade_dist
  FROM (
    SELECT final_grade_letter, COUNT(*) as grade_count
    FROM public.inspections
    WHERE inspector_id = _inspector_id AND final_grade_letter IS NOT NULL
    GROUP BY final_grade_letter
  ) grade_counts;
  
  RETURN QUERY SELECT 
    v_total,
    v_completed_month,
    ROUND(v_avg_grade, 2),
    v_pending,
    COALESCE(v_grade_dist, '{}'::JSONB);
END;
$$;

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- PHASE 6: Storage Buckets
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('inspection-photos', 'inspection-photos', false),
  ('valuation-reports', 'valuation-reports', false),
  ('assessment-exports', 'assessment-exports', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Inspectors can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'inspection-photos' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view inspection photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'inspection-photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');