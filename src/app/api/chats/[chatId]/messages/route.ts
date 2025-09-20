import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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
    const { content, role = 'user' } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
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

    // Create user message
    const userMessage = await prisma.message.create({
      data: {
        content,
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

      // Add the new user message
      aiMessages.push({
        role: 'user',
        content: content
      });

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

    return NextResponse.json({
      success: true,
      data: {
        userMessage,
        aiMessage,
        chat: updatedChat
      }
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