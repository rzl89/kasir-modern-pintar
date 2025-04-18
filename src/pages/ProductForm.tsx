
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { STORAGE_URL } from '@/lib/supabase';
import { Product, Category } from '@/lib/types';
import { Plus, X } from 'lucide-react';

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

type FormData = z.infer<typeof formSchema>;

const ProductForm = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
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
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  useEffect(() => {
    if (productId) {
      loadProductData(productId);
    }
  }, [productId]);

  useEffect(() => {
    // Set default values in the form
    Object.keys(formData).forEach(key => {
      setValue(key as keyof FormData, formData[key as keyof FormData]);
    });
  }, [formData, setValue]);

  const loadProductData = async (productId: string) => {
    setLoading(true);
    try {
      // First, get the product data
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) {
        throw productError;
      }

      // Get stock data separately
      const { data: stockData, error: stockError } = await supabase
        .from('stock')
        .select('quantity')
        .eq('product_id', productId)
        .maybeSingle();

      if (stockError) {
        console.error('Error loading stock:', stockError);
      }

      // Add default values for potentially missing properties
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price || 0,
        cost_price: productData.cost_price !== undefined ? productData.cost_price : 0,
        barcode: productData.barcode || '',
        sku: productData.sku !== undefined ? productData.sku : '',
        category_id: productData.category_id || '',
        image_url: productData.image_url || '',
        stock_quantity: stockData?.quantity || 0,
        is_active: productData.is_active !== undefined ? productData.is_active : true,
      });

      if (productData.image_url) {
        setPreviewUrl(productData.image_url);
      }
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

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      if (productId) {
        // Update existing product
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

        if (error) {
          throw error;
        }

        // Update stock separately if needed
        if (data.stock_quantity !== undefined) {
          // Check if stock record exists
          const { data: existingStock } = await supabase
            .from('stock')
            .select('id')
            .eq('product_id', productId)
            .maybeSingle();

          if (existingStock) {
            // Update existing stock
            const { error: stockError } = await supabase
              .from('stock')
              .update({
                quantity: data.stock_quantity,
                updated_at: new Date().toISOString()
              })
              .eq('product_id', productId);

            if (stockError) {
              throw stockError;
            }
          } else {
            // Create new stock record
            const { error: stockError } = await supabase
              .from('stock')
              .insert({
                product_id: productId,
                quantity: data.stock_quantity,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (stockError) {
              throw stockError;
            }
          }
        }

        toast({
          title: 'Sukses',
          description: 'Produk berhasil diperbarui',
        });
      } else {
        // Create new product
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

        if (error) {
          throw error;
        }

        // Create stock record if stock_quantity is provided
        if (data.stock_quantity !== undefined && newProduct && newProduct[0]) {
          const { error: stockError } = await supabase
            .from('stock')
            .insert({
              product_id: newProduct[0].id,
              quantity: data.stock_quantity,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (stockError) {
            throw stockError;
          }
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!image) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Pilih gambar terlebih dahulu',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, image);

      if (uploadError) {
        throw uploadError;
      }

      const imageUrl = `${STORAGE_URL}/images/${filePath}`;

      setFormData({ ...formData, image_url: imageUrl });
      setValue('image_url', imageUrl);
      toast({
        title: 'Sukses',
        description: 'Gambar berhasil diunggah',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengunggah gambar',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
    setFormData({ ...formData, image_url: '' });
    setValue('image_url', '');
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {productId ? 'Edit Produk' : 'Tambah Produk'}
        </h1>
        <Button asChild>
          <Link to="/products">
            <X className="mr-2 h-4 w-4" />
            Batal
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{productId ? 'Edit Detail Produk' : 'Detail Produk Baru'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="image">Gambar Produk</Label>
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  id="image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Label htmlFor="image" className="cursor-pointer bg-neutral-100 hover:bg-neutral-200 rounded-md px-4 py-2">
                  Pilih Gambar
                </Label>
                {previewUrl && (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-white/50 text-red-500 shadow-sm"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {!formData.image_url && !previewUrl && (
                  <div className="h-24 w-24 rounded-md bg-neutral-100 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-neutral-500" />
                  </div>
                )}
                {formData.image_url && !previewUrl && (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-white/50 text-red-500 shadow-sm"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Button type="button" onClick={handleImageUpload} disabled={uploading || !image}>
                  {uploading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Mengunggah...
                    </span>
                  ) : (
                    'Unggah Gambar'
                  )}
                </Button>
              </div>
              {errors.image_url && (
                <p className="text-sm text-red-500">{errors.image_url.message}</p>
              )}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Menyimpan...
                </span>
              ) : (
                'Simpan'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default ProductForm;
