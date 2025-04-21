
import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  onCustomerNameChange: (v: string) => void;
  discountAmount: number;
  onDiscountAmountChange: (n: number) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  onCancel: () => void;
  onNext: () => void;
}

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  onOpenChange,
  customerName,
  onCustomerNameChange,
  discountAmount,
  onDiscountAmountChange,
  notes,
  onNotesChange,
  onCancel,
  onNext,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Checkout</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Nama Pelanggan (Opsional)</Label>
          <Input
            id="customerName"
            placeholder="Masukkan nama pelanggan"
            value={customerName}
            onChange={e => onCustomerNameChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount">Diskon (Rp)</Label>
          <Input
            id="discount"
            type="number"
            placeholder="0"
            value={discountAmount || ''}
            onChange={e => onDiscountAmountChange(Number(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Catatan (Opsional)</Label>
          <Input
            id="notes"
            placeholder="Tambahkan catatan"
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button onClick={onNext}>Lanjutkan ke Pembayaran</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
