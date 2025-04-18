
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProductForm } from '@/hooks/useProductForm';
import { ProductBasicInfo } from '@/components/product/ProductBasicInfo';
import { ProductDetails } from '@/components/product/ProductDetails';
import { ProductImageUpload } from '@/components/product/ProductImageUpload';
import { ProductStock } from '@/components/product/ProductStock';

const ProductForm = () => {
  const { form, loading, productId, loadProductData, onSubmit } = useProductForm();

  useEffect(() => {
    if (productId) {
      loadProductData(productId);
    }
  }, [productId]);

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
          <form onSubmit={onSubmit} className="space-y-6">
            <ProductBasicInfo form={form} />
            <ProductDetails form={form} />
            <ProductStock form={form} />
            <ProductImageUpload
              imageUrl={form.watch('image_url') || ''}
              onImageChange={(url) => form.setValue('image_url', url)}
            />

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
