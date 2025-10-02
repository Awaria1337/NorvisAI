'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/Card';
import { Button } from '@/components/ui/button';
import { Settings, Check, X, AlertCircle, Zap, RefreshCw } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  provider: string;
  status: string;
  priority: number;
  calls: number;
  successRate: number;
  avgLatency: string;
  cost: string;
  isActive: boolean;
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/models');
      const result = await response.json();

      if (result.success) {
        setModels(result.data.models);
      }
    } catch (error) {
      console.error('Model verileri alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeModels = models.filter(m => m.isActive);
  const inactiveModels = models.filter(m => !m.isActive);

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">AI Modeller</h2>
            <p className="text-muted-foreground">AI model ayarlarını yönetin ve izleyin</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={fetchModels} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Yapılandır
            </Button>
          </div>
        </div>

        {/* Özet Kartlar */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Model</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{models.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeModels.length} aktif, {inactiveModels.length} pasif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Çağrı</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {models.reduce((sum, m) => sum + m.calls, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Tüm modellerdeki toplam kullanım
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ortalama Başarı</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeModels.length > 0 
                  ? (activeModels.reduce((sum, m) => sum + m.successRate, 0) / activeModels.length).toFixed(1)
                  : '0'}%
              </div>
              <p className="text-xs text-muted-foreground">
                Aktif modeller ortalaması
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Aktif Modeller */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="space-y-2">
                    <div className="h-5 bg-muted animate-pulse rounded w-32"></div>
                    <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="h-4 bg-muted animate-pulse rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeModels.length > 0 ? (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-4">Aktif Modeller</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeModels.map(model => (
                  <Card key={model.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{model.name}</CardTitle>
                          <CardDescription>{model.provider}</CardDescription>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <Check className="h-3 w-3 mr-1" />
                          Aktif
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Toplam Çağrı</span>
                          <span className="font-medium">{model.calls.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Başarı Oranı</span>
                          <span className="font-medium text-green-600">{model.successRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Ort. Gecikme</span>
                          <span className="font-medium">{model.avgLatency}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Maliyet</span>
                          <span className="font-medium">{model.cost}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Yedekleme Zinciri */}
            <Card>
              <CardHeader>
                <CardTitle>Yedekleme Zinciri</CardTitle>
                <CardDescription>Birincil model başarısız olduğunda yedekleme sırası</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeModels.slice(0, 3).map((model, index) => (
                    <div key={model.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-sm font-semibold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{model.name}</p>
                          <p className="text-sm text-muted-foreground">{model.provider}</p>
                        </div>
                      </div>
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Henüz aktif model yok</p>
              <p className="text-sm text-muted-foreground">API kullanımı başladığında modeller görünecek</p>
            </CardContent>
          </Card>
        )}

        {/* Pasif Modeller */}
        {!loading && inactiveModels.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Kullanılabilir Modeller</CardTitle>
              <CardDescription>Henüz kullanılmayan modeller</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inactiveModels.map(model => (
                  <div key={model.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-sm text-muted-foreground">{model.provider} • {model.cost}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                      Kullanılmamış
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

// Import Activity icon
import { Activity } from 'lucide-react';
