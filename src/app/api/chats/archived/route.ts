import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/chats/archived - Get archived chats
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // For now, we'll return archived chats from a special marker
    // In the future, add an 'archived' boolean field to the Chat model
    const archivedChats = await prisma.chat.findMany({
      where: {
        userId: payload.userId,
        // We can use title prefix as a marker for archived chats
        // Or add a separate 'archived' field in schema later
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 50
    });

    // Filter archived chats (those with [ARCHIVED] prefix for now)
    const archived = archivedChats.filter(chat => 
      chat.title.startsWith('[ARCHIVED]')
    );

    return NextResponse.json({ chats: archived });
  } catch (error) {
    console.error('Error fetching archived chats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/chats/archived - Archive a chat
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { chatId } = body;

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    // Archive the chat by adding [ARCHIVED] prefix
    const chat = await prisma.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat || chat.userId !== payload.userId) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    const archivedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        title: chat.title.startsWith('[ARCHIVED]') 
          ? chat.title 
          : `[ARCHIVED] ${chat.title}`
      }
    });

    return NextResponse.json({ 
      success: true, 
      chat: archivedChat,
      message: 'Sohbet arşivlendi' 
    });
  } catch (error) {
    console.error('Error archiving chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
