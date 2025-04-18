
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';
import { Search, Plus, Minus, AlertCircle, ArrowUp, ArrowDown, Filter } from 'lucide-react';

type ProductWithCategory = Product & {
  categories?: {
    name: string;
  };
};

const Inventory = () => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(1);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustingStock, setAdjustingStock] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        // Join products with categories and stock tables
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(*),
            stock(quantity)
          `)
          .order('name');

        if (error) {
          throw error;
        }

        // Transform data to include stock quantity
        const productsWithStock = data.map(product => ({
          ...product,
          stock_quantity: product.stock && product.stock[0] ? product.stock[0].quantity : 0,
          categories: product.categories
        })) as ProductWithCategory[];

        setProducts(productsWithStock);
        setFilteredProducts(productsWithStock);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal memuat data inventori',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [toast]);

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const openAdjustmentModal = (product: ProductWithCategory, type: 'add' | 'subtract') => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setAdjustmentQuantity(1);
    setAdjustmentReason('');
    setAdjustmentModalOpen(true);
  };

  const handleStockAdjustment = async () => {
    if (!selectedProduct) return;

    setAdjustingStock(true);
    try {
      const newQuantity = adjustmentType === 'add'
        ? selectedProduct.stock_quantity + adjustmentQuantity
        : selectedProduct.stock_quantity - adjustmentQuantity;

      if (newQuantity < 0) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Stok tidak boleh kurang dari 0',
        });
        return;
      }

      // Update product stock in the stock table
      const { data: stockData, error: stockCheckError } = await supabase
        .from('stock')
        .select('*')
        .eq('product_id', selectedProduct.id);

      if (stockCheckError) throw stockCheckError;

      let updateError;
      if (stockData && stockData.length > 0) {
        // Update existing stock record
        const { error } = await supabase
          .from('stock')
          .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
          .eq('product_id', selectedProduct.id);
        updateError = error;
      } else {
        // Create new stock record
        const { error } = await supabase
          .from('stock')
          .insert({
            product_id: selectedProduct.id,
            quantity: newQuantity,
            low_stock_threshold: 10, // Default value
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        updateError = error;
      }

      if (updateError) throw updateError;

      // Update local state
      setProducts(products.map(product => 
        product.id === selectedProduct.id
          ? { ...product, stock_quantity: newQuantity }
          : product
      ));

      toast({
        title: 'Sukses',
        description: 'Stok berhasil disesuaikan',
      });

      // Close modal
      setAdjustmentModalOpen(false);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menyesuaikan stok',
      });
    } finally {
      setAdjustingStock(false);
    }
  };

  const getLowStockStatus = (quantity: number) => {
    if (quantity <= 0) return 'Habis';
    if (quantity <= 5) return 'Rendah';
    return 'Normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Habis':
        return 'text-red-500 bg-red-50';
      case 'Rendah':
        return 'text-amber-500 bg-amber-50';
      default:
        return 'text-green-500 bg-green-50';
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Inventori</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Pencarian dan Filter</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Stok Produk</CardTitle>
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
                    <th className="py-3 text-center font-medium">Stok</th>
                    <th className="py-3 text-center font-medium">Status</th>
                    <th className="py-3 text-center font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const status = getLowStockStatus(product.stock_quantity);
                    const statusClass = getStatusColor(status);
                    
                    return (
                      <tr key={product.id} className="border-b hover:bg-neutral-50">
                        <td className="py-3">{product.name}</td>
                        <td className="py-3">{product.sku || product.barcode || '-'}</td>
                        <td className="py-3">{product.categories?.name || '-'}</td>
                        <td className="py-3 text-center">{product.stock_quantity}</td>
                        <td className="py-3">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block mx-auto ${statusClass}`}>
                            {status}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-center space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => openAdjustmentModal(product, 'add')}>
                              <ArrowUp size={16} className="text-green-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openAdjustmentModal(product, 'subtract')}>
                              <ArrowDown size={16} className="text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      <Dialog open={adjustmentModalOpen} onOpenChange={setAdjustmentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === 'add' ? 'Tambah Stok' : 'Kurangi Stok'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedProduct && (
              <div className="space-y-2">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-neutral-500">
                  Stok saat ini: {selectedProduct.stock_quantity}
                </p>

                <div className="pt-2">
                  <Label htmlFor="quantity">Jumlah</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="reason">Alasan</Label>
                  <Select
                    value={adjustmentReason}
                    onValueChange={setAdjustmentReason}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih alasan" />
                    </SelectTrigger>
                    <SelectContent>
                      {adjustmentType === 'add' ? (
                        <>
                          <SelectItem value="purchase">Pembelian Baru</SelectItem>
                          <SelectItem value="return">Retur dari Pelanggan</SelectItem>
                          <SelectItem value="count_adjustment">Penyesuaian Perhitungan</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="damaged">Barang Rusak</SelectItem>
                          <SelectItem value="expired">Kadaluarsa</SelectItem>
                          <SelectItem value="lost">Kehilangan</SelectItem>
                          <SelectItem value="count_adjustment">Penyesuaian Perhitungan</SelectItem>
                        </>
                      )}
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {adjustmentType === 'subtract' && selectedProduct.stock_quantity < adjustmentQuantity && (
                  <div className="flex items-center text-red-600 mt-2">
                    <AlertCircle size={16} className="mr-2" />
                    <p className="text-sm">
                      Jumlah stok yang dikurangi melebihi stok yang tersedia
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdjustmentModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleStockAdjustment}
              disabled={
                adjustingStock ||
                adjustmentQuantity <= 0 ||
                (adjustmentType === 'subtract' &&
                  selectedProduct &&
                  selectedProduct.stock_quantity < adjustmentQuantity) ||
                !adjustmentReason
              }
            >
              {adjustingStock ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Menyimpan...
                </span>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Inventory;
