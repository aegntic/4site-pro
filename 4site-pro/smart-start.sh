#!/bin/bash

# Project4Site Smart Startup Script
# Automatically handles port conflicts and finds available ports

echo "🚀 Project4Site Smart Startup"
echo "================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i:$port >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to find next available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    
    while check_port $port; do
        echo -e "${YELLOW}Port $port is in use, trying next...${NC}"
        ((port++))
        
        # Safety check - don't go too high
        if [ $port -gt $((start_port + 100)) ]; then
            echo -e "${RED}Error: Could not find available port near $start_port${NC}"
            return 1
        fi
    done
    
    echo $port
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Killing process $pid on port $port${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# Parse command line arguments
FORCE_KILL=false
AUTO_OPEN=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --kill|-k)
            FORCE_KILL=true
            shift
            ;;
        --no-open)
            AUTO_OPEN=false
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --kill, -k     Kill existing processes on default ports"
            echo "  --no-open      Don't auto-open browser"
            echo "  --help, -h     Show this help message"
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

# Service port configuration
declare -A SERVICES=(
    ["frontend"]=5173
    ["api_gateway"]=4000
    ["github_app"]=3001
    ["ai_pipeline"]=3002
    ["site_generator"]=3000
    ["deployment"]=3003
    ["commission"]=3004
    ["video_generator"]=3005
)

# Check current port usage
echo -e "\n${BLUE}Checking port availability...${NC}"
declare -A ACTUAL_PORTS

for service in "${!SERVICES[@]}"; do
    preferred_port=${SERVICES[$service]}
    
    if check_port $preferred_port; then
        process_info=$(lsof -i:$preferred_port | grep LISTEN | awk '{print $1}' | tail -1)
        echo -e "${YELLOW}⚠️  Port $preferred_port ($service) is used by: $process_info${NC}"
        
        if [ "$FORCE_KILL" = true ]; then
            kill_port $preferred_port
            ACTUAL_PORTS[$service]=$preferred_port
        else
            # Find alternative port
            new_port=$(find_available_port $preferred_port)
            ACTUAL_PORTS[$service]=$new_port
            echo -e "${GREEN}✅ Will use port $new_port for $service${NC}"
        fi
    else
        ACTUAL_PORTS[$service]=$preferred_port
        echo -e "${GREEN}✅ Port $preferred_port ($service) is available${NC}"
    fi
done

# Create temporary environment file with actual ports
echo -e "\n${BLUE}Creating port configuration...${NC}"
cat > .ports.env << EOF
# Auto-generated port configuration
export VITE_PORT=${ACTUAL_PORTS["frontend"]}
export API_GATEWAY_PORT=${ACTUAL_PORTS["api_gateway"]}
export GITHUB_APP_PORT=${ACTUAL_PORTS["github_app"]}
export AI_PIPELINE_PORT=${ACTUAL_PORTS["ai_pipeline"]}
export SITE_GENERATOR_PORT=${ACTUAL_PORTS["site_generator"]}
export DEPLOYMENT_PORT=${ACTUAL_PORTS["deployment"]}
export COMMISSION_PORT=${ACTUAL_PORTS["commission"]}
export VIDEO_GENERATOR_PORT=${ACTUAL_PORTS["video_generator"]}

# URLs for internal communication
export NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:${ACTUAL_PORTS["api_gateway"]}
export API_GATEWAY_URL=http://localhost:${ACTUAL_PORTS["api_gateway"]}
export GITHUB_APP_SERVICE_URL=http://localhost:${ACTUAL_PORTS["github_app"]}
export AI_ANALYSIS_PIPELINE_URL=http://localhost:${ACTUAL_PORTS["ai_pipeline"]}
export SITE_GENERATION_ENGINE_URL=http://localhost:${ACTUAL_PORTS["site_generator"]}
EOF

# Source the port configuration
source .ports.env

# Update docker-compose override if ports changed
if [ "${ACTUAL_PORTS["frontend"]}" != "5173" ] || [ "${ACTUAL_PORTS["api_gateway"]}" != "4000" ]; then
    echo -e "\n${BLUE}Creating docker-compose override...${NC}"
    cat > docker-compose.override.yml << EOF
version: '3.9'

services:
  api-gateway:
    ports:
      - "${ACTUAL_PORTS["api_gateway"]}:4000"
  
  github-app-service:
    ports:
      - "${ACTUAL_PORTS["github_app"]}:3001"
  
  ai-analysis-pipeline:
    ports:
      - "${ACTUAL_PORTS["ai_pipeline"]}:3002"
  
  site-generation-engine:
    ports:
      - "${ACTUAL_PORTS["site_generator"]}:3000"
  
  deployment-service:
    ports:
      - "${ACTUAL_PORTS["deployment"]}:3003"
  
  commission-service:
    ports:
      - "${ACTUAL_PORTS["commission"]}:3004"
  
  video-generator:
    ports:
      - "${ACTUAL_PORTS["video_generator"]}:3005"
EOF
fi

# Start services
echo -e "\n${BLUE}Starting services...${NC}"

# Start frontend in background
cd project4site_-github-readme-to-site-generator
PORT=${ACTUAL_PORTS["frontend"]} npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 3

# Display access information
echo -e "\n${GREEN}✨ Project4Site is starting!${NC}"
echo -e "\n${BLUE}Access URLs:${NC}"
echo -e "  Frontend:    ${GREEN}http://localhost:${ACTUAL_PORTS["frontend"]}${NC}"
echo -e "  API Gateway: ${GREEN}http://localhost:${ACTUAL_PORTS["api_gateway"]}${NC}"
echo -e "  API Docs:    ${GREEN}http://localhost:${ACTUAL_PORTS["api_gateway"]}/docs${NC}"
echo -e "  Site Preview: ${GREEN}http://localhost:${ACTUAL_PORTS["site_generator"]}/preview/[siteId]${NC}"

# Auto-open browser if requested
if [ "$AUTO_OPEN" = true ]; then
    sleep 2
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:${ACTUAL_PORTS["frontend"]}"
    elif command -v open &> /dev/null; then
        open "http://localhost:${ACTUAL_PORTS["frontend"]}"
    fi
fi

echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Trap for cleanup
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    
    # Kill frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # Stop Docker services if running
    if [ -f docker-compose.yml ]; then
        docker-compose down 2>/dev/null
    fi
    
    # Remove temporary files
    rm -f .ports.env docker-compose.override.yml
    
    echo -e "${GREEN}Shutdown complete${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for frontend process
wait $FRONTEND_PID