# Dashboard Backend Endpoint

## Endpoint yang Dibutuhkan

### GET `/api/admin/dashboard/stats`

Endpoint ini akan mengembalikan semua statistik dashboard dalam satu request untuk efisiensi.

**Response Format:**
```json
{
  "total_revenue": 0,
  "total_orders": 0,
  "pending_orders": 0,
  "completed_orders": 0,
  "total_customers": 0,
  "total_vendors": 0,
  "total_decorations": 0,
  "total_events": 0,
  "total_vouchers": 0,
  "total_testimonials": 0,
  "total_galleries": 0,
  "total_inspirations": 0
}
```

## Fallback Mechanism

Jika endpoint `/api/admin/dashboard/stats` belum dibuat, frontend akan otomatis menggunakan fallback dengan cara:

1. Fetch semua data dari endpoint individual:
   - `/api/admin/orders`
   - `/api/admin/customers`
   - `/api/admin/vendors`
   - `/api/admin/decorations`
   - `/api/admin/events`
   - `/api/admin/vouchers`
   - `/api/admin/reviews`
   - `/api/admin/galleries`
   - `/api/admin/inspirations`

2. Menghitung statistik di frontend:
   - Total Revenue: Sum of completed orders' total
   - Pending Orders: Count orders with status 'pending'
   - Completed Orders: Count orders with status 'completed'
   - Other counts: Length of each data array

## Implementasi Backend (Laravel Example)

```php
// app/Http/Controllers/Admin/DashboardController.php

public function stats()
{
    $orders = Order::all();
    $completedOrders = $orders->where('status', 'completed');
    
    return response()->json([
        'total_revenue' => $completedOrders->sum('total'),
        'total_orders' => $orders->count(),
        'pending_orders' => $orders->where('status', 'pending')->count(),
        'completed_orders' => $completedOrders->count(),
        'total_customers' => User::where('role', 'customer')->count(),
        'total_vendors' => Vendor::count(),
        'total_decorations' => Decoration::count(),
        'total_events' => Event::count(),
        'total_vouchers' => Voucher::count(),
        'total_testimonials' => Review::count(),
        'total_galleries' => Gallery::count(),
        'total_inspirations' => Inspiration::count(),
    ]);
}
```

## Route

```php
// routes/api.php

Route::middleware(['auth:sanctum', 'check.token.expiration'])->group(function () {
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('dashboard/stats', [DashboardController::class, 'stats']);
    });
});
```

## Features Dashboard

### Main Stats Cards (8 cards in grid):
1. **Total Revenue** - Total pendapatan dari completed orders
2. **Total Orders** - Jumlah semua orders dengan info pending
3. **Customers** - Total registered users
4. **Vendors** - Total vendor partners
5. **Decorations** - Total decoration packages
6. **Events** - Total event categories
7. **Vouchers** - Total active vouchers
8. **Testimonials** - Total customer reviews

### Quick Overview (3 cards):
1. **Gallery Items** - Total media in gallery
2. **Inspirations** - Total inspiration posts
3. **Pending Orders** - Orders that need attention

### Interactive Features:
- ✅ Each stat card is clickable and navigates to respective management page
- ✅ Hover effects on cards
- ✅ Responsive design (mobile-first)
- ✅ Real-time data from backend
- ✅ Automatic fallback if main endpoint unavailable
- ✅ Currency formatting for revenue (IDR)
- ✅ Loading state while fetching data

## Data Update

Dashboard akan fetch data setiap kali page di-load. Untuk real-time updates, bisa tambahkan:
- Auto-refresh dengan interval (polling)
- WebSocket untuk real-time updates
- Manual refresh button
