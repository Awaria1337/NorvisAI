'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  HelpCircle,
  ExternalLink,
  FileText,
  Shield,
  Bug,
  Keyboard,
  Command,
  Info
} from 'lucide-react';
import BugReportModal from './bug-report-modal';
import KeyboardShortcutsModal from './keyboard-shortcuts-modal';

interface HelpMenuProps {
  trigger?: React.ReactNode;
}

const HelpMenu: React.FC<HelpMenuProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bugReportOpen, setBugReportOpen] = useState(false);
  const [keyboardShortcutsOpen, setKeyboardShortcutsOpen] = useState(false);

  const handleHelpCenterClick = () => {
    // TODO: Redirect to help center when available
    console.log('Help center clicked');
  };

  const handleReleaseNotesClick = () => {
    // TODO: Redirect to release notes when available
    console.log('Release notes clicked');
  };

  const handleTermsPoliciesClick = () => {
    // TODO: Redirect to terms and policies when available
    console.log('Terms and policies clicked');
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <div 
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {trigger || (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <HelpCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-64"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Help Center */}
          <DropdownMenuItem 
            className="cursor-pointer py-3"
            onClick={handleHelpCenterClick}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Yardım merkezi</p>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </div>
          </DropdownMenuItem>

          {/* Release Notes */}
          <DropdownMenuItem 
            className="cursor-pointer py-3"
            onClick={handleReleaseNotesClick}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30">
                <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sürüm notları</p>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </div>
          </DropdownMenuItem>

          {/* Terms & Policies */}
          <DropdownMenuItem 
            className="cursor-pointer py-3"
            onClick={handleTermsPoliciesClick}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Şartlar ve politikalar</p>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Bug Report */}
          <DropdownMenuItem 
            className="cursor-pointer py-3"
            onClick={() => setBugReportOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/30">
                <Bug className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Hata bildir</p>
              </div>
            </div>
          </DropdownMenuItem>

          {/* Keyboard Shortcuts */}
          <DropdownMenuItem 
            className="cursor-pointer py-3"
            onClick={() => setKeyboardShortcutsOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                <Keyboard className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Klavye kısayolları</p>
              </div>
              <div className="flex items-center gap-1">
                <Command className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">/</span>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Bug Report Modal - Render with portal */}
      {typeof window !== 'undefined' && bugReportOpen && createPortal(
        <BugReportModal 
          isOpen={bugReportOpen}
          onClose={() => setBugReportOpen(false)}
        />,
        document.body
      )}

      {/* Keyboard Shortcuts Modal - Render with portal */}
      {typeof window !== 'undefined' && keyboardShortcutsOpen && createPortal(
        <KeyboardShortcutsModal 
          isOpen={keyboardShortcutsOpen}
          onClose={() => setKeyboardShortcutsOpen(false)}
        />,
        document.body
      )}
    </>
  );
};

export default HelpMenu;