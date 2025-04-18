
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProductFormData } from '@/hooks/useProductForm';

interface ProductBasicInfoProps {
  form: UseFormReturn<ProductFormData>;
}

export const ProductBasicInfo = ({ form }: ProductBasicInfoProps) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Produk</Label>
          <Input
            id="name"
            placeholder="Nama Produk"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Harga</Label>
          <Input
            id="price"
            type="number"
            placeholder="Harga"
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cost_price">Harga Modal</Label>
          <Input
            id="cost_price"
            type="number"
            placeholder="Harga Modal"
            {...register('cost_price', { valueAsNumber: true })}
          />
          {errors.cost_price && (
            <p className="text-sm text-red-500">{errors.cost_price.message}</p>
          )}
        </div>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          placeholder="Deskripsi"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>
    </div>
  );
};
