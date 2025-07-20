# Deploy Izocrete Chatbot to Render

## 🚀 Quick Deployment Guide

Since Railway was having issues, let's deploy to Render instead. Render is often more reliable for Python applications.

## Step 1: Go to Render

1. Visit [https://render.com](https://render.com)
2. Sign up or log in with your GitHub account

## Step 2: Create New Web Service

1. Click "New +" button
2. Select "Web Service"
3. Connect your GitHub repository: `DarioDastan/ChatBotAI`
4. Select the `clean-main` branch

## Step 3: Configure the Service

Use these settings:

- **Name**: `izocrete-chatbot`
- **Environment**: `Python`
- **Build Command**: `pip install -r requirements-light.txt`
- **Start Command**: `uvicorn chat_api_light:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`

## Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete (usually 2-3 minutes)
3. Copy the deployment URL (e.g., `https://izocrete-chatbot.onrender.com`)

## Step 5: Test Your API

Test the deployment by visiting:
- Health check: `https://your-app-name.onrender.com/health`
- API docs: `https://your-app-name.onrender.com/docs`

## Step 6: Integrate with Your Website

Once deployed, add this code to your website:

```html
<!-- Add this before closing </body> tag -->
<script src="https://your-website.com/izocrete-chatbot-widget.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Replace with your Render URL
        const API_URL = 'https://your-app-name.onrender.com';
        
        initIzocreteChatbot(API_URL, {
            position: 'bottom-right',
            theme: 'light',
            primaryColor: '#667eea',
            accentColor: '#764ba2',
            showOnLoad: false,
            welcomeMessage: '👋 Hello! I\'m your Izocrete AI assistant. Ask me anything about our products, technical specifications, installation, or benefits!'
        });
    });
</script>
```

## 🎯 What You'll Get

After deployment, you'll have:
- ✅ A working chatbot API
- ✅ Health monitoring
- ✅ Automatic scaling
- ✅ HTTPS enabled
- ✅ Easy integration with your website

## 🔧 Troubleshooting

If deployment fails:
1. Check the build logs in Render dashboard
2. Make sure all files are committed to GitHub
3. Verify the requirements-light.txt file is present
4. Check that chat_api_light.py exists

## 📞 Support

If you need help:
1. Check the build logs in Render
2. Test the API locally first
3. Make sure your GitHub repository is public

Your chatbot will be live and ready to integrate with your website! 🎉 