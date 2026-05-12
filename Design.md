# Design System

> Dokumen ini adalah sumber kebenaran tunggal untuk visual dan interaksi produk. Kalau tidak ada di sini, tanya dulu sebelum improvisasi.

---

## Filosofi

Tiga prinsip yang tidak bisa dikompromikan:

**Jelas sebelum cantik.** Hierarki informasi adalah prioritas pertama. Dekorasi boleh ada setelah pesan tersampaikan dengan benar.

**Konsisten, bukan identik.** Komponen yang sama harus berperilaku sama di mana pun. Tapi "konsisten" bukan berarti semua halaman terasa copy-paste.

**Friction itu mahal.** Setiap klik ekstra, setiap label yang membingungkan, setiap loading tanpa feedback — semuanya ada biayanya. Kurangi.

---

## Warna

### Filosofi Warna

Warna bukan dekorasi. Warna menyampaikan status, hierarki, dan brand. Kalau kamu menambah warna baru tanpa alasan semantik yang jelas, itu salah.

### Palet Utama

Diambil langsung dari logo — gradien biru elektrik ke hijau neon di atas dasar gelap.

```
/* Brand gradient — dari kiri ke kanan, biru ke hijau */
--color-brand-from:      #0A6EFF   /* Biru elektrik */
--color-brand-to:        #00E5A0   /* Hijau neon */
--color-brand-mid:       #00C8D4   /* Tengah gradien, untuk aksen tunggal */

/* Dark base — diambil dari background logo */
--color-brand-dark:      #0D0D12   /* Hampir hitam, sedikit biru */
--color-brand-dark-2:    #13131C   /* Surface di atas base */

/* Gradient shorthand */
--gradient-brand: linear-gradient(135deg, #0A6EFF 0%, #00C8D4 50%, #00E5A0 100%);
--gradient-brand-subtle: linear-gradient(135deg, rgba(10,110,255,0.15) 0%, rgba(0,229,160,0.15) 100%);
```

### Surface & Background

Dua mode: dark-first (sesuai karakter logo) dan light (untuk konteks yang butuh keterbacaan tinggi seperti dashboard data, form panjang).

**Dark mode (default):**
```
--color-bg-base:         #0D0D12   /* Base page */
--color-bg-elevated:     #13131C   /* Card, modal */
--color-bg-sunken:       #0A0A10   /* Input field, kode, area pasif */
--color-bg-overlay:      rgba(0, 0, 0, 0.7)  /* Backdrop modal */
```

**Light mode:**
```
--color-bg-base:         #F4F7FF   /* Off-white dengan sedikit biru */
--color-bg-elevated:     #FFFFFF   /* Card, modal, dropdown */
--color-bg-sunken:       #EBF0FF   /* Input field, kode, area pasif */
--color-bg-overlay:      rgba(13, 13, 18, 0.6)  /* Backdrop modal */
```

### Teks

**Dark mode:**
```
--color-text-primary:    #E8F0FF   /* Body text — bukan putih murni */
--color-text-secondary:  #7A90B8   /* Label, caption, placeholder */
--color-text-disabled:   #3D4F6B   /* State nonaktif */
--color-text-inverse:    #0D0D12   /* Teks di atas surface terang */
```

**Light mode:**
```
--color-text-primary:    #0D0D12   /* Body text */
--color-text-secondary:  #4A5A7A   /* Label, caption, placeholder */
--color-text-disabled:   #9AAAC8   /* State nonaktif */
--color-text-inverse:    #E8F0FF   /* Teks di atas surface gelap */
```

### Status

Disesuaikan supaya tidak konflik dengan brand color (biru/hijau sudah dipakai brand, jadi status pakai varian yang tetap terbedakan).

```
--color-success:         #00B87A   /* Hijau — lebih gelap dari brand-to supaya terbedakan */
--color-success-bg:      rgba(0, 184, 122, 0.12)

--color-warning:         #F5A623
--color-warning-bg:      rgba(245, 166, 35, 0.12)

--color-danger:          #FF4D6A
--color-danger-bg:       rgba(255, 77, 106, 0.12)

--color-info:            #0A6EFF   /* Sama dengan brand-from */
--color-info-bg:         rgba(10, 110, 255, 0.12)
```

> **Catatan:** `color-success` sengaja dibedakan dari `color-brand-to` (#00E5A0) meski sama-sama hijau. Brand adalah identitas, success adalah status. Keduanya tidak boleh tertukar.

### Border

```
--color-border-subtle:   rgba(0, 200, 212, 0.08)   /* Pemisah halus */
--color-border-default:  rgba(0, 200, 212, 0.18)   /* Default */
--color-border-strong:   rgba(0, 200, 212, 0.40)   /* Emphasis */
--color-border-brand:    rgba(0, 200, 212, 0.65)   /* Focused, selected state */
```

### Aturan Penggunaan Warna

- Gradien brand (`--gradient-brand`) hanya untuk elemen yang benar-benar ingin menonjol: tombol primary, ilustrasi, highlight section. Bukan untuk setiap elemen interaktif.
- Jangan pakai gradien untuk teks kecil (di bawah 18px) — gradien teks susah dibaca dan sering gagal contrast check.
- `--color-brand-mid` (#00C8D4) adalah warna aksen tunggal yang aman dipakai tanpa gradien.
- Contrast ratio minimum: 4.5:1 untuk teks biasa, 3:1 untuk teks besar dan UI komponen (WCAG AA). Cek selalu teks terang di atas surface gelap — mata manusia sering menipu.
- Jangan pakai lebih dari 3 warna berbeda dalam satu komponen.
- `color-success` ≠ `color-brand-to` walaupun mirip. Bedakan secara konsisten.

---

## Tipografi

### Font Stack

```css
--font-display: 'Syne', sans-serif;       /* Heading besar, angka besar */
--font-body:    'Literata', Georgia, serif; /* Body text panjang */
--font-ui:      'DM Sans', system-ui, sans-serif; /* Label, tombol, navigasi */
--font-mono:    'JetBrains Mono', 'Fira Code', monospace; /* Kode */
```

> **Kenapa serif untuk body?** Karena teks panjang lebih nyaman dibaca dengan serif. Sans-serif untuk UI element yang dibaca sekilas, bukan dipindai paragraf demi paragraf.

### Skala

| Token | Size | Line Height | Weight | Penggunaan |
|-------|------|-------------|--------|------------|
| `text-display` | 56px | 1.1 | 700 | Hero, angka besar |
| `text-h1` | 40px | 1.2 | 600 | Judul halaman |
| `text-h2` | 28px | 1.3 | 600 | Section heading |
| `text-h3` | 20px | 1.4 | 500 | Sub-section |
| `text-h4` | 16px | 1.4 | 500 | Card title, label grup |
| `text-body-lg` | 18px | 1.7 | 400 | Body teks artikel |
| `text-body` | 16px | 1.7 | 400 | Body teks default |
| `text-body-sm` | 14px | 1.6 | 400 | Caption, helper text |
| `text-label` | 13px | 1.4 | 500 | Label form, badge |
| `text-micro` | 11px | 1.4 | 400 | Timestamp, fine print |

### Aturan Tipografi

- Jangan pakai lebih dari 2 font weight berbeda dalam satu komponen.
- `text-micro` hanya untuk informasi non-kritis. Kalau info penting, naikkan ke `text-label`.
- Jangan ada teks di bawah 11px, titik.
- Letter-spacing negatif hanya untuk `text-display` dan `text-h1` (-0.02em sampai -0.03em).
- Jangan pakai `text-transform: uppercase` untuk teks lebih dari 4 kata.

---

## Spacing

Sistem spacing berbasis 4px. Semua nilai adalah kelipatan 4.

```
space-1:   4px
space-2:   8px
space-3:   12px
space-4:   16px    /* Base unit */
space-5:   20px
space-6:   24px
space-8:   32px
space-10:  40px
space-12:  48px
space-16:  64px
space-20:  80px
space-24:  96px
```

### Panduan Spacing

**Padding internal komponen:**
- Komponen kecil (badge, chip): `space-1` vertikal, `space-2` horizontal
- Komponen medium (tombol, input): `space-2` vertikal, `space-4` horizontal
- Card: `space-5` semua sisi, atau `space-4` vertikal `space-5` horizontal
- Modal/panel besar: `space-8` semua sisi

**Jarak antar elemen:**
- Elemen dalam grup yang sama: `space-2` sampai `space-3`
- Antar komponen berbeda: `space-4` sampai `space-6`
- Antar section: `space-10` sampai `space-16`

---

## Border Radius

```
radius-sm:   4px    /* Input, badge kecil */
radius-md:   8px    /* Card, tombol */
radius-lg:   12px   /* Modal, panel, dropdown */
radius-xl:   20px   /* Komponen "soft" atau pill yang lebar */
radius-full: 9999px /* Avatar, badge status, toggle */
```

> Konsisten dalam satu komponen. Jangan pakai `radius-lg` di header card tapi `radius-sm` di body-nya.

---

## Elevasi & Shadow

Elevasi menyampaikan hierarki, bukan dekorasi. Makin tinggi elevasinya, makin "di atas" komponen itu secara visual dan konseptual.

```css
/* Level 0 — Flat, di level page */
shadow-none: none

/* Level 1 — Slightly raised, card statis */
shadow-sm: 0 1px 2px rgba(0,0,0,0.3),
           0 1px 3px rgba(0,200,212,0.06)

/* Level 2 — Hover state, card interaktif */
shadow-md: 0 4px 6px rgba(0,0,0,0.4),
           0 2px 4px rgba(0,200,212,0.08)

/* Level 3 — Dropdown, popover */
shadow-lg: 0 10px 15px rgba(0,0,0,0.5),
           0 4px 6px rgba(0,200,212,0.1)

/* Level 4 — Modal, dialog, drawer */
shadow-xl: 0 20px 25px rgba(0,0,0,0.6),
           0 8px 10px rgba(0,200,212,0.08)
```

**Aturan:**
- Setiap level elevasi hanya naik satu tingkat dari konteksnya. Tombol di dalam card tidak boleh punya elevasi lebih tinggi dari card-nya.
- Jangan pakai shadow untuk hover effect jika komponen sudah punya border aktif.
- Backdrop overlay modal selalu `color-bg-overlay`, bukan shadow.

---

## Komponen

### Tombol

**Hierarki tombol dalam satu konteks maksimal 3 level:**

| Variant | Kapan dipakai |
|---------|---------------|
| `primary` | Satu per halaman/form. Aksi utama yang paling penting. |
| `secondary` | Aksi alternatif. Bisa lebih dari satu tapi tidak berdesakan. |
| `ghost` | Aksi tersier. Navigasi, cancel, aksi destructive ringan. |
| `danger` | Aksi destruktif: hapus, batalkan, revoke. |
| `link` | Navigasi inline dalam teks, bukan trigger aksi. |

**Ukuran:**

| Size | Height | Padding H | Font |
|------|--------|-----------|------|
| `sm` | 32px | 12px | 13px |
| `md` | 40px | 16px | 15px |
| `lg` | 48px | 24px | 16px |

**Aturan tombol:**
- Label tombol adalah kata kerja. "Simpan", bukan "Data Tersimpan". "Hapus Akun", bukan "OK".
- Tombol `primary` harus selalu satu per konteks. Kalau ada dua aksi penting, salah satunya diturunkan ke `secondary`.
- Loading state: ganti label dengan spinner + teks "Menyimpan…", disable tombol, pertahankan ukuran.
- Jangan disable tombol sebagai cara untuk sembunyikan error. Tampilkan error, biarkan user mencoba lagi.

---

### Form & Input

**Anatomi input field:**
```
[Label]
[Helper text — opsional]
[ Input Field                    ]
[Error message — muncul saat error]
```

- Label selalu di atas field, bukan di dalam (placeholder bukan pengganti label).
- Placeholder hanya untuk contoh format, misalnya: `cth. 081234567890`
- Error message muncul di bawah field yang error, dengan warna `color-danger`, ikon peringatan, dan teks yang menjelaskan apa yang salah — bukan cuma "Field tidak valid."
- Jangan pakai asterisk merah untuk required field. Tandai yang optional saja dengan "(opsional)".

**State input:**

| State | Border | Background |
|-------|--------|------------|
| Default | `color-border-default` | `color-bg-sunken` |
| Hover | `color-border-strong` | `color-bg-sunken` |
| Focus | `color-brand-accent`, ring 2px | `color-bg-elevated` |
| Error | `color-danger` | `color-danger-bg` |
| Disabled | `color-border-subtle` | `color-bg-sunken`, opacity 0.5 |

---

### Card

Card adalah kontainer untuk satu unit informasi atau aksi. Bukan untuk mengelompokkan hal-hal yang tidak berhubungan.

**Variasi:**
- **Static card**: Informasi saja, tidak bisa diklik. Tidak ada hover effect.
- **Interactive card**: Bisa diklik semua areanya. Ada hover state (`shadow-md`, background sedikit berubah). Cursor pointer.
- **Selectable card**: Seperti radio button tapi berupa card. Ada state selected yang jelas (border `color-brand-accent`).

**Yang tidak boleh ada di dalam card:**
- Tombol `primary` lebih dari satu
- Card bersarang lebih dari dua level
- Konten yang tidak relevan satu sama lain dalam card yang sama

---

### Tabel

- Header kolom: `text-label`, uppercase sparing (maksimal 3 kata), warna `color-text-secondary`.
- Row height minimal 48px untuk row yang interaktif, 40px untuk display-only.
- Zebra striping: gunakan `color-bg-sunken` untuk row genap — hanya kalau tabel memiliki lebih dari 8 kolom atau data sangat padat.
- Kolom angka selalu rata kanan.
- Kolom teks selalu rata kiri.
- Jangan center semua kolom karena "terlihat rapi" — itu mengorbankan scannability.
- Tabel yang bisa di-sort: ikon chevron selalu tampil (bukan hanya saat hover), aktif menampilkan arah sort.

---

### Modal & Dialog

**Tiga tipe:**

| Tipe | Kapan | Ukuran |
|------|-------|--------|
| Alert dialog | Konfirmasi aksi kritis, tidak ada form | max-width 440px |
| Modal | Form, preview, detail view | max-width 640px |
| Sheet/Drawer | Konten panjang, navigasi sekunder | Full height, 400–560px lebar |

**Aturan:**
- Selalu ada cara untuk menutup: tombol X, klik backdrop (kecuali untuk aksi yang tidak bisa diabaikan), atau Escape.
- Jangan stack modal di atas modal. Kalau perlu flow lebih panjang, pakai wizard/step dalam satu modal.
- Focus trap wajib — keyboard user tidak boleh bisa tab ke luar modal yang aktif.
- Scroll terjadi di dalam modal, bukan di halaman belakangnya.

---

## Ikon

Gunakan satu keluarga ikon secara konsisten. Campur-campur keluarga ikon berbeda itu merusak koherensi visual bahkan jika individualnya bagus.

**Ukuran standar:**
- Inline dalam teks: 16px
- Tombol, label: 18px
- Standalone, navigasi: 20px
- Ilustrasi, kosong state: 48px+

**Aturan:**
- Ikon tanpa label teks wajib punya `aria-label` atau `title`.
- Ikon dekoratif wajib punya `aria-hidden="true"`.
- Jangan gunakan ikon yang ambigu tanpa label. Disket untuk "simpan" sudah tidak relevan. Gunakan label.
- Stroke-width konsisten. Jangan campur outline dan filled dalam satu UI.

---

## Animasi & Transisi

Animasi ada untuk membantu user memahami perubahan state, bukan untuk pertunjukan.

### Durasi

```
duration-instant:  0ms      /* Perubahan yang tidak perlu animasi */
duration-fast:     100ms    /* Tooltip, hover background */
duration-normal:   200ms    /* Fade, slide pendek */
duration-slow:     300ms    /* Modal masuk, transisi halaman */
duration-deliberate: 500ms  /* Onboarding, empty state, celebration */
```

### Easing

```css
ease-standard: cubic-bezier(0.4, 0, 0.2, 1)  /* Kebanyakan transisi */
ease-enter:    cubic-bezier(0, 0, 0.2, 1)     /* Elemen masuk ke layar */
ease-exit:     cubic-bezier(0.4, 0, 1, 1)     /* Elemen keluar dari layar */
ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1) /* Elemen yang "memantul" */
```

### Aturan Animasi

- Selalu hormati `prefers-reduced-motion`. Kalau user mematikan animasi, hentikan semua motion kecuali yang kritis untuk pemahaman.
- Elemen yang masuk: gunakan `ease-enter`. Elemen yang keluar: gunakan `ease-exit`. Ini bukan opsional.
- Jangan animasikan lebih dari 3 properti sekaligus pada satu elemen.
- Loading skeleton lebih baik dari spinner untuk konten yang bisa di-predict strukturnya.
- Jangan pakai animasi untuk menyembunyikan loading yang lama. Animasi tidak membuat server lebih cepat.

---

## Layout & Grid

### Breakpoint

```
sm:   640px   /* Mobile landscape, small tablet */
md:   768px   /* Tablet portrait */
lg:   1024px  /* Tablet landscape, small desktop */
xl:   1280px  /* Desktop */
2xl:  1536px  /* Wide desktop */
```

### Container

```css
.container {
  width: 100%;
  margin-inline: auto;
  padding-inline: 16px;    /* Mobile */
}

@media (min-width: 640px)  { padding-inline: 24px; }
@media (min-width: 1024px) { padding-inline: 40px; }
@media (min-width: 1280px) { max-width: 1200px; }
```

### Kolom

Gunakan 12-column grid untuk layout kompleks. Untuk UI sederhana, gunakan flexbox atau CSS grid dengan jumlah kolom yang eksplisit.

**Proporsi umum:**
- Sidebar + konten utama: 3:9 atau 4:8
- Dua panel sejajar: 6:6
- Full width dengan max-width: 1 kolom

---

## Aksesibilitas

Ini bukan fitur tambahan. Ini standar minimum.

### Keyboard Navigation

- Semua aksi yang bisa dilakukan dengan mouse harus bisa dilakukan dengan keyboard.
- Tab order harus mengikuti urutan visual yang logis.
- Focus indicator tidak boleh dihilangkan. Kalau tampilan default browser jelek, desain yang lebih baik — bukan dihapus.
- Custom focus style: `outline: 2px solid var(--color-brand-mid); outline-offset: 2px;`

### ARIA

- Gunakan elemen HTML semantik dulu. `<button>`, `<nav>`, `<main>`, `<dialog>`, `<table>` sudah bawa semantik bawaan.
- ARIA hanya untuk kasus yang tidak bisa ditangani HTML semantik.
- Jangan tambah `role="button"` ke `<div>`. Pakai `<button>`.
- Jangan tambah `aria-label` yang duplikasi teks yang sudah terlihat.

### Teks Alternatif

- Gambar informatif: deskripsi yang menyampaikan konten dan konteks.
- Gambar dekoratif: `alt=""` (bukan dikosongkan tanpa atribut).
- Chart dan grafik: sertakan data dalam teks atau tabel tersembunyi.

### Kontras

| Konten | Rasio minimum |
|--------|---------------|
| Teks normal (di bawah 18px) | 4.5:1 |
| Teks besar (18px+ atau 14px+ bold) | 3:1 |
| Komponen UI & batas grafis | 3:1 |

---

## Konten & Copy

Desain yang baik butuh kata-kata yang baik.

### Prinsip

**Langsung ke intinya.** Jangan mulai dengan "Selamat datang di fitur...". Langsung jelaskan apa yang bisa dilakukan.

**Satu kalimat, satu ide.** Kalau kalimat perlu koma banyak, pecah jadi dua kalimat.

**Aktif, bukan pasif.** "Simpan perubahan" bukan "Perubahan akan disimpan".

**Spesifik.** "Hapus proyek ini secara permanen" lebih baik dari "Konfirmasi aksi".

### Error Messages

Error yang buruk: *"Terjadi kesalahan."*

Error yang baik:
1. Apa yang salah (spesifik)
2. Kenapa terjadi (kalau relevan)
3. Apa yang harus dilakukan

Contoh: *"Foto tidak bisa diunggah. Ukuran file melebihi batas 5MB. Coba kompres foto terlebih dahulu atau pilih file lain."*

### Empty States

Empty state bukan hanya "Belum ada data." Empty state adalah kesempatan.

Struktur empty state yang baik:
1. Ilustrasi atau ikon yang relevan
2. Judul singkat yang menjelaskan situasi
3. Kalimat yang menjelaskan apa artinya atau apa yang bisa dilakukan
4. Call to action (kalau ada aksi yang relevan)

---

## Token Referensi Cepat

```css
/* Tombol primary — pakai gradient brand */
background:    var(--gradient-brand);
color:         #0D0D12;
padding:       var(--space-2) var(--space-4);
border-radius: var(--radius-md);
font:          var(--font-ui);
font-size:     var(--text-body);
font-weight:   600;

/* Tombol secondary — outlined dengan warna aksen */
background:    transparent;
border:        1px solid var(--color-border-brand);
color:         var(--color-brand-mid);
padding:       var(--space-2) var(--space-4);
border-radius: var(--radius-md);

/* Card standar */
background:    var(--color-bg-elevated);
border:        1px solid var(--color-border-default);
border-radius: var(--radius-lg);
padding:       var(--space-5);
box-shadow:    var(--shadow-sm);

/* Input field */
background:    var(--color-bg-sunken);
border:        1px solid var(--color-border-default);
border-radius: var(--radius-sm);
padding:       var(--space-2) var(--space-3);
font:          var(--font-ui);
font-size:     var(--text-body);
color:         var(--color-text-primary);

/* Input focus */
border-color:  var(--color-brand-mid);
outline:       2px solid rgba(0, 200, 212, 0.25);
outline-offset: 0;

/* Badge / chip brand */
background:    var(--gradient-brand-subtle);
border:        1px solid var(--color-border-brand);
color:         var(--color-brand-mid);
border-radius: var(--radius-full);
padding:       2px 10px;
font-size:     13px;
font-weight:   500;
```

---

*Terakhir diperbarui: lihat git log. Pertanyaan tentang dokumen ini → #design-system di Slack atau buat issue di repo desain.*