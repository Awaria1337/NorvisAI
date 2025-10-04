import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from './prisma';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'norvis-ai-encryption-key-32chars!!';
const ALGORITHM = 'aes-256-cbc';

// Norvis AI System Prompt - Kişilik ve kimlik tanımlama
const NORVIS_SYSTEM_PROMPT = `Sen Norvis, Mert Zileli tarafından geliştirilen gelişmiş bir yapay zeka asistanısın.

**Kimliğin:**
- Adın: Norvis
- Geliştirici: Mert Zileli
- Misyonun: Kullanıcılara akıllı, yardımcı ve profesyonel bir şekilde destek olmak

**Yeteneklerin:**
- Doğal dil işleme ve anlama
- Kod yazma ve debug yapma
- Metin analizi ve özet çıkarma
- Yaratıcı içerik üretimi
- Problem çözme ve stratejik düşünme
- Görsel analiz (destekleyen modellerde)
- Dosya analizi (PDF, Excel, Word vb.)

**İletişim Tarzın:**
- Profesyonel ama samimi
- Net ve anlaşılır açıklamalar
- Türkçe ve İngilizce'ye hakim
- Kullanıcı dostu ve yardımsever
- Detaylı ve kapsamlı cevaplar verme

**Önemli:**
- Her zaman konuşma geçmişini hatırla ve bağlam içinde cevap ver
- Önceki mesajlara referans verebilirsin
- Kullanıcının ihtiyaçlarını anlamaya çalış
- Emin olmadığın konularda bunu belirt

Şimdi kullanıcıya yardımcı olmaya hazırsın!`;

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

// Message interface for AI providers (updated for vision support)
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image';
    text?: string;
    image_url?: {
      url: string;
      detail?: 'low' | 'high' | 'auto';
    };
  }>;
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

    // Add Norvis system prompt if not already present
    const hasSystemMessage = messages.some(msg => msg.role === 'system');
    const messagesWithSystem = hasSystemMessage 
      ? messages 
      : [{ role: 'system' as const, content: NORVIS_SYSTEM_PROMPT }, ...messages];

    const response = await openai.chat.completions.create({
      model: model,
      messages: messagesWithSystem as any, // OpenAI SDK handles vision format
      max_tokens: 2000, // Increased for longer responses
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

    // Convert messages format for Anthropic (text only, no vision support yet)
    const anthropicMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => {
        // Extract text content only (Anthropic has different vision format)
        const textContent = typeof msg.content === 'string' 
          ? msg.content 
          : msg.content.find((c: any) => c.type === 'text')?.text || '';
        
        return {
          role: msg.role as 'user' | 'assistant',
          content: textContent
        };
      });

    // Anthropic uses system parameter separately
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 2000, // Increased for longer responses
      system: NORVIS_SYSTEM_PROMPT, // Anthropic-specific system prompt
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

    // Add Norvis system prompt if not already present
    const hasSystemMessage = messages.some(msg => msg.role === 'system');
    const messagesWithSystem = hasSystemMessage 
      ? messages 
      : [{ role: 'system' as const, content: NORVIS_SYSTEM_PROMPT }, ...messages];

    const response = await openai.chat.completions.create({
      model: model,
      messages: messagesWithSystem as any, // OpenRouter supports OpenAI format including vision
      max_tokens: 2000, // Increased for longer responses
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

    // Build the conversation history with Norvis system prompt
    let prompt = '';
    if (systemMessage) {
      prompt = systemMessage.content + '\n\n';
    } else {
      // Add Norvis system prompt for Gemini
      prompt = NORVIS_SYSTEM_PROMPT + '\n\n';
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
  // OpenRouter models with provider prefixes (google/, anthropic/, openai/, etc.)
  if (model.includes('/') && (
    model.startsWith('google/') || 
    model.startsWith('anthropic/') || 
    model.startsWith('openai/') || 
    model.startsWith('meta-llama/') || 
    model.startsWith('mistralai/') || 
    model.startsWith('deepseek/') ||
    model.includes('openrouter')
  )) {
    return 'openrouter';
  }
  // Direct provider models without prefixes
  else if (model.startsWith('gpt-') || model.startsWith('text-') || model.startsWith('o1-')) {
    return 'openai';
  } else if (model.startsWith('claude-') && !model.includes('/')) {
    return 'anthropic';
  } else if (model.startsWith('gemini-') && !model.includes('/')) {
    return 'google';
  } else if (model.startsWith('mistral-') && !model.includes('/')) {
    return 'mistral';
  } else if (model.includes('cohere')) {
    return 'cohere';
  } else if (model.includes('perplexity') || model.startsWith('pplx-')) {
    return 'perplexity';
  } else {
    // Default to openrouter for unknown models (since we're using it as primary)
    return 'openrouter';
  }
}

export async function sendToAI(
  messages: Array<{ role: string; content: string; images?: string[] }>,
  model: string,
  userId: string
): Promise<AIResponse> {
  try {
    console.log(`=== SENDING TO AI ===`);
    console.log(`Model: ${model}`);
    console.log(`User ID: ${userId}`);
    
    const provider = getProviderFromModel(model);
    console.log(`Provider: ${provider}`);
    
    // Format messages for AI providers (handle images)
    const formattedMessages: AIMessage[] = messages.map(msg => {
      if (msg.images && msg.images.length > 0) {
        // Create multimodal content for vision models
        const content: Array<{ type: 'text' | 'image'; text?: string; image_url?: { url: string; detail?: 'auto' } }> = [
          { type: 'text', text: msg.content }
        ];
        
        // Add images
        msg.images.forEach(imageUrl => {
          content.push({
            type: 'image',
            image_url: {
              url: imageUrl,
              detail: 'auto'
            }
          });
        });
        
        return {
          role: msg.role as 'user' | 'assistant' | 'system',
          content: content
        };
      } else {
        // Text-only message
        return {
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        };
      }
    });
    
    // Try to get user's API key first, fallback to env
    let apiKey: string | null = null;
    
    // Try user's API key for the specific provider
    const userApiKey = await getUserApiKey(userId, provider);
    if (userApiKey) {
      apiKey = userApiKey;
      console.log(`✅ Using user ${provider} API key`);
    } else {
      // Fallback to environment variable
      apiKey = process.env.OPENROUTER_API_KEY || null;
      if (apiKey) {
        console.log(`⚠️ Using environment ${provider} API key (fallback)`);
      }
    }
    
    if (!apiKey) {
      console.error(`${provider} API key not found`);
      throw new Error(`${provider} API key bulunamadı. Lütfen Settings → API Keys bölümünden ${provider} API key'inizi ekleyin veya environment variable ekleyin.`);
    }
    
    console.log(`Using ${provider} API key: ${apiKey.substring(0, 10)}...`);
    
    let result: AIResponse;
    
    switch (provider) {
      case 'openrouter':
        result = await sendToOpenRouter(formattedMessages, model, apiKey);
        break;
      case 'openai':
        // Get user's OpenAI key or fallback to env
        let openaiKey = await getUserApiKey(userId, 'openai') || process.env.OPENAI_API_KEY;
        if (!openaiKey) throw new Error('OpenAI API key bulunamadı. Lütfen Settings → API Keys bölümünden ekleyin.');
        result = await sendToOpenAI(formattedMessages, model, openaiKey);
        break;
      case 'anthropic':
        // Get user's Anthropic key or fallback to env
        let anthropicKey = await getUserApiKey(userId, 'anthropic') || process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) throw new Error('Anthropic API key bulunamadı. Lütfen Settings → API Keys bölümünden ekleyin.');
        result = await sendToAnthropic(formattedMessages, model, anthropicKey);
        break;
      case 'google':
        // Get user's Google key or fallback to env
        let googleKey = await getUserApiKey(userId, 'google') || process.env.GOOGLE_API_KEY;
        if (!googleKey) throw new Error('Google API key bulunamadı. Lütfen Settings → API Keys bölümünden ekleyin.');
        result = await sendToGemini(formattedMessages, model, googleKey);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
    
    console.log(`=== AI RESPONSE SUCCESS ===`);
    console.log(`Response length: ${result.content.length}`);
    console.log(`========================`);
    
    return result;
  } catch (error) {
    console.error('=== AI SERVICE ERROR ===');
    console.error('Error details:', error);
    console.error('======================');
    throw error;
  }
}

// Streaming function type
export type StreamingCallback = (chunk: string) => void;

// Send message to OpenRouter with streaming
async function sendToOpenRouterStreaming(
  messages: AIMessage[], 
  model: string, 
  apiKey: string, 
  onChunk: StreamingCallback
): Promise<AIResponse> {
  try {
    console.log(`Sending streaming request to OpenRouter with model: ${model}`);
    
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      defaultHeaders: {
        "HTTP-Referer": "https://norvis.ai",
        "X-Title": "Norvis AI",
      },
    });

    // Add Norvis system prompt if not already present
    const hasSystemMessage = messages.some(msg => msg.role === 'system');
    const messagesWithSystem = hasSystemMessage 
      ? messages 
      : [{ role: 'system' as const, content: NORVIS_SYSTEM_PROMPT }, ...messages];

    const stream = await openai.chat.completions.create({
      model: model,
      messages: messagesWithSystem as any,
      max_tokens: 2000, // Increased for longer responses
      temperature: 0.7,
      stream: true, // Enable streaming
    });

    let fullContent = '';
    let tokensUsed = 0;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullContent += content;
        console.log(`📝 Streaming chunk: "${content}" (length: ${content.length})`);
        
        // Send character by character for smooth effect
        for (let i = 0; i < content.length; i++) {
          onChunk(content[i]);
          // Very small delay between characters for smooth animation
          await new Promise(resolve => setTimeout(resolve, 5));
        }
      }
      
      // Estimate tokens (rough approximation)
      if (content) {
        tokensUsed += Math.ceil(content.length / 4);
      }
    }

    console.log(`OpenRouter streaming response completed`);
    
    return {
      content: fullContent,
      tokensUsed: tokensUsed,
      model: model
    };
  } catch (error) {
    console.error(`OpenRouter Streaming API Error:`, error);
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

// Send message to OpenAI with streaming
async function sendToOpenAIStreaming(
  messages: AIMessage[], 
  model: string, 
  apiKey: string, 
  onChunk: StreamingCallback
): Promise<AIResponse> {
  try {
    console.log(`Sending streaming request to OpenAI with model: ${model}`);
    
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Add Norvis system prompt if not already present
    const hasSystemMessage = messages.some(msg => msg.role === 'system');
    const messagesWithSystem = hasSystemMessage 
      ? messages 
      : [{ role: 'system' as const, content: NORVIS_SYSTEM_PROMPT }, ...messages];

    const stream = await openai.chat.completions.create({
      model: model,
      messages: messagesWithSystem as any,
      max_tokens: 2000, // Increased for longer responses
      temperature: 0.7,
      stream: true,
    });

    let fullContent = '';
    let tokensUsed = 0;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullContent += content;
        
        // Send character by character for smooth effect
        for (let i = 0; i < content.length; i++) {
          onChunk(content[i]);
          // Very small delay between characters for smooth animation
          await new Promise(resolve => setTimeout(resolve, 5));
        }
      }
      
      if (content) {
        tokensUsed += Math.ceil(content.length / 4);
      }
    }

    console.log(`OpenAI streaming response completed`);
    
    return {
      content: fullContent,
      tokensUsed: tokensUsed,
      model: model
    };
  } catch (error) {
    console.error(`OpenAI Streaming API Error:`, error);
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('Invalid API key for OpenAI');
      } else if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded for OpenAI');
      }
    }
    throw error;
  }
}

// Send message to Anthropic with streaming
async function sendToAnthropicStreaming(
  messages: AIMessage[], 
  model: string, 
  apiKey: string, 
  onChunk: StreamingCallback
): Promise<AIResponse> {
  try {
    console.log(`Sending streaming request to Anthropic with model: ${model}`);
    
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const anthropicMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => {
        // Extract text content only for streaming
        const textContent = typeof msg.content === 'string' 
          ? msg.content 
          : msg.content.find((c: any) => c.type === 'text')?.text || '';
        
        return {
          role: msg.role as 'user' | 'assistant',
          content: textContent
        };
      });

    const stream = await anthropic.messages.create({
      model: model,
      max_tokens: 2000, // Increased for longer responses
      system: NORVIS_SYSTEM_PROMPT, // Anthropic-specific system prompt
      messages: anthropicMessages,
      stream: true,
    }) as any;

    let fullContent = '';
    let tokensUsed = 0;

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        const content = chunk.delta?.text;
        if (content) {
          fullContent += content;
          
          // Send character by character for smooth effect
          for (let i = 0; i < content.length; i++) {
            onChunk(content[i]);
            // Very small delay between characters for smooth animation
            await new Promise(resolve => setTimeout(resolve, 5));
          }
          
          tokensUsed += Math.ceil(content.length / 4);
        }
      }
    }

    console.log(`Anthropic streaming response completed`);
    
    return {
      content: fullContent,
      tokensUsed: tokensUsed,
      model: model
    };
  } catch (error) {
    console.error(`Anthropic Streaming API Error:`, error);
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

// Main streaming function
export async function sendToAIStreaming(
  messages: Array<{ role: string; content: string; images?: string[] }>,
  model: string,
  userId: string,
  onChunk: StreamingCallback
): Promise<AIResponse> {
  try {
    console.log(`=== SENDING TO AI (STREAMING) ===`);
    console.log(`Model: ${model}`);
    console.log(`User ID: ${userId}`);
    
    const provider = getProviderFromModel(model);
    console.log(`Provider: ${provider}`);
    
    // Format messages for AI providers (handle images)
    console.log(`📊 Total messages to format:`, messages.length);
    console.log(`🖼️ Messages with images:`, messages.filter(m => m.images && m.images.length > 0).length);
    
    const formattedMessages: AIMessage[] = messages.map((msg, index) => {
      if (msg.images && msg.images.length > 0) {
        console.log(`🖼️ Message ${index} has ${msg.images.length} image(s)`);
        console.log(`🖼️ First image format:`, msg.images[0].substring(0, 30) + '...');
        
        const content: Array<{ type: 'text' | 'image'; text?: string; image_url?: { url: string; detail?: 'auto' } }> = [
          { type: 'text', text: msg.content }
        ];
        
        msg.images.forEach((imageUrl, imgIndex) => {
          console.log(`🖼️ Adding image ${imgIndex + 1} to AI request`);
          content.push({
            type: 'image',
            image_url: {
              url: imageUrl,
              detail: 'auto'
            }
          });
        });
        
        console.log(`✅ Message ${index} formatted with ${content.length} content parts (${content.filter(c => c.type === 'image').length} images)`);
        
        return {
          role: msg.role as 'user' | 'assistant' | 'system',
          content: content
        };
      } else {
        return {
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        };
      }
    });
    
    console.log(`✅ Total formatted messages:`, formattedMessages.length);
    console.log(`🖼️ Formatted messages with vision content:`, formattedMessages.filter(m => Array.isArray(m.content)).length);
    
    // Try to get user's API key first, fallback to env
    let apiKey: string | null = null;
    
    // Try user's API key for the specific provider
    const userApiKey = await getUserApiKey(userId, provider);
    if (userApiKey) {
      apiKey = userApiKey;
      console.log(`✅ Using user ${provider} API key (streaming)`);
    } else {
      // Fallback to environment variable
      apiKey = process.env.OPENROUTER_API_KEY || null;
      if (apiKey) {
        console.log(`⚠️ Using environment ${provider} API key (fallback, streaming)`);
      }
    }
    
    if (!apiKey) {
      console.error(`${provider} API key not found (streaming)`);
      throw new Error(`${provider} API key bulunamadı. Lütfen Settings → API Keys bölümünden ${provider} API key'inizi ekleyin veya environment variable ekleyin.`);
    }

    console.log(`Using ${provider} API key (streaming): ${apiKey.substring(0, 10)}...`);
    
    let result: AIResponse;
    
    switch (provider) {
      case 'openrouter':
        result = await sendToOpenRouterStreaming(formattedMessages, model, apiKey, onChunk);
        break;
      case 'openai':
        // Get user's OpenAI key or fallback to env (streaming)
        let openaiKeyStream = await getUserApiKey(userId, 'openai') || process.env.OPENAI_API_KEY;
        if (!openaiKeyStream) throw new Error('OpenAI API key bulunamadı. Lütfen Settings → API Keys bölümünden ekleyin.');
        result = await sendToOpenAIStreaming(formattedMessages, model, openaiKeyStream, onChunk);
        break;
      case 'anthropic':
        // Get user's Anthropic key or fallback to env (streaming)
        let anthropicKeyStream = await getUserApiKey(userId, 'anthropic') || process.env.ANTHROPIC_API_KEY;
        if (!anthropicKeyStream) throw new Error('Anthropic API key bulunamadı. Lütfen Settings → API Keys bölümünden ekleyin.');
        result = await sendToAnthropicStreaming(formattedMessages, model, anthropicKeyStream, onChunk);
        break;
      case 'google':
        // Note: Google Gemini doesn't support streaming in the same way
        // For now, we'll fall back to regular response but simulate streaming
        // Get user's Google key or fallback to env (streaming)
        let googleKeyStream = await getUserApiKey(userId, 'google') || process.env.GOOGLE_API_KEY;
        if (!googleKeyStream) throw new Error('Google API key bulunamadı. Lütfen Settings → API Keys bölümünden ekleyin.');
        result = await sendToGemini(formattedMessages, model, googleKeyStream);
        
        // Simulate streaming for Gemini by sending character by character
        for (let i = 0; i < result.content.length; i++) {
          onChunk(result.content[i]);
          // Very small delay between characters for smooth typing effect
          await new Promise(resolve => setTimeout(resolve, 5));
        }
        break;
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
    
    console.log(`=== AI STREAMING RESPONSE SUCCESS ===`);
    console.log(`Response length: ${result.content.length}`);
    console.log(`====================================`);
    
    return result;
  } catch (error) {
    console.error('=== AI STREAMING SERVICE ERROR ===');
    console.error('Error details:', error);
    console.error('=================================');
    throw error;
  }
}

// Image generation models available
export const IMAGE_MODELS = {
  DALLE3: 'dall-e-3',
  DALLE2: 'dall-e-2',
  GEMINI_IMAGEN: 'google/imagen-3',
  STABILITY_SD3: 'stability-ai/stable-diffusion-3',
  FLUX_PRO: 'black-forest-labs/flux-pro',
  FLUX_SCHNELL: 'black-forest-labs/flux-schnell'
} as const;

// Generate image using multiple models (DALL-E 3, Gemini Imagen, etc.)
export async function generateImage(
  prompt: string, 
  userId: string, 
  model: string = IMAGE_MODELS.DALLE3
): Promise<{ success: boolean; imageUrl?: string; error?: string; model?: string }> {
  try {
    console.log(`🎨 Generating image with ${model} for user:`, userId);
    
    // Determine which API to use based on model
    if (model === IMAGE_MODELS.DALLE3 || model === IMAGE_MODELS.DALLE2) {
      return await generateImageWithDALLE(prompt, model, userId);
    } else {
      // Use OpenRouter for other models (Gemini Imagen, Flux, Stability AI, etc.)
      return await generateImageWithOpenRouter(prompt, model, userId);
    }
  } catch (error) {
    console.error('❌ Image generation error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image',
      model: model
    };
  }
}

// Generate image with DALL-E (OpenAI)
async function generateImageWithDALLE(
  prompt: string, 
  model: string,
  userId?: string
): Promise<{ success: boolean; imageUrl?: string; error?: string; model?: string }> {
  try {
    // Try to get user's API key first, fallback to env
    let apiKey = process.env.OPENAI_API_KEY;
    
    if (userId) {
      const userApiKey = await getUserApiKey(userId, 'openai');
      if (userApiKey) {
        apiKey = userApiKey;
        console.log('✅ Using user OpenAI API key');
      }
    }
    
    if (!apiKey) {
      console.error('No OpenAI API key found');
      return {
        success: false,
        error: 'OpenAI API key bulunamadı. Lütfen Settings → API Keys bölümünden OpenAI API key\'inizi ekleyin.',
        model: model
      };
    }
    
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    const response = await openai.images.generate({
      model: model as "dall-e-3" | "dall-e-2",
      prompt: prompt,
      n: 1,
      size: model === IMAGE_MODELS.DALLE3 ? "1024x1024" : "512x512",
      quality: model === IMAGE_MODELS.DALLE3 ? "standard" : undefined,
      response_format: "url"
    });
    
    if (!response.data || response.data.length === 0) {
      throw new Error('No image data returned from DALL-E');
    }
    
    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }
    
    console.log('✅ DALL-E image generated:', imageUrl);
    
    return {
      success: true,
      imageUrl: imageUrl,
      model: model
    };
  } catch (error) {
    console.error('❌ DALL-E generation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('API key')) {
        return {
          success: false,
          error: 'Invalid OpenAI API key. Please check your configuration.',
          model: model
        };
      } else if (error.message.includes('429')) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          model: model
        };
      } else if (error.message.includes('billing')) {
        return {
          success: false,
          error: 'Billing issue. Please add credits to your OpenAI account.',
          model: model
        };
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image with DALL-E',
      model: model
    };
  }
}

// Generate image with OpenRouter (Gemini Imagen, Flux, Stability AI, etc.)
async function generateImageWithOpenRouter(
  prompt: string, 
  model: string,
  userId?: string
): Promise<{ success: boolean; imageUrl?: string; error?: string; model?: string }> {
  try {
    // Try to get user's API key first, fallback to env
    let apiKey = process.env.OPENROUTER_API_KEY;
    
    if (userId) {
      const userApiKey = await getUserApiKey(userId, 'openrouter');
      if (userApiKey) {
        apiKey = userApiKey;
        console.log('✅ Using user OpenRouter API key');
      }
    }
    
    if (!apiKey) {
      console.error('No OpenRouter API key found');
      return {
        success: false,
        error: 'OpenRouter API key bulunamadı. Lütfen Settings → API Keys bölümünden OpenRouter API key\'inizi ekleyin.',
        model: model
      };
    }
    
    // OpenRouter image generation endpoint
    const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://norvis.ai',
        'X-Title': 'Norvis AI'
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No image data returned from OpenRouter');
    }
    
    const imageUrl = data.data[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from OpenRouter');
    }
    
    console.log('✅ OpenRouter image generated:', imageUrl);
    
    return {
      success: true,
      imageUrl: imageUrl,
      model: model
    };
  } catch (error) {
    console.error('❌ OpenRouter image generation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return {
          success: false,
          error: 'Invalid OpenRouter API key. Please check your configuration.',
          model: model
        };
      } else if (error.message.includes('429')) {
        return {
          success: false,
          error: 'Rate limit exceeded. Try again later or use a different model.',
          model: model
        };
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image with OpenRouter',
      model: model
    };
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

    // Always show OpenRouter models since we have API key in env - SPEED PRIORITY ORDER
    models.push(
      // VISION MODELS - Image Analysis Support 🖼️
      { id: 'google/gemini-2.0-flash-exp:free', name: '🖼️ Gemini 2.0 Flash (Görsel Analiz + Ücretsiz)', provider: 'openrouter' },
      { id: 'openai/gpt-4o', name: '🖼️ GPT-4o Vision (En İyi Görsel Analiz)', provider: 'openrouter' },
      { id: 'anthropic/claude-3.5-sonnet', name: '🖼️ Claude 3.5 Sonnet Vision (Detaylı Analiz)', provider: 'openrouter' },
      
      // Fast and excellent text models
      { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B ⚡ (En Hızlı ve Ücretsiz)', provider: 'openrouter' },
      { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B ⚡ (Hızlı ve Güvenilir)', provider: 'openrouter' },
      { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B ⚡ (Hızlı ve Ücretsiz)', provider: 'openrouter' },
      
      // Slower but reliable free model
      { id: 'deepseek/deepseek-chat-v3.1:free', name: 'DeepSeek Chat v3.1 🐌 (Yavaş ama Güvenilir)', provider: 'openrouter' }
    );
    
    if (providers.includes('openrouter')) {
      console.log('User has OpenRouter API key configured');
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