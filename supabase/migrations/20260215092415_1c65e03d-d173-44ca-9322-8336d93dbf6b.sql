
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'pharmacien', 'caissier', 'magasinier', 'manager');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create pending_actions table for admin validation workflow
CREATE TYPE public.action_status AS ENUM ('pending', 'approved', 'rejected', 'modified');
CREATE TYPE public.action_type AS ENUM (
  'product_create', 'product_update', 'product_delete',
  'order_create', 'order_update', 'order_cancel',
  'dispensing_create', 'dispensing_update',
  'stock_adjustment', 'stock_transfer',
  'customer_create', 'customer_update',
  'pricing_change',
  'insurance_claim',
  'medical_advice_create', 'medical_advice_update',
  'store_create', 'store_update',
  'settings_change',
  'other'
);

CREATE TABLE public.pending_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type action_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status action_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.pending_actions ENABLE ROW LEVEL SECURITY;

-- Create medical_advice table
CREATE TABLE public.medical_advice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  drug_interactions JSONB DEFAULT '[]',
  contraindications JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status action_status NOT NULL DEFAULT 'pending',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_advice ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_advice_updated_at
  BEFORE UPDATE ON public.medical_advice
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for pending_actions
CREATE POLICY "Users can view their own actions"
  ON public.pending_actions FOR SELECT
  TO authenticated
  USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can view all actions"
  ON public.pending_actions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create actions"
  ON public.pending_actions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins can update actions"
  ON public.pending_actions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for medical_advice
CREATE POLICY "Published advice visible to all authenticated"
  ON public.medical_advice FOR SELECT
  TO authenticated
  USING (is_published = true OR public.has_role(auth.uid(), 'admin') OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create advice"
  ON public.medical_advice FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update advice"
  ON public.medical_advice FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete advice"
  ON public.medical_advice FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
