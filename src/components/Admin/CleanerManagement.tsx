import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Plus, Edit, Trash2, Phone, Building, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Cleaner {
  id: string;
  name: string;
  phone: string;
  type: 'individual' | 'company';
  active: boolean;
  notes?: string;
  created_at: string;
}

export const CleanerManagement = () => {
  const { language } = useLanguage();
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCleaner, setEditingCleaner] = useState<Cleaner | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'individual' as 'individual' | 'company',
    active: true,
    notes: ''
  });

  const t = language === 'es' ? {
    title: 'Equipo de Limpieza',
    addCleaner: 'Añadir Limpiador',
    name: 'Nombre',
    phone: 'Teléfono',
    type: 'Tipo',
    individual: 'Individual',
    company: 'Empresa',
    status: 'Estado',
    active: 'Activo',
    inactive: 'Inactivo',
    notes: 'Notas',
    actions: 'Acciones',
    edit: 'Editar',
    delete: 'Eliminar',
    noCleaners: 'No hay limpiadores registrados',
    modalTitle: 'Nuevo Limpiador',
    modalTitleEdit: 'Editar Limpiador',
    save: 'Guardar',
    cancel: 'Cancelar',
    phoneFormat: 'Formato internacional: +34612345678',
    deleteConfirm: '¿Eliminar este limpiador?',
    required: 'Campo requerido'
  } : {
    title: 'Equipo de Limpeza',
    addCleaner: 'Engadir Limpador',
    name: 'Nome',
    phone: 'Teléfono',
    type: 'Tipo',
    individual: 'Individual',
    company: 'Empresa',
    status: 'Estado',
    active: 'Activo',
    inactive: 'Inactivo',
    notes: 'Notas',
    actions: 'Accións',
    edit: 'Editar',
    delete: 'Eliminar',
    noCleaners: 'Non hai limpadores rexistrados',
    modalTitle: 'Novo Limpador',
    modalTitleEdit: 'Editar Limpador',
    save: 'Gardar',
    cancel: 'Cancelar',
    phoneFormat: 'Formato internacional: +34612345678',
    deleteConfirm: '¿Eliminar este limpador?',
    required: 'Campo requirido'
  };

  useEffect(() => {
    fetchCleaners();
  }, []);

  const fetchCleaners = async () => {
    try {
      const { data, error } = await supabase
        .from('cleaners')
        .select('*')
        .order('name');

      if (error) throw error;
      setCleaners(data || []);
    } catch (error) {
      console.error('Error fetching cleaners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCleaner) {
        const { error } = await supabase
          .from('cleaners')
          .update(formData)
          .eq('id', editingCleaner.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cleaners')
          .insert([formData]);

        if (error) throw error;
      }

      setShowModal(false);
      setEditingCleaner(null);
      resetForm();
      fetchCleaners();
    } catch (error) {
      console.error('Error saving cleaner:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;

    try {
      const { error } = await supabase
        .from('cleaners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCleaners();
    } catch (error) {
      console.error('Error deleting cleaner:', error);
    }
  };

  const handleEdit = (cleaner: Cleaner) => {
    setEditingCleaner(cleaner);
    setFormData({
      name: cleaner.name,
      phone: cleaner.phone,
      type: cleaner.type,
      active: cleaner.active,
      notes: cleaner.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      type: 'individual',
      active: true,
      notes: ''
    });
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingCleaner(null);
    resetForm();
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="text-atlantic-blue" size={28} />
          <h2 className="text-2xl font-bold text-atlantic-blue">{t.title}</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-atlantic-blue text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium shadow-sm"
        >
          <Plus size={20} />
          {t.addCleaner}
        </button>
      </div>

      {cleaners.length === 0 ? (
        <div className="text-center py-12 text-neutral-gray">{t.noCleaners}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.name}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.phone}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.type}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.status}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t.notes}</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cleaners.map((cleaner) => (
                <tr key={cleaner.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {cleaner.type === 'individual' ? (
                        <User size={18} className="text-gray-500" />
                      ) : (
                        <Building size={18} className="text-gray-500" />
                      )}
                      <span className="font-medium text-gray-900">{cleaner.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone size={16} className="text-gray-400" />
                      {cleaner.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {cleaner.type === 'individual' ? t.individual : t.company}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        cleaner.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {cleaner.active ? t.active : t.inactive}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {cleaner.notes || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(cleaner)}
                        className="p-2 text-atlantic-blue hover:bg-atlantic-blue hover:text-white rounded-lg transition-colors"
                        title={t.edit}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(cleaner.id)}
                        className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                        title={t.delete}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingCleaner ? t.modalTitleEdit : t.modalTitle}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.name} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.phone} *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+34612345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">{t.phoneFormat}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.type} *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="individual"
                      checked={formData.type === 'individual'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'individual' | 'company' })}
                      className="text-atlantic-blue focus:ring-atlantic-blue"
                    />
                    <User size={18} className="text-gray-500" />
                    <span>{t.individual}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="company"
                      checked={formData.type === 'company'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'individual' | 'company' })}
                      className="text-atlantic-blue focus:ring-atlantic-blue"
                    />
                    <Building size={18} className="text-gray-500" />
                    <span>{t.company}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded text-atlantic-blue focus:ring-atlantic-blue"
                  />
                  <span className="text-sm font-medium text-gray-700">{t.active}</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-atlantic-blue text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
                >
                  {t.save}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
