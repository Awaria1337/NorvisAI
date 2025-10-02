'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Flag,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
  Calendar,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserReport {
  id: string;
  userId: string;
  type: 'BUG' | 'FEATURE' | 'FEEDBACK';
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  adminNotes?: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ReportsStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  byType: {
    bug: number;
    feature: number;
    feedback: number;
  };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [stats, setStats] = useState<ReportsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingReport, setUpdatingReport] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filterType, filterStatus]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await fetch(`/api/admin/reports?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setReports(result.data.reports);
        setStats(result.data.stats);
      } else {
        toast.error('Raporlar yüklenemedi');
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report: UserReport) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || '');
    setShowDetailModal(true);
  };

  const handleUpdateReport = async (
    status?: string,
    priority?: string
  ) => {
    if (!selectedReport) return;

    setUpdatingReport(true);
    try {
      const response = await fetch(`/api/admin/reports/${selectedReport.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          status,
          priority,
          adminNotes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Rapor güncellendi');
        fetchReports();
        setShowDetailModal(false);
      } else {
        toast.error(result.error || 'Güncelleme başarısız');
      }
    } catch (error) {
      console.error('Update report error:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setUpdatingReport(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Bu raporu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Rapor silindi');
        fetchReports();
      } else {
        toast.error(result.error || 'Silme başarısız');
      }
    } catch (error) {
      console.error('Delete report error:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Beklemede', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      IN_PROGRESS: { label: 'İşleniyor', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      RESOLVED: { label: 'Çözüldü', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      REJECTED: { label: 'Reddedildi', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      BUG: { label: '🐛 Hata', className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' },
      FEATURE: { label: '💡 Özellik', className: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
      FEEDBACK: { label: '💬 Geri Bildirim', className: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.FEEDBACK;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      LOW: { label: 'Düşük', className: 'bg-gray-100 text-gray-800' },
      MEDIUM: { label: 'Orta', className: 'bg-yellow-100 text-yellow-800' },
      HIGH: { label: 'Yüksek', className: 'bg-orange-100 text-orange-800' },
      URGENT: { label: 'Acil', className: 'bg-red-100 text-red-800' },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredReports = reports.filter((report) =>
    report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Flag className="h-8 w-8" />
              Kullanıcı Raporları
            </h2>
            <p className="text-muted-foreground mt-1">
              Kullanıcılardan gelen hata bildirimleri ve geri bildirimleri
            </p>
          </div>
          <Button onClick={fetchReports} variant="outline">
            Yenile
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Rapor</CardTitle>
                <Flag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">İşleniyor</CardTitle>
                <AlertTriangle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Çözüldü</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolved}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rapor ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Tür" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Türler</SelectItem>
                  <SelectItem value="BUG">Hata</SelectItem>
                  <SelectItem value="FEATURE">Özellik</SelectItem>
                  <SelectItem value="FEEDBACK">Geri Bildirim</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="PENDING">Beklemede</SelectItem>
                  <SelectItem value="IN_PROGRESS">İşleniyor</SelectItem>
                  <SelectItem value="RESOLVED">Çözüldü</SelectItem>
                  <SelectItem value="REJECTED">Reddedildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Raporlar</CardTitle>
            <CardDescription>
              {filteredReports.length} rapor gösteriliyor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Henüz rapor bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getTypeBadge(report.type)}
                        {getStatusBadge(report.status)}
                        {getPriorityBadge(report.priority)}
                      </div>

                      <p className="text-sm line-clamp-2">{report.description}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {report.user.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReport(report)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReport(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rapor Detayları</DialogTitle>
            <DialogDescription>
              Raporu inceleyin ve durumunu güncelleyin
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {getTypeBadge(selectedReport.type)}
                {getStatusBadge(selectedReport.status)}
                {getPriorityBadge(selectedReport.priority)}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Kullanıcı Bilgileri</h4>
                <div className="text-sm space-y-1">
                  <p><strong>İsim:</strong> {selectedReport.user.name}</p>
                  <p><strong>Email:</strong> {selectedReport.user.email}</p>
                  <p><strong>Tarih:</strong> {new Date(selectedReport.createdAt).toLocaleString('tr-TR')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Açıklama</h4>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {selectedReport.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Admin Notları</h4>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Admin notları ekleyin..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Durum Değiştir</h4>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateReport('IN_PROGRESS')}
                      disabled={updatingReport}
                      className="justify-start"
                    >
                      İşleme Al
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateReport('RESOLVED')}
                      disabled={updatingReport}
                      className="justify-start"
                    >
                      Çözüldü Olarak İşaretle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateReport('REJECTED')}
                      disabled={updatingReport}
                      className="justify-start"
                    >
                      Reddet
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Öncelik Değiştir</h4>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateReport(undefined, 'LOW')}
                      disabled={updatingReport}
                      className="justify-start"
                    >
                      Düşük
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateReport(undefined, 'MEDIUM')}
                      disabled={updatingReport}
                      className="justify-start"
                    >
                      Orta
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateReport(undefined, 'HIGH')}
                      disabled={updatingReport}
                      className="justify-start"
                    >
                      Yüksek
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateReport(undefined, 'URGENT')}
                      disabled={updatingReport}
                      className="justify-start"
                    >
                      Acil
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Kapat
            </Button>
            <Button
              onClick={() => handleUpdateReport()}
              disabled={updatingReport}
            >
              {updatingReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                'Notları Kaydet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
