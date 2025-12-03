import api from './axios';

export class CRUDService<T> {
  constructor(protected endpoint: string) {}

  async getAll(params?: any) {
    const response = await api.get(this.endpoint, { params });
    return response.data;
  }

  async getById(id: number) {
    const response = await api.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: Partial<T> | FormData) {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    const response = await api.post(this.endpoint, data, config);
    return response.data;
  }

  async update(id: number, data: Partial<T> | FormData) {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    const response = await api.put(`${this.endpoint}/${id}`, data, config);
    return response.data;
  }

  async delete(id: number) {
    const response = await api.delete(`${this.endpoint}/${id}`);
    return response.data;
  }

  async uploadImages(id: number, files: File[], imageEndpoint: string = 'images') {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images[]', file);
    });

    const response = await api.post(`${this.endpoint}/${id}/${imageEndpoint}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async deleteImage(imageId: number, imageEndpoint: string = 'images') {
    const response = await api.delete(`${this.endpoint}/${imageEndpoint}/${imageId}`);
    return response.data;
  }
}

// Type definitions
export interface FreeItem {
  id: number;
  decoration_id: number;
  item_name: string;
  description?: string;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface Decoration {
  id: number;
  name: string;
  slug: string;
  category: string;
  region: string;
  description: string;
  base_price: number;
  discount_percent?: number;
  final_price: number;
  discount_start_date?: string;
  discount_end_date?: string;
  rating?: number;
  review_count?: number;
  is_deals: boolean;
  images?: DecorationImage[];
  freeItems?: FreeItem[];
}

export interface DecorationImage {
  id: number;
  decoration_id: number;
  image: string;
}

export interface Package {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  discount_percent?: number;
  final_price: number;
  discount_start_date?: string;
  discount_end_date?: string;
  is_popular: boolean;
  items?: PackageItem[];
}

export interface PackageItem {
  id?: number;
  package_id?: number;
  decoration_id: number;
  quantity: number;
  decoration?: Decoration;
}

export interface Event {
  id: number;
  title: string;
  slug: string;
  banner_image?: string;
  start_date: string;
  end_date: string;
  location: string;
  short_description: string;
  full_description: string;
  organizer?: string;
  images?: EventImage[];
}

export interface EventImage {
  id: number;
  event_id: number;
  image: string;
}

export interface Gallery {
  id: number;
  title: string;
  category: string;
  image_url: string;
  description?: string;
}

export interface Testimonial {
  id: number;
  user_id: number;
  content: string;
  rating: number;
  is_featured: boolean;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface Vendor {
  id: number;
  name: string;
  slug: string;
  category: string;
  email: string;
  phone: string;
  address?: string;
  description?: string;
  rating?: number;
  images?: VendorImage[];
}

export interface VendorImage {
  id: number;
  vendor_id: number;
  image: string;
}

export interface Voucher {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_discount?: number | null;
  usage_limit?: number | null;
  usage_count: number;
  usage_per_user: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Inspiration {
  id: number;
  title: string;
  image: string;
  colors: string[];
  location: string;
  liked_count: number;
  created_at: string;
  updated_at: string;
}

export interface Advertisement {
  id: number;
  title: string;
  image: string;
  description?: string;
  link_url?: string;
  order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

// Service instances
export const decorationService = new CRUDService<Decoration>('/admin/decorations');

// Free Items Service with custom endpoint structure
export class FreeItemsService {
  async getAll(decorationId: number) {
    const response = await api.get(`/admin/decorations/${decorationId}/free-items`);
    return response.data;
  }

  async create(decorationId: number, data: Partial<FreeItem>) {
    const response = await api.post(`/admin/decorations/${decorationId}/free-items`, data);
    return response.data;
  }

  async update(decorationId: number, id: number, data: Partial<FreeItem>) {
    const response = await api.put(`/admin/decorations/${decorationId}/free-items/${id}`, data);
    return response.data;
  }

  async delete(decorationId: number, id: number) {
    const response = await api.delete(`/admin/decorations/${decorationId}/free-items/${id}`);
    return response.data;
  }
}

export const freeItemsService = new FreeItemsService();
export const voucherService = new CRUDService<Voucher>('/admin/vouchers');
export const eventService = new CRUDService<Event>('/admin/events');
export const advertisementService = new CRUDService<Advertisement>('/admin/advertisements');
export const inspirationService = new CRUDService<Inspiration>('/admin/inspirations');
export const testimonialService = new CRUDService<Testimonial>('/admin/testimonials');
export const vendorService = new CRUDService<Vendor>('/admin/vendors');

export interface Customer {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerStatistics {
  total_customers: number;
  verified_customers: number;
  unverified_customers: number;
  new_customers_this_month: number;
}

export class CustomerService extends CRUDService<Customer> {
  async getStatistics() {
    const response = await api.get(`${this.endpoint}/statistics`);
    return response.data;
  }
}

export const customerService = new CustomerService('/admin/customers');
