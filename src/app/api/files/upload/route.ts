import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { processFile, validateFile } from '@/lib/fileProcessor';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`📁 File upload request: ${file.name} (${file.type}, ${file.size} bytes)`);

    // Validate file
    const validation = validateFile({
      size: file.size,
      mimetype: file.type,
      originalname: file.name
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Process file
    const result = await processFile(buffer, file.name, file.type);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    console.log(`✅ File processed successfully: ${file.name}`);

    return NextResponse.json({
      success: true,
      data: {
        file: result.data,
        message: 'File processed successfully'
      }
    });

  } catch (error) {
    console.error('❌ File upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during file upload' },
      { status: 500 }
    );
  }
}

// Configure the route for file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for large file processing