# CODING RULES
> Dokumen ini adalah panduan wajib untuk semua kontributor dan AI agent (Codex, Copilot, dll).
> Baca seluruh dokumen ini sebelum menulis satu baris kode pun.

---

## 1. PRINSIP UTAMA

- **Clarity over cleverness** — kode harus mudah dibaca manusia dan AI, bukan mengesankan.
- **One responsibility** — setiap fungsi, file, dan komponen hanya melakukan satu hal.
- **Explicit over implicit** — jangan andalkan "magic". Tulis dengan jelas apa yang dilakukan kode.
- **Fail loudly** — error harus terlihat dan informatif, jangan diam-diam diabaikan.

---

## 2. BAHASA & TYPING

- Semua kode menggunakan **TypeScript strict mode**. Tidak ada `any` kecuali benar-benar tidak bisa dihindari, dan harus diberi komentar alasannya.
- Setiap fungsi harus memiliki **return type eksplisit**.
- Gunakan `type` untuk union/intersection, gunakan `interface` untuk shape objek/props komponen.
- Tidak ada `var`. Gunakan `const` secara default, `let` hanya jika nilai berubah.

```ts
// ❌ Salah
const getBooking = async (id) => {
  const data: any = await fetch(...)
  return data
}

// ✅ Benar
const getBooking = async (id: string): Promise<Booking> => {
  const data = await bookingRepository.findById(id)
  return data
}
```

---

## 3. PENAMAAN

### File & Folder
| Konteks | Konvensi | Contoh |
|---|---|---|
| Komponen React | PascalCase | `BookingCard.tsx` |
| Hook | camelCase dengan prefix `use` | `useBookingSlots.ts` |
| Utility / helper | camelCase | `formatCurrency.ts` |
| Server action / API handler | camelCase | `createBooking.ts` |
| Type / interface file | camelCase | `booking.types.ts` |
| Konstanta | camelCase | `booking.constants.ts` |
| Test file | sama dengan file aslinya + `.test` | `BookingCard.test.tsx` |

### Variabel & Fungsi
- Variabel boolean: prefix `is`, `has`, `can`, `should` → `isAvailable`, `hasPermission`
- Handler event: prefix `handle` → `handleSubmit`, `handleSlotSelect`
- Fungsi fetcher: prefix `get`, `fetch` → `getVenues`, `fetchBookingById`
- Fungsi mutasi: prefix `create`, `update`, `delete`, `cancel` → `createBooking`, `cancelBooking`
- Konstanta global: SCREAMING_SNAKE_CASE → `MAX_SLOT_LOCK_MINUTES`, `BOOKING_STATUS`

```ts
// ❌ Salah
const x = true
const doThing = () => {}
const booking2 = () => {}

// ✅ Benar
const isSlotAvailable = true
const handleBookingSubmit = () => {}
const createBookingAction = () => {}
```

---

## 4. STRUKTUR FUNGSI & KOMPONEN

### Fungsi
- Maksimal **30 baris** per fungsi. Lebih dari itu, pecah menjadi subfungsi.
- Selalu validasi input di awal fungsi (early return pattern).
- Satu fungsi = satu level abstraksi.

```ts
// ❌ Salah — terlalu banyak tanggung jawab
const processBooking = async (data) => {
  // validasi
  // cek slot
  // hitung harga
  // insert ke db
  // kirim notif
}

// ✅ Benar — tiap fungsi satu tanggung jawab
const processBooking = async (data: CreateBookingInput): Promise<Booking> => {
  validateBookingInput(data)
  await assertSlotAvailable(data.venueId, data.date, data.startTime, data.endTime)
  const price = calculateBookingPrice(data)
  const booking = await bookingRepository.create({ ...data, totalPrice: price })
  await notificationService.sendBookingConfirmation(booking)
  return booking
}
```

### Komponen React
Urutan penulisan dalam komponen selalu:
1. Types / interface props
2. Konstanta lokal
3. Component function
4. Hooks (state, query, dll)
5. Derived values
6. Handler functions
7. Return JSX

```tsx
// ✅ Urutan yang benar
interface BookingCardProps {
  booking: Booking
  onCancel: (id: string) => void
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Menunggu Pembayaran',
  confirmed: 'Dikonfirmasi',
  cancelled: 'Dibatalkan',
  expired: 'Kadaluarsa',
}

export const BookingCard = ({ booking, onCancel }: BookingCardProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const statusLabel = STATUS_LABEL[booking.status]
  const canCancel = booking.status === 'confirmed' || booking.status === 'pending'

  const handleCancel = async () => {
    setIsLoading(true)
    await onCancel(booking.id)
    setIsLoading(false)
  }

  return (
    <div>...</div>
  )
}
```

---

## 5. ERROR HANDLING

- Selalu gunakan `try/catch` untuk operasi async yang bisa gagal.
- Jangan pernah `catch` error lalu diam (empty catch block).
- Gunakan custom error class untuk membedakan jenis error.
- Di API route, selalu kembalikan response dengan format konsisten.

```ts
// Format response API — selalu gunakan ini
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

// Custom error
export class SlotNotAvailableError extends Error {
  code = 'SLOT_NOT_AVAILABLE'
  constructor() {
    super('Slot yang dipilih sudah tidak tersedia')
  }
}

// Di API handler
try {
  const booking = await createBooking(input)
  return NextResponse.json({ success: true, data: booking })
} catch (error) {
  if (error instanceof SlotNotAvailableError) {
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: 409 }
    )
  }
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  )
}
```

---

## 6. DATABASE & QUERY

- Semua query ke Supabase **wajib melalui repository layer**, tidak boleh langsung di komponen atau route handler.
- Nama repository: `[entity].repository.ts` → `booking.repository.ts`
- Setiap repository mengekspos fungsi dengan nama eksplisit, bukan generic CRUD.
- Selalu handle kemungkinan `null` dari query.

```ts
// ❌ Salah — query langsung di komponen
const { data } = await supabase.from('bookings').select('*')

// ✅ Benar — melalui repository
// lib/repositories/booking.repository.ts
export const bookingRepository = {
  findById: async (id: string): Promise<Booking | null> => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, venue(*), user(*), payments(*)')
      .eq('id', id)
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  findByUserId: async (userId: string): Promise<Booking[]> => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, venue(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
  },
}
```

---

## 7. PERMISSION & RBAC

- Setiap server action / API route **wajib** cek autentikasi dan permission sebelum proses apapun.
- Gunakan helper `requirePermission()` yang sudah disediakan — jangan tulis logika permission sendiri di tiap route.
- Di sisi frontend, gunakan hook `usePermission()` untuk kondisional render.

```ts
// ✅ Di API route
export async function POST(req: Request) {
  const session = await requireAuth()                          // lempar 401 kalau belum login
  await requirePermission(session, 'bookings', 'create')      // lempar 403 kalau tidak punya akses
  // ... lanjut proses
}

// ✅ Di komponen
const { can } = usePermission()
return (
  <div>
    {can('bookings', 'create') && <CreateBookingButton />}
    {can('bookings', 'delete') && <DeleteButton />}
  </div>
)
```

---

## 8. KOMENTAR & DOKUMENTASI

- Komentar menjelaskan **mengapa**, bukan **apa**. Kode yang baik sudah menjelaskan "apa"-nya sendiri.
- Gunakan JSDoc untuk fungsi yang di-export dari library/utils.
- Tandai hal yang perlu diperhatikan dengan tag standar:

```ts
// TODO: implementasi setelah payment gateway terintegrasi
// FIXME: edge case kalau user cancel di detik terakhir lock
// NOTE: angka 15 menit dari kebijakan bisnis, jangan diubah tanpa konfirmasi
// HACK: workaround sementara karena Supabase belum support X
```

---

## 9. IMPORT ORDER

Selalu urutkan import dengan kelompok berikut (dipisah baris kosong):

```ts
// 1. Library eksternal
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Internal — types
import type { Booking, BookingStatus } from '@/types/booking.types'

// 3. Internal — lib / utils / hooks
import { formatCurrency } from '@/lib/utils/format'
import { usePermission } from '@/hooks/usePermission'

// 4. Internal — komponen
import { BookingCard } from '@/components/booking/BookingCard'

// 5. Assets / styles (kalau ada)
import styles from './page.module.css'
```

---

## 10. LARANGAN KERAS (NEVER DO)

| Larangan | Alasan |
|---|---|
| `console.log` di production code | Gunakan logger yang proper |
| Hard-code credential / API key | Selalu gunakan `.env` |
| Memanggil Supabase langsung di komponen | Wajib melalui repository |
| Skip permission check di API route | Security vulnerability |
| Menggunakan `any` tanpa komentar | Menghilangkan manfaat TypeScript |
| Magic number tanpa konstanta | `15` tidak bermakna, `MAX_SLOT_LOCK_MINUTES` bermakna |
| Nested ternary lebih dari 1 level | Tidak terbaca, gunakan if/else atau early return |
| Mutasi state langsung | Selalu gunakan setter dari useState / Zustand |