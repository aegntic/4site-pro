-- ===================================================================
-- PROJECT4SITE - DATABASE INITIALIZATION
-- ===================================================================
-- This script sets up the initial database configuration
-- ===================================================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE site_status AS ENUM ('generating', 'completed', 'failed', 'deployed');
CREATE TYPE partner_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE success_type AS ENUM ('landing_page_conversion', 'tool_adoption', 'revenue_generation', 'project_completion');

-- Create custom functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Set timezone
SET timezone = 'UTC';

-- ===================================================================
-- ANALYTICS SETUP
-- ===================================================================

-- Create analytics schema for separation
CREATE SCHEMA IF NOT EXISTS analytics;

-- Grant permissions
GRANT USAGE ON SCHEMA analytics TO project4site;
GRANT CREATE ON SCHEMA analytics TO project4site;

-- ===================================================================
-- PERFORMANCE OPTIMIZATION
-- ===================================================================

-- Set performance parameters
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET pg_stat_statements.max = 10000;

-- Restart required for these changes to take effect
SELECT pg_reload_conf();

-- ===================================================================
-- LOGGING CONFIGURATION
-- ===================================================================

-- Enable query logging for development
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = 'on';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second

-- ===================================================================
-- SECURITY SETUP
-- ===================================================================

-- Create application role with limited permissions
CREATE ROLE app_user WITH LOGIN;
GRANT CONNECT ON DATABASE project4site_dev TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT USAGE ON SCHEMA analytics TO app_user;

-- Function to create secure random tokens
CREATE OR REPLACE FUNCTION generate_secure_token(length INTEGER DEFAULT 32)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(length), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- AUDIT TRAIL SETUP
-- ===================================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(64) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    timestamp TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, new_values, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), NEW.user_id);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), NEW.user_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, old_values, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), OLD.user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- COMPLETION MESSAGE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE 'Project4Site database initialization completed successfully!';
    RAISE NOTICE 'Extensions created: uuid-ossp, pgcrypto, pg_trgm, btree_gin';
    RAISE NOTICE 'Custom types created: subscription_tier, site_status, partner_status, success_type';
    RAISE NOTICE 'Analytics schema created with proper permissions';
    RAISE NOTICE 'Audit logging system enabled';
    RAISE NOTICE 'Performance monitoring configured';
END $$;