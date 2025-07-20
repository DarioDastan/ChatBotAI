/**
 * Izocrete AI Chatbot Client
 * 
 * A simple JavaScript client for integrating with the Izocrete AI Chatbot API.
 * 
 * Usage:
 * const chatbot = new IzocreteChatbot('https://your-api-url.railway.app');
 * const response = await chatbot.chat('What is Izocrete?');
 */

class IzocreteChatbot {
    constructor(apiUrl, options = {}) {
        this.apiUrl = apiUrl;
        this.options = {
            timeout: 30000,
            ...options
        };
        this.conversationHistory = [];
    }

    /**
     * Send a chat message to the API
     * @param {string} question - The question to ask
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} The response from the chatbot
     */
    async chat(question, options = {}) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: question,
                stream: options.stream || false,
                temperature: options.temperature || 0.7
            }),
            timeout: this.options.timeout
        };

        try {
            const response = await fetch(`${this.apiUrl}/chat`, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Add to conversation history
            this.conversationHistory.push({
                question: question,
                answer: data.answer,
                timestamp: new Date().toISOString()
            });

            return data;
        } catch (error) {
            console.error('Chatbot API error:', error);
            throw error;
        }
    }

    /**
     * Stream chat response (for real-time typing effect)
     * @param {string} question - The question to ask
     * @param {Function} onChunk - Callback for each chunk of response
     * @returns {Promise<Object>} The complete response
     */
    async chatStream(question, onChunk) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: question,
                stream: true
            })
        };

        try {
            const response = await fetch(`${this.apiUrl}/chat/stream`, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullAnswer = '';

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        
                        if (data === '[DONE]') {
                            break;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                fullAnswer += parsed.content;
                                if (onChunk) {
                                    onChunk(parsed.content);
                                }
                            }
                        } catch (e) {
                            // Ignore parsing errors
                        }
                    }
                }
            }

            return {
                answer: fullAnswer,
                question: question,
                sources: []
            };
        } catch (error) {
            console.error('Streaming chat error:', error);
            throw error;
        }
    }

    /**
     * Get conversation history
     * @returns {Promise<Array>} The conversation history
     */
    async getHistory() {
        try {
            const response = await fetch(`${this.apiUrl}/chat/history`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.history || [];
        } catch (error) {
            console.error('Error getting history:', error);
            return this.conversationHistory;
        }
    }

    /**
     * Clear conversation history
     * @returns {Promise<Object>} Success response
     */
    async clearHistory() {
        try {
            const response = await fetch(`${this.apiUrl}/chat/history`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.conversationHistory = [];
            return await response.json();
        } catch (error) {
            console.error('Error clearing history:', error);
            throw error;
        }
    }

    /**
     * Check if the API is healthy
     * @returns {Promise<Object>} Health status
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.apiUrl}/health`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Health check error:', error);
            throw error;
        }
    }

    /**
     * Get information about available Q&A pairs
     * @returns {Promise<Object>} Q&A pairs information
     */
    async getQAPairs() {
        try {
            const response = await fetch(`${this.apiUrl}/qa-pairs`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting QA pairs:', error);
            throw error;
        }
    }
}

// Example usage and integration helpers
class IzocreteChatbotUI {
    constructor(apiUrl, containerId, options = {}) {
        this.chatbot = new IzocreteChatbot(apiUrl, options);
        this.container = document.getElementById(containerId);
        this.options = {
            showTypingIndicator: true,
            autoScroll: true,
            ...options
        };
        
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('Container not found:', this.containerId);
            return;
        }

        this.createChatInterface();
        this.bindEvents();
    }

    createChatInterface() {
        this.container.innerHTML = `
            <div class="izocrete-chatbot">
                <div class="chat-header">
                    <h3>Izocrete AI Assistant</h3>
                    <button class="clear-btn" onclick="this.chatbotUI.clearHistory()">Clear</button>
                </div>
                <div class="chat-messages" id="chat-messages"></div>
                <div class="chat-input-container">
                    <input type="text" id="chat-input" placeholder="Ask about Izocrete products..." />
                    <button id="send-btn">Send</button>
                </div>
            </div>
        `;

        this.messagesContainer = document.getElementById('chat-messages');
        this.input = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('send-btn');
    }

    bindEvents() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        const question = this.input.value.trim();
        if (!question) return;

        // Clear input
        this.input.value = '';

        // Add user message
        this.addMessage('user', question);

        // Show typing indicator
        if (this.options.showTypingIndicator) {
            this.showTypingIndicator();
        }

        try {
            // Send to API
            const response = await this.chatbot.chat(question);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add bot response
            this.addMessage('bot', response.answer);
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('error', 'Sorry, I encountered an error. Please try again.');
            console.error('Chat error:', error);
        }
    }

    addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        
        if (this.options.autoScroll) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<div class="message-content">Typing...</div>';
        this.messagesContainer.appendChild(typingDiv);
        
        if (this.options.autoScroll) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async clearHistory() {
        try {
            await this.chatbot.clearHistory();
            this.messagesContainer.innerHTML = '';
        } catch (error) {
            console.error('Error clearing history:', error);
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IzocreteChatbot, IzocreteChatbotUI };
} 