#!/bin/bash

# Izocrete Chatbot Deployment Script
# This script helps you deploy your chatbot API to Railway

echo "🚀 Izocrete Chatbot Deployment Script"
echo "====================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    exit 1
fi

# Check if vector store exists
if [ ! -d "chroma_db" ]; then
    echo "⚠️  Vector store not found. Running ingestion..."
    python ingest.py
    if [ $? -ne 0 ]; then
        echo "❌ Ingestion failed. Please check your setup."
        exit 1
    fi
fi

# Check if API key is set
if [ -z "$ANTHROPIC_API_KEY" ] && [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  No API key found in environment variables."
    echo "Please set one of the following:"
    echo "   export ANTHROPIC_API_KEY=your_key_here"
    echo "   export OPENAI_API_KEY=your_key_here"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if all required files exist
echo "📋 Checking required files..."
required_files=("chat_api.py" "chatbot.py" "requirements.txt" "Dockerfile")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done
echo "✅ All required files found"

# Check if we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  You're not on the main branch (currently on $current_branch)"
    read -p "Do you want to switch to main? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
    fi
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 You have uncommitted changes:"
    git status --short
    echo ""
    read -p "Do you want to commit them? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
    else
        echo "❌ Please commit your changes before deploying"
        exit 1
    fi
fi

# Push to remote
echo "📤 Pushing to remote repository..."
git push origin main
if [ $? -ne 0 ]; then
    echo "❌ Failed to push to remote. Please check your git setup."
    exit 1
fi

echo ""
echo "✅ Code pushed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Go to https://railway.app"
echo "2. Sign up/login and create a new project"
echo "3. Connect your GitHub repository"
echo "4. Add environment variables:"
echo "   - ANTHROPIC_API_KEY=your_key_here"
echo "   - LLM_PROVIDER=anthropic"
echo "   - LLM_MODEL=claude-3-sonnet-20240229"
echo "5. Deploy!"
echo ""
echo "🔗 Your API will be available at: https://your-app-name.railway.app"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md" 