import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Category, Product } from '@/lib/types';
import { ArrowLeft, Upload } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  cost_price: z.coerce.number().min(0, 'Harga modal tidak boleh negatif').optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category_id: z.string().optional(),
  stock_quantity: z.coerce.number().int().min(0, 'Stok tidak boleh negatif').default(0),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const ProductForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      cost_price: 0,
      stock_quantity: 0,
      is_active: true,
    },
  });

  const watchCategory = watch('category_id');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

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

    if (isEditing) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            const product = data as Product;
            reset({
              name: product.name,
              description: product.description || '',
              price: product.price,
              cost_price: product.cost_price || 0,
              sku: product.sku || '',
              barcode: product.barcode || '',
              category_id: product.category_id || '',
              stock_quantity: product.stock_quantity,
              is_active: product.is_active,
            });

            if (product.image_url) {
              setImagePreview(product.image_url);
            }
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Gagal memuat data produk',
          });
          navigate('/products');
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, isEditing, navigate, reset, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      let imageUrl = imagePreview;

      // Upload image if a new one is selected
      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        imageUrl = `${supabase.storageUrl}/object/public/product-images/${fileName}`;
      }

      if (isEditing) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: data.name,
            description: data.description,
            price: data.price,
            cost_price: data.cost_price,
            sku: data.sku,
            barcode: data.barcode,
            category_id: data.category_id,
            stock_quantity: data.stock_quantity,
            is_active: data.is_active,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          throw error;
        }

        toast({
          title: 'Sukses',
          description: 'Produk berhasil diperbarui',
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({
            name: data.name,
            description: data.description,
            price: data.price,
            cost_price: data.cost_price,
            sku: data.sku,
            barcode: data.barcode,
            category_id: data.category_id,
            stock_quantity: data.stock_quantity,
            is_active: data.is_active,
            image_url: imageUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          throw error;
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
        description: 'Gagal menyimpan produk',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/products')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
        <h1 className="text-2xl font-bold">{isEditing ? 'Edit Produk' : 'Tambah Produk'}</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Produk</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Produk <span className="text-red-500">*</span></Label>
                    <Input id="name" {...register('name')} />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea id="description" {...register('description')} />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Harga Jual <span className="text-red-500">*</span></Label>
                      <Input id="price" type="number" {...register('price')} />
                      {errors.price && (
                        <p className="text-sm text-red-500">{errors.price.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cost_price">Harga Modal</Label>
                      <Input id="cost_price" type="number" {...register('cost_price')} />
                      {errors.cost_price && (
                        <p className="text-sm text-red-500">{errors.cost_price.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detail Inventori</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input id="sku" {...register('sku')} />
                      {errors.sku && (
                        <p className="text-sm text-red-500">{errors.sku.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input id="barcode" {...register('barcode')} />
                      {errors.barcode && (
                        <p className="text-sm text-red-500">{errors.barcode.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Select
                        value={watchCategory}
                        onValueChange={(value) => setValue('category_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock_quantity">Stok Awal</Label>
                      <Input id="stock_quantity" type="number" {...register('stock_quantity')} />
                      {errors.stock_quantity && (
                        <p className="text-sm text-red-500">{errors.stock_quantity.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gambar Produk</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="w-full aspect-square bg-neutral-100 flex items-center justify-center mb-4 overflow-hidden rounded-md">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-neutral-400 flex flex-col items-center">
                          <Upload size={48} />
                          <p className="mt-2">Tidak ada gambar</p>
                        </div>
                      )}
                    </div>
                    <Label
                      htmlFor="image"
                      className="bg-primary-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-primary-600 transition-colors"
                    >
                      Pilih Gambar
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/products')}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Menyimpan...
                    </span>
                  ) : (
                    'Simpan Produk'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    </AppLayout>
  );
};

export default ProductForm;
