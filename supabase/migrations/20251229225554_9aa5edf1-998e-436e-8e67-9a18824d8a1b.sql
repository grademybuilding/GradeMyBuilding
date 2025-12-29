-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL,
  email text NOT NULL,
  interests text[] NOT NULL,
  message text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit contact form (public form)
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can view submissions
CREATE POLICY "Admins can view all submissions"
  ON public.contact_submissions
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Only admins can update submissions
CREATE POLICY "Admins can update submissions"
  ON public.contact_submissions
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete submissions
CREATE POLICY "Admins can delete submissions"
  ON public.contact_submissions
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();