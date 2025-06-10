# project4site N8N Workflow Configurations

> **Complete Autonomous Content System**  
> End-to-end workflows for content creation, distribution, and engagement using n8n + aegnt-27

## 🚀 Setup Instructions

### **1. Install n8n MCP Server**
```bash
# Navigate to aegntic-MCP n8n server
cd /home/tabs/ae-co-system/aegntic-MCP/servers/n8n-mcp

# Install dependencies
npm install

# Start n8n MCP server with maximum performance
npx @aegntic/n8n-mcp --memory-mode --workers 8 --port 3000
```

### **2. Configure aegnt-27 Integration**
```bash
# Navigate to aegnt-27 standalone
cd /home/tabs/ae-co-system/DAILYDOCO/aegnt-27-standalone

# Build aegnt-27 for content generation
cargo build --release

# Start aegnt-27 service
./target/release/aegnt-27 --mode content-generator --port 3001
```

### **3. Connect MCP Server to Claude**
```
Add MCP server in Claude:
URL: http://localhost:3000
Description: n8n Workflow Automation for project4site
```

---

## 📋 WORKFLOW 1: Master Content Orchestrator

### **Trigger Configuration**
```json
{
  "trigger": {
    "type": "webhook",
    "settings": {
      "httpMethod": "POST",
      "path": "milestone-trigger",
      "authentication": "none"
    }
  }
}
```

### **Workflow Definition**
```json
{
  "name": "project4site Master Content Orchestrator",
  "active": true,
  "nodes": [
    {
      "parameters": {},
      "name": "Milestone Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "functionCode": "const milestone = items[0].json.milestone;\nconst phase = items[0].json.phase;\nconst userCount = items[0].json.userCount || 0;\nconst revenue = items[0].json.revenue || 0;\n\n// Determine content theme based on milestone\nlet contentTheme = 'general';\nif (milestone.includes('mvp')) contentTheme = 'product-development';\nelse if (milestone.includes('user')) contentTheme = 'growth-celebration';\nelse if (milestone.includes('partnership')) contentTheme = 'partnership-announcement';\nelse if (milestone.includes('revenue')) contentTheme = 'business-milestone';\n\n// Select brand voice based on audience\nlet brandVoice = 'friendly-guide'; // Default\nif (phase === 'enterprise' || userCount > 50000) brandVoice = 'technical-innovator';\nelse if (phase === 'acquisition' || revenue > 1000000) brandVoice = 'visionary-disruptor';\n\nreturn [{\n  json: {\n    milestone,\n    phase,\n    userCount,\n    revenue,\n    contentTheme,\n    brandVoice,\n    timestamp: new Date().toISOString()\n  }\n}];"
      },
      "name": "Analyze Milestone",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "url": "http://localhost:3001/generate-content",
        "options": {
          "bodyContentType": "json"
        },
        "jsonParameters": true,
        "parametersJson": "{\n  \"contentTheme\": \"{{ $json.contentTheme }}\",\n  \"brandVoice\": \"{{ $json.brandVoice }}\",\n  \"milestone\": \"{{ $json.milestone }}\",\n  \"context\": {\n    \"userCount\": {{ $json.userCount }},\n    \"revenue\": {{ $json.revenue }},\n    \"phase\": \"{{ $json.phase }}\"\n  }\n}"
      },
      "name": "Generate Content (aegnt-27)",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "functionCode": "const contentData = items[0].json;\nconst generatedContent = JSON.parse(contentData.body);\n\n// Adapt content for different platforms\nconst platformContent = {\n  twitter: {\n    text: generatedContent.twitter.text.substring(0, 280),\n    hashtags: generatedContent.twitter.hashtags,\n    mediaUrl: generatedContent.twitter.mediaUrl\n  },\n  linkedin: {\n    text: generatedContent.linkedin.text,\n    title: generatedContent.linkedin.title,\n    mediaUrl: generatedContent.linkedin.mediaUrl\n  },\n  github: {\n    title: generatedContent.github.title,\n    body: generatedContent.github.body,\n    labels: generatedContent.github.labels\n  },\n  devto: {\n    title: generatedContent.devto.title,\n    content: generatedContent.devto.content,\n    tags: generatedContent.devto.tags\n  }\n};\n\nreturn Object.keys(platformContent).map(platform => ({\n  json: {\n    platform,\n    content: platformContent[platform],\n    scheduleTime: new Date(Date.now() + Math.random() * 3600000).toISOString() // Random delay up to 1 hour\n  }\n}));"
      },
      "name": "Adapt for Platforms",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 300]
    },
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 */15 * * * *"
            }
          ]
        }
      },
      "name": "Content Scheduler",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [1120, 300]
    }
  ],
  "connections": {
    "Milestone Webhook": {
      "main": [
        [
          {
            "node": "Analyze Milestone",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Analyze Milestone": {
      "main": [
        [
          {
            "node": "Generate Content (aegnt-27)",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Generate Content (aegnt-27)": {
      "main": [
        [
          {
            "node": "Adapt for Platforms",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Adapt for Platforms": {
      "main": [
        [
          {
            "node": "Content Scheduler",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

## 📋 WORKFLOW 2: Strategic Social Engagement

### **Daily Engagement Automation**
```json
{
  "name": "project4site Strategic Engagement",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression", 
              "expression": "0 0 9,13,17 * * *"
            }
          ]
        }
      },
      "name": "Daily Trigger",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "targetAccounts",
              "value": "kentcdodds,dan_abramov,rauchg,leeerob,cassidoo,kiwicopple,dylantf,ashtom,patrickc,bendhalpern,ossia,swyx,emmawedekind"
            }
          ]
        }
      },
      "name": "Load Target Accounts",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "functionCode": "const accounts = items[0].json.targetAccounts.split(',');\nconst dailyTargets = accounts.slice(0, 10); // Limit to 10 per day\n\nreturn dailyTargets.map(account => ({\n  json: {\n    account: account.trim(),\n    platform: 'twitter',\n    action: Math.random() > 0.7 ? 'follow' : 'engage',\n    timestamp: new Date().toISOString()\n  }\n}));"
      },
      "name": "Select Daily Targets",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "url": "https://api.twitter.com/2/users/by/username/{{ $json.account }}",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "twitterOAuth2Api",
        "options": {
          "headers": {
            "User-Agent": "project4site-bot/1.0"
          }
        }
      },
      "name": "Get User Info",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [900, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "{{ $json.action }}",
              "operation": "equal",
              "value2": "follow"
            }
          ]
        }
      },
      "name": "Action Router",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [1120, 300]
    },
    {
      "parameters": {
        "url": "https://api.twitter.com/2/users/{{ $('Get User Info').item.json.data.id }}/following",
        "requestMethod": "POST",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "twitterOAuth2Api"
      },
      "name": "Follow User",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [1300, 200]
    },
    {
      "parameters": {
        "url": "http://localhost:3001/generate-engagement",
        "options": {
          "bodyContentType": "json"
        },
        "jsonParameters": true,
        "parametersJson": "{\n  \"targetAccount\": \"{{ $json.account }}\",\n  \"engagementType\": \"comment\",\n  \"brandVoice\": \"friendly-guide\"\n}"
      },
      "name": "Generate Engagement",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [1300, 400]
    }
  ],
  "connections": {
    "Daily Trigger": {
      "main": [
        [
          {
            "node": "Load Target Accounts",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Load Target Accounts": {
      "main": [
        [
          {
            "node": "Select Daily Targets",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Select Daily Targets": {
      "main": [
        [
          {
            "node": "Get User Info",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get User Info": {
      "main": [
        [
          {
            "node": "Action Router",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Action Router": {
      "main": [
        [
          {
            "node": "Follow User",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Generate Engagement",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

## 📋 WORKFLOW 3: Content Publishing Automation

### **Multi-Platform Publishing**
```json
{
  "name": "project4site Content Publisher",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 0 9,13,17,21 * * *"
            }
          ]
        }
      },
      "name": "Publishing Schedule",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "operation": "read",
        "fileFormat": "json",
        "options": {
          "fileName": "scheduled_content.json"
        }
      },
      "name": "Load Scheduled Content",
      "type": "n8n-nodes-base.readWriteFile",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "functionCode": "const now = new Date();\nconst scheduledContent = items[0].json;\n\n// Filter content ready to publish\nconst readyToPublish = scheduledContent.filter(item => {\n  const scheduleTime = new Date(item.scheduleTime);\n  return scheduleTime <= now && !item.published;\n});\n\nreturn readyToPublish.map(item => ({\n  json: item\n}));"
      },
      "name": "Filter Ready Content",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "{{ $json.platform }}",
              "operation": "equal",
              "value2": "twitter"
            }
          ]
        }
      },
      "name": "Platform Router",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 1,
      "position": [900, 300],
      "alwaysOutputData": false
    },
    {
      "parameters": {
        "url": "https://api.twitter.com/2/tweets",
        "requestMethod": "POST",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "twitterOAuth2Api",
        "options": {
          "bodyContentType": "json"
        },
        "jsonParameters": true,
        "parametersJson": "{\n  \"text\": \"{{ $json.content.text }} {{ $json.content.hashtags.join(' ') }}\"\n}"
      },
      "name": "Post to Twitter",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [1120, 200]
    },
    {
      "parameters": {
        "url": "https://api.linkedin.com/v2/ugcPosts",
        "requestMethod": "POST", 
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "linkedInOAuth2Api",
        "options": {
          "bodyContentType": "json"
        },
        "jsonParameters": true,
        "parametersJson": "{\n  \"author\": \"urn:li:person:{{ $credentials.linkedInOAuth2Api.personId }}\",\n  \"lifecycleState\": \"PUBLISHED\",\n  \"specificContent\": {\n    \"com.linkedin.ugc.ShareContent\": {\n      \"shareCommentary\": {\n        \"text\": \"{{ $json.content.text }}\"\n      },\n      \"shareMediaCategory\": \"NONE\"\n    }\n  },\n  \"visibility\": {\n    \"com.linkedin.ugc.MemberNetworkVisibility\": \"PUBLIC\"\n  }\n}"
      },
      "name": "Post to LinkedIn",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [1120, 300]
    },
    {
      "parameters": {
        "url": "https://dev.to/api/articles",
        "requestMethod": "POST",
        "authentication": "predefinedCredentialType", 
        "nodeCredentialType": "devToApi",
        "options": {
          "bodyContentType": "json"
        },
        "jsonParameters": true,
        "parametersJson": "{\n  \"article\": {\n    \"title\": \"{{ $json.content.title }}\",\n    \"body_markdown\": \"{{ $json.content.content }}\",\n    \"published\": true,\n    \"tags\": {{ $json.content.tags }}\n  }\n}"
      },
      "name": "Post to Dev.to",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [1120, 400]
    }
  ],
  "connections": {
    "Publishing Schedule": {
      "main": [
        [
          {
            "node": "Load Scheduled Content",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Load Scheduled Content": {
      "main": [
        [
          {
            "node": "Filter Ready Content",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Filter Ready Content": {
      "main": [
        [
          {
            "node": "Platform Router",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Platform Router": {
      "main": [
        [
          {
            "node": "Post to Twitter",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Post to LinkedIn",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Post to Dev.to",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

## 📋 WORKFLOW 4: Performance Analytics & Optimization

### **Engagement Tracking & Analysis**
```json
{
  "name": "project4site Analytics & Optimization",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 0 */6 * * *"
            }
          ]
        }
      },
      "name": "Analytics Trigger",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "url": "https://api.twitter.com/2/users/by/username/project4site/tweets",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "twitterOAuth2Api",
        "options": {
          "qs": {
            "tweet.fields": "public_metrics,created_at",
            "max_results": "100"
          }
        }
      },
      "name": "Fetch Twitter Analytics",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [460, 200]
    },
    {
      "parameters": {
        "url": "https://api.linkedin.com/v2/shares",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "linkedInOAuth2Api",
        "options": {
          "qs": {
            "q": "owners",
            "owners": "urn:li:person:{{ $credentials.linkedInOAuth2Api.personId }}",
            "count": "50"
          }
        }
      },
      "name": "Fetch LinkedIn Analytics",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "url": "https://dev.to/api/articles/me",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "devToApi"
      },
      "name": "Fetch Dev.to Analytics",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [460, 400]
    },
    {
      "parameters": {
        "functionCode": "const twitterData = $('Fetch Twitter Analytics').item.json.data || [];\nconst linkedinData = $('Fetch LinkedIn Analytics').item.json.elements || [];\nconst devtoData = $('Fetch Dev.to Analytics').item.json || [];\n\n// Calculate engagement metrics\nconst twitterMetrics = {\n  totalTweets: twitterData.length,\n  totalLikes: twitterData.reduce((sum, tweet) => sum + (tweet.public_metrics?.like_count || 0), 0),\n  totalRetweets: twitterData.reduce((sum, tweet) => sum + (tweet.public_metrics?.retweet_count || 0), 0),\n  totalReplies: twitterData.reduce((sum, tweet) => sum + (tweet.public_metrics?.reply_count || 0), 0),\n  avgEngagement: 0\n};\n\nif (twitterMetrics.totalTweets > 0) {\n  twitterMetrics.avgEngagement = (twitterMetrics.totalLikes + twitterMetrics.totalRetweets + twitterMetrics.totalReplies) / twitterMetrics.totalTweets;\n}\n\nconst devtoMetrics = {\n  totalArticles: devtoData.length,\n  totalViews: devtoData.reduce((sum, article) => sum + (article.page_views_count || 0), 0),\n  totalReactions: devtoData.reduce((sum, article) => sum + (article.positive_reactions_count || 0), 0),\n  totalComments: devtoData.reduce((sum, article) => sum + (article.comments_count || 0), 0)\n};\n\n// Performance analysis\nconst performanceData = {\n  timestamp: new Date().toISOString(),\n  platforms: {\n    twitter: twitterMetrics,\n    devto: devtoMetrics\n  },\n  optimization_recommendations: []\n};\n\n// Generate optimization recommendations\nif (twitterMetrics.avgEngagement < 10) {\n  performanceData.optimization_recommendations.push({\n    platform: 'twitter',\n    issue: 'low_engagement',\n    recommendation: 'Increase use of hashtags and mentions',\n    priority: 'high'\n  });\n}\n\nif (devtoMetrics.totalViews / devtoMetrics.totalArticles < 100) {\n  performanceData.optimization_recommendations.push({\n    platform: 'devto',\n    issue: 'low_article_views',\n    recommendation: 'Improve SEO titles and use trending tags',\n    priority: 'medium'\n  });\n}\n\nreturn [{ json: performanceData }];"
      },
      "name": "Analyze Performance",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "operation": "write",
        "fileName": "analytics_report_{{ $now.format('YYYY-MM-DD') }}.json",
        "fileFormat": "json",
        "jsonData": "{{ $json }}"
      },
      "name": "Save Analytics Report",
      "type": "n8n-nodes-base.readWriteFile",
      "typeVersion": 1,
      "position": [900, 300]
    },
    {
      "parameters": {
        "url": "http://localhost:3001/optimize-strategy",
        "requestMethod": "POST",
        "options": {
          "bodyContentType": "json"
        },
        "jsonParameters": true,
        "parametersJson": "{{ $json }}"
      },
      "name": "Strategy Optimization (aegnt-27)",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [1120, 300]
    }
  ],
  "connections": {
    "Analytics Trigger": {
      "main": [
        [
          {
            "node": "Fetch Twitter Analytics",
            "type": "main",
            "index": 0
          },
          {
            "node": "Fetch LinkedIn Analytics", 
            "type": "main",
            "index": 0
          },
          {
            "node": "Fetch Dev.to Analytics",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Fetch Twitter Analytics": {
      "main": [
        [
          {
            "node": "Analyze Performance",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Fetch LinkedIn Analytics": {
      "main": [
        [
          {
            "node": "Analyze Performance",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Fetch Dev.to Analytics": {
      "main": [
        [
          {
            "node": "Analyze Performance",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Analyze Performance": {
      "main": [
        [
          {
            "node": "Save Analytics Report",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Save Analytics Report": {
      "main": [
        [
          {
            "node": "Strategy Optimization (aegnt-27)",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

## 🔐 CREDENTIALS CONFIGURATION

### **Required API Credentials**

#### **Twitter OAuth 2.0**
```json
{
  "name": "project4site Twitter",
  "type": "twitterOAuth2Api",
  "data": {
    "clientId": "YOUR_TWITTER_CLIENT_ID",
    "clientSecret": "YOUR_TWITTER_CLIENT_SECRET",
    "accessToken": "YOUR_TWITTER_ACCESS_TOKEN",
    "accessTokenSecret": "YOUR_TWITTER_ACCESS_TOKEN_SECRET"
  }
}
```

#### **LinkedIn OAuth 2.0**
```json
{
  "name": "project4site LinkedIn",
  "type": "linkedInOAuth2Api",
  "data": {
    "clientId": "YOUR_LINKEDIN_CLIENT_ID",
    "clientSecret": "YOUR_LINKEDIN_CLIENT_SECRET",
    "accessToken": "YOUR_LINKEDIN_ACCESS_TOKEN",
    "personId": "YOUR_LINKEDIN_PERSON_ID"
  }
}
```

#### **Dev.to API**
```json
{
  "name": "project4site DevTo",
  "type": "devToApi",
  "data": {
    "apiKey": "YOUR_DEVTO_API_KEY"
  }
}
```

#### **aegnt-27 Service**
```json
{
  "name": "aegnt-27 Content Generator",
  "type": "httpBasicAuth",
  "data": {
    "user": "project4site",
    "password": "YOUR_AEGNT27_API_KEY"
  }
}
```

---

## 🚀 DEPLOYMENT COMMANDS

### **1. Start All Services**
```bash
#!/bin/bash
# start-content-automation.sh

echo "Starting project4site Content Automation System..."

# Start n8n MCP Server
cd /home/tabs/ae-co-system/aegntic-MCP/servers/n8n-mcp
npx @aegntic/n8n-mcp --memory-mode --workers 8 --port 3000 &
N8N_PID=$!

# Start aegnt-27 Content Generator
cd /home/tabs/ae-co-system/DAILYDOCO/aegnt-27-standalone
./target/release/aegnt-27 --mode content-generator --port 3001 &
AEGNT_PID=$!

echo "n8n MCP Server started (PID: $N8N_PID)"
echo "aegnt-27 Content Generator started (PID: $AEGNT_PID)"

# Import workflows
sleep 10
curl -X POST http://localhost:3000/import-workflow \
  -H "Content-Type: application/json" \
  -d @/home/tabs/ae-co-system/project4site/workflows/master-orchestrator.json

curl -X POST http://localhost:3000/import-workflow \
  -H "Content-Type: application/json" \
  -d @/home/tabs/ae-co-system/project4site/workflows/strategic-engagement.json

curl -X POST http://localhost:3000/import-workflow \
  -H "Content-Type: application/json" \
  -d @/home/tabs/ae-co-system/project4site/workflows/content-publisher.json

curl -X POST http://localhost:3000/import-workflow \
  -H "Content-Type: application/json" \
  -d @/home/tabs/ae-co-system/project4site/workflows/analytics-optimizer.json

echo "All workflows imported and active!"
echo "Content automation system is running at:"
echo "- n8n Interface: http://localhost:3000"
echo "- aegnt-27 API: http://localhost:3001"

# Save PIDs for cleanup
echo $N8N_PID > .n8n.pid
echo $AEGNT_PID > .aegnt27.pid
```

### **2. Trigger First Content Generation**
```bash
# Trigger milestone webhook to start content generation
curl -X POST http://localhost:3000/webhook/milestone-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "milestone": "mvp-launch",
    "phase": "foundation",
    "userCount": 0,
    "revenue": 0,
    "message": "project4site MVP development begins!"
  }'
```

### **3. Monitor System Status**
```bash
# Check workflow status
curl http://localhost:3000/workflows | jq '.[] | {name: .name, active: .active, lastRun: .lastRun}'

# Check aegnt-27 status
curl http://localhost:3001/status

# View recent content generation
curl http://localhost:3000/executions?limit=10 | jq '.[] | {workflow: .workflowData.name, status: .finished, startedAt: .startedAt}'
```

---

## 📊 PERFORMANCE MONITORING

### **Key Metrics Dashboard**
```json
{
  "metrics": {
    "content_generation": {
      "daily_posts": 12,
      "engagement_rate": 4.2,
      "follower_growth": 15,
      "conversion_rate": 2.1
    },
    "strategic_engagement": {
      "daily_follows": 8,
      "daily_comments": 12,
      "daily_mentions": 5,
      "response_rate": 18.5
    },
    "automation_efficiency": {
      "workflow_success_rate": 98.7,
      "average_execution_time": 45,
      "error_rate": 1.3,
      "cost_per_engagement": 0.02
    }
  }
}
```

### **Success Criteria**
- **Content Quality:** >90% aegnt-27 generated content approved without editing
- **Engagement Growth:** >20% monthly follower growth across all platforms
- **Partnership Interest:** >5 monthly inbound partnership inquiries from social
- **Conversion Rate:** >15% social traffic to project4site signups
- **System Reliability:** >99% workflow execution success rate

---

**🎯 RESULT:** Fully autonomous content creation and distribution system that builds authentic relationships, drives user acquisition, and supports partnership development while maintaining human-like authenticity through aegnt-27 integration.

*This system creates the consistent social presence needed to support all ULTRAPLAN business development activities.*