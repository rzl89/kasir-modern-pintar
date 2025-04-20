
# Panduan Penggunaan Kasir Pintar dengan Fitur Offline

## Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Cara Kerja Mode Offline](#cara-kerja-mode-offline)
3. [Memulai Aplikasi](#memulai-aplikasi)
4. [Indikator Status Koneksi](#indikator-status-koneksi)
5. [Transaksi Offline](#transaksi-offline)
6. [Sinkronisasi Data](#sinkronisasi-data)
7. [Tips dan Troubleshooting](#tips-dan-troubleshooting)

## Pendahuluan

Aplikasi Kasir Pintar dilengkapi dengan fitur offline yang memungkinkan Anda terus bertransaksi meskipun koneksi internet terputus. Dokumen ini menjelaskan cara menggunakan fitur tersebut.

## Cara Kerja Mode Offline

Ketika koneksi internet terputus, aplikasi akan:
1. Menyimpan transaksi baru ke penyimpanan lokal (IndexedDB)
2. Menampilkan indikator "Mode Offline" 
3. Tetap memungkinkan Anda melakukan transaksi penjualan
4. Menyinkronkan data otomatis ke server saat koneksi kembali

## Memulai Aplikasi

### Instalasi sebagai PWA (Progressive Web App)

1. Buka aplikasi di browser (Chrome, Edge, Safari, atau Firefox terbaru)
2. Untuk perangkat desktop:
   - Klik ikon "Install" pada address bar browser, atau
   - Buka menu browser lalu pilih "Install Kasir Pintar"
3. Untuk perangkat mobile:
   - Tap menu "Add to Home Screen" / "Tambahkan ke Layar Utama"
4. Setelah diinstal, aplikasi dapat dibuka seperti aplikasi biasa dari desktop atau layar utama perangkat

### Login Pertama Kali

Penting untuk melakukan login pertama kali saat terhubung internet untuk:
1. Mengunduh data produk, kategori, dan pengaturan
2. Menyimpan kredensial untuk penggunaan offline
3. Mengunduh aset penting untuk mode offline

## Indikator Status Koneksi

Aplikasi dilengkapi dengan indikator status koneksi yang muncul di pojok kanan bawah layar:

1. **Mode Online (Normal)**: Tidak ada indikator khusus
2. **Mode Offline**: Banner merah "Mode Offline: Transaksi akan disimpan lokal"
3. **Mode Online dengan Transaksi Pending**: Banner biru "X transaksi menunggu sinkronisasi" dengan tombol "Sinkronkan"

## Transaksi Offline

Melakukan transaksi saat offline:

1. Pilih produk seperti biasa dengan mengetuk kartu produk
2. Produk akan ditambahkan ke keranjang belanja
3. Selesaikan checkout seperti biasa
4. Saat menekan "Proses Pembayaran", transaksi akan disimpan di penyimpanan lokal
5. Struk tetap dapat dicetak, dengan catatan "Transaksi Offline" pada bagian atas

**Catatan Penting**: 
- Data stok produk diperbarui secara lokal sementara, dan akan diperbarui di server saat sinkronisasi
- Hindari menggunakan metode pembayaran non-tunai saat offline kecuali Anda memiliki alat pembayaran yang juga bekerja secara offline

## Sinkronisasi Data

### Sinkronisasi Otomatis

Saat koneksi internet kembali:
1. Aplikasi akan mendeteksi ketersediaan koneksi
2. Banner akan berubah menampilkan jumlah transaksi yang perlu disinkronkan
3. Sinkronisasi akan dicoba secara otomatis di latar belakang

### Sinkronisasi Manual

Jika sinkronisasi otomatis tidak berjalan:
1. Klik tombol "Sinkronkan" pada banner notifikasi
2. Aplikasi akan mencoba mengirim semua transaksi offline ke server
3. Notifikasi akan muncul menunjukkan keberhasilan atau kegagalan sinkronisasi

## Tips dan Troubleshooting

### Persiapan Sebelum Offline
- Pastikan login terlebih dahulu saat ada koneksi internet
- Buka halaman Produk dan POS untuk mengunduh data ke cache
- Periksa bahwa data penting (produk, kategori) sudah termuat

### Masalah Umum dan Solusinya

1. **Aplikasi tidak bisa dibuka saat offline**
   - Pastikan Anda telah membuka aplikasi minimal satu kali saat online
   - Pastikan browser mendukung fitur PWA (Progressive Web App)

2. **Transaksi gagal disimpan saat offline**
   - Pastikan penyimpanan browser tidak penuh
   - Coba buka aplikasi dalam jendela browser baru

3. **Sinkronisasi gagal saat kembali online**
   - Periksa kembali koneksi internet Anda
   - Coba klik tombol "Sinkronkan" secara manual
   - Refresh aplikasi dan coba kembali

4. **Error "Storage Quota Exceeded"**
   - Hapus cache browser dan data situs lain
   - Pada perangkat dengan penyimpanan terbatas, batasi jumlah transaksi offline

5. **Produk tidak muncul saat offline**
   - Pastikan Anda telah membuka halaman Produk saat online sebelumnya
   - Coba refresh aplikasi saat online, lalu gunakan dalam mode offline

## Kontak Dukungan

Jika Anda mengalami masalah lain dengan fitur offline, hubungi tim dukungan kami di:
- Email: support@kasirpintar.com
- WhatsApp: 0812-3456-7890
- Jam operasional: Senin-Jumat, 08.00-17.00 WIB
