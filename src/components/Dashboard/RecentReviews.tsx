import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const RecentReviews = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const translations = {
    es: {
      recentReviews: 'Últimas valoraciones',
      noReviews: 'No hay valoraciones aún',
      ago: 'hace',
      averageRating: 'Promedio',
    },
    gl: {
      recentReviews: 'Últimas valoracións',
      noReviews: 'Non hai valoracións aínda',
      ago: 'fai',
      averageRating: 'Promedio',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const fetchReviews = async () => {
    if (!user) return;

    try {
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', user.id);

      const propertyIds = properties?.map((p) => p.id) || [];

      const { data, error } = await supabase
        .from('reviews')
        .select('*, properties(name)')
        .in('property_id', propertyIds)
        .order('review_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

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

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{t.recentReviews}</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
            <Star className="text-amber-500 fill-current" size={16} />
            <span className="text-sm font-bold text-amber-700">{averageRating}</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-500">{t.noReviews}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-300 group relative"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900">{review.guest_name}</p>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}
                          size={14}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">{review.properties?.name}</p>
                </div>
                {review.platform && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">
                    {review.platform}
                  </span>
                )}
              </div>
              {review.comment && (
                <div className="relative mb-3">
                  <Quote className="absolute -top-1 -left-1 text-blue-100" size={24} />
                  <p className="text-sm text-gray-700 leading-relaxed pl-5">"{review.comment}"</p>
                </div>
              )}
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(review.review_date), { addSuffix: true, locale: es })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
