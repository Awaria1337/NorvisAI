'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose }) => {
  const [reportType, setReportType] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportTypes = [
    'Genel',
    'Geri bildirim',
    'Sorun',
    'Hata bildir',
    'Çocuk güvenliği endişesi'
  ];

  const handleSubmit = async () => {
    if (!reportType || !feedback.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: reportType,
          feedback: feedback.trim()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit report');
      }

      console.log('Report submitted successfully:', result);
      
      // Reset form and close modal
      setReportType('');
      setFeedback('');
      onClose();
      
      // You could show a success toast here
      // toast.success(result.message);
      
    } catch (error) {
      console.error('Error sending report:', error);
      // You could show an error toast here
      // toast.error(error instanceof Error ? error.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReportType('');
    setFeedback('');
    onClose();
  };

  // Modal açık olduğunda body scroll'unu engelle ve ESC tuşu dinle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleCancel();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="relative w-[480px] bg-[#161618] rounded-xl shadow-lg border-0 p-1">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <h2 className="text-lg font-medium text-white">
            Sorun Bildir
          </h2>
          <button
            onClick={handleCancel}
            className="text-white/70 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 space-y-4">
          {/* Report Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Geri bildirim türü
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-transparent hover:bg-white/20 rounded-lg px-3 py-2 text-left text-white transition-colors focus:outline-none adults:bg-white/20 text-sm border border-border-l2"
              >
                <span className={reportType ? 'text-white' : 'text-white/70'}>
                  {reportType || 'Rapor türünü seçin'}
                </span>
                <ChevronDown 
                  size={14} 
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-[#525252] rounded-lg shadow-lg max-h-60 overflow-auto border-0">
                  {reportTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setReportType(type);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Feedback Text Area */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Geri bildiriminiz
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Grok için herhangi bir sorun veya geri bildirimi lütfen açıklayın."
              className=" w-full h-32 focus:bg-white/15 rounded-lg px-3 py-2 text-white text-sm placeholder-white/60 resize-none focus:outline-none transition-colors bg-transparent border border-border-l2"
              maxLength={1000}
            />
            <div className="text-right text-xs text-white/50 mt-1">
              {feedback.length}/1000
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 pt-3">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            İptal Et
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reportType || !feedback.trim() || isSubmitting}
            className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportIssueModal;