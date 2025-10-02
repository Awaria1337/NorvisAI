'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, Eye, EyeOff, Trash2, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeysUpdated?: () => void;
}

interface ApiKey {
  id: string;
  provider: string;
  maskedKey: string;
  createdAt: string;
}

export function ApiKeyModal({ open, onOpenChange, onApiKeysUpdated }: ApiKeyModalProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [newApiKey, setNewApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const providers = [
    { id: 'openai', name: 'OpenAI', description: 'GPT-4, DALL-E 3' },
    { id: 'anthropic', name: 'Anthropic', description: 'Claude 3.5 Sonnet' },
    { id: 'google', name: 'Google', description: 'Gemini Pro' },
    { id: 'openrouter', name: 'OpenRouter', description: 'Tüm modeller' }
  ];

  // Fetch existing API keys
  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/api-keys', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys || []);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchApiKeys();
    }
  }, [open]);

  // Add new API key
  const handleAddApiKey = async () => {
    if (!newApiKey.trim()) {
      toast.error('Lütfen API key girin');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey: newApiKey
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add API key');
      }

      toast.success('API key başarıyla eklendi!');
      setNewApiKey('');
      await fetchApiKeys();
      onApiKeysUpdated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'API key eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Delete API key
  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm('Bu API key\'i silmek istediğinizden emin misiniz?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      toast.success('API key silindi');
      await fetchApiKeys();
      onApiKeysUpdated?.();
    } catch (error) {
      toast.error('API key silinirken hata oluştu');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Key className="h-5 w-5" />
            API Keys Yönetimi
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            AI modelleri için kendi API key&apos;lerinizi ekleyin. Her provider için ayrı key gereklidir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add New API Key Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Yeni API Key Ekle</h3>
            
            <Tabs defaultValue="openai" value={selectedProvider} onValueChange={setSelectedProvider}>
              <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                {providers.map((provider) => (
                  <TabsTrigger 
                    key={provider.id} 
                    value={provider.id}
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    {provider.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {providers.map((provider) => (
                <TabsContent key={provider.id} value={provider.id} className="space-y-4 mt-4">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-blue-400 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {provider.description} için API key
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={showKey ? "text" : "password"}
                          value={newApiKey}
                          onChange={(e) => setNewApiKey(e.target.value)}
                          placeholder={`${provider.name} API key'inizi girin`}
                          className="bg-gray-800 border-gray-700 text-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Button
                        onClick={handleAddApiKey}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ekle
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 space-y-1">
                    <p><strong>Nasıl alınır?</strong></p>
                    {provider.id === 'openai' && (
                      <p>• <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OpenAI Dashboard</a>&apos;dan API key oluşturun</p>
                    )}
                    {provider.id === 'anthropic' && (
                      <p>• <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Anthropic Console</a>&apos;dan API key oluşturun</p>
                    )}
                    {provider.id === 'google' && (
                      <p>• <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a>&apos;dan API key oluşturun</p>
                    )}
                    {provider.id === 'openrouter' && (
                      <p>• <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OpenRouter Keys</a>&apos;den API key oluşturun</p>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Existing API Keys */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Mevcut API Keys</h3>
            
            {apiKeys.length === 0 ? (
              <div className="p-8 text-center text-gray-400 bg-gray-800/50 rounded-lg border border-gray-700">
                <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Henüz API key eklemediniz</p>
                <p className="text-sm mt-1">Yukarıdan ekleyebilirsiniz</p>
              </div>
            ) : (
              <div className="space-y-2">
                {apiKeys.map((key) => {
                  const provider = providers.find(p => p.id === key.provider);
                  return (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium text-white">{provider?.name || key.provider}</p>
                          <p className="text-sm text-gray-400 font-mono">{key.maskedKey}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteApiKey(key.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}