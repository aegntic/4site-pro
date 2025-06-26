import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For demo mode, provide mock values
const isDemo = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('demo-project');

if (isDemo) {
  console.warn('Running in demo mode - Supabase features will be limited');
}

// Create supabase client (with demo fallback)
export const supabase = isDemo 
  ? null  // In demo mode, return null client
  : createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    });

// Demo mode helper
const throwDemoError = () => {
  throw new Error('Authentication not available in demo mode. Please set up Supabase environment variables.');
};

// Auth helpers
export const signUp = async (email: string, password: string, referralCode?: string) => {
  if (isDemo || !supabase) throwDemoError();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        referral_code: referralCode,
      },
    },
  });

  if (error) throw error;

  // Process referral if code provided
  if (data.user && referralCode) {
    await supabase.rpc('complete_referral', {
      p_referral_code: referralCode,
      p_new_user_id: data.user.id,
    });
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  if (isDemo || !supabase) throwDemoError();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signInWithProvider = async (provider: 'github' | 'google') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  if (isDemo || !supabase) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getSession = async () => {
  if (isDemo || !supabase) return null;
  
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// User profile helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Website helpers
export const getUserWebsites = async (userId: string) => {
  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createWebsite = async (websiteData: any) => {
  // Check usage limits first
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const canCreate = await checkUsageLimit(user.id, 'website');
  if (!canCreate) {
    throw new Error('Website limit reached. Please upgrade your plan.');
  }

  const { data, error } = await supabase
    .from('websites')
    .insert(websiteData)
    .select()
    .single();

  if (error) throw error;

  // Track usage
  await trackUsage(user.id, 'website', 1);

  return data;
};

export const updateWebsite = async (websiteId: string, updates: any) => {
  const { data, error } = await supabase
    .from('websites')
    .update(updates)
    .eq('id', websiteId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteWebsite = async (websiteId: string) => {
  const { error } = await supabase
    .from('websites')
    .delete()
    .eq('id', websiteId);

  if (error) throw error;
};

// Analytics helpers
export const trackEvent = async (eventData: {
  website_id?: string;
  event_type: string;
  event_data?: any;
}) => {
  const user = await getCurrentUser();
  
  const { error } = await supabase
    .from('analytics_events')
    .insert({
      user_id: user?.id,
      ...eventData,
    });

  if (error) console.error('Failed to track event:', error);
};

export const getWebsiteAnalytics = async (websiteId: string, timeRange: 'day' | 'week' | 'month' = 'week') => {
  const startDate = new Date();
  switch (timeRange) {
    case 'day':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
  }

  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('website_id', websiteId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Usage tracking helpers
export const checkUsageLimit = async (userId: string, resourceType: 'website' | 'pageview' | 'storage' | 'api_call') => {
  const { data, error } = await supabase
    .rpc('check_usage_limit', {
      p_user_id: userId,
      p_resource_type: resourceType,
    });

  if (error) throw error;
  return data;
};

export const trackUsage = async (userId: string, resourceType: string, amount: number = 1, metadata?: any) => {
  const { error } = await supabase
    .from('usage_tracking')
    .insert({
      user_id: userId,
      resource_type: resourceType,
      amount,
      metadata,
    });

  if (error) console.error('Failed to track usage:', error);
};

export const getUserUsage = async (userId: string, resourceType?: string) => {
  let query = supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', new Date(new Date().setDate(1)).toISOString()); // Current month

  if (resourceType) {
    query = query.eq('resource_type', resourceType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Referral helpers
export const getUserReferrals = async (userId: string) => {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createReferral = async (referrerEmail: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('referrals')
    .insert({
      referrer_id: user.id,
      referred_email: referrerEmail,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Subscription helpers
export const updateUserTier = async (userId: string, tier: 'free' | 'pro' | 'business' | 'enterprise') => {
  const { error } = await supabase
    .rpc('update_user_tier', {
      p_user_id: userId,
      p_tier: tier,
    });

  if (error) throw error;
};

export const getUserSubscriptionHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscription_history')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Real-time subscriptions
export const subscribeToWebsiteUpdates = (websiteId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`website:${websiteId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'websites', filter: `id=eq.${websiteId}` }, callback)
    .subscribe();
};

export const subscribeToUserUpdates = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`user:${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `id=eq.${userId}` }, callback)
    .subscribe();
};

// Enhanced viral mechanics helpers
export const showcaseHelpers = {
  // Get Pro showcase sites with viral scoring
  getProShowcaseSites: async (limit: number = 9, excludeId?: string) => {
    let query = supabase
      .from('pro_showcase_entries')
      .select(`
        *,
        website:websites!inner(
          id,
          title,
          description,
          deployment_url,
          custom_domain,
          viral_score,
          pageviews,
          likes,
          user_profile:users!inner(
            username,
            avatar_url,
            tier
          )
        )
      `)
      .eq('featured', true)
      .order('viral_score_at_featuring', { ascending: false })
      .limit(limit);

    if (excludeId) {
      query = query.neq('website_id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Track external share with viral scoring
  trackExternalShare: async (websiteId: string, platform: string, shareUrl: string, userId?: string) => {
    const { error } = await supabase.rpc('track_external_share', {
      p_website_id: websiteId,
      p_platform: platform,
      p_share_url: shareUrl,
      p_user_id: userId
    });

    if (error) throw error;
  },

  // Update viral score
  updateViralScore: async (websiteId: string) => {
    const { data, error } = await supabase.rpc('calculate_viral_score', {
      p_website_id: websiteId
    });

    if (error) throw error;
    return data;
  },

  // Get user viral metrics
  getUserViralMetrics: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('viral_score, total_shares, external_shares, viral_boost_level, viral_coefficient, referrals_converted')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get commission earnings
  getCommissionEarnings: async (userId: string) => {
    const { data, error } = await supabase
      .from('commission_earnings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Process referral milestone
  processReferralMilestone: async (userId: string) => {
    const { error } = await supabase.rpc('process_referral_milestone', {
      p_user_id: userId
    });

    if (error) throw error;
  },

  // Refresh Pro showcase
  refreshProShowcase: async () => {
    const { error } = await supabase.rpc('refresh_pro_showcase');
    if (error) throw error;
  }
};