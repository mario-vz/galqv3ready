import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, TrendingUp, Calendar, Building2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface IncomeStats {
  totalIncome: number;
  galquilerCommission: number;
  ownerEarnings: number;
  reservationCount: number;
}

interface PropertyIncome {
  property_id: string;
  property_name: string;
  total_amount: number;
  commission_percentage: number;
  galquiler_commission: number;
  owner_earnings: number;
  reservation_count: number;
}

export const IncomeManagement = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [stats, setStats] = useState<IncomeStats>({
    totalIncome: 0,
    galquilerCommission: 0,
    ownerEarnings: 0,
    reservationCount: 0,
  });
  const [propertyIncomes, setPropertyIncomes] = useState<PropertyIncome[]>([]);

  const t = language === 'es' ? {
    title: 'Gestión de Ingresos',
    selectMonth: 'Seleccionar Mes',
    totalIncome: 'Ingresos Totales',
    galquilerCommission: 'Comisión Galquiler',
    ownerEarnings: 'Ganancias Propietarios',
    reservations: 'Reservas',
    incomeByProperty: 'Ingresos por Propiedad',
    property: 'Propiedad',
    income: 'Ingresos',
    commission: 'Comisión',
    ownerAmount: 'Propietario',
    commissionRate: 'Tasa',
    noData: 'No hay datos de ingresos para este período',
  } : {
    title: 'Xestión de Ingresos',
    selectMonth: 'Seleccionar Mes',
    totalIncome: 'Ingresos Totais',
    galquilerCommission: 'Comisión Galquiler',
    ownerEarnings: 'Ganancias Propietarios',
    reservations: 'Reservas',
    incomeByProperty: 'Ingresos por Propiedade',
    property: 'Propiedade',
    income: 'Ingresos',
    commission: 'Comisión',
    ownerAmount: 'Propietario',
    commissionRate: 'Taxa',
    noData: 'Non hai datos de ingresos para este período',
  };

  useEffect(() => {
    fetchIncomeData();
  }, [selectedMonth]);

  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

      const { data: reservations, error } = await supabase
        .from('reservations')
        .select(`
          id,
          total_amount,
          property_id,
          properties (
            name,
            commission_percentage
          )
        `)
        .gte('check_in', startDate)
        .lte('check_in', endDate)
        .eq('status', 'confirmed')
        .not('total_amount', 'is', null);

      if (error) throw error;

      const propertyMap = new Map<string, PropertyIncome>();
      let totalIncome = 0;
      let totalCommission = 0;
      let reservationCount = 0;

      for (const reservation of reservations || []) {
        const amount = parseFloat(reservation.total_amount || '0');
        const commissionRate = reservation.properties?.commission_percentage || 10;
        const commission = (amount * commissionRate) / 100;
        const ownerAmount = amount - commission;

        totalIncome += amount;
        totalCommission += commission;
        reservationCount++;

        const propertyId = reservation.property_id;
        const propertyName = reservation.properties?.name || 'Propiedad sin nombre';

        if (propertyMap.has(propertyId)) {
          const existing = propertyMap.get(propertyId)!;
          existing.total_amount += amount;
          existing.galquiler_commission += commission;
          existing.owner_earnings += ownerAmount;
          existing.reservation_count++;
        } else {
          propertyMap.set(propertyId, {
            property_id: propertyId,
            property_name: propertyName,
            total_amount: amount,
            commission_percentage: commissionRate,
            galquiler_commission: commission,
            owner_earnings: ownerAmount,
            reservation_count: 1,
          });
        }
      }

      setStats({
        totalIncome,
        galquilerCommission: totalCommission,
        ownerEarnings: totalIncome - totalCommission,
        reservationCount,
      });

      setPropertyIncomes(Array.from(propertyMap.values()).sort((a, b) => b.total_amount - a.total_amount));
    } catch (error) {
      console.error('Error fetching income data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedMonth(subMonths(selectedMonth, 1));
    } else {
      setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-atlantic-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-atlantic-blue">{t.title}</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleMonthChange('prev')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ←
          </button>
          <div className="px-4 py-2 bg-gray-100 rounded-lg font-medium min-w-[200px] text-center">
            {format(selectedMonth, 'MMMM yyyy', { locale: language === 'es' ? undefined : undefined })}
          </div>
          <button
            onClick={() => handleMonthChange('next')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} />
            <span className="text-sm opacity-90">{t.totalIncome}</span>
          </div>
          <div className="text-3xl font-bold">{formatCurrency(stats.totalIncome)}</div>
          <div className="text-sm opacity-90 mt-2">{stats.reservationCount} {t.reservations}</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={32} />
            <span className="text-sm opacity-90">{t.galquilerCommission}</span>
          </div>
          <div className="text-3xl font-bold">{formatCurrency(stats.galquilerCommission)}</div>
          <div className="text-sm opacity-90 mt-2">
            {stats.totalIncome > 0 ? ((stats.galquilerCommission / stats.totalIncome) * 100).toFixed(1) : 0}% promedio
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} />
            <span className="text-sm opacity-90">{t.ownerEarnings}</span>
          </div>
          <div className="text-3xl font-bold">{formatCurrency(stats.ownerEarnings)}</div>
          <div className="text-sm opacity-90 mt-2">
            {stats.totalIncome > 0 ? ((stats.ownerEarnings / stats.totalIncome) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Calendar size={32} />
            <span className="text-sm opacity-90">{t.reservations}</span>
          </div>
          <div className="text-3xl font-bold">{stats.reservationCount}</div>
          <div className="text-sm opacity-90 mt-2">
            {stats.reservationCount > 0 ? formatCurrency(stats.totalIncome / stats.reservationCount) : formatCurrency(0)} promedio
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{t.incomeByProperty}</h3>
        </div>
        <div className="overflow-x-auto">
          {propertyIncomes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {t.noData}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t.property}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t.income}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t.commissionRate}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t.commission}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t.ownerAmount}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t.reservations}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {propertyIncomes.map((property) => (
                  <tr key={property.property_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 size={18} className="text-atlantic-blue" />
                        <span className="font-medium text-gray-900">{property.property_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                      {formatCurrency(property.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {property.commission_percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-green-600">
                      {formatCurrency(property.galquiler_commission)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-purple-600">
                      {formatCurrency(property.owner_earnings)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700">
                      {property.reservation_count}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr className="font-bold">
                  <td className="px-6 py-4 text-gray-900">TOTAL</td>
                  <td className="px-6 py-4 text-right text-gray-900">
                    {formatCurrency(stats.totalIncome)}
                  </td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-right text-green-600">
                    {formatCurrency(stats.galquilerCommission)}
                  </td>
                  <td className="px-6 py-4 text-right text-purple-600">
                    {formatCurrency(stats.ownerEarnings)}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-900">
                    {stats.reservationCount}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
