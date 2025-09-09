#!/bin/bash
set -e

echo "🚀 Starting pre-production deployment..."

# Create logs directory
mkdir -p logs

# Install PM2 globally if not exists
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi

# Stop existing app if running
pm2 stop friendly-guacamole-preprod || true
pm2 delete friendly-guacamole-preprod || true

# Start the application
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save
pm2 startup || true

echo "✅ Pre-production deployment completed!"
echo "📊 Application status:"
pm2 status

echo "🌐 Application should be available at: http://localhost:3001"
