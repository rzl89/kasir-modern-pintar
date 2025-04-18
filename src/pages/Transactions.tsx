
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Transaction } from '@/lib/types';
import { Search, FileDown, Calendar, Filter, Eye, Receipt } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setTransactions(data as Transaction[]);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal memuat data transaksi',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [toast]);

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.id?.toString().includes(searchQuery) ||
      transaction.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
        <Button asChild>
          <Link to="/pos">
            <Receipt className="mr-2 h-4 w-4" /> Transaksi Baru
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Pencarian dan Filter</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <Input
              placeholder="Cari transaksi..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Calendar className="mr-2 h-4 w-4" /> Tanggal
            </Button>
            <Button variant="outline" className="flex-1">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
          <div>
            <Button variant="outline" className="w-full">
              <FileDown className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left font-medium">No. Transaksi</th>
                    <th className="py-3 text-left font-medium">Tanggal</th>
                    <th className="py-3 text-left font-medium">Pelanggan</th>
                    <th className="py-3 text-left font-medium">Total</th>
                    <th className="py-3 text-left font-medium">Metode Pembayaran</th>
                    <th className="py-3 text-center font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-neutral-50">
                      <td className="py-3">#{transaction.id}</td>
                      <td className="py-3">{formatDate(transaction.created_at)}</td>
                      <td className="py-3">{transaction.customer_name || 'Umum'}</td>
                      <td className="py-3">Rp {transaction.total_amount.toLocaleString('id-ID')}</td>
                      <td className="py-3">
                        {transaction.payment_method === 'cash'
                          ? 'Tunai'
                          : transaction.payment_method === 'card'
                          ? 'Kartu'
                          : 'Lainnya'}
                      </td>
                      <td className="py-3 flex justify-center">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/transactions/${transaction.id}`}>
                            <Eye size={16} />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-neutral-500">Tidak ada transaksi ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Transactions;
