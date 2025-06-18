# 4site.pro n8n Workflow Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the complete 4site.pro n8n workflow automation system. The system consists of 8 interconnected workflows that handle the complete pipeline from GitHub repository input to deployed site with analytics.

## Prerequisites

### Required Software
- **Docker & Docker Compose** (latest version)
- **Node.js 18+** for n8n installation
- **PostgreSQL 14+** for data persistence
- **Redis 6+** for queue management
- **Git** for workflow version control

### Required API Keys
Obtain the following API keys before deployment:

```bash
# AI Services
GEMINI_API_KEY=your_google_gemini_api_key
ANTHROPIC_API_KEY=your_claude_api_key

# Deployment Services
GITHUB_TOKEN=ghp_your_github_personal_access_token
VERCEL_TOKEN=your_vercel_api_token  
NETLIFY_TOKEN=your_netlify_api_token

# DNS Management
PORKBUN_API_KEY=your_porkbun_api_key
PORKBUN_SECRET_KEY=your_porkbun_secret_key

# Analytics (Optional)
GOOGLE_ANALYTICS_MEASUREMENT_ID=your_ga4_measurement_id
MIXPANEL_TOKEN=your_mixpanel_project_token

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/4site_pro
REDIS_URL=redis://localhost:6379

# n8n Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_secure_password
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http
```

## Step 1: Infrastructure Setup

### 1.1 Create Docker Compose Configuration

Create `docker-compose.yml` in your deployment directory:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: 4site_pro
      POSTGRES_USER: n8n_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  # n8n Workflow Engine
  n8n:
    image: n8nio/n8n:latest
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=4site_pro
      - DB_POSTGRESDB_USER=n8n_user
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://${N8N_HOST}:5678/
      - GENERIC_TIMEZONE=UTC
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
      - /var/run/docker.sock:/var/run/docker.sock
      - /tmp/4site-builds:/tmp/4site-builds
      - /tmp/qa-results:/tmp/qa-results
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  n8n_data:
```

### 1.2 Create Environment File

Create `.env` file with your API keys:

```bash
# Database
POSTGRES_PASSWORD=your_secure_database_password

# n8n Authentication
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_secure_n8n_password
N8N_HOST=localhost

# API Keys (add your actual keys)
GEMINI_API_KEY=your_actual_gemini_key
ANTHROPIC_API_KEY=your_actual_claude_key
GITHUB_TOKEN=your_actual_github_token
VERCEL_TOKEN=your_actual_vercel_token
NETLIFY_TOKEN=your_actual_netlify_token
PORKBUN_API_KEY=your_actual_porkbun_key
PORKBUN_SECRET_KEY=your_actual_porkbun_secret
```

### 1.3 Create Database Initialization Scripts

Create `init-scripts/01-create-tables.sql`:

```sql
-- Site generation jobs tracking
CREATE TABLE site_generation_jobs (
  job_id VARCHAR(16) PRIMARY KEY,
  github_url TEXT NOT NULL,
  user_email VARCHAR(255),
  plan_level VARCHAR(20) DEFAULT 'free',
  status VARCHAR(50) DEFAULT 'received',
  repository_data JSONB,
  content_data JSONB,
  content_hash VARCHAR(32),
  site_data JSONB,
  ai_provider VARCHAR(20),
  build_config JSONB,
  deployment_results JSONB,
  dns_setup JSONB,
  final_site_data JSONB,
  qa_results JSONB,
  analytics_data JSONB,
  usage_stats JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Analytics events tracking
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(16) REFERENCES site_generation_jobs(job_id),
  event_type VARCHAR(50) NOT NULL,
  user_email VARCHAR(255),
  plan_level VARCHAR(20),
  site_url TEXT,
  project_type VARCHAR(20),
  template_used VARCHAR(50),
  processing_time INTEGER,
  qa_score INTEGER,
  conversion_value DECIMAL(10,2),
  successful BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Commission tracking
CREATE TABLE commission_tracking (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(16) REFERENCES site_generation_jobs(job_id),
  user_email VARCHAR(255) NOT NULL,
  plan_level VARCHAR(20) NOT NULL,
  conversion_value DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  referral_code VARCHAR(50),
  partner_email VARCHAR(255),
  successful BOOLEAN DEFAULT true,
  paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_site_generation_jobs_status ON site_generation_jobs(status);
CREATE INDEX idx_site_generation_jobs_created_at ON site_generation_jobs(created_at);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_commission_tracking_user_email ON commission_tracking(user_email);
CREATE INDEX idx_commission_tracking_paid ON commission_tracking(paid);
```

## Step 2: Deploy Infrastructure

### 2.1 Start Services

```bash
# Create directories for build artifacts
mkdir -p /tmp/4site-builds /tmp/qa-results

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f n8n
```

### 2.2 Access n8n Interface

1. Open browser to `http://localhost:5678`
2. Login with credentials from `.env` file
3. Verify n8n is connected to database

## Step 3: Configure n8n Credentials

### 3.1 Create API Credentials

In n8n interface, go to **Settings > Credentials** and create:

#### PostgreSQL Database Credential
- **Name**: `postgres-main`
- **Host**: `postgres`
- **Database**: `4site_pro`
- **User**: `n8n_user`
- **Password**: `${POSTGRES_PASSWORD}`
- **Port**: `5432`

#### Redis Credential
- **Name**: `redis-main`
- **Host**: `redis`
- **Port**: `6379`
- **Database**: `0`

#### Google Gemini API Credential
- **Name**: `gemini-api`
- **API Key**: `${GEMINI_API_KEY}`

#### Anthropic Claude API Credential
- **Name**: `anthropic-api`
- **API Key**: `${ANTHROPIC_API_KEY}`

#### GitHub API Credential
- **Name**: `github-api`
- **Access Token**: `${GITHUB_TOKEN}`

#### Vercel API Credential
- **Name**: `vercel-api`
- **Access Token**: `${VERCEL_TOKEN}`

#### Netlify API Credential
- **Name**: `netlify-api`
- **Access Token**: `${NETLIFY_TOKEN}`

#### Porkbun DNS API Credential
- **Name**: `porkbun-api`
- **API Key**: `${PORKBUN_API_KEY}`
- **Secret Key**: `${PORKBUN_SECRET_KEY}`

## Step 4: Import Workflow Files

### 4.1 Import Workflows

For each workflow JSON file in the n8n directory:

1. Go to **Workflows** in n8n interface
2. Click **Import from File**
3. Upload the JSON file
4. Save the workflow
5. Activate the workflow

Import in this order:
1. `master-orchestrator-workflow.json`
2. `github-repository-processor.json`
3. `ai-content-analyzer.json`
4. `site-builder-workflow.json`
5. `deployment-manager.json`
6. `dns-manager.json`
7. `quality-assurance-workflow.json`
8. `analytics-processor.json`

### 4.2 Verify Workflow Connections

After importing, verify that:
- All credentials are properly assigned
- Workflow triggers are configured correctly
- No error indicators are shown

## Step 5: Template Setup

### 5.1 Create Template Directory

```bash
# Create template storage
mkdir -p /var/4site-templates

# Copy template files (you'll need to create these based on your existing templates)
cp -r /path/to/your/templates/* /var/4site-templates/
```

### 5.2 Template Structure

Templates should follow this structure:
```
/var/4site-templates/
├── tech-project-template/
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.css
│   │   └── components/
└── creative-project-template/
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    ├── src/
    │   ├── main.tsx
    │   ├── App.css
    │   └── components/
```

## Step 6: Integration with 4site.pro Frontend

### 6.1 Update Frontend Webhook Configuration

In your 4site.pro React application, update the webhook URL:

```typescript
// In your existing URLInputForm component
const WEBHOOK_URL = 'http://localhost:5678/webhook/generate-site';

const handleSubmit = async (githubUrl: string, userEmail?: string) => {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      githubUrl,
      userEmail: userEmail || 'anonymous@4site.pro',
      planLevel: 'free', // or detect from user account
      webhookUrl: 'https://api.4site.pro/webhooks/status' // for status updates
    })
  });
  
  const result = await response.json();
  console.log('Job started:', result.jobId);
};
```

### 6.2 Real-time Status Updates

Implement WebSocket or polling for status updates:

```typescript
const pollJobStatus = async (jobId: string) => {
  const response = await fetch(`/api/jobs/${jobId}/status`);
  const status = await response.json();
  
  // Update UI based on status
  setJobStatus(status);
  
  if (status.status === 'complete') {
    // Show success with site URL
    setSiteUrl(status.finalSiteData.deployedUrl);
  }
};
```

## Step 7: Testing and Validation

### 7.1 Test Individual Workflows

Test each workflow manually:

1. **Master Orchestrator**: Send POST request to webhook
2. **GitHub Processor**: Verify repository content extraction
3. **AI Analyzer**: Check AI response parsing
4. **Site Builder**: Validate build output
5. **Deployment Manager**: Test deployment creation
6. **DNS Manager**: Verify subdomain creation
7. **Quality Assurance**: Check QA metrics
8. **Analytics**: Validate tracking data

### 7.2 End-to-End Testing

```bash
# Test with a public GitHub repository
curl -X POST http://localhost:5678/webhook/generate-site \
  -H "Content-Type: application/json" \
  -d '{
    "githubUrl": "https://github.com/facebook/react",
    "userEmail": "test@4site.pro",
    "planLevel": "pro"
  }'
```

### 7.3 Monitor Logs

```bash
# Monitor n8n logs
docker-compose logs -f n8n

# Monitor database logs
docker-compose logs -f postgres

# Check workflow execution logs in n8n interface
```

## Step 8: Production Deployment

### 8.1 Security Hardening

For production deployment:

1. **Use HTTPS**: Configure SSL/TLS certificates
2. **Firewall Rules**: Restrict access to necessary ports only
3. **Environment Variables**: Use secure secret management
4. **Database Security**: Enable encryption at rest
5. **Access Control**: Implement proper authentication

### 8.2 Scaling Configuration

```yaml
# Production docker-compose.yml modifications
version: '3.8'

services:
  n8n:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
    environment:
      - N8N_PROTOCOL=https
      - N8N_HOST=n8n.yourdomain.com
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
```

### 8.3 Monitoring Setup

Add monitoring services:

```yaml
  # Prometheus monitoring
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  # Grafana dashboards
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## Troubleshooting

### Common Issues

1. **Workflow Not Triggering**
   - Check webhook URL configuration
   - Verify credentials are properly set
   - Check n8n execution logs

2. **Docker Build Failures**
   - Ensure Docker socket is mounted
   - Check Docker permissions
   - Verify template directory exists

3. **Database Connection Issues**
   - Verify PostgreSQL credentials
   - Check database host connectivity
   - Ensure database exists

4. **API Rate Limits**
   - Monitor API usage in logs
   - Implement exponential backoff
   - Consider API key rotation

### Performance Optimization

1. **Database Optimization**
   - Add indexes for frequent queries
   - Configure connection pooling
   - Regular database maintenance

2. **Cache Configuration**
   - Optimize Redis memory settings
   - Implement content caching
   - Cache AI responses for similar requests

3. **Scaling Strategies**
   - Horizontal scaling of n8n instances
   - Load balancing for high availability
   - Queue management optimization

## Maintenance

### Regular Tasks

1. **Database Cleanup**
   ```sql
   -- Archive completed jobs older than 30 days
   UPDATE site_generation_jobs 
   SET archived = true 
   WHERE completed_at < NOW() - INTERVAL '30 days';
   ```

2. **Log Rotation**
   ```bash
   # Rotate Docker logs
   docker system prune -f
   
   # Clean build artifacts
   find /tmp/4site-builds -type d -mtime +7 -exec rm -rf {} +
   ```

3. **Security Updates**
   ```bash
   # Update Docker images
   docker-compose pull
   docker-compose up -d
   ```

This comprehensive deployment guide provides everything needed to deploy and maintain the 4site.pro n8n workflow automation system in both development and production environments.