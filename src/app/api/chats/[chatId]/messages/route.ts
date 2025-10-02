import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { checkMessageLimit, incrementMessageCount } from '@/lib/messageLimit';

// POST /api/chats/[chatId]/messages - Send message to chat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { chatId } = await params;
    const body = await request.json();
    const { content, role = 'user', images, files } = body;

    if (!content && (!files || files.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Message content or files are required' },
        { status: 400 }
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
      return NextResponse.json(
        { success: false, error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Check message limit
    try {
      const limitStatus = await checkMessageLimit(payload.userId);
      
      if (!limitStatus.canSendMessage) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Günlük mesaj limitinize ulaştınız', 
            limitReached: true,
            limit: limitStatus.limit,
            remaining: 0,
            resetsAt: limitStatus.resetsAt,
            isPremium: limitStatus.isPremium
          },
          { status: 429 }
        );
      }
    } catch (error) {
      console.error('Message limit check error:', error);
      // Continue anyway - don't block on limit check failure
    }

    // Process any attached files for AI context ONLY
    let processedFiles: any[] = [];
    let aiEnhancedContent = content || ''; // For AI only
    
    if (files && files.length > 0) {
      try {
        const { processFile } = await import('@/lib/fileProcessor');
        
        for (const fileData of files) {
          if (fileData.buffer && fileData.filename && fileData.mimeType) {
            const buffer = Buffer.from(fileData.buffer, 'base64');
            const result = await processFile(buffer, fileData.filename, fileData.mimeType);
            
            if (result.success && result.data) {
              processedFiles.push(result.data);
              
              // Add file content ONLY to AI context, NOT to user message
              if (result.data.type === 'text' || result.data.type === 'table' || result.data.type === 'code') {
                console.log(`📋 Processing file for AI context only. Type: ${result.data.type}, Content length: ${result.data.content.length}`);
                aiEnhancedContent += '\n\n' + result.data.content;
              } else if (result.data.type === 'image') {
                aiEnhancedContent = aiEnhancedContent || 'Please analyze this image:';
                // Images will be handled separately in AI call
              }
            }
          }
        }
      } catch (error) {
        console.error('File processing error:', error);
      }
    }
    
    // Create user message with ORIGINAL content only (no file content)
    const userMessage = await prisma.message.create({
      data: {
        content: content || '', // Store only user's original message
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
      // This is the first message, update chat title
      const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
      await prisma.chat.update({
        where: { id: chatId },
        data: { title }
      });
    }

    // Generate AI response
    let aiResponseContent = "I'm sorry, I couldn't generate a response. Please make sure you have added your API keys.";
    let aiModel = chat.aiModel;

    try {
      console.log('Starting AI response generation for chat:', chatId);
      
      // Get chat history for context
      const chatMessages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
        take: 10 // Last 10 messages for context
      });

      console.log('Retrieved chat messages:', chatMessages.length);

      // Convert to AI format
      const { sendToAI } = await import('@/lib/ai');
      const aiMessages = chatMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      console.log('📄 Processed', processedFiles.length, 'files for AI');
      processedFiles.forEach(file => {
        console.log(`  - ${file.metadata?.filename}: ${file.type} (${file.metadata?.size} bytes)`);
      });

      // Collect image URLs from processed files
      const imageUrls = processedFiles
        .filter(file => file.type === 'image' && file.base64)
        .map(file => file.base64);

      // CRITICAL FIX: Add AI enhanced content for current message only
      // Previous messages stay as original content, current message gets file context
      if (aiMessages.length > 0) {
        const lastMessage = aiMessages[aiMessages.length - 1];
        if (lastMessage.role === 'user' && lastMessage.content === (content || '')) {
          // This is the message we just created - enhance it for AI with file content
          aiMessages[aiMessages.length - 1] = {
            role: 'user',
            content: aiEnhancedContent, // Enhanced with file content for AI only
            images: imageUrls.length > 0 ? imageUrls : undefined
          };
        } else {
          // Add new enhanced message for AI
          aiMessages.push({
            role: 'user',
            content: aiEnhancedContent, // Enhanced with file content for AI only
            images: imageUrls.length > 0 ? imageUrls : undefined
          });
        }
      } else {
        // Add first message with enhancement
        aiMessages.push({
          role: 'user',
          content: aiEnhancedContent, // Enhanced with file content for AI only
          images: imageUrls.length > 0 ? imageUrls : undefined
        });
      }
      
      console.log('📤 Sending to AI with enhanced content length:', aiEnhancedContent.length);
      console.log('📝 First 500 chars of enhanced content:', aiEnhancedContent.substring(0, 500));
      console.log('💬 Original user message (stored in DB):', content || '');

      console.log('Sending to AI with model:', chat.aiModel, 'userId:', payload.userId);
      
      // Get AI response
      const aiResponse = await sendToAI(aiMessages, chat.aiModel, payload.userId);
      aiResponseContent = aiResponse.content;
      aiModel = aiResponse.model;
      
      console.log('AI response received successfully');

    } catch (error) {
      console.error('=== AI RESPONSE ERROR DETAILS ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', (error as Error)?.message);
      console.error('Error stack:', (error as Error)?.stack);
      console.error('Chat ID:', chatId);
      console.error('AI Model:', chat.aiModel);
      console.error('User ID:', payload.userId);
      console.error('================================');
      
      // Handle specific AI service errors
      if (error instanceof Error) {
        if (error.message.includes('No API key found') || 
            error.message.includes('API key not configured')) {
          aiResponseContent = "API key not configured. Please add your AI provider API keys in settings.";
        } else if (error.message.includes('Invalid API key') || 
                   error.message.includes('Unauthorized')) {
          aiResponseContent = "Invalid API key. Please check your API key configuration.";
        } else if (error.message.includes('Rate limit') || 
                   error.message.includes('quota')) {
          aiResponseContent = "API rate limit exceeded. Please try again later.";
        } else if (error.message.includes('Model not found') || 
                   error.message.includes('model')) {
          aiResponseContent = "Selected AI model is not available. Please choose a different model.";
        } else {
          aiResponseContent = "I encountered an error while generating a response. Please try again or check your API key.";
        }
      } else {
        aiResponseContent = "I encountered an error while generating a response. Please try again or check your API key.";
      }
    }

    const aiMessage = await prisma.message.create({
      data: {
        content: aiResponseContent,
        role: 'assistant',
        chatId
      }
    });

    // Increment message count for user
    try {
      await incrementMessageCount(payload.userId);
    } catch (error) {
      console.error('Failed to increment message count:', error);
      // Don't fail the request if count update fails
    }

    // Get updated chat with new title
    const updatedChat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    // Get updated limit status
    let limitStatus;
    try {
      limitStatus = await checkMessageLimit(payload.userId);
    } catch (error) {
      console.error('Failed to get limit status:', error);
    }

    return NextResponse.json({
      success: true,
      data: {
        userMessage,
        aiMessage,
        chat: updatedChat
      },
      messageLimit: limitStatus ? {
        remaining: limitStatus.remaining,
        limit: limitStatus.limit,
        resetsAt: limitStatus.resetsAt,
        isPremium: limitStatus.isPremium
      } : undefined
    }, { status: 201 });

  } catch (error) {
    console.error('=== SEND MESSAGE ERROR DETAILS ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', (error as Error)?.message);
    console.error('Error stack:', (error as Error)?.stack);
    console.error('Request URL:', request.url);
    console.error('Chat ID:', (await params).chatId);
    console.error('==================================');
    
    // Ensure we always return a proper JSON response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}