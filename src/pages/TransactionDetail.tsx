
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Transaction, TransactionItem } from '@/lib/types';
import { ArrowLeft, Printer, Receipt } from 'lucide-react';

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      setLoading(true);
      try {
        // Fetch transaction
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', id)
          .single();

        if (transactionError) {
          throw transactionError;
        }

        // Fetch transaction items
        const { data: itemsData, error: itemsError } = await supabase
          .from('transaction_items')
          .select('*')
          .eq('transaction_id', id);

        if (itemsError) {
          throw itemsError;
        }

        setTransaction(transactionData as Transaction);
        setItems(itemsData as TransactionItem[]);
      } catch (error) {
        console.error('Error fetching transaction details:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal memuat detail transaksi',
        });
        navigate('/transactions');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTransactionDetails();
    }
  }, [id, navigate, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handlePrintReceipt = () => {
    // In a real application, implement receipt printing here
    window.print();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </AppLayout>
    );
  }

  if (!transaction) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg text-neutral-500">Transaksi tidak ditemukan</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/transactions')}>
            Kembali ke Daftar Transaksi
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/transactions')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
        <h1 className="text-2xl font-bold">Detail Transaksi #{transaction.id}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Item Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left font-medium">Produk</th>
                      <th className="py-3 text-right font-medium">Harga</th>
                      <th className="py-3 text-right font-medium">Qty</th>
                      <th className="py-3 text-right font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length > 0 ? (
                      items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-3">{item.product_name}</td>
                          <td className="py-3 text-right">
                            Rp {item.unit_price.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 text-right">{item.quantity}</td>
                          <td className="py-3 text-right">
                            Rp {item.subtotal.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-neutral-500">
                          Tidak ada item
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                {transaction.notes || 'Tidak ada catatan untuk transaksi ini.'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Informasi Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-neutral-500">No. Transaksi</span>
                <span className="font-medium">#{transaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Tanggal</span>
                <span>{formatDate(transaction.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Pelanggan</span>
                <span>{transaction.customer_name || 'Umum'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Kasir</span>
                <span>Admin</span>
              </div>
              <div className="border-t border-dashed pt-4 mt-4 border-neutral-200">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>Rp {transaction.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-neutral-500">Diskon</span>
                  <span>Rp {transaction.discount_amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-neutral-500">Pajak</span>
                  <span>Rp {transaction.tax_amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-neutral-200 text-lg font-bold">
                  <span>Total</span>
                  <span>Rp {transaction.total_amount.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <div className="border-t border-dashed pt-4 mt-4 border-neutral-200">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Metode Pembayaran</span>
                  <span>
                    {transaction.payment_method === 'cash'
                      ? 'Tunai'
                      : transaction.payment_method === 'card'
                      ? 'Kartu'
                      : 'Lainnya'}
                  </span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-neutral-500">Status</span>
                  <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                    Lunas
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col space-y-2">
            <Button onClick={handlePrintReceipt}>
              <Printer className="mr-2 h-4 w-4" /> Cetak Struk
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TransactionDetail;
