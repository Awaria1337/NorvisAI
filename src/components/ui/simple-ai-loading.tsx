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
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Norvis Logo with spinner */}
      <div className="relative">
        <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center">
          <img 
            src="/norvis_logo.png" 
            alt="Norvis AI" 
            className="h-8 w-8 object-contain filter invert"
          />
        </div>
        
        {/* Spinner around the logo */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-green-600 animate-spin"></div>
      </div>

      {/* Loading text */}
      <span className="text-sm text-muted-foreground animate-pulse">
        {text}
      </span>
    </div>
  )
}

export default SimpleAILoading