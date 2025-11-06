import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Users, Home, FileText, DollarSign, MessageSquare, Settings, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { UserManagement } from './UserManagement';
import { PropertyManagement } from './PropertyManagement';
import { ReservationManagement } from './ReservationManagement';
import { CleaningManagement } from './CleaningManagement';
import { IncomeManagement } from './IncomeManagement';

type AdminTab = 'users' | 'properties' | 'reservations' | 'cleaning' | 'income' | 'reviews' | 'settings';

export const AdminPanel = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  const translations = {
    es: {
      title: 'Panel de Administración',
      notAuthorized: 'No tienes permisos de administrador',
      users: 'Usuarios',
      properties: 'Propiedades',
      reservations: 'Reservas',
      cleaning: 'Limpieza',
      income: 'Ingresos',
      reviews: 'Reseñas',
      settings: 'Configuración',
    },
    gl: {
      title: 'Panel de Administración',
      notAuthorized: 'Non tes permisos de administrador',
      users: 'Usuarios',
      properties: 'Propiedades',
      reservations: 'Reservas',
      cleaning: 'Limpeza',
      income: 'Ingresos',
      reviews: 'Reseñas',
      settings: 'Configuración',
    },
  };

  const t = translations[language];

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-atlantic-blue"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-gray mb-4">{t.notAuthorized}</h2>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'users' as AdminTab, label: t.users, icon: Users },
    { id: 'properties' as AdminTab, label: t.properties, icon: Home },
    { id: 'reservations' as AdminTab, label: t.reservations, icon: FileText },
    { id: 'cleaning' as AdminTab, label: t.cleaning, icon: Sparkles },
    { id: 'income' as AdminTab, label: t.income, icon: DollarSign },
    { id: 'reviews' as AdminTab, label: t.reviews, icon: MessageSquare },
    { id: 'settings' as AdminTab, label: t.settings, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-ivory-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-atlantic-blue mb-8">{t.title}</h1>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-atlantic-blue border-b-2 border-atlantic-blue'
                    : 'text-neutral-gray hover:text-atlantic-blue'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'properties' && <PropertyManagement />}
          {activeTab === 'reservations' && <ReservationManagement />}
          {activeTab === 'cleaning' && <CleaningManagement />}
          {activeTab === 'income' && <IncomeManagement />}
          {activeTab === 'reviews' && <div className="text-neutral-gray">Gestión de reseñas próximamente...</div>}
          {activeTab === 'settings' && <div className="text-neutral-gray">Configuración próximamente...</div>}
        </div>
      </div>
    </div>
  );
};
