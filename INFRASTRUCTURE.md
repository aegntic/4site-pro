# Project4Site Infrastructure Setup Guide

## Overview

This document provides comprehensive guidance for setting up the Project4Site development and production infrastructure. The platform uses a microservices architecture with Docker containerization, designed for scalability and development efficiency.

## Quick Start

```bash
# Clone the repository and navigate to project directory
cd /home/tabs/ae-co-system/project4site

# Run automated setup (full development environment)
./setup-dev.sh --full

# Or for minimal setup (core services only)
./setup-dev.sh --minimal

# Or for infrastructure services only (databases, redis)
./setup-dev.sh --services-only
```

## Environment Configuration

### 1. Environment Variables Setup

Copy the environment template and configure your settings:

```bash
cp .env.template .env
```

**Critical Variables to Configure:**

```bash
# AI Services (Required)
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here  # Fallback
OPENAI_API_KEY=sk-your_openai_key_here            # Alternative

# GitHub Integration (Required for full functionality)
GITHUB_APP_ID=your_github_app_id_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here

# Deployment Services (Optional for development)
VERCEL_TOKEN=your_vercel_token_here
RAILWAY_TOKEN=your_railway_token_here
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here

# Partner Integrations (Optional)
FIGMA_CLIENT_ID=your_figma_client_id_here
SUPABASE_PARTNER_API_KEY=your_supabase_partner_key_here
LINEAR_API_KEY=your_linear_api_key_here
```

**Auto-Generated Secure Variables:**
The setup script automatically generates secure passwords for:
- Database passwords
- Redis authentication
- JWT secrets
- Internal API communication tokens

### 2. GitHub App Configuration

Create a GitHub App for repository integration:

1. Navigate to GitHub Settings → Developer settings → GitHub Apps
2. Click "New GitHub App"
3. Configure the app with these settings:

```yaml
GitHub App Settings:
  Name: "Project4Site [Your Environment]"
  Homepage URL: "https://your-domain.com"
  Webhook URL: "https://your-domain.com/api/webhooks/github"
  Webhook Secret: [Use value from .env file]
  
Permissions:
  Repository permissions:
    - Contents: Read
    - Metadata: Read
    - Pull requests: Read
  
  Subscribe to events:
    - Push
    - Pull request
    - Repository
```

4. Generate and download the private key
5. Replace `github-app.private-key.pem` with your downloaded key
6. Update environment variables with your App ID and secrets

## Docker Infrastructure

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  GitHub App     │    │  AI Pipeline    │
│   Port: 3000    │    │  Port: 3010     │    │  Port: 8000     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Site Generator  │    │ Commission Svc  │    │ Deployment Svc  │
│   Port: 3001    │    │  Port: 3002     │    │  Port: 3003     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │      Redis      │    │     Neo4j       │
│   Port: 5432    │    │   Port: 6379    │    │   Port: 7687    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Service Profiles

**Default Profile (Core Services):**
- API Gateway
- GitHub App Service
- AI Analysis Pipeline
- Site Generation Engine
- Commission Service
- Deployment Service
- Video Service (optional)
- PostgreSQL
- Redis
- Neo4j

**Development Tools Profile (`--profile dev-tools`):**
- pgAdmin (Database management)
- Redis Commander (Redis management)
- MailHog (Email testing)

**Monitoring Profile (`--profile monitoring`):**
- Prometheus (Metrics collection)
- Grafana (Visualization)
- Jaeger (Distributed tracing)

### Service Configuration

#### Core Application Services

**API Gateway** (TypeScript/Bun)
```yaml
Responsibilities:
  - Request routing and load balancing
  - Authentication and authorization
  - Rate limiting and DDoS protection
  - API versioning and documentation

Health Check: http://localhost:3000/health
Metrics: http://localhost:3000/metrics
Debug Port: 9229
```

**GitHub App Service** (TypeScript/Bun)
```yaml
Responsibilities:
  - GitHub webhook processing
  - Repository file parsing
  - Git operations and branch management
  - Security validation

Health Check: http://localhost:3010/health
Webhook Endpoint: http://localhost:3010/webhooks/github
```

**AI Analysis Pipeline** (Rust)
```yaml
Responsibilities:
  - High-performance content analysis
  - Project categorization and tagging
  - Template recommendation engine
  - Local AI model processing

Health Check: http://localhost:8000/health
Processing Endpoint: http://localhost:8000/analyze
Model Cache: ./models/cache
```

**Site Generation Engine** (TypeScript/Next.js)
```yaml
Responsibilities:
  - Dynamic site template selection
  - Component-based page generation
  - SEO optimization and meta tags
  - Mobile-responsive design generation

Health Check: http://localhost:3001/health
Generation Endpoint: http://localhost:3001/api/generate
Static Assets: ./uploads
```

#### Database Services

**PostgreSQL Configuration**
```yaml
Database: project4site_dev
User: project4site
Password: [Auto-generated in .env]
Extensions: uuid-ossp, pgcrypto, pg_trgm, btree_gin

Performance Settings:
  max_connections: 200
  shared_buffers: 256MB
  effective_cache_size: 1GB
  work_mem: 4MB

Backup Location: ./backups/postgresql
```

**Redis Configuration**
```yaml
Database: 16 databases (0-15)
Password: [Auto-generated in .env]
Max Memory: 512MB
Persistence: AOF + RDB snapshots

Cache Patterns:
  - session:{user_id} (TTL: 24h)
  - analysis:{repo_hash} (TTL: 1h)
  - preview:{site_id} (TTL: 30m)
  - partner:{api_call_hash} (TTL: 5m)
```

**Neo4j Configuration**
```yaml
Database: neo4j
User: neo4j
Password: [Auto-generated in .env]
Plugins: APOC, Graph Data Science

Memory Settings:
  heap_initial_size: 512m
  heap_max_size: 1G
  pagecache_size: 512m
```

## Development Workflow

### 1. Initial Setup

```bash
# Run full setup with all tools
./setup-dev.sh --full

# Verify all services are running
docker-compose ps

# Check service health
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Site Generator
curl http://localhost:8000/health  # AI Pipeline
```

### 2. Service Management

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api-gateway
docker-compose logs -f ai-pipeline

# Restart individual services
docker-compose restart api-gateway
docker-compose restart postgres

# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### 3. Database Management

```bash
# Access PostgreSQL directly
docker-compose exec postgres psql -U project4site -d project4site_dev

# Access Redis CLI
docker-compose exec redis redis-cli

# Access Neo4j Cypher Shell
docker-compose exec neo4j cypher-shell -u neo4j -p [password]

# pgAdmin Web Interface
open http://localhost:5050
# Login: admin@project4site.dev / admin123
```

### 4. Development Tools

**pgAdmin (Database Management)**
```
URL: http://localhost:5050
Email: admin@project4site.dev
Password: admin123

Pre-configured Server:
  Name: Project4Site Development
  Host: postgres
  Port: 5432
  Database: project4site_dev
  Username: project4site
```

**Redis Commander**
```
URL: http://localhost:8081
Auto-connects to Redis instance
```

**MailHog (Email Testing)**
```
SMTP: localhost:1025
Web UI: http://localhost:8025
```

### 5. Application Development

**Frontend Development (Site Generator)**
```bash
# Hot reload development
cd services/site-generation-engine
bun run dev

# Access at http://localhost:3001
```

**API Development**
```bash
# Start API Gateway in development mode
cd services/api-gateway
bun run dev

# Debug mode with inspector
bun run dev:debug
```

**AI Pipeline Development**
```bash
# Rust development with hot reload
cd services/ai-analysis-pipeline
cargo watch -x run

# Run tests
cargo test

# Build release version
cargo build --release
```

## Monitoring and Observability

### 1. Prometheus Metrics

```bash
# Start monitoring stack
docker-compose --profile monitoring up -d

# Access Prometheus
open http://localhost:9090
```

**Key Metrics Tracked:**
- HTTP request rates and latencies
- Database connection pool usage
- Redis hit/miss ratios
- AI processing times
- Queue depths and processing rates
- Memory and CPU usage per service

### 2. Grafana Dashboards

```bash
# Access Grafana
open http://localhost:3030
# Login: admin / admin123
```

**Pre-configured Dashboards:**
- Application Performance Overview
- Database Performance
- Redis Performance
- AI Processing Metrics
- Business Metrics (User Activity, Conversions)

### 3. Distributed Tracing

```bash
# Access Jaeger UI
open http://localhost:16686
```

**Traced Operations:**
- Complete site generation flow
- AI analysis pipeline
- Partner API integrations
- Database queries and transactions

## Performance Optimization

### 1. Development Performance

**Resource Allocation:**
```yaml
Minimum System Requirements:
  RAM: 8GB (16GB recommended)
  CPU: 4 cores (8 cores recommended)
  Disk: 20GB free space
  Docker: 4GB memory limit (8GB recommended)

Service Resource Limits:
  AI Pipeline: 4GB RAM, 2 CPU cores
  Video Service: 8GB RAM, 4 CPU cores
  Site Generator: 2GB RAM, 1 CPU core
  Databases: 2GB RAM total
```

**Performance Tuning:**
```bash
# Optimize Docker for development
echo '{"experimental": true, "features": {"buildkit": true}}' > ~/.docker/daemon.json

# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Use multi-stage builds for faster iteration
docker-compose build --parallel
```

### 2. Database Performance

**PostgreSQL Optimization:**
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Monitor connection usage
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';

-- Index usage analysis
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

**Redis Optimization:**
```bash
# Monitor Redis performance
docker-compose exec redis redis-cli info stats

# Check slow queries
docker-compose exec redis redis-cli slowlog get 10

# Monitor memory usage
docker-compose exec redis redis-cli info memory
```

## Production Deployment

### 1. Environment Preparation

**Production Environment Variables:**
```bash
# Security settings
NODE_ENV=production
SECURE_COOKIES=true
HTTPS_ONLY=true
CSRF_PROTECTION=true

# Performance settings
COMPRESSION_ENABLED=true
CACHE_TTL_LONG=86400
STATIC_CACHE_MAX_AGE=31536000

# Monitoring
APM_ENABLED=true
METRICS_COLLECTION=true
ERROR_REPORTING=true
```

### 2. Docker Production Configuration

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  api-gateway:
    build:
      target: production
    restart: always
    environment:
      NODE_ENV: production
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### 3. Infrastructure Scaling

**Horizontal Scaling:**
```bash
# Scale specific services
docker-compose up -d --scale api-gateway=3
docker-compose up -d --scale site-generator=2

# Auto-scaling with Docker Swarm
docker stack deploy -c docker-compose.prod.yml project4site
```

**Database Scaling:**
```bash
# PostgreSQL read replicas
# Redis clustering
# Neo4j cluster setup
```

## Security Configuration

### 1. Network Security

```yaml
Network Isolation:
  - Internal service communication on private network (172.20.0.0/16)
  - External access only through API Gateway
  - Database services not exposed to external network

Port Exposure:
  Development: All service ports exposed for debugging
  Production: Only API Gateway port exposed (80/443)
```

### 2. Authentication & Authorization

```yaml
JWT Configuration:
  Algorithm: HS256
  Expiration: 7 days
  Refresh Token: 30 days
  Secret: Auto-generated 32-byte key

API Key Management:
  Format: prefix_32_char_random_string
  Scopes: Granular permission system
  Rate Limiting: Per-key limits
  Rotation: Automated monthly rotation
```

### 3. Data Protection

```yaml
Encryption:
  At Rest: AES-256 for sensitive data
  In Transit: TLS 1.3 for all communications
  Database: Transparent Data Encryption (TDE)

Backup Strategy:
  Frequency: Daily automated backups
  Retention: 30 days local, 1 year offsite
  Testing: Monthly restore verification
  Encryption: All backups encrypted
```

## Troubleshooting

### 1. Common Issues

**Service Won't Start:**
```bash
# Check Docker daemon
docker info

# Check port conflicts
netstat -tulpn | grep :3000

# Check logs for errors
docker-compose logs service-name

# Restart with fresh state
docker-compose down -v && docker-compose up -d
```

**Database Connection Issues:**
```bash
# Test PostgreSQL connection
docker-compose exec postgres pg_isready -U project4site

# Check PostgreSQL logs
docker-compose logs postgres

# Verify environment variables
docker-compose exec api-gateway env | grep DATABASE_URL
```

**AI Pipeline Performance:**
```bash
# Check GPU availability (if using)
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi

# Monitor memory usage
docker stats ai-pipeline

# Check model loading
docker-compose exec ai-pipeline ls -la /models/
```

### 2. Performance Issues

**High Memory Usage:**
```bash
# Check container memory usage
docker stats

# Analyze PostgreSQL memory
docker-compose exec postgres psql -U project4site -c "
  SELECT setting, unit FROM pg_settings 
  WHERE name IN ('shared_buffers', 'work_mem', 'maintenance_work_mem');
"

# Monitor Redis memory
docker-compose exec redis redis-cli info memory
```

**Slow Response Times:**
```bash
# Check API Gateway metrics
curl http://localhost:3000/metrics

# Monitor database slow queries
docker-compose exec postgres psql -U project4site -c "
  SELECT query, mean_time, calls 
  FROM pg_stat_statements 
  ORDER BY mean_time DESC LIMIT 5;
"

# Redis latency monitoring
docker-compose exec redis redis-cli --latency-history
```

### 3. Data Recovery

**Database Recovery:**
```bash
# Restore from backup
docker-compose exec postgres pg_restore -U project4site -d project4site_dev /backups/latest.dump

# Point-in-time recovery
docker-compose exec postgres pg_basebackup -U project4site -D /recovery -W

# Verify data integrity
docker-compose exec postgres psql -U project4site -c "SELECT COUNT(*) FROM users;"
```

## Maintenance

### 1. Regular Maintenance Tasks

**Daily:**
- Monitor service health checks
- Review error logs
- Check disk space usage
- Verify backup completion

**Weekly:**
- Update Docker images
- Analyze performance metrics
- Review security logs
- Clean up unused Docker resources

**Monthly:**
- Rotate API keys and secrets
- Update dependencies
- Perform database maintenance
- Review and update monitoring alerts

### 2. Updates and Migrations

**Service Updates:**
```bash
# Pull latest images
docker-compose pull

# Update specific service
docker-compose up -d --no-deps service-name

# Rollback if needed
docker-compose down service-name
docker tag service-name:previous service-name:latest
docker-compose up -d service-name
```

**Database Migrations:**
```bash
# Run new migrations
docker-compose exec postgres psql -U project4site -d project4site_dev -f /migrations/new_migration.sql

# Backup before major migrations
docker-compose exec postgres pg_dump -U project4site project4site_dev > backup_pre_migration.sql
```

This infrastructure setup provides a robust, scalable foundation for Project4Site development and production deployment, following best practices for microservices architecture, security, and operational excellence.