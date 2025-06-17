-- 4site.pro Database Schema for Supabase
-- Designed for viral growth and scalability to 10M users

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USER MANAGEMENT
-- =====================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing')),
  subscription_ends_at TIMESTAMPTZ,
  referral_code TEXT UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  referred_by UUID REFERENCES auth.users,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_referral_code ON public.user_profiles(referral_code);
CREATE INDEX idx_user_profiles_subscription_tier ON public.user_profiles(subscription_tier);

-- =====================================================
-- WEBSITE MANAGEMENT
-- =====================================================

-- Websites created by users
CREATE TABLE public.websites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  repo_url TEXT NOT NULL,
  template TEXT NOT NULL,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  deployment_url TEXT,
  custom_domain TEXT UNIQUE,
  subdomain TEXT UNIQUE,
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  meta_tags JSONB DEFAULT '{}',
  analytics_enabled BOOLEAN DEFAULT TRUE,
  show_powered_by BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_websites_user_id ON public.websites(user_id);
CREATE INDEX idx_websites_status ON public.websites(status);
CREATE INDEX idx_websites_created_at ON public.websites(created_at DESC);
CREATE INDEX idx_websites_views ON public.websites(views DESC);
CREATE INDEX idx_websites_subdomain ON public.websites(subdomain) WHERE subdomain IS NOT NULL;

-- =====================================================
-- REFERRAL SYSTEM
-- =====================================================

-- Referral tracking
CREATE TABLE public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users NOT NULL,
  referred_user_id UUID REFERENCES auth.users,
  referral_code TEXT NOT NULL,
  referred_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'activated', 'converted', 'expired')),
  source TEXT,
  campaign TEXT,
  landing_page TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  conversion_value DECIMAL(10,2),
  rewards_granted BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_referrals_created_at ON public.referrals(created_at DESC);

-- Referral rewards
CREATE TABLE public.referral_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  referral_id UUID REFERENCES public.referrals NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('months_free', 'credits', 'cash', 'feature_unlock', 'commission')),
  reward_value JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'granted', 'used', 'expired')),
  granted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lifetime commission tracking
CREATE TABLE public.referral_commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users NOT NULL,
  referred_user_id UUID REFERENCES auth.users NOT NULL,
  payment_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.2000 for 20%
  commission_amount DECIMAL(10,2) NOT NULL,
  payment_period_start DATE NOT NULL,
  payment_period_end DATE NOT NULL,
  referral_relationship_months INTEGER NOT NULL,
  commission_tier TEXT NOT NULL CHECK (commission_tier IN ('new', 'established', 'legacy')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- External shares tracking
CREATE TABLE public.external_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID REFERENCES public.websites NOT NULL,
  showcase_site_id UUID REFERENCES public.showcase_sites,
  user_id UUID REFERENCES auth.users,
  platform TEXT NOT NULL, -- twitter, linkedin, reddit, email, etc.
  share_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  viral_boost_applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_clicked TIMESTAMPTZ
);

-- =====================================================
-- ANALYTICS & TRACKING
-- =====================================================

-- Analytics events
CREATE TABLE public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  website_id UUID REFERENCES public.websites,
  session_id TEXT,
  properties JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address INET,
  country_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_website_id ON public.analytics_events(website_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- Aggregated website analytics
CREATE TABLE public.website_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID REFERENCES public.websites NOT NULL,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  referral_clicks INTEGER DEFAULT 0,
  powered_by_clicks INTEGER DEFAULT 0,
  avg_time_on_site INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2),
  top_referrers JSONB DEFAULT '[]',
  top_pages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(website_id, date)
);

-- Indexes for performance
CREATE INDEX idx_website_analytics_website_date ON public.website_analytics(website_id, date DESC);

-- =====================================================
-- SHOWCASE & SOCIAL
-- =====================================================

-- Showcase gallery
CREATE TABLE public.showcase_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID REFERENCES public.websites NOT NULL UNIQUE,
  featured BOOLEAN DEFAULT FALSE,
  featured_order INTEGER,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  showcase_views INTEGER DEFAULT 0,
  external_shares INTEGER DEFAULT 0,
  viral_score DECIMAL(10,4) DEFAULT 0,
  last_viral_boost TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  featured_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_showcase_featured ON public.showcase_sites(featured) WHERE featured = TRUE;
CREATE INDEX idx_showcase_category ON public.showcase_sites(category);
CREATE INDEX idx_showcase_likes ON public.showcase_sites(likes DESC);
CREATE INDEX idx_showcase_views ON public.showcase_sites(showcase_views DESC);
CREATE INDEX idx_showcase_viral_score ON public.showcase_sites(viral_score DESC);
CREATE INDEX idx_showcase_external_shares ON public.showcase_sites(external_shares DESC);

-- User likes
CREATE TABLE public.user_likes (
  user_id UUID REFERENCES auth.users NOT NULL,
  showcase_site_id UUID REFERENCES public.showcase_sites NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, showcase_site_id)
);

-- =====================================================
-- USAGE TRACKING & LIMITS
-- =====================================================

-- Usage tracking
CREATE TABLE public.usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  resource_type TEXT NOT NULL,
  resource_count INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_type, period_start)
);

-- Usage limits by tier
CREATE TABLE public.tier_limits (
  tier TEXT PRIMARY KEY,
  max_websites INTEGER NOT NULL,
  max_custom_domains INTEGER NOT NULL,
  max_pageviews_per_month INTEGER,
  max_api_calls_per_month INTEGER,
  features JSONB NOT NULL
);

-- Insert default tier limits
INSERT INTO public.tier_limits (tier, max_websites, max_custom_domains, max_pageviews_per_month, max_api_calls_per_month, features) VALUES
('free', 3, 0, 10000, 1000, '{"templates": "basic", "analytics": "basic", "support": "community", "remove_branding": false}'),
('pro', -1, 5, 100000, 10000, '{"templates": "all", "analytics": "advanced", "support": "priority", "remove_branding": true, "api_access": true}'),
('business', -1, 20, 1000000, 100000, '{"templates": "all", "analytics": "advanced", "support": "dedicated", "remove_branding": true, "api_access": true, "white_label": true, "team_members": 10}'),
('enterprise', -1, -1, -1, -1, '{"templates": "all", "analytics": "custom", "support": "sla", "remove_branding": true, "api_access": true, "white_label": true, "team_members": -1, "source_code": true}');

-- =====================================================
-- A/B TESTING & EXPERIMENTS
-- =====================================================

-- Experiments
CREATE TABLE public.experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  variants JSONB NOT NULL,
  traffic_allocation JSONB NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  winner TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiment assignments
CREATE TABLE public.experiment_assignments (
  user_id UUID REFERENCES auth.users NOT NULL,
  experiment_id UUID REFERENCES public.experiments NOT NULL,
  variant TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, experiment_id)
);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON public.websites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check user website limits
CREATE OR REPLACE FUNCTION check_website_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_max_websites INTEGER;
  v_current_websites INTEGER;
BEGIN
  -- Get user tier
  SELECT subscription_tier INTO v_tier
  FROM public.user_profiles
  WHERE id = p_user_id;
  
  -- Get tier limit
  SELECT max_websites INTO v_max_websites
  FROM public.tier_limits
  WHERE tier = v_tier;
  
  -- Count current websites
  SELECT COUNT(*) INTO v_current_websites
  FROM public.websites
  WHERE user_id = p_user_id AND status != 'archived';
  
  -- Check limit (-1 means unlimited)
  RETURN v_max_websites = -1 OR v_current_websites < v_max_websites;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate viral coefficient
CREATE OR REPLACE FUNCTION calculate_viral_coefficient(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_invites_sent INTEGER;
  v_invites_accepted INTEGER;
  v_coefficient DECIMAL;
BEGIN
  -- Count invites sent
  SELECT COUNT(*) INTO v_invites_sent
  FROM public.referrals
  WHERE referrer_id = p_user_id;
  
  -- Count invites accepted
  SELECT COUNT(*) INTO v_invites_accepted
  FROM public.referrals
  WHERE referrer_id = p_user_id AND status IN ('activated', 'converted');
  
  -- Calculate coefficient
  IF v_invites_sent > 0 THEN
    v_coefficient := v_invites_accepted::DECIMAL / v_invites_sent::DECIMAL;
  ELSE
    v_coefficient := 0;
  END IF;
  
  RETURN v_coefficient;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_assignments ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Websites policies
CREATE POLICY "Users can view own websites" ON public.websites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view published websites" ON public.websites
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can insert own websites" ON public.websites
  FOR INSERT WITH CHECK (auth.uid() = user_id AND check_website_limit(auth.uid()));

CREATE POLICY "Users can update own websites" ON public.websites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own websites" ON public.websites
  FOR DELETE USING (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Analytics policies
CREATE POLICY "Users can view analytics for own websites" ON public.website_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.websites
      WHERE websites.id = website_analytics.website_id
      AND websites.user_id = auth.uid()
    )
  );

-- Showcase policies
CREATE POLICY "Public can view showcase sites" ON public.showcase_sites
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can like showcase sites" ON public.user_likes
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- =====================================================

-- Top performing websites
CREATE MATERIALIZED VIEW public.top_websites AS
SELECT 
  w.id,
  w.title,
  w.description,
  w.template,
  w.deployment_url,
  w.views,
  w.unique_visitors,
  up.username,
  up.avatar_url,
  up.subscription_tier,
  COALESCE(ss.likes, 0) as likes,
  COALESCE(ss.showcase_views, 0) as showcase_views
FROM public.websites w
JOIN public.user_profiles up ON w.user_id = up.id
LEFT JOIN public.showcase_sites ss ON w.id = ss.website_id
WHERE w.status = 'published'
ORDER BY w.views DESC, ss.likes DESC
LIMIT 100;

-- Create index on materialized view
CREATE INDEX idx_top_websites_views ON public.top_websites(views DESC);

-- Refresh materialized view every hour
CREATE OR REPLACE FUNCTION refresh_top_websites()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.top_websites;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA & SETUP
-- =====================================================

-- Create trigger to auto-create user profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-add Pro sites to showcase
CREATE OR REPLACE FUNCTION auto_add_pro_site_to_showcase()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a Pro+ user and site is published
  IF (
    SELECT subscription_tier 
    FROM public.user_profiles 
    WHERE id = NEW.user_id
  ) IN ('pro', 'business', 'enterprise') 
  AND NEW.status = 'published' THEN
    
    -- Add to showcase if not already there
    INSERT INTO public.showcase_sites (website_id, category, featured)
    VALUES (
      NEW.id,
      COALESCE(NEW.template, 'general'),
      (SELECT subscription_tier FROM public.user_profiles WHERE id = NEW.user_id) = 'business'
    )
    ON CONFLICT (website_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-add Pro sites to showcase
CREATE TRIGGER trigger_auto_add_pro_showcase
  AFTER INSERT OR UPDATE ON public.websites
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_pro_site_to_showcase();

-- Function to remove from showcase when downgraded
CREATE OR REPLACE FUNCTION handle_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If downgraded from Pro to Free
  IF OLD.subscription_tier IN ('pro', 'business', 'enterprise') 
     AND NEW.subscription_tier = 'free' THEN
    
    -- Remove all their sites from showcase
    DELETE FROM public.showcase_sites 
    WHERE website_id IN (
      SELECT id FROM public.websites WHERE user_id = NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for subscription changes
CREATE TRIGGER trigger_subscription_change
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_subscription_change();

-- RPC Functions for showcase interactions
CREATE OR REPLACE FUNCTION increment_showcase_views(showcase_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.showcase_sites
  SET showcase_views = showcase_views + 1
  WHERE id = showcase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_showcase_likes(showcase_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.showcase_sites
  SET likes = likes + 1
  WHERE id = showcase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_showcase_likes(showcase_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.showcase_sites
  SET likes = GREATEST(0, likes - 1)
  WHERE id = showcase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Viral score calculation function
CREATE OR REPLACE FUNCTION calculate_viral_score(showcase_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_site RECORD;
  v_base_score DECIMAL;
  v_share_multiplier DECIMAL;
  v_engagement_score DECIMAL;
  v_time_decay DECIMAL;
  v_final_score DECIMAL;
BEGIN
  -- Get showcase site data
  SELECT ss.*, w.views, w.unique_visitors, up.subscription_tier
  INTO v_site
  FROM public.showcase_sites ss
  JOIN public.websites w ON ss.website_id = w.id
  JOIN public.user_profiles up ON w.user_id = up.id
  WHERE ss.id = showcase_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Base score from engagement
  v_engagement_score := (v_site.likes * 2) + (v_site.showcase_views * 0.1) + (v_site.views * 0.05);
  
  -- Share multiplier (external shares boost featuring likelihood)
  v_share_multiplier := CASE 
    WHEN v_site.external_shares = 0 THEN 1.0
    WHEN v_site.external_shares <= 5 THEN 1.2
    WHEN v_site.external_shares <= 15 THEN 1.5
    WHEN v_site.external_shares <= 50 THEN 2.0
    ELSE 3.0
  END;
  
  -- Time decay (newer content gets slight boost)
  v_time_decay := GREATEST(0.8, 1.0 - (EXTRACT(EPOCH FROM NOW() - v_site.created_at) / (86400 * 30))); -- 30 day decay
  
  -- Subscription tier bonus
  v_base_score := CASE v_site.subscription_tier
    WHEN 'business' THEN v_engagement_score * 1.3
    WHEN 'enterprise' THEN v_engagement_score * 1.1
    ELSE v_engagement_score
  END;
  
  -- Calculate final viral score
  v_final_score := v_base_score * v_share_multiplier * v_time_decay;
  
  -- Update the score
  UPDATE public.showcase_sites 
  SET viral_score = v_final_score,
      last_viral_boost = NOW()
  WHERE id = showcase_id;
  
  RETURN v_final_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Track external share function
CREATE OR REPLACE FUNCTION track_external_share(
  p_website_id UUID,
  p_platform TEXT,
  p_share_url TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_share_id UUID;
  v_showcase_id UUID;
BEGIN
  -- Get showcase site ID
  SELECT id INTO v_showcase_id
  FROM public.showcase_sites
  WHERE website_id = p_website_id;
  
  -- Insert share record
  INSERT INTO public.external_shares (
    website_id, showcase_site_id, user_id, platform, share_url
  ) VALUES (
    p_website_id, v_showcase_id, p_user_id, p_platform, p_share_url
  ) RETURNING id INTO v_share_id;
  
  -- Update external shares count
  UPDATE public.showcase_sites
  SET external_shares = external_shares + 1
  WHERE id = v_showcase_id;
  
  -- Recalculate viral score
  PERFORM calculate_viral_score(v_showcase_id);
  
  -- Apply viral boost if threshold reached
  IF (SELECT external_shares FROM public.showcase_sites WHERE id = v_showcase_id) % 5 = 0 THEN
    UPDATE public.showcase_sites
    SET featured = TRUE,
        featured_at = NOW()
    WHERE id = v_showcase_id;
  END IF;
  
  RETURN v_share_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate commission rate based on relationship duration
CREATE OR REPLACE FUNCTION get_commission_rate(relationship_months INTEGER)
RETURNS DECIMAL AS $$
BEGIN
  RETURN CASE 
    WHEN relationship_months <= 12 THEN 0.2000  -- 20% for first 13 months (0-12)
    WHEN relationship_months <= 48 THEN 0.2500  -- 25% for next 4 years (13-48)
    ELSE 0.4000                                 -- 40% for 4+ years
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Process referral commission
CREATE OR REPLACE FUNCTION process_referral_commission(
  p_referred_user_id UUID,
  p_payment_amount DECIMAL,
  p_payment_period_start DATE,
  p_payment_period_end DATE
)
RETURNS UUID AS $$
DECLARE
  v_referrer_id UUID;
  v_relationship_months INTEGER;
  v_commission_rate DECIMAL;
  v_commission_amount DECIMAL;
  v_commission_tier TEXT;
  v_commission_id UUID;
BEGIN
  -- Get referrer
  SELECT referred_by INTO v_referrer_id
  FROM public.user_profiles
  WHERE id = p_referred_user_id AND referred_by IS NOT NULL;
  
  IF v_referrer_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calculate relationship duration
  SELECT EXTRACT(MONTH FROM AGE(NOW(), created_at)) INTO v_relationship_months
  FROM public.user_profiles
  WHERE id = p_referred_user_id;
  
  -- Get commission rate and tier
  v_commission_rate := get_commission_rate(v_relationship_months);
  v_commission_amount := p_payment_amount * v_commission_rate;
  
  v_commission_tier := CASE 
    WHEN v_relationship_months <= 12 THEN 'new'
    WHEN v_relationship_months <= 48 THEN 'established'
    ELSE 'legacy'
  END;
  
  -- Insert commission record
  INSERT INTO public.referral_commissions (
    referrer_id,
    referred_user_id,
    payment_amount,
    commission_rate,
    commission_amount,
    payment_period_start,
    payment_period_end,
    referral_relationship_months,
    commission_tier
  ) VALUES (
    v_referrer_id,
    p_referred_user_id,
    p_payment_amount,
    v_commission_rate,
    v_commission_amount,
    p_payment_period_start,
    p_payment_period_end,
    v_relationship_months,
    v_commission_tier
  ) RETURNING id INTO v_commission_id;
  
  RETURN v_commission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check for free Pro tier eligibility (10 referrals)
CREATE OR REPLACE FUNCTION check_free_pro_eligibility(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_converted_referrals INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_converted_referrals
  FROM public.referrals
  WHERE referrer_id = p_user_id AND status = 'converted';
  
  RETURN v_converted_referrals >= 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-upgrade to Pro for 10+ referrals
CREATE OR REPLACE FUNCTION auto_upgrade_for_referrals()
RETURNS TRIGGER AS $$
DECLARE
  v_referrer_id UUID;
  v_converted_count INTEGER;
BEGIN
  -- Only process conversions
  IF NEW.status = 'converted' AND OLD.status != 'converted' THEN
    v_referrer_id := NEW.referrer_id;
    
    -- Count total conversions for this referrer
    SELECT COUNT(*) INTO v_converted_count
    FROM public.referrals
    WHERE referrer_id = v_referrer_id AND status = 'converted';
    
    -- Award free Pro at 10 referrals
    IF v_converted_count = 10 THEN
      UPDATE public.user_profiles
      SET subscription_tier = 'pro',
          subscription_status = 'active',
          subscription_ends_at = NOW() + INTERVAL '12 months'
      WHERE id = v_referrer_id AND subscription_tier = 'free';
      
      -- Create reward record
      INSERT INTO public.referral_rewards (
        user_id, referral_id, reward_type, reward_value, status, granted_at
      ) VALUES (
        v_referrer_id, NEW.id, 'months_free', 
        '{"months": 12, "reason": "10_referrals_milestone"}', 
        'granted', NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-upgrade
CREATE TRIGGER trigger_auto_upgrade_for_referrals
  AFTER UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION auto_upgrade_for_referrals();

-- Success message
COMMENT ON SCHEMA public IS '4site.pro database schema v1.0 - Ready for viral growth!';