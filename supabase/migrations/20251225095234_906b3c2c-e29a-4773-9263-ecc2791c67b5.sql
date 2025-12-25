-- Create notifications table for user notifications and reminders
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'inspection_reminder', 'system', 'info'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- Optional reference to inspection_id or other entity
  is_read BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMP WITH TIME ZONE, -- For scheduled reminders
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  inspection_reminders BOOLEAN DEFAULT true,
  reminder_days_before INTEGER DEFAULT 1, -- Days before inspection to send reminder
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own preferences" 
ON public.notification_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" 
ON public.notification_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
ON public.notification_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_scheduled ON public.notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- Create function to generate inspection reminders
CREATE OR REPLACE FUNCTION public.create_inspection_reminder()
RETURNS TRIGGER AS $$
DECLARE
  v_inspector_name TEXT;
  v_property_address TEXT;
BEGIN
  -- Get inspector name
  SELECT full_name INTO v_inspector_name
  FROM public.profiles
  WHERE id = NEW.inspector_id;

  -- Get property address
  SELECT address INTO v_property_address
  FROM public.properties
  WHERE id = NEW.property_id;

  -- Create notification for the inspector
  INSERT INTO public.notifications (user_id, type, title, message, related_id, scheduled_for)
  VALUES (
    NEW.inspector_id,
    'inspection_reminder',
    'Upcoming Inspection',
    'You have an inspection scheduled for ' || v_property_address || ' on ' || NEW.inspection_date::TEXT,
    NEW.id,
    (NEW.inspection_date - INTERVAL '1 day')::TIMESTAMP WITH TIME ZONE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new inspections
CREATE TRIGGER on_inspection_created
  AFTER INSERT ON public.inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.create_inspection_reminder();