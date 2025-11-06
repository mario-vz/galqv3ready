import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const BookingSourcesChart = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [sources, setSources] = useState<{ name: string; count: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const translations = {
    es: {
      title: 'Canales de reserva',
      total: 'Total',
      noData: 'Sin datos de reservas',
    },
    gl: {
      title: 'Canles de reserva',
      total: 'Total',
      noData: 'Sen datos de reservas',
    },
  };

  const t = translations[language];

  const platformColors: { [key: string]: string } = {
    'Airbnb': '#FF5A5F',
    'Booking': '#003580',
    'Vrbo': '#1C4FA2',
    'Manual': '#10B981',
    'other': '#6B7280',
  };

  useEffect(() => {
    fetchSources();
  }, [user]);

  const fetchSources = async () => {
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

      const { data: reservations } = await supabase
        .from('reservations')
        .select('source')
        .in('property_id', propertyIds)
        .eq('status', 'confirmed');

      const sourceCount: { [key: string]: number } = {};

      reservations?.forEach((res) => {
        const platform = res.source || 'Manual';
        sourceCount[platform] = (sourceCount[platform] || 0) + 1;
      });

      const sourcesArray = Object.entries(sourceCount).map(([name, count]) => ({
        name,
        count,
        color: platformColors[name] || platformColors.other,
      }));

      setSources(sourcesArray);
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const total = sources.reduce((sum, s) => sum + s.count, 0);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="flex items-center justify-center mb-6">
            <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{t.title}</h3>

      {sources.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <p>{t.noData}</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                {sources.reduce((acc, source, index) => {
                  const percentage = (source.count / total) * 100;
                  const circumference = 2 * Math.PI * 70;
                  const offset = acc.offset;
                  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

                  acc.segments.push(
                    <circle
                      key={index}
                      cx="100"
                      cy="100"
                      r="70"
                      fill="none"
                      stroke={source.color}
                      strokeWidth="28"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={-offset}
                      className="transition-all duration-500"
                    />
                  );

                  acc.offset += (percentage / 100) * circumference;
                  return acc;
                }, { segments: [] as JSX.Element[], offset: 0 }).segments}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold text-gray-900">{total}</p>
                <p className="text-sm text-gray-500">{t.total}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {sources.map((source, index) => {
              const percentage = ((source.count / total) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-3 h-3 rounded-full transition-transform duration-300 group-hover:scale-125"
                      style={{ backgroundColor: source.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{source.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: source.color,
                          width: `${percentage}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {source.count}
                    </span>
                    <span className="text-xs text-gray-500 w-12 text-right">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
