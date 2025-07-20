/**
 * Izocrete AI Chatbot Widget
 * A floating chat widget for easy integration into any website
 * 
 * Usage:
 * 1. Include this script in your HTML
 * 2. Call initIzocreteChatbot('your-api-url') to start the widget
 */

(function() {
    'use strict';
    
    // Configuration
    let config = {
        apiUrl: '',
        position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
        theme: 'light', // light, dark
        primaryColor: '#667eea',
        accentColor: '#764ba2',
        showOnLoad: false,
        welcomeMessage: '👋 Hello! I\'m your Izocrete AI assistant. Ask me anything about our products, technical specifications, installation, or benefits!'
    };
    
    // Widget state
    let isOpen = false;
    let isMinimized = false;
    let conversationHistory = [];
    
    // DOM elements
    let widgetContainer = null;
    let chatMessages = null;
    let chatInput = null;
    let sendButton = null;
    let toggleButton = null;
    
    // Initialize the chatbot widget
    function initIzocreteChatbot(apiUrl, options = {}) {
        config = { ...config, ...options };
        config.apiUrl = apiUrl;
        
        createWidget();
        injectStyles();
        bindEvents();
        
        if (config.showOnLoad) {
            setTimeout(() => {
                toggleChat();
            }, 2000);
        }
    }
    
    // Create the widget HTML
    function createWidget() {
        // Create main container
        widgetContainer = document.createElement('div');
        widgetContainer.id = 'izocrete-chatbot-widget';
        widgetContainer.className = `izocrete-chatbot-widget ${config.position} ${config.theme}`;
        widgetContainer.style.display = 'none';
        
        // Create widget HTML
        widgetContainer.innerHTML = `
            <div class="chatbot-toggle" id="chatbot-toggle">
                <div class="toggle-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="toggle-badge" id="toggle-badge" style="display: none;">1</div>
            </div>
            
            <div class="chatbot-container" id="chatbot-container">
                <div class="chatbot-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="header-text">
                            <h3>Izocrete AI Assistant</h3>
                            <span class="status">Online</span>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="minimize-btn" id="minimize-btn" title="Minimize">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 13H5V11H19V13Z" fill="currentColor"/>
                            </svg>
                        </button>
                        <button class="close-btn" id="close-btn" title="Close">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="welcome-message">
                        <div class="message-content">
                            ${config.welcomeMessage}
                        </div>
                        <div class="message-time">${new Date().toLocaleTimeString()}</div>
                    </div>
                </div>
                
                <div class="chatbot-input-container">
                    <div class="input-wrapper">
                        <input type="text" id="chatbot-input" placeholder="Ask about Izocrete products..." />
                        <button id="chatbot-send" disabled>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(widgetContainer);
        
        // Get references to elements
        chatMessages = document.getElementById('chatbot-messages');
        chatInput = document.getElementById('chatbot-input');
        sendButton = document.getElementById('chatbot-send');
        toggleButton = document.getElementById('chatbot-toggle');
    }
    
    // Inject CSS styles
    function injectStyles() {
        if (document.getElementById('izocrete-chatbot-styles')) {
            return; // Styles already injected
        }
        
        const styles = document.createElement('style');
        styles.id = 'izocrete-chatbot-styles';
        styles.textContent = `
            .izocrete-chatbot-widget {
                position: fixed;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .izocrete-chatbot-widget.bottom-right {
                bottom: 20px;
                right: 20px;
            }
            
            .izocrete-chatbot-widget.bottom-left {
                bottom: 20px;
                left: 20px;
            }
            
            .izocrete-chatbot-widget.top-right {
                top: 20px;
                right: 20px;
            }
            
            .izocrete-chatbot-widget.top-left {
                top: 20px;
                left: 20px;
            }
            
            /* Toggle Button */
            .chatbot-toggle {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, ${config.primaryColor} 0%, ${config.accentColor} 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: all 0.3s ease;
                position: relative;
            }
            
            .chatbot-toggle:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            }
            
            .toggle-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff4757;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }
            
            /* Chat Container */
            .chatbot-container {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
            }
            
            .izocrete-chatbot-widget.open .chatbot-container {
                opacity: 1;
                transform: translateY(0);
            }
            
            /* Header */
            .chatbot-header {
                background: linear-gradient(135deg, ${config.primaryColor} 0%, ${config.accentColor} 100%);
                color: white;
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .header-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .header-text h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .header-text .status {
                font-size: 12px;
                opacity: 0.8;
            }
            
            .header-actions {
                display: flex;
                gap: 8px;
            }
            
            .header-actions button {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 6px;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .header-actions button:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            /* Messages */
            .chatbot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                background: #f8f9fa;
            }
            
            .welcome-message {
                margin-bottom: 12px;
            }
            
            .message {
                margin-bottom: 12px;
                display: flex;
                flex-direction: column;
            }
            
            .user-message {
                align-items: flex-end;
            }
            
            .bot-message {
                align-items: flex-start;
            }
            
            .message-content {
                max-width: 80%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
                word-wrap: break-word;
            }
            
            .user-message .message-content {
                background: ${config.primaryColor};
                color: white;
                border-bottom-right-radius: 4px;
            }
            
            .bot-message .message-content {
                background: white;
                color: #333;
                border: 1px solid #e1e5e9;
                border-bottom-left-radius: 4px;
            }
            
            .message-time {
                font-size: 11px;
                color: #6c757d;
                margin-top: 4px;
                padding: 0 4px;
            }
            
            .typing-indicator .message-content {
                background: #e9ecef;
                color: #6c757d;
                font-style: italic;
            }
            
            /* Input */
            .chatbot-input-container {
                padding: 16px;
                background: white;
                border-top: 1px solid #e1e5e9;
            }
            
            .input-wrapper {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            
            #chatbot-input {
                flex: 1;
                padding: 12px 16px;
                border: 1px solid #e1e5e9;
                border-radius: 24px;
                font-size: 14px;
                outline: none;
                transition: border-color 0.2s;
            }
            
            #chatbot-input:focus {
                border-color: ${config.primaryColor};
            }
            
            #chatbot-send {
                background: ${config.primaryColor};
                color: white;
                border: none;
                padding: 12px;
                border-radius: 50%;
                cursor: pointer;
                transition: background 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            #chatbot-send:hover:not(:disabled) {
                background: ${config.accentColor};
            }
            
            #chatbot-send:disabled {
                background: #6c757d;
                cursor: not-allowed;
            }
            
            /* Scrollbar */
            .chatbot-messages::-webkit-scrollbar {
                width: 6px;
            }
            
            .chatbot-messages::-webkit-scrollbar-track {
                background: #f1f1f1;
            }
            
            .chatbot-messages::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 3px;
            }
            
            .chatbot-messages::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
            }
            
            /* Dark theme */
            .izocrete-chatbot-widget.dark .chatbot-container {
                background: #2d3748;
            }
            
            .izocrete-chatbot-widget.dark .chatbot-messages {
                background: #1a202c;
            }
            
            .izocrete-chatbot-widget.dark .bot-message .message-content {
                background: #4a5568;
                color: #e2e8f0;
                border-color: #4a5568;
            }
            
            .izocrete-chatbot-widget.dark #chatbot-input {
                background: #4a5568;
                color: #e2e8f0;
                border-color: #4a5568;
            }
            
            /* Responsive */
            @media (max-width: 480px) {
                .chatbot-container {
                    width: calc(100vw - 40px);
                    height: 400px;
                }
                
                .izocrete-chatbot-widget.bottom-right,
                .izocrete-chatbot-widget.bottom-left {
                    bottom: 10px;
                }
                
                .izocrete-chatbot-widget.bottom-right {
                    right: 10px;
                }
                
                .izocrete-chatbot-widget.bottom-left {
                    left: 10px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    // Bind event listeners
    function bindEvents() {
        // Toggle chat
        toggleButton.addEventListener('click', toggleChat);
        
        // Close button
        document.getElementById('close-btn').addEventListener('click', closeChat);
        
        // Minimize button
        document.getElementById('minimize-btn').addEventListener('click', minimizeChat);
        
        // Send message
        sendButton.addEventListener('click', sendMessage);
        
        // Enter key in input
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Input change
        chatInput.addEventListener('input', () => {
            sendButton.disabled = !chatInput.value.trim();
        });
    }
    
    // Toggle chat visibility
    function toggleChat() {
        if (isOpen) {
            closeChat();
        } else {
            openChat();
        }
    }
    
    // Open chat
    function openChat() {
        isOpen = true;
        widgetContainer.classList.add('open');
        chatInput.focus();
        
        // Hide badge
        document.getElementById('toggle-badge').style.display = 'none';
    }
    
    // Close chat
    function closeChat() {
        isOpen = false;
        widgetContainer.classList.remove('open');
    }
    
    // Minimize chat
    function minimizeChat() {
        isMinimized = !isMinimized;
        const container = document.getElementById('chatbot-container');
        
        if (isMinimized) {
            container.style.height = '60px';
            container.style.overflow = 'hidden';
        } else {
            container.style.height = '500px';
            container.style.overflow = 'hidden';
        }
    }
    
    // Send message
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage('user', message);
        chatInput.value = '';
        sendButton.disabled = true;
        
        // Show typing indicator
        const typingId = showTypingIndicator();
        
        try {
            // Send to API
            const response = await fetch(`${config.apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: message,
                    stream: false,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Hide typing indicator
            hideTypingIndicator(typingId);
            
            // Add bot response
            addMessage('bot', data.answer);
            
            // Add to history
            conversationHistory.push({
                question: message,
                answer: data.answer,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Chatbot API error:', error);
            hideTypingIndicator(typingId);
            addMessage('error', 'Sorry, I encountered an error. Please try again.');
        }
    }
    
    // Add message to chat
    function addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        const typingId = 'typing-' + Date.now();
        typingDiv.id = typingId;
        typingDiv.className = 'message bot-message typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-content">Typing...</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        chatMessages.appendChild(typingDiv);
        scrollToBottom();
        
        return typingId;
    }
    
    // Hide typing indicator
    function hideTypingIndicator(typingId) {
        const typingElement = document.getElementById(typingId);
        if (typingElement) {
            typingElement.remove();
        }
    }
    
    // Scroll to bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Show notification badge
    function showNotification() {
        if (!isOpen) {
            document.getElementById('toggle-badge').style.display = 'flex';
        }
    }
    
    // Public API
    window.initIzocreteChatbot = initIzocreteChatbot;
    window.showChatNotification = showNotification;
    
})(); 