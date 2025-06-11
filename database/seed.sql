-- ===================================================================
-- PROJECT4SITE - DEVELOPMENT SEED DATA
-- ===================================================================
-- This script populates the database with sample data for development
-- ===================================================================

-- ===================================================================
-- SYSTEM CONFIGURATION
-- ===================================================================

INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
('ai_processing_timeout', '60000', 'number', 'AI processing timeout in milliseconds'),
('max_sites_per_user_free', '5', 'number', 'Maximum sites for free tier users'),
('max_sites_per_user_pro', '50', 'number', 'Maximum sites for pro tier users'),
('max_sites_per_user_enterprise', '-1', 'number', 'Maximum sites for enterprise users (-1 = unlimited)'),
('site_generation_enabled', 'true', 'boolean', 'Enable/disable site generation globally'),
('partner_commissions_enabled', 'true', 'boolean', 'Enable/disable partner commission tracking'),
('viral_features_enabled', 'true', 'boolean', 'Enable/disable viral amplification features'),
('analytics_retention_days', '365', 'number', 'Number of days to retain analytics data'),
('default_template', 'tech-project', 'string', 'Default template for new sites'),
('max_file_size_mb', '10', 'number', 'Maximum file size for uploads in MB');

-- ===================================================================
-- FEATURE FLAGS
-- ===================================================================

INSERT INTO feature_flags (flag_name, flag_description, is_enabled, enabled_percentage) VALUES
('video_generation', 'Enable AI-powered video generation from repositories', true, 50),
('advanced_analytics', 'Enable advanced analytics dashboard', false, 0),
('enterprise_features', 'Enable enterprise-tier features', false, 10),
('beta_features', 'Enable beta features for testing', true, 25),
('mobile_app_integration', 'Enable mobile app API endpoints', false, 0),
('blockchain_verification', 'Enable blockchain-based portfolio verification', false, 0),
('real_time_collaboration', 'Enable real-time collaborative editing', false, 5);

-- ===================================================================
-- DEVELOPMENT USERS
-- ===================================================================

INSERT INTO users (github_username, github_id, email, full_name, subscription_tier, email_verified, terms_accepted_at, privacy_policy_accepted_at) VALUES
('demo-user', 12345, 'demo@project4site.dev', 'Demo User', 'pro', true, NOW(), NOW()),
('test-developer', 67890, 'dev@project4site.dev', 'Test Developer', 'enterprise', true, NOW(), NOW()),
('free-user', 11111, 'free@project4site.dev', 'Free Tier User', 'free', true, NOW(), NOW()),
('beta-tester', 22222, 'beta@project4site.dev', 'Beta Tester', 'pro', true, NOW(), NOW());

-- ===================================================================
-- PARTNER ECOSYSTEM
-- ===================================================================

INSERT INTO partners (name, slug, description, website_url, commission_rate, success_bonus_rate, status, integration_methods, supported_features) VALUES
(
    'Supabase',
    'supabase',
    'Open source Firebase alternative with PostgreSQL database',
    'https://supabase.com',
    0.20,
    0.30,
    'active',
    '[{"type": "deep_link", "implementation": "https://app.supabase.com/new?ref=project4site&template={{TEMPLATE_ID}}", "conversionTracking": true}]',
    ARRAY['database', 'authentication', 'real-time', 'storage']
),
(
    'Vercel',
    'vercel',
    'Frontend deployment platform for modern web applications',
    'https://vercel.com',
    0.15,
    0.25,
    'active',
    '[{"type": "api_redirect", "implementation": "https://vercel.com/new?ref=project4site&template={{TEMPLATE_ID}}", "conversionTracking": true}]',
    ARRAY['deployment', 'hosting', 'cdn', 'serverless']
),
(
    'Figma',
    'figma',
    'Collaborative design and prototyping platform',
    'https://figma.com',
    0.12,
    0.20,
    'active',
    '[{"type": "oauth2", "implementation": "https://figma.com/oauth/authorize?client_id={{CLIENT_ID}}&redirect_uri={{REDIRECT_URI}}&ref=project4site", "conversionTracking": true}]',
    ARRAY['design', 'prototyping', 'collaboration', 'handoff']
),
(
    'Linear',
    'linear',
    'Issue tracking and project management for modern teams',
    'https://linear.app',
    0.18,
    0.25,
    'active',
    '[{"type": "deep_link", "implementation": "https://linear.app/signup?ref=project4site", "conversionTracking": true}]',
    ARRAY['project-management', 'issue-tracking', 'roadmaps', 'integrations']
),
(
    'Railway',
    'railway',
    'Infrastructure platform for deploying and scaling applications',
    'https://railway.app',
    0.25,
    0.35,
    'active',
    '[{"type": "deep_link", "implementation": "https://railway.app/new?ref=project4site&template={{TEMPLATE_ID}}", "conversionTracking": true}]',
    ARRAY['infrastructure', 'deployment', 'scaling', 'databases']
),
(
    'Stripe',
    'stripe',
    'Payment processing platform for online businesses',
    'https://stripe.com',
    0.10,
    0.15,
    'pending',
    '[{"type": "api_integration", "implementation": "stripe_connect", "conversionTracking": true}]',
    ARRAY['payments', 'subscriptions', 'invoicing', 'financial-reporting']
);

-- ===================================================================
-- SAMPLE REPOSITORIES
-- ===================================================================

-- Get user IDs for foreign key references
DO $$
DECLARE
    demo_user_id UUID;
    test_dev_id UUID;
    free_user_id UUID;
    beta_tester_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE github_username = 'demo-user';
    SELECT id INTO test_dev_id FROM users WHERE github_username = 'test-developer';
    SELECT id INTO free_user_id FROM users WHERE github_username = 'free-user';
    SELECT id INTO beta_tester_id FROM users WHERE github_username = 'beta-tester';

    -- Demo user repositories
    INSERT INTO repositories (user_id, github_repo_url, repository_name, repository_description, primary_language, analysis_score, last_analyzed_at, repository_topics) VALUES
    (demo_user_id, 'https://github.com/demo-user/awesome-react-app', 'awesome-react-app', 'A modern React application with TypeScript and TailwindCSS', 'TypeScript', 9.2, NOW() - INTERVAL '1 hour', ARRAY['react', 'typescript', 'tailwindcss', 'frontend']),
    (demo_user_id, 'https://github.com/demo-user/ml-project', 'ml-project', 'Machine learning project for image classification', 'Python', 8.7, NOW() - INTERVAL '30 minutes', ARRAY['machine-learning', 'python', 'tensorflow', 'computer-vision']),
    (demo_user_id, 'https://github.com/demo-user/api-server', 'api-server', 'RESTful API server built with Node.js and Express', 'JavaScript', 8.9, NOW() - INTERVAL '15 minutes', ARRAY['nodejs', 'express', 'api', 'backend']);

    -- Test developer repositories
    INSERT INTO repositories (user_id, github_repo_url, repository_name, repository_description, primary_language, analysis_score, last_analyzed_at, repository_topics) VALUES
    (test_dev_id, 'https://github.com/test-developer/rust-cli-tool', 'rust-cli-tool', 'High-performance CLI tool written in Rust', 'Rust', 9.5, NOW() - INTERVAL '2 hours', ARRAY['rust', 'cli', 'performance', 'systems']),
    (test_dev_id, 'https://github.com/test-developer/blockchain-dapp', 'blockchain-dapp', 'Decentralized application on Ethereum', 'Solidity', 8.4, NOW() - INTERVAL '45 minutes', ARRAY['blockchain', 'ethereum', 'dapp', 'web3']);

    -- Free user repositories
    INSERT INTO repositories (user_id, github_repo_url, repository_name, repository_description, primary_language, analysis_score, last_analyzed_at, repository_topics) VALUES
    (free_user_id, 'https://github.com/free-user/personal-website', 'personal-website', 'Personal portfolio website', 'HTML', 7.8, NOW() - INTERVAL '3 hours', ARRAY['portfolio', 'html', 'css', 'personal']);

    -- Beta tester repositories
    INSERT INTO repositories (user_id, github_repo_url, repository_name, repository_description, primary_language, analysis_score, last_analyzed_at, repository_topics) VALUES
    (beta_tester_id, 'https://github.com/beta-tester/experimental-app', 'experimental-app', 'Experimental application testing new features', 'TypeScript', 8.1, NOW() - INTERVAL '1 hour', ARRAY['experimental', 'typescript', 'testing', 'beta']);
END $$;

-- ===================================================================
-- SAMPLE GENERATED SITES
-- ===================================================================

DO $$
DECLARE
    demo_user_id UUID;
    test_dev_id UUID;
    free_user_id UUID;
    demo_repo_id UUID;
    test_repo_id UUID;
    free_repo_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE github_username = 'demo-user';
    SELECT id INTO test_dev_id FROM users WHERE github_username = 'test-developer';
    SELECT id INTO free_user_id FROM users WHERE github_username = 'free-user';
    
    SELECT id INTO demo_repo_id FROM repositories WHERE repository_name = 'awesome-react-app';
    SELECT id INTO test_repo_id FROM repositories WHERE repository_name = 'rust-cli-tool';
    SELECT id INTO free_repo_id FROM repositories WHERE repository_name = 'personal-website';

    INSERT INTO generated_sites (
        repository_id, user_id, site_name, site_description, site_url, 
        template_used, status, performance_score, generation_time_ms,
        generation_completed_at, features_enabled, view_count, unique_visitors
    ) VALUES
    (
        demo_repo_id, demo_user_id, 'Awesome React App', 
        'Professional showcase for a modern React application',
        'https://awesome-react-app-demo.vercel.app',
        'tech-project', 'completed', 9.1, 28500,
        NOW() - INTERVAL '30 minutes',
        ARRAY['viral_cta', 'seo_optimized', 'mobile_optimized', 'analytics'],
        1247, 892
    ),
    (
        test_repo_id, test_dev_id, 'Rust CLI Tool', 
        'High-performance command-line tool documentation',
        'https://rust-cli-tool-showcase.vercel.app',
        'tech-project', 'completed', 9.3, 31200,
        NOW() - INTERVAL '1 hour',
        ARRAY['viral_cta', 'seo_optimized', 'mobile_optimized', 'performance_metrics'],
        834, 623
    ),
    (
        free_repo_id, free_user_id, 'Personal Portfolio', 
        'Clean and simple personal portfolio website',
        'https://personal-portfolio-free.vercel.app',
        'creative-project', 'completed', 8.2, 22100,
        NOW() - INTERVAL '2 hours',
        ARRAY['seo_optimized', 'mobile_optimized'],
        456, 321
    );
END $$;

-- ===================================================================
-- SAMPLE ANALYTICS DATA
-- ===================================================================

-- Generate daily metrics for the last 30 days
DO $$
DECLARE
    day_offset INTEGER;
    metric_date DATE;
BEGIN
    FOR day_offset IN 0..29 LOOP
        metric_date := CURRENT_DATE - day_offset;
        
        INSERT INTO analytics.daily_metrics (
            date, new_users, active_users, sites_generated, 
            successful_generations, partner_clicks, partner_conversions,
            commission_earned, avg_generation_time_ms
        ) VALUES (
            metric_date,
            FLOOR(RANDOM() * 50 + 10), -- 10-60 new users
            FLOOR(RANDOM() * 200 + 50), -- 50-250 active users
            FLOOR(RANDOM() * 30 + 5), -- 5-35 sites generated
            FLOOR(RANDOM() * 25 + 5), -- 5-30 successful generations
            FLOOR(RANDOM() * 100 + 20), -- 20-120 partner clicks
            FLOOR(RANDOM() * 15 + 2), -- 2-17 conversions
            ROUND((RANDOM() * 500 + 50)::numeric, 2), -- $50-$550 commission
            FLOOR(RANDOM() * 10000 + 20000) -- 20-30 second generation time
        );
    END LOOP;
END $$;

-- ===================================================================
-- SAMPLE PARTNER REFERRALS
-- ===================================================================

DO $$
DECLARE
    demo_user_id UUID;
    test_dev_id UUID;
    site_id UUID;
    supabase_id UUID;
    vercel_id UUID;
    figma_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE github_username = 'demo-user';
    SELECT id INTO test_dev_id FROM users WHERE github_username = 'test-developer';
    SELECT id INTO site_id FROM generated_sites LIMIT 1;
    SELECT id INTO supabase_id FROM partners WHERE slug = 'supabase';
    SELECT id INTO vercel_id FROM partners WHERE slug = 'vercel';
    SELECT id INTO figma_id FROM partners WHERE slug = 'figma';

    INSERT INTO partner_referrals (
        user_id, partner_id, site_id, referral_code, clicked_at, 
        converted_at, conversion_type, conversion_value, base_commission, 
        final_commission, commission_status
    ) VALUES
    (
        demo_user_id, supabase_id, site_id, 'SUP_' || generate_secure_token(8),
        NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day',
        'subscription_signup', 50.00, 10.00, 12.50, 'approved'
    ),
    (
        demo_user_id, vercel_id, site_id, 'VER_' || generate_secure_token(8),
        NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days',
        'pro_upgrade', 20.00, 3.00, 3.75, 'paid'
    ),
    (
        test_dev_id, figma_id, site_id, 'FIG_' || generate_secure_token(8),
        NOW() - INTERVAL '1 day', NULL,
        NULL, NULL, NULL, NULL, 'pending'
    );
END $$;

-- ===================================================================
-- SAMPLE JOB QUEUE ENTRIES
-- ===================================================================

INSERT INTO job_queue (job_type, job_data, priority, status) VALUES
('site_generation', '{"repository_url": "https://github.com/demo/example", "user_id": "demo-user", "template": "tech-project"}', 5, 'pending'),
('video_generation', '{"site_id": "site-123", "template": "tech-showcase", "duration": 60}', 3, 'pending'),
('analytics_aggregation', '{"date": "2024-01-15", "type": "daily_metrics"}', 1, 'completed'),
('commission_calculation', '{"referral_id": "ref-456", "conversion_value": 100.00}', 4, 'processing'),
('email_notification', '{"user_id": "user-789", "type": "site_generated", "site_url": "https://example.com"}', 2, 'pending');

-- ===================================================================
-- SUCCESS STORIES & USER ACHIEVEMENTS
-- ===================================================================

DO $$
DECLARE
    demo_user_id UUID;
    test_dev_id UUID;
    supabase_id UUID;
    vercel_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE github_username = 'demo-user';
    SELECT id INTO test_dev_id FROM users WHERE github_username = 'test-developer';
    SELECT id INTO supabase_id FROM partners WHERE slug = 'supabase';
    SELECT id INTO vercel_id FROM partners WHERE slug = 'vercel';

    INSERT INTO user_successes (
        user_id, partner_id, success_type, success_description, 
        value_created, commission_multiplier, verified, occurred_at
    ) VALUES
    (
        demo_user_id, supabase_id, 'tool_adoption',
        'Successfully migrated project to Supabase and launched in production',
        2500.00, 1.5, true, NOW() - INTERVAL '1 week'
    ),
    (
        test_dev_id, vercel_id, 'revenue_generation',
        'Generated $10k+ in revenue using portfolio built with project4site',
        10000.00, 2.0, true, NOW() - INTERVAL '2 weeks'
    ),
    (
        demo_user_id, NULL, 'project_completion',
        'Completed full-stack application using recommended tools',
        5000.00, 1.25, true, NOW() - INTERVAL '3 days'
    );
END $$;

-- ===================================================================
-- UPDATE PARTNER STATISTICS
-- ===================================================================

-- Update partner totals based on referral data
UPDATE partners SET 
    total_referrals = (
        SELECT COUNT(*) FROM partner_referrals pr WHERE pr.partner_id = partners.id
    ),
    total_conversions = (
        SELECT COUNT(*) FROM partner_referrals pr 
        WHERE pr.partner_id = partners.id AND pr.converted_at IS NOT NULL
    ),
    total_commission_paid = (
        SELECT COALESCE(SUM(pr.final_commission), 0) 
        FROM partner_referrals pr 
        WHERE pr.partner_id = partners.id AND pr.commission_status = 'paid'
    ),
    average_conversion_rate = (
        SELECT CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE converted_at IS NOT NULL))::numeric / COUNT(*), 4)
            ELSE 0 
        END
        FROM partner_referrals pr WHERE pr.partner_id = partners.id
    );

-- ===================================================================
-- COMPLETION MESSAGE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE 'Project4Site seed data inserted successfully!';
    RAISE NOTICE 'Development users: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'Partners configured: %', (SELECT COUNT(*) FROM partners);
    RAISE NOTICE 'Sample repositories: %', (SELECT COUNT(*) FROM repositories);
    RAISE NOTICE 'Generated sites: %', (SELECT COUNT(*) FROM generated_sites);
    RAISE NOTICE 'Partner referrals: %', (SELECT COUNT(*) FROM partner_referrals);
    RAISE NOTICE 'Daily metrics records: %', (SELECT COUNT(*) FROM analytics.daily_metrics);
    RAISE NOTICE 'System ready for development!';
END $$;