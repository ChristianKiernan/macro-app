#!/bin/bash

# Database Baseline Script
# Run this to manually baseline your production database

set -e

echo "🗃️ Baselining Production Database"
echo "=================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "Please set your production DATABASE_URL:"
    echo "export DATABASE_URL='your-production-database-url'"
    exit 1
fi

echo "✅ DATABASE_URL is set"

echo "🔄 Marking existing migrations as applied..."

# Mark the initial migration as applied
echo "Resolving migration: 20250828162121_init"
npx prisma migrate resolve --applied "20250828162121_init" || echo "Migration already resolved or not needed"

# Mark the password field migration as applied
echo "Resolving migration: 20250828183755_add_password_field"
npx prisma migrate resolve --applied "20250828183755_add_password_field" || echo "Migration already resolved or not needed"

echo ""
echo "✅ Database baseline complete!"
echo ""
echo "📋 What happened:"
echo "- Marked existing migrations as 'applied' in the production database"
echo "- This tells Prisma that these migrations have already been run"
echo "- Future migrations will run normally from this baseline"
echo ""
echo "🚀 Next steps:"
echo "- Your CI/CD pipeline will now handle migrations properly"
echo "- Any new migrations will be applied automatically on deployment"
