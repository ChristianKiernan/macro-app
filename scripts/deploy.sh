#!/bin/bash

# Production Deployment Setup Script
# Run this script to set up your production deployment

set -e

echo "🚀 Macro App - Production Deployment Setup"
echo "=========================================="

# Check if required tools are installed
command -v git >/dev/null 2>&1 || { echo "❌ Git is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ Node.js/npm is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Validate environment setup
if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local found. Copy .env.example and configure your local environment:"
    echo "   cp .env.example .env.local"
    echo "   # Edit .env.local with your local database credentials"
fi

# Run tests before deployment
echo "🧪 Running tests..."
npm test -- --passWithNoTests

# Check TypeScript compilation
echo "🔍 Checking TypeScript..."
npm run type-check

# Security audit
echo "🔒 Running security audit..."
npm audit --audit-level moderate

# Build check
echo "🏗️  Testing production build..."
npm run build

echo ""
echo "✅ All checks passed! Your app is ready for production deployment."
echo ""
echo "📋 Next Steps:"
echo "1. Create production database in Neon (https://neon.tech)"
echo "2. Set up Vercel project (https://vercel.com)"
echo "3. Configure GitHub repository secrets:"
echo "   - DATABASE_URL (from Neon)"
echo "   - NEXTAUTH_SECRET (generate 32+ character secret)"
echo "   - NEXTAUTH_URL (your Vercel app URL)"
echo "   - VERCEL_TOKEN (from Vercel account settings)"
echo "   - VERCEL_ORG_ID (from Vercel project settings)"
echo "   - VERCEL_PROJECT_ID (from Vercel project settings)"
echo "4. Push to main branch to trigger deployment"
echo ""
echo "🔗 Useful Commands:"
echo "   npm run dev          # Start development server"
echo "   npm run build        # Build for production"
echo "   npm run start        # Start production server"
echo "   npm run db:push      # Push schema to database"
echo "   npm run db:migrate   # Run database migrations"
echo "   npm run db:studio    # Open Prisma Studio"
