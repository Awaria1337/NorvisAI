'use client'

import React from 'react'
import { Avatar, AvatarFallback } from './avatar'

interface SimpleAILoadingProps {
  text?: string
  className?: string
}

export const SimpleAILoading: React.FC<SimpleAILoadingProps> = ({ 
  text = "Bir saniye bekleyin...",
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-8 ${className}`}>
      {/* Logo with rotating beam effect */}
      <div className="relative flex items-center justify-center">
        {/* Outer rotating beam - gradient */}
        <div className="absolute inset-0 w-16 h-16">
          <div className="absolute inset-0 rounded-full animate-spin" style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(59, 130, 246, 0.8) 300deg, transparent 360deg)',
            animationDuration: '1.5s'
          }}></div>
        </div>
        
        {/* Inner glow ring */}
        <div className="absolute inset-0 w-16 h-16 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 animate-pulse"></div>
        </div>
        
        {/* Logo */}
        <div className="relative z-10 w-10 h-10 flex items-center justify-center bg-background rounded-full">
          <img 
            src="/norvis_logo.png" 
            alt="Norvis AI" 
            className="w-8 h-8 object-contain filter brightness-0 invert"
          />
        </div>
      </div>

      {/* Loading text */}
      <span className="text-sm font-medium text-muted-foreground">
        {text}
      </span>
    </div>
  )
}

export default SimpleAILoading
