
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ProductFormData } from '@/hooks/useProductForm';

interface ProductStockProps {
  form: UseFormReturn<ProductFormData>;
}

export const ProductStock = ({ form }: ProductStockProps) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-2">
      <Label htmlFor="stock_quantity">Stok</Label>
      <Input
        id="stock_quantity"
        type="number"
        placeholder="Jumlah Stok"
        {...register('stock_quantity', { valueAsNumber: true })}
      />
      {errors.stock_quantity && (
        <p className="text-sm text-red-500">{errors.stock_quantity.message}</p>
      )}
    </div>
  );
};
