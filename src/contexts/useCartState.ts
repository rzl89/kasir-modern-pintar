import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Transaction } from '@/lib/types';
import { CartItem, ShoppingCart } from './cartTypes';

const DEFAULT_CART: ShoppingCart = {
  items: [],
  subtotal: 0,
  discount_amount: 0,
  tax_amount: 0,
  total_amount: 0,
  // pastikan default untuk field opsional
  customer_name: '',
  notes: '',
};

export function useCartState() {
  const [cart, setCart] = useState<ShoppingCart>(DEFAULT_CART);
  const [loading, setLoading] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // 1) Load tax rate sekali saat mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('tax_percentage')
          .eq('key', 'tax_percentage')
          .single();
        if (error) throw error;
        setTaxRate(typeof data?.tax_percentage === 'number' ? data.tax_percentage : 0);
      } catch {
        setTaxRate(0);
      }
    }
    fetchSettings();
  }, []);

  // 2) Recalculate totals otomatis kalau items atau taxRate berubah
  useEffect(() => {
    const subtotal = cart.items.reduce(
      (sum, it) => sum + it.unit_price * it.quantity,
      0
    );
    const taxAmount = (subtotal - cart.discount_amount) * (taxRate / 100);
    const totalAmount = subtotal - cart.discount_amount + taxAmount;

    setCart(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
    }));
  }, [cart.items, cart.discount_amount, taxRate]);

  // 3) Action–action keranjang
  function addToCart(product: Product, quantity = 1) {
    if (!product.stock_quantity || product.stock_quantity <= 0) {
      toast({ variant: 'destructive', title: 'Stok kosong', description: `${product.name} tidak tersedia.` });
      return;
    }

    setCart(prev => {
      const idx = prev.items.findIndex(i => i.product_id === product.id);
      let newItems = [...prev.items];

      if (idx >= 0) {
        const newQty = prev.items[idx].quantity + quantity;
        if (newQty > (product.stock_quantity || 0)) {
          toast({
            variant: 'destructive',
            title: 'Stok tidak cukup',
            description: `Hanya tersisa ${product.stock_quantity}`,
          });
          return prev;
        }
        newItems[idx] = { ...newItems[idx], quantity: newQty };
      } else {
        newItems.push({
          product_id: product.id,
          quantity,
          unit_price: product.price,
          product,
        });
      }

      toast({
        title: 'Produk ditambahkan',
        description: `${quantity}x ${product.name}`,
      });
      return { ...prev, items: newItems };
    });
  }

  function updateCartItem(productId: string, quantity: number) {
    setCart(prev => {
      const idx = prev.items.findIndex(i => i.product_id === productId);
      if (idx < 0) return prev;

      const updated = [...prev.items];
      if (quantity <= 0) {
        updated.splice(idx, 1);
      } else if (quantity > (updated[idx].product.stock_quantity || 0)) {
        toast({
          variant: 'destructive',
          title: 'Stok tidak cukup',
          description: `Hanya tersisa ${updated[idx].product.stock_quantity}`,
        });
        return prev;
      } else {
        updated[idx] = { ...updated[idx], quantity };
      }

      return { ...prev, items: updated };
    });
  }

  function removeFromCart(productId: string) {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(i => i.product_id !== productId),
    }));
  }

  function clearCart() {
    setCart(DEFAULT_CART);
  }

  function applyDiscount(amount: number) {
    if (amount < 0 || amount > cart.subtotal) {
      toast({
        variant: 'destructive',
        title: 'Diskon tidak valid',
        description: amount < 0
          ? 'Nilai diskon tidak boleh negatif.'
          : 'Diskon tidak boleh melebihi subtotal.',
      });
      return;
    }
    setCart(prev => ({ ...prev, discount_amount: amount }));
  }

  function addCustomerDetails(customerName = '', notes = '') {
    setCart(prev => ({ ...prev, customer_name: customerName, notes }));
  }

  async function processTransaction(
    paymentMethod: 'cash' | 'card' | 'other'
  ): Promise<Transaction | null> {
    if (!user) {
      toast({ variant: 'destructive', title: 'Login diperlukan', description: 'Silakan login dulu.' });
      return null;
    }
    if (cart.items.length === 0) {
      toast({ variant: 'destructive', title: 'Keranjang kosong', description: 'Tambahkan produk dulu.' });
      return null;
    }

    try {
      setLoading(true);

      // 1) Insert transaksi utama
      const { data: trxData, error: trxErr } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          customer_name: cart.customer_name,
          subtotal: cart.subtotal,
          discount_amount: cart.discount_amount,
          tax_amount: cart.tax_amount,
          total_amount: cart.total_amount,
          payment_method: paymentMethod,
          payment_status: 'completed',
          notes: cart.notes,
        })
        .select();
      if (trxErr || !trxData?.length) throw trxErr || new Error('Transaksi gagal dibuat');

      const trx = trxData[0] as Transaction;

      // 2) Insert item–item transaksi
      const itemsPayload = cart.items.map(i => ({
        transaction_id: trx.id,
        product_id: i.product_id,
        product_name: i.product.name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.unit_price * i.quantity,
      }));
      const { error: itemsErr } = await supabase
        .from('transaction_items')
        .insert(itemsPayload);
      if (itemsErr) throw itemsErr;

      // 3) Update stok & catat adjustment
      for (const i of cart.items) {
        const { data: stock, error: stockErr } = await supabase
          .from('stock')
          .select('id, quantity')
          .eq('product_id', i.product_id)
          .single();

        const currentQty = stockErr || !stock ? 0 : stock.quantity;
        const newQty = Math.max(0, currentQty - i.quantity);

        if (stockErr || !stock) {
          await supabase.from('stock').insert({
            product_id: i.product_id,
            quantity: newQty,
            low_stock_threshold: 10,
          });
        } else {
          await supabase
            .from('stock')
            .update({ quantity: newQty, updated_at: new Date().toISOString() })
            .eq('id', stock.id);
        }

        await supabase.from('stock_adjustments').insert({
          product_id: i.product_id,
          adjustment_type: 'sale',
          quantity: i.quantity,
          reason: 'Penjualan',
          notes: `Transaction ID: ${trx.id}`,
        });
      }

      // 4) Ambil kembali detail lengkap transaksi
      const { data: finalTrx } = await supabase
        .from('transactions')
        .select('*, transaction_items(*)')
        .eq('id', trx.id)
        .single();

      toast({ title: 'Transaksi berhasil', description: `ID: ${trx.id}` });
      clearCart();
      return finalTrx as Transaction;
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Transaksi gagal',
        description: err.message || 'Terjadi kesalahan',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyDiscount,
    addCustomerDetails,
    processTransaction,
  };
}
