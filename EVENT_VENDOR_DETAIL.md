# Event & Vendor Detail Pages

## Overview
Menambahkan halaman detail untuk Event dan Vendor dengan dynamic routing menggunakan slug.

## Routes yang Ditambahkan

### 1. Event Detail Page
**Route:** `/event/[slug]`
**File:** `app/event/[slug]/page.tsx`

**Format Slug:** `{id}-{title-slug}`
- Example: `123-wedding-expo-jakarta-2025`

**Features:**
- Hero banner image
- Event title & category badge
- Full description
- Date & time information
- Location with icon
- RSVP call-to-action button
- Social share buttons (Facebook, WhatsApp)
- Breadcrumb navigation
- Back to events list button

**API Endpoint:** `GET /public/events/{id}`

### 2. Vendor Detail Page
**Route:** `/vendor/[slug]`
**File:** `app/vendor/[slug]/page.tsx`

**Format Slug:** `{id}-{name-slug}`
- Example: `45-tiffany-photography`

**Features:**
- Image gallery with thumbnails
- Vendor category badge
- Star rating display
- Full description
- Contact information (address, phone, email, website, Instagram)
- Action buttons (Contact & Share)
- Breadcrumb navigation
- Back to home button

**API Endpoint:** `GET /public/vendors/{id}`

## Updated Components

### 1. Event List Page (`app/event/page.tsx`)
**Changes:**
- Added `generateSlug()` function
- Updated buttons to show "Lihat Detail" and "RSVP Event" separately
- Added Link to detail page

### 2. VendorSection Component (`components/sections/VendorSection.tsx`)
**Changes:**
- Added `generateSlug()` function
- Wrapped vendor cards with Link component
- Added hover effects (scale image, color change)
- Made entire card clickable

## Slug Generation

```typescript
// Event Slug
const generateSlug = (event: Event) => {
  const titleSlug = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${event.id}-${titleSlug}`;
};

// Vendor Slug
const generateSlug = (vendor: VendorCard) => {
  const nameSlug = vendor.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${vendor.id}-${nameSlug}`;
};
```

## Data Requirements

### Event Detail API Response
```json
{
  "data": {
    "id": 123,
    "title": "Wedding Expo Jakarta 2025",
    "start_date": "2025-12-15T10:00:00Z",
    "end_date": "2025-12-17T18:00:00Z",
    "location": "Jakarta Convention Center",
    "description": "Full event description...",
    "banner_image": "storage/events/banner.jpg",
    "link_url": "https://rsvp.example.com",
    "created_at": "2025-12-01T00:00:00Z"
  }
}
```

### Vendor Detail API Response
```json
{
  "data": {
    "id": 45,
    "name": "Tiffany Photography",
    "category": "Fotografi",
    "description": "Professional wedding photography...",
    "address": "Jl. Sudirman No. 123, Jakarta",
    "phone": "+62812345678",
    "email": "info@tiffany.com",
    "website": "www.tiffany.com",
    "instagram": "@tiffanyphoto",
    "rating": 4.8,
    "images": [
      { "id": 1, "image": "storage/vendors/1.jpg" },
      { "id": 2, "image": "storage/vendors/2.jpg" }
    ],
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

## UI/UX Features

### Event Detail
- Responsive layout (2-column on desktop)
- Sticky sidebar with RSVP CTA
- Beautiful gradient buttons
- Social sharing integration
- Date formatting (Indonesia locale)
- Loading & error states

### Vendor Detail
- Image gallery with thumbnail navigation
- Selected image highlight
- Rating stars visualization
- Contact information with icons
- Clickable phone, email, website, Instagram
- Responsive grid layout
- Hover effects on gallery
- Loading & error states

## Navigation Flow

### Event:
1. Home → Event List
2. Event List → Event Detail (click card)
3. Event Detail → RSVP (external link)
4. Event Detail → Back to Event List

### Vendor:
1. Home → Vendor Section
2. Vendor Section → Vendor Detail (click card)
3. Vendor Detail → Contact actions
4. Vendor Detail → Back to Home

## SEO Friendly
- Slugs contain readable titles/names
- ID at the beginning ensures uniqueness
- Clean URLs without special characters
- Breadcrumb navigation for better UX

## Error Handling
- 404 handling for non-existent IDs
- Loading states with spinners
- Error messages with back links
- Fallback for missing images
- Empty state handling

## Mobile Responsive
- All pages fully responsive
- Touch-friendly buttons
- Optimized image sizes
- Readable text on small screens
- Easy navigation
