
import React from 'react';
import { Product, Category } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Barcode, ShoppingBag, Tag } from 'lucide-react';

interface ProductGridProps {
  loading: boolean;
  products: Product[];
  categories: Category[];
  activeCategory: string | null;
  filteredProducts: Product[];
  onAddToCart: (product: Product) => void;
  onActiveCategoryChange: (categoryId: string | null) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  loading,
  categories,
  filteredProducts,
  onAddToCart,
  activeCategory,
  onActiveCategoryChange,
}) => {
  return (
    <div className="flex-1 flex flex-col">
      {/* Tabs & Category Trigger */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1">
          <button className={`px-3 py-1 rounded ${activeCategory === null ? 'bg-primary text-white' : 'bg-neutral-200'}`}
            onClick={() => onActiveCategoryChange(null)}>
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`px-3 py-1 rounded ${activeCategory === cat.id ? 'bg-primary text-white' : 'bg-neutral-200'}`}
              onClick={() => onActiveCategoryChange(cat.id)}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 mt-2 bg-neutral-50 rounded-md p-4 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <ScrollArea className="h-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className={`cursor-pointer hover:border-primary-500 transition-colors ${product.stock_quantity && product.stock_quantity <= 0 ? 'opacity-50' : ''}`}
                  onClick={() => onAddToCart(product)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="aspect-square flex items-center justify-center mb-2 bg-neutral-100 rounded-md">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover rounded-md" />
                      ) : (
                        <ShoppingBag className="h-12 w-12 text-neutral-400" />
                      )}
                    </div>
                    <div className="text-sm font-medium truncate">{product.name}</div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-xs text-neutral-500">Stok: {product.stock_quantity || 0}</div>
                      <div className="text-sm font-semibold">Rp {product.price.toLocaleString('id-ID')}</div>
                    </div>
                    {product.barcode && (
                      <div className="text-xs text-neutral-400 mt-1">
                        <Barcode className="inline-block h-3 w-3 mr-1" />
                        {product.barcode}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Tag className="h-12 w-12 text-neutral-400 mb-2" />
            <p className="text-neutral-500">Tidak ada produk ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
