# Izocrete Chatbot Integration Guide

This guide will help you integrate the Izocrete AI chatbot into your existing website at https://izoweb-seven.vercel.app/.

## 🚀 Quick Integration (3 Steps)

### Step 1: Deploy Your Chatbot API

First, deploy your chatbot API to Railway or any other hosting service:

1. **Deploy to Railway:**
   ```bash
   # Clone your repository
   git clone <your-repo-url>
   cd ChatBotAI
   
   # Deploy to Railway
   railway login
   railway init
   railway up
   ```

2. **Get your API URL** (e.g., `https://your-izocrete-chatbot.railway.app`)

### Step 2: Add Chatbot Files to Your Website

Add these files to your website's public directory:

1. **Upload `izocrete-chatbot-widget.js`** to your website's public folder
2. **Or host it on a CDN** and reference it directly

### Step 3: Add Integration Code

Add this code to your website's HTML (before the closing `</body>` tag):

```html
<!-- Chatbot Integration -->
<script src="https://your-website.com/izocrete-chatbot-widget.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Replace with your actual API URL
        const API_URL = 'https://your-izocrete-chatbot.railway.app';
        
        // Initialize the chatbot widget
        initIzocreteChatbot(API_URL, {
            position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
            theme: 'light', // light, dark
            primaryColor: '#667eea',
            accentColor: '#764ba2',
            showOnLoad: false, // Set to true to show chat automatically
            welcomeMessage: '👋 Hello! I\'m your Izocrete AI assistant. Ask me anything about our products, technical specifications, installation, or benefits!'
        });
    });
</script>
```

## 🎨 Customization Options

### Position Options
- `bottom-right` (default)
- `bottom-left`
- `top-right`
- `top-left`

### Theme Options
- `light` (default)
- `dark`

### Color Customization
```javascript
initIzocreteChatbot(API_URL, {
    primaryColor: '#667eea',    // Main brand color
    accentColor: '#764ba2',     // Secondary color
    // ... other options
});
```

### Behavior Options
```javascript
initIzocreteChatbot(API_URL, {
    showOnLoad: false,          // Show chat automatically on page load
    welcomeMessage: 'Custom welcome message...',
    // ... other options
});
```

## 🔧 Advanced Integration

### Trigger Chat from Button Click
```html
<button onclick="showChatNotification()">Ask Our AI Assistant</button>

<script>
    function showChatNotification() {
        if (window.showChatNotification) {
            window.showChatNotification();
        }
    }
</script>
```

### Custom Styling
The widget automatically injects its own styles, but you can override them with CSS:

```css
/* Custom overrides */
.izocrete-chatbot-widget {
    /* Your custom styles */
}

.chatbot-toggle {
    /* Custom toggle button styles */
}
```

## 📱 Mobile Responsiveness

The chatbot widget is fully responsive and will automatically adjust for mobile devices:

- On mobile: Widget becomes full-width with reduced height
- Touch-friendly interface
- Optimized for small screens

## 🔍 Testing Your Integration

1. **Check API Health:**
   ```javascript
   fetch('https://your-api-url/health')
       .then(response => response.json())
       .then(data => console.log('API Health:', data));
   ```

2. **Test Chat Functionality:**
   - Open the chat widget
   - Send a test message
   - Verify response is received

3. **Check Console for Errors:**
   - Open browser developer tools
   - Look for any JavaScript errors

## 🚨 Troubleshooting

### Common Issues:

1. **Widget not appearing:**
   - Check if the script is loaded correctly
   - Verify API URL is correct
   - Check browser console for errors

2. **API not responding:**
   - Verify your API is deployed and running
   - Check CORS settings in your API
   - Test API endpoint directly

3. **Styling conflicts:**
   - The widget uses isolated styles
   - Check for CSS conflicts with your website
   - Use browser dev tools to inspect

### Debug Mode:
```javascript
// Enable debug logging
initIzocreteChatbot(API_URL, {
    debug: true,
    // ... other options
});
```

## 📊 Analytics Integration

Track chatbot usage with Google Analytics:

```javascript
// Track chat interactions
function trackChatEvent(action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: 'chatbot',
            event_label: label
        });
    }
}

// Use in your integration
initIzocreteChatbot(API_URL, {
    onMessageSent: (message) => trackChatEvent('chat_message_sent', 'user_message'),
    onResponseReceived: (response) => trackChatEvent('chat_response_received', 'bot_response')
});
```

## 🔒 Security Considerations

1. **API Security:**
   - Use HTTPS for your API
   - Implement rate limiting
   - Add authentication if needed

2. **CORS Configuration:**
   ```python
   # In your FastAPI app
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://izoweb-seven.vercel.app"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

## 📈 Performance Optimization

1. **Lazy Loading:**
   ```javascript
   // Load chatbot only when needed
   function loadChatbot() {
       if (!window.chatbotLoaded) {
           const script = document.createElement('script');
           script.src = 'izocrete-chatbot-widget.js';
           script.onload = () => initIzocreteChatbot(API_URL);
           document.head.appendChild(script);
           window.chatbotLoaded = true;
       }
   }
   ```

2. **CDN Hosting:**
   - Host the widget file on a CDN for faster loading
   - Use services like Cloudflare, AWS CloudFront, or jsDelivr

## 🎯 Best Practices

1. **User Experience:**
   - Don't show chat automatically on mobile
   - Provide clear call-to-action buttons
   - Test on multiple devices

2. **Content:**
   - Keep welcome messages concise
   - Provide helpful suggestions
   - Update responses regularly

3. **Maintenance:**
   - Monitor API performance
   - Update chatbot responses
   - Test regularly

## 📞 Support

If you need help with integration:

1. Check the troubleshooting section above
2. Review the example files in this repository
3. Test with the provided example HTML file

## 🚀 Deployment Checklist

- [ ] Deploy chatbot API to Railway/Heroku/etc.
- [ ] Get API URL and test health endpoint
- [ ] Upload widget file to your website
- [ ] Add integration code to your HTML
- [ ] Test on desktop and mobile
- [ ] Configure CORS in your API
- [ ] Test chat functionality
- [ ] Add analytics tracking (optional)
- [ ] Deploy to production

Your chatbot should now be fully integrated into your website! 🎉 