// Smart title generation utility like ChatGPT
export const generateSmartTitle = (userMessage: string): string => {
  // Remove extra spaces and normalize
  const cleanMessage = userMessage.trim().toLowerCase();
  
  // If message is too short, return it as is (with proper capitalization)
  if (cleanMessage.length <= 3) {
    return cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
  }
  
  // Common patterns and their smart titles
  const patterns = [
    // Admin panel related
    { keywords: ['admin', 'panel', 'yönetici', 'yap'], title: 'Admin Panel Yapımı' },
    { keywords: ['admin', 'dashboard'], title: 'Admin Dashboard' },
    
    // Website/Web development
    { keywords: ['website', 'web', 'site', 'yap'], title: 'Website Geliştirme' },
    { keywords: ['landing', 'page'], title: 'Landing Page' },
    
    // Programming
    { keywords: ['kod', 'code', 'yazılım', 'program'], title: 'Kod Yazımı' },
    { keywords: ['api', 'backend'], title: 'API Geliştirme' },
    { keywords: ['frontend', 'react', 'vue', 'angular'], title: 'Frontend Geliştirme' },
    { keywords: ['database', 'veritabanı'], title: 'Veritabanı' },
    
    // Design
    { keywords: ['design', 'tasarım', 'ui', 'ux'], title: 'Tasarım' },
    { keywords: ['logo', 'brand'], title: 'Logo Tasarımı' },
    
    // Business
    { keywords: ['business', 'iş', 'plan'], title: 'İş Planı' },
    { keywords: ['marketing', 'pazarlama'], title: 'Pazarlama' },
    
    // Learning/Education
    { keywords: ['öğren', 'learn', 'tutorial'], title: 'Öğrenme' },
    { keywords: ['explain', 'açıkla', 'nedir'], title: 'Açıklama' },
    
    // Problem solving
    { keywords: ['problem', 'sorun', 'hata', 'error', 'bug'], title: 'Sorun Çözme' },
    { keywords: ['fix', 'düzelt'], title: 'Düzeltme' },
    
    // Analysis
    { keywords: ['analyze', 'analiz'], title: 'Analiz' },
    { keywords: ['review', 'inceleme'], title: 'İnceleme' },
    
    // Creative
    { keywords: ['create', 'oluştur', 'yap'], title: 'Oluşturma' },
    { keywords: ['write', 'yaz', 'metin'], title: 'Metin Yazımı' },
    
    // Questions
    { keywords: ['nasıl', 'how', 'neden', 'why'], title: 'Soru' },
    { keywords: ['ne', 'what', 'hangisi', 'which'], title: 'Bilgi' }
  ];
  
  // Check for pattern matches
  for (const pattern of patterns) {
    if (pattern.keywords.some(keyword => cleanMessage.includes(keyword))) {
      return pattern.title;
    }
  }
  
  // If no pattern matches, create a smart title from the first few words
  const words = userMessage.split(' ').filter(word => word.length > 0);
  
  // Take first 3-4 meaningful words
  let meaningfulWords = words.slice(0, 4);
  
  // Remove common stop words
  const stopWords = ['bir', 'bu', 'şu', 'o', 'the', 'a', 'an', 'and', 'or', 'but', 'bana', 'beni', 'için', 'ile'];
  meaningfulWords = meaningfulWords.filter(word => 
    !stopWords.includes(word.toLowerCase()) && word.length > 2
  );
  
  // If we have meaningful words, use them
  if (meaningfulWords.length > 0) {
    let title = meaningfulWords.slice(0, 3).join(' ');
    
    // Capitalize first letter of each word
    title = title.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Limit length
    if (title.length > 30) {
      title = title.substring(0, 30) + '...';
    }
    
    return title;
  }
  
  // Fallback: use first 20 characters
  let fallbackTitle = userMessage.substring(0, 20);
  if (userMessage.length > 20) {
    fallbackTitle += '...';
  }
  
  // Capitalize first letter
  return fallbackTitle.charAt(0).toUpperCase() + fallbackTitle.slice(1);
};

// Generate title for chat based on first user message
export const generateChatTitle = (firstUserMessage: string): string => {
  if (!firstUserMessage || firstUserMessage.trim().length === 0) {
    return 'Yeni Sohbet';
  }
  
  return generateSmartTitle(firstUserMessage);
};