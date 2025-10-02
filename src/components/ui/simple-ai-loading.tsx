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
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo with simple rotate animation */}
      <div className="relative w-6 h-6 flex-shrink-0">
        <img 
          src="/norvis_logo.png" 
          alt="Norvis AI" 
          className="w-6 h-6 object-contain filter brightness-0 invert animate-spin"
          style={{ animationDuration: '1s' }}
        />
      </div>
      
      {/* Loading text */}
      <span className="text-sm font-medium text-foreground">
        {text}
      </span>
    </div>
  )
}

export default SimpleAILoading
