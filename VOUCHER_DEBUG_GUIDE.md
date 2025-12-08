# Panduan Debug Voucher & Harga Checkout

## Masalah
Harga di Midtrans popup terpotong (32jt) padahal seharusnya 36jt tanpa voucher.

## Alur Yang Benar

1. **Tanpa Voucher:**
   - Harga produk: Rp 40.000.000
   - Admin discount (10%): -Rp 4.000.000
   - **Total yang dibayar: Rp 36.000.000** ✅

2. **Dengan Voucher (jika user apply):**
   - Harga produk: Rp 40.000.000
   - Admin discount (10%): -Rp 4.000.000
   - Voucher discount: -Rp 4.000.000 (atau sesuai voucher)
   - **Total yang dibayar: Rp 32.000.000** ✅

## Yang Sudah Diperbaiki di Frontend (app/checkout/page.tsx)

### 1. Voucher TIDAK dikirim ke backend jika tidak ada discount
```typescript
// SEBELUM (SALAH):
const checkoutData = {
  ...formData,
  voucher_code: voucherDiscount > 0 ? formData.voucher_code : '' // Masih kirim string kosong
};

// SESUDAH (BENAR):
const checkoutData: any = {
  first_name: formData.first_name,
  // ... field lainnya
};

// HANYA tambahkan voucher_code jika ada discount
if (voucherDiscount > 0 && formData.voucher_code) {
  checkoutData.voucher_code = formData.voucher_code;
}
// Jika tidak ada discount, field voucher_code TIDAK ADA di request
```

### 2. Konfirmasi Sebelum Bayar dengan Voucher
Sebelum membuka Midtrans popup, user akan diminta konfirmasi jika ada voucher:
```
⚠️ VOUCHER ACTIVE

Voucher: WEDDINGNEWYEAR
Discount: Rp 4.000.000
Total to pay: Rp 32.000.000

Proceed with voucher discount?

Click OK to continue with voucher
Click Cancel to remove voucher
```

### 3. Console Logs untuk Debug
Buka browser console (F12) saat checkout, akan muncul:
```
🔍 Checking localStorage for voucher: {...}
✅ VOUCHER APPLIED: WEDDINGNEWYEAR Discount: 4000000
ATAU
❌ NO VOUCHER - voucher_code field NOT included in request

=== CHECKOUT REQUEST DATA ===
Sending to backend: {
  "first_name": "John",
  ...
  // voucher_code: hanya ada jika voucher aktif
}
Cart subtotal: 36000000
Voucher discount: 4000000 (atau 0 jika tidak ada)
Calculated total: 32000000 (atau 36000000)
Has voucher_code in request? true/false
============================
```

## Cara Test Frontend

### Test 1: Checkout TANPA Voucher
1. Buka cart page
2. **JANGAN** apply voucher
3. Klik checkout
4. Di checkout page, pastikan:
   - ❌ TIDAK ada green alert "Voucher applied"
   - Sidebar shows: Subtotal Rp 36.000.000
   - Total: Rp 36.000.000
5. Buka console (F12), pastikan:
   ```
   ℹ️ No voucher in localStorage
   ❌ NO VOUCHER - voucher_code field NOT included in request
   Has voucher_code in request? false
   ```
6. Klik "Pay Now"
7. **TIDAK** ada konfirmasi voucher
8. Midtrans popup harus show: **Rp 32.000.000** ✅ (atau Rp 36.000.000 jika backend benar)

### Test 2: Checkout DENGAN Voucher
1. Buka cart page
2. Apply voucher (misal: WEDDINGNEWYEAR)
3. Klik checkout
4. Di checkout page, pastikan:
   - ✅ Ada green alert "Voucher 'WEDDINGNEWYEAR' applied!"
   - Sidebar shows: 
     - Subtotal: Rp 36.000.000
     - Voucher: -Rp 4.000.000
     - Total: Rp 32.000.000
5. Buka console (F12), pastikan:
   ```
   ✅ Voucher loaded from localStorage: {code: "WEDDINGNEWYEAR", discount: 4000000}
   ✅ VOUCHER APPLIED: WEDDINGNEWYEAR Discount: 4000000
   Has voucher_code in request? true
   ```
6. Klik "Pay Now"
7. Muncul konfirmasi voucher
8. Klik OK
9. Midtrans popup harus show: **Rp 32.000.000** ✅

### Test 3: Remove Voucher
1. Di checkout page dengan voucher aktif
2. Klik "Remove voucher" (di green alert atau sidebar)
3. Alert: "Voucher removed. Total updated to original price."
4. Pastikan:
   - Green alert hilang
   - Total jadi Rp 36.000.000
5. Console shows:
   ```
   Removing voucher...
   ```
6. localStorage voucher terhapus

## Jika Masalah Masih Terjadi

### Cek LocalStorage
1. Buka DevTools (F12) → Application → Local Storage
2. Cek key `applied_voucher`
3. Jika ada dan tidak seharusnya ada, hapus manual
4. Refresh page

### Cek Request ke Backend
1. Buka DevTools (F12) → Network tab
2. Checkout → filter "checkout"
3. Klik request `/customer/orders/checkout`
4. Tab "Payload" atau "Request"
5. Cek apakah ada `voucher_code`:
   - **TIDAK ADA** = benar jika tidak pakai voucher
   - **Ada** = benar jika pakai voucher

### Cek Response dari Backend
1. Masih di Network tab
2. Klik response `/customer/orders/checkout`
3. Tab "Response"
4. Cek `data.order.total_price` atau `data.order.final_total`
5. Bandingkan dengan yang tampil di Midtrans

## Jika Frontend Sudah Benar Tapi Midtrans Masih Salah

Berarti masalahnya di **BACKEND**. Backend mungkin:
1. Tetap apply voucher meskipun `voucher_code` tidak ada di request
2. Menghitung total dengan voucher hardcoded
3. Midtrans `gross_amount` dihitung salah

### Langkah Selanjutnya untuk Backend

Lihat file: `BACKEND_VOUCHER_FIX_PROMPT.md`
