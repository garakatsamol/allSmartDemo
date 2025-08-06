import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, delay } from 'rxjs/operators';

export interface ChatRequest {
    message: string;
    timestamp: string;
    userId?: string;
    sessionId?: string;
}

export interface ChatResponse {
    reply: string;
    timestamp: string;
    confidence?: number;
    metadata?: any;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    // Production webhook URL
    private webhookUrl = 'https://locutus.app.n8n.cloud/webhook-test/e50506fd-9051-46c2-ab67-108db865a79d';
    private useCorsProxy = true; // Enable CORS proxy due to CORS issues
    private defaultHeaders = new HttpHeaders({
        'Content-Type': 'application/json'
    });

    constructor(private http: HttpClient) {}

    /**
     * Set the production webhook URL
     * @param url The webhook URL from your n8n workflow
     */
    setWebhookUrl(url: string): void {
        this.webhookUrl = url;
        console.log('Production webhook URL updated:', url);
    }

    /**
     * Get the current webhook URL
     * @returns Current webhook URL
     */
    getWebhookUrl(): string {
        return this.webhookUrl;
    }

    /**
     * Send a message to the n8n assistant
     * @param message The user's message
     * @param userId Optional user identifier
     * @param sessionId Optional session identifier
     * @returns Observable with the assistant's response
     */
    sendMessage(message: string, userId?: string, sessionId?: string): Observable<ChatResponse> {
        if (!this.webhookUrl) {
            console.warn('No webhook URL configured');
            return this.getFallbackResponse(message);
        }

        const payload: ChatRequest = {
            message: message.trim(),
            timestamp: new Date().toISOString(),
            userId: userId,
            sessionId: sessionId
        };

        console.log('Sending message to webhook:', this.webhookUrl);
        console.log('Payload:', JSON.stringify(payload, null, 2));
        console.log('CORS proxy enabled:', this.useCorsProxy);

        // Use CORS proxy if enabled
        if (this.useCorsProxy) {
            // Use a CORS proxy that supports POST requests
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(this.webhookUrl);
            
            return this.http.post<any>(proxyUrl, payload, {
                headers: this.defaultHeaders
            }).pipe(
                map(response => {
                    console.log('✅ Received response from n8n via proxy:', response);
                    console.log('Response type:', typeof response);
                    console.log('Response structure:', JSON.stringify(response, null, 2));
                    
                    // Handle array response with output field (your n8n format)
                    if (Array.isArray(response) && response.length > 0 && response[0].output) {
                        console.log('Extracting from array response with output field');
                        const formattedReply = this.formatResponse(response[0].output);
                        return {
                            reply: formattedReply,
                            timestamp: new Date().toISOString()
                        };
                    }
                    
                    // Handle different response formats from n8n
                    if (typeof response === 'string') {
                        console.log('Converting string response to ChatResponse format');
                        const formattedReply = this.formatResponse(response);
                        return {
                            reply: formattedReply,
                            timestamp: new Date().toISOString()
                        };
                    }
                    
                    // If response has a 'reply' field, use it directly
                    if (response && response.reply) {
                        console.log('Using response.reply field');
                        return response;
                    }
                    
                    // If response has a 'message' field, map it to 'reply'
                    if (response && response.message) {
                        console.log('Mapping response.message to reply');
                        const formattedReply = this.formatResponse(response.message);
                        return {
                            reply: formattedReply,
                            timestamp: response.timestamp || new Date().toISOString(),
                            confidence: response.confidence,
                            metadata: response.metadata
                        };
                    }
                    
                    // If response has an 'output' field (single object)
                    if (response && response.output) {
                        console.log('Using response.output field');
                        const formattedReply = this.formatResponse(response.output);
                        return {
                            reply: formattedReply,
                            timestamp: new Date().toISOString()
                        };
                    }
                    
                    // If response is an object but doesn't have expected fields, stringify it
                    if (response && typeof response === 'object') {
                        console.log('Converting object response to string');
                        return {
                            reply: JSON.stringify(response),
                            timestamp: new Date().toISOString()
                        };
                    }
                    
                    // Fallback
                    console.log('Using fallback response format');
                    return {
                        reply: String(response || 'Received response from n8n but could not parse it'),
                        timestamp: new Date().toISOString()
                    };
                }),
                catchError(error => {
                    console.error('Error calling webhook via proxy:', error);
                    console.error('Full error details:', {
                        status: error.status,
                        statusText: error.statusText,
                        url: error.url,
                        message: error.message,
                        error: error.error
                    });
                    return this.getFallbackResponse(message);
                })
            );
        }

        return this.http.post<any>(this.webhookUrl, payload, {
            headers: this.defaultHeaders
        }).pipe(
            map(response => {
                console.log('✅ Received response from n8n directly:', response);
                console.log('Response type:', typeof response);
                console.log('Response structure:', JSON.stringify(response, null, 2));
                
                // Handle array response with output field (your n8n format)
                if (Array.isArray(response) && response.length > 0 && response[0].output) {
                    console.log('Extracting from array response with output field');
                    const formattedReply = this.formatResponse(response[0].output);
                    return {
                        reply: formattedReply,
                        timestamp: new Date().toISOString()
                    };
                }
                
                // Handle different response formats from n8n
                if (typeof response === 'string') {
                    console.log('Converting string response to ChatResponse format');
                    const formattedReply = this.formatResponse(response);
                    return {
                        reply: formattedReply,
                        timestamp: new Date().toISOString()
                    };
                }
                
                // If response has a 'reply' field, use it directly
                if (response && response.reply) {
                    console.log('Using response.reply field');
                    return response;
                }
                
                // If response has a 'message' field, map it to 'reply'
                if (response && response.message) {
                    console.log('Mapping response.message to reply');
                    const formattedReply = this.formatResponse(response.message);
                    return {
                        reply: formattedReply,
                        timestamp: response.timestamp || new Date().toISOString(),
                        confidence: response.confidence,
                        metadata: response.metadata
                    };
                }
                
                // If response has an 'output' field (single object)
                if (response && response.output) {
                    console.log('Using response.output field');
                    const formattedReply = this.formatResponse(response.output);
                    return {
                        reply: formattedReply,
                        timestamp: new Date().toISOString()
                    };
                }
                
                // If response is an object but doesn't have expected fields, stringify it
                if (response && typeof response === 'object') {
                    console.log('Converting object response to string');
                    return {
                        reply: JSON.stringify(response),
                        timestamp: new Date().toISOString()
                    };
                }
                
                // Fallback
                console.log('Using fallback response format');
                return {
                    reply: String(response || 'Received response from n8n but could not parse it'),
                    timestamp: new Date().toISOString()
                };
            }),
            catchError(error => {
                console.error('Error calling webhook:', error);
                console.error('Full error details:', {
                    status: error.status,
                    statusText: error.statusText,
                    url: error.url,
                    message: error.message,
                    error: error.error
                });
                
                // Provide more specific error messages
                if (error.status === 0) {
                    console.error('CORS error detected. Your n8n workflow needs proper CORS headers.');
                    console.error('Add these headers to your "Respond to Webhook" node:');
                    console.error('{"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}');
                } else if (error.status === 404) {
                    console.error('Webhook not found. Check your n8n webhook URL and ensure the workflow is active.');
                } else if (error.status === 500) {
                    console.error('Server error in n8n workflow. Check your workflow execution logs.');
                }
                
                return this.getFallbackResponse(message);
            })
        );
    }

    /**
     * Test the connection to the n8n webhook
     * @returns Observable with connection status
     */
    testConnection(): Observable<boolean> {
        if (!this.webhookUrl) {
            console.warn('No webhook URL configured');
            return of(false);
        }

        console.log('Testing connection to webhook:', this.webhookUrl);

        // Use proxy for testing if enabled
        if (this.useCorsProxy) {
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(this.webhookUrl);
            const testPayload: ChatRequest = {
                message: 'connection_test',
                timestamp: new Date().toISOString()
            };

            return this.http.post(proxyUrl, testPayload, {
                headers: this.defaultHeaders
            }).pipe(
                map(() => {
                    console.log('✅ Connection test successful');
                    return true;
                }),
                catchError((error) => {
                    console.error('❌ Connection test via proxy failed:', error);
                    return of(false);
                })
            );
        }

        const testPayload: ChatRequest = {
            message: 'connection_test',
            timestamp: new Date().toISOString()
        };

        return this.http.post(this.webhookUrl, testPayload, {
            headers: this.defaultHeaders
        }).pipe(
            map(() => {
                console.log('✅ Connection test successful');
                return true;
            }),
            catchError((error) => {
                console.error('❌ Connection test failed:', error);
                return of(false);
            })
        );
    }

    /**
     * Enable or disable CORS proxy for development
     * @param enable Whether to use CORS proxy
     */
    setCorsProxy(enable: boolean): void {
        this.useCorsProxy = enable;
    }

    /**
     * Check if CORS proxy is enabled
     * @returns Current CORS proxy status
     */
    isCorsProxyEnabled(): boolean {
        return this.useCorsProxy;
    }

    /**
     * Provide a fallback response when n8n is not available
     * @param userMessage The user's message
     * @returns Observable with a fallback response
     */
    private getFallbackResponse(userMessage: string): Observable<ChatResponse> {
        const lowerMessage = userMessage.toLowerCase();
        let reply = '';

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            reply = 'Hello! I\'m currently running in demo mode. Please configure your n8n webhook URL to connect to your AI assistant. In the meantime, I can provide basic responses!';
        } else if (lowerMessage.includes('help')) {
            reply = 'I\'m here to help! Currently in demo mode. To get full AI capabilities:\n\n1. Configure your n8n webhook URL\n2. Ensure your n8n workflow has proper CORS headers\n3. Or enable the CORS proxy option for development\n\nFor now, I can chat with you using basic responses!';
        } else if (lowerMessage.includes('configure') || lowerMessage.includes('setup') || lowerMessage.includes('cors')) {
            reply = '🔧 To configure this chat with your n8n assistant:\n\n1. Create a webhook trigger in your n8n workflow\n2. Add your AI processing nodes (OpenAI, Claude, etc.)\n3. Add a "Respond to Webhook" node with CORS headers:\n   ```\n   "Access-Control-Allow-Origin": "*"\n   "Access-Control-Allow-Methods": "POST, OPTIONS"\n   "Access-Control-Allow-Headers": "Content-Type"\n   ```\n4. Use the webhook URL in this chat interface';
        } else if (lowerMessage.includes('weather')) {
            reply = '🌤️ I\'d love to help with weather information! Once you connect your n8n AI assistant, I\'ll be able to provide real-time weather data. For now, I hope you\'re having a great day!';
        } else if (lowerMessage.includes('time') || lowerMessage.includes('date')) {
            const now = new Date();
            reply = `🕐 The current time is ${now.toLocaleTimeString()} and today is ${now.toLocaleDateString()}. Once connected to your n8n AI, I can provide much more detailed time and date information!`;
        } else if (lowerMessage.includes('thank')) {
            reply = 'You\'re very welcome! I\'m happy to help. Once you connect your n8n AI assistant, I\'ll be even more helpful! Is there anything else you\'d like to know?';
        } else if (lowerMessage.includes('test') || lowerMessage.includes('demo')) {
            reply = '✅ Demo mode is working perfectly! This shows the chat interface is functioning. When you connect your n8n webhook, you\'ll get real AI-powered responses instead of these demo messages.';
        } else {
            const responses = [
                `Interesting question about "${userMessage}"! In demo mode, I can acknowledge your message. Connect your n8n AI assistant for intelligent responses! 🤖`,
                `I received your message: "${userMessage}". This is a demo response - configure your n8n webhook to get real AI interactions! 🚀`,
                `Thanks for saying "${userMessage}"! I\'m running in demo mode. Set up your n8n workflow to unlock full AI capabilities! ⚡`,
                `You asked about "${userMessage}". Demo mode active - connect your n8n AI assistant for smart responses! 🎯`,
            ];
            reply = responses[Math.floor(Math.random() * responses.length)];
        }

        // Simulate typing delay
        return of({
            reply: this.formatResponse(reply),
            timestamp: new Date().toISOString(),
            confidence: 0.8
        }).pipe(
            delay(800 + Math.random() * 1500) // Random delay between 0.8-2.3 seconds
        );
    }

    /**
     * Format the response text to improve readability
     * @param text The raw response text
     * @returns Formatted text with proper line breaks and structure
     */
    private formatResponse(text: string): string {
        if (!text || typeof text !== 'string') {
            return String(text || '');
        }

        // Clean up the text
        let formatted = text.trim();

        // Handle numbered lists (improve spacing)
        formatted = formatted.replace(/(\d+\.\s)/g, '\n$1');

        // Handle bullet points
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove markdown bold
        formatted = formatted.replace(/([🔸🔹•·\-\*])\s*([A-Z])/g, '\n$1 $2'); // Add line breaks before bullet points

        // Handle price information (Greek format)
        formatted = formatted.replace(/(\d+,\d+\s*€)/g, ' $1');

        // Handle links - make them more readable
        formatted = formatted.replace(/\[Προβολή\]\((https?:\/\/[^\)]+)\)/g, '\n🔗 Δείτε περισσότερα: $1');

        // Handle emojis - add space after them
        formatted = formatted.replace(/([\u{1F300}-\u{1F9FF}])([A-Za-zΑ-Ωα-ωάέήίόύώ])/gu, '$1 $2');

        // Clean up multiple line breaks
        formatted = formatted.replace(/\n{3,}/g, '\n\n');

        // Remove leading/trailing whitespace
        formatted = formatted.trim();

        return formatted;
    }
}
