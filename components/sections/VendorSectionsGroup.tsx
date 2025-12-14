'use client';

import { useState, useEffect } from 'react';
import VendorSection from './VendorSection';
import api, { getImageUrl } from '@/lib/axios';

interface Vendor {
  id: number;
  name: string;
  category: string;
  images?: { id: number; image: string }[];
  rating?: number;
}

export default function VendorSectionsGroup() {
  const [photographyVendors, setPhotographyVendors] = useState<Vendor[]>([]);
  const [videographyVendors, setVideographyVendors] = useState<Vendor[]>([]);
  const [makeupVendors, setMakeupVendors] = useState<Vendor[]>([]);
  const [attireVendors, setAttireVendors] = useState<Vendor[]>([]);
  const [entertainmentVendors, setEntertainmentVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorsByCategory = async () => {
      try {
        const timestamp = Date.now();
        const headers = { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' };
        
        // Fetch all categories in parallel
        const [photo, video, makeup, attire, entertainment] = await Promise.all([
          api.get('/public/vendors', { params: { category: 'Fotografi', per_page: 10, _t: timestamp }, headers }),
          api.get('/public/vendors', { params: { category: 'Videografi', per_page: 10, _t: timestamp }, headers }),
          api.get('/public/vendors', { params: { category: 'Make up / Hair & Hijab', per_page: 10, _t: timestamp }, headers }),
          api.get('/public/vendors', { params: { category: 'Attire', per_page: 10, _t: timestamp }, headers }),
          api.get('/public/vendors', { params: { category: 'Entertainment (Musik)', per_page: 10, _t: timestamp }, headers })
        ]);

        setPhotographyVendors(photo.data.data?.data || photo.data.data || []);
        setVideographyVendors(video.data.data?.data || video.data.data || []);
        setMakeupVendors(makeup.data.data?.data || makeup.data.data || []);
        setAttireVendors(attire.data.data?.data || attire.data.data || []);
        setEntertainmentVendors(entertainment.data.data?.data || entertainment.data.data || []);
      } catch (error: any) {
        console.error('Failed to fetch vendors:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVendorsByCategory();
  }, []);

  // Transform vendor data to match VendorSection expected format
  const transformVendors = (vendors: Vendor[], categoryLabel: string) => {
    return vendors.map(vendor => ({
      id: vendor.id,
      name: vendor.name.toUpperCase(),
      image: vendor.images && vendor.images.length > 0 
        ? getImageUrl(vendor.images[0].image)
        : '/images/placeholder-vendor.png',
      rating: vendor.rating || 0,
      category: categoryLabel
    }));
  };

  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading vendors...</div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-12">
      {photographyVendors.length > 0 && (
        <VendorSection
          title="Fotografi"
          description="Our trusted photography partners who capture your moments beautifully"
          vendors={transformVendors(photographyVendors, 'Recommended Photography')}
        />
      )}
      
      {videographyVendors.length > 0 && (
        <VendorSection
          title="Videografi"
          description="Creative storytellers who bring your memories to life"
          vendors={transformVendors(videographyVendors, 'Recommended Videography')}
        />
      )}
      
      {makeupVendors.length > 0 && (
        <VendorSection
          title="Make up / Hair & Hijab"
          description="Beauty experts who enhance every detail of your elegance"
          vendors={transformVendors(makeupVendors, 'Favorite Make Up')}
        />
      )}
      
      {attireVendors.length > 0 && (
        <VendorSection
          title="Attire"
          description="Designers who craft perfection for your special day"
          vendors={transformVendors(attireVendors, 'Recommended Attire')}
        />
      )}
      
      {entertainmentVendors.length > 0 && (
        <VendorSection
          title="Entertainment (Musik)"
          description="Entertainers who set the perfect tone for your special day"
          vendors={transformVendors(entertainmentVendors, 'Favorite Entertainment')}
        />
      )}
    </div>
  );
}
