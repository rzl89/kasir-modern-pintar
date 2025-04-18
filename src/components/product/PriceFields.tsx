
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductFormData } from '@/hooks/useProductForm';

interface PriceFieldsProps {
  form: UseFormReturn<ProductFormData>;
}

export const PriceFields = ({ form }: PriceFieldsProps) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
};
