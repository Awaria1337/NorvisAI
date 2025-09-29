'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Square } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import '@/types/speech'

interface VoiceInputProps {
  onTranscript: (transcript: string) => void
  disabled?: boolean
  className?: string
}

// Voice recognition states
type VoiceState = 'idle' | 'listening' | 'processing' | 'error'

const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  disabled = false,
  className = ''
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [interimTranscript, setInterimTranscript] = useState('')

  // Check browser support on mount
  useEffect(() => {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    setIsSupported(supported)
    
    if (!supported) {
      console.warn('Speech Recognition not supported in this browser')
    }
  }, [])

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setVoiceState('error')
      return null
    }

    const recognition = new SpeechRecognition()
    
    // Configuration
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'tr-TR' // Turkish language
    recognition.maxAlternatives = 1

    // Event handlers
    recognition.onstart = () => {
      console.log('🎤 Voice recognition started')
      setVoiceState('listening')
      setInterimTranscript('')
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setInterimTranscript(interimTranscript)

      if (finalTranscript) {
        console.log('🎯 Final transcript:', finalTranscript)
        onTranscript(finalTranscript.trim())
        setInterimTranscript('')
      }
    }

    recognition.onerror = (event) => {
      console.error('🎤 Speech recognition error:', event.error)
      setVoiceState('error')
      
      let errorMessage = 'Ses tanıma hatası'
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Mikrofon izni verilmedi. Lütfen tarayıcı ayarlarından mikrofonunuza erişim izni verin.'
          break
        case 'no-speech':
          errorMessage = 'Ses algılanamadı. Lütfen tekrar deneyin.'
          break
        case 'audio-capture':
          errorMessage = 'Mikrofon bulunamadı veya kullanılamıyor.'
          break
        case 'network':
          errorMessage = 'Ağ bağlantısı sorunu. İnternet bağlantınızı kontrol edin.'
          break
        default:
          errorMessage = `Ses tanıma hatası: ${event.error}`
      }
      
      toast.error(errorMessage)
      setTimeout(() => setVoiceState('idle'), 2000)
    }

    recognition.onend = () => {
      console.log('🎤 Voice recognition ended')
      if (voiceState === 'listening') {
        setVoiceState('idle')
      }
    }

    return recognition
  }

  // Start voice recognition
  const startListening = async () => {
    if (!isSupported) {
      toast.error('Tarayıcınız ses tanımayı desteklemiyor.')
      return
    }

    if (disabled) {
      return
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const recognition = initializeSpeechRecognition()
      if (!recognition) {
        toast.error('Ses tanıma başlatılamadı.')
        return
      }

      recognitionRef.current = recognition
      recognition.start()
      
      toast.success('🎤 Dinliyorum... Konuşabilirsiniz')
      
    } catch (error) {
      console.error('Microphone access error:', error)
      setVoiceState('error')
      toast.error('Mikrofonunuza erişim sağlanamadı. Lütfen izinleri kontrol edin.')
      setTimeout(() => setVoiceState('idle'), 2000)
    }
  }

  // Stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setVoiceState('idle')
    setInterimTranscript('')
    toast.success('Ses tanıma durduruldu')
  }

  // Handle button click
  const handleVoiceToggle = () => {
    if (voiceState === 'listening') {
      stopListening()
    } else if (voiceState === 'idle') {
      startListening()
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Get button appearance based on state
  const getButtonProps = () => {
    switch (voiceState) {
      case 'listening':
        return {
          className: 'h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 text-white animate-pulse p-0 flex items-center justify-center',
          icon: <Mic className="h-5 w-5" />,
          title: 'Dinliyor... Durdurmak için tıklayın'
        }
      case 'processing':
        return {
          className: 'h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white p-0 flex items-center justify-center',
          icon: <Square className="h-4 w-4" />,
          title: 'İşleniyor...'
        }
      case 'error':
        return {
          className: 'h-10 w-10 rounded-full bg-red-600 hover:bg-red-700 text-white p-0 flex items-center justify-center',
          icon: <MicOff className="h-5 w-5" />,
          title: 'Hata oluştu'
        }
      default:
        return {
          className: 'whitespace-nowrap text-base font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-6 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 gap-1.5 has-[>svg]:px-3 h-10 w-10 rounded-full bg-white hover:bg-white text-gray-600 hover:text-gray-600 hover:shadow-lg transition-all duration-200 p-0 flex items-center justify-center',
          icon: <Mic className="h-5 w-5" />,
          title: 'Ses kaydı başlat'
        }
    }
  }

  const buttonProps = getButtonProps()

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="ghost"
        size="sm"
        className={buttonProps.className}
        onClick={handleVoiceToggle}
        disabled={disabled || !isSupported || voiceState === 'processing'}
        title={buttonProps.title}
      >
        {buttonProps.icon}
      </Button>
      
      {/* Live transcript preview kaldırıldı */}
    </div>
  )
}

export default VoiceInput