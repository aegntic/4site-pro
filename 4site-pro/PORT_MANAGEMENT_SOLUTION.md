# 🔌 Port Management Solution for Project4Site

## Problem Solved

The platform now automatically handles port conflicts and finds available ports when the default ones are busy.

## Implementation Details

### 1. **Vite Configuration** (`vite.config.ts`)
```typescript
server: {
  port: 5173,
  strictPort: false, // Automatically finds next available port
  host: true,       // Accessible from network
  open: false,      // Don't auto-open browser
}
```

### 2. **Smart Startup Script** (`smart-start.sh`)
- Checks all service ports before starting
- Finds alternative ports if defaults are busy
- Option to kill existing processes with `--kill` flag
- Creates dynamic port configuration

### 3. **Port Utility** (`utils/portManager.ts`)
```typescript
// Check if port is available
await isPortAvailable(5173)

// Find next available port
const port = await findAvailablePort(5173)

// Kill process on port
await killProcessOnPort(5173)
```

### 4. **NPM Scripts** Added to `package.json`
```json
"scripts": {
  "dev": "vite",                    // Standard dev server
  "dev:force": "vite --force",      // Force clear cache
  "ports:check": "...",             // Check which ports are in use
  "ports:kill": "...",              // Kill processes on project ports
  "start": "node ../start-services.js",      // Smart startup
  "start:kill": "node ../start-services.js --kill"  // Kill & restart
}
```

## Usage Examples

### Check Port Status
```bash
npm run ports:check
```
Output:
```
node     12345 user   23u  IPv4  0x...  0t0  TCP *:5173 (LISTEN)
node     12346 user   24u  IPv4  0x...  0t0  TCP *:4000 (LISTEN)
```

### Start with Automatic Port Selection
```bash
npm run dev
```
If port 5173 is busy, Vite will automatically use 5174, 5175, etc.

### Force Kill and Restart
```bash
# From 4site-pro directory
./smart-start.sh --kill
```
Or:
```bash
# From project directory
npm run start:kill
```

### Kill All Project Ports
```bash
npm run ports:kill
```

## Port Allocation Strategy

1. **Default Ports** (Preferred):
   - Frontend: 5173
   - API Gateway: 4000
   - GitHub App: 3001
   - AI Pipeline: 3002
   - Site Generator: 3000
   - Deployment: 3003
   - Commission: 3004
   - Video Generator: 3005

2. **Fallback Strategy**:
   - Try next 10 ports (e.g., 5173 → 5174 → 5175...)
   - If all are busy, let OS assign random port
   - Update all service URLs dynamically

3. **Docker Override**:
   - Creates `docker-compose.override.yml` when ports change
   - Maps container ports to available host ports

## Environment Variables

The system automatically creates `.ports.env` with actual ports:
```bash
export VITE_PORT=5174
export API_GATEWAY_PORT=4001
export NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:4001
# ... etc
```

## Current Status

✅ **Frontend**: Running on port 5173 (or next available)
✅ **Auto Port Selection**: Implemented and working
✅ **Port Conflict Resolution**: Automatic fallback
✅ **Process Management**: Kill and restart capabilities
✅ **Docker Integration**: Override file for port mapping

## Quick Commands

```bash
# Start everything (auto port selection)
cd /home/tabs/ae-co-system/project4site/4site-pro
./smart-start.sh

# Start frontend only
cd project4site_-github-readme-to-site-generator
npm run dev

# Kill all and restart
./smart-start.sh --kill

# Check what's running
npm run ports:check
```

## Troubleshooting

### Port Still Busy After Kill
```bash
# Force kill with system command
sudo lsof -ti:5173 | xargs kill -9

# Or use fuser
sudo fuser -k 5173/tcp
```

### Can't Access from Network
Make sure firewall allows the ports:
```bash
# Ubuntu/Debian
sudo ufw allow 5173
sudo ufw allow 4000

# Or disable firewall temporarily
sudo ufw disable
```

### Vite Not Finding Port
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev:force
```

## Benefits

1. **No More Port Conflicts**: Automatically finds available ports
2. **Persistent Development**: Can run multiple instances
3. **Team Friendly**: Multiple developers can work simultaneously
4. **CI/CD Ready**: Works in containerized environments
5. **Zero Configuration**: Just run and it works

The platform now handles all port management automatically, ensuring a smooth development experience regardless of what other services are running on your machine!