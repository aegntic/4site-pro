-- Test Script for Enhanced Viral Features
-- Run this to verify the viral mechanics are working correctly

-- 1. Test viral score calculation
SELECT 'Testing viral score calculation...' as status;

-- Insert a test share
INSERT INTO public.external_shares (
  website_id, platform, share_url
) 
SELECT 
  w.id, 
  'twitter', 
  'https://twitter.com/share?url=' || w.deployment_url
FROM public.websites w 
WHERE w.status = 'published' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Check if viral score function works
SELECT 
  ss.id,
  ss.website_id,
  ss.external_shares,
  ss.viral_score,
  calculate_viral_score(ss.id) as new_viral_score
FROM public.showcase_sites ss
WHERE ss.external_shares > 0
LIMIT 3;

-- 2. Test commission rate calculation
SELECT 'Testing commission rates...' as status;

SELECT 
  months,
  get_commission_rate(months) as commission_rate,
  CASE 
    WHEN months <= 12 THEN 'new'
    WHEN months <= 48 THEN 'established'
    ELSE 'legacy'
  END as tier
FROM (
  VALUES (0), (6), (12), (24), (48), (60)
) AS test_months(months);

-- 3. Test referral progress toward free Pro
SELECT 'Testing referral progress...' as status;

SELECT 
  up.username,
  up.subscription_tier,
  COUNT(r.id) FILTER (WHERE r.status = 'converted') as converted_referrals,
  check_free_pro_eligibility(up.id) as eligible_for_free_pro
FROM public.user_profiles up
LEFT JOIN public.referrals r ON r.referrer_id = up.id
WHERE up.subscription_tier IN ('pro', 'business', 'enterprise')
GROUP BY up.id, up.username, up.subscription_tier
LIMIT 5;

-- 4. Test external share tracking
SELECT 'Testing external share tracking and viral boost...' as status;

-- Get a website to test with
DO $$
DECLARE
  test_website_id UUID;
  test_share_id UUID;
BEGIN
  -- Get first published website
  SELECT id INTO test_website_id 
  FROM public.websites 
  WHERE status = 'published' 
  LIMIT 1;
  
  IF test_website_id IS NOT NULL THEN
    -- Track 3 external shares to test multiplier
    FOR i IN 1..3 LOOP
      SELECT track_external_share(
        test_website_id,
        'twitter',
        'https://twitter.com/test_share_' || i,
        NULL
      ) INTO test_share_id;
    END LOOP;
    
    RAISE NOTICE 'Added 3 test shares for website %', test_website_id;
  END IF;
END $$;

-- Check the results
SELECT 
  w.title,
  ss.external_shares,
  ss.viral_score,
  ss.featured,
  w.views
FROM public.websites w
JOIN public.showcase_sites ss ON w.id = ss.website_id
ORDER BY ss.external_shares DESC, ss.viral_score DESC
LIMIT 5;

-- 5. Verify Pro auto-showcase feature
SELECT 'Testing Pro auto-showcase...' as status;

SELECT 
  up.username,
  up.subscription_tier,
  COUNT(w.id) as total_websites,
  COUNT(ss.id) as showcased_websites
FROM public.user_profiles up
LEFT JOIN public.websites w ON w.user_id = up.id AND w.status = 'published'
LEFT JOIN public.showcase_sites ss ON ss.website_id = w.id
WHERE up.subscription_tier IN ('pro', 'business', 'enterprise')
GROUP BY up.id, up.username, up.subscription_tier
ORDER BY up.subscription_tier DESC;

-- Summary
SELECT 
  'Viral Features Test Complete' as status,
  COUNT(DISTINCT es.id) as total_external_shares,
  COUNT(DISTINCT ss.id) as total_showcase_sites,
  COUNT(DISTINCT rc.id) as total_commissions,
  AVG(ss.viral_score) as avg_viral_score
FROM public.external_shares es
FULL OUTER JOIN public.showcase_sites ss ON TRUE
FULL OUTER JOIN public.referral_commissions rc ON TRUE;