'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/Card';
import { Button } from '@/components/ui/button';
import { Zap, ToggleLeft, ToggleRight } from 'lucide-react';

export default function FeaturesPage() {
  const [features, setFeatures] = useState([
    { id: '1', name: 'Image Generation', description: 'AI-powered image creation', enabled: true, rollout: 100, plan: 'Premium' },
    { id: '2', name: 'Code Generation', description: 'AI code assistant', enabled: true, rollout: 100, plan: 'All' },
    { id: '3', name: 'Voice Chat', description: 'Voice-to-text AI chat', enabled: false, rollout: 0, plan: 'Premium' },
    { id: '4', name: 'Document Analysis', description: 'Upload and analyze documents', enabled: true, rollout: 50, plan: 'Enterprise' },
  ]);

  const toggleFeature = (id: string) => {
    setFeatures(features.map(f => 
      f.id === id ? { ...f, enabled: !f.enabled } : f
    ));
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Feature Flags</h2>
            <p className="text-muted-foreground">Control feature availability and rollout</p>
          </div>
        </div>

        <div className="grid gap-4">
          {features.map(feature => (
            <Card key={feature.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{feature.name}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 mt-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Rollout</span>
                        <div className="flex items-center mt-1">
                          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${feature.rollout}%` }}
                            />
                          </div>
                          <span className="ml-2 text-sm font-medium">{feature.rollout}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Plan</span>
                        <p className="text-sm font-medium mt-1">{feature.plan}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={feature.enabled ? "default" : "outline"}
                    onClick={() => toggleFeature(feature.id)}
                    className="ml-4"
                  >
                    {feature.enabled ? (
                      <>
                        <ToggleRight className="mr-2 h-4 w-4" />
                        Enabled
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="mr-2 h-4 w-4" />
                        Disabled
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
