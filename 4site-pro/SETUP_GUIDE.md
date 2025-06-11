# 🚀 Project4Site Complete Setup Guide

This guide will walk you through setting up the entire Project4Site platform with all microservices.

## 📋 Prerequisites

1. **Docker & Docker Compose**: Version 3.9+ required
2. **Bun**: For TypeScript services - `curl -fsSL https://bun.sh/install | bash`
3. **Rust**: For AI Analysis Pipeline - `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
4. **Python 3.11+**: For Video Generator - with `uv` package manager
5. **PostgreSQL Client**: For database management (optional)
6. **Ollama**: For local AI models (optional) - `curl -fsSL https://ollama.ai/install.sh | sh`

## 🔧 Step 1: Environment Configuration

```bash
# 1. Copy environment template
cp .env.template .env

# 2. Edit .env file and add your API keys:
# Required:
- GEMINI_API_KEY          # Google Gemini API
- DATABASE_PASSWORD       # Set a secure password
- JWT_SECRET             # 32+ character secret
- ENCRYPTION_KEY         # 32 character key

# Recommended:
- GITHUB_APP_ID          # For repository analysis
- GITHUB_APP_PRIVATE_KEY # GitHub App authentication
- STRIPE_SECRET_KEY      # For subscriptions
- VERCEL_TOKEN          # For deployments

# Optional (for full features):
- OPENAI_API_KEY        # Alternative AI model
- ANTHROPIC_API_KEY     # Claude integration
- CRAWL4AI_API_KEY      # Enhanced analysis
- AURACHAT_API_KEY      # Project mapping
```

## 🗄️ Step 2: Database Setup

### Create Database Schema

```bash
# 1. Create database directory
mkdir -p database

# 2. Create init.sql file
cat > database/init.sql << 'EOF'
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create main schema
CREATE SCHEMA IF NOT EXISTS project4site;

-- Set search path
SET search_path TO project4site, public;

-- Create enum types
CREATE TYPE project_status AS ENUM ('PENDING', 'ANALYZING', 'GENERATING', 'DEPLOYING', 'LIVE', 'ERROR');
CREATE TYPE subscription_tier AS ENUM ('FREE', 'SELECT_STYLE', 'CUSTOM_DESIGN');
CREATE TYPE template_type AS ENUM ('TECH', 'CREATIVE', 'BUSINESS', 'CUSTOM');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    subscription_tier subscription_tier DEFAULT 'FREE',
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated Sites table
CREATE TABLE generated_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    repo_url VARCHAR(500) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    template_type template_type DEFAULT 'TECH',
    status project_status DEFAULT 'PENDING',
    sections JSONB,
    partner_tool_recommendations JSONB,
    raw_markdown TEXT,
    deployed_url VARCHAR(500),
    custom_domain VARCHAR(255),
    analytics_id VARCHAR(100),
    video_url VARCHAR(500),
    mcp_server_config JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partner Referrals table
CREATE TABLE partner_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES generated_sites(id),
    partner_id VARCHAR(100) NOT NULL,
    referral_code VARCHAR(100) UNIQUE NOT NULL,
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    total_commission DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Successes table
CREATE TABLE user_successes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_id UUID REFERENCES partner_referrals(id),
    success_type VARCHAR(100),
    success_data JSONB,
    commission_amount DECIMAL(10,2),
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commission Payouts table
CREATE TABLE commission_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id VARCHAR(100) NOT NULL,
    payout_amount DECIMAL(10,2) NOT NULL,
    payout_status VARCHAR(50) DEFAULT 'PENDING',
    payout_date DATE,
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_generated_sites_user_id ON generated_sites(user_id);
CREATE INDEX idx_generated_sites_status ON generated_sites(status);
CREATE INDEX idx_partner_referrals_site_id ON partner_referrals(site_id);
CREATE INDEX idx_partner_referrals_partner_id ON partner_referrals(partner_id);
CREATE INDEX idx_user_successes_referral_id ON user_successes(referral_id);

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_sites_updated_at BEFORE UPDATE ON generated_sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_referrals_updated_at BEFORE UPDATE ON partner_referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA project4site TO project4site;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA project4site TO project4site;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA project4site TO project4site;
EOF
```

## 🐳 Step 3: Docker Services Setup

### Build and Start Services

```bash
# 1. Build all services
docker-compose build

# 2. Start core services (databases)
docker-compose up -d postgres redis

# 3. Wait for databases to be ready (30 seconds)
sleep 30

# 4. Start all application services
docker-compose up -d

# 5. (Optional) Start development tools
docker-compose --profile dev-tools up -d
```

### Verify Services

```bash
# Check all services are running
docker-compose ps

# Check service health
docker-compose exec api-gateway curl http://localhost:4000/health
docker-compose exec site-generation-engine curl http://localhost:3000/api/health

# View logs
docker-compose logs -f api-gateway
docker-compose logs -f ai-analysis-pipeline
```

## 📦 Step 4: Service-Specific Setup

### 4.1 Site Generation Engine - Database Migrations

```bash
# Navigate to service directory
cd ../services/site-generation-engine

# Install dependencies
bun install

# Generate Drizzle migrations
bun run db:generate

# Apply migrations
bun run db:migrate

# Return to 4site-pro directory
cd ../../4site-pro
```

### 4.2 AI Analysis Pipeline - Rust Setup

```bash
# If running locally (outside Docker)
cd ../services/ai-analysis-pipeline

# Build the Rust project
cargo build --release

# Install Ollama and pull Gemma model (optional)
ollama pull gemma:7b

cd ../../4site-pro
```

### 4.3 Commission Service - Partner Configuration

```bash
# The commission service will auto-configure partners from environment variables
# Verify partner configuration:
docker-compose exec commission-service curl http://localhost:3004/partners
```

## 🔄 Step 5: n8n Workflow Setup

### Install and Configure n8n

```bash
# 1. Run n8n in Docker
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  --network project4site_project4site \
  n8nio/n8n

# 2. Access n8n at http://localhost:5678
# 3. Create account and login
```

### Import Workflows

1. Navigate to n8n UI (http://localhost:5678)
2. Go to Workflows → Import
3. Import each JSON file from `n8n/` directory:
   - `content_publishing_automation.json`
   - `master_content_orchestrator.json`
   - `performance_analytics_optimization.json`
   - `strategic_social_engagement.json`

### Configure n8n Credentials

1. **PostgreSQL**: 
   - Host: `postgres`
   - Database: `project4site_db`
   - User: `project4site`
   - Password: (from .env)

2. **Redis**:
   - Host: `redis`
   - Port: `6379`

3. **API Credentials**:
   - Add credentials for Twitter, Slack, etc. as needed

## 🎨 Step 6: Frontend Development Setup

### Run the Enhanced UI

```bash
# The UI is already updated with three setup modes
cd project4site_-github-readme-to-site-generator

# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:5173
```

### Available Setup Modes

1. **Auto Mode** (Free):
   - One-click setup
   - Automatic template selection
   - Project4Site branding

2. **Select Style** ($29/mo):
   - Deep analysis with crawl4ai
   - Enhanced mapping with aurachat.io
   - MCP server generation
   - Custom domain support

3. **Custom Design** ($299/mo):
   - Full customization
   - Direct designer collaboration
   - White-label solution
   - Priority support

## 🧪 Step 7: Testing the Platform

### Test Auto Mode

```bash
# 1. Open http://localhost:5173
# 2. Click "Auto Mode"
# 3. Enter a GitHub repository URL
# 4. Watch the automated process
```

### Test Select Style Mode

```bash
# 1. Choose "Select Style"
# 2. Enter repository URL
# 3. View detailed analysis process
# 4. Preview enhanced features (requires subscription)
```

### Test API Integration

```bash
# Test GitHub App Service
curl -X POST http://localhost:4000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/facebook/react"}'

# Check analysis status
curl http://localhost:4000/api/sites/{site_id}/status

# View generated site preview
open http://localhost:3000/preview/{site_id}
```

## 📊 Step 8: Monitoring & Logs

### View Service Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ai-analysis-pipeline

# Last 100 lines
docker-compose logs --tail=100 site-generation-engine
```

### Access Development Tools

- **pgAdmin**: http://localhost:5050
  - Email: `admin@project4site.dev`
  - Password: `admin123`

- **Redis Commander**: http://localhost:8081

- **MailHog**: http://localhost:8025

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   ```bash
   # Restart postgres
   docker-compose restart postgres
   
   # Check logs
   docker-compose logs postgres
   ```

2. **AI Analysis Timeout**:
   ```bash
   # Increase timeout in .env
   GEMINI_API_TIMEOUT_MS=60000
   
   # Restart service
   docker-compose restart ai-analysis-pipeline
   ```

3. **Port Already in Use**:
   ```bash
   # Find process using port
   lsof -i :3000
   
   # Kill process or change port in docker-compose.yml
   ```

### Reset Everything

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: Deletes all data)
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## 🎉 Next Steps

1. **Configure Production Settings**:
   - Set strong passwords in .env
   - Enable SSL/TLS
   - Configure backup strategies

2. **Deploy to Production**:
   - Use Docker Swarm or Kubernetes
   - Set up CI/CD pipeline
   - Configure monitoring and alerts

3. **Customize Features**:
   - Add new templates
   - Integrate additional partners
   - Enhance AI analysis

## 📚 Additional Resources

- API Documentation: http://localhost:4000/docs
- Architecture Diagrams: See `/docs/architecture`
- Development Guide: See `/docs/development.md`

---

**Need Help?** Check the logs first, then consult the troubleshooting section. For additional support, refer to the project documentation or submit an issue on GitHub.