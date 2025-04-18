
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart, XAxis, YAxis, Bar, Line, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { SalesReport, Product } from '@/lib/types';
import { ShoppingCart, PackageIcon, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const [salesData, setSalesData] = useState<SalesReport[]>([]);
  const [todaySales, setTodaySales] = useState(0);
  const [monthSales, setMonthSales] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get sales data for last 7 days
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);

        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('created_at, total_amount')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        if (transactionsError) {
          console.error('Error fetching transactions:', transactionsError);
        } else {
          // Process transactions into daily sales
          const salesByDay = transactionsData.reduce((acc: Record<string, { sales: number, count: number }>, curr) => {
            const date = new Date(curr.created_at).toISOString().split('T')[0];
            if (!acc[date]) {
              acc[date] = { sales: 0, count: 0 };
            }
            acc[date].sales += curr.total_amount;
            acc[date].count += 1;
            return acc;
          }, {});

          // Convert to array format for chart
          const salesArray: SalesReport[] = Object.entries(salesByDay).map(([date, data]) => ({
            date,
            sales: data.sales,
            transactions: data.count,
            average: data.sales / data.count,
          }));

          setSalesData(salesArray);

          // Calculate today's sales
          const today = new Date().toISOString().split('T')[0];
          const todaySalesData = salesByDay[today] || { sales: 0 };
          setTodaySales(todaySalesData.sales);

          // Calculate month sales
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          const { data: monthData, error: monthError } = await supabase
            .from('transactions')
            .select('total_amount')
            .gte('created_at', startOfMonth);

          if (!monthError) {
            const monthTotal = monthData.reduce((sum, tx) => sum + tx.total_amount, 0);
            setMonthSales(monthTotal);
          }
        }

        // Get total products
        const { count: productCount, error: productCountError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (!productCountError && productCount !== null) {
          setTotalProducts(productCount);
        }

        // Get low stock products
        const { data: lowStockData, error: lowStockError } = await supabase
          .from('products')
          .select('*')
          .lt('stock_quantity', 10)
          .eq('is_active', true)
          .order('stock_quantity', { ascending: true })
          .limit(5);

        if (!lowStockError && lowStockData) {
          setLowStockProducts(lowStockData as Product[]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button asChild>
            <Link to="/pos">
              <ShoppingCart className="mr-2" size={18} />
              Buka Kasir
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Penjualan Hari Ini</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {loading ? "..." : `Rp ${todaySales.toLocaleString('id-ID')}`}
                  </h3>
                </div>
                <div className="bg-primary-100 p-3 rounded-full">
                  <DollarSign className="text-primary-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Penjualan Bulan Ini</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {loading ? "..." : `Rp ${monthSales.toLocaleString('id-ID')}`}
                  </h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Total Produk</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {loading ? "..." : totalProducts}
                  </h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <PackageIcon className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Stok Menipis</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {loading ? "..." : lowStockProducts.length}
                  </h3>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <AlertCircle className="text-amber-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Penjualan 7 Hari Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" name="Penjualan (Rp)" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jumlah Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="transactions" name="Jumlah Transaksi" stroke="#10B981" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Produk dengan Stok Menipis</CardTitle>
              <Button variant="outline" asChild>
                <Link to="/inventory">Lihat Semua</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : lowStockProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Produk</th>
                      <th className="text-center py-3 px-4">Stok</th>
                      <th className="text-right py-3 px-4">Harga</th>
                      <th className="text-right py-3 px-4">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="text-center py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            {product.stock_quantity}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">Rp {product.price.toLocaleString('id-ID')}</td>
                        <td className="text-right py-3 px-4">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/inventory?product=${product.id}`}>
                              Tambah Stok
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-neutral-500 py-8">Tidak ada produk dengan stok menipis.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
