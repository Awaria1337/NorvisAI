/**
 * Guest Chat API
 * Handles chat requests for non-authenticated users with 3 message limit
 * IP-based rate limiting to prevent abuse
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendAIMessage } from '@/lib/ai';

const MAX_GUEST_MESSAGES = 3;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

// In-memory store for IP-based rate limiting
// In production, use Redis or similar
const ipMessageCount = new Map<string, { count: number; timestamp: number }>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipMessageCount.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      ipMessageCount.delete(ip);
    }
  }
}, 5 * 60 * 1000);

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, messageCount = 0 } = body;
    
    // Get client IP
    const clientIP = getClientIP(request);
    
    // Check IP-based rate limit
    const now = Date.now();
    const ipData = ipMessageCount.get(clientIP);
    
    if (ipData) {
      // Reset if window expired
      if (now - ipData.timestamp > RATE_LIMIT_WINDOW) {
        ipMessageCount.set(clientIP, { count: 0, timestamp: now });
      } else if (ipData.count >= MAX_GUEST_MESSAGES) {
        return NextResponse.json(
          {
            success: false,
            error: 'Misafir kullanıcı limiti aşıldı',
            message: 'Bu IP adresinden 1 saat içinde maksimum mesaj limitine ulaştınız. Lütfen kayıt olun veya 1 saat sonra tekrar deneyin.',
            needsRegistration: true
          },
          { status: 429 }
        );
      }
    } else {
      ipMessageCount.set(clientIP, { count: 0, timestamp: now });
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Mesaj boş olamaz' },
        { status: 400 }
      );
    }

    // Check message limit
    if (messageCount >= MAX_GUEST_MESSAGES) {
      return NextResponse.json(
        {
          success: false,
          error: 'Misafir kullanıcı limiti aşıldı',
          message: 'Daha fazla mesaj göndermek için lütfen kayıt olun veya giriş yapın.',
          needsRegistration: true
        },
        { status: 403 }
      );
    }

    // Prepare AI request
    const aiMessages = [
      {
        role: 'system',
        content: 'Sen Norvis AI asistanısın. Kullanıcıya yardımcı ol, kısa ve öz cevaplar ver. Bu misafir bir kullanıcı, sadece temel sorularına cevap ver.'
      },
      {
        role: 'user',
        content: message
      }
    ];

    // Get default free AI model
    const defaultModel = 'google/gemini-2.0-flash-exp:free';

    // Send to AI
    const aiResponse = await sendAIMessage(
      aiMessages,
      defaultModel,
      {
        maxTokens: 1000, // Limit tokens for guest users
        temperature: 0.7,
        stream: false // No streaming for guest users
      }
    );

    if (!aiResponse.success || !aiResponse.content) {
      console.error('AI response error:', aiResponse);
      return NextResponse.json(
        {
          success: false,
          error: 'AI servisinden yanıt alınamadı. Lütfen daha sonra tekrar deneyin.'
        },
        { status: 503 }
      );
    }
    
    // Increment IP counter on successful response
    const currentIPData = ipMessageCount.get(clientIP);
    if (currentIPData) {
      ipMessageCount.set(clientIP, {
        count: currentIPData.count + 1,
        timestamp: currentIPData.timestamp
      });
    }

    // Check if this is the last message
    const isLastMessage = messageCount + 1 >= MAX_GUEST_MESSAGES;
    let responseContent = aiResponse.content;

    // Add registration message if it's the last free message
    if (isLastMessage) {
      responseContent += '\n\n---\n\n⚠️ **Ücretsiz mesaj hakkınız doldu!**\n\nDaha fazla mesaj göndermek, dosya yüklemek ve tüm özellikleri kullanmak için lütfen [kayıt olun](/auth/register) veya [giriş yapın](/auth/login).';
    }

    return NextResponse.json({
      success: true,
      data: {
        content: responseContent,
        model: defaultModel,
        remainingMessages: MAX_GUEST_MESSAGES - (messageCount + 1),
        needsRegistration: isLastMessage
      }
    });

  } catch (error) {
    console.error('Guest chat error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Bir hata oluştu. Lütfen tekrar deneyin.'
      },
      { status: 500 }
    );
  }
}
