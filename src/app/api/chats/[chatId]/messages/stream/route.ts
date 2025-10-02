import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { checkMessageLimit, incrementMessageCount } from '@/lib/messageLimit';

// POST /api/chats/[chatId]/messages/stream - Send message with streaming response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { chatId } = await params;
    const body = await request.json();
    const { content, role = 'user', images, files } = body;

    if (!content && (!files || files.length === 0)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Message content or files are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify chat belongs to user
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: payload.userId
      }
    });

    if (!chat) {
      return new Response(
        JSON.stringify({ success: false, error: 'Chat not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check message limit
    try {
      const limitStatus = await checkMessageLimit(payload.userId);
      
      if (!limitStatus.canSendMessage) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Aylık mesaj limitinize ulaştınız', 
            limitReached: true,
            limit: limitStatus.limit,
            remaining: 0,
            resetsAt: limitStatus.resetsAt,
            isPremium: limitStatus.isPremium
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error('Message limit check error:', error);
      // Continue anyway - don't block on limit check failure
    }

    // Process any attached files for AI context ONLY
    let processedFiles: any[] = [];
    let aiEnhancedContent = content || '';
    
    if (files && files.length > 0) {
      try {
        const { processFile } = await import('@/lib/fileProcessor');
        
        for (const fileData of files) {
          if (fileData.buffer && fileData.filename && fileData.mimeType) {
            const buffer = Buffer.from(fileData.buffer, 'base64');
            const result = await processFile(buffer, fileData.filename, fileData.mimeType);
            
            if (result.success && result.data) {
              processedFiles.push(result.data);
              
              if (result.data.type === 'text' || result.data.type === 'table' || result.data.type === 'code') {
                aiEnhancedContent += '\n\n' + result.data.content;
              } else if (result.data.type === 'image') {
                aiEnhancedContent = aiEnhancedContent || 'Please analyze this image:';
              }
            }
          }
        }
      } catch (error) {
        console.error('File processing error:', error);
      }
    }
    
    // Create user message with ORIGINAL content only
    const userMessage = await prisma.message.create({
      data: {
        content: content || '',
        role,
        chatId
      }
    });

    // Update chat's updatedAt timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    // Update chat title if this is the first message
    const messageCount = await prisma.message.count({
      where: { chatId }
    });

    if (messageCount === 1) {
      const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
      await prisma.chat.update({
        where: { id: chatId },
        data: { title }
      });
    }

    // Create Server-Sent Events response
    const encoder = new TextEncoder();
    let aiMessageId: string | null = null;
    let fullAiResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        let isAborted = false;
        
        // Listen for abort signal
        request.signal?.addEventListener('abort', () => {
          console.log('🛑 Stream aborted by client - stopping AI generation');
          isAborted = true;
          controller.close();
        });
        
        try {
          // Send initial user message
          const userMessageData = JSON.stringify({
            type: 'userMessage',
            data: userMessage
          });
          controller.enqueue(encoder.encode(`data: ${userMessageData}\n\n`));

          // Create placeholder AI message
          const aiMessage = await prisma.message.create({
            data: {
              content: '',
              role: 'assistant',
              chatId
            }
          });
          aiMessageId = aiMessage.id;

          // Send AI message start
          const aiMessageStartData = JSON.stringify({
            type: 'aiMessageStart',
            data: { id: aiMessage.id, role: 'assistant' }
          });
          controller.enqueue(encoder.encode(`data: ${aiMessageStartData}\n\n`));

          // Get chat history for context
          const chatMessages = await prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' },
            take: 10
          });

          // Convert to AI format with enhanced content
          const { sendToAIStreaming } = await import('@/lib/ai');
          const aiMessages = chatMessages
            .filter(msg => msg.id !== aiMessage.id) // Exclude the empty AI message we just created
            .map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            }));

          // Add current message with enhancement
          const imageUrls = processedFiles
            .filter(file => file.type === 'image' && file.base64)
            .map(file => file.base64);

          aiMessages.push({
            role: 'user',
            content: aiEnhancedContent,
            images: imageUrls.length > 0 ? imageUrls : undefined
          });

          console.log('🚀 Starting streaming AI response for chat:', chatId);
          
          // Stream AI response with abort handling
          try {
            await sendToAIStreaming(
              aiMessages,
              chat.aiModel,
              payload.userId,
              (chunk: string) => {
                // Check if stream was aborted
                if (isAborted) {
                  console.log('🛑 Skipping chunk - stream aborted');
                  throw new Error('STREAMING_ABORTED'); // Stop AI streaming
                }
                
                fullAiResponse += chunk;
                
                // Send chunk to client
                const chunkData = JSON.stringify({
                  type: 'chunk',
                  data: { id: aiMessage.id, chunk, fullContent: fullAiResponse }
                });
                controller.enqueue(encoder.encode(`data: ${chunkData}\n\n`));
              }
            );
          } catch (error) {
            // If streaming was aborted, that's expected
            if (error instanceof Error && error.message === 'STREAMING_ABORTED') {
              console.log('🛑 AI streaming stopped due to client abort');
            } else {
              throw error; // Re-throw other errors
            }
          }

          // Update the AI message with full content (only if not aborted)
          if (!isAborted) {
            await prisma.message.update({
              where: { id: aiMessage.id },
              data: { content: fullAiResponse }
            });

            // Increment message count for user
            try {
              await incrementMessageCount(payload.userId);
            } catch (error) {
              console.error('Failed to increment message count:', error);
              // Don't fail the request if count update fails
            }

            // Send completion signal
            const completeData = JSON.stringify({
              type: 'complete',
              data: { id: aiMessage.id, content: fullAiResponse }
            });
            controller.enqueue(encoder.encode(`data: ${completeData}\\n\\n`));

            console.log('✅ Streaming completed successfully');
          } else {
            // Save partial content if aborted
            await prisma.message.update({
              where: { id: aiMessage.id },
              data: { content: fullAiResponse } // This will be the partial content
            });
            console.log('🛑 Streaming aborted - saved partial content:', fullAiResponse.length, 'characters');
          }
          controller.close();

        } catch (error) {
          console.error('❌ Streaming error:', error);
          
          let errorMessage = "I encountered an error while generating a response. Please try again or check your API key.";
          
          if (error instanceof Error) {
            if (error.message.includes('No API key found') || 
                error.message.includes('API key not configured')) {
              errorMessage = "API key not configured. Please add your AI provider API keys in settings.";
            } else if (error.message.includes('Invalid API key') || 
                       error.message.includes('Unauthorized')) {
              errorMessage = "Invalid API key. Please check your API key configuration.";
            } else if (error.message.includes('Rate limit') || 
                       error.message.includes('quota')) {
              errorMessage = "API rate limit exceeded. Please try again later.";
            }
          }

          // If we have an AI message ID, update it with error
          if (aiMessageId) {
            await prisma.message.update({
              where: { id: aiMessageId },
              data: { content: errorMessage }
            });

            const errorData = JSON.stringify({
              type: 'error',
              data: { id: aiMessageId, content: errorMessage, error: error instanceof Error ? error.message : 'Unknown error' }
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          }

          controller.close();
        }
      },

      cancel() {
        console.log('🛑 Client disconnected from stream');
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('=== STREAMING ERROR DETAILS ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', (error as Error)?.message);
    console.error('Error stack:', (error as Error)?.stack);
    console.error('===============================');
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}