import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Authentication features will be disabled.');
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application': '4site.pro',
    },
  },
});

// Auth helpers
export const authHelpers = {
  // Sign up with email and password
  signUp: async (email: string, password: string, referralCode?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          referral_code: referralCode,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in with OAuth provider
  signInWithProvider: async (provider: 'github' | 'google') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get user profile
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update user profile
  updateUserProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Website management
export const websiteHelpers = {
  // Create a new website
  createWebsite: async (websiteData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('websites')
      .insert({
        user_id: user.id,
        ...websiteData,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user's websites
  getUserWebsites: async (userId?: string) => {
    const query = supabase
      .from('websites')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Update website
  updateWebsite: async (websiteId: string, updates: any) => {
    const { data, error } = await supabase
      .from('websites')
      .update(updates)
      .eq('id', websiteId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete website
  deleteWebsite: async (websiteId: string) => {
    const { error } = await supabase
      .from('websites')
      .delete()
      .eq('id', websiteId);
    
    if (error) throw error;
  },

  // Get website by subdomain
  getWebsiteBySubdomain: async (subdomain: string) => {
    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('status', 'published')
      .single();
    
    if (error) throw error;
    return data;
  },

  // Track website view
  trackWebsiteView: async (websiteId: string) => {
    const { error } = await supabase.rpc('increment_website_views', {
      website_id: websiteId,
    });
    
    if (error) throw error;
  },
};

// Referral system
export const referralHelpers = {
  // Track referral
  trackReferral: async (referralCode: string, source?: string) => {
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referral_code: referralCode,
        source: source || 'direct',
        landing_page: window.location.pathname,
      });
    
    if (error && error.code !== '23505') { // Ignore duplicate errors
      throw error;
    }
    
    // Store in localStorage for signup
    localStorage.setItem('referral_code', referralCode);
    
    return data;
  },

  // Get referral stats
  getReferralStats: async (userId: string) => {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId);
    
    if (error) throw error;
    
    const stats = {
      total: data.length,
      pending: data.filter(r => r.status === 'pending').length,
      activated: data.filter(r => r.status === 'activated').length,
      converted: data.filter(r => r.status === 'converted').length,
    };
    
    return stats;
  },

  // Get referral code for user
  getUserReferralCode: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('referral_code')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data.referral_code;
  },

  // Process referral reward
  processReferralReward: async (referralId: string) => {
    const { data, error } = await supabase.rpc('process_referral_reward', {
      referral_id: referralId,
    });
    
    if (error) throw error;
    return data;
  },
};

// Analytics helpers
export const analyticsHelpers = {
  // Track event
  trackEvent: async (eventType: string, properties: any = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: eventType,
        user_id: user?.id,
        properties,
        user_agent: navigator.userAgent,
      });
    
    if (error) throw error;
  },

  // Get website analytics
  getWebsiteAnalytics: async (websiteId: string, days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('website_analytics')
      .select('*')
      .eq('website_id', websiteId)
      .gte('date', startDate.toISOString())
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get user analytics summary
  getUserAnalyticsSummary: async (userId: string) => {
    const { data, error } = await supabase.rpc('get_user_analytics_summary', {
      user_id: userId,
    });
    
    if (error) throw error;
    return data;
  },
};

// Showcase helpers
export const showcaseHelpers = {
  // Get showcase sites
  getShowcaseSites: async (category?: string, limit: number = 20) => {
    let query = supabase
      .from('showcase_sites')
      .select(`
        *,
        website:websites(*)
      `)
      .order('likes', { ascending: false })
      .limit(limit);
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get Pro showcase sites for grid (ordered by viral score)
  getProShowcaseSites: async (limit: number = 9, excludeSiteId?: string) => {
    let query = supabase
      .from('pro_showcase_entries')
      .select(`
        *,
        website:websites(
          *,
          user_profile:users(*)
        )
      `)
      .eq('featured', true)
      .eq('website.status', 'active')
      .order('viral_score_at_featuring', { ascending: false })
      .order('featured_order', { ascending: true })
      .limit(limit);
    
    if (excludeSiteId) {
      query = query.neq('website_id', excludeSiteId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Calculate and update viral score for a website
  updateViralScore: async (websiteId: string) => {
    const { data, error } = await supabase.rpc('calculate_viral_score', {
      p_website_id: websiteId
    });
    
    if (error) throw error;
    return data;
  },

  // Get viral metrics for a user
  getUserViralMetrics: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        viral_score,
        total_shares,
        external_shares,
        viral_boost_level,
        viral_coefficient,
        referrals_converted,
        free_pro_earned,
        commission_tier,
        lifetime_commission_earned
      `)
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Refresh Pro showcase grid
  refreshProShowcase: async () => {
    const { data, error } = await supabase.rpc('refresh_pro_showcase');
    if (error) throw error;
    return data;
  },

  // Get auto-featuring events for a website
  getAutoFeaturingEvents: async (websiteId: string) => {
    const { data, error } = await supabase
      .from('auto_featuring_events')
      .select('*')
      .eq('website_id', websiteId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get share tracking for a website
  getShareTracking: async (websiteId: string, days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('share_tracking')
      .select('*')
      .eq('website_id', websiteId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Process referral milestone (10 referrals = free Pro)
  processReferralMilestone: async (userId: string) => {
    const { data, error } = await supabase.rpc('process_referral_milestone', {
      p_user_id: userId
    });
    
    if (error) throw error;
    return data;
  },

  // Update user viral coefficient
  updateViralCoefficient: async (userId: string) => {
    const { data, error } = await supabase.rpc('update_viral_coefficient', {
      p_user_id: userId
    });
    
    if (error) throw error;
    return data;
  },

  // Get commission earnings for user (updated for enhanced schema)
  getCommissionEarnings: async (userId: string) => {
    const { data, error } = await supabase
      .from('commission_earnings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Calculate totals by tier
    const totals = {
      total: 0,
      new: 0,
      established: 0,
      legacy: 0,
      pending: 0,
      paid: 0
    };
    
    data?.forEach(commission => {
      totals.total += Number(commission.commission_amount);
      if (commission.commission_tier === 'new') totals.new += Number(commission.commission_amount);
      if (commission.commission_tier === 'established') totals.established += Number(commission.commission_amount);
      if (commission.commission_tier === 'legacy') totals.legacy += Number(commission.commission_amount);
      
      if (commission.payment_status === 'paid') {
        totals.paid += Number(commission.commission_amount);
      } else {
        totals.pending += Number(commission.commission_amount);
      }
    });
    
    return { commissions: data, totals };
  },

  // Get referral progress toward 10-referral milestone
  getReferralProgress: async (userId: string) => {
    const { data, error } = await supabase
      .from('referrals')
      .select('status')
      .eq('referrer_id', userId);
    
    if (error) throw error;
    
    const progress = {
      total: data?.length || 0,
      converted: data?.filter(r => r.status === 'converted').length || 0,
      remaining: Math.max(0, 10 - (data?.filter(r => r.status === 'converted').length || 0)),
      percentage: Math.min(100, ((data?.filter(r => r.status === 'converted').length || 0) / 10) * 100)
    };
    
    return progress;
  },

  // Track external share
  trackExternalShare: async (websiteId: string, platform: string, shareUrl: string, userId?: string) => {
    const { data, error } = await supabase.rpc('track_external_share', {
      p_website_id: websiteId,
      p_platform: platform,
      p_share_url: shareUrl,
      p_user_id: userId
    });
    
    if (error) throw error;
    return data;
  },

  // Toggle like
  toggleLike: async (showcaseSiteId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Check if already liked
    const { data: existing } = await supabase
      .from('user_likes')
      .select('*')
      .eq('user_id', user.id)
      .eq('showcase_site_id', showcaseSiteId)
      .single();
    
    if (existing) {
      // Unlike
      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('showcase_site_id', showcaseSiteId);
      
      if (error) throw error;
      
      // Decrement likes count
      await supabase.rpc('decrement_showcase_likes', {
        showcase_id: showcaseSiteId,
      });
      
      return false;
    } else {
      // Like
      const { error } = await supabase
        .from('user_likes')
        .insert({
          user_id: user.id,
          showcase_site_id: showcaseSiteId,
        });
      
      if (error) throw error;
      
      // Increment likes count
      await supabase.rpc('increment_showcase_likes', {
        showcase_id: showcaseSiteId,
      });
      
      return true;
    }
  },
};

// Real-time subscriptions
export const realtimeHelpers = {
  // Subscribe to website updates
  subscribeToWebsiteUpdates: (websiteId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`website:${websiteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'websites',
          filter: `id=eq.${websiteId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to user notifications
  subscribeToUserNotifications: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};

// Export all helpers
export default {
  auth: authHelpers,
  websites: websiteHelpers,
  referrals: referralHelpers,
  analytics: analyticsHelpers,
  showcase: showcaseHelpers,
  realtime: realtimeHelpers,
};