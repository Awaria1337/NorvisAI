import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// DELETE /api/chats/[chatId] - Delete a specific chat
export async function DELETE(
  request: NextRequest,
  { params }: { params: { chatId: string } }
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

    const { chatId } = params;

    // Verify chat exists and belongs to user
    const existingChat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: payload.userId
      }
    });

    if (!existingChat) {
      return NextResponse.json(
        { success: false, error: 'Chat not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the chat (this will cascade delete messages due to foreign key constraints)
    await prisma.chat.delete({
      where: {
        id: chatId
      }
    });

    console.log(`✅ Chat deleted: ${chatId} by user: ${payload.userId}`);

    return NextResponse.json({
      success: true,
      message: 'Chat deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/chats/[chatId] - Get a specific chat with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
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

    const { chatId } = params;

    // Fetch specific chat with messages
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: payload.userId
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!chat) {
      return NextResponse.json(
        { success: false, error: 'Chat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: chat
    });

  } catch (error) {
    console.error('Get chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/chats/[chatId] - Update chat title
export async function PATCH(
  request: NextRequest,
  { params }: { params: { chatId: string } }
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

    const { chatId } = params;
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Valid title is required' },
        { status: 400 }
      );
    }

    if (title.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: 'Title cannot exceed 100 characters' },
        { status: 400 }
      );
    }

    // Verify chat exists and belongs to user
    const existingChat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: payload.userId
      }
    });

    if (!existingChat) {
      return NextResponse.json(
        { success: false, error: 'Chat not found or access denied' },
        { status: 404 }
      );
    }

    // Update the chat title
    const updatedChat = await prisma.chat.update({
      where: {
        id: chatId
      },
      data: {
        title: title.trim()
      }
    });

    console.log(`✅ Chat title updated: ${chatId} - "${title.trim()}" by user: ${payload.userId}`);

    return NextResponse.json({
      success: true,
      data: updatedChat
    });

  } catch (error) {
    console.error('Update chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
