// API Key Modal - Disabled (using environment variables instead)
import React from 'react';

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeysUpdated?: () => void;
}

// This component is disabled as API keys are now configured via environment variables
export function ApiKeyModal({ open, onOpenChange, onApiKeysUpdated }: ApiKeyModalProps) {
  // Always return null to disable the modal
  return null;
}