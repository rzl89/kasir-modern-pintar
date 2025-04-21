
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Download, HelpCircle } from "lucide-react";

const Help = () => (
  <AppLayout>
    <div className="max-w-xl mx-auto my-10">
      <Card>
        <CardHeader>
          <CardTitle><HelpCircle className="inline-block mr-2" /> Bantuan & Panduan Penggunaan</CardTitle>
          <CardDescription>
            File PDF ini berisi petunjuk cara menggunakan aplikasi kasir secara detail dan mudah dipahami.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-medium">Panduan Lengkap Kasir (PDF)</p>
              <a 
                href="/kasir-panduan.pdf" 
                download
                target="_blank"
                rel="noopener"
                className="mt-1 inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition text-sm font-semibold"
              >
                <Download className="h-4 w-4 mr-2" /> Download PDF
              </a>
            </div>
          </div>
          <hr className="my-6" />
          <ol className="list-decimal ml-6 text-sm space-y-2">
            <li>Login ke aplikasi menggunakan akun yang terdaftar.</li>
            <li>Navigasikan menu dengan sidebar di sisi kiri.</li>
            <li>Untuk menambah transaksi, buka menu POS lalu pilih produk dan isi jumlah.</li>
            <li>Setelah transaksi selesai, struk dapat dicetak atau diunduh.</li>
            <li>Jika terjadi gangguan koneksi, sistem akan otomatis beralih ke mode offline.</li>
            <li>Saat online kembali, transaksi offline akan tersinkron otomatis.</li>
            <li>Gunakan menu <b>Pengaturan</b> untuk mengubah preferensi toko, pajak, dan struk.</li>
            <li>Menu <b>Laporan</b> berisi rekap penjualan yang dapat difilter per tanggal.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
);

export default Help;
