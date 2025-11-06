import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Home, MapPin, Users, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const PropertiesList = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const translations = {
    es: {
      myProperties: 'Mis propiedades',
      active: 'Activa',
      maintenance: 'Mantenimiento',
      inactive: 'Inactiva',
      noProperties: 'No tienes propiedades aún',
      contactAdmin: 'Contacta con Galquiler para añadir tu primera propiedad',
      viewProperty: 'Ver propiedad',
      addProperty: 'Añadir propiedad',
      capacity: 'Capacidad',
      guests: 'huéspedes',
    },
    gl: {
      myProperties: 'Miñas propiedades',
      active: 'Activa',
      maintenance: 'Mantemento',
      inactive: 'Inactiva',
      noProperties: 'Non tes propiedades aínda',
      contactAdmin: 'Contacta con Galquiler para engadir a túa primeira propiedade',
      viewProperty: 'Ver propiedade',
      addProperty: 'Engadir propiedade',
      capacity: 'Capacidade',
      guests: 'hóspedes',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchProperties();
  }, [user]);

  const fetchProperties = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    active: 'bg-emerald-500/90 text-white',
    maintenance: 'bg-amber-500/90 text-white',
    inactive: 'bg-gray-500/90 text-white',
  };

  const statusLabels = {
    active: t.active,
    maintenance: t.maintenance,
    inactive: t.inactive,
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{t.myProperties}</h3>
        {/* <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
          <Plus size={18} />
          {t.addProperty}
        </button> */}
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="text-gray-400" size={40} />
          </div>
          <p className="text-gray-600 text-lg mb-2 font-medium">{t.noProperties}</p>
          <p className="text-gray-500 text-sm">{t.contactAdmin}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="group border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
            >
              <div className="relative overflow-hidden">
                <img
                  src={property.image_url || 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={property.name}
                  className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm ${statusColors[property.status as keyof typeof statusColors]} shadow-sm`}>
                    {statusLabels[property.status as keyof typeof statusLabels]}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {property.name}
                </h4>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{property.location}</span>
                </div>
                {property.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{property.description}</p>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    {t.viewProperty} →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
