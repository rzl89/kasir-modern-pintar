
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama produk harus lebih dari 2 karakter.',
  }),
  description: z.string().optional(),
  price: z.number({
    invalid_type_error: 'Harga harus berupa angka.',
  }).min(1, {
    message: 'Harga harus lebih dari 0.',
  }),
  cost_price: z.number({
    invalid_type_error: 'Harga modal harus berupa angka.',
  }).optional(),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  category_id: z.string().optional(),
  image_url: z.string().optional(),
  stock_quantity: z.number().optional(),
  is_active: z.boolean().optional(),
});

export type ProductFormData = z.infer<typeof formSchema>;

export const useProductForm = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { productId } = useParams();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      cost_price: 0,
      barcode: '',
      sku: '',
      category_id: '',
      image_url: '',
      stock_quantity: 0,
      is_active: true,
    },
  });

  const loadProductData = async (id: string) => {
    setLoading(true);
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*, stock(*)')
        .eq('id', id)
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

  const onSubmit = async (data: ProductFormData) => {
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
    form,
    loading,
    productId,
    loadProductData,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
