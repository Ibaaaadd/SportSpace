# SYSTEM SPECIFICATION
# Sistem Booking Lapangan Olahraga
> Dokumen ini menjelaskan arsitektur, alur sistem, dan detail implementasi secara menyeluruh.
> Baca dokumen ini bersama `CODING_RULES.md` sebelum memulai development.

---

## 1. GAMBARAN SISTEM

Sistem booking lapangan olahraga berbasis web yang memungkinkan:
- **Customer (Member)** melihat ketersediaan lapangan secara real-time dan melakukan booking
- **Operator** mengelola lapangan, jadwal, dan harga
- **Kasir** memproses pembayaran dan konfirmasi
- **Super Admin** mengelola seluruh sistem termasuk role, menu, dan user

Sistem ini bersifat **multi-sport** (padel, futsal, mini soccer, dll) dan **multi-venue** (bisa banyak lapangan dalam satu tipe olahraga).

---

## 2. TECH STACK

| Layer | Teknologi | Keterangan |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR + CSR hybrid |
| Styling | Tailwind CSS + shadcn/ui | Komponen siap pakai |
| State Management | Zustand | Global state ringan |
| Server State | TanStack Query v5 | Cache & sync data dari server |
| Language | TypeScript (strict) | Seluruh codebase |
| Backend | Next.js API Routes + Server Actions | Tidak perlu server terpisah |
| Database | Supabase (PostgreSQL) | BaaS lengkap |
| ORM | Prisma | Type-safe query builder |
| Auth | Supabase Auth | JWT + session management |
| Realtime | Supabase Realtime | Update slot tanpa reload |
| Storage | Supabase Storage | Upload foto lapangan |
| Email | Resend | Notifikasi email transaksional |
| WA Notif | Fonnte API | Notifikasi WhatsApp lokal |
| Deployment | Vercel | FE + API Routes |
| DB Hosting | Supabase Cloud | Free tier cukup untuk porto |

---

## 3. MONOREPO STRUCTURE

```
booking-lapangan/
├── .env.local                        # Environment variables (jangan di-commit)
├── .env.example                      # Template env (wajib di-commit)
├── CODING_RULES.md                   # Aturan kode (dokumen ini)
├── SYSTEM_SPEC.md                    # Spesifikasi sistem (dokumen ini)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── prisma/
│   ├── schema.prisma                 # Definisi semua tabel database
│   └── seed.ts                       # Data awal (roles, menus, admin)
│
├── public/
│   └── assets/
│
└── src/
    ├── app/                          # Next.js App Router
    │   ├── layout.tsx                # Root layout
    │   ├── (auth)/                   # Route group: halaman login/register
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   │
    │   ├── (admin)/                  # Route group: dashboard admin
    │   │   ├── layout.tsx            # Layout admin (sidebar + permission guard)
    │   │   ├── setup/
    │   │   │   ├── roles/page.tsx
    │   │   │   ├── menus/page.tsx
    │   │   │   └── users/page.tsx
    │   │   ├── master/
    │   │   │   ├── sport-types/page.tsx
    │   │   │   ├── venues/page.tsx
    │   │   │   └── pricing/page.tsx
    │   │   ├── transaction/
    │   │   │   ├── bookings/page.tsx
    │   │   │   ├── payments/page.tsx
    │   │   │   └── waiting-list/page.tsx
    │   │   └── report/
    │   │       ├── revenue/page.tsx
    │   │       └── occupancy/page.tsx
    │   │
    │   ├── (member)/                 # Route group: portal customer
    │   │   ├── layout.tsx            # Layout member (navbar simple)
    │   │   ├── venues/page.tsx       # Halaman pilih lapangan & slot
    │   │   ├── booking/
    │   │   │   ├── [venueId]/page.tsx  # Halaman booking lapangan tertentu
    │   │   │   └── checkout/page.tsx   # Halaman konfirmasi & bayar
    │   │   ├── my-bookings/page.tsx
    │   │   └── notifications/page.tsx
    │   │
    │   └── api/                      # API Routes (backend)
    │       ├── auth/
    │       │   └── [...supabase]/route.ts
    │       ├── bookings/
    │       │   ├── route.ts          # GET list, POST create
    │       │   └── [id]/
    │       │       ├── route.ts      # GET detail, PATCH, DELETE
    │       │       └── cancel/route.ts
    │       ├── payments/
    │       │   ├── route.ts
    │       │   └── verify/route.ts
    │       ├── venues/
    │       │   ├── route.ts
    │       │   └── [id]/
    │       │       ├── route.ts
    │       │       └── slots/route.ts  # GET slot availability
    │       ├── slot-lock/
    │       │   └── route.ts          # POST lock, DELETE release
    │       ├── waiting-list/
    │       │   └── route.ts
    │       ├── menus/
    │       │   └── route.ts          # GET dynamic menus by role
    │       └── notifications/
    │           └── route.ts
    │
    ├── components/                   # Komponen React
    │   ├── ui/                       # shadcn/ui base components (jangan edit manual)
    │   ├── layout/
    │   │   ├── AdminSidebar.tsx      # Sidebar dinamis dari DB
    │   │   ├── MemberNavbar.tsx
    │   │   └── PermissionGuard.tsx   # HOC: redirect kalau tidak ada akses
    │   ├── booking/
    │   │   ├── SlotGrid.tsx          # Grid jam dengan warna realtime
    │   │   ├── SlotTimer.tsx         # Countdown 15 menit lock
    │   │   ├── BookingCard.tsx
    │   │   ├── BookingStatusBadge.tsx
    │   │   └── BookingForm.tsx
    │   ├── venue/
    │   │   ├── VenueCard.tsx
    │   │   └── VenueFilterBar.tsx
    │   ├── payment/
    │   │   ├── PaymentMethodSelector.tsx
    │   │   └── PaymentProofUpload.tsx
    │   └── shared/
    │       ├── DataTable.tsx         # Tabel reusable untuk semua list page
    │       ├── ConfirmDialog.tsx
    │       ├── LoadingSpinner.tsx
    │       └── EmptyState.tsx
    │
    ├── hooks/                        # Custom React hooks
    │   ├── usePermission.ts          # Cek permission dari session
    │   ├── useBookingSlots.ts        # Fetch + realtime slot availability
    │   ├── useSlotLock.ts            # Handle lock & countdown timer
    │   ├── useMenus.ts               # Fetch dynamic menus
    │   └── useNotifications.ts       # Realtime notifikasi
    │
    ├── lib/                          # Library, helper, dan konfigurasi
    │   ├── supabase/
    │   │   ├── client.ts             # Supabase browser client
    │   │   ├── server.ts             # Supabase server client (SSR)
    │   │   └── middleware.ts         # Auth middleware Next.js
    │   ├── prisma/
    │   │   └── client.ts             # Prisma singleton client
    │   ├── repositories/             # Semua query database ada di sini
    │   │   ├── booking.repository.ts
    │   │   ├── venue.repository.ts
    │   │   ├── payment.repository.ts
    │   │   ├── slot-lock.repository.ts
    │   │   ├── waiting-list.repository.ts
    │   │   ├── menu.repository.ts
    │   │   ├── role.repository.ts
    │   │   └── notification.repository.ts
    │   ├── services/                 # Business logic layer
    │   │   ├── booking.service.ts    # Logika utama booking
    │   │   ├── payment.service.ts    # Logika pembayaran & refund
    │   │   ├── slot.service.ts       # Cek availability, lock, release
    │   │   ├── notification.service.ts # Kirim WA, email, in-app
    │   │   └── permission.service.ts # Logika RBAC
    │   ├── actions/                  # Next.js Server Actions
    │   │   ├── booking.actions.ts
    │   │   ├── payment.actions.ts
    │   │   └── venue.actions.ts
    │   ├── utils/
    │   │   ├── format.ts             # formatCurrency, formatDate, formatTime
    │   │   ├── date.ts               # Helper manipulasi tanggal & jam
    │   │   └── cn.ts                 # clsx + tailwind-merge helper
    │   └── auth/
    │       ├── requireAuth.ts        # Throw 401 kalau belum login
    │       └── requirePermission.ts  # Throw 403 kalau tidak ada akses
    │
    ├── store/                        # Zustand global state
    │   ├── booking.store.ts          # State proses booking aktif
    │   └── notification.store.ts     # State notifikasi in-app
    │
    ├── types/                        # TypeScript types & interfaces
    │   ├── booking.types.ts
    │   ├── venue.types.ts
    │   ├── payment.types.ts
    │   ├── user.types.ts
    │   ├── permission.types.ts
    │   └── api.types.ts              # ApiResponse<T> dan tipe API umum
    │
    └── constants/                    # Nilai konstan seluruh aplikasi
        ├── booking.constants.ts      # STATUS, MAX_LOCK_MINUTES, dll
        └── routes.constants.ts       # Path URL semua halaman
```

---

## 4. DATABASE SCHEMA

> Schema lengkap ada di `prisma/schema.prisma`. Berikut penjelasan per tabel dan relasinya.

### 4.1 Auth & RBAC

**`roles`** — Daftar role yang bisa di-manage via UI
```
id, name, slug, is_active
Contoh: { name: "Super Admin", slug: "super-admin" }
```

**`users`** — Extend dari Supabase Auth
```
id (FK ke auth.users Supabase), role_id, name, phone, is_active, created_at
```

**`menus`** — Menu dinamis yang dikonfigurasi via UI
```
id, parent_id (self-reference untuk sub-menu), name, url, icon, order_index, is_active
```

**`role_permissions`** — Permission tiap role per menu
```
id, role_id, menu_id, can_read, can_create, can_update, can_delete, can_show
```

### 4.2 Master Data

**`sport_types`** — Jenis olahraga
```
id, name, icon, is_active
Contoh: { name: "Padel", icon: "tennis" }
```

**`venues`** — Lapangan
```
id, sport_type_id, name, description, capacity, photo_url, is_active
```

**`pricing_rules`** — Harga per lapangan berdasarkan waktu
```
id, venue_id, label, start_time, end_time, day_type (weekday|weekend|holiday), price_per_hour
Contoh: Lapangan Padel A, 06:00-18:00, weekday = 150.000/jam
        Lapangan Padel A, 18:00-23:00, weekday = 200.000/jam
```

### 4.3 Transaksi

**`bookings`** — Booking yang dibuat user
```
id, user_id, venue_id, booking_code (unik, readable: BK-20241201-001),
booking_date, start_time, end_time, total_price,
status (pending|confirmed|checked_in|completed|cancelled|expired),
created_at
```

**`payments`** — Pembayaran per booking
```
id, booking_id, method (transfer|qris|cash|ewallet),
amount_paid, status (pending|verified|rejected),
proof_url, paid_at, verified_by (user_id kasir)
```

**`slot_locks`** — Temporary lock saat user sedang di proses checkout
```
id, venue_id, user_id, booking_date, start_time, end_time,
expires_at (= created_at + 15 menit)
```
> Dibersihkan otomatis via Supabase cron job tiap menit.

**`waiting_list`** — Antrian jika slot penuh
```
id, user_id, venue_id, booking_date, start_time, end_time,
is_notified, created_at
```

**`notifications`** — Log semua notifikasi terkirim
```
id, user_id, booking_id, type (booking_confirmed|payment_verified|slot_available|reminder),
channel (whatsapp|email|in_app), message, is_read, sent_at
```

---

## 5. ALUR SISTEM (FLOW)

### 5.1 Flow Booking Customer

```
1. Customer buka /venues
2. Filter berdasarkan jenis olahraga
3. Pilih lapangan → redirect ke /booking/[venueId]
4. Pilih tanggal → sistem fetch slot dari DB + slot_locks aktif
5. Tampil grid jam: hijau (tersedia), merah (terisi/terkunci), kuning (lock orang lain)
6. Customer pilih jam mulai & selesai
7. Sistem POST /api/slot-lock → hold slot 15 menit
8. Customer lihat summary harga (dari pricing_rules)
9. Customer pilih metode bayar → submit
10. Sistem POST /api/bookings → buat booking status=pending
11. Customer upload bukti transfer / bayar
12. Sistem POST /api/payments → buat payment status=pending
13. Kasir verifikasi → PATCH /api/payments/verify → status=verified
14. Booking otomatis update status=confirmed
15. Notifikasi WA + email dikirim ke customer
16. slot_lock dihapus
```

### 5.2 Flow Slot Lock & Expiry

```
- Saat user memilih slot, POST /api/slot-lock dibuat
- Slot lock expires_at = now + 15 menit
- Frontend jalankan countdown timer (SlotTimer.tsx)
- Jika timer habis: DELETE /api/slot-lock, user dikembalikan ke halaman slot
- Supabase cron job tiap 1 menit hapus slot_locks yang sudah expired
- Supabase Realtime broadcast perubahan slot ke semua user yang sedang buka halaman yang sama
```

### 5.3 Flow Waiting List

```
1. Slot penuh → customer klik "Masuk Waiting List"
2. POST /api/waiting-list → simpan preferensi jadwal customer
3. Jika booking yang ada dibatalkan:
   - Trigger (Supabase database function) otomatis jalan
   - Ambil user pertama di waiting_list untuk slot yang sama
   - Kirim notifikasi WA: "Slot tersedia! Kamu punya 30 menit untuk booking"
   - Buat slot_lock khusus untuk user tersebut (30 menit, bukan 15)
4. Jika user waiting list tidak booking dalam 30 menit → notif ke user berikutnya
```

### 5.4 Flow RBAC & Dynamic Menu

```
1. User login via Supabase Auth
2. Middleware cek session → ambil user.role_id
3. GET /api/menus → query menus JOIN role_permissions WHERE role_id = user.role_id
4. Response: array menu yang boleh diakses beserta permission-nya
5. AdminSidebar.tsx render menu dari response tersebut
6. Tiap navigasi ke halaman: PermissionGuard.tsx cek apakah role punya can_read untuk menu ini
7. Tiap render tombol: usePermission() hook cek can_create / can_update / can_delete
8. Tiap API route: requirePermission() dipanggil di awal handler
   → jika tidak ada permission: return 403
```

---

## 6. DETAIL IMPLEMENTASI FRONTEND

### 6.1 Halaman Slot Grid (`/booking/[venueId]`)

Ini halaman paling kompleks di sisi customer. Berikut cara kerjanya:

```
Komponen: SlotGrid.tsx
- Render grid jam dari 06:00 sampai 23:00 (interval 1 jam)
- Tiap sel punya status: available | booked | locked_by_others | locked_by_me
- Warna: hijau | merah | kuning | biru (milik saya)
- User klik jam mulai → klik jam selesai → highlight range
- Jika ada jam di tengah range yang terisi: range tidak valid, tampilkan error

Data source:
- bookings: fetch dari /api/venues/[id]/slots?date=YYYY-MM-DD
- slot_locks: sama endpoint di atas, sudah di-merge di server
- Realtime: subscribe ke tabel bookings + slot_locks via Supabase Realtime
  → setiap ada perubahan, grid otomatis refresh tanpa reload halaman
```

### 6.2 Dynamic Sidebar (`AdminSidebar.tsx`)

```
- Fetch menu dari /api/menus (sudah difilter sesuai role user yang login)
- Render parent menu dengan children (sub-menu)
- Highlight active menu berdasarkan pathname
- Icon dari library lucide-react (nama icon disimpan di kolom menus.icon)
- Jika user tidak punya akses sama sekali ke sebuah parent menu,
  parent menu tersebut tidak muncul
```

### 6.3 Permission Guard (`PermissionGuard.tsx`)

```tsx
// Cara penggunaan di layout admin
export default function AdminLayout({ children }) {
  return (
    <PermissionGuard>
      <AdminSidebar />
      <main>{children}</main>
    </PermissionGuard>
  )
}

// PermissionGuard cek:
// 1. Apakah user sudah login? Kalau tidak → redirect /login
// 2. Apakah user punya can_read untuk current pathname? Kalau tidak → tampilkan 403 page
```

---

## 7. DETAIL IMPLEMENTASI BACKEND

### 7.1 Layering Pattern

Semua logika backend mengikuti layer berikut:

```
API Route / Server Action
    ↓
requireAuth() + requirePermission()   ← security layer
    ↓
Service Layer                          ← business logic
    ↓
Repository Layer                       ← database query
    ↓
Supabase / Prisma
```

Tidak boleh ada layer yang dilewati. Repository tidak boleh dipanggil langsung dari API Route.

### 7.2 Contoh: Endpoint POST /api/bookings

```ts
// app/api/bookings/route.ts
export async function POST(req: Request) {
  // 1. Auth & Permission
  const session = await requireAuth()
  await requirePermission(session, 'bookings', 'create')

  // 2. Parse & validasi input
  const body = await req.json()
  const input = createBookingSchema.parse(body)   // Zod validation

  // 3. Delegate ke service
  const booking = await bookingService.create(input, session.user.id)

  // 4. Return response
  return NextResponse.json({ success: true, data: booking }, { status: 201 })
}

// lib/services/booking.service.ts
export const bookingService = {
  create: async (input: CreateBookingInput, userId: string): Promise<Booking> => {
    // Cek slot masih available
    await slotService.assertAvailable(input.venueId, input.date, input.startTime, input.endTime)

    // Hitung harga berdasarkan pricing rules
    const totalPrice = await slotService.calculatePrice(input.venueId, input.date, input.startTime, input.endTime)

    // Buat booking
    const booking = await bookingRepository.create({
      ...input,
      userId,
      totalPrice,
      status: 'pending',
      bookingCode: await generateBookingCode(),
    })

    // Hapus slot lock milik user ini
    await slotLockRepository.deleteByUser(userId)

    // Kirim notifikasi pending payment
    await notificationService.sendPendingPayment(booking)

    return booking
  }
}
```

### 7.3 Realtime Slot Update

```ts
// hooks/useBookingSlots.ts
export const useBookingSlots = (venueId: string, date: string) => {
  const [slots, setSlots] = useState<SlotStatus[]>([])

  useEffect(() => {
    // Initial fetch
    fetchSlots(venueId, date).then(setSlots)

    // Subscribe realtime
    const channel = supabase
      .channel(`slots-${venueId}-${date}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `venue_id=eq.${venueId}`,
      }, () => {
        // Re-fetch saat ada perubahan booking
        fetchSlots(venueId, date).then(setSlots)
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'slot_locks',
        filter: `venue_id=eq.${venueId}`,
      }, () => {
        fetchSlots(venueId, date).then(setSlots)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [venueId, date])

  return slots
}
```

### 7.4 Notifikasi WhatsApp (via Fonnte)

```ts
// lib/services/notification.service.ts
export const notificationService = {
  sendBookingConfirmation: async (booking: Booking): Promise<void> => {
    const user = await userRepository.findById(booking.userId)
    const message = buildConfirmationMessage(booking)  // template pesan

    // Kirim WA
    await fonnteClient.send({ target: user.phone, message })

    // Kirim email
    await resend.emails.send({
      from: 'booking@lapangan.id',
      to: user.email,
      subject: `Booking Dikonfirmasi - ${booking.bookingCode}`,
      html: buildConfirmationEmail(booking),
    })

    // Simpan log notifikasi ke DB
    await notificationRepository.create({
      userId: user.id,
      bookingId: booking.id,
      type: 'booking_confirmed',
      channel: 'whatsapp',
      message,
    })
  }
}
```

---

## 8. ENVIRONMENT VARIABLES

```bash
# .env.example — copy ke .env.local dan isi nilainya

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # hanya untuk server, jangan expose ke client

# Database (Prisma)
DATABASE_URL=                     # connection string PostgreSQL dari Supabase

# Email (Resend)
RESEND_API_KEY=

# WhatsApp (Fonnte)
FONNTE_API_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 9. SEEDING DATA AWAL

Jalankan `npx prisma db seed` untuk mengisi data awal:

```
Roles: Super Admin, Operator, Kasir, Member
Menus: semua menu sesuai SYSTEM_SPEC section 5 (Setup, Master, Transaksi, Member, Report)
Role Permissions: sesuai permission matrix di SYSTEM_SPEC
User: admin@lapangan.id / password: Admin123! (role Super Admin)
Sport Types: Padel, Futsal, Mini Soccer, Badminton
Venue sample: 2 lapangan Padel, 2 lapangan Futsal
Pricing rules: weekday & weekend untuk masing-masing venue
```

---

## 10. PANDUAN UNTUK AI AGENT (CODEX)

Saat menerima task, ikuti urutan berikut:

1. **Baca task dengan teliti** — pastikan kamu tahu file mana yang perlu dibuat atau diubah
2. **Cek tipe yang relevan** di `src/types/` sebelum menulis fungsi apapun
3. **Ikuti layering** — API Route → Service → Repository. Jangan skip layer
4. **Gunakan repository yang sudah ada** sebelum membuat query baru
5. **Selalu tambahkan permission check** di setiap API route baru
6. **Validasi input dengan Zod** sebelum data masuk ke service layer
7. **Tulis dalam TypeScript strict** — tidak ada `any`, semua punya return type
8. **Ikuti konvensi penamaan** di CODING_RULES.md
9. **Satu PR = satu fitur** — jangan campur perubahan yang tidak berkaitan
10. **Test happy path dan edge case** minimal: input valid, input tidak valid, tidak ada akses