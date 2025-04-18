
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { ProductFormData } from './useProductFormState';

export const useProductSubmit = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const submitProduct = async (data: ProductFormData, productId?: string) => {
    setLoading(true);
    try {
      if (productId) {
        const { error } = await supabase
          .from('products')
          .update({
            name: data.name,
            description: data.description,
            price: data.price,
            cost_price: data.cost_price,
            barcode: data.barcode,
            sku: data.sku,
            category_id: data.category_id,
            image_url: data.image_url,
            is_active: data.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', productId);

        if (error) throw error;

        if (data.stock_quantity !== undefined) {
          const { data: existingStock } = await supabase
            .from('stock')
            .select('id')
            .eq('product_id', productId)
            .maybeSingle();

          if (existingStock) {
            const { error: stockError } = await supabase
              .from('stock')
              .update({
                quantity: data.stock_quantity,
                updated_at: new Date().toISOString()
              })
              .eq('product_id', productId);

            if (stockError) throw stockError;
          } else {
            const { error: stockError } = await supabase
              .from('stock')
              .insert({
                product_id: productId,
                quantity: data.stock_quantity,
              });

            if (stockError) throw stockError;
          }
        }

        toast({
          title: 'Sukses',
          description: 'Produk berhasil diperbarui',
        });
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert({
            name: data.name,
            description: data.description,
            price: data.price,
            cost_price: data.cost_price,
            barcode: data.barcode,
            sku: data.sku,
            category_id: data.category_id,
            image_url: data.image_url,
            is_active: data.is_active,
          })
          .select();

        if (error) throw error;

        if (data.stock_quantity !== undefined && newProduct && newProduct[0]) {
          const { error: stockError } = await supabase
            .from('stock')
            .insert({
              product_id: newProduct[0].id,
              quantity: data.stock_quantity,
            });

          if (stockError) throw stockError;
        }

        toast({
          title: 'Sukses',
          description: 'Produk berhasil ditambahkan',
        });
      }

      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menyimpan data produk',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    submitProduct,
  };
};
