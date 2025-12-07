'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

interface Term {
  id: number;
  term: string;
  order: number;
}

interface TermsManagerProps {
  decorationId: number;
}

export default function TermsManager({ decorationId }: TermsManagerProps) {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    term: '',
    order: 0
  });

  useEffect(() => {
    fetchTerms();
  }, [decorationId]);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/decorations/${decorationId}/terms`);
      setTerms(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch terms:', error);
      setTerms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/admin/decorations/${decorationId}/terms`, formData);
      alert('Term berhasil ditambahkan');
      fetchTerms();
      setIsAdding(false);
      setFormData({ term: '', order: 0 });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menambahkan term');
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await api.put(`/admin/decorations/${decorationId}/terms/${id}`, formData);
      alert('Term berhasil diupdate');
      fetchTerms();
      setEditingId(null);
      setFormData({ term: '', order: 0 });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mengupdate term');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus term ini?')) return;
    try {
      await api.delete(`/admin/decorations/${decorationId}/terms/${id}`);
      alert('Term berhasil dihapus');
      fetchTerms();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus term');
    }
  };

  const startEdit = (term: Term) => {
    setEditingId(term.id);
    setFormData({
      term: term.term,
      order: term.order
    });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ term: '', order: 0 });
  };

  if (loading) {
    return <div className="text-center py-4">Loading terms...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Ketentuan & Syarat</h3>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            <FaPlus /> Tambah Term
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
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ketentuan / Syarat <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.term}
              onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              rows={3}
              required
              placeholder="Booking minimal 2 minggu sebelum tanggal acara"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
        {terms.length === 0 ? (
          <div className="text-center py-8 text-gray-500 italic">
            Belum ada term. Klik "Tambah Term" untuk menambahkan.
          </div>
        ) : (
          terms.map((term) => (
            <div
              key={term.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <p className="text-gray-900 flex-1">{term.term}</p>
                    <span className="text-xs text-gray-400">Order: {term.order}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(term)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(term.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
