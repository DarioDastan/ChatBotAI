#!/bin/bash

# Izocrete Chatbot Deployment Script
# This script helps deploy the chatbot API to Railway

echo "🚀 Izocrete Chatbot Deployment Script"
echo "====================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed."
    echo "Please install it first:"
    echo "npm install -g @railway/cli"
    echo ""
    echo "Or visit: https://railway.app/docs/develop/cli"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "chat_api.py" ]; then
    echo "❌ chat_api.py not found in current directory"
    echo "Please run this script from the ChatBotAI directory"
    exit 1
fi

echo "📋 Checking current status..."

# Check if already logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway..."
    railway login
fi

# Check if project is already initialized
if [ ! -f "railway.json" ]; then
    echo "🚂 Initializing Railway project..."
    railway init
else
    echo "✅ Railway project already initialized"
fi

# Deploy the application
echo "🚀 Deploying to Railway..."
railway up

# Get the deployment URL
echo "🔗 Getting deployment URL..."
DEPLOYMENT_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)

if [ -n "$DEPLOYMENT_URL" ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "📡 Your chatbot API is available at:"
    echo "   $DEPLOYMENT_URL"
    echo ""
    echo "🔍 Testing API health..."
    
    # Test the health endpoint
    HEALTH_RESPONSE=$(curl -s "$DEPLOYMENT_URL/health")
    if [ $? -eq 0 ]; then
        echo "✅ API is healthy!"
        echo "📊 Health response: $HEALTH_RESPONSE"
    else
        echo "⚠️  API health check failed"
    fi
    
    echo ""
    echo "📝 Next steps:"
    echo "1. Update your website integration with this URL:"
    echo "   $DEPLOYMENT_URL"
    echo ""
    echo "2. Test the chatbot by visiting:"
    echo "   $DEPLOYMENT_URL/docs"
    echo ""
    echo "3. Add the integration code to your website"
    echo ""
    echo "🔧 To view logs:"
    echo "   railway logs"
    echo ""
    echo "🔄 To redeploy:"
    echo "   railway up"
    
else
    echo "❌ Failed to get deployment URL"
    echo "Please check Railway dashboard for the URL"
fi

echo ""
echo "✨ Deployment script completed!" 