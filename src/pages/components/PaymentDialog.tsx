
import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'other';
  onPaymentMethodChange: (method: 'cash' | 'card' | 'other') => void;
  amountReceived: number;
  onAmountReceivedChange: (n: number) => void;
  loading: boolean;
  onCancel: () => void;
  onPay: () => void;
  calculateChange: () => number;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onOpenChange,
  totalAmount,
  paymentMethod,
  onPaymentMethodChange,
  amountReceived,
  onAmountReceivedChange,
  loading,
  onCancel,
  onPay,
  calculateChange,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Pembayaran</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total Pembayaran</span>
          <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
        </div>
        <div className="space-y-2">
          <Label>Metode Pembayaran</Label>
          <div className="flex space-x-2">
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => onPaymentMethodChange('cash')}
            >
              Tunai
            </Button>
            <Button
              variant={paymentMethod === 'card' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => onPaymentMethodChange('card')}
            >
              <CreditCard className="mr-2 h-4 w-4" /> Kartu
            </Button>
          </div>
        </div>

        {paymentMethod === 'cash' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="amountReceived">Jumlah Diterima</Label>
              <Input
                id="amountReceived"
                type="number"
                placeholder="0"
                value={amountReceived || ''}
                onChange={e => onAmountReceivedChange(Number(e.target.value) || 0)}
              />
            </div>
            <div className="flex justify-between text-md">
              <span>Kembalian</span>
              <span>Rp {calculateChange().toLocaleString('id-ID')}</span>
            </div>
          </>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button onClick={onPay} disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
              Proses...
            </span>
          ) : (
            'Proses Pembayaran'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
