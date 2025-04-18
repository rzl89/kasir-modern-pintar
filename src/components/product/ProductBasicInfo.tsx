
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProductFormData } from '@/hooks/useProductForm';
import { PriceFields } from './PriceFields';

interface ProductBasicInfoProps {
  form: UseFormReturn<ProductFormData>;
}

export const ProductBasicInfo = ({ form }: ProductBasicInfoProps) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-4">
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

      <PriceFields form={form} />

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
