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

export interface Product {
    _id: string;
    id: number;
    sku: string;
    title: string;
    url: string;
    price: string;
    oldPrice?: string;
    priceNumeric: number;
    points: string;
    imageUrl: string;
    description: string;
    category: string;
    availability: string;
    extractedAt: string;
    source: string;
    sourceUrl: string;
    pageNumber: number;
    detectionMethod: string;
    elementTagName: string;
    elementClass: string;
}

export interface ChatResponse {
    reply?: string; // For simple text or fallback responses
    intro?: string; // For product responses
    products?: Product[]; // For product responses
    outro?: string; // For product responses
    timestamp?: string;
    confidence?: number;
    metadata?: any;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    // Webhook URLs
    private productionWebhookUrl = 'https://allsmart.app.n8n.cloud/webhook/e50506fd-9051-46c2-ab67-108db865a79d';
    private useCorsProxy = true; // Enable CORS proxy - n8n has CORS misconfiguration (=* instead of *)
    private defaultHeaders = new HttpHeaders({
        'Content-Type': 'application/json'
    });

    constructor(private http: HttpClient) {
        console.log('🚀 ChatService initialized');
        console.log(`📍 Production webhook: ${this.productionWebhookUrl}`);
        console.log(`🌐 CORS proxy enabled: ${this.useCorsProxy}`);
    }

    /**
     * Set the production webhook URL
     * @param url The webhook URL from your n8n workflow
     */
    setWebhookUrl(url: string): void {
        this.productionWebhookUrl = url;
        console.log('Production webhook URL updated:', url);
    }

    /**
     * Set the test webhook URL
     * @param url The test webhook URL from your n8n workflow
     */

    // Removed setTestWebhookUrl (test mode not supported)

    /**
     * Get the current active webhook URL (test or production)
     * @returns Current webhook URL
     */
    getWebhookUrl(): string {
        console.log(`🔗 Current webhook URL (PRODUCTION mode):`, this.productionWebhookUrl);
        return this.productionWebhookUrl;
    }

    /**
     * Get the production webhook URL
     * @returns Production webhook URL
     */

    // getProductionWebhookUrl() is redundant, use getWebhookUrl()

    /**
     * Get the test webhook URL
     * @returns Test webhook URL
     */

    // Removed getTestWebhookUrl (test mode not supported)

    /**
     * Switch between test and production mode
     * @param testMode True for test mode, false for production mode
     */

    // Removed setTestMode (test mode not supported)

    /**
     * Check if currently in test mode
     * @returns True if in test mode, false if in production mode
     */

    // Removed isInTestMode (test mode not supported)

    /**
     * Get current mode as string
     * @returns 'TEST' or 'PRODUCTION'
     */

    // Removed getCurrentMode (test mode not supported)

    /**
     * Send a message to the n8n assistant
     * @param message The user's message
     * @param userId Optional user identifier
     * @param sessionId Optional session identifier
     * @returns Observable with the assistant's response
     */
    sendMessage(message: string, userId?: string, sessionId?: string): Observable<ChatResponse> {

        const webhookUrl = this.getWebhookUrl();
        if (!webhookUrl) {
            console.warn('No webhook URL configured');
            return this.getFallbackResponse(message);
        }

        const payload: ChatRequest = {
            message: message.trim(),
            timestamp: new Date().toISOString(),
            userId: userId,
            sessionId: sessionId
        };

        console.log(`Sending message to webhook (PRODUCTION mode):`, webhookUrl);
        console.log('Payload:', JSON.stringify(payload, null, 2));
        console.log('CORS proxy enabled:', this.useCorsProxy);

        // Use CORS proxy if enabled
        if (this.useCorsProxy) {
            // Try multiple CORS proxies as fallback - corsproxy.io works best
            const proxies = [
                'https://corsproxy.io/?',
                'https://api.allorigins.win/raw?url=',
                'https://cors-anywhere.herokuapp.com/'
            ];
            
            return this.tryWithProxies(proxies, payload);
        }

        // Direct POST request
        return this.http.post<any>(webhookUrl, payload, {
            headers: this.defaultHeaders
        }).pipe(
            map(response => {
                console.log(`✅ Received response from n8n directly (PRODUCTION mode):`, response);
                return this.processResponse(response);
            }),
            catchError(error => {
                console.error('Error calling webhook directly:', error);
                console.error('Full error details:', {
                    status: error.status,
                    statusText: error.statusText,
                    url: error.url,
                    message: error.message,
                    error: error.error
                });
                
                // Provide more specific error messages
                if (error.status === 0) {
                    console.error('CORS error detected. Falling back to CORS proxy...');
                    // Try with CORS proxy as fallback - corsproxy.io works best
                    const proxies = [
                        'https://corsproxy.io/?',
                        'https://api.allorigins.win/raw?url=',
                        'https://cors-anywhere.herokuapp.com/'
                    ];
                    return this.tryWithProxies(proxies, payload);
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

    // Removed testConnection (test mode not supported)

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
     * Try multiple CORS proxies as fallback
     */
    private tryWithProxies(proxies: string[], payload: ChatRequest): Observable<ChatResponse> {
        console.log('Using CORS proxies for POST request (n8n webhook only accepts POST)');
        // n8n webhooks typically only accept POST requests, so go directly to proxy fallback
        return this.tryProxiesSequentially(proxies, payload, 0);
    }

    /**
     * Try CORS proxies sequentially
     */
    private tryProxiesSequentially(proxies: string[], payload: ChatRequest, index: number): Observable<ChatResponse> {
        if (index >= proxies.length) {
            console.error('All CORS proxies failed');
            return this.getFallbackResponse(payload.message);
        }

        const webhookUrl = this.getWebhookUrl();
        const proxyUrl = proxies[index] + encodeURIComponent(webhookUrl);
        
        return this.http.post<any>(proxyUrl, payload, {
            headers: this.defaultHeaders
        }).pipe(
            map(response => {
                console.log(`✅ Received response from proxy ${index + 1} (PRODUCTION mode):`, response);
                return this.processResponse(response);
            }),
            catchError(error => {
                console.log(`Proxy ${index + 1} failed, trying next...`);
                return this.tryProxiesSequentially(proxies, payload, index + 1);
            })
        );
    }

    /**
     * Process the response from n8n (test or production)
     */
    private processResponse(response: any): ChatResponse {
        console.log(`Processing response:`, response);

        // Helper function to recursively find the core data object
        const findCoreData = (data: any): any => {
            if (!data) {
                return null;
            }

            // If data is a string, try to clean and parse it
            if (typeof data === 'string') {
                try {
                    // Clean markdown code fences if they exist
                    let cleanString = data.trim();
                    if (cleanString.startsWith('```json')) {
                        const startIndex = cleanString.indexOf('{');
                        const endIndex = cleanString.lastIndexOf('}');
                        if (startIndex !== -1 && endIndex > startIndex) {
                           cleanString = cleanString.substring(startIndex, endIndex + 1);
                        }
                    }
                    const parsed = JSON.parse(cleanString);
                    // After parsing, we might have the object we need, or we might need to search inside it
                    return findCoreData(parsed);
                } catch (e) {
                    return null; // Not a parsable JSON string
                }
            }

            // If it's an object, check for key properties directly
            if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                if (Array.isArray(data.products) || data.intro || data.outro) {
                    return data; // Found it! This looks like our core data object.
                }
                // If not found, search recursively in its values
                for (const key in data) {
                    if (Object.prototype.hasOwnProperty.call(data, key)) {
                        const found = findCoreData(data[key]);
                        if (found) return found;
                    }
                }
            }
            
            // If it's an array, search recursively in its items
            if (Array.isArray(data)) {
                 for (const item of data) {
                    const found = findCoreData(item);
                    if (found) return found;
                }
            }

            return null;
        };

        const coreData = findCoreData(response);

        if (coreData) {
            // Case 1: It's a product response (must have a non-empty products array)
            if (Array.isArray(coreData.products) && coreData.products.length > 0) {
                console.log('Found product structure. Formatting as product response.', coreData);
                
                // Clean up the description for each product
                coreData.products.forEach((product: Product) => {
                    if (product.description) {
                        // Remove the "Πληροφορίες" prefix and trim whitespace
                        product.description = product.description.replace(/^Πληροφορίες\s*/, '').trim();
                    }
                });

                return {
                    intro: coreData.intro,
                    products: coreData.products,
                    outro: coreData.outro,
                    timestamp: new Date().toISOString()
                };
            }
            // Case 2: It's a text-only response (e.g., count query with intro/outro)
            if (coreData.intro || coreData.outro) {
                console.log('Found intro/outro structure without products. Formatting as text response.', coreData);
                const combinedText = [coreData.intro, coreData.outro].filter(Boolean).join('\n\n');
                return {
                    reply: combinedText,
                    timestamp: new Date().toISOString()
                };
            }
        }

        // Fallback for simple text replies or errors
        let reply = 'Received an unparsable response.';
        if (response && response.message) {
            reply = response.message; // For n8n error messages
        } else if (typeof response === 'string') {
            reply = response;
        } else if (response && typeof response === 'object') {
            reply = "```json\n" + JSON.stringify(response, null, 2) + "\n```";
        }

        console.warn('Could not find valid data structure. Using fallback.', response);
        return {
            reply: reply,
            timestamp: new Date().toISOString()
        };
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

    let formatted = text.trim();

    // ✅ Fix specifically broken markdown links from n8n, which may add extra characters and newlines before the closing parenthesis.
    // e.g., .../some-url/))\n\n🟢\n) -> .../some-url/)
    formatted = formatted.replace(/\((https?:\/\/[^\s\)]+)[^\)]*\)/g, '($1)');

    // ✅ Fix specifically broken markdown links from n8n, which may add extra characters and newlines before the closing parenthesis.
    // e.g., .../some-url/))\n\n🟢\n) -> .../some-url/)
    formatted = formatted.replace(/\((https?:\/\/[^\s\)]+)[^\)]*\)/g, '($1)');

    // ✅ Fix specifically broken markdown links from n8n, which may add extra characters and newlines before the closing parenthesis.
    // e.g., .../some-url/))\n\n🟢\n) -> .../some-url/)
    formatted = formatted.replace(/\((https?:\/\/[^\s\)]+)[^\)]*\)/g, '($1)');

    // ✅ Fix image URLs with linebreaks (even weird multi-line splits)
    formatted = formatted.replace(/🖼️\s*((https?:\/\/[^\s\n\r)]+)[\s\n\r]+([^\s\n\r)]+))/g, (match, fullUrl, part1, part2) => {
        const cleanUrl = (part1 + part2).replace(/\s+/g, '');
        return `🖼️ ${cleanUrl}`;
    });

    // ✅ Fix all other generic URL breaks
    formatted = formatted.replace(/(https?:\/\/[^\s\n\r]*?)\s*\n\s*([^\s\n\r]*)/g, (match, part1, part2) => {
        return (part1 + part2).replace(/\s+/g, '');
    });

    // 🛠️ Normalize product links
    formatted = formatted.replace(/\[Προβολή\]\((https?:\/\/[^\)]+)\)/g, '🔗 Δείτε περισσότερα: $1');
    formatted = formatted.replace(/🔗\s*Δείτε περισσότερα:\s*\n\s*(https?:\/\/[^\s]+)/g, '🔗 Δείτε περισσότερα: $1');

    // 🧹 Clean up
    formatted = formatted.replace(/(\d+,\d+\s*€)/g, ' $1');
    formatted = formatted.replace(/([\u{1F300}-\u{1F9FF}])([A-Za-zΑ-Ωα-ωάέήίόύώ])/gu, '$1 $2');
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim();
}

}
