'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import { customerService, Customer, CustomerStatistics } from '@/lib/crudService';
import AdminSidebar from '@/components/layout/AdminSidebar';
// Menggunakan react-icons/fa
import { FaSearch, FaEdit, FaTrash, FaTimes, FaEye, FaUsers, FaUserPlus, FaEnvelope, FaPhone, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

export default function CustomersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statistics, setStatistics] = useState<CustomerStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
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
        fetchCustomers();
        fetchStatistics();
      } catch (error) {
        router.push('/login');
      }
    };

    fetchUserAndData();
  }, [router]);

  const fetchStatistics = async () => {
    try {
      const response = await customerService.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      
      const response = await customerService.getAll(params);
      setCustomers(response.data?.data || response.data || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchCustomers();
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email
    });
    setShowModal(true);
  };

  const handleViewDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      await customerService.update(editingCustomer.id, formData);
      alert('Customer updated successfully');
      setShowModal(false);
      resetForm();
      fetchCustomers();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error updating customer:', error);
      alert(error.response?.data?.message || 'Failed to update customer');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;
    
    try {
      await customerService.delete(id);
      alert('Customer deleted successfully');
      fetchCustomers();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      alert(error.response?.data?.message || 'Failed to delete customer');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: ''
    });
    setEditingCustomer(null);
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
           <p className="text-gray-600 mt-4 font-medium">Loading Customers...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={user} />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-8 pt-20 md:pt-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-black">
                        Customers
                        </h1>
                        <p className="text-gray-500 mt-1">Manage registered users and profiles.</p>
                    </div>
                    {statistics && (
                        <div className="hidden md:flex gap-4">
                            <div className="bg-purple-50 text-purple-700 border border-purple-100 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-3">
                                <div className="bg-purple-200 p-1.5 rounded-full"><FaUsers /></div>
                                <div>
                                    <span className="block text-xs text-purple-500 font-normal">Total</span>
                                    {statistics.total_customers}
                                </div>
                            </div>
                            <div className="bg-pink-50 text-pink-700 border border-pink-100 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-3">
                                <div className="bg-pink-200 p-1.5 rounded-full"><FaUserPlus /></div>
                                <div>
                                    <span className="block text-xs text-pink-500 font-normal">New (Month)</span>
                                    +{statistics.new_customers_this_month}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            ) : customers.length === 0 ? (
                <div className="text-center py-20">
                    <div className="bg-gray-100 inline-flex p-4 rounded-full mb-4">
                        <FaUsers className="text-gray-400 text-2xl" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium">No customers found</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                                                {customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900">{customer.name}</div>
                                                <div className="text-xs text-gray-500">ID: #{customer.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600 flex flex-col gap-1">
                                            <span className="flex items-center gap-2"><FaEnvelope className="text-gray-400 text-xs"/> {customer.email}</span>
                                            <span className="flex items-center gap-2"><FaPhone className="text-gray-400 text-xs"/> {(customer as any).phone || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                            {new Date(customer.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <GradientButton variant="secondary" onClick={() => handleViewDetail(customer)} className="py-1.5 px-3 text-xs">
                                                <FaEye />
                                            </GradientButton>
                                            <GradientButton variant="secondary" onClick={() => handleEdit(customer)} className="py-1.5 px-3 text-xs">
                                                <FaEdit />
                                            </GradientButton>
                                            <GradientButton variant="danger" onClick={() => handleDelete(customer.id)} className="py-1.5 px-3 text-xs">
                                                <FaTrash />
                                            </GradientButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* Edit Modal */}
        {showModal && editingCustomer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Customer</h2>
                    <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-red-500 transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                            placeholder="Customer name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                            placeholder="customer@example.com"
                        />
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <GradientButton variant="secondary" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1">
                            Cancel
                        </GradientButton>
                        <GradientButton type="submit" className="flex-1">
                            Save Changes
                        </GradientButton>
                    </div>
                </form>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Modal Header with Gradient Background */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white relative">
                    <button
                        onClick={() => {
                            setShowDetailModal(false);
                            setSelectedCustomer(null);
                        }}
                        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
                    >
                        <FaTimes size={24} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center text-purple-600 text-3xl font-bold shadow-lg border-4 border-white/20">
                            {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
                            <p className="text-white/80 text-sm">Customer Profile</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Customer ID</p>
                            <p className="text-gray-900 font-mono font-medium">#{selectedCustomer.id}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Joined Date</p>
                            <div className="flex items-center gap-2 text-gray-900">
                                <FaCalendarAlt className="text-pink-400" />
                                <span className="font-medium">
                                    {new Date(selectedCustomer.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                <FaEnvelope />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Email Address</p>
                                <p className="text-gray-900 font-medium">{selectedCustomer.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                <FaPhone />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Phone Number</p>
                                <p className="text-gray-900 font-medium">{(selectedCustomer as any).phone || 'Not provided'}</p>
                            </div>
                        </div>
                        {(selectedCustomer as any).address && (
                            <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                                    <FaMapMarkerAlt />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Address</p>
                                    <p className="text-gray-900 font-medium">{(selectedCustomer as any).address}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                        <GradientButton
                            onClick={() => {
                                setShowDetailModal(false);
                                setSelectedCustomer(null);
                            }}
                            className="w-full"
                        >
                            Close Profile
                        </GradientButton>
                    </div>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}