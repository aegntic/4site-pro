-- ===================================================================
-- PROJECT4SITE - MAIN DATABASE SCHEMA
-- ===================================================================
-- Comprehensive schema for AI-powered presentation intelligence platform
-- Optimized for performance and scalability
-- ===================================================================

-- ===================================================================
-- USERS & AUTHENTICATION
-- ===================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_username VARCHAR(255) UNIQUE NOT NULL,
    github_id INTEGER UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    github_access_token TEXT, -- Encrypted
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    terms_accepted_at TIMESTAMP,
    privacy_policy_accepted_at TIMESTAMP
);

-- User sessions for security
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- API keys for programmatic access
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    key_hash TEXT NOT NULL, -- bcrypt hash of the actual key
    key_prefix VARCHAR(20) NOT NULL, -- First few characters for identification
    scopes TEXT[] DEFAULT ARRAY[]::TEXT[],
    rate_limit_per_hour INTEGER DEFAULT 1000,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT unique_user_key_name UNIQUE (user_id, key_name)
);

-- ===================================================================
-- REPOSITORY MANAGEMENT
-- ===================================================================

CREATE TABLE repositories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    github_repo_url VARCHAR(500) NOT NULL,
    github_repo_id INTEGER,
    repository_name VARCHAR(255) NOT NULL,
    repository_description TEXT,
    branch_name VARCHAR(100) DEFAULT 'main',
    is_private BOOLEAN DEFAULT false,
    repository_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    primary_language VARCHAR(50),
    languages JSONB DEFAULT '{}', -- Language breakdown
    
    -- Analysis metadata
    last_analyzed_at TIMESTAMP,
    analysis_version VARCHAR(20),
    analysis_score DECIMAL(3,2),
    analysis_data JSONB DEFAULT '{}',
    
    -- Repository statistics
    stars_count INTEGER DEFAULT 0,
    forks_count INTEGER DEFAULT 0,
    watchers_count INTEGER DEFAULT 0,
    size_kb INTEGER DEFAULT 0,
    
    -- Automation settings
    auto_sync_enabled BOOLEAN DEFAULT true,
    webhook_enabled BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMP,
    sync_error_count INTEGER DEFAULT 0,
    last_sync_error TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    CONSTRAINT unique_user_repo UNIQUE (user_id, github_repo_url)
);

-- Repository files cache
CREATE TABLE repository_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50), -- 'readme', 'planning', 'tasks', 'config', 'other'
    content_hash VARCHAR(64), -- SHA-256 hash of content
    content TEXT,
    content_size INTEGER,
    last_modified_at TIMESTAMP,
    analyzed_at TIMESTAMP,
    analysis_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_repo_file UNIQUE (repository_id, file_path)
);

-- ===================================================================
-- SITE GENERATION
-- ===================================================================

CREATE TABLE generated_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Site configuration
    site_name VARCHAR(255) NOT NULL,
    site_description TEXT,
    site_url VARCHAR(500) UNIQUE,
    custom_domain VARCHAR(255),
    template_used VARCHAR(100) NOT NULL,
    template_version VARCHAR(20),
    theme_config JSONB DEFAULT '{}',
    
    -- Generation metadata
    generation_started_at TIMESTAMP DEFAULT NOW(),
    generation_completed_at TIMESTAMP,
    generation_time_ms INTEGER,
    generation_version VARCHAR(20),
    ai_models_used TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Performance metrics
    performance_score DECIMAL(3,2),
    lighthouse_scores JSONB DEFAULT '{}',
    bundle_size_kb INTEGER,
    load_time_ms INTEGER,
    
    -- Features & content
    features_enabled TEXT[] DEFAULT ARRAY[]::TEXT[],
    viral_cta_enabled BOOLEAN DEFAULT true,
    seo_optimized BOOLEAN DEFAULT true,
    mobile_optimized BOOLEAN DEFAULT true,
    
    -- Status & deployment
    status site_status DEFAULT 'generating',
    deployment_url TEXT,
    deployment_status VARCHAR(50),
    deployment_logs TEXT,
    last_deployed_at TIMESTAMP,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Site assets (images, videos, etc.)
CREATE TABLE site_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES generated_sites(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'document', 'favicon'
    asset_path VARCHAR(500) NOT NULL,
    asset_url TEXT,
    file_size_bytes INTEGER,
    mime_type VARCHAR(100),
    alt_text TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_site_asset UNIQUE (site_id, asset_path)
);

-- ===================================================================
-- PARTNER ECOSYSTEM
-- ===================================================================

CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    website_url VARCHAR(500),
    
    -- API integration
    api_endpoint VARCHAR(500),
    api_version VARCHAR(20),
    auth_method VARCHAR(50), -- 'oauth2', 'api_key', 'bearer_token'
    
    -- Commission structure
    commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.10, -- 10% default
    success_bonus_rate DECIMAL(5,4) DEFAULT 0.05, -- 5% success bonus
    minimum_payout DECIMAL(10,2) DEFAULT 10.00,
    payout_frequency VARCHAR(20) DEFAULT 'monthly', -- 'weekly', 'monthly', 'quarterly'
    
    -- Integration configuration
    integration_methods JSONB DEFAULT '[]',
    supported_features TEXT[] DEFAULT ARRAY[]::TEXT[],
    webhook_url TEXT,
    webhook_secret TEXT,
    
    -- Status & metrics
    status partner_status DEFAULT 'active',
    total_referrals INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    total_commission_paid DECIMAL(12,2) DEFAULT 0.00,
    average_conversion_rate DECIMAL(5,4) DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Partner referrals and tracking
CREATE TABLE partner_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES generated_sites(id) ON DELETE CASCADE,
    
    -- Referral tracking
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    click_id VARCHAR(100),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    
    -- User journey
    clicked_at TIMESTAMP DEFAULT NOW(),
    converted_at TIMESTAMP,
    conversion_type VARCHAR(100),
    conversion_value DECIMAL(10,2),
    
    -- Commission calculation
    base_commission DECIMAL(10,2),
    success_multiplier DECIMAL(3,2) DEFAULT 1.0,
    final_commission DECIMAL(10,2),
    commission_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'disputed'
    commission_paid_at TIMESTAMP,
    
    -- Metadata
    source_url TEXT,
    referrer_url TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================================================
-- SUCCESS TRACKING & ANALYTICS
-- ===================================================================

CREATE TABLE user_successes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    site_id UUID REFERENCES generated_sites(id) ON DELETE SET NULL,
    referral_id UUID REFERENCES partner_referrals(id) ON DELETE SET NULL,
    
    -- Success details
    success_type success_type NOT NULL,
    success_description TEXT,
    value_created DECIMAL(12,2),
    success_metrics JSONB DEFAULT '{}',
    
    -- Verification
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    verification_method VARCHAR(50),
    verification_data JSONB DEFAULT '{}',
    
    -- Commission impact
    commission_multiplier DECIMAL(3,2) DEFAULT 1.0,
    bonus_commission DECIMAL(10,2) DEFAULT 0.00,
    
    occurred_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Daily analytics aggregations
CREATE TABLE analytics.daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    
    -- User metrics
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    returning_users INTEGER DEFAULT 0,
    
    -- Site generation metrics
    sites_generated INTEGER DEFAULT 0,
    successful_generations INTEGER DEFAULT 0,
    failed_generations INTEGER DEFAULT 0,
    avg_generation_time_ms INTEGER DEFAULT 0,
    
    -- Partner metrics
    partner_clicks INTEGER DEFAULT 0,
    partner_conversions INTEGER DEFAULT 0,
    commission_earned DECIMAL(10,2) DEFAULT 0.00,
    
    -- Performance metrics
    avg_site_performance_score DECIMAL(3,2),
    avg_page_load_time_ms INTEGER DEFAULT 0,
    total_site_views INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_daily_metrics UNIQUE (date)
);

-- Real-time site analytics
CREATE TABLE site_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES generated_sites(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Traffic metrics
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    bounce_rate DECIMAL(3,2),
    avg_session_duration INTEGER, -- seconds
    
    -- Engagement metrics
    viral_shares INTEGER DEFAULT 0,
    partner_clicks INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,4),
    
    -- Revenue metrics
    commission_generated DECIMAL(10,2) DEFAULT 0.00,
    commission_count INTEGER DEFAULT 0,
    
    -- Geographic data
    top_countries JSONB DEFAULT '{}',
    top_referrers JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_site_daily_analytics UNIQUE (site_id, date)
);

-- ===================================================================
-- QUEUE & JOB MANAGEMENT
-- ===================================================================

CREATE TABLE job_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(50) NOT NULL,
    job_data JSONB NOT NULL DEFAULT '{}',
    priority INTEGER DEFAULT 0, -- Higher number = higher priority
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'retry'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Timing
    scheduled_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    processing_time_ms INTEGER,
    
    -- Error handling
    error_message TEXT,
    error_stack TEXT,
    
    -- Worker identification
    worker_id VARCHAR(100),
    worker_host VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================================================
-- SYSTEM CONFIGURATION
-- ===================================================================

CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    config_type VARCHAR(50), -- 'string', 'number', 'boolean', 'object', 'array'
    description TEXT,
    is_secret BOOLEAN DEFAULT false,
    
    -- Versioning
    version INTEGER DEFAULT 1,
    previous_value JSONB,
    changed_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Feature flags
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_name VARCHAR(100) UNIQUE NOT NULL,
    flag_description TEXT,
    is_enabled BOOLEAN DEFAULT false,
    
    -- Targeting
    enabled_for_users UUID[] DEFAULT ARRAY[]::UUID[],
    enabled_percentage INTEGER DEFAULT 0, -- 0-100
    targeting_rules JSONB DEFAULT '{}',
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    last_modified_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================================

-- Users
CREATE INDEX idx_users_github_username ON users(github_username);
CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_last_active ON users(last_active_at DESC);

-- User sessions
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- API keys
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- Repositories
CREATE INDEX idx_repositories_user_id ON repositories(user_id);
CREATE INDEX idx_repositories_github_repo_url ON repositories(github_repo_url);
CREATE INDEX idx_repositories_last_analyzed ON repositories(last_analyzed_at DESC);
CREATE INDEX idx_repositories_auto_sync ON repositories(auto_sync_enabled, last_sync_at);

-- Repository files
CREATE INDEX idx_repo_files_repository_id ON repository_files(repository_id);
CREATE INDEX idx_repo_files_type ON repository_files(file_type);
CREATE INDEX idx_repo_files_hash ON repository_files(content_hash);

-- Generated sites
CREATE INDEX idx_sites_repository_id ON generated_sites(repository_id);
CREATE INDEX idx_sites_user_id ON generated_sites(user_id);
CREATE INDEX idx_sites_status ON generated_sites(status);
CREATE INDEX idx_sites_url ON generated_sites(site_url);
CREATE INDEX idx_sites_performance ON generated_sites(performance_score DESC);
CREATE INDEX idx_sites_created ON generated_sites(created_at DESC);

-- Partner referrals
CREATE INDEX idx_referrals_user_partner ON partner_referrals(user_id, partner_id);
CREATE INDEX idx_referrals_site_id ON partner_referrals(site_id);
CREATE INDEX idx_referrals_code ON partner_referrals(referral_code);
CREATE INDEX idx_referrals_converted ON partner_referrals(converted_at) WHERE converted_at IS NOT NULL;
CREATE INDEX idx_referrals_commission_status ON partner_referrals(commission_status);

-- Analytics
CREATE INDEX idx_daily_metrics_date ON analytics.daily_metrics(date DESC);
CREATE INDEX idx_site_analytics_site_date ON site_analytics(site_id, date DESC);

-- Job queue
CREATE INDEX idx_job_queue_status ON job_queue(status);
CREATE INDEX idx_job_queue_priority ON job_queue(priority DESC, scheduled_at);
CREATE INDEX idx_job_queue_type ON job_queue(job_type);

-- Full-text search indexes
CREATE INDEX idx_repositories_search ON repositories USING GIN (
    to_tsvector('english', repository_name || ' ' || COALESCE(repository_description, ''))
);

CREATE INDEX idx_sites_search ON generated_sites USING GIN (
    to_tsvector('english', site_name || ' ' || COALESCE(site_description, ''))
);

-- ===================================================================
-- TRIGGERS
-- ===================================================================

-- Update timestamps
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repositories_updated_at 
    BEFORE UPDATE ON repositories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_sites_updated_at 
    BEFORE UPDATE ON generated_sites 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at 
    BEFORE UPDATE ON partners 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_referrals_updated_at 
    BEFORE UPDATE ON partner_referrals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers for sensitive tables
CREATE TRIGGER audit_users 
    AFTER INSERT OR UPDATE OR DELETE ON users 
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_partner_referrals 
    AFTER INSERT OR UPDATE OR DELETE ON partner_referrals 
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ===================================================================
-- VIEWS FOR COMMON QUERIES
-- ===================================================================

-- User dashboard view
CREATE VIEW user_dashboard AS
SELECT 
    u.id,
    u.github_username,
    u.subscription_tier,
    COUNT(DISTINCT r.id) as total_repositories,
    COUNT(DISTINCT gs.id) as total_sites,
    COUNT(DISTINCT pr.id) as total_referrals,
    COALESCE(SUM(pr.final_commission), 0) as total_commission_earned,
    MAX(gs.created_at) as last_site_generated,
    MAX(u.last_active_at) as last_active
FROM users u
LEFT JOIN repositories r ON u.id = r.user_id AND r.is_active = true
LEFT JOIN generated_sites gs ON u.id = gs.user_id AND gs.is_active = true
LEFT JOIN partner_referrals pr ON u.id = pr.user_id AND pr.commission_status = 'paid'
WHERE u.is_active = true
GROUP BY u.id, u.github_username, u.subscription_tier;

-- Partner performance view
CREATE VIEW partner_performance AS
SELECT 
    p.id,
    p.name,
    p.commission_rate,
    COUNT(DISTINCT pr.id) as total_referrals,
    COUNT(DISTINCT pr.id) FILTER (WHERE pr.converted_at IS NOT NULL) as total_conversions,
    CASE 
        WHEN COUNT(DISTINCT pr.id) > 0 
        THEN ROUND((COUNT(DISTINCT pr.id) FILTER (WHERE pr.converted_at IS NOT NULL))::numeric / COUNT(DISTINCT pr.id) * 100, 2)
        ELSE 0 
    END as conversion_rate_percentage,
    COALESCE(SUM(pr.final_commission), 0) as total_commission_paid,
    COALESCE(AVG(pr.conversion_value), 0) as avg_conversion_value
FROM partners p
LEFT JOIN partner_referrals pr ON p.id = pr.partner_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.commission_rate;

-- Site performance view
CREATE VIEW site_performance AS
SELECT 
    gs.id,
    gs.site_name,
    gs.site_url,
    gs.performance_score,
    gs.status,
    r.repository_name,
    u.github_username,
    COUNT(DISTINCT pr.id) as referral_count,
    COALESCE(SUM(sa.page_views), 0) as total_page_views,
    COALESCE(SUM(sa.unique_visitors), 0) as total_unique_visitors,
    COALESCE(SUM(sa.commission_generated), 0) as total_commission_generated
FROM generated_sites gs
JOIN repositories r ON gs.repository_id = r.id
JOIN users u ON gs.user_id = u.id
LEFT JOIN partner_referrals pr ON gs.id = pr.site_id
LEFT JOIN site_analytics sa ON gs.id = sa.site_id
WHERE gs.is_active = true
GROUP BY gs.id, gs.site_name, gs.site_url, gs.performance_score, gs.status, r.repository_name, u.github_username;

-- ===================================================================
-- COMPLETION MESSAGE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE 'Project4Site schema creation completed successfully!';
    RAISE NOTICE 'Tables created: %', (
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    );
    RAISE NOTICE 'Indexes created: %', (
        SELECT COUNT(*) FROM pg_indexes 
        WHERE schemaname = 'public'
    );
    RAISE NOTICE 'Views created: %', (
        SELECT COUNT(*) FROM information_schema.views 
        WHERE table_schema = 'public'
    );
    RAISE NOTICE 'Triggers created: %', (
        SELECT COUNT(*) FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
    );
END $$;