'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useChatStore } from '@/store/chatStore';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQPage = () => {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [sidebarState, setSidebarState] = useState<'expanded' | 'collapsed'>('expanded');
  
  const { chats, currentChatId, navigateToChat } = useChatStore();

  const faqItems: FAQItem[] = [
    {
      question: 'Norvis nedir?',
      answer: 'Norvis, yardımcı, esprili ve maksimal derecede doğru bir asistan olmak üzere tasarlanmış yapay zeka destekli bir sohbet platformudur. Iron Man\'deki JARVIS ve Hitchhiker\'s Guide to the Galaxy\'deki rehberden ilham alarak geliştirilmiştir. Bu SSS, Norvis\'in web özelliklerine, yeteneklerine ve bunlardan en iyi şekilde nasıl yararlanacağınıza odaklanır.'
    },
    {
      question: 'Norvis\'in temel özellikleri nelerdir?',
      answer: 'Norvis şunları sunar:\n\n• Gelişmiş konuşma yetenekleri ile doğal dil işleme\n• Çoklu AI model desteği (GPT-4, Claude, Gemini)\n• Dosya yükleme ve analiz (PDF, resim, kod dosyaları)\n• Sesli etkileşim özellikleri\n• Gerçek zamanlı yanıt akışı\n• Kod yazma ve analiz\n• Görsel oluşturma yetenekleri\n• Sohbet geçmişi ve yönetimi\n• Özelleştirilebilir AI davranışları'
    },
    {
      question: 'Norvis hangi modelleri destekler ve özellikleri nelerdir?',
      answer: 'Norvis farklı yeteneklere sahip çeşitli AI modelleri sunar:\n\n**GPT-4 Turbo**: En son OpenAI modeli, gelişmiş akıl yürütme ve kod yazma\n**Claude 3 Opus**: Anthropic\'in en güçlü modeli, uzun bağlam ve detaylı analiz\n**Gemini Pro**: Google\'ın çok modlu AI\'sı, görsel ve metin anlama\n**GPT-3.5 Turbo**: Hızlı ve verimli günlük görevler için\n\nHer model farklı güçlü yönlere sahiptir ve kullanım durumunuza göre seçim yapabilirsiniz.'
    },
    {
      question: 'Norvis yaratıcı veya özelleşmiş görevleri yerine getirebilir mi?',
      answer: 'Evet! Norvis şunlar için mükemmeldir:\n\n• **Yaratıcı Yazarlık**: Hikayeler, şiirler, senaryolar yazma\n• **Kod Geliştirme**: Çeşitli programlama dillerinde kod yazma ve hata ayıklama\n• **İçerik Oluşturma**: Blog yazıları, sosyal medya içeriği, pazarlama metinleri\n• **Eğitim**: Karmaşık konuları açıklama, öğretim materyalleri hazırlama\n• **Veri Analizi**: Dosyaları analiz etme ve içgörüler çıkarma\n• **Görsel Oluşturma**: DALL-E entegrasyonu ile resim üretme\n• **Dil Çevirisi**: Çoklu dil desteği'
    },
    {
      question: 'Norvis gerçek zamanlı arama yapabilir ve nasıl çalışır?',
      answer: 'Norvis gelişmiş arama yeteneklerine sahiptir:\n\n**DeepSearch Özelliği**: Premium ve Pro kullanıcılar için mevcuttur. Bu özellik:\n• Güncel bilgilere erişim sağlar\n• Çoklu kaynakları tarar ve analiz eder\n• Doğrulanmış bilgiler sunar\n• Kaynak referansları ile yanıtlar verir\n\nDeepSearch\'ü etkinleştirmek için sohbet sırasında "@deepsearch" yazabilir veya ayarlardan aktifleştirebilirsiniz.'
    },
    {
      question: 'Norvis\'in yanıtlarını özelleştirebilir miyim?',
      answer: 'Kesinlikle! Norvis çeşitli özelleştirme seçenekleri sunar:\n\n• **Ton Ayarları**: Profesyonel, dostane, esprili veya teknik\n• **Yanıt Uzunluğu**: Kısa, orta veya detaylı açıklamalar\n• **Model Seçimi**: Göreviniz için en uygun AI modelini seçin\n• **Sistem İstemleri**: Özel talimatlar ve kişilik tanımlayın\n• **Bağlam Belleği**: Norvis önceki sohbetleri hatırlar ve tutarlı yanıtlar verir\n\nBu ayarlara sohbet ayarlarından veya profil menüsünden erişebilirsiniz.'
    },
    {
      question: 'Norvis hataları veya yanlışlıkları nasıl ele alır?',
      answer: 'Norvis hataları yönetmek için çeşitli mekanizmalar kullanır:\n\n• **Doğruluk Kontrolü**: Yanıtlar çoklu kaynaklardan doğrulanır\n• **Belirsizlik İfadesi**: Emin olmadığı durumlarda açıkça belirtir\n• **Yeniden Üretme**: Yanıttan memnun değilseniz tekrar üretebilirsiniz\n• **Düzenleme**: Mesajlarınızı düzenleyerek farklı yanıtlar alabilirsiniz\n• **Geri Bildirim**: Beğen/Beğenme butonları ile model eğitimine katkıda bulunursunuz\n\nHatalar durumunda lütfen bizimle iletişime geçin, sürekli iyileştirme yapıyoruz.'
    },
    {
      question: 'Paylaşılan bağlantılar nasıl çalışır?',
      answer: 'Norvis sohbetlerinizi paylaşmanıza olanak tanır:\n\n**Sohbet Paylaşımı**:\n1. Paylaşmak istediğiniz sohbeti açın\n2. Paylaş butonuna tıklayın\n3. Benzersiz bir bağlantı oluşturulur\n4. Bağlantıyı istediğiniz kişiyle paylaşın\n\n**Güvenlik Özellikleri**:\n• Paylaşılan sohbetler sadece okunabilir\n• İstediğiniz zaman paylaşımı iptal edebilirsiniz\n• Hassas bilgiler otomatik olarak filtrelenir\n• Paylaşım süresi sınırlaması ayarlayabilirsiniz'
    },
    {
      question: 'Neden aboneliğime tüm cihazlarımdan erişemiyorum?',
      answer: 'Norvis aboneliğiniz tüm cihazlarınızda çalışır:\n\n**Çoklu Cihaz Desteği**:\n• Web tarayıcısı (masaüstü ve mobil)\n• iOS ve Android uygulamaları\n• Tablet desteği\n\n**Senkronizasyon**:\n• Sohbetleriniz otomatik olarak senkronize edilir\n• Ayarlarınız tüm cihazlarda aynı\n• Bir cihazda başladığınız sohbeti diğerinde devam ettirebilirsiniz\n\nEğer erişim sorunu yaşıyorsanız:\n1. Aynı hesapla giriş yaptığınızdan emin olun\n2. İnternet bağlantınızı kontrol edin\n3. Tarayıcı önbelleğini temizleyin\n4. Sorun devam ederse destek ekibimizle iletişime geçin'
    }
  ];

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleClose = () => {
    router.push(ROUTES.CHAT);
  };

  const handleNewChat = async () => {
    // Implement new chat logic
    router.push(ROUTES.CHAT);
  };

  const handleSearchOpen = () => {
    // Implement search
  };

  const handleChatRename = async (chatId: string, newTitle: string) => {
    // Implement rename
  };

  const handleChatDelete = async (chatId: string) => {
    // Implement delete
  };

  const handleChatArchive = async (chatId: string) => {
    // Implement archive
  };

  return (
    <SidebarProvider>
      <AppSidebar
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={navigateToChat}
        onNewChat={handleNewChat}
        onSearchOpen={handleSearchOpen}
        onChatRename={handleChatRename}
        onChatDelete={handleChatDelete}
        onChatArchive={handleChatArchive}
        onSidebarStateChange={setSidebarState}
      />

      <SidebarInset>
        <div className="min-h-screen bg-background relative flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-6 right-6 z-10 h-8 w-8 p-0 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="max-w-4xl w-full px-6 py-16">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Norvis Web SSS
              </h1>
              <p className="text-sm text-blue-500 mb-6">
                Güncellenme tarihi: 15 Ekim 2025
              </p>
              <div className="text-base text-foreground leading-relaxed space-y-4 text-left max-w-3xl mx-auto">
                <p>
                  Norvis Web SSS sayfasına hoş geldiniz! Norvis, yardımcı, esprili ve maksimal 
                  derecede doğru bir asistan olmak üzere tasarlanmış yapay zeka destekli bir sohbet 
                  platformudur. Bu SSS, Norvis'in web özelliklerine, yeteneklerine ve bunlardan 
                  en iyi şekilde nasıl yararlanacağınıza odaklanır.
                </p>
                <p>
                  Yasal şartlar, gizlilik veya hesap sorunları için{' '}
                  <button onClick={() => router.push('/legal')} className="text-blue-500 hover:underline">
                    yasal sayfamızı
                  </button>{' '}
                  ziyaret edin.
                </p>
                <p>
                  Sorunuz burada yanıtlanmadıysa, lütfen{' '}
                  <button onClick={() => router.push('/support')} className="text-blue-500 hover:underline">
                    Norvis ile doğrudan iletişime geçin
                  </button>{' '}
                  veya{' '}
                  <button onClick={() => router.push('/community')} className="text-blue-500 hover:underline">
                    topluluk forumumuzu
                  </button>{' '}
                  ziyaret edin.
                </p>
              </div>
            </div>

            {/* FAQ Items */}
            <div className="space-y-0">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="border-b border-border"
                >
                  <button
                    onClick={() => handleToggle(index)}
                    className="w-full flex items-center justify-between py-5 text-left hover:bg-accent/30 transition-colors"
                  >
                    <span className="text-base font-normal text-foreground pr-4">
                      {item.question}
                    </span>
                    <ChevronRight
                      className={cn(
                        "h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200",
                        expandedIndex === index && "rotate-90"
                      )}
                    />
                  </button>
                  
                  {expandedIndex === index && (
                    <div className="pb-5 pt-2 text-sm text-muted-foreground leading-relaxed">
                      <div className="whitespace-pre-line">
                        {item.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-16 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Daha fazla yardıma mı ihtiyacınız var?
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/support')}
                >
                  Destek Ekibiyle İletişime Geçin
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/community')}
                >
                  Topluluk Forumu
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default FAQPage;
