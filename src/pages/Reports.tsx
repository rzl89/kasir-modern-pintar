
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, RefreshCw } from 'lucide-react';

// Mock data for demonstration
const salesData = [
  { name: 'Jan', sales: 4000, profit: 2400 },
  { name: 'Feb', sales: 3000, profit: 1398 },
  { name: 'Mar', sales: 2000, profit: 9800 },
  { name: 'Apr', sales: 2780, profit: 3908 },
  { name: 'May', sales: 1890, profit: 4800 },
  { name: 'Jun', sales: 2390, profit: 3800 },
  { name: 'Jul', sales: 3490, profit: 4300 },
];

const topProductsData = [
  { name: 'Product A', value: 400 },
  { name: 'Product B', value: 300 },
  { name: 'Product C', value: 300 },
  { name: 'Product D', value: 200 },
  { name: 'Product E', value: 100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

const Reports = () => {
  const [reportPeriod, setReportPeriod] = useState('weekly');
  const [loading, setLoading] = useState(false);

  const handleRefreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleExportData = (format: string) => {
    // In a real application, implement actual export functionality
    console.log(`Exporting data as ${format}`);
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Laporan & Analitik</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefreshData} disabled={loading}>
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></span>
                Memuat...
              </span>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </>
            )}
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" /> Pilih Periode
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Penjualan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Rp 12.500.000</div>
            <div className="text-sm text-green-600 mt-1">↑ 12% dari periode sebelumnya</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">256</div>
            <div className="text-sm text-green-600 mt-1">↑ 8% dari periode sebelumnya</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rata-rata Penjualan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Rp 48.828</div>
            <div className="text-sm text-red-600 mt-1">↓ 3% dari periode sebelumnya</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="mb-6">
          <TabsTrigger value="sales">Penjualan</TabsTrigger>
          <TabsTrigger value="products">Produk</TabsTrigger>
          <TabsTrigger value="inventory">Inventori</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales">
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle>Tren Penjualan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, '']} />
                    <Legend />
                    <Bar dataKey="sales" name="Penjualan" fill="#8884d8" />
                    <Bar dataKey="profit" name="Keuntungan" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Metode Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Tunai', value: 70 },
                          { name: 'Kartu Kredit', value: 20 },
                          { name: 'Transfer', value: 10 },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[0, 1, 2].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Persentase']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Waktu Penjualan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { hour: '08:00', transactions: 10 },
                        { hour: '10:00', transactions: 25 },
                        { hour: '12:00', transactions: 40 },
                        { hour: '14:00', transactions: 30 },
                        { hour: '16:00', transactions: 20 },
                        { hour: '18:00', transactions: 35 },
                        { hour: '20:00', transactions: 15 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="transactions" name="Transaksi" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="products">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Produk Paling Laris</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topProductsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {topProductsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Kategori Terlaris</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { category: 'Minuman', sales: 4000 },
                        { category: 'Makanan', sales: 3000 },
                        { category: 'Snack', sales: 2000 },
                        { category: 'ATK', sales: 1000 },
                        { category: 'Lainnya', sales: 500 },
                      ]}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" />
                      <Tooltip formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Penjualan']} />
                      <Bar dataKey="sales" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory">
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle>Pergerakan Stok</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Jan', inflow: 500, outflow: 400 },
                      { name: 'Feb', inflow: 600, outflow: 500 },
                      { name: 'Mar', inflow: 400, outflow: 670 },
                      { name: 'Apr', inflow: 700, outflow: 550 },
                      { name: 'May', inflow: 800, outflow: 600 },
                      { name: 'Jun', inflow: 650, outflow: 500 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inflow" name="Masuk" fill="#82ca9d" />
                    <Bar dataKey="outflow" name="Keluar" fill="#ff7675" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Produk Stok Rendah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left font-medium">Nama Produk</th>
                      <th className="py-3 text-left font-medium">Kategori</th>
                      <th className="py-3 text-center font-medium">Stok</th>
                      <th className="py-3 text-center font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 1, name: 'Produk A', category: 'Minuman', stock: 2, status: 'Kritis' },
                      { id: 2, name: 'Produk B', category: 'Makanan', stock: 5, status: 'Rendah' },
                      { id: 3, name: 'Produk C', category: 'Snack', stock: 0, status: 'Habis' },
                      { id: 4, name: 'Produk D', category: 'ATK', stock: 3, status: 'Rendah' },
                      { id: 5, name: 'Produk E', category: 'Minuman', stock: 4, status: 'Rendah' },
                    ].map((product) => (
                      <tr key={product.id} className="border-b hover:bg-neutral-50">
                        <td className="py-3">{product.name}</td>
                        <td className="py-3">{product.category}</td>
                        <td className="py-3 text-center">{product.stock}</td>
                        <td className="py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.status === 'Kritis'
                                ? 'bg-red-50 text-red-600'
                                : product.status === 'Rendah'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-neutral-50 text-neutral-600'
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Reports;
