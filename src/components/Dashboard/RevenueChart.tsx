import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, DollarSign } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export const RevenueChart = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  const translations = {
    es: {
      title: 'Ingresos y ocupación',
      subtitle: 'Últimos 6 meses',
      revenue: 'Ingresos',
      occupancy: 'Ocupación',
      noData: 'No hay datos de ingresos disponibles',
      months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    },
    gl: {
      title: 'Ingresos e ocupación',
      subtitle: 'Últimos 6 meses',
      revenue: 'Ingresos',
      occupancy: 'Ocupación',
      noData: 'Non hai datos de ingresos dispoñibles',
      months: ['Xan', 'Feb', 'Mar', 'Abr', 'Mai', 'Xuñ', 'Xul', 'Ago', 'Set', 'Out', 'Nov', 'Dec'],
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchRevenueData();
  }, [user]);

  const fetchRevenueData = async () => {
    if (!user) return;

    try {
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', user.id);

      const propertyIds = properties?.map((p) => p.id) || [];

      if (propertyIds.length === 0) {
        setLoading(false);
        return;
      }

      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1).toISOString();

      const { data: completedReservations } = await supabase
        .from('reservations')
        .select('total_amount, check_out')
        .in('property_id', propertyIds)
        .eq('status', 'completed')
        .gte('check_out', startOfYear);

      const monthlyRevenue: { [key: number]: number } = {};
      for (let i = 0; i < 12; i++) {
        monthlyRevenue[i] = 0;
      }

      completedReservations?.forEach((reservation) => {
        const checkOutDate = new Date(reservation.check_out);
        const month = checkOutDate.getMonth();
        monthlyRevenue[month] += Number(reservation.total_amount) || 0;
      });

      const currentMonth = new Date().getMonth();
      const last6Months: MonthlyRevenue[] = [];

      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        last6Months.push({
          month: t.months[monthIndex],
          revenue: monthlyRevenue[monthIndex] || 0,
        });
      }

      setMonthlyData(last6Months);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-72 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue), 1);
  const hasData = monthlyData.some((d) => d.revenue > 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.title}</h3>
        <p className="text-sm text-gray-500">{t.subtitle}</p>
      </div>

      {!hasData ? (
        <div className="text-center py-16">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-500">{t.noData}</p>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-end justify-between h-64 gap-3 px-2">
            {monthlyData.map((data, index) => {
              const heightPercentage = (data.revenue / maxRevenue) * 100;
              const isLastMonth = index === monthlyData.length - 1;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full flex flex-col items-center justify-end h-full relative group">
                    <div
                      className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg shadow-lg z-10 whitespace-nowrap"
                    >
                      <div className="font-semibold">€{data.revenue.toLocaleString('es-ES')}</div>
                      <div className="text-gray-300 text-xs">{data.month}</div>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 shadow-sm hover:shadow-md ${
                        isLastMonth
                          ? 'bg-gradient-to-t from-blue-600 to-blue-500'
                          : 'bg-gradient-to-t from-teal-500 to-teal-400 hover:from-blue-600 hover:to-blue-500'
                      }`}
                      style={{
                        height: `${Math.max(heightPercentage, data.revenue > 0 ? 5 : 0)}%`,
                        minHeight: data.revenue > 0 ? '12px' : '0',
                      }}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isLastMonth ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {data.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded"></div>
                <span className="text-gray-600 font-medium">Mes actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-br from-teal-500 to-teal-400 rounded"></div>
                <span className="text-gray-600 font-medium">Meses anteriores</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
