'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Filter, Eye, EyeOff } from 'lucide-react';

interface Prompt {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  model: string;
  prompt: string;
  timestamp: string;
  tokens: number;
  status: string;
  responseTime: string;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [anonymize, setAnonymize] = useState(true);
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchPrompts();
  }, [searchQuery, selectedModel, selectedStatus, currentPage]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchQuery,
        model: selectedModel,
        status: selectedStatus
      });

      const response = await fetch(`/api/admin/prompts?${params}`);
      const result = await response.json();

      if (result.success) {
        setPrompts(result.data.prompts);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.totalCount);
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    alert('Exporting to CSV...');
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Prompt Logs</h2>
            <p className="text-muted-foreground">View and analyze all AI prompt interactions</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setAnonymize(!anonymize)}>
              {anonymize ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {anonymize ? 'Anonymized' : 'Show IDs'}
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">All Models</option>
                  <option value="GPT-4">GPT-4</option>
                  <option value="Claude-3">Claude-3</option>
                  <option value="Gemini Pro">Gemini Pro</option>
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Timestamp</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Model</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Prompt</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Response Time</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-4"><div className="h-4 bg-muted animate-pulse rounded"></div></td>
                        <td className="p-4"><div className="h-4 bg-muted animate-pulse rounded w-24"></div></td>
                        <td className="p-4"><div className="h-6 bg-muted animate-pulse rounded w-20"></div></td>
                        <td className="p-4"><div className="h-4 bg-muted animate-pulse rounded"></div></td>
                        <td className="p-4"><div className="h-4 bg-muted animate-pulse rounded w-12"></div></td>
                        <td className="p-4"><div className="h-6 bg-muted animate-pulse rounded w-16"></div></td>
                        <td className="p-4"><div className="h-4 bg-muted animate-pulse rounded w-12"></div></td>
                      </tr>
                    ))
                  ) : prompts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="h-24 text-center text-muted-foreground">
                        No prompts found.
                      </td>
                    </tr>
                  ) : (
                    prompts.map((prompt) => {
                      const displayUser = anonymize 
                        ? `${prompt.userName.substring(0, 3)}***` 
                        : `${prompt.userName} (${prompt.userEmail})`;
                      
                      return (
                        <tr key={prompt.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(prompt.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="p-4 text-sm font-mono">{displayUser}</td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary">
                              {prompt.model}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs truncate text-sm">{prompt.prompt}</td>
                          <td className="p-4 text-sm">{prompt.responseTime}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              prompt.status === 'success' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {prompt.status}
                            </span>
                          </td>
                          <td className="p-4 text-sm">{prompt.tokens.toLocaleString()}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && prompts.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} prompts
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
