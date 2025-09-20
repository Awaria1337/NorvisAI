import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from './prisma';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'norvis-ai-encryption-key-32chars!!';
const ALGORITHM = 'aes-256-cbc';

// Create a 32-byte key from the encryption key
function getKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

// Decrypt API key
function decryptApiKey(encryptedKey: string): string {
  try {
    const key = getKey();
    const parts = encryptedKey.split(':');
    
    if (parts.length !== 2) {
      // Fallback for old format
      const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
      let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
}

// AI Response interface
export interface AIResponse {
  content: string;
  tokensUsed?: number;
  model: string;
}

// Message interface for AI providers
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Get user's API key for a specific provider
async function getUserApiKey(userId: string, provider: string): Promise<string | null> {
  try {
    console.log(`Fetching API key for user: ${userId}, provider: ${provider}`);
    
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        userId: userId,
        provider: provider
      },
      select: {
        encryptedKey: true
      }
    });

    if (!apiKey) {
      console.log(`No API key found for user: ${userId}, provider: ${provider}`);
      return null;
    }

    console.log(`API key found for user: ${userId}, provider: ${provider}`);
    
    // Decrypt the API key
    return decryptApiKey(apiKey.encryptedKey);
  } catch (error) {
    console.error(`Error fetching API key for user: ${userId}, provider: ${provider}:`, error);
    return null;
  }
}

// Send message to OpenAI
async function sendToOpenAI(messages: AIMessage[], model: string, apiKey: string): Promise<AIResponse> {
  try {
    console.log(`Sending request to OpenAI with model: ${model}`);
    
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const choice = response.choices[0];
    if (!choice?.message?.content) {
      throw new Error('No response from OpenAI');
    }

    console.log(`OpenAI response received successfully`);
    
    return {
      content: choice.message.content,
      tokensUsed: response.usage?.total_tokens,
      model: model
    };
  } catch (error) {
    console.error(`OpenAI API Error:`, error);
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('Invalid API key for OpenAI');
      } else if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded for OpenAI');
      } else if (error.message.includes('quota')) {
        throw new Error('OpenAI quota exceeded');
      }
    }
    throw error;
  }
}

// Send message to Anthropic
async function sendToAnthropic(messages: AIMessage[], model: string, apiKey: string): Promise<AIResponse> {
  try {
    console.log(`Sending request to Anthropic with model: ${model}`);
    
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Convert messages format for Anthropic
    const anthropicMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 1000,
      messages: anthropicMessages,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    console.log(`Anthropic response received successfully`);
    
    return {
      content: content.text,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      model: model
    };
  } catch (error) {
    console.error(`Anthropic API Error:`, error);
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('Invalid API key for Anthropic');
      } else if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded for Anthropic');
      }
    }
    throw error;
  }
}

// Send message to OpenRouter
async function sendToOpenRouter(messages: AIMessage[], model: string, apiKey: string): Promise<AIResponse> {
  try {
    console.log(`Sending request to OpenRouter with model: ${model}`);
    
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      defaultHeaders: {
        "HTTP-Referer": "https://norvis.ai", // Site URL for rankings
        "X-Title": "Norvis AI", // Site title for rankings
      },
    });

    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const choice = response.choices[0];
    if (!choice?.message?.content) {
      throw new Error('No response from OpenRouter');
    }

    console.log(`OpenRouter response received successfully`);
    
    return {
      content: choice.message.content,
      tokensUsed: response.usage?.total_tokens,
      model: model
    };
  } catch (error) {
    console.error(`OpenRouter API Error:`, error);
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('Invalid API key for OpenRouter');
      } else if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded for OpenRouter');
      } else if (error.message.includes('quota')) {
        throw new Error('OpenRouter quota exceeded');
      }
    }
    throw error;
  }
}

// Send message to Google Gemini
async function sendToGemini(messages: AIMessage[], model: string, apiKey: string): Promise<AIResponse> {
  try {
    console.log(`Sending request to Google Gemini with model: ${model}`);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model: model });

    // Convert messages to Gemini format
    // Gemini doesn't support system messages, so we'll include system content in the first user message
    const systemMessage = messages.find(msg => msg.role === 'system');
    const conversationMessages = messages.filter(msg => msg.role !== 'system');

    // Build the conversation history
    let prompt = '';
    if (systemMessage) {
      prompt = systemMessage.content + '\n\n';
    }

    // For conversation, we need to format it properly
    if (conversationMessages.length === 1) {
      // Single message (first message)
      prompt += conversationMessages[0].content;
    } else {
      // Multiple messages - format as conversation
      conversationMessages.forEach((msg, index) => {
        if (index === conversationMessages.length - 1) {
          // Last message (current user input)
          prompt += `User: ${msg.content}`;
        } else {
          // Previous messages
          prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
        }
      });
    }

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No response from Gemini');
    }

    console.log(`Gemini response received successfully`);
    
    return {
      content: text,
      tokensUsed: 0, // Gemini doesn't provide token usage in the same way
      model: model
    };
  } catch (error) {
    console.error(`Gemini API Error:`, error);
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('API_KEY')) {
        throw new Error('Invalid API key for Google Gemini');
      } else if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded for Google Gemini');
      } else if (error.message.includes('SAFETY')) {
        throw new Error('Content blocked by Gemini safety filters');
      }
    }
    throw error;
  }
}

// Determine provider from model name
function getProviderFromModel(model: string): string {
  if (model.startsWith('gpt-') || model.startsWith('text-') || model.includes('openai')) {
    return 'openai';
  } else if (model.startsWith('claude-') || model.includes('anthropic')) {
    return 'anthropic';
  } else if (model.startsWith('gemini-') || model.includes('google')) {
    return 'google';
  } else if (model.startsWith('deepseek/') || model.includes('deepseek') || model.includes('DeepSeek') || model.includes('deepseek-chat-v3.1') || model.includes('deepseek-coder')) {
    return 'openrouter';
  } else if (model.startsWith('mistral-') || model.includes('mistral')) {
    return 'mistral';
  } else if (model.includes('cohere')) {
    return 'cohere';
  } else if (model.includes('perplexity') || model.startsWith('pplx-')) {
    return 'perplexity';
  } else if (model.includes('openrouter') || model.includes('/')) {
    // Any model with slash (/) is likely from OpenRouter
    return 'openrouter';
  } else {
    // Default to openrouter for unknown models (since we're using it as primary)
    return 'openrouter';
  }
}

export async function sendToAI(
  messages: Array<{ role: string; content: string }>,
  model: string,
  userId: string
): Promise<string> {
  try {
    const provider = getProviderFromModel(model);
    
    // Use environment variable for OpenRouter API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured in environment variables');
    }
    
    switch (provider) {
      case 'openrouter':
        return await sendToOpenRouter(messages, model, apiKey);
      case 'openai':
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) throw new Error('OpenAI API key not configured');
        return await sendToOpenAI(messages, model, openaiKey);
      case 'anthropic':
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) throw new Error('Anthropic API key not configured');
        return await sendToAnthropic(messages, model, anthropicKey);
      case 'google':
        const googleKey = process.env.GOOGLE_API_KEY;
        if (!googleKey) throw new Error('Google API key not configured');
        return await sendToGemini(messages, model, googleKey);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
}

// Get available models for a user
export async function getAvailableModels(userId: string): Promise<Array<{id: string, name: string, provider: string}>> {
  try {
    console.log('=== FETCHING AVAILABLE MODELS ===');
    console.log(`Fetching models for user: ${userId}`);
    
    // Get user's API keys to determine available providers
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: userId
      },
      select: {
        provider: true
      }
    });

    const providers = apiKeys.map(apiKey => apiKey.provider);
    const models: Array<{id: string, name: string, provider: string}> = [];

    if (providers.includes('openai')) {
      models.push(
        { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' }
      );
    }

    if (providers.includes('anthropic')) {
      models.push(
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic' },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic' }
      );
    }

    if (providers.includes('google')) {
      models.push(
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google' },
        { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google' }
      );
    }

    if (providers.includes('openrouter')) {
      models.push(
        { id: 'deepseek/deepseek-chat-v3.1:free', name: 'DeepSeek Chat v3.1 (Free)', provider: 'openrouter' },
        { id: 'deepseek/deepseek-coder', name: 'DeepSeek Coder', provider: 'openrouter' },
        { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (OpenRouter)', provider: 'openrouter' },
        { id: 'openai/gpt-4o', name: 'GPT-4o (OpenRouter)', provider: 'openrouter' }
      );
    }

    if (providers.includes('mistral')) {
      models.push(
        { id: 'mistral-large', name: 'Mistral Large', provider: 'mistral' },
        { id: 'mistral-medium', name: 'Mistral Medium', provider: 'mistral' }
      );
    }

    console.log(`Found ${providers.length} configured providers: ${providers.join(', ')}`);
    console.log(`Returning ${models.length} available models`);
    console.log('===============================');

    return models;
  } catch (error) {
    console.error('Error fetching available models:', error);
    // Return default mock models even on error
    return [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Mock)', provider: 'openai' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Mock)', provider: 'anthropic' }
    ];
  }
}