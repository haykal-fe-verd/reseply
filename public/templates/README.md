# Template Excel

Letakkan file template di folder ini untuk diunduh dari halaman manajemen.

## template-kategori.xlsx (Import Kategori)

- **Kolom 1:** `name` atau `Nama` — nama kategori (wajib)
- **Kolom 2:** `type` atau `Tipe` — nilai: **DISH**, **CUISINE**, atau **DIET**

Baris pertama = header. Slug digenerate otomatis dari nama.

---

## template-resep.xlsx (Import Resep)

- **title** / Judul — judul resep (wajib)
- **description** / Deskripsi — deskripsi resep (opsional)
- **imageUrl** / URL Gambar — URL gambar (opsional, harus valid URL)
- **prepMinutes** / Waktu Persiapan — menit (angka)
- **cookMinutes** / Waktu Masak — menit (angka)
- **servings** / Porsi — jumlah porsi (angka)
- **categorySlugs** / Kategori — slug kategori dipisah koma (contoh: `indonesia,jawa`)
- **ingredients** / Bahan — satu bahan per baris, format: `nama;jumlah;satuan` (jumlah dan satuan boleh kosong)
- **instructions** / Langkah — satu langkah per baris (nomor urut otomatis)

Contoh isi sel **ingredients** (beberapa baris dalam satu cell):

```
Tepung terigu;200;gram
Gula pasir;100;gram
Garam;1;sendok teh
```

Contoh isi sel **instructions**:

```
Campur tepung dan gula
Tambahkan air sedikit-sedikit
Uleni sampai kalis
```
