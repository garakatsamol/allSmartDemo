# n8n AI Assistant Chat Interface

A modern chat interface built with Angular and PrimeNG for demonstrating n8n AI assistants. This application provides a seamless way to interact with your n8n workflows through a clean, responsive chat interface.

## 🚀 Features

- **Environment Management**: Switch between test and production environments
- **Real-time Chat**: Interactive chat interface with typing indicators
- **CORS Support**: Built-in CORS proxy for development environments
- **Connection Testing**: Test your webhook connections before going live
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with PrimeNG components and modern styling

## 🛠️ Environment Configuration

### Test Environment
- **Purpose**: Development and testing your n8n workflows
- **Webhook URL Pattern**: `https://your-n8n-instance.com/webhook-test/your-webhook-id`
- **Features**: Full debugging, CORS proxy support, detailed error messages
- **Current Test URL**: `https://locutus.app.n8n.cloud/webhook-test/e50506fd-9051-46c2-ab67-108db865a79d`

### Production Environment  
- **Purpose**: Live deployment with production n8n workflows
- **Webhook URL Pattern**: `https://your-n8n-instance.com/webhook/your-webhook-id`
- **Features**: Optimized for performance, production-ready error handling

## 📋 Setup Instructions

### 1. Configure Your n8n Workflow

#### For Test Environment:
1. Create a new workflow in n8n
2. Add a **Webhook** trigger node
3. Set the webhook path to include "test" (e.g., `/webhook-test/your-unique-id`)
4. Add your AI processing nodes (OpenAI, Claude, etc.)
5. Add a **Respond to Webhook** node with these headers:
   ```json
   {
     "Access-Control-Allow-Origin": "*",
     "Access-Control-Allow-Methods": "POST, OPTIONS",
     "Access-Control-Allow-Headers": "Content-Type"
   }
   ```

#### For Production Environment:
1. Create a production workflow or duplicate your test workflow
2. Use a production webhook path (e.g., `/webhook/your-unique-id`)
3. Configure production-appropriate settings (rate limiting, authentication, etc.)
4. Ensure proper error handling and logging
5. Test thoroughly before going live

### 2. Configure the Chat Interface

1. Click the configuration button (⚙️) in the chat interface
2. Select your environment (Test or Production)
3. Enter the appropriate webhook URL for the selected environment
4. Configure CORS proxy if needed (development only)
5. Test the connection
6. Save the configuration

### 3. Environment Switching

You can easily switch between test and production environments:

1. Open the configuration dialog
2. Select the desired environment from the dropdown
3. The interface will automatically load the appropriate webhook URL
4. Test the connection to ensure everything works
5. Save to apply the changes

## 🔧 CORS Configuration

### Development (CORS Proxy)
- **When to use**: Local development, testing, CORS issues
- **How it works**: Routes requests through a proxy server
- **Proxy used**: `https://corsproxy.io/`
- **Enable**: Check "Use CORS Proxy" in configuration

### Production (Direct Connection)
- **When to use**: Production deployment, when CORS is properly configured
- **Requirements**: n8n workflow must include proper CORS headers
- **Performance**: Direct connection, no proxy overhead

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
**Symptoms**: Console shows CORS policy errors
**Solutions**:
1. Enable CORS proxy in development
2. Add proper CORS headers to your n8n "Respond to Webhook" node
3. Ensure your n8n instance allows cross-origin requests

#### Webhook Not Found (404)
**Symptoms**: "Webhook not found" error
**Solutions**:
1. Verify the webhook URL is correct
2. Ensure the n8n workflow is active
3. Check that the webhook trigger is properly configured

#### Connection Timeout
**Symptoms**: Requests hang or timeout
**Solutions**:
1. Check your n8n instance is accessible
2. Verify network connectivity
3. Test with a simple workflow first

### Environment-Specific Issues

#### Test Environment Issues
- Use CORS proxy if experiencing CORS errors
- Enable detailed logging in your n8n workflow
- Test with simple workflows first

#### Production Environment Issues  
- Ensure CORS headers are properly configured
- Monitor n8n execution logs
- Implement proper error handling in your workflow

## 📚 API Documentation

### Request Format
```json
{
  "message": "User's message",
  "timestamp": "2025-01-06T12:00:00.000Z",
  "userId": "optional-user-id",
  "sessionId": "optional-session-id"
}
```

### Response Format
```json
{
  "reply": "AI assistant response",
  "timestamp": "2025-01-06T12:00:00.000Z",
  "confidence": 0.95,
  "metadata": {}
}
```

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   ng serve
   ```

3. **Open your browser** and navigate to `http://localhost:4200`

4. **Configure your n8n webhook** using the configuration dialog

5. **Start chatting** with your AI assistant!

## 🔒 Security Considerations

### Test Environment
- Use non-sensitive data for testing
- Keep test webhooks separate from production
- Regularly rotate test webhook URLs
- Monitor for unusual activity

### Production Environment  
- Implement proper authentication if needed
- Use HTTPS for all communications
- Monitor and log all interactions
- Consider rate limiting
- Implement input validation
- Use environment variables for sensitive data

## 📖 Example n8n Workflow

### Simple AI Chat Workflow
1. **Webhook Trigger** - Receives chat messages
2. **Function Node** - Extract message from request
3. **OpenAI/Claude Node** - Process with AI
4. **Respond to Webhook** - Send response back

### Advanced Features
- Session management
- Context awareness  
- Multi-turn conversations
- Integration with databases
- Custom AI prompts
- User authentication
- Rate limiting

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review n8n workflow execution logs
3. Enable CORS proxy for development testing
4. Test with simple workflows first

## 📈 Environment Best Practices

### Test Environment
- Use descriptive webhook paths with "test"
- Enable verbose logging
- Test edge cases and error scenarios
- Use sample/dummy data
- Regular testing of error conditions

### Production Environment
- Use clean, professional webhook paths
- Implement proper error handling
- Monitor performance and usage
- Have rollback procedures ready
- Regular security audits
- Performance monitoring

## 🔄 Switching Between Environments

The application now supports seamless switching between test and production environments:

1. **Environment Dropdown**: Select between "Test Environment" and "Production Environment"
2. **Automatic URL Loading**: URLs are automatically loaded based on the selected environment
3. **Independent Configuration**: Each environment maintains its own webhook URL
4. **Connection Testing**: Test connections for each environment independently
5. **Environment Indicators**: Clear visual indicators show which environment is active

## 📊 Production Deployment

When you're ready to create a production webhook:

1. **Create Production Workflow**: Duplicate your test workflow or create a new one
2. **Update Webhook Path**: Change from `/webhook-test/` to `/webhook/`
3. **Production Settings**: Configure appropriate timeouts, rate limits, and error handling
4. **Security**: Implement authentication and input validation
5. **Monitoring**: Set up logging and monitoring
6. **Testing**: Thoroughly test before going live

---

**Built with ❤️ using Angular, PrimeNG, and n8n**
