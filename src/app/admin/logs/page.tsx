'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader } from '@/components/admin/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [logLevel, setLogLevel] = useState('all');

  const systemLogs = [
    { id: '1', level: 'error', message: 'API timeout for user_xyz789', service: 'AI Service', timestamp: '2025-01-10 14:35:12' },
    { id: '2', level: 'warning', message: 'High memory usage detected (85%)', service: 'System Monitor', timestamp: '2025-01-10 14:30:45' },
    { id: '3', level: 'info', message: 'Database backup completed successfully', service: 'Backup Service', timestamp: '2025-01-10 14:25:00' },
    { id: '4', level: 'error', message: 'Failed to send notification', service: 'Notification Service', timestamp: '2025-01-10 14:20:30' },
    { id: '5', level: 'info', message: 'Cache cleared successfully', service: 'Cache Manager', timestamp: '2025-01-10 14:15:20' },
  ];

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogStyle = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">System Logs</h2>
            <p className="text-muted-foreground">Monitor system events and errors</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                className="h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All Levels</option>
                <option value="error">Errors</option>
                <option value="warning">Warnings</option>
                <option value="info">Info</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  {getLogIcon(log.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLogStyle(log.level)}`}>
                        {log.level}
                      </span>
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium">{log.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{log.service}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
