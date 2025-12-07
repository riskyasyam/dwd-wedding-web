'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

interface Advantage {
  id: number;
  title: string;
  description?: string | null;
  order: number;
}

interface AdvantagesManagerProps {
  decorationId: number;
}

export default function AdvantagesManager({ decorationId }: AdvantagesManagerProps) {
  const [advantages, setAdvantages] = useState<Advantage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0
  });

  useEffect(() => {
    fetchAdvantages();
  }, [decorationId]);

  const fetchAdvantages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/decorations/${decorationId}/advantages`);
      setAdvantages(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch advantages:', error);
      setAdvantages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/admin/decorations/${decorationId}/advantages`, formData);
      alert('Advantage berhasil ditambahkan');
      fetchAdvantages();
      setIsAdding(false);
      setFormData({ title: '', description: '', order: 0 });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menambahkan advantage');
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await api.put(`/admin/decorations/${decorationId}/advantages/${id}`, formData);
      alert('Advantage berhasil diupdate');
      fetchAdvantages();
      setEditingId(null);
      setFormData({ title: '', description: '', order: 0 });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mengupdate advantage');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus advantage ini?')) return;
    try {
      await api.delete(`/admin/decorations/${decorationId}/advantages/${id}`);
      alert('Advantage berhasil dihapus');
      fetchAdvantages();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus advantage');
    }
  };

  const startEdit = (advantage: Advantage) => {
    setEditingId(advantage.id);
    setFormData({
      title: advantage.title,
      description: advantage.description || '',
      order: advantage.order
    });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ title: '', description: '', order: 0 });
  };

  if (loading) {
    return <div className="text-center py-4">Loading advantages...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Fitur & Keunggulan</h3>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            <FaPlus /> Tambah Advantage
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
          className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              maxLength={255}
              placeholder="Setup dan bongkar pasang oleh tim profesional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Deskripsi detail tentang advantage ini..."
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
        {advantages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 italic">
            Belum ada advantage. Klik "Tambah Advantage" untuk menambahkan.
          </div>
        ) : (
          advantages.map((advantage) => (
            <div
              key={advantage.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <h4 className="font-semibold text-gray-900">{advantage.title}</h4>
                    <span className="text-xs text-gray-400 ml-auto">Order: {advantage.order}</span>
                  </div>
                  {advantage.description && (
                    <p className="text-gray-600 text-sm mt-2 ml-6">{advantage.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(advantage)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(advantage.id)}
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
