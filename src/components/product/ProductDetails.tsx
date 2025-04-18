
import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { ProductFormData } from '@/hooks/useProductForm';
import { useToast } from '@/hooks/use-toast';

interface ProductDetailsProps {
  form: UseFormReturn<ProductFormData>;
}

export const ProductDetails = ({ form }: ProductDetailsProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();
  const { register, setValue, formState: { errors } } = form;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;
        setCategories(data as Category[]);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal memuat data kategori',
        });
      }
    };

    fetchCategories();
  }, [toast]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            id="barcode"
            placeholder="Barcode"
            {...register('barcode')}
          />
          {errors.barcode && (
            <p className="text-sm text-red-500">{errors.barcode.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            placeholder="SKU"
            {...register('sku')}
          />
          {errors.sku && (
            <p className="text-sm text-red-500">{errors.sku.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category_id">Kategori</Label>
        <Select onValueChange={(value) => setValue('category_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category_id && (
          <p className="text-sm text-red-500">{errors.category_id.message}</p>
        )}
      </div>
    </div>
  );
};
