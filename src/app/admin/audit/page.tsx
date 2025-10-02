'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Shield, User, Settings } from 'lucide-react';

export default function AuditPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const auditLogs = [
    { id: '1', admin: 'admin@norvis.ai', action: 'login', details: 'Successful login', ipAddress: '192.168.1.1', timestamp: '2025-01-10 14:30:22' },
    { id: '2', admin: 'admin@norvis.ai', action: 'user_suspend', details: 'Suspended user: user_abc123', ipAddress: '192.168.1.1', timestamp: '2025-01-10 14:28:15' },
    { id: '3', admin: 'support@norvis.ai', action: 'model_switch', details: 'Changed primary model to GPT-4', ipAddress: '192.168.1.5', timestamp: '2025-01-10 14:15:40' },
    { id: '4', admin: 'admin@norvis.ai', action: 'notification_send', details: 'Sent notification to Premium users', ipAddress: '192.168.1.1', timestamp: '2025-01-10 13:45:30' },
    { id: '5', admin: 'support@norvis.ai', action: 'feature_toggle', details: 'Enabled: Image Generation', ipAddress: '192.168.1.5', timestamp: '2025-01-10 12:20:10' },
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return <Shield className="h-4 w-4" />;
      case 'user_suspend': return <User className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
            <p className="text-muted-foreground">Track all administrative actions</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Timestamp</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Admin</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Action</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Details</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4 text-sm text-muted-foreground">{log.timestamp}</td>
                      <td className="p-4 text-sm font-medium">{log.admin}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary">
                          {getActionIcon(log.action)}
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{log.details}</td>
                      <td className="p-4 text-sm font-mono">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
