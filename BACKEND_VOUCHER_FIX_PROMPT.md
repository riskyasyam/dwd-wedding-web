# Backend Fix Prompt - Voucher Double Discount Issue

## Masalah
Order checkout mengirim total yang salah ke Midtrans. Harusnya Rp 36.000.000 tapi jadi Rp 32.000.000 meskipun user tidak apply voucher.

## Analisa
1. Produk base price: Rp 40.000.000
2. Admin set decoration discount 10%: Rp 40.000.000 - Rp 4.000.000 = **Rp 36.000.000** (ini harga jual)
3. User TIDAK apply voucher di cart
4. Frontend kirim request checkout TANPA field `voucher_code`
5. Backend response: `total_price = Rp 32.000.000` (SALAH - terpotong lagi Rp 4.000.000)
6. Midtrans popup show: Rp 32.000.000

## Kemungkinan Masalah di Backend

### 1. Voucher Auto-Applied meskipun tidak ada `voucher_code`

**File: App/Http/Controllers/Customer/OrderController.php (atau sejenisnya)**

```php
// SALAH - Auto apply voucher
public function checkout(Request $request) {
    // ...
    
    // BUG: Selalu ambil voucher dari database tanpa cek request
    $voucher = Voucher::where('is_active', true)->first();
    if ($voucher) {
        $discount = $voucher->discount_amount;
        $total = $cartTotal - $discount; // DOUBLE DISCOUNT!
    }
    
    // ...
}
```

**FIX:**
```php
public function checkout(Request $request) {
    // ...
    
    $discount = 0;
    
    // HANYA apply voucher jika ada voucher_code dari request
    if ($request->has('voucher_code') && !empty($request->voucher_code)) {
        $voucher = Voucher::where('code', $request->voucher_code)
            ->where('is_active', true)
            ->first();
            
        if ($voucher) {
            $discount = $voucher->discount_amount;
            Log::info('Voucher applied', [
                'code' => $request->voucher_code,
                'discount' => $discount
            ]);
        }
    } else {
        Log::info('No voucher code in request - discount = 0');
    }
    
    // Calculate total
    $total = $cartTotal - $discount;
    
    Log::info('Order total calculation', [
        'cart_total' => $cartTotal,
        'voucher_discount' => $discount,
        'final_total' => $total
    ]);
    
    // ...
}
```

### 2. Decoration Discount Dihitung 2x

**SALAH:**
```php
// Get cart with decorations
$cart = Cart::with('decoration')->where('user_id', $user->id)->get();

$subtotal = 0;
foreach ($cart as $item) {
    // BUG: decoration sudah punya discounted_price, tapi di-discount lagi
    $decorationPrice = $item->decoration->discounted_price; // Sudah 36jt (after 10%)
    $decorationPrice = $decorationPrice * 0.9; // DISCOUNT LAGI! Jadi 32.4jt
    $subtotal += $decorationPrice;
}
```

**FIX:**
```php
$cart = Cart::with('decoration')->where('user_id', $user->id)->get();

$subtotal = 0;
foreach ($cart as $item) {
    // Gunakan harga yang sudah di-discount (atau price jika tidak ada discount)
    $decorationPrice = $item->decoration->discounted_price ?? $item->decoration->price;
    
    // JANGAN discount lagi - sudah final price
    $subtotal += $decorationPrice;
    
    Log::info('Cart item', [
        'decoration_id' => $item->decoration_id,
        'original_price' => $item->decoration->price,
        'discounted_price' => $item->decoration->discounted_price,
        'used_price' => $decorationPrice
    ]);
}
```

### 3. Midtrans gross_amount Salah

**File: App/Services/MidtransService.php**

```php
// SALAH - Hardcode discount
public function createSnapToken($order) {
    $grossAmount = $order->total_price;
    
    // BUG: Potong lagi di sini
    $grossAmount = $grossAmount * 0.9; // JANGAN!
    
    $params = [
        'transaction_details' => [
            'order_id' => $order->order_number,
            'gross_amount' => $grossAmount // Salah!
        ],
        // ...
    ];
}
```

**FIX:**
```php
public function createSnapToken($order) {
    // Gunakan total dari order AS IS - sudah final
    $grossAmount = $order->total_price;
    
    Log::info('Creating Midtrans Snap token', [
        'order_number' => $order->order_number,
        'gross_amount' => $grossAmount,
        'order_total' => $order->total_price
    ]);
    
    $params = [
        'transaction_details' => [
            'order_id' => $order->order_number,
            'gross_amount' => (int) $grossAmount // Pastikan integer
        ],
        // ...
    ];
    
    // ...
}
```

## Cara Debug Backend

### 1. Tambahkan Logging di OrderController

```php
public function checkout(Request $request) {
    Log::info('=== CHECKOUT REQUEST ===', [
        'request_data' => $request->all(),
        'has_voucher_code' => $request->has('voucher_code'),
        'voucher_code_value' => $request->voucher_code ?? 'NULL'
    ]);
    
    // ... proses checkout
    
    Log::info('=== CHECKOUT CALCULATION ===', [
        'cart_subtotal' => $cartSubtotal,
        'voucher_discount' => $voucherDiscount,
        'final_total' => $finalTotal,
        'decoration_details' => $cart->map(function($item) {
            return [
                'name' => $item->decoration->name,
                'original_price' => $item->decoration->price,
                'discounted_price' => $item->decoration->discounted_price,
                'used_price' => $item->decoration->discounted_price ?? $item->decoration->price
            ];
        })
    ]);
    
    // ... create order & midtrans
    
    Log::info('=== MIDTRANS SNAP TOKEN ===', [
        'order_number' => $order->order_number,
        'order_total_price' => $order->total_price,
        'gross_amount_sent_to_midtrans' => $grossAmount
    ]);
}
```

### 2. Cek Laravel Logs

```bash
tail -f storage/logs/laravel.log
```

### 3. Expected Logs (Tanpa Voucher)

```
[INFO] === CHECKOUT REQUEST ===
{
    "request_data": {
        "first_name": "John",
        "last_name": "Doe",
        // ... NO voucher_code field
    },
    "has_voucher_code": false,
    "voucher_code_value": "NULL"
}

[INFO] === CHECKOUT CALCULATION ===
{
    "cart_subtotal": 36000000,
    "voucher_discount": 0,  // MUST be 0!
    "final_total": 36000000,  // MUST be 36jt!
    "decoration_details": [
        {
            "name": "PURE ELEGANCE 9",
            "original_price": 40000000,
            "discounted_price": 36000000,
            "used_price": 36000000
        }
    ]
}

[INFO] === MIDTRANS SNAP TOKEN ===
{
    "order_number": "ORD-1234567890",
    "order_total_price": 36000000,
    "gross_amount_sent_to_midtrans": 36000000  // MUST be 36jt!
}
```

### 4. Expected Logs (Dengan Voucher)

```
[INFO] === CHECKOUT REQUEST ===
{
    "request_data": {
        "first_name": "John",
        "voucher_code": "WEDDINGNEWYEAR"  // Ada voucher
    },
    "has_voucher_code": true,
    "voucher_code_value": "WEDDINGNEWYEAR"
}

[INFO] Voucher applied
{
    "code": "WEDDINGNEWYEAR",
    "discount": 4000000
}

[INFO] === CHECKOUT CALCULATION ===
{
    "cart_subtotal": 36000000,
    "voucher_discount": 4000000,  // Voucher discount
    "final_total": 32000000,  // 36jt - 4jt
    "decoration_details": [
        {
            "name": "PURE ELEGANCE 9",
            "original_price": 40000000,
            "discounted_price": 36000000,
            "used_price": 36000000
        }
    ]
}

[INFO] === MIDTRANS SNAP TOKEN ===
{
    "order_number": "ORD-1234567890",
    "order_total_price": 32000000,
    "gross_amount_sent_to_midtrans": 32000000  // 32jt dengan voucher
}
```

## Checklist Backend Fix

- [ ] Voucher HANYA applied jika ada `voucher_code` di request
- [ ] Decoration price gunakan `discounted_price` (sudah final), JANGAN discount lagi
- [ ] Cart subtotal = sum of decoration's final prices
- [ ] Order total = cart subtotal - voucher discount (jika ada)
- [ ] Midtrans gross_amount = order total AS IS (tidak ada perhitungan tambahan)
- [ ] Log semua calculation steps
- [ ] Test tanpa voucher → Midtrans shows Rp 36.000.000
- [ ] Test dengan voucher → Midtrans shows Rp 32.000.000

## Testing Steps

1. **Clear all data:**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```

2. **Test tanpa voucher:**
   - Frontend kirim request tanpa `voucher_code`
   - Cek logs: voucher_discount = 0
   - Cek logs: final_total = 36000000
   - Cek Midtrans: gross_amount = 36000000

3. **Test dengan voucher:**
   - Frontend kirim request dengan `voucher_code: "WEDDINGNEWYEAR"`
   - Cek logs: voucher_discount = 4000000
   - Cek logs: final_total = 32000000
   - Cek Midtrans: gross_amount = 32000000

## Files Yang Perlu Diperiksa

1. `app/Http/Controllers/Customer/OrderController.php` - checkout method
2. `app/Services/MidtransService.php` - createSnapToken method
3. `app/Models/Order.php` - calculateTotal method (jika ada)
4. `database/migrations/*_create_decorations_table.php` - pastikan ada kolom discounted_price
5. `app/Http/Controllers/Admin/DecorationController.php` - pastikan discount disimpan ke discounted_price

## SQL Query untuk Cek Data

```sql
-- Cek decoration prices
SELECT id, name, price, discounted_price, discount_percentage 
FROM decorations 
WHERE id = [ID_DECORATION_YANG_BERMASALAH];

-- Expected result:
-- id | name | price | discounted_price | discount_percentage
-- 1 | PURE ELEGANCE 9 | 40000000 | 36000000 | 10

-- Cek vouchers
SELECT id, code, discount_amount, discount_type, is_active 
FROM vouchers 
WHERE is_active = 1;

-- Cek order yang bermasalah
SELECT order_number, subtotal, discount_amount, voucher_code, total_price 
FROM orders 
WHERE order_number = '[ORDER_NUMBER]';

-- Expected (tanpa voucher):
-- subtotal: 36000000, discount: 0, voucher_code: NULL, total: 36000000

-- Expected (dengan voucher):
-- subtotal: 36000000, discount: 4000000, voucher_code: 'WEDDINGNEWYEAR', total: 32000000
```

## Summary

**ROOT CAUSE:** Backend apply voucher discount meskipun frontend tidak kirim `voucher_code`, atau decoration price di-discount 2x.

**FIX:** 
1. HANYA apply voucher jika `$request->has('voucher_code') && !empty($request->voucher_code)`
2. Gunakan `decoration->discounted_price` AS IS (jangan discount lagi)
3. Midtrans `gross_amount` = `order->total_price` (no additional calculation)
4. Add comprehensive logging untuk trace calculation

**TEST:**
- Tanpa voucher → Rp 36.000.000
- Dengan voucher → Rp 32.000.000
