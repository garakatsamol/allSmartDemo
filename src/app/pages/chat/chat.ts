import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Product, ChatResponse } from '../service/chat.service';
import { MessageService } from 'primeng/api';

// Interfaces are now imported from the service

interface ChatMessage {
    id: number;
    text?: string; // Optional for product messages
    isUser: boolean;
    timestamp: Date;
    isProductResponse?: boolean;
    introText?: string;
    products?: Product[];
    outroText?: string;
}

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [ChatService, MessageService],
    template: `
        <div class="min-h-screen bg-slate-50 p-4 sm:p-8 flex flex-col">
            <div class="text-center mb-8">
                <div class="flex items-center justify-center mb-4">
                    <img src="assets/allsmart-logo.svg" alt="AllSmart.gr" class="h-12 sm:h-16">
                </div>
                <p class="mt-2 text-slate-600 text-sm sm:text-base">Your Smart Shopping Companion</p>
            </div>
            <div class="flex-1 flex justify-center items-start">
                <div class="bg-white rounded-lg shadow-sm border border-slate-200 w-full max-w-3xl overflow-hidden">
                    <!-- Configuration Section -->
                    <div class="px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-4">
                                <span class="text-sm flex items-center gap-1" [ngClass]="{'text-emerald-600': isConnected, 'text-red-600': !isConnected}">
                                    <span class="inline-block w-2 h-2 rounded-full mr-1" [ngClass]="{'bg-emerald-600': isConnected, 'bg-red-600': !isConnected}"></span>
                                    {{ isConnected ? 'Connected' : 'Not Connected' }}
                                </span>
                            </div>
                            <button (click)="clearChat()" class="px-3 py-1 text-xs font-semibold rounded bg-red-100 text-red-700 hover:bg-red-200 border border-red-200">Clear</button>
                        </div>
                    </div>
                    <!-- Chat Messages Area -->
                    <div class="h-[400px] overflow-y-auto overflow-x-hidden bg-white" #messagesWrapper>
                        <div class="p-6 flex flex-col">
                            <div *ngFor="let message of messages; trackBy: trackByMessage" class="mb-4">
                                <div class="flex items-start" [ngClass]="{'justify-end': message.isUser, 'justify-start': !message.isUser}">
                                    <!-- Assistant Avatar -->
                                    <div *ngIf="!message.isUser" class="mr-2 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white border border-blue-200">
                                        <span>A</span>
                                    </div>
                                    <!-- Message Content -->
                                    <div class="max-w-[80%] sm:max-w-[70%] rounded-lg px-4 py-3 relative" [ngClass]="{'bg-blue-600 text-white rounded-br-sm': message.isUser, 'bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200': !message.isUser}">
                                        <!-- Simple Text Message -->
                                        <div *ngIf="!message.isProductResponse" class="break-words leading-relaxed whitespace-pre-wrap">{{ message.text }}</div>
                                        <!-- Product Response -->
                                        <div *ngIf="message.isProductResponse">
                                            <p *ngIf="message.introText" class="mb-4 text-slate-700 text-sm leading-relaxed">{{ message.introText }}</p>
                                            <div *ngFor="let product of message.products" class="mx-auto w-full transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-md duration-300 hover:scale-105 hover:shadow-lg mb-4">
                                                <img class="h-48 w-full object-cover object-center" [src]="product.imageUrl" [alt]="product.title" onerror="this.src='https://via.placeholder.com/200x200/2563eb/ffffff?text=AllSmart.gr'" />
                                                <div class="p-4">
                                                    <h2 class="mb-2 text-lg font-medium dark:text-white text-gray-900">{{ product.title }}</h2>
                                                    <p *ngIf="product.description" class="mb-2 text-base dark:text-gray-300 text-gray-700">{{ product.description }}</p>
                                                    <div class="flex items-center mb-3">
                                                        <p *ngIf="product.price" class="mr-2 text-lg font-semibold text-gray-900 dark:text-white">{{ product.price }}</p>
                                                        <!-- Availability can be styled similarly -->
                                                        <p *ngIf="product.availability" class="ml-auto text-base font-medium text-green-500">{{ product.availability }}</p>
                                                    </div>
                                                    <div class="flex justify-center w-full mt-2">
                                                        <button *ngIf="product.url" (click)="openProductLink(product.url)" class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Δείτε περισσότερα</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <p *ngIf="message.outroText" class="mt-3 text-slate-700 text-sm leading-relaxed">{{ message.outroText }}</p>
                                        </div>
                                        <div class="text-xs opacity-70 mt-1" [ngClass]="{'text-right text-blue-100': message.isUser, 'text-left text-slate-500': !message.isUser}">{{ message.timestamp | date:'short' }}</div>
                                    </div>
                                    <!-- User Avatar -->
                                    <div *ngIf="message.isUser" class="ml-2 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white border border-emerald-200">
                                        <span>U</span>
                                    </div>
                                </div>
                            </div>
                            <!-- Typing Indicator -->
                            <div *ngIf="isTyping">
                                <div class="flex items-start justify-start">
                                    <div class="mr-2 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white border border-blue-200">
                                        <span>A</span>
                                    </div>
                                    <div class="rounded-bl-sm bg-slate-100 border border-slate-200 px-4 py-3">
                                        <span>Typing...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="h-px bg-slate-200"></div>
                    <!-- Message Input Area -->
                    <div class="p-6 bg-slate-50 border-t border-slate-200">
                        <div class="flex gap-2 items-center">
                            <input type="text" [(ngModel)]="currentMessage" placeholder="Πώς μπορώ να σας βοηθήσω σήμερα;" class="flex-1 border border-slate-300 rounded focus:border-blue-500 focus:ring-blue-500 px-3 py-2" (keyup.enter)="sendMessage()" [disabled]="isTyping" #messageInput>
                            <button (click)="sendMessage()" [disabled]="!currentMessage.trim() || isTyping" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">Send</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Configuration Dialog -->
        <div *ngIf="showConfigDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 relative">
                <button (click)="showConfigDialog = false" class="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-xl">&times;</button>
                <h2 class="text-xl font-bold mb-4">Configure AllSmart AI Assistant</h2>
                <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">Configure your n8n webhook URL to connect this chat to your AllSmart AI assistant.</div>
                <div class="mb-4">
                    <label for="webhookUrl" class="block text-slate-700 font-medium mb-1">Production Webhook URL</label>
                    <input type="text" id="webhookUrl" [(ngModel)]="tempWebhookUrl" placeholder="https://your-n8n-instance.com/webhook/your-webhook-id" class="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-blue-500">
                    <small class="block text-slate-600 mt-1">Your production webhook URL from n8n</small>
                </div>
                <div class="mb-4 flex items-center">
                    <input type="checkbox" id="corsProxy" [(ngModel)]="useCorsProxy" class="mr-2">
                    <label for="corsProxy" class="text-slate-700">Use CORS Proxy (If experiencing CORS issues)</label>
                </div>
                <small class="block text-slate-600 mb-4">Enable this if you're experiencing CORS errors. Disable once CORS headers are properly configured in n8n.</small>
                <div class="flex justify-end gap-2">
                    <button (click)="cancelConfig()" class="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button (click)="saveConfig()" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
                </div>
            </div>
        </div>
    `
})
export class Chat implements OnInit {
    @ViewChild('messagesWrapper') messagesWrapper!: ElementRef;
    @ViewChild('messageInput') messageInput!: ElementRef;

    messages: ChatMessage[] = [];
    currentMessage: string = '';
    isTyping: boolean = false;
    showConfigDialog: boolean = false;
    tempWebhookUrl: string = '';
    useCorsProxy: boolean = false;
    isConnected: boolean = false;
    private messageCounter = 1;

    constructor(
        private chatService: ChatService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        // Add welcome message in Greek
        this.addMessage('Γεια σας! Είμαι ο εικονικός σας βοηθός. Πώς μπορώ να σας βοηθήσω σήμερα;', false);
        
        // Load current webhook settings
        this.tempWebhookUrl = this.chatService.getWebhookUrl();
        this.useCorsProxy = this.chatService.isCorsProxyEnabled();
        // Always use production webhook, no test mode
        this.updateConnectionStatus();
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

    private addMessage(text: string, isUser: boolean, products?: Product[], introText?: string, outroText?: string) {
        const message: ChatMessage = {
            id: this.messageCounter++,
            text: text,
            isUser: isUser,
            timestamp: new Date(),
            isProductResponse: !!products && products.length > 0,
            products: products,
            introText: introText,
            outroText: outroText
        };

        this.messages.push(message);
        this.scrollToBottom();
    }

    private async sendToAssistant(message: string) {
        this.isTyping = true;

        try {
            this.chatService.sendMessage(message).subscribe({
                next: (response: ChatResponse) => {
                    this.isTyping = false;
                    if (response.products && response.products.length > 0) {
                        // Handle product response
                        this.addMessage('', false, response.products, response.intro, response.outro);
                    } else if (response.reply) {
                        // Handle simple text response
                        this.addMessage(response.reply, false);
                    }
                },
                error: (error) => {
                    console.error('Error sending message to assistant:', error);
                    this.addMessage('Συγγνώμη, αλλά αντιμετωπίζω πρόβλημα σύνδεσης με την υπηρεσία. Παρακαλώ ελέγξτε τη διαμόρφωση.', false);
                    this.isTyping = false;
                }
            });
        } catch (error) {
            console.error('Error sending message to assistant:', error);
            this.addMessage('Συγγνώμη, αλλά προέκυψε ένα σφάλμα κατά την επεξεργασία του αιτήματός σας.', false);
            this.isTyping = false;
        }
    }

    clearChat() {
        this.messages = [];
        this.messageCounter = 1;
        this.addMessage('Συνομιλία καθαρίστηκε. Πώς μπορώ να σας βοηθήσω;', false);
    }


    // Removed toggleTestMode and all test mode logic

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
        this.addMessage('🔗 Η σύνδεση διαμορφώθηκε επιτυχώς!', false);
    }

    cancelConfig() {
        // Reset to current service configuration
        this.tempWebhookUrl = this.chatService.getWebhookUrl();
        this.useCorsProxy = this.chatService.isCorsProxyEnabled();
        this.showConfigDialog = false;
    }


    // Removed testConnection and all test mode logic

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

    /**
     * Open product link in a new tab
     */
    openProductLink(link: string): void {
        if (link) {
            window.open(link, '_blank', 'noopener,noreferrer');
        }
    }
}
