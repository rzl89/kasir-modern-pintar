
import React from 'react';
import { CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface CartPanelProps {
  cart: any;
  onUpdateItem: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
  loading?: boolean;
}

export const CartPanel: React.FC<CartPanelProps> = ({
  cart,
  onUpdateItem,
  onRemoveItem,
  onClear,
  onCheckout,
  loading
}) => {
  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>Keranjang Belanja</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-4">
        {cart.items.length > 0 ? (
          <ScrollArea className="h-[calc(100%-120px)]">
            <div className="space-y-3">
              {cart.items.map((item: CartItem) => (
                <div key={item.product_id} className="flex items-center border-b border-neutral-200 pb-3">
                  <div className="flex-1">
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-sm text-neutral-500">
                      Rp {item.unit_price.toLocaleString('id-ID')} x {item.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      Rp {(item.unit_price * item.quantity).toLocaleString('id-ID')}
                    </div>
                    <div className="flex items-center justify-end mt-1 space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateItem(item.product_id, item.quantity - 1)}
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateItem(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= (item.product.stock_quantity || 0)}
                      >
                        <Plus size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700 ml-1"
                        onClick={() => onRemoveItem(item.product_id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500">
            <ShoppingBag className="h-12 w-12 mb-2" />
            <p>Keranjang kosong</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col">
        <div className="w-full space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rp {cart.subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Diskon</span>
            <span>Rp {cart.discount_amount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Pajak</span>
            <span>Rp {cart.tax_amount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-neutral-200 pt-3">
            <span>Total</span>
            <span>Rp {cart.total_amount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex space-x-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClear}>Bersihkan</Button>
            <Button className="flex-1" onClick={onCheckout} disabled={loading}>
              Checkout
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
