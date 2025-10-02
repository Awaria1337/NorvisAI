'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/Card';
import { Button } from '@/components/ui/button';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  AlertCircle,
  Download
} from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, Area, AreaChart, Bar, BarChart } from 'recharts';

interface AIStatsData {
  kpis: {
    totalPrompts: number;
    promptGrowth: number;
    avgResponseTime: number;
    responseTimeChange: number;
    totalTokens: number;
    tokenGrowth: number;
    errorRate: number;
    errorRateChange: number;
  };
  promptData: any[];
  tokenData: any[];
  latencyData: any[];
  modelPerformance: any[];
}

export default function AIStatsPage() {
  const [data, setData] = useState<AIStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/ai-stats?range=${timeRange}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch AI stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading AI statistics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-muted-foreground">Failed to load AI statistics</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">AI Statistics</h2>
            <p className="text-muted-foreground">
              Monitor AI model usage and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.kpis.totalPrompts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${data.kpis.promptGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.kpis.promptGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {data.kpis.promptGrowth >= 0 ? '+' : ''}{data.kpis.promptGrowth.toFixed(1)}%
                </span> from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.kpis.avgResponseTime.toFixed(1)}s</div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${data.kpis.responseTimeChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.kpis.responseTimeChange <= 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                  {data.kpis.responseTimeChange >= 0 ? '+' : ''}{data.kpis.responseTimeChange.toFixed(1)}%
                </span> {data.kpis.responseTimeChange <= 0 ? 'faster' : 'slower'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.kpis.totalTokens >= 1000000 
                  ? `${(data.kpis.totalTokens / 1000000).toFixed(1)}M` 
                  : `${(data.kpis.totalTokens / 1000).toFixed(0)}K`}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${data.kpis.tokenGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.kpis.tokenGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {data.kpis.tokenGrowth >= 0 ? '+' : ''}{data.kpis.tokenGrowth.toFixed(1)}%
                </span> from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.kpis.errorRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${data.kpis.errorRateChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.kpis.errorRateChange <= 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                  {data.kpis.errorRateChange >= 0 ? '+' : ''}{data.kpis.errorRateChange.toFixed(1)}%
                </span> from last period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Prompts by Model</CardTitle>
              <CardDescription>Daily prompt distribution across AI models</CardDescription>
            </CardHeader>
            <CardContent>
              {data.promptData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.promptData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="gpt4" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="claude" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="gemini" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available for this period
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Token Consumption</CardTitle>
              <CardDescription>Daily token usage trends</CardDescription>
            </CardHeader>
            <CardContent>
              {data.tokenData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.tokenData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="tokens" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available for this period
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Latency Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time Analysis</CardTitle>
            <CardDescription>Average and 95th percentile latency throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.latencyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}s`} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="avg" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p95" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Model Performance Comparison</CardTitle>
            <CardDescription>Detailed metrics for each AI model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Model</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Calls</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Avg Latency</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Success Rate</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {data.modelPerformance.length > 0 ? (
                    data.modelPerformance.map((model, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{model.model}</td>
                        <td className="p-4">{model.calls.toLocaleString()}</td>
                        <td className="p-4">{model.avgLatency}</td>
                        <td className="p-4"><span className="text-green-600">{model.successRate}%</span></td>
                        <td className="p-4">{model.cost}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        No model data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
