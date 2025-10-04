'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

export function OTPInput({ length = 6, onComplete, disabled }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // İlk input'a otomatik focus
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;
    
    // Sadece rakam kabul et
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Son karakteri al (paste durumu için)
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Bir sonraki input'a geç
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Tüm inputlar dolduysa callback'i çağır
    if (newOtp.every(digit => digit !== '')) {
      const otpString = newOtp.join('');
      if (otpString.length === length) {
        onComplete(otpString);
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Boşsa önceki input'a geç
        inputRefs.current[index - 1]?.focus();
      } else {
        // Mevcut input'u temizle
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (!pastedData) return;

    const newOtp = pastedData.split('').concat(new Array(length - pastedData.length).fill(''));
    setOtp(newOtp.slice(0, length));
    
    // Son dolu input'a focus
    const lastIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[lastIndex]?.focus();
    
    if (pastedData.length === length) {
      onComplete(pastedData);
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoComplete="off"
          className={cn(
            "w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-lg",
            "border-2 border-gray-300 dark:border-gray-600",
            "bg-white dark:bg-gray-800",
            "text-gray-900 dark:text-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200",
            digit && "border-blue-500 dark:border-blue-400"
          )}
        />
      ))}
    </div>
  );
}
