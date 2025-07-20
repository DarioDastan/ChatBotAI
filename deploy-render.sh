#!/bin/bash

# Izocrete Chatbot Deployment Script for Render
# This script helps deploy the chatbot API to Render

echo "🚀 Izocrete Chatbot Deployment Script for Render"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "chat_api_light.py" ]; then
    echo "❌ chat_api_light.py not found in current directory"
    echo "Please run this script from the ChatBotAI directory"
    exit 1
fi

echo "📋 Checking current status..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
fi

echo ""
echo "📝 Render Deployment Instructions:"
echo "=================================="
echo ""
echo "1. Go to https://render.com and sign up/login"
echo ""
echo "2. Click 'New +' and select 'Web Service'"
echo ""
echo "3. Connect your GitHub repository (you'll need to push this to GitHub first)"
echo ""
echo "4. Configure the service:"
echo "   - Name: izocrete-chatbot"
echo "   - Environment: Python"
echo "   - Build Command: pip install -r requirements-light.txt"
echo "   - Start Command: uvicorn chat_api_light:app --host 0.0.0.0 --port \$PORT"
echo ""
echo "5. Click 'Create Web Service'"
echo ""
echo "6. Wait for deployment to complete"
echo ""
echo "7. Get your deployment URL from the Render dashboard"
echo ""

# Check if we can push to GitHub
if git remote -v | grep -q "origin"; then
    echo "✅ Git remote found. You can push to GitHub with:"
    echo "   git push origin main"
    echo ""
else
    echo "📝 To deploy to Render, you'll need to:"
    echo "1. Create a GitHub repository"
    echo "2. Add it as remote: git remote add origin <your-repo-url>"
    echo "3. Push your code: git push origin main"
    echo "4. Connect the GitHub repo to Render"
    echo ""
fi

echo "🔍 Testing local API..."
echo "Starting local server for testing..."

# Test the API locally
python -m uvicorn chat_api_light:app --host 0.0.0.0 --port 8000 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test health endpoint
HEALTH_RESPONSE=$(curl -s http://localhost:8000/health)
if [ $? -eq 0 ]; then
    echo "✅ Local API is working!"
    echo "📊 Health response: $HEALTH_RESPONSE"
else
    echo "❌ Local API test failed"
fi

# Kill the test server
kill $SERVER_PID 2>/dev/null

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Add chatbot API'"
echo "   git push origin main"
echo ""
echo "2. Deploy to Render using the instructions above"
echo ""
echo "3. Once deployed, get your API URL and update the integration code:"
echo ""
echo "   const API_URL = 'https://your-app-name.onrender.com';"
echo ""
echo "4. Test the deployed API:"
echo "   curl https://your-app-name.onrender.com/health"
echo ""

echo "✨ Deployment script completed!" 