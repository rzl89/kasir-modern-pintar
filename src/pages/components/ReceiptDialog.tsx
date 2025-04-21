
import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Transaction } from '@/lib/types';

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  amountReceived: number;
  calculateChange: () => number;
  onPrint: () => void;
}

export const ReceiptDialog: React.FC<ReceiptDialogProps> = ({
  open,
  onOpenChange,
  transaction,
  amountReceived,
  calculateChange,
  onPrint,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Struk Pembayaran</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg">Kasir Pintar</h3>
          <p className="text-sm text-neutral-500">Jl. Pahlawan No. 123, Jakarta</p>
          <p className="text-sm text-neutral-500">Telp: 021-1234567</p>
        </div>

        <div className="border-t border-b border-dashed border-neutral-200 py-2">
          <div className="flex justify-between text-sm">
            <span>No. Transaksi</span>
            <span>{transaction?.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tanggal</span>
            <span>{transaction?.created_at ? new Date(transaction.created_at).toLocaleString('id-ID') : ''}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Kasir</span>
            <span>Admin</span>
          </div>
          {transaction?.customer_name && (
            <div className="flex justify-between text-sm">
              <span>Pelanggan</span>
              <span>{transaction.customer_name}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {transaction?.transaction_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <div>{item.product_name}</div>
                <div className="text-xs text-neutral-500">
                  {item.quantity} x Rp {item.unit_price.toLocaleString('id-ID')}
                </div>
              </div>
              <div>Rp {item.subtotal.toLocaleString('id-ID')}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-neutral-200 pt-2 space-y-1">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>Rp {transaction?.subtotal.toLocaleString('id-ID')}</span>
          </div>
          {transaction?.discount_amount && transaction.discount_amount > 0 && (
            <div className="flex justify-between text-sm">
              <span>Diskon</span>
              <span>Rp {transaction.discount_amount.toLocaleString('id-ID')}</span>
            </div>
          )}
          {transaction?.tax_amount && transaction.tax_amount > 0 && (
            <div className="flex justify-between text-sm">
              <span>Pajak</span>
              <span>Rp {transaction.tax_amount.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-1">
            <span>Total</span>
            <span>Rp {transaction?.total_amount.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-neutral-200 pt-2">
          <div className="flex justify-between text-sm">
            <span>Metode Pembayaran</span>
            <span>
              {transaction?.payment_method === 'cash'
                ? 'Tunai'
                : transaction?.payment_method === 'card'
                ? 'Kartu'
                : 'Lainnya'}
            </span>
          </div>
          {transaction?.payment_method === 'cash' && (
            <>
              <div className="flex justify-between text-sm">
                <span>Dibayar</span>
                <span>Rp {amountReceived.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Kembalian</span>
                <span>Rp {calculateChange().toLocaleString('id-ID')}</span>
              </div>
            </>
          )}
        </div>

        <div className="text-center text-sm mt-4">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p>Barang yang sudah dibeli tidak dapat dikembalikan.</p>
        </div>
      </div>
      <DialogFooter>
        <Button className="w-full" onClick={onPrint}>
          <Printer className="mr-2 h-4 w-4" /> Cetak Struk
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
