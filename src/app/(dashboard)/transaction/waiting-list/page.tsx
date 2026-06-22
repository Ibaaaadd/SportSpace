'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/Card';
import DataTable, { type Column } from '../../../../components/ui/DataTable';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { ToastProvider, useToast } from '../../../../components/ui/Toast';
import {
  normalizeWaitingList,
  formatDate,
  WAITING_LIST_NOTIFICATION_BADGE,
  type WaitingListItem,
} from './_data';

function WaitingListContent() {
  const { toast } = useToast();
  const [waitingList, setWaitingList] = useState<WaitingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notificationFilter, setNotificationFilter] = useState('');

  // Notification status options
  const notificationOptions = [
    { value: 'true', label: 'Sudah Dinotifikasi' },
    { value: 'false', label: 'Belum Dinotifikasi' },
  ];

  // Fetch waiting list
  useEffect(() => {
    const fetchWaitingList = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/waiting-list');

        if (res.ok) {
          const data = await res.json();
          setWaitingList(data.data?.map(normalizeWaitingList) || []);
        } else {
          toast.error('Gagal mengambil data waiting list');
        }
      } catch (error) {
        console.error('Error fetching waiting list:', error);
        toast.error('Gagal mengambil data waiting list');
      } finally {
        setLoading(false);
      }
    };

    fetchWaitingList();
  }, [toast]);

  // Filter waiting list
  const filtered = useMemo(() => {
    let result = waitingList;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.userName.toLowerCase().includes(q) ||
          w.venueName.toLowerCase().includes(q)
      );
    }

    if (notificationFilter !== '') {
      result = result.filter((w) => w.isNotified === (notificationFilter === 'true'));
    }

    return result;
  }, [waitingList, search, notificationFilter]);

  // Handle remove from waiting list
  const handleRemove = async (id: string, userName: string) => {
    if (!window.confirm(`Hapus ${userName} dari waiting list?`)) return;

    try {
      const res = await fetch(`/api/waiting-list/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setWaitingList((prev) => prev.filter((w) => w.id !== id));
        toast.success('Dihapus dari waiting list');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Gagal menghapus dari waiting list');
      }
    } catch (error) {
      console.error('Error removing from waiting list:', error);
      toast.error('Gagal menghapus dari waiting list');
    }
  };

  // Columns
  const columns: Column<WaitingListItem>[] = [
    {
      header: 'User',
      accessor: 'userName',
    },
    {
      header: 'Lapangan',
      accessor: 'venueName',
    },
    {
      header: 'Tanggal',
      accessor: 'bookingDate',
      cell: (value) => formatDate(value),
    },
    {
      header: 'Jam',
      accessor: 'startTime',
      cell: (value, row) => `${value} - ${row.endTime}`,
    },
    {
      header: 'Status Notifikasi',
      accessor: 'isNotified',
      cell: (value) => {
        const key = value ? 'true' : 'false';
        const badge = WAITING_LIST_NOTIFICATION_BADGE[key as keyof typeof WAITING_LIST_NOTIFICATION_BADGE];
        return <Badge className={badge.color}>{badge.label}</Badge>;
      },
    },
    {
      header: 'Tanggal Daftar',
      accessor: 'createdAt',
      cell: (value) => formatDate(value),
    },
    {
      header: 'Action',
      accessor: 'id',
      cell: (id, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleRemove(id, row.userName)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Waiting List</CardTitle>
            <CardDescription>Antrian pelanggan menunggu slot tersedia</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Cari user atau lapangan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select
              value={notificationFilter}
              onChange={(e) => setNotificationFilter(e.target.value)}
              options={notificationOptions}
              placeholder="Semua Status Notifikasi"
            />
          </div>

          {loading ? (
            <div className="py-8 text-center text-text-muted">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-text-muted">Tidak ada data waiting list</div>
          ) : (
            <DataTable columns={columns} data={filtered} />
          )}
        </CardContent>
      </Card>

    </>
  );
}

export default function WaitingListPage() {
  return (
    <ToastProvider>
      <section className="space-y-4">
        <WaitingListContent />
      </section>
    </ToastProvider>
  );
}
