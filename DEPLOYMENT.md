# Chatbot API Deployment Guide

This guide covers how to deploy your Izocrete AI Chatbot API to various hosting platforms.

## Prerequisites

1. **Vector Store**: Run `python ingest.py` to create the vector store
2. **API Keys**: Set up your LLM provider API key (Anthropic or OpenAI)
3. **Git Repository**: Push your code to a Git repository

## Option 1: Railway (Recommended)

Railway is the easiest option with a generous free tier.

### Steps:
1. Go to [railway.app](https://railway.app) and sign up
2. Connect your GitHub repository
3. Create a new project
4. Add environment variables:
   - `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY`)
   - `LLM_PROVIDER` (default: "anthropic")
   - `LLM_MODEL` (default: "claude-3-sonnet-20240229")
   - `TEMPERATURE` (default: "0.7")
5. Deploy - Railway will automatically detect the Dockerfile

### Benefits:
- Free tier with 500 hours/month
- Automatic HTTPS
- Easy environment variable management
- Built-in monitoring

## Option 2: Render

Render offers a free tier with some limitations.

### Steps:
1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub repository
3. Create a new Web Service
4. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn chat_api:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3
5. Add environment variables (same as Railway)
6. Deploy

## Option 3: Heroku

Heroku requires a credit card but has a free tier.

### Steps:
1. Install Heroku CLI
2. Create a new Heroku app: `heroku create your-app-name`
3. Add environment variables:
   ```bash
   heroku config:set ANTHROPIC_API_KEY=your_key
   heroku config:set LLM_PROVIDER=anthropic
   ```
4. Deploy: `git push heroku main`

## Option 4: DigitalOcean App Platform

Good for production with reasonable pricing.

### Steps:
1. Go to DigitalOcean App Platform
2. Connect your GitHub repository
3. Configure as a Web Service
4. Set environment variables
5. Deploy

## Option 5: AWS/GCP/Azure

For enterprise/production deployments.

### AWS Elastic Beanstalk:
1. Create a new environment
2. Upload your code
3. Configure environment variables
4. Deploy

### Google Cloud Run:
1. Build and push Docker image
2. Deploy to Cloud Run
3. Set environment variables

## Environment Variables

All platforms need these environment variables:

```bash
# Required - Choose one
ANTHROPIC_API_KEY=your_anthropic_api_key
# OR
OPENAI_API_KEY=your_openai_api_key

# Optional (have defaults)
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-sonnet-20240229
TEMPERATURE=0.7
```

## Testing Your Deployed API

Once deployed, test your API:

```bash
# Health check
curl https://your-app-url.railway.app/health

# Chat endpoint
curl -X POST https://your-app-url.railway.app/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Izocrete?", "stream": false}'
```

## CORS Configuration

Your API is already configured with CORS for web integration:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For production, replace `["*"]` with your website's domain:

```python
allow_origins=["https://your-website.com"]
```

## API Endpoints

Your deployed API will have these endpoints:

- `GET /` - API info
- `GET /health` - Health check
- `POST /chat` - Chat with the bot
- `POST /chat/stream` - Streaming chat
- `GET /chat/history` - Get chat history
- `DELETE /chat/history` - Clear chat history
- `GET /qa-pairs` - Get Q&A pairs info

## Integration with Your Website

Once deployed, your website can call the API:

```javascript
// Example JavaScript integration
async function chatWithBot(question) {
  const response = await fetch('https://your-api-url.railway.app/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: question,
      stream: false
    })
  });
  
  const data = await response.json();
  return data.answer;
}

// Usage
chatWithBot("What is Izocrete?").then(answer => {
  console.log(answer);
});
```

## Monitoring and Logs

- **Railway**: Built-in logs and monitoring
- **Render**: Logs available in dashboard
- **Heroku**: `heroku logs --tail`
- **AWS**: CloudWatch logs

## Troubleshooting

### Common Issues:

1. **Vector store not found**: Ensure you ran `python ingest.py` before deploying
2. **API key errors**: Check environment variables are set correctly
3. **CORS errors**: Verify your website domain is in the allowed origins
4. **Memory issues**: Consider upgrading to a paid plan for larger models

### Debug Commands:

```bash
# Check if API is running
curl https://your-api-url/health

# Test chat endpoint
curl -X POST https://your-api-url/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "test"}'
```

## Cost Considerations

- **Railway**: Free tier (500 hours/month), then $5/month
- **Render**: Free tier (750 hours/month), then $7/month
- **Heroku**: Free tier discontinued, $7/month minimum
- **DigitalOcean**: $5/month minimum

## Security Best Practices

1. Use environment variables for API keys
2. Configure CORS properly for production
3. Use HTTPS (automatic on most platforms)
4. Consider adding rate limiting for production
5. Monitor API usage and costs 