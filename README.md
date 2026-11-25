# Sistem Informasi Point of Sale (POS) dan Manajemen Stok Barang pada Warkop AR

Proyek Capstone. Aplikasi web dengan modul: **Kasir**, **Produk**, **Stok**, dan **Laporan**.

## Cara menjalankan di VS Code
1. Buka folder ini di VS Code (`File > Open Folder`).
2. Pasang ekstensi **Live Server** (Ritwick Dey).
3. Klik kanan `index.html` lalu pilih **Open with Live Server**.

(Atau cukup klik dua kali `index.html` untuk membukanya di browser.)

## Akun demo
| Peran | Username | Password | Akses |
|---|---|---|---|
| Pemilik | `pemilik` | `pemilik123` | Laporan (termasuk Rekap Produk), Produk, Stok (kelola). **Tidak ada fitur Kasir.** |
| Kasir | `kasir` | `kasir123` | Kasir (transaksi dan struk), Stok (lihat saja) |

### Lupa password
Klik **Lupa password?** di halaman login, masukkan username, jawab pertanyaan keamanan, lalu buat password baru (minimal 6 karakter). Maksimal 3 kali salah menjawab.

| Username | Pertanyaan keamanan | Jawaban |
|---|---|---|
| `pemilik` | Siapa nama warkop ini? | `warkop ar` |
| `kasir` | Apa minuman andalan warkop ini? | `kopi susu` |

Catatan: password di versi ini hanya untuk demo (disimpan apa adanya di localStorage). Pada versi backend, gunakan hash (bcrypt).

## Struktur
- `index.html` : kerangka halaman (login, Kasir, Produk, Stok, Laporan)
- `css/style.css` : tampilan (mendukung mode terang/gelap)
- `js/app.js` : logika aplikasi

## Peta kode di `js/app.js`
- `seed()` : data awal (barang, menu + resep, transaksi demo)
- `load()` / `save()` : penyimpanan data di localStorage
- Autentikasi : `doLogin`, `logout`, `TABS` (hak akses per peran), `showForgot`, `fNext`, `fSave` (lupa password)
- Produk : `rProd`, `saveP`, `editP`, `togP`, `addK`, `setMin`
- Kasir : `rGrid`, `add`, `chg`, `pay`, `showStruk`
- Stok : `rStok`, `doIn`, `doOut`, `addB`
- Laporan : `rLap` (periode tanggal), `drawChart` (grafik), `drawDonut` (rekap pembayaran), `rRekap` (halaman Rekap Produk), `qp`, `printLap`, `printRekap`, `cost`
- `renderAll()` : menggambar ulang seluruh tampilan

## Pengembangan lanjutan
Data sekarang tersimpan di browser (localStorage). Langkah berikutnya: backend (Laravel / Node.js) dan database MySQL sesuai rancangan di laporan Bab III.
