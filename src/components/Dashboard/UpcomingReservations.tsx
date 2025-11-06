import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export const UpcomingReservations = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const translations = {
    es: {
      upcomingReservations: 'Próximas reservas',
      nights: 'noches',
      night: 'noche',
      noReservations: 'No hay reservas próximas',
      confirmed: 'Confirmada',
      checkInSoon: 'Entrada próxima',
      daysUntil: 'días',
      tomorrow: 'Mañana',
      today: 'Hoy',
    },
    gl: {
      upcomingReservations: 'Próximas reservas',
      nights: 'noites',
      night: 'noite',
      noReservations: 'Non hai reservas próximas',
      confirmed: 'Confirmada',
      checkInSoon: 'Entrada próxima',
      daysUntil: 'días',
      tomorrow: 'Mañá',
      today: 'Hoxe',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    if (!user) return;

    try {
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', user.id);

      const propertyIds = properties?.map((p) => p.id) || [];

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('reservations')
        .select('*, properties(name)')
        .in('property_id', propertyIds)
        .eq('status', 'confirmed')
        .gte('check_in', today)
        .order('check_in', { ascending: true })
        .limit(5);

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const platformIcons: { [key: string]: string } = {
    'airbnb': '🏠',
    'booking': '📚',
    'vrbo': '🌴',
    'manual': '✏️',
  };

  const platformColors: { [key: string]: string } = {
    'airbnb': 'bg-red-50 text-red-700 border-red-200',
    'booking': 'bg-blue-50 text-blue-700 border-blue-200',
    'vrbo': 'bg-sky-50 text-sky-700 border-sky-200',
    'manual': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const getPlatformKey = (source: string | null): string => {
    if (!source) return 'manual';
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes('airbnb')) return 'airbnb';
    if (lowerSource.includes('booking')) return 'booking';
    if (lowerSource.includes('vrbo')) return 'vrbo';
    return 'manual';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getDaysUntilCheckIn = (checkIn: string) => {
    const days = differenceInDays(new Date(checkIn), new Date());
    if (days === 0) return t.today;
    if (days === 1) return t.tomorrow;
    return `${days} ${t.daysUntil}`;
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{t.upcomingReservations}</h3>

      {reservations.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="text-gray-300 mx-auto mb-3" size={48} />
          <p className="text-gray-500">{t.noReservations}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((reservation) => {
            const daysUntil = differenceInDays(new Date(reservation.check_in), new Date());
            const platformKey = getPlatformKey(reservation.source);
            const platformName = reservation.source || 'Manual';
            const platformColor = platformColors[platformKey] || platformColors.manual;
            const platformIcon = platformIcons[platformKey] || platformIcons.manual;

            return (
              <div
                key={reservation.id}
                className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-11 h-11 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <Users className="text-white" size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {reservation.guest_name || 'Huésped'}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">{reservation.properties?.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${platformColor}`}>
                      {platformIcon} {platformName.charAt(0).toUpperCase() + platformName.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-700 font-medium">
                      {format(new Date(reservation.check_in), 'd MMM', { locale: es })} -{' '}
                      {format(new Date(reservation.check_out), 'd MMM', { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600">
                      {reservation.nights} {reservation.nights === 1 ? t.night : t.nights}
                    </span>
                    {daysUntil <= 3 ? (
                      <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg font-semibold border border-amber-200">
                        <Clock size={12} />
                        {getDaysUntilCheckIn(reservation.check_in)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-semibold border border-emerald-200">
                        <CheckCircle size={12} />
                        {t.confirmed}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
