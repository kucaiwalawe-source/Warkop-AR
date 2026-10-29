# Sistem Informasi Kasir dan Manajemen Stok pada Warkop

Proyek Capstone. Aplikasi web dengan tiga modul: **Kasir**, **Stok**, dan **Laporan**.

## Cara menjalankan di VS Code
1. Buka folder ini di VS Code (`File > Open Folder`).
2. Pasang ekstensi **Live Server** (Ritwick Dey).
3. Klik kanan `index.html` lalu pilih **Open with Live Server**.

(Atau cukup klik dua kali `index.html` untuk membukanya di browser.)

## Akun demo
| Peran | Username | Password | Akses |
|---|---|---|---|
| Pemilik | `pemilik` | `pemilik123` | Kasir, Produk, Stok (kelola), Laporan |
| Kasir | `kasir` | `kasir123` | Kasir, Stok (lihat saja) |

Catatan: password di versi ini hanya untuk demo (disimpan apa adanya di localStorage). Pada versi backend, gunakan hash (bcrypt).

## Struktur
- `index.html` : kerangka halaman (login, Kasir, Produk, Stok, Laporan)
- `css/style.css` : tampilan (mendukung mode terang/gelap)
- `js/app.js` : logika aplikasi

## Peta kode di `js/app.js`
- `seed()` : data awal (barang, menu + resep, transaksi demo)
- `load()` / `save()` : penyimpanan data di localStorage
- Autentikasi : `doLogin`, `logout`, `TABS` (hak akses per peran)
- Produk : `rProd`, `saveP`, `editP`, `togP`, `addK`, `setMin`
- Kasir : `rGrid`, `add`, `chg`, `pay`, `showStruk`
- Stok : `rStok`, `doIn`, `doOut`, `addB`
- Laporan : `rLap` (periode tanggal, rekap per produk), `qp`, `printLap`, `cost`
- `renderAll()` : menggambar ulang seluruh tampilan

## Pengembangan lanjutan
Data sekarang tersimpan di browser (localStorage). Langkah berikutnya: backend (Laravel / Node.js) dan database MySQL sesuai rancangan di laporan Bab III.
