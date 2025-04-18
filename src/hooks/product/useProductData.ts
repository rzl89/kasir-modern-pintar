
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from './useProductFormState';

export const useProductData = (form: UseFormReturn<ProductFormData>) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadProductData = async (productId: string) => {
    setLoading(true);
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*, stock(*)')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      form.reset({
        name: productData.name,
        description: productData.description || '',
        price: productData.price,
        cost_price: productData.cost_price || 0,
        barcode: productData.barcode || '',
        sku: productData.sku || '',
        category_id: productData.category_id || '',
        image_url: productData.image_url || '',
        stock_quantity: productData.stock?.[0]?.quantity || 0,
        is_active: productData.is_active !== undefined ? productData.is_active : true,
      });

    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memuat data produk',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    loadProductData,
  };
};
