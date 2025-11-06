import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { LogOut, Shield, ChevronDown, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CalendarioReservas } from '../CalendarioReservas';
import { DashboardStats } from './DashboardStats';
import { PropertiesList } from './PropertiesList';
import { RecentReviews } from './RecentReviews';
import { UpcomingReservations } from './UpcomingReservations';
import { RevenueChart } from './RevenueChart';
import { BookingSourcesChart } from './BookingSourcesChart';
import { Logo } from '../Logo';
import { AdminPanel } from '../Admin/AdminPanel';
import { ReservationStatusManager } from '../Admin/ReservationStatusManager';

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const translations = {
    es: {
      welcome: 'Bienvenido',
      dashboard: 'Panel de Control',
      logout: 'Cerrar Sesión',
      loading: 'Cargando...',
      adminPanel: 'Panel Admin',
      myDashboard: 'Mi Panel',
    },
    gl: {
      welcome: 'Benvido',
      dashboard: 'Panel de Control',
      logout: 'Pechar Sesión',
      loading: 'Cargando...',
      adminPanel: 'Panel Admin',
      myDashboard: 'O meu Panel',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ReservationStatusManager />
      <header className="fixed w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size="medium" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLanguage('es')}
                  className={`transition-all duration-200 hover:scale-105 ${language === 'es' ? 'ring-2 ring-blue-600 rounded-sm' : 'opacity-60 hover:opacity-100'}`}
                  title="Español"
                >
                  <img
                    src="https://flagcdn.com/w40/es.png"
                    alt="Español"
                    className="w-8 h-6 object-cover rounded-sm shadow-sm"
                  />
                </button>
                <button
                  onClick={() => setLanguage('gl')}
                  className={`transition-all duration-200 hover:scale-105 ${language === 'gl' ? 'ring-2 ring-blue-600 rounded-sm' : 'opacity-60 hover:opacity-100'}`}
                  title="Galego"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Flag_of_Galicia.svg/40px-Flag_of_Galicia.svg.png"
                    alt="Galego"
                    className="w-8 h-6 object-cover rounded-sm shadow-sm"
                  />
                </button>
              </div>

              {profile?.role === 'admin' && (
                <button
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium border border-blue-200"
                >
                  <Shield size={18} />
                  <span className="hidden sm:inline">{showAdminPanel ? t.myDashboard : t.adminPanel}</span>
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User size={18} className="text-white" />
                  </div>
                  <ChevronDown size={16} className="text-gray-600" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{profile?.full_name || 'Usuario'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      {t.logout}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {showAdminPanel && profile?.role === 'admin' ? (
        <AdminPanel />
      ) : (
        <div className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {t.welcome}, {profile?.full_name || user?.email?.split('@')[0]}
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-gray-600">{t.dashboard}</p>
                {profile?.role === 'admin' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                    <Shield size={12} />
                    Admin
                  </span>
                )}
              </div>
            </div>

            <DashboardStats />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <RevenueChart />
              <BookingSourcesChart />
            </div>

            <div className="mb-6">
              <CalendarioReservas />
            </div>

            <PropertiesList />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <UpcomingReservations />
              <RecentReviews />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
