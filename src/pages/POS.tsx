import { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { Product, Category, Transaction } from '@/lib/types';
import { Search, Barcode } from 'lucide-react';
import { ProductGrid } from './components/ProductGrid';
import { CartPanel } from './components/CartPanel';
import { CheckoutDialog } from './components/CheckoutDialog';
import { PaymentDialog } from './components/PaymentDialog';
import { ReceiptDialog } from './components/ReceiptDialog';

const DUMMY_PRODUCTS: Product[] = [
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
    category_id: null,
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
    category_id: null,
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
    category_id: null,
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
    loading,
  } = useCart();

  // --- states utama ---
  const [products, setProducts] = useState<Product[]>(DUMMY_PRODUCTS);
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

  // autofocus barcode input
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // fetch dari supabase (opsional) — jika gagal, kita tetap punya DUMMY_PRODUCTS
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) fetch kategori (optional)
        const { data: catData, error: catErr } = await supabase
          .from('categories')
          .select('id,name')
          .order('name');
        if (!catErr && catData && catData.length) {
          setCategories(catData as Category[]);
        }
        
        // 2) fetch produk paling simpel
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select(`
            id, name, price, description, stock_quantity,
            image_url, barcode, sku, category_id, is_active
          `)
          .eq('is_active', true)
          .order('name');
  
        // hanya override kalau ada produk
        if (!prodErr && prodData && prodData.length > 0) {
          setProducts(prodData as Product[]);
        }
        // else: biarkan DUMMY_PRODUCTS tetap dipakai
      } catch (err) {
        console.warn('Fetch error, tetap pakai dummy:', err);
      } finally {
        setLoading1(false);
      }
    };
    fetchData();
  }, [toast]);  

  // filter produk per search/category
  useEffect(() => {
    let list = products;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    }
    if (activeCategory) {
      list = list.filter(p => p.category_id === activeCategory);
    }
    setFilteredProducts(list);
  }, [products, searchQuery, activeCategory]);

  // handle scan barcode
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;
    const prod = products.find(p => p.barcode === code);
    if (prod) {
      if (prod.stock_quantity > 0) {
        setBarcodeScanStatus('success');
        addToCart(prod);
        toast({ title: 'Produk ditemukan', description: `${prod.name} ditambahkan.` });
      } else {
        setBarcodeScanStatus('error');
        toast({ variant: 'destructive', title: 'Stok kosong', description: prod.name });
      }
    } else {
      setBarcodeScanStatus('error');
      toast({ variant: 'destructive', title: 'Tidak ada produk dengan barcode ini' });
    }
    setBarcodeInput('');
    setTimeout(() => {
      setBarcodeScanStatus('idle');
      barcodeInputRef.current?.focus();
    }, 1200);
  };

  // sisa handler & rendering komponen di bawah...
  // (tidak berubah; sama seperti versi sebelumnya)

  return (
    <AppLayout>
      {/* ... masukkan JSX produk, cart panel, dialogs, dsb. */}
      {/* ProductGrid dan CartPanel otomatis pakai `products` dan `filteredProducts` */}
    </AppLayout>
  );
};

export default POS;
