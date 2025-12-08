'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import { voucherService, Voucher } from '@/lib/crudService';
// Hapus import komponen UI bawaan karena kita buat custom style
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaToggleOn, FaToggleOff, FaTicketAlt, FaCalendarAlt, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function VouchersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_purchase: 0,
    max_discount: 0,
    usage_limit: 0,
    usage_per_user: 1,
    valid_from: '',
    valid_until: '',
    is_active: true,
    description: ''
  });

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const userData = await authService.getUser();
        if (userData.role !== 'admin') {
          router.push('/customer/dashboard');
          return;
        }
        setUser(userData);
        setIsLoading(false);
        fetchVouchers();
      } catch (error) {
        router.push('/login');
      }
    };
    fetchUserAndData();
  }, [router]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterType) params.type = filterType;
      if (filterActive) params.is_active = filterActive === 'active';
      
      const response = await voucherService.getAll(params);
      setVouchers(response.data?.data || response.data || []);
    } catch (error: any) {
      console.error('Error fetching vouchers:', error);
      setError(error.response?.data?.message || 'Failed to fetch vouchers');
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchVouchers();
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm, filterType, filterActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData: any = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        discount_value: formData.discount_value,
        min_purchase: formData.min_purchase,
        usage_per_user: formData.usage_per_user,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
        is_active: formData.is_active,
        description: formData.description
      };

      if (formData.type === 'percentage' && formData.max_discount > 0) {
        submitData.max_discount = formData.max_discount;
      }

      if (formData.usage_limit > 0) {
        submitData.usage_limit = formData.usage_limit;
      }

      if (editingVoucher) {
        await voucherService.update(editingVoucher.id, submitData);
        alert('Voucher updated successfully');
      } else {
        await voucherService.create(submitData);
        alert('Voucher created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchVouchers();
    } catch (error: any) {
      console.error('Error saving voucher:', error);
      alert(error.response?.data?.message || 'Failed to save voucher');
    }
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      type: voucher.type,
      discount_value: voucher.discount_value,
      min_purchase: voucher.min_purchase,
      max_discount: voucher.max_discount || 0,
      usage_limit: voucher.usage_limit || 0,
      usage_per_user: voucher.usage_per_user,
      valid_from: voucher.valid_from.split('T')[0],
      valid_until: voucher.valid_until.split('T')[0],
      is_active: voucher.is_active,
      description: voucher.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this voucher?')) return;
    
    try {
      await voucherService.delete(id);
      alert('Voucher deleted successfully');
      fetchVouchers();
    } catch (error: any) {
      console.error('Error deleting voucher:', error);
      alert(error.response?.data?.message || 'Failed to delete voucher');
    }
  };

  const toggleActive = async (voucher: Voucher) => {
    try {
      await voucherService.update(voucher.id, { is_active: !voucher.is_active });
      fetchVouchers();
    } catch (error: any) {
      console.error('Error toggling voucher status:', error);
      alert(error.response?.data?.message || 'Failed to update voucher status');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      discount_value: 0,
      min_purchase: 0,
      max_discount: 0,
      usage_limit: 0,
      usage_per_user: 1,
      valid_from: '',
      valid_until: '',
      is_active: true,
      description: ''
    });
    setEditingVoucher(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatPriceInput = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handlePriceChange = (value: string, field: 'discount_value' | 'min_purchase' | 'max_discount') => {
    const numbers = value.replace(/\./g, '');
    setFormData({ ...formData, [field]: Number(numbers) || 0 });
  };

  // --- CUSTOM UI COMPONENTS ---

  const GradientButton = ({ children, onClick, className = '', type = 'button', variant = 'primary' }: any) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md flex items-center justify-center";
    const variants = {
      primary: "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 border-none",
      secondary: "bg-white text-purple-600 border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50",
      danger: "bg-white text-red-500 border-2 border-red-100 hover:border-red-300 hover:bg-red-50"
    };
    
    return (
      <button 
        type={type} 
        onClick={onClick} 
        className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}
      >
        {children}
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
           <p className="text-gray-600 mt-4 font-medium">Loading Vouchers...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} />
      
      <div className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="mb-8 pt-20 md:pt-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-black">
                        Voucher Management
                        </h1>
                        <p className="text-gray-500 mt-1">Create and manage your promo codes.</p>
                    </div>
                    <div className="hidden md:block">
                        <span className="bg-purple-50 text-purple-700 border border-purple-100 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                            <FaTicketAlt /> Total: {vouchers.length}
                        </span>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search vouchers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">All Types</option>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (Rp)</option>
                    </select>
                    <select
                        value={filterActive}
                        onChange={(e) => setFilterActive(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <GradientButton onClick={() => setShowModal(true)}>
                        <FaPlus className="mr-2" /> Add Voucher
                    </GradientButton>
                </div>
            </div>
        </div>

        {/* Error Message */}
        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 shadow-sm flex items-center">
             <FaTimes className="mr-2"/>
             <div>
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
             </div>
            </div>
        )}

        {/* Vouchers Grid Layout (Replaced Table) */}
        {loading ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        ) : vouchers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200">
                <div className="bg-gray-100 inline-flex p-4 rounded-full mb-4">
                    <FaTicketAlt className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-600 text-lg font-medium">No vouchers found</p>
                <p className="text-gray-400 text-sm">Create a new voucher to get started.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vouchers.map((voucher) => (
                    <div key={voucher.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
                        {/* Top: Header & Code */}
                        <div className="bg-gray-50 p-5 border-b border-gray-100 relative">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide ${voucher.type === 'percentage' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                    {voucher.type}
                                </span>
                                <button
                                    onClick={() => toggleActive(voucher)}
                                    className={`flex items-center text-xs font-bold px-2 py-1 rounded-full transition-colors ${voucher.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}
                                >
                                    {voucher.is_active ? <FaToggleOn size={16} className="mr-1"/> : <FaToggleOff size={16} className="mr-1"/>}
                                    {voucher.is_active ? 'Active' : 'Inactive'}
                                </button>
                            </div>
                            <div className="mt-2 text-center">
                                <div className="inline-block border-2 border-dashed border-purple-300 bg-white px-4 py-2 rounded-lg font-mono text-xl font-bold text-purple-700 tracking-wider">
                                    {voucher.code}
                                </div>
                            </div>
                        </div>

                        {/* Middle: Content */}
                        <div className="p-5">
                            <div className="text-center mb-4">
                                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
                                    {voucher.type === 'percentage' ? `${voucher.discount_value}%` : formatPrice(voucher.discount_value)}
                                    <span className="text-sm text-gray-400 font-normal block mt-1">OFF</span>
                                </h3>
                                {voucher.type === 'percentage' && voucher.max_discount && (
                                    <p className="text-xs text-gray-500 mt-1">Max. {formatPrice(voucher.max_discount)}</p>
                                )}
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                                <div className="flex justify-between">
                                    <span className="flex items-center text-gray-500"><FaMoneyBillWave className="mr-2"/> Min. Purchase:</span>
                                    <span className="font-semibold text-gray-800">{formatPrice(voucher.min_purchase)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="flex items-center text-gray-500"><FaUsers className="mr-2"/> Usage Limit:</span>
                                    <span className="font-semibold text-gray-800">{voucher.usage_count} / {voucher.usage_limit || '∞'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="flex items-center text-gray-500"><FaCalendarAlt className="mr-2"/> Valid Until:</span>
                                    <span className="font-semibold text-gray-800">{new Date(voucher.valid_until).toLocaleDateString('id-ID')}</span>
                                </div>
                            </div>
                            
                            {voucher.description && (
                                <p className="mt-3 text-xs text-gray-400 italic line-clamp-2 text-center">"{voucher.description}"</p>
                            )}
                        </div>

                        {/* Bottom: Actions */}
                        <div className="p-4 pt-0 flex gap-3">
                            <GradientButton variant="secondary" onClick={() => handleEdit(voucher)} className="flex-1 py-1.5 text-sm">
                                <FaEdit className="mr-2" /> Edit
                            </GradientButton>
                            <GradientButton variant="danger" onClick={() => handleDelete(voucher.id)} className="w-10 px-0 flex items-center justify-center">
                                <FaTrash />
                            </GradientButton>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-8 transform transition-all scale-100">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingVoucher ? 'Edit Voucher' : 'Create New Voucher'}
                </h2>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-red-500 transition-colors">
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-5 mb-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Voucher Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono text-lg tracking-wider placeholder:text-sm"
                      placeholder="e.g., WEDDING2024"
                      required
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rp)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Value *
                    </label>
                    {formData.type === 'percentage' ? (
                      <div className="relative">
                        <input
                            type="number"
                            value={formData.discount_value}
                            onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 pr-8"
                            placeholder="10"
                            required
                            min={0}
                            max={100}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={formatPriceInput(formData.discount_value.toString())}
                        onChange={(e) => handlePriceChange(e.target.value, 'discount_value')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="500.000"
                        required
                      />
                    )}
                  </div>

                  {formData.type === 'percentage' && (
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Max Discount (Rp) - <span className="text-gray-400 font-normal">Optional</span>
                      </label>
                      <input
                        type="text"
                        value={formatPriceInput(formData.max_discount.toString())}
                        onChange={(e) => handlePriceChange(e.target.value, 'max_discount')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="2.000.000"
                      />
                    </div>
                  )}

                  <div className="col-span-2 bg-purple-50 p-5 rounded-xl border border-purple-100">
                    <h4 className="text-sm font-bold text-purple-800 mb-4 uppercase tracking-wide">Usage Rules</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Min. Purchase (Rp)</label>
                            <input
                            type="text"
                            value={formatPriceInput(formData.min_purchase.toString())}
                            onChange={(e) => handlePriceChange(e.target.value, 'min_purchase')}
                            className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Total Limit (0 = ∞)</label>
                            <input
                            type="number"
                            value={formData.usage_limit}
                            onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            min={0}
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Limit Per User</label>
                            <input
                            type="number"
                            value={formData.usage_per_user}
                            onChange={(e) => setFormData({ ...formData, usage_per_user: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            min={1}
                            required
                            />
                        </div>
                        <div className="flex items-center mt-4">
                             <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="sr-only"
                                    />
                                    <div className={`block w-10 h-6 rounded-full ${formData.is_active ? 'bg-pink-500' : 'bg-gray-300'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${formData.is_active ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-700">Immediately Active</span>
                            </label>
                        </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valid From *</label>
                    <input
                      type="date"
                      value={formData.valid_from}
                      onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valid Until *</label>
                    <input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                      min={formData.valid_from}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      rows={2}
                      placeholder="Short description for the voucher..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <GradientButton
                    variant="secondary"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1"
                  >
                    Cancel
                  </GradientButton>
                  <GradientButton type="submit" className="flex-1">
                    {editingVoucher ? 'Save Changes' : 'Create Voucher'}
                  </GradientButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}