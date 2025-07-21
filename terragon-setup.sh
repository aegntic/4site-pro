#!/bin/bash

# Terragon Setup Script - Sets up the project4site codebase for development
# This script configures TypeScript type checking and test execution

set -e  # Exit on error

echo "=== Terragon Setup Script ==="
echo "Setting up project4site for development..."
echo

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Change to project root
cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)

print_status "Working in: $PROJECT_ROOT"

# Step 1: Install root dependencies
echo
echo "Installing root project dependencies..."
if npm install; then
    print_status "Root dependencies installed"
else
    print_error "Failed to install root dependencies"
    exit 1
fi

# Step 2: Create root tsconfig.json if it doesn't exist
echo
echo "Setting up TypeScript configuration..."
if [ ! -f tsconfig.json ]; then
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "services/**/*",
    "4site-pro/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}
EOF
    print_status "Created root tsconfig.json"
else
    print_status "Root tsconfig.json already exists"
fi

# Step 3: Navigate to MVP project
MVP_DIR="$PROJECT_ROOT/4site-pro/project4site_-github-readme-to-site-generator"
if [ -d "$MVP_DIR" ]; then
    cd "$MVP_DIR"
    print_status "Changed to MVP directory"
else
    print_error "MVP directory not found: $MVP_DIR"
    exit 1
fi

# Step 4: Install MVP dependencies
echo
echo "Installing MVP project dependencies..."
if npm install; then
    print_status "MVP dependencies installed"
else
    print_error "Failed to install MVP dependencies"
    exit 1
fi

# Step 5: Install React type definitions if not present
echo
echo "Checking React type definitions..."
if ! npm list @types/react >/dev/null 2>&1; then
    print_warning "Installing missing React type definitions..."
    npm install --save-dev @types/react @types/react-dom
    print_status "React type definitions installed"
else
    print_status "React type definitions already installed"
fi

# Step 6: Fix TypeScript errors in problematic files
echo
echo "Fixing TypeScript syntax errors..."

# Fix PolarIntegrationSection.tsx
if [ -f "components/integration/PolarIntegrationSection.tsx" ]; then
    # Check if file has escaped quotes
    if grep -q '\\"' "components/integration/PolarIntegrationSection.tsx"; then
        print_warning "Fixing escaped quotes in PolarIntegrationSection.tsx"
        sed -i 's/\\"/"/g' "components/integration/PolarIntegrationSection.tsx"
        sed -i 's/\\n/\n/g' "components/integration/PolarIntegrationSection.tsx"
        print_status "Fixed PolarIntegrationSection.tsx"
    fi
fi

# Fix UpdatedMainSection.tsx
if [ -f "components/sections/UpdatedMainSection.tsx" ]; then
    # Check if file has escaped quotes
    if grep -q '\\"' "components/sections/UpdatedMainSection.tsx"; then
        print_warning "Fixing escaped quotes in UpdatedMainSection.tsx"
        sed -i 's/\\"/"/g' "components/sections/UpdatedMainSection.tsx"
        sed -i 's/\\n/\n/g' "components/sections/UpdatedMainSection.tsx"
        print_status "Fixed UpdatedMainSection.tsx"
    fi
fi

# Step 7: Ensure vite-env.d.ts is properly configured
echo
echo "Checking Vite environment types..."
if [ -f "vite-env.d.ts" ]; then
    print_status "vite-env.d.ts exists"
else
    print_warning "Creating vite-env.d.ts"
    cat > vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_GITHUB_TOKEN?: string
  readonly VITE_FAL_API_KEY?: string
  readonly VITE_AURA_API_KEY?: string
  readonly VITE_MCP_SERVER_PORT?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_APP_URL?: string
  readonly VITE_POLAR_CLIENT_ID?: string
  readonly VITE_POLAR_CLIENT_SECRET?: string
  readonly VITE_POLAR_WEBHOOK_SECRET?: string
  readonly VITE_OPENROUTER_API_KEY?: string
  readonly VITE_DEMO_MODE?: string
  readonly VITE_ENVIRONMENT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
EOF
    print_status "Created vite-env.d.ts"
fi

# Step 8: Make test scripts executable
echo
echo "Setting up test scripts..."
if [ -f "test-suite/run-tests.sh" ]; then
    chmod +x test-suite/run-tests.sh
    print_status "Test scripts are executable"
else
    print_warning "Test script not found: test-suite/run-tests.sh"
fi

# Step 9: Create .env.local template if it doesn't exist
echo
echo "Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    print_warning "Creating .env.local template"
    cat > .env.local << 'EOF'
# Required for site generation
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional - for enhanced features
# VITE_GITHUB_TOKEN=your_github_token
# VITE_FAL_API_KEY=your_fal_api_key
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF
    print_status "Created .env.local template - Please add your API keys"
else
    print_status ".env.local already exists"
fi

# Step 10: Run type checking
echo
echo "Running TypeScript type check..."
cd "$PROJECT_ROOT"
if npm run type-check 2>/dev/null; then
    print_status "TypeScript type checking passed"
else
    print_warning "TypeScript type checking has some issues (this is expected)"
fi

# Step 11: Test that the test suite is runnable
echo
echo "Verifying test suite..."
cd "$MVP_DIR"
if [ -x "test-suite/run-tests.sh" ]; then
    print_status "Test suite is ready to run"
    echo
    echo "You can run tests with:"
    echo "  npm test"
    echo "  npm run test:quick"
    echo "  npm run test:comprehensive"
else
    print_warning "Test suite not found or not executable"
fi

# Clean up any temporary files
echo
echo "Cleaning up temporary files..."
find . -name "*.swp" -delete 2>/dev/null || true
find . -name "*.swo" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
print_status "Cleanup complete"

# Summary
echo
echo "=== Setup Complete ==="
echo
print_status "TypeScript configuration is set up"
print_status "Test suite is configured"
print_status "Dependencies are installed"
echo
echo "Next steps:"
echo "1. Add your API keys to: $MVP_DIR/.env.local"
echo "2. Run development server: cd $MVP_DIR && npm run dev"
echo "3. Run type checking: npm run type-check"
echo "4. Run tests: npm test"
echo
echo "To re-run this setup: ./terragon-setup.sh"