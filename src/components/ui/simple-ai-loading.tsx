'use client'

import React from 'react'

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
      {/* Logo with rotating beam around it (Gemini style) */}
      <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
        {/* Rotating beam effect */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 70%, #60A5FA 100%)',
            animation: 'spin 1.5s linear infinite'
          }}
        />
        
        {/* Inner circle to create beam effect */}
        <div className="absolute inset-[2px] rounded-full bg-background" />
        
        {/* Static Logo */}
        <div className="relative z-10 flex items-center justify-center">
          <img 
            src="/norvis_logo.png" 
            alt="Norvis AI" 
            className="w-5 h-5 object-contain filter brightness-0 invert"
          />
        </div>
      </div>
      
      {/* Loading text */}
      <span className="text-sm font-medium text-muted-foreground">
        {text}
      </span>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

export default SimpleAILoading
