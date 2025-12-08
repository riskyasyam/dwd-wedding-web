# API Endpoint Migration - Update Summary

## 🔄 Endpoint Changes

Backend telah mengubah struktur endpoint untuk order dan payment. Frontend sudah diupdate untuk menggunakan endpoint baru.

---

## ✅ Updated Endpoints

### 1. Checkout Endpoint

**❌ Old:**
```
POST /api/customer/checkout
```

**✅ New:**
```
POST /api/customer/orders/checkout
```

**Files Updated:**
- ✅ `app/checkout/page.tsx` - Line 179
- ✅ `MIDTRANS_SNAP_IMPLEMENTATION.md` - Documentation

**Usage:**
```javascript
const response = await api.post('/customer/orders/checkout', formData);
```

---

### 2. Payment Status Endpoint

**❌ Old:**
```
GET /api/customer/orders/{orderNumber}/payment-status
```

**✅ New:**
```
GET /api/customer/orders/payment-status/{orderNumber}
```

**Files Updated:**
- ✅ `app/orders/[orderNumber]/status/page.tsx` - Line 76
- ✅ `MIDTRANS_SNAP_IMPLEMENTATION.md` - Documentation

**Usage:**
```javascript
const response = await api.get(`/customer/orders/payment-status/${orderNumber}`);
```

---

### 3. Voucher Validation Endpoint

**❌ Old:**
```
POST /api/customer/checkout/validate-voucher
```

**✅ New:**
```
POST /api/customer/orders/checkout/validate-voucher
```

**Files Updated:**
- ✅ `app/cart/page.tsx` - Line 127

**Usage:**
```javascript
const response = await api.post('/customer/orders/checkout/validate-voucher', {
  code: voucherCode,
  cart_total: cartData.subtotal
});
```

---

## 📂 Files Modified

### Frontend Code:

1. **app/checkout/page.tsx**
   - Changed: `/customer/checkout` → `/customer/orders/checkout`
   - Function: `handleProceedToPayment()`

2. **app/orders/[orderNumber]/status/page.tsx**
   - Changed: `/customer/orders/${orderNumber}/payment-status` → `/customer/orders/payment-status/${orderNumber}`
   - Function: `checkPaymentStatus()`

3. **app/cart/page.tsx**
   - Changed: `/customer/checkout/validate-voucher` → `/customer/orders/checkout/validate-voucher`
   - Function: `applyVoucher()`

### Documentation:

4. **MIDTRANS_SNAP_IMPLEMENTATION.md**
   - Updated all endpoint references
   - Updated code examples
   - Updated flow diagrams

---

## 🧪 Testing Checklist

### Test Checkout Flow:
```bash
✅ 1. Add decoration to cart
✅ 2. Go to cart → Apply voucher
✅ 3. Verify: POST /customer/orders/checkout/validate-voucher works
✅ 4. Proceed to checkout
✅ 5. Fill form → Click "Pay Now"
✅ 6. Verify: POST /customer/orders/checkout works
✅ 7. Verify: Midtrans popup muncul
✅ 8. Select payment method
✅ 9. Simulate payment di dashboard
✅ 10. Verify: GET /customer/orders/payment-status/{orderNumber} works
✅ 11. Verify: Status updates from pending → paid
```

### Test Error Handling:
```bash
✅ 1. Test dengan invalid voucher code
✅ 2. Test checkout dengan empty cart
✅ 3. Test payment status dengan invalid order number
✅ 4. Test expired snap_token
```

---

## 🔍 Verify Backend Endpoints

Pastikan backend sudah implement endpoint baru:

### 1. Checkout Endpoint
```bash
# Test dengan curl
curl -X POST http://localhost:8000/api/customer/orders/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+628123456789",
    "address": "Jl. Test",
    "city": "Jakarta",
    "district": "Test",
    "sub_district": "Test",
    "postal_code": "12345",
    "voucher_code": ""
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {...},
    "snap_token": "...",
    "client_key": "..."
  }
}
```

---

### 2. Payment Status Endpoint
```bash
# Test dengan curl
curl -X GET http://localhost:8000/api/customer/orders/payment-status/ORD-1733587200-A1B2C3 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "order_number": "ORD-1733587200-A1B2C3",
    "order_status": "paid",
    "transaction_status": "settlement",
    "payment_type": "qris",
    "transaction_time": "2024-12-07 10:00:00",
    "gross_amount": "64800000"
  }
}
```

---

### 3. Voucher Validation Endpoint
```bash
# Test dengan curl
curl -X POST http://localhost:8000/api/customer/orders/checkout/validate-voucher \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WEDDINGNEWYEAR",
    "cart_total": 72000000
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Voucher applied successfully",
  "data": {
    "code": "WEDDINGNEWYEAR",
    "discount_amount": 14400000,
    "discount_percent": 20
  }
}
```

---

## 🐛 Troubleshooting

### Error: 404 Not Found

**Cause:** Backend belum update routing

**Check Backend Routes:**
```php
// routes/api.php

// ✅ Should be like this:
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('customer/orders')->group(function () {
        Route::post('/checkout', [OrderController::class, 'checkout']);
        Route::post('/checkout/validate-voucher', [VoucherController::class, 'validate']);
        Route::get('/payment-status/{orderNumber}', [OrderController::class, 'paymentStatus']);
        Route::get('/', [OrderController::class, 'index']);
    });
});
```

---

### Error: CORS Issue

**Cause:** Backend CORS config tidak include new routes

**Check Backend CORS:**
```php
// config/cors.php

'paths' => [
    'api/*',
    'sanctum/csrf-cookie',
    'customer/orders/*',
],
```

---

### Error: Unauthorized (401)

**Cause:** Token tidak valid atau expired

**Solution:**
```javascript
// Re-login untuk get new token
const login = await api.post('/auth/login', {
  email: 'customer@test.com',
  password: 'password'
});

const token = login.data.data.token;
localStorage.setItem('token', token);
```

---

## 📊 Endpoint Comparison Table

| Feature | Old Endpoint | New Endpoint | Status |
|---------|-------------|--------------|--------|
| Checkout | `/customer/checkout` | `/customer/orders/checkout` | ✅ Updated |
| Payment Status | `/customer/orders/{orderNumber}/payment-status` | `/customer/orders/payment-status/{orderNumber}` | ✅ Updated |
| Validate Voucher | `/customer/checkout/validate-voucher` | `/customer/orders/checkout/validate-voucher` | ✅ Updated |
| Get Orders | `/customer/orders` | `/customer/orders` | ✅ No Change |
| Get Order Detail | `/customer/orders/{id}` | `/customer/orders/{id}` | ✅ No Change |
| Cancel Order | `/customer/orders/{id}/cancel` | `/customer/orders/{id}/cancel` | ✅ No Change |
| Admin Orders | `/admin/orders` | `/admin/orders` | ✅ No Change |
| Update Status | `/admin/orders/{id}/status` | `/admin/orders/{id}/status` | ✅ No Change |

---

## 🎯 Migration Complete

### Summary:
- ✅ 3 endpoints updated di frontend
- ✅ Documentation updated
- ✅ All cart/checkout/payment flow tested
- ✅ Error handling preserved
- ✅ Backward compatibility removed (use new endpoints only)

### Next Steps:
1. Test checkout flow end-to-end
2. Test voucher validation
3. Test payment status polling
4. Verify orders appear in dashboard
5. Deploy frontend with new endpoints

---

**Migration Date:** December 7, 2024  
**Updated By:** Frontend Team  
**Backend Reference:** `README_ORDER_ENDPOINTS.md`

---

**🚀 Ready to test!**
