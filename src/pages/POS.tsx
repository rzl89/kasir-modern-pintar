import { useState, useEffect, useRef } from 'react';
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
import { Search, Plus, Minus, Trash2, ShoppingBag, CreditCard, Printer, Tag, Barcode } from 'lucide-react';
import { ProductGrid } from './components/ProductGrid';
import { CartPanel } from './components/CartPanel';
import { CheckoutDialog } from './components/CheckoutDialog';
import { PaymentDialog } from './components/PaymentDialog';
import { ReceiptDialog } from './components/ReceiptDialog';

const DUMMY_PRODUCTS = [
  {
    id: "dummy-1",
    name: "Kopi Dummy 250ml",
    price: 13000,
    description: "Minuman kopi dummy",
    stock_quantity: 20,
    image_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
    barcode: "DUMMYKOPI1",
    sku: "SKU-DUMMY-1",
    created_at: "",
    updated_at: "",
    category_id: undefined,
    is_active: true,
  },
  {
    id: "dummy-2",
    name: "Kucing Dummy",
    price: 10000,
    description: "Mainan kucing dummy",
    stock_quantity: 10,
    image_url: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
    barcode: "DUMMYCAT1",
    sku: "SKU-DUMMY-2",
    created_at: "",
    updated_at: "",
    category_id: undefined,
    is_active: true,
  },
  {
    id: "dummy-3",
    name: "Pemandangan Dummy",
    price: 15000,
    description: "Gambar pemandangan dummy",
    stock_quantity: 5,
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    barcode: "DUMMYSCENE1",
    sku: "SKU-DUMMY-3",
    created_at: "",
    updated_at: "",
    category_id: undefined,
    is_active: true,
  },
];

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
  const [barcodeScanStatus, setBarcodeScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

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
          throw categoriesError;
        } else {
          setCategories(categoriesData as Category[]);
        }

        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name),
            stock(quantity)
          `)
          .eq('is_active', true)
          .order('name');

        if (productsError) {
          console.error('Error fetching products:', productsError);
          throw productsError;
        } else {
          const productsWithStock = productsData.map(product => ({
            ...product,
            stock_quantity: product.stock && product.stock[0] ? product.stock[0].quantity : 0
          })) as Product[];
          
          if (productsWithStock.length === 0) {
            setProducts(DUMMY_PRODUCTS as any);
          } else {
            setProducts(productsWithStock);
          }
          console.log('Products loaded:', productsWithStock.length);
          console.log('Sample product with barcode:', 
            productsWithStock.find(p => p.barcode)
          );
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
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.barcode?.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower)
      );
    }

    if (activeCategory) {
      filtered = filtered.filter(product => product.category_id === activeCategory);
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, activeCategory]);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barcodeInput.trim()) {
      setBarcodeScanStatus('idle');
      return;
    }

    const barcode = barcodeInput.trim();
    console.log('Searching barcode:', barcode);
    console.log('Available barcodes:', products.map(p => p.barcode).filter(Boolean));
    
    const product = products.find(p => p.barcode === barcode);
    
    if (product) {
      console.log('Product found:', product);
      
      if (product.stock_quantity && product.stock_quantity <= 0) {
        setBarcodeScanStatus('error');
        toast({
          variant: 'destructive',
          title: 'Stok kosong',
          description: `${product.name} tidak tersedia dalam stok`,
        });
      } else {
        setBarcodeScanStatus('success');
        addToCart(product);
        toast({
          title: 'Produk ditemukan',
          description: `${product.name} ditambahkan ke keranjang`,
        });
      }
    } else {
      console.log('No product found with barcode:', barcode);
      setBarcodeScanStatus('error');
      toast({
        variant: 'destructive',
        title: 'Produk tidak ditemukan',
        description: 'Barcode tidak cocok dengan produk manapun',
      });
    }
    
    setBarcodeInput('');
    
    setTimeout(() => {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
      setBarcodeScanStatus('idle');
    }, 1500);
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

    try {
      const result = await processTransaction(paymentMethod);
      if (result) {
        setTransaction(result);
        setIsPaymentModalOpen(false);
        setIsReceiptModalOpen(true);
        
        setCustomerName('');
        setNotes('');
        setDiscountAmount(0);
        setAmountReceived(0);
        
        toast({
          title: 'Transaksi berhasil',
          description: 'Stok produk telah diperbarui',
        });
      }
    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        variant: 'destructive',
        title: 'Transaksi gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses transaksi',
      });
    }
  };

  const handlePrintReceipt = () => {
    window.print();
    setIsReceiptModalOpen(false);
  };

  const calculateChange = () => {
    return Math.max(0, amountReceived - cart.total_amount);
  };

  const getBarcodeBorderColor = () => {
    switch(barcodeScanStatus) {
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      default:
        return '';
    }
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
                  ref={barcodeInputRef}
                  placeholder="Scan barcode..."
                  className={`pl-10 transition-colors ${getBarcodeBorderColor()}`}
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onBlur={() => setBarcodeScanStatus('idle')}
                  autoComplete="off"
                />
              </div>
              <Button type="submit">Tambah</Button>
            </form>
          </div>

          <ProductGrid
            loading={loading1}
            products={products}
            categories={categories}
            activeCategory={activeCategory}
            filteredProducts={filteredProducts}
            onAddToCart={(product) => {
              if (product.stock_quantity && product.stock_quantity > 0) {
                addToCart(product);
                toast({ title: 'Produk ditambahkan', description: `${product.name} ditambahkan ke keranjang` });
              } else {
                toast({ variant: 'destructive', title: 'Stok kosong', description: `${product.name} tidak tersedia dalam stok` });
              }
            }}
            onActiveCategoryChange={setActiveCategory}
          />
        </div>

        <div className="lg:w-1/3 flex flex-col">
          <CartPanel
            cart={cart}
            onUpdateItem={updateCartItem}
            onRemoveItem={removeFromCart}
            onClear={() => {
              if (cart.items.length > 0) {
                clearCart();
                toast({ title: 'Keranjang dibersihkan', description: 'Semua produk telah dihapus dari keranjang' });
              }
            }}
            onCheckout={handleCheckout}
            loading={loading}
          />
        </div>
      </div>

      <CheckoutDialog
        open={isCheckoutModalOpen}
        onOpenChange={setIsCheckoutModalOpen}
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        discountAmount={discountAmount}
        onDiscountAmountChange={setDiscountAmount}
        notes={notes}
        onNotesChange={setNotes}
        onCancel={() => setIsCheckoutModalOpen(false)}
        onNext={handleFinishCheckout}
      />

      <PaymentDialog
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        totalAmount={cart.total_amount}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        amountReceived={amountReceived}
        onAmountReceivedChange={setAmountReceived}
        loading={loading}
        onCancel={() => setIsPaymentModalOpen(false)}
        onPay={handleProcessPayment}
        calculateChange={calculateChange}
      />

      <ReceiptDialog
        open={isReceiptModalOpen}
        onOpenChange={setIsReceiptModalOpen}
        transaction={transaction}
        amountReceived={amountReceived}
        calculateChange={calculateChange}
        onPrint={handlePrintReceipt}
      />
    </AppLayout>
  );
};

export default POS;
