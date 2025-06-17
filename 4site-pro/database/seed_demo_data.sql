-- Demo Data Seeder for 4site.pro
-- This creates sample Pro users and showcase sites for testing

-- Insert demo Pro users
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at) VALUES
('user1-pro-demo-uuid-000000000001', 'demo.pro1@example.com', NOW(), NOW(), NOW()),
('user2-pro-demo-uuid-000000000002', 'demo.pro2@example.com', NOW(), NOW(), NOW()),
('user3-pro-demo-uuid-000000000003', 'demo.pro3@example.com', NOW(), NOW(), NOW()),
('user4-biz-demo-uuid-000000000004', 'demo.biz1@example.com', NOW(), NOW(), NOW()),
('user5-biz-demo-uuid-000000000005', 'demo.biz2@example.com', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert demo user profiles
INSERT INTO public.user_profiles (id, email, username, subscription_tier, referral_code) VALUES
('user1-pro-demo-uuid-000000000001', 'demo.pro1@example.com', 'sarah_dev', 'pro', 'SARAH001'),
('user2-pro-demo-uuid-000000000002', 'demo.pro2@example.com', 'mike_builds', 'pro', 'MIKE002'),
('user3-pro-demo-uuid-000000000003', 'demo.pro3@example.com', 'emma_codes', 'pro', 'EMMA003'),
('user4-biz-demo-uuid-000000000004', 'demo.biz1@example.com', 'alex_agency', 'business', 'ALEX004'),
('user5-biz-demo-uuid-000000000005', 'demo.biz2@example.com', 'tech_solutions', 'business', 'TECH005')
ON CONFLICT (id) DO NOTHING;

-- Insert demo websites
INSERT INTO public.websites (id, user_id, title, description, repo_url, template, status, views, unique_visitors, created_at) VALUES
('site1-demo-uuid-000000000001', 'user1-pro-demo-uuid-000000000001', 'NextJS E-commerce Starter', 'A complete e-commerce solution built with Next.js, Stripe, and Tailwind CSS. Features include product catalog, shopping cart, and checkout.', 'https://github.com/demo/nextjs-ecommerce', 'TechProjectTemplate', 'published', 2847, 1923, NOW() - INTERVAL '5 days'),
('site2-demo-uuid-000000000002', 'user2-pro-demo-uuid-000000000002', 'React Native Fitness App', 'Cross-platform fitness tracking app with workout plans, progress tracking, and social features. Built with React Native and Firebase.', 'https://github.com/demo/fitness-tracker', 'TechProjectTemplate', 'published', 1834, 1245, NOW() - INTERVAL '3 days'),
('site3-demo-uuid-000000000003', 'user3-pro-demo-uuid-000000000003', 'Vue.js Dashboard Template', 'Professional admin dashboard template with charts, tables, and responsive design. Perfect for SaaS applications.', 'https://github.com/demo/vue-dashboard', 'TechProjectTemplate', 'published', 3291, 2156, NOW() - INTERVAL '1 day'),
('site4-demo-uuid-000000000004', 'user4-biz-demo-uuid-000000000004', 'AI Content Generator API', 'RESTful API for generating marketing content using GPT-4. Includes rate limiting, authentication, and analytics.', 'https://github.com/demo/ai-content-api', 'TechProjectTemplate', 'published', 4567, 2893, NOW() - INTERVAL '7 days'),
('site5-demo-uuid-000000000005', 'user5-biz-demo-uuid-000000000005', 'Blockchain Voting System', 'Secure voting platform built on Ethereum with transparency and immutability. Features voter verification and real-time results.', 'https://github.com/demo/blockchain-voting', 'TechProjectTemplate', 'published', 1923, 1344, NOW() - INTERVAL '2 days'),
('site6-demo-uuid-000000000006', 'user1-pro-demo-uuid-000000000001', 'Python ML Pipeline', 'End-to-end machine learning pipeline for predictive analytics. Includes data preprocessing, model training, and deployment.', 'https://github.com/demo/ml-pipeline', 'TechProjectTemplate', 'published', 2156, 1567, NOW() - INTERVAL '4 days'),
('site7-demo-uuid-000000000007', 'user2-pro-demo-uuid-000000000002', 'GraphQL Social Network', 'Modern social networking platform built with GraphQL, Apollo, and React. Features real-time messaging and media sharing.', 'https://github.com/demo/graphql-social', 'TechProjectTemplate', 'published', 1678, 1123, NOW() - INTERVAL '6 days'),
('site8-demo-uuid-000000000008', 'user3-pro-demo-uuid-000000000003', 'Flutter Weather App', 'Beautiful weather application with location tracking, forecasts, and customizable widgets. Built with Flutter and OpenWeather API.', 'https://github.com/demo/flutter-weather', 'TechProjectTemplate', 'published', 2934, 1876, NOW() - INTERVAL '8 days'),
('site9-demo-uuid-000000000009', 'user4-biz-demo-uuid-000000000004', 'Docker Microservices', 'Scalable microservices architecture with Docker, Kubernetes, and CI/CD pipeline. Includes monitoring and logging.', 'https://github.com/demo/docker-microservices', 'TechProjectTemplate', 'published', 3456, 2234, NOW() - INTERVAL '9 days')
ON CONFLICT (id) DO NOTHING;

-- Insert demo showcase sites
INSERT INTO public.showcase_sites (id, website_id, category, likes, showcase_views, featured) VALUES
('showcase1-demo-uuid-00000001', 'site1-demo-uuid-000000000001', 'ecommerce', 127, 892, false),
('showcase2-demo-uuid-00000002', 'site2-demo-uuid-000000000002', 'mobile', 89, 634, false),
('showcase3-demo-uuid-00000003', 'site3-demo-uuid-000000000003', 'dashboard', 156, 1023, true),
('showcase4-demo-uuid-00000004', 'site4-demo-uuid-000000000004', 'api', 203, 1456, true),
('showcase5-demo-uuid-00000005', 'site5-demo-uuid-000000000005', 'blockchain', 78, 567, false),
('showcase6-demo-uuid-00000006', 'site6-demo-uuid-000000000006', 'machine-learning', 145, 823, false),
('showcase7-demo-uuid-00000007', 'site7-demo-uuid-000000000007', 'social', 92, 678, false),
('showcase8-demo-uuid-00000008', 'site8-demo-uuid-000000000008', 'mobile', 134, 756, false),
('showcase9-demo-uuid-00000009', 'site9-demo-uuid-000000000009', 'devops', 167, 934, true)
ON CONFLICT (website_id) DO NOTHING;

-- Add some demo user likes
INSERT INTO public.user_likes (user_id, showcase_site_id) VALUES
('user1-pro-demo-uuid-000000000001', 'showcase4-demo-uuid-00000004'),
('user1-pro-demo-uuid-000000000001', 'showcase9-demo-uuid-00000009'),
('user2-pro-demo-uuid-000000000002', 'showcase3-demo-uuid-00000003'),
('user2-pro-demo-uuid-000000000002', 'showcase4-demo-uuid-00000004'),
('user3-pro-demo-uuid-000000000003', 'showcase1-demo-uuid-00000001'),
('user3-pro-demo-uuid-000000000003', 'showcase4-demo-uuid-00000004')
ON CONFLICT (user_id, showcase_site_id) DO NOTHING;

-- Insert some demo analytics events
INSERT INTO public.analytics_events (event_type, user_id, website_id, properties) VALUES
('website_created', 'user1-pro-demo-uuid-000000000001', 'site1-demo-uuid-000000000001', '{"template": "TechProjectTemplate", "generation_time": 23.4}'),
('showcase_interaction', 'user2-pro-demo-uuid-000000000002', NULL, '{"showcase_site_id": "showcase3-demo-uuid-00000003", "interaction_type": "view"}'),
('powered_by_click', NULL, 'site1-demo-uuid-000000000001', '{"referral_code": "SARAH001", "source": "footer"}'),
('website_created', 'user3-pro-demo-uuid-000000000003', 'site3-demo-uuid-000000000003', '{"template": "TechProjectTemplate", "generation_time": 18.7}'),
('showcase_interaction', 'user4-biz-demo-uuid-000000000004', NULL, '{"showcase_site_id": "showcase1-demo-uuid-00000001", "interaction_type": "click"}');

-- Update tier limits for demo
UPDATE public.tier_limits SET features = jsonb_set(features, '{demo_data}', 'true') WHERE tier IN ('pro', 'business');

-- Add comment
COMMENT ON TABLE public.showcase_sites IS 'Demo data includes 9 sample Pro showcase sites with realistic metrics';

-- Success message
SELECT 'Demo data seeded successfully! 🎉' as message,
       COUNT(*) as showcase_sites_created
FROM public.showcase_sites
WHERE website_id LIKE 'site%-demo-%';