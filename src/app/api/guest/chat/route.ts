/**
 * Guest Chat API
 * Handles chat requests for non-authenticated users with 3 message limit
 * IP-based rate limiting to prevent abuse
 */

import { NextRequest, NextResponse } from 'next/server';

const MAX_GUEST_MESSAGES = 3;
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

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
            message: 'Bu IP adresinden 24 saat içinde maksimum mesaj limitine ulaştınız. Sınırsız mesajlaşma için lütfen kayıt olun!',
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
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'AI servisi yapılandırılmamış. Lütfen daha sonra tekrar deneyin.'
        },
        { status: 503 }
      );
    }

    // Send to OpenRouter AI
    try {
      const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Norvis AI'
        },
        body: JSON.stringify({
          model: defaultModel,
          messages: aiMessages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: false
        })
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => ({}));
        console.error('OpenRouter API error:', errorData);
        return NextResponse.json(
          {
            success: false,
            error: 'AI servisinden yanıt alınamadı. Lütfen daha sonra tekrar deneyin.'
          },
          { status: 503 }
        );
      }

      const aiData = await aiResponse.json();
      const aiContent = aiData.choices?.[0]?.message?.content;

      if (!aiContent) {
        console.error('No content in AI response:', aiData);
        return NextResponse.json(
          {
            success: false,
            error: 'AI servisinden geçerli bir yanıt alınamadı.'
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
      let responseContent = aiContent;

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
    } catch (aiError) {
      console.error('AI API call error:', aiError);
      return NextResponse.json(
        {
          success: false,
          error: 'AI servisi ile bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.'
        },
        { status: 503 }
      );
    }

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
