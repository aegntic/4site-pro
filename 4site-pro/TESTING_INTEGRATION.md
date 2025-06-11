# 🧪 Testing & Integration Guide

## Unit Testing Strategy

### 1. GitHub App Service Tests

```typescript
// services/github-app-service/src/__tests__/github.test.ts
import { describe, it, expect, beforeAll } from 'bun:test';
import { analyzeRepository } from '../services/githubService';

describe('GitHub Repository Analysis', () => {
  it('should fetch README content successfully', async () => {
    const result = await analyzeRepository('https://github.com/facebook/react');
    expect(result).toHaveProperty('readme');
    expect(result.readme).toContain('React');
  });

  it('should handle missing README gracefully', async () => {
    const result = await analyzeRepository('https://github.com/invalid/repo');
    expect(result).toHaveProperty('error');
  });
});
```

### 2. AI Analysis Pipeline Tests

```rust
// services/ai-analysis-pipeline/src/tests/analysis_tests.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_markdown_parsing() {
        let markdown = "# Title\n## Section\nContent";
        let sections = parse_markdown_to_sections(markdown);
        assert_eq!(sections.len(), 2);
        assert_eq!(sections[0].title, "Title");
    }

    #[tokio::test]
    async fn test_partner_recommendation() {
        let tech_stack = vec!["React", "Node.js", "PostgreSQL"];
        let recommendations = recommend_partners(&tech_stack);
        assert!(recommendations.contains(&"Vercel"));
        assert!(recommendations.contains(&"Supabase"));
    }
}
```

### 3. Commission Service Tests

```typescript
// services/commission-service/src/__tests__/commission.test.ts
import { describe, it, expect } from 'bun:test';
import { calculateCommission } from '../services/commissionEngine';

describe('Commission Calculation', () => {
  it('should calculate percentage-based commission correctly', () => {
    const commission = calculateCommission({
      amount: 100,
      rate: 0.15,
      type: 'percentage'
    });
    expect(commission).toBe(15);
  });

  it('should apply attribution window correctly', () => {
    const isValid = checkAttributionWindow({
      clickTime: new Date('2024-01-01'),
      conversionTime: new Date('2024-01-15'),
      windowDays: 30
    });
    expect(isValid).toBe(true);
  });
});
```

## Integration Testing

### End-to-End Test Scenario

```bash
#!/bin/bash
# integration-test.sh

echo "🧪 Running Project4Site Integration Tests"

# 1. Test API Gateway Health
echo "Testing API Gateway..."
HEALTH_CHECK=$(curl -s http://localhost:4000/health)
if [[ $HEALTH_CHECK == *"ok"* ]]; then
  echo "✅ API Gateway is healthy"
else
  echo "❌ API Gateway health check failed"
  exit 1
fi

# 2. Submit Repository for Analysis
echo "Submitting repository for analysis..."
RESPONSE=$(curl -s -X POST http://localhost:4000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/vercel/next.js"}')

SITE_ID=$(echo $RESPONSE | jq -r '.siteId')
echo "✅ Analysis started. Site ID: $SITE_ID"

# 3. Poll for Analysis Completion
echo "Waiting for analysis to complete..."
for i in {1..30}; do
  STATUS=$(curl -s http://localhost:4000/api/sites/$SITE_ID/status | jq -r '.status')
  if [[ $STATUS == "GENERATION_COMPLETE" ]]; then
    echo "✅ Analysis and generation complete!"
    break
  fi
  echo "Status: $STATUS (attempt $i/30)"
  sleep 2
done

# 4. Test Site Preview
echo "Testing site preview..."
PREVIEW=$(curl -s http://localhost:3000/preview/$SITE_ID)
if [[ $PREVIEW == *"<html"* ]]; then
  echo "✅ Site preview is accessible"
else
  echo "❌ Site preview failed"
  exit 1
fi

# 5. Test Commission Tracking
echo "Testing commission tracking..."
REFERRAL=$(curl -s -X POST http://localhost:3004/api/referrals \
  -H "Content-Type: application/json" \
  -d "{\"siteId\": \"$SITE_ID\", \"partnerId\": \"vercel\"}")

if [[ $REFERRAL == *"referralCode"* ]]; then
  echo "✅ Commission tracking is working"
else
  echo "❌ Commission tracking failed"
  exit 1
fi

echo "🎉 All integration tests passed!"
```

### Running Integration Tests

```bash
# Make script executable
chmod +x integration-test.sh

# Run integration tests
./integration-test.sh
```

## API Documentation

### OpenAPI/Swagger Generation

The API Gateway automatically generates OpenAPI documentation using Fastify plugins:

```typescript
// services/api-gateway/src/index.ts
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

// Register Swagger
await app.register(swagger, {
  openapi: {
    info: {
      title: 'Project4Site API',
      description: 'AI-powered presentation intelligence platform',
      version: '1.0.0'
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Development' },
      { url: 'https://api.project4site.com', description: 'Production' }
    ],
    tags: [
      { name: 'sites', description: 'Site generation endpoints' },
      { name: 'auth', description: 'Authentication endpoints' },
      { name: 'subscriptions', description: 'Subscription management' }
    ]
  }
});

// Register Swagger UI
await app.register(swaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true
  }
});
```

Access API documentation at: http://localhost:4000/docs

## Performance Testing

### Load Testing with k6

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // 10 virtual users
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'], // Error rate under 10%
  },
};

export default function () {
  // Test site analysis endpoint
  const payload = JSON.stringify({
    repoUrl: 'https://github.com/facebook/react',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post('http://localhost:4000/api/analyze', payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has siteId': (r) => JSON.parse(r.body).siteId !== undefined,
  });

  sleep(1);
}
```

Run load test:
```bash
k6 run load-test.js
```

## Monitoring & Observability

### Prometheus Metrics

All services expose metrics at `/metrics` endpoint:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:4000']
  
  - job_name: 'site-generation'
    static_configs:
      - targets: ['site-generation-engine:3000']
  
  - job_name: 'commission-service'
    static_configs:
      - targets: ['commission-service:3004']
```

### Grafana Dashboards

Import the provided dashboards:
1. `Service Health Dashboard` - Overall system health
2. `API Performance Dashboard` - Request rates and latencies
3. `Business Metrics Dashboard` - Sites generated, commissions tracked

### Distributed Tracing

All services include OpenTelemetry instrumentation:

```typescript
// Automatic tracing for all HTTP requests
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('project4site');

// Example span
const span = tracer.startSpan('analyze-repository');
try {
  // ... operation code
} finally {
  span.end();
}
```

## Security Testing

### OWASP ZAP Security Scan

```bash
# Run automated security scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:4000 \
  -r security-report.html
```

### Dependency Vulnerability Scanning

```bash
# TypeScript projects
npm audit

# Rust projects
cargo audit

# Python projects
pip-audit
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          
      - name: Run Tests
        run: |
          docker-compose -f docker-compose.test.yml up --abort-on-container-exit
          
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
```

## Deployment Checklist

### Pre-Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Backup strategy implemented
- [ ] Monitoring dashboards configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Error tracking (Sentry) enabled
- [ ] Performance baselines established
- [ ] Documentation updated

### Production Deployment

```bash
# 1. Build production images
docker-compose -f docker-compose.prod.yml build

# 2. Push to registry
docker-compose -f docker-compose.prod.yml push

# 3. Deploy to production cluster
kubectl apply -f k8s/

# 4. Run smoke tests
./scripts/smoke-test-prod.sh
```

---

This completes the comprehensive testing and integration documentation for Project4Site.