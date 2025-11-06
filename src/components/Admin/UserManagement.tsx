import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Mail, Calendar, Shield, Search, X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

export const UserManagement = () => {
  const { language } = useLanguage();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState<{userId: string, currentRole: string, userName: string} | null>(null);

  const translations = {
    es: {
      title: 'Gestión de Usuarios',
      search: 'Buscar usuarios...',
      email: 'Email',
      name: 'Nombre',
      phone: 'Teléfono',
      role: 'Rol',
      createdAt: 'Fecha de registro',
      admin: 'Administrador',
      user: 'Usuario',
      makeAdmin: 'Hacer Admin',
      makeUser: 'Hacer Usuario',
      noUsers: 'No se encontraron usuarios',
      confirmTitle: '¿Confirmar cambio de rol?',
      confirmMakeAdmin: '¿Estás seguro de que quieres hacer administrador a',
      confirmMakeUser: '¿Estás seguro de que quieres quitar los permisos de administrador a',
      warningAdmin: 'Esta persona tendrá acceso completo al panel de administración.',
      warningUser: 'Esta persona perderá acceso al panel de administración.',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
    },
    gl: {
      title: 'Xestión de Usuarios',
      search: 'Buscar usuarios...',
      email: 'Email',
      name: 'Nome',
      phone: 'Teléfono',
      role: 'Rol',
      createdAt: 'Data de rexistro',
      admin: 'Administrador',
      user: 'Usuario',
      makeAdmin: 'Facer Admin',
      makeUser: 'Facer Usuario',
      noUsers: 'Non se atoparon usuarios',
      confirmTitle: 'Confirmar cambio de rol?',
      confirmMakeAdmin: 'Estás seguro de que queres facer administrador a',
      confirmMakeUser: 'Estás seguro de que queres quitar os permisos de administrador a',
      warningAdmin: 'Esta persoa terá acceso completo ao panel de administración.',
      warningUser: 'Esta persoa perderá acceso ao panel de administración.',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      fetchProfiles();
      setConfirmModal(null);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const openConfirmModal = (userId: string, currentRole: string, userName: string) => {
    setConfirmModal({ userId, currentRole, userName });
  };

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-atlantic-blue"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-atlantic-blue">{t.title}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray" size={20} />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
          />
        </div>
      </div>

      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12 text-neutral-gray">{t.noUsers}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-gray">{t.email}</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-gray">{t.name}</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-gray">{t.phone}</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-gray">{t.role}</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-gray">{t.createdAt}</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-gray">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((profile) => (
                <tr key={profile.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-neutral-gray" />
                      {profile.email}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-neutral-gray" />
                      {profile.full_name || '-'}
                    </div>
                  </td>
                  <td className="py-4 px-4">{profile.phone || '-'}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        profile.role === 'admin'
                          ? 'bg-atlantic-blue text-white'
                          : 'bg-gray-100 text-neutral-gray'
                      }`}
                    >
                      <Shield size={14} />
                      {profile.role === 'admin' ? t.admin : t.user}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-neutral-gray" />
                      {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => openConfirmModal(profile.id, profile.role, profile.full_name || profile.email)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        profile.role === 'admin'
                          ? 'bg-gray-100 text-neutral-gray hover:bg-gray-200'
                          : 'bg-soft-mint text-atlantic-blue hover:bg-atlantic-blue hover:text-white'
                      }`}
                    >
                      {profile.role === 'admin' ? t.makeUser : t.makeAdmin}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <AlertTriangle className="text-yellow-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-neutral-gray">{t.confirmTitle}</h2>
              </div>
              <button
                onClick={() => setConfirmModal(null)}
                className="text-neutral-gray hover:text-atlantic-blue transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-neutral-gray text-lg">
                {confirmModal.currentRole === 'admin' ? t.confirmMakeUser : t.confirmMakeAdmin}{' '}
                <span className="font-semibold text-atlantic-blue">{confirmModal.userName}</span>?
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-medium">
                  {confirmModal.currentRole === 'admin' ? t.warningUser : t.warningAdmin}
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-6 py-3 border border-gray-300 text-neutral-gray rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => toggleRole(confirmModal.userId, confirmModal.currentRole)}
                className="flex-1 px-6 py-3 bg-atlantic-blue text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
