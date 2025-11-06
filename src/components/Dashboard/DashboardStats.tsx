import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, TrendingDown, Calendar, Home, DollarSign } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const DashboardStats = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [stats, setStats] = useState({
    occupancyRate: 0,
    totalReservations: 0,
    monthlyRevenue: 0,
    properties: 0,
    occupancyTrend: 0,
    reservationsTrend: 0,
    revenueTrend: 0,
  });
  const [loading, setLoading] = useState(true);

  const translations = {
    es: {
      occupancyRate: 'Tasa de ocupación',
      totalReservations: 'Reservas este mes',
      monthlyRevenue: 'Ingresos este mes',
      properties: 'Propiedades activas',
      vsLastMonth: 'vs mes anterior',
      occupancyTooltip: 'Porcentaje de días ocupados en el mes actual',
      reservationsTooltip: 'Total de reservas confirmadas este mes',
      revenueTooltip: 'Ingresos totales generados este mes',
      propertiesTooltip: 'Número de propiedades activas',
    },
    gl: {
      occupancyRate: 'Taxa de ocupación',
      totalReservations: 'Reservas este mes',
      monthlyRevenue: 'Ingresos este mes',
      properties: 'Propiedades activas',
      vsLastMonth: 'vs mes anterior',
      occupancyTooltip: 'Porcentaxe de días ocupados no mes actual',
      reservationsTooltip: 'Total de reservas confirmadas este mes',
      revenueTooltip: 'Ingresos totais xerados este mes',
      propertiesTooltip: 'Número de propiedades activas',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', user.id)
        .eq('status', 'active');

      const propertyIds = properties?.map((p) => p.id) || [];

      if (propertyIds.length === 0) {
        setStats({
          occupancyRate: 0,
          totalReservations: 0,
          monthlyRevenue: 0,
          properties: 0,
          occupancyTrend: 0,
          reservationsTrend: 0,
          revenueTrend: 0,
        });
        setLoading(false);
        return;
      }

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();

      const lastMonth = new Date().getMonth() - 1;
      const lastMonthYear = lastMonth < 0 ? currentYear - 1 : currentYear;
      const firstDayOfLastMonth = new Date(lastMonthYear, lastMonth < 0 ? 11 : lastMonth, 1).toISOString();
      const lastDayOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59).toISOString();

      const { data: monthlyReservations } = await supabase
        .from('reservations')
        .select('*')
        .in('property_id', propertyIds)
        .gte('check_in', firstDayOfMonth)
        .lte('check_in', lastDayOfMonth);

      const { data: lastMonthReservations } = await supabase
        .from('reservations')
        .select('id')
        .in('property_id', propertyIds)
        .gte('check_in', firstDayOfLastMonth)
        .lte('check_in', lastDayOfLastMonth);

      const monthlyRevenue = monthlyReservations?.reduce(
        (sum, r) => sum + (Number(r.total_amount) || 0),
        0
      ) || 0;

      const { data: lastMonthCompletedReservations } = await supabase
        .from('reservations')
        .select('total_amount')
        .in('property_id', propertyIds)
        .gte('check_in', firstDayOfLastMonth)
        .lte('check_in', lastDayOfLastMonth);

      const lastMonthRevenue = lastMonthCompletedReservations?.reduce(
        (sum, r) => sum + (Number(r.total_amount) || 0),
        0
      ) || 0;

      const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const totalPossibleDays = totalDaysInMonth * propertyIds.length;

      const occupiedDays = monthlyReservations?.reduce(
        (sum, r) => sum + (r.nights || 0),
        0
      ) || 0;

      const occupancyRate = totalPossibleDays > 0 ? (occupiedDays / totalPossibleDays) * 100 : 0;

      const revenueTrend = lastMonthRevenue > 0
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

      const reservationsTrend = (lastMonthReservations?.length || 0) > 0
        ? (((monthlyReservations?.length || 0) - (lastMonthReservations?.length || 0)) / (lastMonthReservations?.length || 0)) * 100
        : 0;

      setStats({
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        totalReservations: monthlyReservations?.length || 0,
        monthlyRevenue,
        properties: propertyIds.length,
        occupancyTrend: 0,
        reservationsTrend: Math.round(reservationsTrend * 10) / 10,
        revenueTrend: Math.round(revenueTrend * 10) / 10,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      icon: TrendingUp,
      label: t.occupancyRate,
      value: `${stats.occupancyRate}%`,
      trend: stats.occupancyTrend,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      tooltip: t.occupancyTooltip,
      isPrimary: true,
    },
    {
      icon: Calendar,
      label: t.totalReservations,
      value: stats.totalReservations.toString(),
      trend: stats.reservationsTrend,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      tooltip: t.reservationsTooltip,
    },
    {
      icon: DollarSign,
      label: t.monthlyRevenue,
      value: `€${stats.monthlyRevenue.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      trend: stats.revenueTrend,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      tooltip: t.revenueTooltip,
    },
    {
      icon: Home,
      label: t.properties,
      value: stats.properties.toString(),
      trend: 0,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      tooltip: t.propertiesTooltip,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend > 0 ? TrendingUp : TrendingDown;

        return (
          <div
            key={index}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group relative"
            title={stat.tooltip}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {stat.label}
              </p>
              <div className={`${stat.bgColor} ${stat.color} w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                <Icon size={20} strokeWidth={2.5} />
              </div>
            </div>

            <div className="mb-3">
              <p className={`${stat.isPrimary ? 'text-5xl' : 'text-4xl'} font-bold text-gray-900 tracking-tight`}>
                {stat.value}
              </p>
            </div>

            {stat.trend !== 0 && (
              <div className="flex items-center gap-1">
                <TrendIcon
                  size={14}
                  className={stat.trend > 0 ? 'text-emerald-500' : 'text-red-500'}
                />
                <span className={`text-xs font-semibold ${
                  stat.trend > 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {Math.abs(stat.trend)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">{t.vsLastMonth}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
