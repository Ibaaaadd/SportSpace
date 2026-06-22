# Dokumentasi API - Booking Transaction System

## Overview
Sistem transaksi booking lapangan dengan notifikasi dalam sistem (IN_APP). Email dan WhatsApp belum diimplementasikan.

---

## 1. BOOKING ENDPOINTS

### GET /api/bookings
**Deskripsi:** Ambil semua booking atau filter berdasarkan user/venue/status

**Query Parameters:**
- `userId` (optional) - ID user untuk filter booking
- `venueId` (optional) - ID venue untuk filter booking
- `status` (optional) - Status booking (PENDING|CONFIRMED|CHECKED_IN|COMPLETED|CANCELLED|EXPIRED)

**Contoh Request:**
```
GET /api/bookings?userId=user-id-123
GET /api/bookings?venueId=venue-id-456&status=CONFIRMED
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking-id",
      "bookingCode": "BK-20260622-0001",
      "userId": "user-id",
      "venueId": "venue-id",
      "bookingDate": "2026-06-22T00:00:00Z",
      "startTime": "10:00",
      "endTime": "12:00",
      "totalPrice": 300000,
      "status": "PENDING",
      "notes": null,
      "createdAt": "2026-06-22T10:30:00Z",
      "updatedAt": "2026-06-22T10:30:00Z",
      "user": { "id": "user-id", "name": "Budi", "email": "budi@email.com", "phone": "081234567890" },
      "venue": { "id": "venue-id", "name": "Lapangan Padel A" },
      "payments": []
    }
  ],
  "total": 1
}
```

---

### POST /api/bookings
**Deskripsi:** Buat booking baru (status: PENDING)

**Request Body:**
```json
{
  "userId": "user-id-123",
  "venueId": "venue-id-456",
  "bookingDate": "2026-06-22",
  "startTime": "10:00",
  "endTime": "12:00",
  "totalPrice": 300000,
  "notes": "Atas nama Budi" // optional
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "booking-id",
    "bookingCode": "BK-20260622-0001",
    "userId": "user-id",
    "venueId": "venue-id",
    "bookingDate": "2026-06-22T00:00:00Z",
    "startTime": "10:00",
    "endTime": "12:00",
    "totalPrice": 300000,
    "status": "PENDING",
    "notes": "Atas nama Budi",
    "createdAt": "2026-06-22T10:30:00Z",
    "updatedAt": "2026-06-22T10:30:00Z",
    "user": { ... },
    "venue": { ... },
    "payments": []
  },
  "message": "Booking berhasil dibuat"
}
```

**Automatic IN_APP Notification:**
```
Booking Anda berhasil dibuat:

Kode Booking: BK-20260622-0001
Lapangan: Lapangan Padel A
Tanggal: Senin, 22 Juni 2026
Jam: 10:00 - 12:00

Mohon segera lakukan pembayaran untuk mengkonfirmasi booking.
```

---

### GET /api/bookings/[id]
**Deskripsi:** Ambil detail booking tertentu

**Contoh Request:**
```
GET /api/bookings/booking-id-123
```

**Response:**
```json
{
  "success": true,
  "data": { ... } // detail booking lengkap
}
```

---

### PATCH /api/bookings/[id]
**Deskripsi:** Update status booking

**Request Body:**
```json
{
  "status": "CONFIRMED"  // or: CHECKED_IN, COMPLETED, CANCELLED, EXPIRED
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }, // booking dengan status baru
  "message": "Status booking berhasil diperbarui"
}
```

---

### DELETE /api/bookings/[id]
**Deskripsi:** Batalkan booking

**Request Body (optional):**
```json
{
  "reason": "Alasan pembatalan" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }, // booking dengan status CANCELLED
  "message": "Booking berhasil dibatalkan"
}
```

**Automatic IN_APP Notification:**
```
Booking BK-20260622-0001 untuk Lapangan Padel A telah dibatalkan.
Alasan: Alasan pembatalan
```

---

## 2. PAYMENT ENDPOINTS

### GET /api/payments
**Deskripsi:** Ambil semua pembayaran atau filter

**Query Parameters:**
- `bookingId` (optional) - ID booking untuk filter pembayaran
- `status` (optional) - Status pembayaran (PENDING|VERIFIED|REJECTED)
- `method` (optional) - Metode pembayaran (TRANSFER|QRIS|CASH|EWALLET)

**Contoh Request:**
```
GET /api/payments?bookingId=booking-id-123
GET /api/payments?status=PENDING
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "payment-id",
      "bookingId": "booking-id",
      "method": "TRANSFER",
      "amountPaid": 300000,
      "status": "PENDING",
      "proofUrl": "https://...",
      "paidAt": "2026-06-22T11:00:00Z",
      "verifiedAt": null,
      "verifiedBy": null,
      "notes": null,
      "createdAt": "2026-06-22T11:00:00Z",
      "updatedAt": "2026-06-22T11:00:00Z",
      "booking": {
        "id": "booking-id",
        "bookingCode": "BK-20260622-0001",
        "user": { ... },
        "venue": { ... }
      },
      "verifier": null
    }
  ],
  "total": 1
}
```

---

### POST /api/payments
**Deskripsi:** Buat pembayaran baru untuk booking

**Request Body:**
```json
{
  "bookingId": "booking-id-123",
  "method": "TRANSFER",  // or: QRIS, CASH, EWALLET
  "amountPaid": 300000,
  "proofUrl": "https://storage.example.com/proof-image.jpg", // optional (untuk transfer/QRIS)
  "notes": "Transfer dari BCA ke rekening 1234567890" // optional
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": { ... }, // detail pembayaran yang baru dibuat (status: PENDING)
  "message": "Pembayaran berhasil dibuat"
}
```

---

### GET /api/payments/[id]
**Deskripsi:** Ambil detail pembayaran tertentu

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### POST /api/payments/[id]/verify
**Deskripsi:** Verifikasi pembayaran → booking status berubah menjadi CONFIRMED

**Request Body:**
```json
{
  "verifiedBy": "kasir-user-id-456"  // ID user kasir yang memverifikasi
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": { ... }, // status: VERIFIED
    "booking": { ... }  // status: CONFIRMED
  },
  "message": "Pembayaran berhasil diverifikasi dan booking dikonfirmasi"
}
```

**Automatic IN_APP Notification:**
```
Pembayaran booking BK-20260622-0001 telah diverifikasi dan dikonfirmasi. Booking Anda siap digunakan!
```

---

### POST /api/payments/[id]/reject
**Deskripsi:** Tolak pembayaran → kirim notifikasi ke user

**Request Body:**
```json
{
  "verifiedBy": "kasir-user-id-456",
  "reason": "Bukti transfer tidak jelas" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }, // payment dengan status: REJECTED
  "message": "Pembayaran ditolak dan notifikasi dikirim ke user"
}
```

**Automatic IN_APP Notification:**
```
Pembayaran booking BK-20260622-0001 ditolak.

Alasan: Bukti transfer tidak jelas

Silakan lakukan pembayaran ulang.
```

---

## 3. NOTIFICATION ENDPOINTS

### GET /api/notifications
**Deskripsi:** Ambil notifikasi user

**Query Parameters:**
- `userId` (required) - ID user
- `unreadOnly` (optional, default: false) - Hanya notifikasi yang belum dibaca
- `limit` (optional) - Jumlah notifikasi yang ditampilkan

**Contoh Request:**
```
GET /api/notifications?userId=user-id-123
GET /api/notifications?userId=user-id-123&unreadOnly=true&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notification-id",
      "userId": "user-id",
      "bookingId": "booking-id",
      "type": "BOOKING_CREATED",
      "channel": "IN_APP",
      "message": "Booking Anda berhasil dibuat:\n\nKode Booking: BK-20260622-0001\n...",
      "isRead": false,
      "readAt": null,
      "sentAt": "2026-06-22T10:30:00Z",
      "createdAt": "2026-06-22T10:30:00Z",
      "user": { "id": "user-id", "name": "Budi", "email": "budi@email.com" },
      "booking": { "id": "booking-id", "bookingCode": "BK-20260622-0001", "status": "PENDING" }
    }
  ],
  "unreadCount": 5,
  "total": 1
}
```

---

### GET /api/notifications/[id]
**Deskripsi:** Ambil detail notifikasi tertentu

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### PATCH /api/notifications/[id]
**Deskripsi:** Tandai notifikasi sebagai sudah dibaca

**Response:**
```json
{
  "success": true,
  "data": { ... }, // notification dengan isRead: true
  "message": "Notifikasi ditandai sebagai dibaca"
}
```

---

### DELETE /api/notifications/[id]
**Deskripsi:** Hapus notifikasi

**Response:**
```json
{
  "success": true,
  "message": "Notifikasi berhasil dihapus"
}
```

---

### POST /api/notifications
**Deskripsi:** Bulk operation untuk notifikasi

**Request Body - Mark All As Read:**
```json
{
  "userId": "user-id-123",
  "action": "mark-all-read"
}
```

**Request Body - Cleanup Old Notifications:**
```json
{
  "userId": "user-id-123",
  "action": "cleanup",
  "days": 30  // optional, default: 30 (hapus notifikasi dibaca lebih dari 30 hari)
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 notifikasi ditandai sebagai dibaca"
}
```

---

## 4. NOTIFICATION TYPES

| Type | Trigger | Message |
|------|---------|---------|
| `BOOKING_CREATED` | Booking baru dibuat | "Booking Anda berhasil dibuat..." |
| `BOOKING_CONFIRMED` | - (untuk future use) | - |
| `BOOKING_CANCELLED` | Booking dibatalkan | "Booking ... telah dibatalkan" |
| `PAYMENT_VERIFIED` | Pembayaran diverifikasi | "Pembayaran booking ... telah diverifikasi" |
| `PAYMENT_REJECTED` | Pembayaran ditolak | "Pembayaran booking ... ditolak..." |
| `SLOT_AVAILABLE` | - (untuk waiting list) | - |
| `REMINDER` | - (untuk reminder) | - |

---

## 5. BOOKING STATUS FLOW

```
┌─────────────────────────────────────┐
│  PENDING (booking dibuat)           │
│  (user upload bukti pembayaran)     │
└──────────────┬──────────────────────┘
               │
               ├─→ Payment verified  ──→ CONFIRMED
               │                        (booking ready)
               │
               └─→ Payment rejected  ──→ PENDING
                                        (user bayar ulang)

               ┌─ During stay:
CONFIRMED ─→   ├─→ CHECKED_IN
               └─ After stay:
                  └─→ COMPLETED

PENDING/CONFIRMED ─→ CANCELLED (dibatalkan user/admin)
PENDING ─→ EXPIRED (timeout, tidak bayar)
```

---

## 6. ERROR HANDLING

Semua response error menggunakan format:
```json
{
  "success": false,
  "error": "Deskripsi error"
}
```

HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request (validasi error)
- `404` - Not Found
- `500` - Server Error

---

## 7. IMPLEMENTATION NOTES

- **Notification Channel**: Saat ini hanya IN_APP. Email dan WhatsApp belum diimplementasikan.
- **Booking Code Format**: BK-YYYYMMDD-NNNN (auto-increment per hari)
- **Date Format**: ISO 8601 (2026-06-22)
- **Time Format**: HH:mm (24-hour)
- **Price**: Integer (dalam Rupiah)
- **All timestamps**: ISO 8601 dengan timezone UTC

---

## 8. EXAMPLE WORKFLOW

### Complete Booking Flow:

**1. Create Booking:**
```bash
POST /api/bookings
{
  "userId": "user-123",
  "venueId": "venue-456",
  "bookingDate": "2026-06-22",
  "startTime": "10:00",
  "endTime": "12:00",
  "totalPrice": 300000
}
```
→ Booking created with status PENDING
→ IN_APP notification: "Booking berhasil dibuat..."

**2. Create Payment:**
```bash
POST /api/payments
{
  "bookingId": "booking-123",
  "method": "TRANSFER",
  "amountPaid": 300000,
  "proofUrl": "https://..."
}
```
→ Payment created with status PENDING

**3. Kasir Verifies Payment:**
```bash
POST /api/payments/payment-123/verify
{
  "verifiedBy": "kasir-user-789"
}
```
→ Payment status → VERIFIED
→ Booking status → CONFIRMED
→ IN_APP notification: "Pembayaran berhasil diverifikasi..."

**4. User Checks Bookings:**
```bash
GET /api/bookings?userId=user-123
```
→ Show booking with status CONFIRMED

**5. User Checks Notifications:**
```bash
GET /api/notifications?userId=user-123&unreadOnly=true
```
→ Show 2 unread notifications (BOOKING_CREATED, PAYMENT_VERIFIED)

---

End of Documentation
