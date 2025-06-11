# Project4Site Quick Reference

## 🚀 Quick Start Commands

```bash
# Complete setup (first time)
./setup-dev.sh --full

# Start development environment
npm run docker:up
npm run dev

# Check service health
npm run health

# View logs
npm run docker:logs
```

## 📋 Essential Commands

### Development
```bash
npm run dev                    # Start all development servers
npm run dev:api-gateway        # Start API Gateway only
npm run dev:site-generator     # Start Site Generator only
npm run build                  # Build all services
npm run test                   # Run all tests
npm run lint                   # Lint all code
```

### Docker Management
```bash
npm run docker:up             # Start all containers
npm run docker:down           # Stop all containers
npm run docker:logs           # View all logs
npm run docker:build          # Build all images
npm run docker:clean          # Clean up containers and volumes
```

### Database Operations
```bash
npm run db:console             # Access PostgreSQL CLI
npm run db:backup              # Create database backup
npm run db:reset               # Reset database with fresh data
npm run redis:cli              # Access Redis CLI
```

### Monitoring & Tools
```bash
npm run monitoring:up          # Start Prometheus & Grafana
npm run dev-tools:up           # Start pgAdmin & Redis Commander
npm run health                 # Check all service health
npm run metrics                # Get Prometheus metrics
```

## 🌐 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| API Gateway | http://localhost:3000 | Main API endpoint |
| Site Generator | http://localhost:3001 | Site generation service |
| GitHub App | http://localhost:3010 | GitHub webhook handler |
| AI Pipeline | http://localhost:8000 | AI analysis service |
| Commission Service | http://localhost:3002 | Partner tracking |
| Deployment Service | http://localhost:3003 | Site deployment |
| Video Service | http://localhost:3004 | Video generation |

## 🛠️ Development Tools

| Tool | URL | Credentials |
|------|-----|-------------|
| pgAdmin | http://localhost:5050 | admin@project4site.dev / admin123 |
| Redis Commander | http://localhost:8081 | Auto-connect |
| MailHog | http://localhost:8025 | No auth required |
| Prometheus | http://localhost:9090 | No auth required |
| Grafana | http://localhost:3030 | admin / admin123 |
| Jaeger | http://localhost:16686 | No auth required |

## 🔧 Environment Variables

### Required for Development
```bash
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_APP_ID=your_github_app_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
```

### Auto-Generated (Don't Modify)
```bash
DATABASE_PASSWORD=auto_generated_secure_password
REDIS_PASSWORD=auto_generated_secure_password
JWT_SECRET=auto_generated_32_byte_key
INTERNAL_API_SECRET=auto_generated_api_secret
```

## 🏗️ Architecture Overview

```
Frontend (Next.js) → API Gateway → Microservices
                                     ├── GitHub App Service
                                     ├── AI Analysis Pipeline (Rust)
                                     ├── Site Generation Engine
                                     ├── Commission Service
                                     ├── Deployment Service
                                     └── Video Service (Python)
                         ↓
Database Layer: PostgreSQL + Redis + Neo4j
```

## 🐛 Common Issues & Solutions

### Service Won't Start
```bash
# Check Docker daemon
docker info

# Check port conflicts
netstat -tulpn | grep :3000

# Restart with fresh state
npm run docker:clean && npm run docker:up
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
docker-compose exec postgres pg_isready -U project4site

# Reset database
npm run db:reset
```

### AI Pipeline Performance
```bash
# Check memory usage
docker stats ai-pipeline

# View AI service logs
docker-compose logs -f ai-pipeline
```

## 📊 Performance Targets

| Metric | Target | Service |
|--------|--------|---------|
| Site Generation | <30s end-to-end | Full pipeline |
| AI Analysis | <5s per repository | AI Pipeline |
| API Response | <100ms p95 | API Gateway |
| Database Query | <50ms average | PostgreSQL |

## 🔐 Security Checklist

- [ ] API keys configured in `.env`
- [ ] GitHub App private key in place
- [ ] Strong passwords auto-generated
- [ ] Internal API secrets configured
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured

## 📈 Monitoring Metrics

### Key Performance Indicators
```bash
# API Gateway metrics
curl http://localhost:3000/metrics

# Database performance
npm run db:console
SELECT * FROM pg_stat_activity;

# Redis performance
npm run redis:cli
INFO stats
```

### Health Checks
```bash
# All services
npm run health

# Individual service
curl http://localhost:3000/health
curl http://localhost:8000/health
```

## 🚀 Deployment Process

### Development
```bash
npm run setup                 # Initial setup
npm run dev                   # Start development
npm run test                  # Run tests
npm run lint                  # Check code quality
```

### Staging
```bash
npm run ci:test               # Full CI pipeline
npm run ci:build              # Build for production
npm run docker:up             # Deploy to staging
```

### Production
```bash
npm run ci:deploy             # Deploy to production
npm run monitoring:up         # Enable monitoring
npm run backup:create         # Create backup
```

## 📚 Documentation Links

- [Infrastructure Setup](./INFRASTRUCTURE.md)
- [Technical Architecture](./devdrmd/TECHNICAL_ARCHITECTURE.md)
- [API Documentation](http://localhost:3000/docs)
- [Database Schema](./database/schema.sql)

## 🆘 Emergency Procedures

### Service Recovery
```bash
# Restart all services
npm run docker:down && npm run docker:up

# Restore from backup
npm run backup:restore

# Emergency database reset
npm run db:reset
```

### Performance Issues
```bash
# Check resource usage
docker stats

# Monitor slow queries
npm run db:console
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;

# Clear Redis cache
npm run redis:flush
```

### Data Recovery
```bash
# Create emergency backup
npm run backup:create

# Access database directly
npm run db:console

# Check data integrity
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM generated_sites;
```

## 📞 Support Contacts

- **Technical Issues**: Check logs with `npm run docker:logs`
- **Database Problems**: Use `npm run db:console` for direct access
- **Performance Issues**: Monitor with `npm run metrics`
- **Infrastructure Issues**: Review `INFRASTRUCTURE.md`

---

*This quick reference covers the most common development tasks and troubleshooting scenarios for Project4Site.*