# Izocrete AI Chatbot

An AI-powered chatbot for Izocrete construction products, built with LangChain, FastAPI, and Chroma vector database.

## Features

- **Retrieval-based AI**: Uses semantic search to find relevant Q&A pairs
- **FastAPI Backend**: RESTful API with streaming support
- **Vector Database**: Chroma for efficient similarity search
- **Conversation Memory**: Maintains chat history across sessions
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **Streaming Responses**: Real-time chat responses
- **Health Checks**: Built-in monitoring and health endpoints

## Project Structure

```
├── ingest.py              # Q&A pair ingestion script
├── chatbot.py             # Core chatbot logic
├── chat_api.py            # FastAPI server
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker container definition
├── docker-compose.yml    # Docker Compose configuration
├── env_example.txt       # Environment variables template
├── README.md             # This file
├── izocrete_qa_pairs.json      # Q&A pairs (batch 1)
└── izocrete_qa_pairs_2.json   # Q&A pairs (batch 2)
```

## Quick Start

### 1. Prerequisites

- Python 3.11+
- Anthropic API key (or OpenAI API key)
- Docker (optional, for containerized deployment)

### 2. Local Development Setup

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Set Environment Variables
```bash
cp env_example.txt .env
# Edit .env and add your API key (Anthropic or OpenAI)
```

#### Ingest Q&A Pairs
```bash
python ingest.py
```

#### Start the API Server
```bash
python chat_api.py
```

The API will be available at `http://localhost:8000`

### 3. API Hosting for Website Integration

For integrating with your website, deploy the API to a hosting service:

#### Option 1: Railway (Recommended)
```bash
# 1. Push your code to GitHub
git add .
git commit -m "Add chatbot API"
git push origin main

# 2. Go to railway.app and connect your repository
# 3. Add environment variables:
#    ANTHROPIC_API_KEY=your_api_key_here
#    LLM_PROVIDER=anthropic
# 4. Deploy automatically
```

#### Option 2: Render
```bash
# 1. Push to GitHub
# 2. Go to render.com and create a new Web Service
# 3. Connect your repository
# 4. Set environment variables
# 5. Deploy
```

See `DEPLOYMENT.md` for detailed instructions on all hosting options.

### 4. Docker Deployment (Alternative)

#### Using Docker Only
```bash
# Build the image
docker build -t izocrete-chatbot .

# Run the container
docker run -p 8000:8000 -e OPENAI_API_KEY=your_api_key_here izocrete-chatbot
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Chat
```bash
POST /chat
{
  "question": "What is Izocrete?",
  "stream": false,
  "temperature": 0.7
}
```

### Streaming Chat
```bash
POST /chat/stream
{
  "question": "What are the benefits of Izocrete blocks?",
  "stream": true
}
```

### Chat History
```bash
GET /chat/history
DELETE /chat/history
```

### Q&A Pairs Info
```bash
GET /qa-pairs
```

## Website Integration

### Quick Integration

1. **Include the client files** in your website:
```html
<link rel="stylesheet" href="chatbot-styles.css">
<script src="chatbot-client.js"></script>
```

2. **Add a container** for the chatbot:
```html
<div id="chatbot-widget"></div>
```

3. **Initialize the chatbot**:
```javascript
const chatbotUI = new IzocreteChatbotUI('https://your-api-url.railway.app', 'chatbot-widget');
```

### Complete Example

See `example-integration.html` for a full integration example.

### Advanced Usage

```javascript
// Custom chatbot instance
const chatbot = new IzocreteChatbot('https://your-api-url.railway.app');

// Send a message
const response = await chatbot.chat('What is Izocrete?');
console.log(response.answer);

// Stream response
await chatbot.chatStream('Tell me about thermal conductivity', (chunk) => {
    console.log('Received chunk:', chunk);
});

// Check API health
const health = await chatbot.healthCheck();
console.log('API status:', health.status);
```

## Usage Examples

### Python Client
```python
import requests

# Chat with the bot
response = requests.post("http://localhost:8000/chat", json={
    "question": "What is the thermal conductivity of Izocrete?",
    "stream": False
})

print(response.json()["answer"])
```

### cURL Examples
```bash
# Basic chat
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Izocrete?", "stream": false}'

# Health check
curl "http://localhost:8000/health"

# Get Q&A pairs info
curl "http://localhost:8000/qa-pairs"
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `LLM_MODEL` | LLM model name | `gpt-3.5-turbo` |
| `TEMPERATURE` | Response creativity | `0.7` |
| `MAX_TOKENS` | Maximum response length | `1000` |
| `EMBEDDING_MODEL` | Embedding model | `all-MiniLM-L6-v2` |
| `VECTOR_STORE_PATH` | Vector store directory | `./chroma_db` |

### Vector Store

The system uses Chroma as the vector database. The vector store is created during ingestion and persists the embeddings for fast retrieval.

### LLM Configuration

The chatbot uses OpenAI's GPT models by default, but can be easily modified to use other providers like Anthropic Claude.

## Development

### Adding New Q&A Pairs

1. Add new Q&A pairs to the JSON files
2. Run the ingestion script:
   ```bash
   python ingest.py
   ```

### Customizing the Chatbot

- Modify `chatbot.py` to change the retrieval logic
- Update `chat_api.py` to add new endpoints
- Customize prompts in the `IzocreteChatbot` class

### Testing

```bash
# Test the API
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the benefits of Izocrete?"}'
```

## Monitoring

### Health Check
The `/health` endpoint provides:
- API status
- Vector store availability
- LLM availability

### Logging
The application logs:
- Ingestion progress
- Chat requests
- Errors and warnings

## Troubleshooting

### Common Issues

1. **Vector store not found**
   - Run `python ingest.py` first
   - Check that JSON files exist

2. **OpenAI API errors**
   - Verify your API key is set correctly
   - Check your OpenAI account balance

3. **Docker issues**
   - Ensure Docker is running
   - Check container logs: `docker-compose logs`

### Debug Mode

Set `LOG_LEVEL=DEBUG` in your environment variables for detailed logging.

## Production Deployment

### Security Considerations

1. Set appropriate CORS origins in production
2. Use environment variables for sensitive data
3. Implement rate limiting
4. Add authentication if needed

### Scaling

- The vector store can handle thousands of Q&A pairs
- Consider using a production-grade vector database for large datasets
- Implement caching for frequently asked questions

## License

This project is for internal use by Izocrete.

## Support

For issues and questions, please check the logs and health endpoints first.
