#!/bin/bash

# ===================================================================
# PROJECT4SITE - DEVELOPMENT ENVIRONMENT SETUP
# ===================================================================
# Automated setup script for local development
# Usage: ./setup-dev.sh [--full|--minimal|--services-only]
# ===================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="project4site"
ENV_FILE=".env"
ENV_TEMPLATE=".env.template"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Parse command line arguments
SETUP_MODE="full"
if [[ $# -gt 0 ]]; then
    case $1 in
        --full)
            SETUP_MODE="full"
            ;;
        --minimal)
            SETUP_MODE="minimal"
            ;;
        --services-only)
            SETUP_MODE="services-only"
            ;;
        --help)
            echo "Usage: $0 [--full|--minimal|--services-only|--help]"
            echo ""
            echo "Options:"
            echo "  --full          Complete setup with all services and tools (default)"
            echo "  --minimal       Basic setup with core services only"
            echo "  --services-only Setup infrastructure services only (databases, redis)"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Error: Unknown option $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
fi

# Utility functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check for required commands
    check_command "docker"
    check_command "docker-compose"
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    # Check for optional but recommended commands
    if command -v bun &> /dev/null; then
        log_success "Bun runtime detected (recommended for JS/TS development)"
    else
        log_warning "Bun runtime not found. Install it for faster JS/TS development: curl -fsSL https://bun.sh/install | bash"
    fi
    
    if command -v uv &> /dev/null; then
        log_success "uv Python package manager detected (recommended for Python development)"
    else
        log_warning "uv not found. Install it for faster Python development: curl -LsSf https://astral.sh/uv/install.sh | sh"
    fi
    
    log_success "Prerequisites check completed"
}

# Setup environment variables
setup_environment() {
    log_info "Setting up environment variables..."
    
    if [[ ! -f "$ENV_TEMPLATE" ]]; then
        log_error "Environment template file $ENV_TEMPLATE not found!"
        exit 1
    fi
    
    if [[ -f "$ENV_FILE" ]]; then
        log_warning "Environment file $ENV_FILE already exists"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Keeping existing environment file"
            return 0
        fi
    fi
    
    cp "$ENV_TEMPLATE" "$ENV_FILE"
    
    # Generate secure random passwords
    DATABASE_PASSWORD=$(openssl rand -hex 16)
    REDIS_PASSWORD=$(openssl rand -hex 16)
    NEO4J_PASSWORD=$(openssl rand -hex 16)
    JWT_SECRET=$(openssl rand -hex 32)
    INTERNAL_API_SECRET=$(openssl rand -hex 32)
    
    # Update environment file with generated passwords
    sed -i.bak \
        -e "s/DATABASE_PASSWORD:-secure_dev_password/DATABASE_PASSWORD:-$DATABASE_PASSWORD/g" \
        -e "s/REDIS_PASSWORD:-redis_dev_password/REDIS_PASSWORD:-$REDIS_PASSWORD/g" \
        -e "s/NEO4J_PASSWORD:-neo4j_dev_password/NEO4J_PASSWORD:-$NEO4J_PASSWORD/g" \
        -e "s/JWT_SECRET:-dev_jwt_secret_32_chars_minimum/JWT_SECRET:-$JWT_SECRET/g" \
        -e "s/INTERNAL_API_SECRET:-dev_internal_secret/INTERNAL_API_SECRET:-$INTERNAL_API_SECRET/g" \
        "$ENV_FILE"
    
    rm "$ENV_FILE.bak"
    
    log_success "Environment file created with secure generated passwords"
    log_warning "Please update API keys in $ENV_FILE before starting services"
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    
    local directories=(
        "logs"
        "uploads"
        "models/cache"
        "video/cache"
        "video/output"
        "backups"
        "ssl"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        log_info "Created directory: $dir"
    done
    
    log_success "Directory structure created"
}

# Setup Docker network
setup_docker_network() {
    log_info "Setting up Docker network..."
    
    # Create custom network if it doesn't exist
    if ! docker network ls | grep -q "${PROJECT_NAME}"; then
        docker network create "${PROJECT_NAME}" --driver bridge
        log_success "Created Docker network: ${PROJECT_NAME}"
    else
        log_info "Docker network ${PROJECT_NAME} already exists"
    fi
}

# Start infrastructure services
start_infrastructure() {
    log_info "Starting infrastructure services..."
    
    case $SETUP_MODE in
        "services-only")
            SERVICES="postgres redis neo4j"
            ;;
        "minimal")
            SERVICES="postgres redis api-gateway github-app site-generator"
            ;;
        "full")
            SERVICES=""  # Start all services
            ;;
    esac
    
    if [[ -n "$SERVICES" ]]; then
        docker-compose up -d $SERVICES
    else
        docker-compose up -d
    fi
    
    log_success "Infrastructure services started"
}

# Wait for services to be ready
wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    log_info "Waiting for PostgreSQL..."
    until docker-compose exec -T postgres pg_isready -U project4site -d project4site_dev; do
        sleep 2
    done
    log_success "PostgreSQL is ready"
    
    # Wait for Redis
    log_info "Waiting for Redis..."
    until docker-compose exec -T redis redis-cli ping; do
        sleep 2
    done
    log_success "Redis is ready"
    
    # Wait for Neo4j (if running)
    if docker-compose ps neo4j | grep -q "Up"; then
        log_info "Waiting for Neo4j..."
        until docker-compose exec -T neo4j cypher-shell -u neo4j -p "${NEO4J_PASSWORD:-neo4j_dev_password}" "RETURN 1"; do
            sleep 5
        done
        log_success "Neo4j is ready"
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # The migrations are automatically run by the init scripts in docker-compose
    # But we can verify they completed successfully
    if docker-compose exec -T postgres psql -U project4site -d project4site_dev -c "SELECT COUNT(*) FROM users;" &> /dev/null; then
        log_success "Database schema is ready"
    else
        log_error "Database schema setup failed"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    if [[ "$SETUP_MODE" == "services-only" ]]; then
        log_info "Skipping dependency installation for services-only mode"
        return 0
    fi
    
    log_info "Installing dependencies..."
    
    # Install root dependencies if package.json exists
    if [[ -f "package.json" ]]; then
        if command -v bun &> /dev/null; then
            bun install
            log_success "Installed root dependencies with bun"
        else
            npm install
            log_success "Installed root dependencies with npm"
        fi
    fi
    
    # Install service dependencies
    local service_dirs=(
        "services/api-gateway"
        "services/github-app-service"
        "services/site-generation-engine"
        "services/commission-service"
        "services/deployment-service"
    )
    
    for service_dir in "${service_dirs[@]}"; do
        if [[ -d "$service_dir" && -f "$service_dir/package.json" ]]; then
            log_info "Installing dependencies for $service_dir..."
            cd "$service_dir"
            if command -v bun &> /dev/null; then
                bun install
            else
                npm install
            fi
            cd - > /dev/null
            log_success "Dependencies installed for $service_dir"
        fi
    done
}

# Setup development tools
setup_dev_tools() {
    if [[ "$SETUP_MODE" == "services-only" ]]; then
        log_info "Skipping development tools setup for services-only mode"
        return 0
    fi
    
    log_info "Setting up development tools..."
    
    # Start development tools with profile
    docker-compose --profile dev-tools up -d
    
    log_success "Development tools started"
    log_info "Access development tools at:"
    log_info "  - pgAdmin: http://localhost:5050 (admin@project4site.dev / admin123)"
    log_info "  - Redis Commander: http://localhost:8081"
    log_info "  - MailHog: http://localhost:8025"
}

# Setup monitoring (optional)
setup_monitoring() {
    if [[ "$SETUP_MODE" != "full" ]]; then
        log_info "Skipping monitoring setup for $SETUP_MODE mode"
        return 0
    fi
    
    read -p "Do you want to set up monitoring stack? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Setting up monitoring stack..."
        docker-compose --profile monitoring up -d
        
        log_success "Monitoring stack started"
        log_info "Access monitoring tools at:"
        log_info "  - Prometheus: http://localhost:9090"
        log_info "  - Grafana: http://localhost:3030 (admin / admin123)"
        log_info "  - Jaeger: http://localhost:16686"
    fi
}

# Generate GitHub App private key placeholder
setup_github_app() {
    log_info "Setting up GitHub App configuration..."
    
    if [[ ! -f "github-app.private-key.pem" ]]; then
        # Create a placeholder private key file
        cat > github-app.private-key.pem << 'EOF'
-----BEGIN RSA PRIVATE KEY-----
# This is a placeholder file. Replace with your actual GitHub App private key.
# To generate a GitHub App:
# 1. Go to GitHub Settings > Developer settings > GitHub Apps
# 2. Click "New GitHub App"
# 3. Fill in the required information
# 4. Generate a private key and replace this file content
# 5. Update the environment variables in .env file
-----END RSA PRIVATE KEY-----
EOF
        
        chmod 600 github-app.private-key.pem
        log_warning "Created placeholder GitHub App private key file"
        log_warning "Please replace github-app.private-key.pem with your actual private key"
    fi
}

# Display final information
display_final_info() {
    log_success "Development environment setup completed!"
    echo
    echo -e "${GREEN}🚀 Project4Site Development Environment${NC}"
    echo -e "${BLUE}=======================================${NC}"
    echo
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Update API keys in .env file (especially GEMINI_API_KEY)"
    echo "2. Replace github-app.private-key.pem with your actual GitHub App private key"
    echo "3. Update GitHub App configuration in .env file"
    echo
    echo -e "${YELLOW}Access Points:${NC}"
    echo "  - API Gateway: http://localhost:3000"
    echo "  - Site Generator: http://localhost:3001"
    echo "  - pgAdmin: http://localhost:5050"
    echo "  - Redis Commander: http://localhost:8081"
    if [[ "$SETUP_MODE" == "full" ]]; then
        echo "  - Prometheus: http://localhost:9090"
        echo "  - Grafana: http://localhost:3030"
        echo "  - Jaeger: http://localhost:16686"
    fi
    echo
    echo -e "${YELLOW}Useful Commands:${NC}"
    echo "  docker-compose logs -f                 # View all logs"
    echo "  docker-compose logs -f api-gateway     # View specific service logs"
    echo "  docker-compose restart                 # Restart all services"
    echo "  docker-compose down                    # Stop all services"
    echo "  docker-compose down -v                 # Stop and remove volumes"
    echo
    echo -e "${YELLOW}Development:${NC}"
    echo "  bun run dev                            # Start development servers"
    echo "  docker-compose exec postgres psql -U project4site -d project4site_dev"
    echo "  docker-compose exec redis redis-cli"
    echo
    echo -e "${GREEN}Happy coding! 🎉${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                    PROJECT4SITE SETUP                        ║"
    echo "║              AI-Powered Presentation Intelligence             ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo
    
    log_info "Starting $SETUP_MODE setup..."
    
    check_prerequisites
    setup_environment
    create_directories
    setup_docker_network
    setup_github_app
    
    start_infrastructure
    wait_for_services
    run_migrations
    
    install_dependencies
    
    if [[ "$SETUP_MODE" == "full" || "$SETUP_MODE" == "minimal" ]]; then
        setup_dev_tools
    fi
    
    if [[ "$SETUP_MODE" == "full" ]]; then
        setup_monitoring
    fi
    
    display_final_info
}

# Run main function
main "$@"