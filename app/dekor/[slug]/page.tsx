'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import MenuNav from '@/components/layout/MenuNav';
import Footer from '@/components/layout/Footer';
import api, { getImageUrl } from '@/lib/axios';

interface DecorationDetail {
  id: number;
  name: string;
  slug: string;
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
  images?: { id: number; image: string }[];
  features?: string[];
  package_includes?: string[];
  terms_conditions?: string[];
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  posted_at: string;
  customer_name?: string;
  user?: {
    id: number;
    name: string;
  } | null;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function DecorationDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [decoration, setDecoration] = useState<DecorationDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'faqs'>('reviews');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch decoration detail by slug
        let decoResponse;
        try {
          decoResponse = await api.get(`/public/decorations/${slug}`);
        } catch (slugError: any) {
          // If slug fails with 404, it means backend expects different format
          // Log the error for debugging
          console.warn('Slug lookup failed:', {
            slug,
            status: slugError.response?.status,
            message: slugError.response?.data?.message
          });
          throw slugError; // Re-throw to be caught by outer catch
        }
        
        const decoData = decoResponse.data.data;
        setDecoration(decoData);

        // Fetch reviews from API
        try {
          const reviewsResponse = await api.get(`/admin/reviews`, {
            params: {
              decoration_id: decoData.id,
              page: 1,
              per_page: 10
            }
          });
          
          console.log('Reviews API Response:', reviewsResponse.data);
          
          // Try different possible response structures
          let reviewsData = [];
          if (reviewsResponse.data.data?.data) {
            // Paginated: { data: { data: [...], total, per_page, etc } }
            reviewsData = reviewsResponse.data.data.data;
          } else if (reviewsResponse.data.data?.reviews?.data) {
            // Nested: { data: { reviews: { data: [...] } } }
            reviewsData = reviewsResponse.data.data.reviews.data;
          } else if (Array.isArray(reviewsResponse.data.data)) {
            // Direct array: { data: [...] }
            reviewsData = reviewsResponse.data.data;
          }
          
          console.log('Parsed reviews:', reviewsData);
          setReviews(reviewsData || []);
        } catch (reviewError: any) {
          console.warn('Failed to fetch reviews:', {
            status: reviewError.response?.status,
            message: reviewError.response?.data?.message || reviewError.message,
            url: reviewError.config?.url
          });
          setReviews([]);
        }

        // Mock FAQs (bisa diganti dengan API jika ada endpoint)
        setFAQs([
          {
            id: 1,
            question: 'Berapa lama waktu setup dekorasi?',
            answer: 'Setup dekorasi biasanya memakan waktu 3-4 jam sebelum acara dimulai, tergantung kompleksitas desain.'
          },
          {
            id: 2,
            question: 'Apakah harga sudah termasuk bongkar pasang?',
            answer: 'Ya, harga sudah termasuk setup dan pembongkaran setelah acara selesai.'
          },
          {
            id: 3,
            question: 'Bisakah custom desain sesuai request?',
            answer: 'Tentu! Kami menerima custom request dengan biaya tambahan sesuai tingkat kesulitan desain.'
          },
          {
            id: 4,
            question: 'Bagaimana jika terjadi kerusakan pada dekorasi?',
            answer: 'Kami membawa backup material untuk antisipasi kerusakan. Jika terjadi kerusakan karena force majeure, kami akan segera menggantinya.'
          }
        ]);

      } catch (error: any) {
        console.error('Failed to fetch decoration detail:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url,
          data: error.response?.data
        });
        
        // Set decoration to null to show not found message
        setDecoration(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <MenuNav />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!decoration) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <MenuNav />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Decoration not found</h1>
          <Link href="/dekor" className="text-purple-600 hover:underline mt-4 inline-block">
            Back to Decorations
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = decoration.images && decoration.images.length > 0
    ? decoration.images.map(img => getImageUrl(img.image))
    : ['/images/image_decor.png'];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <MenuNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="text-sm mb-6">
          <Link href="/" className="text-[#9A82DB] hover:underline">Home</Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <Link href="/dekor" className="text-[#9A82DB] hover:underline">Dekor</Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-600">{decoration.name}</span>
        </div>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Left: Images */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
              <Image
                src={images[selectedImage]}
                alt={decoration.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-purple-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${decoration.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{decoration.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Image
                    key={i}
                    src="/images/star.png"
                    alt="star"
                    width={20}
                    height={20}
                    className={i < Math.floor(decoration.rating || 0) ? 'opacity-100' : 'opacity-30'}
                  />
                ))}
              </div>
              <span className="text-gray-600 font-semibold">{decoration.rating || 0}/5</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              {decoration.discount_percent && decoration.discount_percent > 0 ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(decoration.final_price)}
                    </span>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                      -{decoration.discount_percent}%
                    </span>
                  </div>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(decoration.base_price)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(decoration.base_price)}
                </span>
              )}
            </div>

            {/* Region */}
            <div className="mb-6">
              <p className="text-gray-600">
                <span className="font-semibold">Region:</span> {decoration.region}
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">Deskripsi</h3>
              <p className="text-gray-600 leading-relaxed">{decoration.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <p className="text-gray-700 font-medium mb-2">Pilih Paket</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition">
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="border-t border-gray-200 pt-8 w-full">
          {/* Tab Headers */}
          <div className="flex justify-between border-b border-gray-200 mb-8 w-full">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-4 px-2 font-semibold transition-colors relative ${
                activeTab === 'details'
                  ? 'text-gray-900 border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 px-2 font-semibold transition-colors relative ${
                activeTab === 'reviews'
                  ? 'text-gray-900 border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Rating & Reviews
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`pb-4 px-2 font-semibold transition-colors relative ${
                activeTab === 'faqs'
                  ? 'text-gray-900 border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              FAQs
            </button>
          </div>

          {/* Tab Content */}
          <div className="w-full">
            {/* Product Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Informasi Produk</h3>
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Nama Paket</p>
                        <p className="font-semibold text-gray-900">{decoration.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Region</p>
                        <p className="font-semibold text-gray-900">{decoration.region}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Rating</p>
                        <p className="font-semibold text-gray-900">{decoration.rating || 0}/5 ({decoration.review_count || 0} reviews)</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Status</p>
                        <p className="font-semibold text-green-600">Available</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Fitur & Keunggulan</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">Setup dan bongkar pasang oleh tim profesional</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">Material berkualitas tinggi dan modern</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">Desain dapat dikustomisasi sesuai tema acara</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">Konsultasi gratis dengan wedding decorator</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">Backup material untuk antisipasi kerusakan</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Ketentuan & Syarat</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Booking minimal 2 minggu sebelum tanggal acara</li>
                      <li>• DP 30% dari total harga saat booking dikonfirmasi</li>
                      <li>• Pelunasan maksimal H-3 sebelum acara</li>
                      <li>• Pembatalan tanpa pengembalian DP jika kurang dari 1 minggu sebelum acara</li>
                      <li>• Perubahan desain dapat dilakukan maksimal H-7 sebelum acara</li>
                      <li>• Setup dilakukan 3-4 jam sebelum acara dimulai</li>
                      <li>• Bongkar pasang dilakukan setelah acara selesai (maksimal +3 jam)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <div className="grid grid-cols-3 items-center mb-6 w-full">
                  <h3 className="text-2xl font-bold text-gray-900">
                    All Reviews <span className="text-gray-500">({reviews.length})</span>
                  </h3>

                  <div></div>

                  <div className="flex justify-end">
                    <button className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition">
                      Write a Review
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-xl p-6">
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Image
                            key={i}
                            src="/images/star.png"
                            alt="star"
                            width={20}
                            height={20}
                            className={i < Math.floor(review.rating) ? 'opacity-100' : 'opacity-30'}
                          />
                        ))}
                      </div>

                      {/* User Name */}
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-bold text-gray-900">
                          {review.user?.name || review.customer_name || 'Anonymous'}
                        </h4>
                        {review.user && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                            Verified Purchase
                          </span>
                        )}
                      </div>

                      {/* Comment */}
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">
                        {review.comment}
                      </p>

                      {/* Date */}
                      <p className="text-gray-400 text-xs">
                        Posted on {formatDate(review.posted_at)}
                      </p>
                    </div>
                  ))}
                </div>

                {reviews.length > 4 && (
                  <div className="text-center mt-8">
                    <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
                      Load More Reviews
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* FAQs Tab */}
            {activeTab === 'faqs' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h3>

                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition">
                      <h4 className="font-bold text-gray-900 text-lg mb-3 flex items-start gap-2">
                        <span className="text-purple-600 shrink-0">Q:</span>
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 leading-relaxed pl-6">
                        <span className="font-semibold text-gray-700">A:</span> {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-2">Masih ada pertanyaan?</h4>
                  <p className="text-gray-600 mb-4">
                    Tim customer service kami siap membantu Anda. Hubungi kami melalui WhatsApp atau email.
                  </p>
                  <div className="flex gap-3">
                    <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition">
                      WhatsApp
                    </button>
                    <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition">
                      Email Us
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
