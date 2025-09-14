import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from './prisma';

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
      return null;
    }

    // In a real app, you'd decrypt the key here
    // For now, we'll assume it's stored as plain text (NOT RECOMMENDED for production)
    return apiKey.encryptedKey;
  } catch (error) {
    console.error('Error fetching API key:', error);
    return null;
  }
}

// Send message to OpenAI
async function sendToOpenAI(messages: AIMessage[], model: string, apiKey: string): Promise<AIResponse> {
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

  return {
    content: choice.message.content,
    tokensUsed: response.usage?.total_tokens,
    model: model
  };
}

// Send message to Anthropic
async function sendToAnthropic(messages: AIMessage[], model: string, apiKey: string): Promise<AIResponse> {
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

  return {
    content: content.text,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    model: model
  };
}

// Determine provider from model name
function getProviderFromModel(model: string): string {
  if (model.startsWith('gpt-') || model.startsWith('text-')) {
    return 'openai';
  } else if (model.startsWith('claude-')) {
    return 'anthropic';
  } else {
    throw new Error(`Unsupported model: ${model}`);
  }
}

// Main function to send message to AI
export async function sendToAI(messages: AIMessage[], model: string, userId: string): Promise<AIResponse> {
  const provider = getProviderFromModel(model);
  const apiKey = await getUserApiKey(userId, provider);

  if (!apiKey) {
    throw new Error(`No API key found for provider: ${provider}`);
  }

  try {
    switch (provider) {
      case 'openai':
        return await sendToOpenAI(messages, model, apiKey);
      case 'anthropic':
        return await sendToAnthropic(messages, model, apiKey);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error with ${provider}:`, error);
    throw new Error(`Failed to get response from ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get available models for a user
export async function getAvailableModels(userId: string): Promise<string[]> {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: userId
      },
      select: {
        provider: true
      }
    });

    const providers = apiKeys.map(apiKey => apiKey.provider);
    const models: string[] = [];

    if (providers.includes('openai')) {
      models.push('gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo');
    }

    if (providers.includes('anthropic')) {
      models.push('claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307');
    }

    return models;
  } catch (error) {
    console.error('Error fetching available models:', error);
    return [];
  }
}