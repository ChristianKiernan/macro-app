#!/bin/bash

# Production Database Setup Script
# Run this after updating .env.production with your production database URL

set -e

echo "🚀 Setting up Production Database"
echo "================================"

# Check if .env.production exists and has been configured
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "Please create .env.production with your production DATABASE_URL"
    exit 1
fi

# Check if DATABASE_URL is configured
if grep -q "username:password@ep-xxx" .env.production; then
    echo "❌ Please update .env.production with your actual production database URL"
    echo "Replace the placeholder with your Neon production branch connection string"
    exit 1
fi

echo "✅ .env.production file found and configured"

# Set up production environment
export $(cat .env.production | grep -v '^#' | grep -v '^$' | xargs)

echo " Pushing schema to production database..."
npx prisma db push --accept-data-loss

echo "🌱 Running database seed..."
npx prisma db seed

echo "✅ Production database setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Test the production database with Prisma Studio:"
echo "   npx prisma studio"
echo "2. Add your production DATABASE_URL to GitHub secrets"
echo "3. Configure other environment variables for deployment"
echo ""
echo "🔐 Don't forget to:"
echo "- Delete .env.production after setup (contains sensitive data)"
echo "- Add the DATABASE_URL to your GitHub repository secrets"
echo "- Update NEXTAUTH_URL with your actual Vercel app URL"
