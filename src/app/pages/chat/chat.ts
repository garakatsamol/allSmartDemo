import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ChatService, ChatResponse } from '../service/chat.service';


interface Product {
    title?: string;
    image?: string;
    description?: string;
    price?: string;
    availability?: string;
    link?: string;
}

interface ChatMessage {
    id: number;
    text: string;
    isUser: boolean;
    timestamp: Date;
    avatar?: string;
    isProductResponse?: boolean;
    introText?: string;
    products?: Product[];
    closingText?: string;
}

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        InputTextModule,
        ButtonModule,
        AvatarModule,
        DividerModule,
        DialogModule,
        MessageModule,
        ToastModule,
        CheckboxModule
    ],
    providers: [MessageService],
    template: `
        <div class="min-h-screen bg-slate-50 p-4 sm:p-8 flex flex-col">
            <div class="text-center mb-8">
                <div class="flex items-center justify-center mb-4">
                    <img src="assets/allsmart-logo.svg" alt="AllSmart.gr" class="h-12 sm:h-16">
                </div>
                <h1 class="m-0 text-slate-800 text-2xl sm:text-3xl font-medium flex items-center justify-center gap-3">
                    <i class="pi pi-comments text-blue-600"></i>
                    <span>AllSmart AI Assistant</span>
                </h1>
                <p class="mt-2 text-slate-600 text-sm sm:text-base">Powered by n8n • Your Smart Shopping Companion</p>
            </div>
            
            <div class="flex-1 flex justify-center items-start">
                <div class="bg-white rounded-lg shadow-sm border border-slate-200 w-full max-w-3xl overflow-hidden">
                    <!-- Configuration Section -->
                    <div class="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <p-button 
                                    icon="pi pi-cog" 
                                    size="small"
                                    severity="secondary"
                                    (onClick)="showConfigDialog = true"
                                    label="Configure"
                                    styleClass="bg-blue-600 hover:bg-blue-700 border-blue-600">
                                </p-button>
                                <span class="text-sm flex items-center gap-1" 
                                      [ngClass]="{'text-emerald-600': isConnected, 'text-red-600': !isConnected}">
                                    <i class="pi" [ngClass]="{'pi-circle-fill': isConnected, 'pi-circle': !isConnected}"></i>
                                    {{ isConnected ? 'Connected' : 'Not Connected' }}
                                </span>
                            </div>
                            <p-button 
                                icon="pi pi-trash" 
                                size="small"
                                severity="danger"
                                (onClick)="clearChat()"
                                label="Clear">
                            </p-button>
                        </div>
                    </div>
                    
                    <!-- Chat Messages Area -->
                    <div class="h-[400px] overflow-y-auto overflow-x-hidden bg-white" #messagesWrapper>
                        <div class="p-6 flex flex-col">
                            <div 
                                *ngFor="let message of messages; trackBy: trackByMessage" 
                                class="mb-4">
                                
                                <div class="flex items-start" 
                                     [ngClass]="{'justify-end': message.isUser, 'justify-start': !message.isUser}">
                                    
                                    <!-- Assistant Avatar -->
                                    <p-avatar 
                                        *ngIf="!message.isUser" 
                                        icon="pi pi-robot" 
                                        styleClass="mr-2"
                                        [style]="{'background-color': '#2563eb', 'color': 'white', 'border': '1px solid #dbeafe'}">
                                    </p-avatar>
                                    
                                    <!-- Message Content -->
                                    <div class="max-w-[80%] sm:max-w-[70%] rounded-lg px-4 py-3 relative" 
                                         [ngClass]="{
                                            'bg-blue-600 text-white rounded-br-sm': message.isUser, 
                                            'bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200': !message.isUser
                                         }">
                                        
                                        <!-- Simple Text Message -->
                                        <div *ngIf="!message.isProductResponse" class="break-words leading-relaxed whitespace-pre-wrap">{{ message.text }}</div>

                                        <!-- Product Response -->
                                        <div *ngIf="message.isProductResponse">
                                            <p *ngIf="message.introText" class="mb-4 text-slate-700">{{ message.introText }}</p>
                                            
                                            <div *ngFor="let product of message.products" class="bg-white border border-slate-200 rounded-lg p-5 mb-4 hover:shadow-lg transition-shadow duration-200 group">
                                                <!-- Product Title with Green Indicator -->
                                                <div class="text-base font-semibold mb-3 text-slate-900 leading-snug">
                                                    🟢 {{ product.title }}
                                                </div>
                                                
                                                <!-- Product Image -->
                                                <div class="flex justify-center mb-4">
                                                    <img [src]="product.image" [alt]="product.title" 
                                                         class="max-w-[140px] max-h-[140px] object-contain rounded border border-slate-100" />
                                                </div>
                                                
                                                <!-- Product Description -->
                                                <p *ngIf="product.description" class="text-sm text-slate-600 mb-4 text-center leading-relaxed">{{ product.description }}</p>
                                                
                                                <!-- Price and Availability Section -->
                                                <div class="space-y-2 mb-4">
                                                    <div *ngIf="product.price" class="text-center">
                                                        <span class="text-lg font-bold text-slate-900">{{ product.price }}</span>
                                                    </div>
                                                    <div *ngIf="product.availability" class="text-center">
                                                        <span class="text-sm text-emerald-600 font-medium">📦 {{ product.availability }}</span>
                                                    </div>
                                                </div>
                                                
                                                <!-- Action Button -->
                                                <a *ngIf="product.link" [href]="product.link" target="_blank" rel="noopener" 
                                                   class="block w-full text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors duration-200">
                                                    Δείτε περισσότερα
                                                </a>
                                            </div>

                                            <p *ngIf="message.closingText" class="mt-4 text-slate-700">{{ message.closingText }}</p>
                                        </div>

                                        <div class="text-xs opacity-70 mt-1" 
                                             [ngClass]="{
                                                'text-right text-blue-100': message.isUser, 
                                                'text-left text-slate-500': !message.isUser
                                             }">
                                            {{ message.timestamp | date:'short' }}
                                        </div>
                                    </div>
                                    
                                    <!-- User Avatar -->
                                    <p-avatar 
                                        *ngIf="message.isUser" 
                                        icon="pi pi-user" 
                                        styleClass="ml-2"
                                        [style]="{'background-color': '#059669', 'color': 'white', 'border': '1px solid #d1fae5'}">
                                    </p-avatar>
                                </div>
                            </div>
                            
                            <!-- Typing Indicator -->
                            <div *ngIf="isTyping">
                                <div class="flex items-start justify-start">
                                    <p-avatar 
                                        icon="pi pi-robot" 
                                        styleClass="mr-2"
                                        [style]="{'background-color': '#2563eb', 'color': 'white', 'border': '1px solid #dbeafe'}">
                                    </p-avatar>
                                    <div class="rounded-bl-sm bg-slate-100 border border-slate-200 px-4 py-3">
                                        <div class="flex items-center gap-0.5">
                                            <span class="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span class="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span class="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <p-divider></p-divider>
                    
                    <!-- Message Input Area -->
                    <div class="p-6 bg-slate-50 border-t border-slate-200">
                        <div class="flex gap-2 items-center">
                            <input 
                                type="text" 
                                pInputText 
                                [(ngModel)]="currentMessage" 
                                placeholder="Πώς μπορώ να σας βοηθήσω σήμερα;"
                                class="flex-1 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                (keyup.enter)="sendMessage()"
                                [disabled]="isTyping"
                                #messageInput>
                            <p-button 
                                icon="pi pi-send" 
                                (onClick)="sendMessage()"
                                [disabled]="!currentMessage.trim() || isTyping"
                                [loading]="isTyping"
                                styleClass="bg-blue-600 hover:bg-blue-700 border-blue-600">
                            </p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Configuration Dialog -->
        <p-dialog 
            header="Configure AllSmart AI Assistant" 
            [(visible)]="showConfigDialog" 
            [modal]="true" 
            [style]="{width: '500px'}"
            [dismissableMask]="true"
            styleClass="allsmart-dialog">
            
            <div class="flex flex-column gap-3">
                <p-message 
                    severity="info" 
                    text="Configure your n8n webhook URL to connect this chat to your AllSmart AI assistant.">
                </p-message>
                
                <div class="field">
                    <label for="webhookUrl" class="text-slate-700 font-medium">Production Webhook URL</label>
                    <input 
                        type="text" 
                        pInputText 
                        id="webhookUrl"
                        [(ngModel)]="tempWebhookUrl" 
                        placeholder="https://your-n8n-instance.com/webhook/your-webhook-id"
                        class="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                    <small class="block text-slate-600 mt-1">
                        Your production webhook URL from n8n
                    </small>
                </div>
                
                <div class="field">
                    <p-checkbox 
                        [(ngModel)]="useCorsProxy" 
                        [binary]="true" 
                        inputId="corsProxy">
                    </p-checkbox>
                    <label for="corsProxy" class="ml-2 text-slate-700">
                        Use CORS Proxy (If experiencing CORS issues)
                    </label>
                    <small class="block text-slate-600 mt-1">
                        Enable this if you're experiencing CORS errors. 
                        Disable once CORS headers are properly configured in n8n.
                    </small>
                </div>
                
                <div class="flex justify-content-end gap-2">
                    <p-button 
                        label="Test Connection" 
                        icon="pi pi-check"
                        severity="secondary"
                        (onClick)="testConnection()"
                        [loading]="isTesting"
                        styleClass="border-slate-300 text-slate-700 hover:bg-slate-50">
                    </p-button>
                    <p-button 
                        label="Cancel" 
                        severity="secondary"
                        (onClick)="cancelConfig()"
                        styleClass="border-slate-300 text-slate-700 hover:bg-slate-50">
                    </p-button>
                    <p-button 
                        label="Save" 
                        (onClick)="saveConfig()"
                        styleClass="bg-blue-600 hover:bg-blue-700 border-blue-600">
                    </p-button>
                </div>
            </div>
        </p-dialog>

        <p-toast></p-toast>
    `
})
export class Chat implements OnInit {
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;
    @ViewChild('messagesWrapper') messagesWrapper!: ElementRef;
    @ViewChild('messageInput') messageInput!: ElementRef;

    messages: ChatMessage[] = [];
    currentMessage: string = '';
    isTyping: boolean = false;
    showConfigDialog: boolean = false;
    tempWebhookUrl: string = '';
    useCorsProxy: boolean = false;
    isConnected: boolean = false;
    isTesting: boolean = false;
    private messageCounter = 1;

    constructor(
        private chatService: ChatService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        // Add welcome message
        this.addMessage('Hello! I\'m your AI assistant. How can I help you today?', false);
        
        // Load current webhook settings
        this.tempWebhookUrl = this.chatService.getWebhookUrl();
        this.useCorsProxy = this.chatService.isCorsProxyEnabled();
        this.updateConnectionStatus();
        
        // Add setup message
        setTimeout(() => {
            this.addMessage('🌐 Production chat interface ready. Use the configuration button to set up your n8n webhook URL.', false);
        }, 500);
        
        // Add CORS help message if proxy is enabled
        if (this.useCorsProxy) {
            setTimeout(() => {
                this.addMessage('🔧 CORS Proxy is enabled. Configure your n8n webhook with proper CORS headers, then disable the proxy for better performance.', false);
            }, 1000);
        }
    }



    trackByMessage(index: number, message: ChatMessage): number {
        return message.id;
    }

    sendMessage() {
        if (!this.currentMessage.trim() || this.isTyping) {
            return;
        }

        const userMessage = this.currentMessage.trim();
        this.addMessage(userMessage, true);
        this.currentMessage = '';
        
        // Focus back to input
        setTimeout(() => {
            this.messageInput.nativeElement.focus();
        }, 100);

        // Send to n8n assistant
        this.sendToAssistant(userMessage);
    }

    private addMessage(text: string, isUser: boolean) {
        const message: ChatMessage = {
            id: this.messageCounter++,
            text: text,
            isUser: isUser,
            timestamp: new Date(),
            isProductResponse: false
        };

        if (!isUser) {
            const productData = this.parseProductResponse(text);
            if (productData.isProduct) {
                message.isProductResponse = true;
                message.introText = productData.introText;
                message.products = productData.products;
                message.closingText = productData.closingText;
                message.text = ''; // Clear raw text as it's now structured
            }
        }

        this.messages.push(message);
        this.scrollToBottom();
    }

    private parseProductResponse(text: string): { isProduct: boolean; introText?: string; products: Product[]; closingText?: string } {
        const productSeparator = /\n\s*\*\s*🟢\s*/;
        if (!productSeparator.test(text)) {
            return { isProduct: false, products: [] };
        }

        const blocks = text.split(productSeparator);
        const introText = blocks[0].trim() ? blocks[0].trim() : undefined;
        const products: Product[] = [];
        let closingText: string | undefined = undefined;

        // The last block might contain closing text after the product info
        const lastBlock = blocks.pop() || '';

        // Process all full product blocks
        for (const block of blocks.slice(1)) {
            products.push(this.parseSingleProduct(block).product);
        }
        
        // Process the last block, which might have closing text
        const lastProduct = this.parseSingleProduct(lastBlock, true);
        products.push(lastProduct.product);
        closingText = lastProduct.remainingText;

        return { isProduct: true, introText, products, closingText };
    }

    private parseSingleProduct(block: string, isLastBlock = false): { product: Product, remainingText?: string } {
        let productBlock = block;
        const product: Product = {};
        let remainingText: string | undefined;

        // Extract Description
        const descMatch = productBlock.match(/\n\s*\*\s*\*(.*?)\*/);
        if (descMatch) {
            product.description = descMatch[1].trim();
            productBlock = productBlock.replace(descMatch[0], '');
        }

        // Extract Image URL
        const imageMatch = productBlock.match(/\[(https?:\/\/[^\]]+\.(?:jpg|jpeg|png|webp|gif))\]/i);
        if (imageMatch && imageMatch.index !== undefined) {
            product.image = imageMatch[1];
            product.title = productBlock.substring(0, imageMatch.index).trim();
            productBlock = productBlock.substring(imageMatch.index + imageMatch[0].length);
        }

        // Extract Price
        const priceMatch = productBlock.match(/💰\s*([^–\n]+)/);
        if (priceMatch) {
            product.price = priceMatch[1].trim();
            productBlock = productBlock.replace(priceMatch[0], '');
        }

        // Extract Availability
        const availabilityMatch = productBlock.match(/📦\s*([^–\n]+)/);
        if (availabilityMatch) {
            product.availability = availabilityMatch[1].trim();
            productBlock = productBlock.replace(availabilityMatch[0], '');
        }

        // Extract Product Link
        const linkMatch = productBlock.match(/🔗\s*Δείτε περισσότερα:\s*(https?:\/\/[^\s<]+)/);
        if (linkMatch) {
            product.link = linkMatch[1];
            productBlock = productBlock.replace(linkMatch[0], '');
        }
        
        if (isLastBlock) {
            remainingText = productBlock.trim() || undefined;
        }

        return { product, remainingText };
    }


    private async sendToAssistant(message: string) {
        this.isTyping = true;

        try {
            this.chatService.sendMessage(message).subscribe({
                next: (response: ChatResponse) => {
                    this.addMessage(response.reply, false);
                    this.isTyping = false;
                },
                error: (error) => {
                    console.error('Error sending message to assistant:', error);
                    this.addMessage('I apologize, but I\'m having trouble connecting to the assistant service. Please check your n8n webhook configuration.', false);
                    this.isTyping = false;
                }
            });
        } catch (error) {
            console.error('Error sending message to assistant:', error);
            this.addMessage('I apologize, but I encountered an error processing your request.', false);
            this.isTyping = false;
        }
    }

    clearChat() {
        this.messages = [];
        this.messageCounter = 1;
        this.addMessage('Chat cleared. How can I help you?', false);
    }

    saveConfig() {
        if (!this.tempWebhookUrl.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Please enter a webhook URL'
            });
            return;
        }

        this.chatService.setWebhookUrl(this.tempWebhookUrl.trim());
        this.chatService.setCorsProxy(this.useCorsProxy);
        this.updateConnectionStatus();
        this.showConfigDialog = false;
        
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Production webhook configured successfully'
        });
        
        // Add a message about the configuration
        this.addMessage('🔗 Production webhook URL configured successfully!', false);
    }

    cancelConfig() {
        // Reset to current service configuration
        this.tempWebhookUrl = this.chatService.getWebhookUrl();
        this.useCorsProxy = this.chatService.isCorsProxyEnabled();
        this.showConfigDialog = false;
    }

    testConnection() {
        if (!this.tempWebhookUrl.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Please enter a webhook URL first'
            });
            return;
        }

        this.isTesting = true;
        
        // Temporarily set the configuration for testing
        const originalUrl = this.chatService.getWebhookUrl();
        const originalCors = this.chatService.isCorsProxyEnabled();
        
        this.chatService.setWebhookUrl(this.tempWebhookUrl.trim());
        this.chatService.setCorsProxy(this.useCorsProxy);

        this.chatService.testConnection().subscribe({
            next: (isConnected: boolean) => {
                this.isTesting = false;
                if (isConnected) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Connection successful!'
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Connection failed. Check the console for CORS errors and ensure your n8n workflow is active.'
                    });
                    // Restore original configuration if test failed
                    this.chatService.setWebhookUrl(originalUrl);
                    this.chatService.setCorsProxy(originalCors);
                }
                this.updateConnectionStatus();
            },
            error: () => {
                this.isTesting = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Connection test failed. Check the console for details.'
                });
                // Restore original configuration if test failed
                this.chatService.setWebhookUrl(originalUrl);
                this.chatService.setCorsProxy(originalCors);
                this.updateConnectionStatus();
            }
        });
    }

    private updateConnectionStatus() {
        const webhookUrl = this.chatService.getWebhookUrl();
        this.isConnected = !!(webhookUrl && webhookUrl.trim().length > 0);
    }

    private scrollToBottom(): void {
        try {
            if (this.messagesWrapper) {
                setTimeout(() => {
                    const wrapper = this.messagesWrapper.nativeElement;
                    wrapper.scrollTop = wrapper.scrollHeight;
                }, 100);
            }
        } catch (err) {
            console.error('Error scrolling to bottom:', err);
        }
    }
}
