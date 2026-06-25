#!/bin/bash
set -e

echo "=== Claude Worker Production Installer ==="

# 1. Update OS
echo "Updating OS packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Node.js 20 if not present
if ! command -v node &> /dev/null || [[ $(node -v) != v20* ]]; then
    echo "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 3. Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# 4. Install Dependencies
echo "Installing application dependencies..."
npm ci --production

# 5. Install Playwright Browsers & Deps
echo "Installing Playwright system dependencies..."
npx playwright install-deps chromium
npx playwright install chromium

# 6. Setup Directories
echo "Setting up filesystem..."
mkdir -p logs archive tools scripts backup
mkdir -p chrome-profile temp-chrome-data

# 7. Check for .env
if [ ! -f .env ]; then
    echo "WARNING: .env file missing. Creating template..."
    cat << 'EOF' > .env
PORT=3000
CLAUDE_PROFILE_PATH=./chrome-profile
CLAUDE_HEADLESS=true
API_KEYS=generate_secret_keys_here
RATE_LIMIT_REWRITE=10
EOF
    echo "Action required: Edit .env before starting."
fi

echo "=== Installation Complete ==="
echo "Next steps:"
echo "1. Configure .env"
echo "2. Perform manual headed login (see OPERATIONS.md)"
echo "3. Run ./start.sh"
