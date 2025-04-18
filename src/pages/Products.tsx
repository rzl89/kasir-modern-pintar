
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, FileUp, FileDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';

type ProductWithCategory = Product & {
  categories?: {
    name: string;
  };
};

const Products = () => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .order('name');

        if (error) {
          throw error;
        }

        setProducts(data as ProductWithCategory[]);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal memuat data produk',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Produk</h1>
        <Button asChild>
          <Link to="/products/add">
            <Plus className="mr-2 h-4 w-4" /> Tambah Produk
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
              placeholder="Cari produk..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <FileUp className="mr-2 h-4 w-4" /> Import
            </Button>
            <Button variant="outline" className="flex-1">
              <FileDown className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left font-medium">Nama Produk</th>
                    <th className="py-3 text-left font-medium">SKU/Barcode</th>
                    <th className="py-3 text-left font-medium">Kategori</th>
                    <th className="py-3 text-left font-medium">Harga</th>
                    <th className="py-3 text-left font-medium">Stok</th>
                    <th className="py-3 text-center font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-neutral-50">
                      <td className="py-3">{product.name}</td>
                      <td className="py-3">{product.sku || product.barcode || '-'}</td>
                      <td className="py-3">{product.categories?.name || '-'}</td>
                      <td className="py-3">Rp {product.price.toLocaleString('id-ID')}</td>
                      <td className="py-3">{product.stock_quantity}</td>
                      <td className="py-3 flex justify-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/products/edit/${product.id}`}>
                            <Edit size={16} />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-neutral-500">Tidak ada produk ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Products;
