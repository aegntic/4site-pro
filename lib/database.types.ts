export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          tier: 'free' | 'pro' | 'business' | 'enterprise'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          referral_code: string
          referred_by: string | null
          created_at: string
          updated_at: string
          websites_limit: number
          custom_domains_limit: number
          monthly_pageviews_limit: number
          storage_limit_mb: number
          total_websites_created: number
          total_pageviews: number
          last_active_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          tier?: 'free' | 'pro' | 'business' | 'enterprise'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          referral_code?: string
          referred_by?: string | null
          created_at?: string
          updated_at?: string
          websites_limit?: number
          custom_domains_limit?: number
          monthly_pageviews_limit?: number
          storage_limit_mb?: number
          total_websites_created?: number
          total_pageviews?: number
          last_active_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          tier?: 'free' | 'pro' | 'business' | 'enterprise'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          referral_code?: string
          referred_by?: string | null
          created_at?: string
          updated_at?: string
          websites_limit?: number
          custom_domains_limit?: number
          monthly_pageviews_limit?: number
          storage_limit_mb?: number
          total_websites_created?: number
          total_pageviews?: number
          last_active_at?: string
        }
      }
      websites: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          repo_url: string
          subdomain: string | null
          custom_domain: string | null
          generation_mode: 'quick' | 'deep' | null
          template: string
          tier: string
          site_data: Json
          visuals: Json | null
          customizations: Json | null
          mcp_config: Json | null
          status: 'active' | 'building' | 'error' | 'suspended'
          build_error: string | null
          last_build_at: string | null
          pageviews: number
          unique_visitors: number
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          repo_url: string
          subdomain?: string | null
          custom_domain?: string | null
          generation_mode?: 'quick' | 'deep' | null
          template: string
          tier: string
          site_data: Json
          visuals?: Json | null
          customizations?: Json | null
          mcp_config?: Json | null
          status?: 'active' | 'building' | 'error' | 'suspended'
          build_error?: string | null
          last_build_at?: string | null
          pageviews?: number
          unique_visitors?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          repo_url?: string
          subdomain?: string | null
          custom_domain?: string | null
          generation_mode?: 'quick' | 'deep' | null
          template?: string
          tier?: string
          site_data?: Json
          visuals?: Json | null
          customizations?: Json | null
          mcp_config?: Json | null
          status?: 'active' | 'building' | 'error' | 'suspended'
          build_error?: string | null
          last_build_at?: string | null
          pageviews?: number
          unique_visitors?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_email: string
          referred_user_id: string | null
          status: 'pending' | 'completed' | 'expired'
          reward_granted: boolean
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_email: string
          referred_user_id?: string | null
          status?: 'pending' | 'completed' | 'expired'
          reward_granted?: boolean
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_email?: string
          referred_user_id?: string | null
          status?: 'pending' | 'completed' | 'expired'
          reward_granted?: boolean
          created_at?: string
          completed_at?: string | null
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          website_id: string | null
          event_type: string
          event_data: Json | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          website_id?: string | null
          event_type: string
          event_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          website_id?: string | null
          event_type?: string
          event_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          created_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          resource_type: 'website' | 'pageview' | 'storage' | 'api_call'
          amount: number
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_type: 'website' | 'pageview' | 'storage' | 'api_call'
          amount?: number
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_type?: 'website' | 'pageview' | 'storage' | 'api_call'
          amount?: number
          metadata?: Json | null
          created_at?: string
        }
      }
      subscription_history: {
        Row: {
          id: string
          user_id: string
          tier: 'free' | 'pro' | 'business' | 'enterprise'
          stripe_subscription_id: string | null
          started_at: string
          ended_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          tier: 'free' | 'pro' | 'business' | 'enterprise'
          stripe_subscription_id?: string | null
          started_at?: string
          ended_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          tier?: 'free' | 'pro' | 'business' | 'enterprise'
          stripe_subscription_id?: string | null
          started_at?: string
          ended_at?: string | null
          metadata?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_usage_limit: {
        Args: {
          p_user_id: string
          p_resource_type: string
        }
        Returns: boolean
      }
      complete_referral: {
        Args: {
          p_referral_code: string
          p_new_user_id: string
        }
        Returns: undefined
      }
      update_user_tier: {
        Args: {
          p_user_id: string
          p_tier: 'free' | 'pro' | 'business' | 'enterprise'
        }
        Returns: undefined
      }
    }
    Enums: {
      user_tier: 'free' | 'pro' | 'business' | 'enterprise'
      website_status: 'active' | 'building' | 'error' | 'suspended'
    }
  }
}