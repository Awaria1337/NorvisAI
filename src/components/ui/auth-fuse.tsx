"use client";

import * as React from "react";
import { useState, useId, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    text,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

function SignInForm({ onSubmit, onGoogleSignIn, onForgotPassword }: { onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; onGoogleSignIn?: () => void; onForgotPassword?: () => void }) {
  return (
    <form onSubmit={onSubmit} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Hesabınıza giriş yapın</h1>
        <p className="text-balance text-sm text-muted-foreground">Giriş yapmak için email adresinizi girin</p>
      </div>
      <div className="grid gap-4">
        {onGoogleSignIn && (
          <>
            <Button type="button" variant="outline" className="w-full cursor-pointer" onClick={onGoogleSignIn}>
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Google ile giriş yap
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Veya</span>
              </div>
            </div>
          </>
        )}
        <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" /></div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Şifre</Label>
            {onForgotPassword && (
              <button type="button" onClick={onForgotPassword} className="text-sm text-primary hover:underline">
                Şifremi unuttum?
              </button>
            )}
          </div>
          <PasswordInput id="password" name="password" required autoComplete="current-password" placeholder="Şifre" />
        </div>
        <Button type="submit" variant="outline" className="mt-2 cursor-pointer">Giriş Yap</Button>
      </div>
    </form>
  );
}

// Reset Password Form
function ResetPasswordForm({
  onSubmit,
  onBack,
  isLoading,
  success
}: {
  onSubmit: (password: string, confirmPassword: string) => void;
  onBack: () => void;
  isLoading?: boolean;
  success?: boolean;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && confirmPassword) {
      onSubmit(password, confirmPassword);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Şifre Sıfırlama Başarılı!</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Şifreniz başarıyla sıfırlandı. Artık yeni şifrenizle giriş yapabilirsiniz.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="w-full cursor-pointer"
          onClick={onBack}
        >
          Giriş Sayfasına Dön
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Şifre Sıfırla</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Yeni şifrenizi girin
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="reset-password">Yeni Şifre</Label>
          <div className="relative">
            <Input 
              id="reset-password" 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 8 karakter" 
              required 
              minLength={8}
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="reset-confirm-password">Yeni Şifre (Tekrar)</Label>
          <div className="relative">
            <Input 
              id="reset-confirm-password" 
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Şifrenizi tekrar girin" 
              required 
              minLength={8}
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          variant="outline" 
          className="w-full cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? 'Sıfırlanıyor...' : 'Şifre Sıfırla'}
        </Button>

        <Button 
          type="button"
          variant="link" 
          className="text-muted-foreground hover:text-foreground p-0"
          onClick={onBack}
          disabled={isLoading}
        >
          ← Geri Dön
        </Button>
      </div>
    </form>
  );
}

// Forgot Password Form
function ForgotPasswordForm({
  onSubmit,
  onBack,
  isLoading,
  emailSent
}: {
  onSubmit: (email: string) => void;
  onBack: () => void;
  isLoading?: boolean;
  emailSent?: boolean;
}) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onSubmit(email);
    }
  };

  if (emailSent) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Email'inizi Kontrol Edin</h1>
          <p className="text-balance text-sm text-muted-foreground">
            <span className="font-medium">{email}</span> adresine şifre sıfırlama bağlantısı gönderdik
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Bağlantı 1 saat içinde geçersiz olacaktır
          </p>
        </div>
        <Button 
          variant="outline" 
          className="w-full cursor-pointer"
          onClick={onBack}
        >
          Giriş Sayfasına Dön
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Şifrenizi mi Unuttunuz?</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Endişelenmeyin, size sıfırlama talimatları göndereceğiz
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="forgot-email">Email Adresi</Label>
          <Input 
            id="forgot-email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="m@example.com" 
            required 
            disabled={isLoading}
          />
        </div>

        <Button 
          type="submit" 
          variant="outline" 
          className="w-full cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
        </Button>

        <Button 
          type="button"
          variant="link" 
          className="text-muted-foreground hover:text-foreground p-0"
          onClick={onBack}
          disabled={isLoading}
        >
          ← Geri Dön
        </Button>
      </div>
    </form>
  );
}

// OTP Verification Form
function OTPVerificationForm({
  email, 
  onVerify, 
  onResend, 
  onBack,
  isVerifying,
  isResending 
}: { 
  email: string; 
  onVerify: (otp: string) => void; 
  onResend: () => void;
  onBack: () => void;
  isVerifying?: boolean;
  isResending?: boolean;
}) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && value) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        onVerify(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp.slice(0, 6));
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
    if (pastedData.length === 6) {
      onVerify(pastedData);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Doğrulama Kodu</h1>
        <p className="text-balance text-sm text-muted-foreground">
          <span className="font-medium">{email}</span> adresine gönderilen 6 haneli kodu girin
        </p>
      </div>

      <div className="grid gap-6">
        {/* OTP Inputs */}
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isVerifying}
              className="w-11 h-12 text-center text-xl font-bold border-2 border-input dark:border-input/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center">
          {timeLeft > 0 ? (
            <p className="text-sm text-muted-foreground">
              Kod geçerlilik süresi: <span className="font-medium text-primary">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-sm text-destructive font-medium">Kodun süresi doldu</p>
          )}
        </div>

        {/* Verify Button */}
        <Button 
          onClick={() => onVerify(otp.join(''))}
          disabled={isVerifying || otp.join('').length !== 6}
          variant="outline" 
          className="w-full cursor-pointer"
        >
          {isVerifying ? 'Doğrulanıyor...' : 'Doğrula'}
        </Button>

        {/* Resend & Back */}
        <div className="flex items-center justify-between text-sm">
          <Button 
            type="button"
            variant="link" 
            className="text-muted-foreground hover:text-foreground p-0"
            onClick={onBack}
            disabled={isVerifying}
          >
            ← Geri Dön
          </Button>
          <Button 
            type="button"
            variant="link" 
            className="text-muted-foreground hover:text-foreground p-0"
            onClick={onResend}
            disabled={isResending || timeLeft > 240}
          >
            {isResending ? 'Gönderiliyor...' : timeLeft > 240 ? `Yeniden gönder (${formatTime(timeLeft - 240)})` : 'Yeniden gönder'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SignUpForm({ onSubmit, onGoogleSignIn }: { onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; onGoogleSignIn?: () => void }) {
  return (
    <form onSubmit={onSubmit} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Hesap oluştur</h1>
        <p className="text-balance text-sm text-muted-foreground">Kayıt olmak için bilgilerinizi girin</p>
      </div>
      <div className="grid gap-4">
        {onGoogleSignIn && (
          <>
            <Button type="button" variant="outline" className="w-full cursor-pointer" onClick={onGoogleSignIn}>
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Google ile kayıt ol
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Veya</span>
              </div>
            </div>
          </>
        )}
        <div className="grid gap-1"><Label htmlFor="name">Ad Soyad</Label><Input id="name" name="name" type="text" placeholder="Ahmet Yılmaz" required autoComplete="name" /></div>
        <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" /></div>
        <PasswordInput name="password" label="Şifre" required autoComplete="new-password" placeholder="Şifre"/>
        <Button type="submit" variant="outline" className="mt-2 cursor-pointer">Kayıt Ol</Button>
      </div>
    </form>
  );
}

function AuthFormContainer({ 
  isSignIn, 
  onToggle, 
  onSignInSubmit, 
  onSignUpSubmit,
  onGoogleSignIn,
  showOTP,
  otpEmail,
  onOTPVerify,
  onOTPResend,
  onOTPBack,
  isVerifying,
  isResending,
  showForgotPassword,
  onForgotPasswordSubmit,
  onForgotPasswordBack,
  isForgotPasswordLoading,
  forgotPasswordEmailSent,
  onForgotPasswordClick,
  showResetPassword,
  onResetPasswordSubmit,
  onResetPasswordBack,
  isResetPasswordLoading,
  resetPasswordSuccess
}: { 
  isSignIn: boolean; 
  onToggle: () => void;
  onSignInSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onSignUpSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  showOTP?: boolean;
  otpEmail?: string;
  onOTPVerify?: (otp: string) => void;
  onOTPResend?: () => void;
  onOTPBack?: () => void;
  isVerifying?: boolean;
  isResending?: boolean;
  showForgotPassword?: boolean;
  onForgotPasswordSubmit?: (email: string) => void;
  onForgotPasswordBack?: () => void;
  isForgotPasswordLoading?: boolean;
  forgotPasswordEmailSent?: boolean;
  onForgotPasswordClick?: () => void;
  showResetPassword?: boolean;
  onResetPasswordSubmit?: (password: string, confirmPassword: string) => void;
  onResetPasswordBack?: () => void;
  isResetPasswordLoading?: boolean;
  resetPasswordSuccess?: boolean;
}) {
    return (
        <div className="mx-auto grid w-[350px] gap-2">
            {showOTP && otpEmail ? (
                <OTPVerificationForm 
                    email={otpEmail}
                    onVerify={onOTPVerify!}
                    onResend={onOTPResend!}
                    onBack={onOTPBack!}
                    isVerifying={isVerifying}
                    isResending={isResending}
                />
            ) : showResetPassword ? (
                <ResetPasswordForm 
                    onSubmit={onResetPasswordSubmit!}
                    onBack={onResetPasswordBack!}
                    isLoading={isResetPasswordLoading}
                    success={resetPasswordSuccess}
                />
            ) : showForgotPassword ? (
                <ForgotPasswordForm 
                    onSubmit={onForgotPasswordSubmit!}
                    onBack={onForgotPasswordBack!}
                    isLoading={isForgotPasswordLoading}
                    emailSent={forgotPasswordEmailSent}
                />
            ) : (
                <>
                    {isSignIn ? <SignInForm onSubmit={onSignInSubmit} onGoogleSignIn={onGoogleSignIn} onForgotPassword={onForgotPasswordClick} /> : <SignUpForm onSubmit={onSignUpSubmit} onGoogleSignIn={onGoogleSignIn} />}
                    <div className="text-center text-sm">
                        {isSignIn ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}{" "}
                        <Button variant="link" className="pl-1 text-foreground" onClick={onToggle}>
                            {isSignIn ? "Kayıt ol" : "Giriş yap"}
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

interface AuthContentProps {
    image?: {
        src: string;
        alt: string;
    };
    quote?: {
        text: string;
        author: string;
    }
}

export interface AuthUIProps {
    signInContent?: AuthContentProps;
    signUpContent?: AuthContentProps;
    onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
    onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
    onGoogleSignIn?: () => void;
    showOTP?: boolean;
    otpEmail?: string;
    onOTPVerify?: (otp: string) => void;
    onOTPResend?: () => void;
    onOTPBack?: () => void;
    isVerifying?: boolean;
    isResending?: boolean;
    showForgotPassword?: boolean;
    onForgotPasswordSubmit?: (email: string) => void;
    onForgotPasswordBack?: () => void;
    isForgotPasswordLoading?: boolean;
    forgotPasswordEmailSent?: boolean;
    onForgotPasswordClick?: () => void;
    showResetPassword?: boolean;
    onResetPasswordSubmit?: (password: string, confirmPassword: string) => void;
    onResetPasswordBack?: () => void;
    isResetPasswordLoading?: boolean;
    resetPasswordSuccess?: boolean;
}

const defaultSignInContent = {
    image: {
        src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
        alt: "Modern workspace with AI technology"
    },
    quote: {
        text: "Tekrar hoş geldiniz! Yapay zeka yolculuğunuz devam ediyor.",
        author: "Norvis AI"
    }
};

const defaultSignUpContent = {
    image: {
        src: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
        alt: "AI neural network visualization"
    },
    quote: {
        text: "Yeni bir hesap oluşturun. Yapay zeka dünyasına adım atın.",
        author: "Norvis AI"
    }
};

export function AuthUI({ 
  signInContent = {}, 
  signUpContent = {},
  onSignIn,
  onSignUp,
  onGoogleSignIn,
  showOTP,
  otpEmail,
  onOTPVerify,
  onOTPResend,
  onOTPBack,
  isVerifying,
  isResending,
  showForgotPassword,
  onForgotPasswordSubmit,
  onForgotPasswordBack,
  isForgotPasswordLoading,
  forgotPasswordEmailSent,
  onForgotPasswordClick,
  showResetPassword,
  onResetPasswordSubmit,
  onResetPasswordBack,
  isResetPasswordLoading,
  resetPasswordSuccess
}: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const toggleForm = () => setIsSignIn((prev) => !prev);

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    if (onSignIn) {
      onSignIn(event);
    }
  };

  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    if (onSignUp) {
      onSignUp(event);
    }
  };

  const finalSignInContent = {
      image: { ...defaultSignInContent.image, ...signInContent.image },
      quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUpContent = {
      image: { ...defaultSignUpContent.image, ...signUpContent.image },
      quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
      
      {/* Image section - NOW ON LEFT */}
      <div
        className="hidden md:block relative bg-cover bg-center transition-all duration-500 ease-in-out"
        style={{ backgroundImage: `url(${currentContent.image.src})` }}
        key={currentContent.image.src}
      >
        <div className="absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-background to-transparent" />
        
        <div className="relative z-10 flex h-full flex-col items-center justify-end p-2 pb-6">
            <blockquote className="space-y-2 text-center text-foreground">
              <p className="text-lg font-medium">
                "<Typewriter
                    key={currentContent.quote.text}
                    text={currentContent.quote.text}
                    speed={60}
                  />"
              </p>
              <cite className="block text-sm font-light text-muted-foreground not-italic">
                  — {currentContent.quote.author}
              </cite>
            </blockquote>
        </div>
      </div>

      {/* Form section - NOW ON RIGHT */}
      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12">
        <AuthFormContainer 
          isSignIn={isSignIn} 
          onToggle={toggleForm} 
          onSignInSubmit={handleSignIn}
          onSignUpSubmit={handleSignUp}
          onGoogleSignIn={onGoogleSignIn}
          showOTP={showOTP}
          otpEmail={otpEmail}
          onOTPVerify={onOTPVerify}
          onOTPResend={onOTPResend}
          onOTPBack={onOTPBack}
          isVerifying={isVerifying}
          isResending={isResending}
          showForgotPassword={showForgotPassword}
          onForgotPasswordSubmit={onForgotPasswordSubmit}
          onForgotPasswordBack={onForgotPasswordBack}
          isForgotPasswordLoading={isForgotPasswordLoading}
          forgotPasswordEmailSent={forgotPasswordEmailSent}
          onForgotPasswordClick={onForgotPasswordClick}
          showResetPassword={showResetPassword}
          onResetPasswordSubmit={onResetPasswordSubmit}
          onResetPasswordBack={onResetPasswordBack}
          isResetPasswordLoading={isResetPasswordLoading}
          resetPasswordSuccess={resetPasswordSuccess}
        />
      </div>
    </div>
  );
}
