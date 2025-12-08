# Midtrans Snap Payment Integration - Implementation Guide

## 📋 Overview

Implementasi pembayaran menggunakan **Midtrans Snap Popup** untuk checkout decoration order. User akan memilih metode pembayaran di popup Midtrans (QRIS, Virtual Account, GoPay, ShopeePay, Credit Card, dll).

---

## 🔄 Payment Flow

```
1. User di Cart Page
   ↓
2. Click "Proceed to Checkout"
   ↓
3. Fill Personal Details & Shipping Address di Checkout Page
   ↓ (Optional) Apply Voucher
   ↓
4. Click "Pay Now" button
   ↓
5. Frontend: POST /api/customer/orders/checkout
   ↓ Backend: Create order + Generate Midtrans snap_token
   ↓
6. Frontend: Receive snap_token dari backend response
   ↓
7. Frontend: window.snap.pay(snap_token) → Open Midtrans Popup
   ↓
8. User pilih metode pembayaran di popup:
   │
   ├─ QRIS → QR Code muncul
   ├─ BCA VA → Virtual Account number muncul
   ├─ GoPay → Deeplink/QR muncul
   ├─ ShopeePay → Deeplink/QR muncul
   ├─ Credit Card → Form input card
   └─ dll
   ↓
9. User complete payment (sandbox: simulate di dashboard)
   ↓
10. Popup close → Frontend redirect ke Order Status Page
    ↓
10. Order Status Page: Polling setiap 3 detik
    GET /api/customer/orders/payment-status/{order_number}
    ↓
11. Backend: Check Midtrans transaction status
    ↓
13. Status: pending → settlement (paid)
    ↓
14. Frontend: Display success message
    ↓
15. Order muncul di Customer Orders & Admin Orders ✅
```

---

## 💻 Frontend Implementation

### 1. **Load Midtrans Snap.js Script**

File: `app/layout.tsx`

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Midtrans Snap.js - Sandbox */}
        <script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Notes:**
- Script loaded di semua pages (di `<head>`)
- Sandbox URL: `https://app.sandbox.midtrans.com/snap/snap.js`
- Production URL: `https://app.midtrans.com/snap/snap.js`
- Client key dari environment variable

---

### 2. **Environment Variable**

File: `.env.local`

```env
# Midtrans Configuration
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_KEY_HERE

# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Get Client Key:**
1. Login ke https://dashboard.sandbox.midtrans.com/
2. Menu: Settings → Access Keys
3. Copy "Client Key" (SB-Mid-client-xxxxx)

---

### 3. **Checkout Page Implementation**

File: `app/checkout/page.tsx`

#### Key Changes:

**A. Declare Snap type:**
```tsx
declare global {
  interface Window {
    snap: any;
  }
}
```

**B. Remove payment modal (old approach):**
```tsx
// ❌ OLD: Show custom modal with VA/QRIS buttons
const [showPaymentModal, setShowPaymentModal] = useState(false);

// ✅ NEW: Direct to Snap popup
// No modal state needed
```

**C. Updated handleProceedToPayment:**
```tsx
const handleProceedToPayment = async () => {
  if (!validateForm()) {
    alert('Please fill in all required fields');
    return;
  }

  // Check if Snap.js loaded
  if (typeof window.snap === 'undefined') {
    alert('Payment system not loaded. Please refresh the page.');
    return;
  }

  setProcessing(true);

  try {
    // 1. Call checkout API (no payment_type parameter)
    const response = await api.post('/customer/orders/checkout', formData);

    if (response.data.success) {
      const { snap_token, order } = response.data.data;
      
      if (!snap_token) {
        alert('❌ Backend tidak mengembalikan snap_token');
        setProcessing(false);
        return;
      }
      
      // Clear voucher
      localStorage.removeItem('applied_voucher');
      
      // 2. Open Midtrans Snap popup
      window.snap.pay(snap_token, {
        onSuccess: function(result: any) {
          console.log('Payment success:', result);
          router.push(`/orders/${order.order_number}/status`);
        },
        onPending: function(result: any) {
          console.log('Payment pending:', result);
          router.push(`/orders/${order.order_number}/status`);
        },
        onError: function(result: any) {
          console.error('Payment error:', result);
          alert('❌ Pembayaran gagal. Silakan coba lagi.');
          setProcessing(false);
        },
        onClose: function() {
          console.log('Snap popup closed');
          alert('⚠️ Popup pembayaran ditutup. Cek "My Orders" untuk melanjutkan.');
          setProcessing(false);
          router.push('/customer/orders');
        }
      });
    }
  } catch (error: any) {
    console.error('❌ Checkout error:', error);
    alert('❌ Gagal memproses checkout: ' + (error.response?.data?.message || ''));
    setProcessing(false);
  }
};
```

**D. Updated button:**
```tsx
<button
  onClick={handleProceedToPayment}
  disabled={processing}
  className="..."
>
  {processing ? 'Processing...' : 'Pay Now'}
</button>
```

---

## 🎯 Snap Popup Callbacks

### 1. **onSuccess**
Dipanggil saat payment berhasil (rare di Snap, biasanya onPending dulu).

**Action:**
- Redirect ke order status page
- Status page akan polling untuk confirm settlement

```tsx
onSuccess: function(result) {
  console.log('Payment success:', result);
  router.push(`/orders/${order.order_number}/status`);
}
```

---

### 2. **onPending**
Dipanggil saat payment **pending** (menunggu konfirmasi).

**Use Cases:**
- ✅ QRIS: User scan QR code → status pending
- ✅ Virtual Account: User dapat VA number → status pending
- ✅ GoPay/ShopeePay: User deeplink to app → status pending

**Action:**
- Redirect ke order status page
- Polling akan check status sampai settlement

```tsx
onPending: function(result) {
  console.log('Payment pending:', result);
  router.push(`/orders/${order.order_number}/status`);
}
```

---

### 3. **onError**
Dipanggil saat terjadi error (network issue, invalid token, dll).

**Action:**
- Alert error message
- Set processing = false (enable button lagi)
- User bisa retry

```tsx
onError: function(result) {
  console.error('Payment error:', result);
  alert('❌ Pembayaran gagal. Silakan coba lagi.');
  setProcessing(false);
}
```

---

### 4. **onClose**
Dipanggil saat user **close popup** tanpa complete payment.

**Scenarios:**
- User click X atau tombol Back
- User keluar dari popup sebelum bayar

**Action:**
- Alert user bahwa pembayaran belum selesai
- Redirect ke Customer Orders page
- Order masih status "pending" bisa dilanjutkan nanti

```tsx
onClose: function() {
  console.log('Snap popup closed');
  alert('⚠️ Popup pembayaran ditutup. Cek "My Orders" untuk melanjutkan pembayaran.');
  setProcessing(false);
  router.push('/customer/orders');
}
```

---

## 🔌 Backend API Requirements

### Checkout Endpoint

```http
POST /api/customer/checkout
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+628123456789",
  "address": "Jl. Sudirman No. 123",
  "city": "Jakarta",
  "district": "Tanah Abang",
  "sub_district": "Petamburan",
  "postal_code": "10260",
  "notes": "Pengiriman siang hari",
  "voucher_code": "WEDDINGNEWYEAR"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": 1,
      "order_number": "ORD-1765117681-C81E72",
      "user_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "total": 57600000,
      "status": "pending",
      "created_at": "2024-12-07T15:30:00.000000Z"
    },
    "snap_token": "66e4fa55-fdac-4ef9-91b5-733b97d1b862",
    "client_key": "SB-Mid-client-abc123xyz"
  }
}
```

**Important:**
- ✅ `snap_token` harus ada di response
- ✅ `order.order_number` digunakan untuk redirect
- ✅ Backend must call Midtrans Snap API untuk generate token
- ✅ Order status initial: `pending`

---

## 🧪 Sandbox Testing

### Step-by-Step Testing:

#### 1. **Checkout Process**
```
1. Add decoration to cart
2. Go to checkout
3. Fill form personal details & shipping
4. Click "Pay Now"
5. Verify: Midtrans popup muncul ✅
```

#### 2. **Test QRIS Payment**
```
1. Di popup, pilih "QRIS"
2. QR Code muncul (fake QR di sandbox)
3. JANGAN tutup popup
4. Buka tab baru: https://dashboard.sandbox.midtrans.com/
5. Login → Transactions → Find order
6. Click order → "Simulate Payment" → Success
7. Kembali ke popup (auto close) atau redirect
8. Verify: Redirect ke Order Status page ✅
9. Verify: Polling detect status "settlement" ✅
```

#### 3. **Test Virtual Account**
```
1. Di popup, pilih bank (BCA/BNI/Mandiri/dll)
2. VA number muncul (fake VA di sandbox)
3. Copy VA number (optional)
4. Go to Midtrans dashboard → Simulate Payment
5. Verify: Status berubah "settlement"
6. Verify: Order status "paid" di dashboard
```

#### 4. **Test Credit Card**
```
Test Card Number: 4811 1111 1111 1114
CVV: 123
Expiry: 01/25 (any future date)
OTP: 112233

1. Di popup, pilih "Credit Card"
2. Input test card number
3. Input CVV & expiry
4. Submit → OTP page
5. Input OTP: 112233
6. Payment success (instant settlement)
7. Verify: Redirect ke status page
```

#### 5. **Test Popup Close (onClose)**
```
1. Click "Pay Now"
2. Popup muncul
3. Click X atau Back button
4. Verify: Alert muncul "Popup pembayaran ditutup"
5. Verify: Redirect ke Customer Orders ✅
6. Verify: Order masih ada dengan status "pending"
```

---

## 🎨 UI/UX Changes

### Before (Old Approach):
```
Checkout → Custom Modal dengan 2 buttons:
  [Bank Transfer (VA)]
  [QRIS]
→ User pilih → POST dengan payment_type → Success
```

**Problems:**
- ❌ Limited payment methods (hanya VA dan QRIS)
- ❌ User tidak bisa lihat detail payment (VA number, QR code, dll)
- ❌ Harus implement custom UI untuk setiap payment method

---

### After (Snap Popup):
```
Checkout → Click "Pay Now" → Midtrans Popup
  ├─ QRIS (all banks)
  ├─ BCA VA
  ├─ BNI VA
  ├─ BRI VA
  ├─ Mandiri Bill
  ├─ Permata VA
  ├─ GoPay
  ├─ ShopeePay
  ├─ Credit Card
  ├─ Akulaku
  └─ Kredivo
→ User pilih di popup → Complete payment → Success
```

**Benefits:**
- ✅ 10+ payment methods available
- ✅ Official Midtrans UI (trusted)
- ✅ Auto show VA number, QR code, deeplink
- ✅ Mobile responsive (full screen di mobile)
- ✅ Support deeplink untuk e-wallet
- ✅ No custom UI needed untuk payment details

---

## 🔧 Configuration

### Development (.env.local):
```env
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_SANDBOX_KEY
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Production (.env.production):
```env
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-YOUR_PRODUCTION_KEY
NEXT_PUBLIC_API_URL=https://api.yourapp.com/api
```

**Script URL:**
- Sandbox: `https://app.sandbox.midtrans.com/snap/snap.js`
- Production: `https://app.midtrans.com/snap/snap.js`

**Change in `app/layout.tsx`:**
```tsx
<script
  src={process.env.NODE_ENV === 'production' 
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js"}
  data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
></script>
```

---

## 📱 Mobile Support

Midtrans Snap automatically responsive:

### Desktop:
- Modal popup overlay
- Width: 600px
- Centered

### Mobile:
- Full screen overlay
- Native mobile layout
- Swipe gestures support

### E-Wallet (GoPay/ShopeePay):
- Auto deeplink ke app jika installed
- Fallback ke QR code jika app tidak installed

---

## ⚠️ Common Issues & Solutions

### 1. "snap is not defined"
**Cause:** Snap.js belum load

**Solution:**
```tsx
if (typeof window.snap === 'undefined') {
  alert('Payment system not loaded. Please refresh the page.');
  return;
}
```

**Prevention:**
- Ensure script di `<head>` tag (not in `<body>`)
- Check network tab untuk verify script loaded
- Add error boundary untuk catch script load errors

---

### 2. "snap_token is missing"
**Cause:** Backend tidak return snap_token

**Solution di Frontend:**
```tsx
if (!snap_token) {
  alert('❌ Backend tidak mengembalikan snap_token');
  console.error('Response:', response.data);
  return;
}
```

**Check Backend:**
- Verify Midtrans credentials di `.env` backend
- Check Midtrans Snap API call
- Verify server_key valid
- Check error logs

---

### 3. Popup tidak muncul
**Cause:** Invalid snap_token atau expired

**Debug:**
```tsx
console.log('Opening Snap popup with token:', snap_token);
window.snap.pay(snap_token, {
  onError: function(result) {
    console.error('Snap error:', result);
  }
});
```

**Solutions:**
- Generate new snap_token (token expired setelah 1 jam)
- Check token format (UUID format)
- Verify client_key match dengan server_key di backend

---

### 4. Payment pending forever
**Cause:** Tidak simulate payment di dashboard (sandbox mode)

**Solution:**
1. Go to https://dashboard.sandbox.midtrans.com/
2. Menu: Transactions → Transaction List
3. Find order by order_number
4. Click order → "Simulate Payment" → Success

**Notes:**
- Di sandbox, payment tidak real
- Harus manual simulate di dashboard
- Di production, payment real (tidak perlu simulate)

---

### 5. Order status tidak update
**Cause:** Backend tidak handle Midtrans notification

**Backend Requirements:**
- Setup notification URL di Midtrans dashboard
- Handle POST webhook dari Midtrans
- Update order status based on transaction_status
- Verify signature untuk security

**Notification URL:**
```
https://yourdomain.com/api/midtrans/notification
```

---

## 📊 Status Mapping

### Midtrans Transaction Status → Order Status

| Midtrans Status | Order Status | Description |
|-----------------|--------------|-------------|
| `pending` | `pending` | Menunggu pembayaran |
| `settlement` | `paid` | Pembayaran berhasil (VA, QRIS, E-wallet) |
| `capture` | `paid` | Pembayaran berhasil (Credit Card) |
| `deny` | `failed` | Pembayaran ditolak |
| `cancel` | `cancelled` | Pembayaran dibatalkan user |
| `expire` | `failed` | Pembayaran expired (tidak dibayar) |

---

## 🚀 Production Checklist

- [ ] Update `.env.production` dengan production client_key
- [ ] Change Snap.js URL ke production
- [ ] Test dengan real payment (small amount)
- [ ] Setup Midtrans notification webhook
- [ ] Verify webhook signature
- [ ] Setup monitoring untuk failed payments
- [ ] Add analytics tracking
- [ ] Test all payment methods
- [ ] Test mobile responsive
- [ ] Test deeplink untuk e-wallet
- [ ] Add retry mechanism untuk failed payments
- [ ] Setup email notification untuk payment success/failed

---

## 📝 Summary

### Changes Made:

1. **app/layout.tsx**
   - ✅ Added Midtrans Snap.js script

2. **app/checkout/page.tsx**
   - ✅ Removed custom payment modal
   - ✅ Integrated Snap popup
   - ✅ Added snap.pay() with callbacks
   - ✅ Changed button to "Pay Now"

3. **.env.example**
   - ✅ Added NEXT_PUBLIC_MIDTRANS_CLIENT_KEY template

4. **Order Dashboard**
   - ✅ Fixed API integration (separate README)

### Flow Summary:

```
Cart → Checkout Form → Pay Now → Snap Popup → Select Payment 
→ Complete Payment → Redirect to Status Page → Polling Status 
→ Settlement → Order Success ✅
```

---

**Happy Coding! 🎉**

Untuk testing sandbox, jangan lupa simulate payment di Midtrans dashboard!
