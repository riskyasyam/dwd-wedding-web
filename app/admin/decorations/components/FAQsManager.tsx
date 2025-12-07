'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
}

interface FAQsManagerProps {
  decorationId: number;
}

export default function FAQsManager({ decorationId }: FAQsManagerProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 0
  });

  useEffect(() => {
    fetchFAQs();
  }, [decorationId]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/decorations/${decorationId}/faqs`);
      setFaqs(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch FAQs:', error);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/admin/decorations/${decorationId}/faqs`, formData);
      alert('FAQ berhasil ditambahkan');
      fetchFAQs();
      setIsAdding(false);
      setFormData({ question: '', answer: '', order: 0 });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menambahkan FAQ');
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await api.put(`/admin/decorations/${decorationId}/faqs/${id}`, formData);
      alert('FAQ berhasil diupdate');
      fetchFAQs();
      setEditingId(null);
      setFormData({ question: '', answer: '', order: 0 });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mengupdate FAQ');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus FAQ ini?')) return;
    try {
      await api.delete(`/admin/decorations/${decorationId}/faqs/${id}`);
      alert('FAQ berhasil dihapus');
      fetchFAQs();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus FAQ');
    }
  };

  const startEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      order: faq.order
    });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ question: '', answer: '', order: 0 });
  };

  if (loading) {
    return <div className="text-center py-4">Loading FAQs...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h3>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            <FaPlus /> Tambah FAQ
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(isAdding || editingId) && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingId) {
              handleUpdate(editingId);
            } else {
              handleCreate(e);
            }
          }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              required
              placeholder="Apakah harga sudah termasuk setup dan bongkar?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Answer <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
              placeholder="Ya, harga sudah all-in termasuk setup, bongkar, dan transport dalam kota."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Nilai lebih kecil tampil lebih dulu</p>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <FaSave /> {editingId ? 'Update' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              <FaTimes /> Batal
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-2">
        {faqs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 italic">
            Belum ada FAQ. Klik "Tambah FAQ" untuk menambahkan.
          </div>
        ) : (
          faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="flex-1 flex items-start gap-3 text-left"
                >
                  <span className="text-purple-600 font-bold mt-1">Q:</span>
                  <h4 className="font-semibold text-gray-900 flex-1">{faq.question}</h4>
                  {expandedId === faq.id ? (
                    <FaChevronUp className="text-gray-400 mt-1" />
                  ) : (
                    <FaChevronDown className="text-gray-400 mt-1" />
                  )}
                </button>
                <div className="flex items-center gap-2 ml-3">
                  <span className="text-xs text-gray-400">Order: {faq.order}</span>
                  <button
                    onClick={() => startEdit(faq)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Answer Body */}
              {expandedId === faq.id && (
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-start gap-3">
                    <span className="text-gray-600 font-bold">A:</span>
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
