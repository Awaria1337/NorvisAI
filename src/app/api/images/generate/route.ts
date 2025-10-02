import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { generateImage } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

// POST /api/images/generate - Generate image with multiple models
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { prompt, model = 'dall-e-3', messageId } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('🎨 Image generation request:', { 
      userId: payload.userId, 
      prompt, 
      model,
      messageId 
    });

    // Generate image with selected model
    const result = await generateImage(prompt, payload.userId, model);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Save generated image to database if messageId provided
    let savedImage = null;
    if (messageId && result.imageUrl) {
      try {
        savedImage = await prisma.generatedImage.create({
          data: {
            url: result.imageUrl,
            prompt: prompt,
            model: result.model || model,
            size: '1024x1024',
            messageId: messageId
          }
        });
        console.log('✅ Image saved to database:', savedImage.id);
      } catch (dbError) {
        console.error('❌ Failed to save image to database:', dbError);
        // Don't fail the request if DB save fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: result.imageUrl,
        prompt: prompt,
        model: result.model || model,
        imageId: savedImage?.id
      }
    });

  } catch (error) {
    console.error('Image generation API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
