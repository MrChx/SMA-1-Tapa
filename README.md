# SMA Negeri 1 Tapa

README ini disusun setelah meninjau file proyek di folder ini. Fokusnya adalah menjelaskan apa saja yang perlu disiapkan di laptop lain, apa yang perlu diunduh, dan bagaimana cara menjalankan aplikasi ini dengan aman.

Catatan versi dan link di bawah dicek pada 27 April 2026.

## Ringkasan Hasil Audit

Aplikasi ini adalah website sekolah berbasis:

- Next.js 16.2.4
- React 19.2.4
- Prisma 7.7.0
- PostgreSQL
- Supabase Storage
- face-api.js untuk absensi wajah

Artinya, aplikasi ini **bukan** aplikasi HTML statis. Supaya jalan normal di laptop teman Anda, minimal harus ada:

1. Node.js + npm
2. Koneksi ke database PostgreSQL
3. Koneksi ke Supabase Storage
4. Browser modern yang mengizinkan kamera dan lokasi

## Apa Saja yang Perlu Diunduh

### Wajib

| Komponen | Fungsi | Status |
| --- | --- | --- |
| Node.js 22 LTS | Menjalankan Next.js, Prisma, React, dan npm | Wajib |
| npm | Menginstal semua package dari `package.json` | Sudah ikut Node.js |
| Browser modern | Untuk membuka website, kamera, dan GPS absensi | Wajib |

### Wajib Jika Teman Anda TIDAK memakai backend yang sama dengan laptop ini

| Komponen | Fungsi | Status |
| --- | --- | --- |
| PostgreSQL | Menyimpan data admin, siswa, galeri, kontak, FAQ, absensi, dan konfigurasi situs | Wajib jika database tidak memakai server yang sudah ada |
| Supabase project | Menyediakan Storage untuk upload gambar/file | Wajib jika file upload ingin tetap berfungsi |

### Opsional Tapi Sangat Disarankan

| Komponen | Fungsi | Status |
| --- | --- | --- |
| Git | Memudahkan update source code | Opsional |
| pgAdmin | GUI untuk melihat database PostgreSQL | Biasanya ikut installer PostgreSQL |

## Link Download Resmi

### 1. Node.js

Rekomendasi: gunakan **Node.js 22 LTS** karena Next.js 16 membutuhkan minimal Node.js 20.9, sedangkan Prisma 7 mendukung Node `^20.19.0`, `^22.12.0`, atau `^24.0.0` dan merekomendasikan jalur 22.x untuk kestabilan.

- Node.js 22.22.2 LTS x64 MSI: [https://nodejs.org/dist/v22.22.2/node-v22.22.2-x64.msi](https://nodejs.org/dist/v22.22.2/node-v22.22.2-x64.msi)
- Halaman download resmi Node.js: [https://nodejs.org/en/download](https://nodejs.org/en/download)

Jika laptop teman Anda Windows ARM, gunakan installer ARM64 dari halaman resmi Node.js.

### 2. PostgreSQL

Jika ingin database lokal di laptop teman Anda:

- Halaman download PostgreSQL resmi: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
- Installer Windows resmi PostgreSQL: [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)

Jika memakai database cloud yang sama seperti laptop ini, PostgreSQL lokal **tidak perlu diinstal**.

### 3. Supabase

Supabase tidak diunduh seperti software desktop. Yang dibutuhkan adalah membuat atau memakai project Supabase yang sudah ada.

- Dashboard / buat project baru: [https://database.new](https://database.new)
- Dokumentasi getting started Supabase: [https://supabase.com/docs/guides/getting-started](https://supabase.com/docs/guides/getting-started)
- Dokumentasi API keys Supabase: [https://supabase.com/docs/guides/api/api-keys](https://supabase.com/docs/guides/api/api-keys)
- Dokumentasi membuat bucket storage: [https://supabase.com/docs/guides/storage/buckets/creating-buckets](https://supabase.com/docs/guides/storage/buckets/creating-buckets)

### 4. Browser

Rekomendasi:

- Google Chrome: [https://www.google.com/chrome/](https://www.google.com/chrome/)
- Microsoft Edge: [https://www.microsoft.com/edge](https://www.microsoft.com/edge)

Browser penting karena fitur absensi memakai:

- kamera/webcam
- lokasi/GPS browser
- model AI wajah yang dimuat di browser

### 5. Git

- Git for Windows: [https://git-scm.com/install/windows](https://git-scm.com/install/windows)

Git tidak wajib jika proyek dipindahkan pakai ZIP atau flashdisk, tetapi sangat disarankan.

## Komponen Internal yang Akan Terpasang Otomatis Lewat npm

Anda tidak perlu download satu-satu package di bawah ini. Semua akan ikut saat menjalankan `npm install`.

### Dependencies utama

- `next` `16.2.4`
- `react` `19.2.4`
- `react-dom` `19.2.4`
- `prisma` `7.7.0`
- `@prisma/client` `7.7.0`
- `@prisma/adapter-pg` `7.7.0`
- `pg` `8.20.0`
- `@supabase/supabase-js` `2.103.3`
- `bcryptjs` `3.0.3`
- `dotenv` `17.4.2`
- `face-api.js` `0.22.2`

### Dev dependencies utama

- `typescript` `5.x`
- `tailwindcss` `4.x`
- `@tailwindcss/postcss` `4.x`
- `eslint` `9.x`
- `eslint-config-next` `16.2.4`

## File dan Folder yang Perlu Dipindahkan

Pindahkan source code proyek ini ke laptop teman Anda, tetapi **tidak perlu** ikut memindahkan folder hasil build/dependency.

### Perlu dipindahkan

- seluruh source project
- folder `src`
- folder `public`
- folder `prisma`
- file `package.json`
- file `package-lock.json`
- file konfigurasi lain
- file `.env` atau minimal isi variabelnya

### Tidak perlu dipindahkan

- `node_modules`
- `.next`
- `tsconfig.tsbuildinfo`

## Variabel Environment yang Wajib Ada

Isi variabel ini terlihat dari `.env.example` dan penggunaan kode di proyek:

```env
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Penjelasan:

- `DATABASE_URL` = koneksi PostgreSQL
- `NEXT_PUBLIC_SUPABASE_URL` = URL project Supabase
- `SUPABASE_SERVICE_ROLE_KEY` = key server-side untuk upload/delete file ke bucket Supabase

Jika teman Anda ingin memakai backend yang **sama** seperti laptop ini, cara tercepat adalah menyalin file `.env` yang sekarang secara aman. Jangan commit file `.env` ke Git publik.

## Cara Install Lengkap di Laptop Teman

### Skenario A - Paling Mudah: Pakai Database dan Supabase yang Sudah Ada

Gunakan skenario ini jika teman Anda hanya ingin menjalankan aplikasi yang sama tanpa membuat backend baru.

### Langkah 1 - Install Node.js

1. Download Node.js 22 LTS dari link resmi di atas.
2. Jalankan file installer.
3. Saat instalasi, biarkan opsi default aktif termasuk npm.
4. Setelah selesai, buka PowerShell lalu cek:

```powershell
node -v
npm -v
```

### Langkah 2 - Pindahkan project

Salin folder proyek ini ke laptop teman Anda.

Penting:

- jangan salin `node_modules`
- jangan salin `.next`
- boleh salin file `.env` jika ingin memakai koneksi backend yang sama

### Langkah 3 - Install semua package project

Buka terminal di folder project lalu jalankan:

```powershell
npm install
```

### Langkah 4 - Jalankan database schema ke backend

Proyek ini **tidak memiliki folder migration Prisma**, jadi setup schema dilakukan dengan `db push`.

```powershell
npm run db:push
```

### Langkah 5 - Buat atau perbarui akun admin

Saya menambahkan script helper agar pembuatan admin lebih mudah.

```powershell
npm run admin:create -- --email="admin@smatapa.local" --name="Administrator" --password="Admin12345"
```

Jika email sudah ada, password dan nama akan diperbarui.

### Langkah 6 - Jalankan aplikasi

Mode development:

```powershell
npm run dev
```

Lalu buka:

[http://localhost:3000](http://localhost:3000)

### Langkah 7 - Login admin

Buka:

[http://localhost:3000/login](http://localhost:3000/login)

Login memakai email dan password yang dibuat pada langkah sebelumnya.

### Langkah 8 - Konfigurasi awal setelah login

Setelah berhasil login, minimal lakukan ini:

1. Masuk ke menu admin absensi.
2. Isi lokasi sekolah:
   - latitude
   - longitude
   - radius absensi
3. Pastikan bucket upload di Supabase aktif.
4. Coba upload satu gambar dari panel admin.
5. Coba buka halaman absensi dan izinkan kamera + lokasi.

Tanpa konfigurasi lokasi absensi, fitur absen wajah akan gagal.

### Skenario B - Install Mandiri dari Nol di Laptop Teman

Gunakan skenario ini jika teman Anda ingin backend sendiri.

### Langkah 1 - Install Node.js

Sama seperti Skenario A.

### Langkah 2 - Install PostgreSQL

1. Download PostgreSQL dari halaman resmi.
2. Jalankan installer Windows.
3. Biarkan komponen default aktif:
   - PostgreSQL Server
   - pgAdmin
4. Buat password untuk user `postgres`.
5. Catat port, biasanya `5432`.
6. Setelah selesai, buat database baru, misalnya `sma_1_tapa`.

Contoh membuat database lewat `psql`:

```sql
CREATE DATABASE sma_1_tapa;
```

### Langkah 3 - Siapkan Supabase

1. Buat project baru di Supabase.
2. Ambil `Project URL`.
3. Ambil `service_role key`.
4. Buat bucket bernama `uploads`.
5. Jadikan bucket tersebut `public`.

Catatan:

- aplikasi ini memakai `getPublicUrl()` Supabase
- route upload mengirim file ke bucket `uploads`
- konfigurasi gambar di Next.js memang sudah mengizinkan domain `*.supabase.co`

### Langkah 4 - Buat file `.env`

Salin `.env.example` menjadi `.env`, lalu isi seperti ini:

```env
DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/sma_1_tapa"
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT_REF.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="SUPABASE_SERVICE_ROLE_KEY_ANDA"
```

Jika Anda memakai connection string cloud dari Supabase, isi `DATABASE_URL` dengan connection string PostgreSQL project tersebut.

### Langkah 5 - Install package project

```powershell
npm install
```

### Langkah 6 - Buat semua tabel database

```powershell
npm run db:push
```

### Langkah 7 - Buat akun admin pertama

```powershell
npm run admin:create -- --email="admin@smatapa.local" --name="Administrator" --password="Admin12345"
```

### Langkah 8 - Jalankan aplikasi

```powershell
npm run dev
```

Lalu buka:

[http://localhost:3000](http://localhost:3000)

## Menjalankan Mode Production di Laptop Teman

Jika aplikasi tidak untuk ngoding, tetapi hanya untuk dijalankan:

```powershell
npm run build
npm run start
```

Lalu akses:

[http://localhost:3000](http://localhost:3000)

## Catatan Penting Fitur Absensi

Fitur absensi di proyek ini memakai:

- `face-api.js`
- model wajah lokal di folder `public/models`
- kamera browser
- lokasi browser
- database untuk menyimpan embedding wajah dan riwayat hadir

Artinya:

- model AI wajah **sudah ada di repo**, tidak perlu download manual lagi
- webcam laptop harus berfungsi
- browser harus diberi izin kamera
- browser harus diberi izin lokasi

## Catatan Penting Upload Gambar

Fitur upload gambar admin memakai Supabase Storage. Kalau Supabase belum siap, maka upload pada halaman:

- profil
- beranda
- galeri
- direktori
- organisasi

akan gagal.

## Catatan Internet

Walaupun project ini bisa dijalankan di `localhost`, beberapa bagian tetap bergantung pada internet atau layanan eksternal:

- database cloud jika `DATABASE_URL` menuju server remote
- Supabase Storage
- Google Material Symbols font
- YouTube iframe API jika URL video lab mengarah ke YouTube

Jadi, kalau ingin benar-benar lokal/offline penuh, project ini perlu modifikasi tambahan.

## Perintah Penting

```powershell
npm install
npm run db:push
npm run admin:create -- --email="admin@smatapa.local" --name="Administrator" --password="Admin12345"
npm run dev
```

## Troubleshooting Singkat

### `node` tidak dikenali

Install ulang Node.js lalu buka terminal baru.

### `DATABASE_URL` error

Periksa isi file `.env` dan pastikan PostgreSQL aktif.

### Upload gagal

Periksa:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- bucket `uploads`

### Login admin gagal

Jalankan ulang:

```powershell
npm run admin:create -- --email="admin@smatapa.local" --name="Administrator" --password="Admin12345"
```

### Absensi gagal

Periksa:

- kamera browser
- izin lokasi browser
- lokasi absensi di panel admin
- data siswa sudah terdaftar

## Referensi Resmi

- Next.js installation: [https://nextjs.org/docs/pages/getting-started/installation](https://nextjs.org/docs/pages/getting-started/installation)
- Node.js download: [https://nodejs.org/en/download](https://nodejs.org/en/download)
- Prisma system requirements: [https://docs.prisma.io/docs/orm/reference/system-requirements](https://docs.prisma.io/docs/orm/reference/system-requirements)
- Prisma `db push`: [https://docs.prisma.io/docs/cli/db/push](https://docs.prisma.io/docs/cli/db/push)
- PostgreSQL download: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
- Supabase getting started: [https://supabase.com/docs/guides/getting-started](https://supabase.com/docs/guides/getting-started)
- Supabase API keys: [https://supabase.com/docs/guides/api/api-keys](https://supabase.com/docs/guides/api/api-keys)
- Supabase create bucket: [https://supabase.com/docs/guides/storage/buckets/creating-buckets](https://supabase.com/docs/guides/storage/buckets/creating-buckets)
