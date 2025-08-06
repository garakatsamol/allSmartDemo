# Chat Page - n8n AI Assistant Integration

This chat page provides a modern, responsive interface for communicating with your n8n AI assistant. Built with Angular and PrimeNG components, it offers a seamless chat experience with configuration options for your n8n webhook.

## Features

- **Modern Chat Interface**: Clean, responsive design with user and assistant message bubbles
- **Real-time Communication**: Connect to your n8n AI assistant via webhook
- **Configuration Panel**: Easy setup and testing of your n8n webhook URL
- **Connection Status**: Visual indicator showing connection status
- **Message Management**: Clear chat functionality and message timestamps
- **Typing Indicators**: Visual feedback when the assistant is processing
- **Error Handling**: Graceful fallback responses when the assistant is unavailable

## Setup Instructions

### 1. Configure Your n8n Workflow

1. **Create a new workflow** in your n8n instance
2. **Add a Webhook node** as the trigger:
   - Set the HTTP Method to `POST`
   - Set the Path to something like `/webhook/chat` or `/webhook/assistant`
   - Note the full webhook URL (e.g., `https://your-n8n-instance.com/webhook/chat`)

3. **Add your AI processing nodes** (examples):
   - OpenAI node for ChatGPT integration
   - Anthropic node for Claude integration
   - Local AI model nodes
   - Custom processing logic

4. **Format the response**:
   Your workflow should return a response in this format:
   ```json
   {
     "reply": "Your AI assistant's response text here",
     "timestamp": "2024-01-01T12:00:00.000Z",
     "confidence": 0.95
   }
   ```

   Minimum required format:
   ```json
   {
     "reply": "Your response"
   }
   ```

### 2. Configure the Chat Page

1. **Navigate to the Chat page** in your Sakai application
2. **Click "Configure n8n Webhook"** button
3. **Enter your webhook URL** from step 1
4. **Test the connection** using the "Test Connection" button
5. **Save the configuration**

### 3. Example n8n Workflow Setup

Here's a complete workflow structure with CORS support:

```
Webhook (Trigger) 
    ↓
Extract Message (Code/Set Node)
    ↓
OpenAI Chat (or your AI service)
    ↓
Format Response (Code/Set Node)
    ↓
Respond to Webhook (Response Node)
```

#### Detailed Node Configuration:

##### 1. Webhook Trigger Node:
- **HTTP Method**: POST
- **Path**: `/webhook/chat`
- **Response Mode**: "Respond When Last Node Finishes"

##### 2. Extract Message Code Node:
```javascript
// Extract the message from the webhook
const inputData = $input.all();
const userMessage = inputData[0].json.message;

return [
  {
    json: {
      message: userMessage,
      timestamp: new Date().toISOString()
    }
  }
];
```

##### 3. AI Processing Node (e.g., OpenAI):
Configure your AI service node according to your needs.

##### 4. Format Response Code Node:
```javascript
// Format the AI response
const aiResponse = $input.all()[0].json;

return [
  {
    json: {
      reply: aiResponse.choices?.[0]?.message?.content || aiResponse.response || "I'm sorry, I couldn't process that request.",
      timestamp: new Date().toISOString(),
      confidence: 0.9
    }
  }
];
```

##### 5. Respond to Webhook Node:
- **Response Code**: 200
- **Response Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  }
  ```
- **Response Body**: `{{ $json }}`

## Chat Service API

The chat page uses a service that expects the following request/response format:

### Request Format (sent to your n8n webhook):
```typescript
{
  message: string;      // User's message
  timestamp: string;    // ISO timestamp
  userId?: string;      // Optional user identifier
  sessionId?: string;   // Optional session identifier
}
```

### Response Format (expected from your n8n webhook):
```typescript
{
  reply: string;        // Assistant's response (required)
  timestamp: string;    // Response timestamp (optional)
  confidence?: number;  // Response confidence 0-1 (optional)
  metadata?: any;       // Additional data (optional)
}
```

## Customization

### Styling
The chat interface uses CSS custom properties (CSS variables) from PrimeNG themes. You can customize the appearance by modifying:

- Message bubble colors: `--green-100`, `--surface-100`
- Avatar colors: `--blue-500`, `--green-500`
- Text colors: `--text-color`, `--green-900`

### Adding Features
You can extend the chat component by:

1. Adding file upload capabilities
2. Implementing message threading
3. Adding emoji/reaction support
4. Implementing message search
5. Adding conversation history persistence

## Quick CORS Fix for Development

If you're seeing CORS errors like the ones you mentioned:

1. **Immediate Solution**: Enable "Use CORS Proxy" in the chat configuration dialog
2. **Better Solution**: Add proper CORS headers to your n8n workflow:

   In your **Respond to Webhook** node, add these headers:
   ```json
   {
     "Access-Control-Allow-Origin": "*",
     "Access-Control-Allow-Methods": "POST, OPTIONS",
     "Access-Control-Allow-Headers": "Content-Type"
   }
   ```

3. **Check n8n Status**: 
   - Ensure your workflow is **active** (toggle switch in n8n)
   - Test the webhook directly in Postman or curl first
   - Check n8n execution logs for errors

## Troubleshooting

### Common Issues

1. **Connection Failed**: 
   - Verify your n8n webhook URL is correct
   - Ensure your n8n instance is accessible
   - Check if your webhook is activated

2. **No Response from Assistant**:
   - Check your n8n workflow is active
   - Verify the response format matches expectations
   - Review n8n execution logs for errors

### 3. CORS Issues**:
   - **Problem**: Browser blocks requests due to CORS policy
   - **Solutions**:
     
     #### Option 1: Configure CORS in n8n (Recommended)
     Add a **Respond to Webhook** node at the end of your workflow with these headers:
     ```json
     {
       "Access-Control-Allow-Origin": "*",
       "Access-Control-Allow-Methods": "POST, OPTIONS",
       "Access-Control-Allow-Headers": "Content-Type, Authorization"
     }
     ```
     
     #### Option 2: Use n8n Cloud with proper CORS setup
     - In n8n Cloud, ensure your webhook is properly configured
     - Test your webhook directly in a tool like Postman first
     
     #### Option 3: Development CORS Proxy (Development Only)
     For development purposes, you can start Angular with CORS disabled:
     ```bash
     ng serve --disable-host-check --port 4200
     ```
     
     Or use a CORS proxy service:
     ```
     https://cors-anywhere.herokuapp.com/https://your-n8n-webhook-url
     ```
     
     #### Option 4: Backend Proxy (Production)
     Create a backend endpoint that proxies requests to n8n:
     ```typescript
     // In your backend API
     app.post('/api/chat', async (req, res) => {
       try {
         const response = await fetch('your-n8n-webhook-url', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(req.body)
         });
         const data = await response.json();
         res.json(data);
       } catch (error) {
         res.status(500).json({ error: 'Failed to connect to assistant' });
       }
     });
     ```

### Debug Mode
Enable console logging in the browser developer tools to see detailed request/response information.

## Security Considerations

- Use HTTPS for your n8n webhook URLs
- Consider implementing authentication in your n8n workflow
- Validate and sanitize user inputs in your n8n workflow
- Consider rate limiting to prevent abuse

## Support

For issues related to:
- **Chat interface**: Check the browser console for errors
- **n8n integration**: Review your n8n workflow execution logs
- **Styling**: Verify PrimeNG theme is properly loaded
