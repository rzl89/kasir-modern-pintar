import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { Product, Category, CartItem, Transaction } from '@/lib/types';
import { Search, Plus, Minus, Trash2, ShoppingBag, CreditCard, Printer, Bookmark, Tag, Barcode } from 'lucide-react';

const POS = () => {
  const { toast } = useToast();
  const { 
    cart, 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    applyDiscount, 
    addCustomerDetails, 
    processTransaction,
    loading 
  } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'other'>('cash');
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [loading1, setLoading1] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading1(true);
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
        } else {
          setCategories(categoriesData as Category[]);
        }

        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, category:categories(name)')
          .eq('is_active', true)
          .order('name');

        if (productsError) {
          console.error('Error fetching products:', productsError);
        } else {
          setProducts(productsData as Product[]);
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal memuat data produk dan kategori',
        });
      } finally {
        setLoading1(false);
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeCategory) {
      filtered = filtered.filter(product => product.category_id === activeCategory);
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, activeCategory]);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const product = products.find(p => p.barcode === barcodeInput.trim());
    if (product) {
      addToCart(product);
      setBarcodeInput('');
      toast({
        title: 'Produk ditemukan',
        description: `${product.name} ditambahkan ke keranjang`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Produk tidak ditemukan',
        description: 'Barcode tidak cocok dengan produk manapun',
      });
    }
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Keranjang kosong',
        description: 'Tambahkan produk ke keranjang sebelum checkout',
      });
      return;
    }
    
    setIsCheckoutModalOpen(true);
  };

  const handleFinishCheckout = () => {
    applyDiscount(discountAmount);
    addCustomerDetails(customerName || undefined, notes || undefined);
    setIsCheckoutModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handleProcessPayment = async () => {
    if (paymentMethod === 'cash' && amountReceived < cart.total_amount) {
      toast({
        variant: 'destructive',
        title: 'Jumlah uang tidak mencukupi',
        description: 'Jumlah yang diberikan kurang dari total pembayaran',
      });
      return;
    }

    const result = await processTransaction(paymentMethod);
    if (result) {
      setTransaction(result);
      setIsPaymentModalOpen(false);
      setIsReceiptModalOpen(true);
      
      setCustomerName('');
      setNotes('');
      setDiscountAmount(0);
      setAmountReceived(0);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
    setIsReceiptModalOpen(false);
  };

  const calculateChange = () => {
    return Math.max(0, amountReceived - cart.total_amount);
  };

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6">
        <div className="lg:w-2/3 flex flex-col">
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <Input
                  placeholder="Cari produk..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <form onSubmit={handleBarcodeSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <Input
                  placeholder="Scan barcode..."
                  className="pl-10"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                />
              </div>
              <Button type="submit">Tambah</Button>
            </form>
          </div>

          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <div className="overflow-x-auto pb-2">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setActiveCategory(null)}>
                  Semua
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="all" className="flex-1 mt-0 bg-neutral-50 rounded-md p-4 overflow-hidden">
              {loading1 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className={`cursor-pointer hover:border-primary-500 transition-colors ${
                          product.stock_quantity <= 0 ? 'opacity-50' : ''
                        }`}
                        onClick={() => {
                          if (product.stock_quantity > 0) {
                            addToCart(product);
                          } else {
                            toast({
                              variant: 'destructive',
                              title: 'Stok kosong',
                              description: `${product.name} tidak tersedia`,
                            });
                          }
                        }}
                      >
                        <CardContent className="p-3 text-center">
                          <div className="aspect-square flex items-center justify-center mb-2 bg-neutral-100 rounded-md">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover rounded-md"
                              />
                            ) : (
                              <ShoppingBag className="h-12 w-12 text-neutral-400" />
                            )}
                          </div>
                          <div className="text-sm font-medium truncate">{product.name}</div>
                          <div className="flex justify-between items-center mt-1">
                            <div className="text-xs text-neutral-500">Stok: {product.stock_quantity}</div>
                            <div className="text-sm font-semibold">Rp {product.price.toLocaleString('id-ID')}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Tag className="h-12 w-12 text-neutral-400 mb-2" />
                  <p className="text-neutral-500">Tidak ada produk ditemukan</p>
                </div>
              )}
            </TabsContent>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="flex-1 mt-0 bg-neutral-50 rounded-md p-4 overflow-hidden">
                {loading1 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <ScrollArea className="h-full">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredProducts.map((product) => (
                        <Card
                          key={product.id}
                          className={`cursor-pointer hover:border-primary-500 transition-colors ${
                            product.stock_quantity <= 0 ? 'opacity-50' : ''
                          }`}
                          onClick={() => {
                            if (product.stock_quantity > 0) {
                              addToCart(product);
                            } else {
                              toast({
                                variant: 'destructive',
                                title: 'Stok kosong',
                                description: `${product.name} tidak tersedia`,
                              });
                            }
                          }}
                        >
                          <CardContent className="p-3 text-center">
                            <div className="aspect-square flex items-center justify-center mb-2 bg-neutral-100 rounded-md">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-full w-full object-cover rounded-md"
                                />
                              ) : (
                                <ShoppingBag className="h-12 w-12 text-neutral-400" />
                              )}
                            </div>
                            <div className="text-sm font-medium truncate">{product.name}</div>
                            <div className="flex justify-between items-center mt-1">
                              <div className="text-xs text-neutral-500">Stok: {product.stock_quantity}</div>
                              <div className="text-sm font-semibold">Rp {product.price.toLocaleString('id-ID')}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Tag className="h-12 w-12 text-neutral-400 mb-2" />
                    <p className="text-neutral-500">Tidak ada produk ditemukan</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="lg:w-1/3 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-0">
              <CardTitle>Keranjang Belanja</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden pt-4">
              {cart.items.length > 0 ? (
                <ScrollArea className="h-[calc(100%-120px)]">
                  <div className="space-y-3">
                    {cart.items.map((item: CartItem) => (
                      <div key={item.product_id} className="flex items-center border-b border-neutral-200 pb-3">
                        <div className="flex-1">
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-neutral-500">
                            Rp {item.unit_price.toLocaleString('id-ID')} x {item.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            Rp {(item.unit_price * item.quantity).toLocaleString('id-ID')}
                          </div>
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateCartItem(item.product_id, item.quantity - 1)}
                            >
                              <Minus size={14} />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateCartItem(item.product_id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock_quantity}
                            >
                              <Plus size={14} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700 ml-1"
                              onClick={() => removeFromCart(item.product_id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                  <ShoppingBag className="h-12 w-12 mb-2" />
                  <p>Keranjang kosong</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col">
              <div className="w-full space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {cart.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Diskon</span>
                  <span>Rp {cart.discount_amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak</span>
                  <span>Rp {cart.tax_amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-neutral-200 pt-3">
                  <span>Total</span>
                  <span>Rp {cart.total_amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => clearCart()}>
                    Bersihkan
                  </Button>
                  <Button className="flex-1" onClick={handleCheckout}>
                    Checkout
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nama Pelanggan (Opsional)</Label>
              <Input
                id="customerName"
                placeholder="Masukkan nama pelanggan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Diskon (Rp)</Label>
              <Input
                id="discount"
                type="number"
                placeholder="0"
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Input
                id="notes"
                placeholder="Tambahkan catatan"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleFinishCheckout}>Lanjutkan ke Pembayaran</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Pembayaran</span>
              <span>Rp {cart.total_amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="space-y-2">
              <Label>Metode Pembayaran</Label>
              <div className="flex space-x-2">
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setPaymentMethod('cash')}
                >
                  Tunai
                </Button>
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Kartu
                </Button>
              </div>
            </div>
            
            {paymentMethod === 'cash' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amountReceived">Jumlah Diterima</Label>
                  <Input
                    id="amountReceived"
                    type="number"
                    placeholder="0"
                    value={amountReceived || ''}
                    onChange={(e) => setAmountReceived(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="flex justify-between text-md">
                  <span>Kembalian</span>
                  <span>Rp {calculateChange().toLocaleString('id-ID')}</span>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleProcessPayment} disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Proses...
                </span>
              ) : (
                'Proses Pembayaran'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Struk Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center mb-4">
              <h3 className="font-bold text-lg">Kasir Pintar</h3>
              <p className="text-sm text-neutral-500">Jl. Pahlawan No. 123, Jakarta</p>
              <p className="text-sm text-neutral-500">Telp: 021-1234567</p>
            </div>
            
            <div className="border-t border-b border-dashed border-neutral-200 py-2">
              <div className="flex justify-between text-sm">
                <span>No. Transaksi</span>
                <span>{transaction?.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tanggal</span>
                <span>{new Date(transaction?.created_at || '').toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Kasir</span>
                <span>Admin</span>
              </div>
              {transaction?.customer_name && (
                <div className="flex justify-between text-sm">
                  <span>Pelanggan</span>
                  <span>{transaction.customer_name}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {transaction?.transaction_items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <div>{item.product_name}</div>
                    <div className="text-xs text-neutral-500">
                      {item.quantity} x Rp {item.unit_price.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div>Rp {item.subtotal.toLocaleString('id-ID')}</div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-dashed border-neutral-200 pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>Rp {transaction?.subtotal.toLocaleString('id-ID')}</span>
              </div>
              {transaction?.discount_amount && transaction.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Diskon</span>
                  <span>Rp {transaction.discount_amount.toLocaleString('id-ID')}</span>
                </div>
              )}
              {transaction?.tax_amount && transaction.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Pajak</span>
                  <span>Rp {transaction.tax_amount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-1">
                <span>Total</span>
                <span>Rp {transaction?.total_amount.toLocaleString('id-ID')}</span>
              </div>
            </div>
            
            <div className="border-t border-dashed border-neutral-200 pt-2">
              <div className="flex justify-between text-sm">
                <span>Metode Pembayaran</span>
                <span>
                  {transaction?.payment_method === 'cash'
                    ? 'Tunai'
                    : transaction?.payment_method === 'card'
                    ? 'Kartu'
                    : 'Lainnya'}
                </span>
              </div>
              {transaction?.payment_method === 'cash' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Dibayar</span>
                    <span>Rp {amountReceived.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kembalian</span>
                    <span>Rp {calculateChange().toLocaleString('id-ID')}</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="text-center text-sm mt-4">
              <p>Terima kasih atas kunjungan Anda!</p>
              <p>Barang yang sudah dibeli tidak dapat dikembalikan.</p>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={handlePrintReceipt}>
              <Printer className="mr-2 h-4 w-4" /> Cetak Struk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default POS;
