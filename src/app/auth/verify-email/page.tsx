'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`);
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login?verified=true');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification');
    }
  };

  const handleResendEmail = async () => {
    // This would need the user's email from somewhere
    // For now, redirect to a resend page
    router.push('/auth/resend-verification');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {status === 'loading' && (
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {status === 'loading' && 'Verifying Your Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {status === 'loading' && 'Please wait while we verify your email address...'}
            {status === 'success' && message}
            {status === 'error' && message}
          </p>

          {/* Actions */}
          {status === 'success' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to login page...
              </p>
              <Link
                href="/auth/login"
                className="inline-block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={resending}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Resend Verification Email
                  </>
                )}
              </button>
              <Link
                href="/auth/login"
                className="inline-block w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Need help?{' '}
          <Link href="/faq" className="text-blue-600 dark:text-blue-400 hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
