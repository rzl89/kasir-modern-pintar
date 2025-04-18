
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

export const useProductFormState = () => {
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

  return form;
};
