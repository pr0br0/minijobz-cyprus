#!/bin/bash

# Cyprus Jobs Platform - Supabase Setup Script
# This script helps automate the setup process for Supabase

echo "🇨🇾 Cyprus Jobs Platform - Supabase Setup Script"
echo "=================================================="

# Check if required tools are installed
command -v supabase >/dev/null 2>&1 || { echo "❌ Supabase CLI is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }

# Function to prompt for input
prompt_input() {
    local prompt="$1"
    local variable="$2"
    local default="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        input="${input:-$default}"
    else
        read -p "$prompt: " input
    fi
    
    eval "$variable='$input'"
}

# Function to validate email
validate_email() {
    local email="$1"
    if [[ "$email" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to validate URL
validate_url() {
    local url="$1"
    if [[ "$url" =~ ^https?:// ]]; then
        return 0
    else
        return 1
    fi
}

echo ""
echo "📋 Step 1: Project Configuration"
echo "--------------------------------"

prompt_input "Enter project name" PROJECT_NAME "cyprus-jobs-platform"
prompt_input "Enter project description" PROJECT_DESCRIPTION "Cyprus Jobs Platform - Job board for Cyprus market"
prompt_input "Enter organization name" ORG_NAME "Cyprus Jobs Ltd"
prompt_input "Enter admin email" ADMIN_EMAIL ""
prompt_input "Enter project region" REGION "eu-west-1"

# Validate admin email
while ! validate_email "$ADMIN_EMAIL"; do
    echo "❌ Invalid email format. Please try again."
    prompt_input "Enter admin email" ADMIN_EMAIL ""
done

echo ""
echo "📋 Step 2: Supabase Project Setup"
echo "--------------------------------"

# Check if already logged in to Supabase
if ! supabase projects list >/dev/null 2>&1; then
    echo "🔐 Please login to Supabase CLI..."
    supabase login
fi

echo "🚀 Creating Supabase project..."
PROJECT_RESPONSE=$(supabase projects create "$PROJECT_NAME" \
    --description "$PROJECT_DESCRIPTION" \
    --org "$ORG_NAME" \
    --region "$REGION" \
    --db-password "$(openssl rand -base64 32)" \
    --output json)

if [ $? -eq 0 ]; then
    PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.id')
    PROJECT_URL=$(echo "$PROJECT_RESPONSE" | jq -r '.endpoint')
    ANON_KEY=$(echo "$PROJECT_RESPONSE" | jq -r '.anon_key')
    SERVICE_KEY=$(echo "$PROJECT_RESPONSE" | jq -r '.service_key')
    
    echo "✅ Supabase project created successfully!"
    echo "   Project ID: $PROJECT_ID"
    echo "   Project URL: $PROJECT_URL"
else
    echo "❌ Failed to create Supabase project. Please check the error message above."
    exit 1
fi

echo ""
echo "📋 Step 3: Database Schema Setup"
echo "--------------------------------"

# Wait for project to be ready
echo "⏳ Waiting for project to be ready..."
sleep 30

# Run SQL migrations
echo "📝 Running initial schema migration..."
supabase db push --db-url "$PROJECT_URL" --schema-file supabase/migrations/001_initial_schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Initial schema migration completed!"
else
    echo "❌ Failed to run initial schema migration."
    exit 1
fi

echo "📝 Running RLS policies migration..."
supabase db push --db-url "$PROJECT_URL" --schema-file supabase/migrations/002_rls_policies.sql

if [ $? -eq 0 ]; then
    echo "✅ RLS policies migration completed!"
else
    echo "❌ Failed to run RLS policies migration."
    exit 1
fi

echo "📝 Running SQL function migration..."
supabase db push --db-url "$PROJECT_URL" --schema-file supabase/migrations/003_exec_sql_function.sql

if [ $? -eq 0 ]; then
    echo "✅ SQL function migration completed!"
else
    echo "❌ Failed to run SQL function migration."
    exit 1
fi

echo ""
echo "📋 Step 4: Environment Variables Setup"
echo "--------------------------------------"

# Update .env.local file
echo "📝 Updating environment variables..."
ENV_FILE=".env.local"

# Create backup of existing .env.local
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$ENV_FILE.backup"
    echo "📋 Backup of existing .env.local created as $ENV_FILE.backup"
fi

# Update Supabase configuration
sed -i.bak "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$PROJECT_URL|" "$ENV_FILE"
sed -i.bak "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY|" "$ENV_FILE"
sed -i.bak "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY|" "$ENV_FILE"

# Update other configurations
sed -i.bak "s|APP_URL=.*|APP_URL=$PROJECT_URL|" "$ENV_FILE"

echo "✅ Environment variables updated!"
echo "   Please review $ENV_FILE and update any additional settings."

echo ""
echo "📋 Step 5: Storage Setup"
echo "------------------------"

echo "📦 Creating storage buckets..."
# Create CV storage bucket
curl -X POST "$PROJECT_URL/storage/v1/bucket" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "cvs",
        "public": false,
        "file_size_limit": 10485760,
        "allowed_mime_types": ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    }'

# Create company logos bucket
curl -X POST "$PROJECT_URL/storage/v1/bucket" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "logos",
        "public": true,
        "file_size_limit": 5242880,
        "allowed_mime_types": ["image/jpeg", "image/png", "image/gif", "image/webp"]
    }'

echo "✅ Storage buckets created!"

echo ""
echo "📋 Step 6: Authentication Setup"
echo "-------------------------------"

echo "🔧 Configuring authentication settings..."
# Update authentication settings
curl -X POST "$PROJECT_URL/auth/v1/admin/settings" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "site_url": "'"$PROJECT_URL"'",
        "redirect_url": "'"$PROJECT_URL"'/auth/callback",
        "disable_signup": false,
        "external_providers": {
            "google": {
                "enabled": true,
                "client_id": "",
                "client_secret": ""
            }
        }
    }'

echo "✅ Authentication settings configured!"
echo "   Note: Please configure Google OAuth in Supabase dashboard"

echo ""
echo "📋 Step 7: Stripe Integration Setup"
echo "----------------------------------"

echo "💳 Stripe configuration..."
echo "   Please complete the following steps manually:"
echo "   1. Create a Stripe account at https://dashboard.stripe.com"
echo "   2. Get your test API keys"
echo "   3. Update the following in $ENV_FILE:"
echo "      STRIPE_PUBLISHABLE_KEY=pk_test_..."
echo "      STRIPE_SECRET_KEY=sk_test_..."
echo "      STRIPE_WEBHOOK_SECRET=whsec_..."
echo "   4. Configure webhook endpoints in Stripe dashboard"

echo ""
echo "📋 Step 8: Final Setup"
echo "---------------------"

echo "🧪 Testing database connection..."
# Test database connection
curl -X GET "$PROJECT_URL/rest/v1/" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "apikey: $ANON_KEY"

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed. Please check your configuration."
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Review and update $ENV_FILE with any additional settings"
echo "2. Configure Google OAuth in Supabase dashboard"
echo "3. Set up Stripe integration"
echo "4. Run 'npm install' to install dependencies"
echo "5. Run 'npm run dev' to start the development server"
echo "6. Test all functionality"
echo ""
echo "📚 Documentation:"
echo "- Migration Guide: MIGRATION_STEPS.md"
echo "- Supabase Setup: SUPABASE_SETUP.md"
echo ""
echo "🔗 Useful Links:"
echo "- Supabase Dashboard: https://app.supabase.com/project/$PROJECT_ID"
echo "- Project URL: $PROJECT_URL"
echo ""
echo "Good luck with your Cyprus Jobs Platform! 🇨🇾"