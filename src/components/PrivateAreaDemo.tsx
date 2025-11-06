import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import {
  Home,
  DollarSign,
  TrendingUp,
  Calendar,
  Star,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Eye,
  Users
} from 'lucide-react';
import { CalendarioReservas } from './CalendarioReservas';

export const PrivateAreaDemo = () => {
  const { t } = useTranslation();
  const [selectedProperty, setSelectedProperty] = useState(0);

  const stats = [
    {
      icon: DollarSign,
      label: 'Ingresos Este Mes',
      value: '€3,450',
      change: '+12%',
      trend: 'up',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Calendar,
      label: 'Reservas Activas',
      value: '8',
      change: '+3',
      trend: 'up',
      color: 'bg-atlantic-blue/10 text-atlantic-blue',
    },
    {
      icon: Home,
      label: 'Propiedades',
      value: '3',
      change: '0',
      trend: 'neutral',
      color: 'bg-soft-mint text-atlantic-blue',
    },
    {
      icon: Star,
      label: 'Valoración Media',
      value: '4.8',
      change: '+0.2',
      trend: 'up',
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  const properties = [
    {
      id: 1,
      name: 'Apartamento Vista Mar',
      location: 'Sanxenxo',
      image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'Activo',
      occupancy: 85,
      monthlyIncome: '€1,800',
      platforms: [
        { name: 'Airbnb', url: '#', active: true },
        { name: 'Booking', url: '#', active: true },
        { name: 'Vrbo', url: '#', active: false },
      ],
    },
    {
      id: 2,
      name: 'Casa Playa A Lanzada',
      location: 'A Lanzada',
      image: 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'Activo',
      occupancy: 92,
      monthlyIncome: '€2,100',
      platforms: [
        { name: 'Airbnb', url: '#', active: true },
        { name: 'Booking', url: '#', active: true },
        { name: 'Vrbo', url: '#', active: true },
      ],
    },
    {
      id: 3,
      name: 'Estudio Centro O Grove',
      location: 'O Grove',
      image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'Mantenimiento',
      occupancy: 0,
      monthlyIncome: '€0',
      platforms: [
        { name: 'Airbnb', url: '#', active: false },
        { name: 'Booking', url: '#', active: false },
        { name: 'Vrbo', url: '#', active: false },
      ],
    },
  ];

  const recentReviews = [
    {
      property: 'Apartamento Vista Mar',
      guest: 'María L.',
      rating: 5,
      comment: 'Lugar increíble con vistas espectaculares. Todo estaba impecable.',
      date: '2 días',
    },
    {
      property: 'Casa Playa A Lanzada',
      guest: 'John D.',
      rating: 5,
      comment: 'Perfect location, great amenities. Highly recommended!',
      date: '5 días',
    },
    {
      property: 'Apartamento Vista Mar',
      guest: 'Carlos M.',
      rating: 4,
      comment: 'Muy buena ubicación y limpieza. Volveremos sin duda.',
      date: '1 semana',
    },
  ];

  const monthlyData = [
    { month: 'Ene', income: 2100 },
    { month: 'Feb', income: 2400 },
    { month: 'Mar', income: 2800 },
    { month: 'Abr', income: 3200 },
    { month: 'May', income: 3600 },
    { month: 'Jun', income: 3900 },
  ];

  const maxIncome = Math.max(...monthlyData.map(d => d.income));

  return (
    <section id="area-privada" className="py-20 bg-ivory-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-4xl font-bold text-atlantic-blue">Panel de Propietario</h2>
              <p className="text-neutral-gray mt-2">Vista previa del futuro dashboard</p>
            </div>
            <div className="bg-yellow-100 px-4 py-2 rounded-lg">
              <span className="text-yellow-700 font-semibold text-sm">DEMO - Sin datos reales</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                    <Icon size={24} />
                  </div>
                  {stat.trend === 'up' && (
                    <span className="flex items-center text-green-600 text-sm font-semibold">
                      <ArrowUp size={16} />
                      {stat.change}
                    </span>
                  )}
                  {stat.trend === 'down' && (
                    <span className="flex items-center text-red-600 text-sm font-semibold">
                      <ArrowDown size={16} />
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-neutral-gray text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-atlantic-blue">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-atlantic-blue">Ingresos Mensuales</h3>
              <div className="flex items-center space-x-2 text-sm text-neutral-gray">
                <span>Total: €17,000</span>
              </div>
            </div>
            <div className="flex items-end justify-between h-64 space-x-4">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-end justify-center h-48 mb-2">
                    <div
                      className="w-full bg-gradient-to-t from-atlantic-blue to-soft-mint rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer relative group"
                      style={{ height: `${(data.income / maxIncome) * 100}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-atlantic-blue text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        €{data.income}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-neutral-gray font-medium">{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-semibold text-atlantic-blue mb-6">Ocupación</h3>
            <div className="space-y-6">
              {properties.filter(p => p.status === 'Activo').map((property, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-gray">{property.name}</span>
                    <span className="text-sm font-bold text-atlantic-blue">{property.occupancy}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-atlantic-blue to-soft-mint h-3 rounded-full transition-all duration-300"
                      style={{ width: `${property.occupancy}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-neutral-gray">Ocupación Media</span>
                <span className="text-2xl font-bold text-atlantic-blue">88.5%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
          <h3 className="text-2xl font-semibold text-atlantic-blue mb-6">Mis Propiedades</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedProperty(index)}
              >
                <div className="relative">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        property.status === 'Activo'
                          ? 'bg-green-500 text-white'
                          : 'bg-yellow-500 text-white'
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-atlantic-blue mb-1">
                    {property.name}
                  </h4>
                  <p className="text-sm text-neutral-gray mb-4 flex items-center">
                    <Home size={14} className="mr-1" />
                    {property.location}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-neutral-gray">Ingresos/mes</p>
                      <p className="text-lg font-bold text-atlantic-blue">{property.monthlyIncome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-gray">Ocupación</p>
                      <p className="text-lg font-bold text-atlantic-blue">{property.occupancy}%</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs text-neutral-gray mb-2">Publicado en:</p>
                    <div className="flex flex-wrap gap-2">
                      {property.platforms.map((platform, pIndex) => (
                        <a
                          key={pIndex}
                          href={platform.url}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            platform.active
                              ? 'bg-soft-mint text-atlantic-blue hover:bg-atlantic-blue hover:text-white'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!platform.active) e.preventDefault();
                          }}
                        >
                          <span>{platform.name}</span>
                          {platform.active && <ExternalLink size={12} />}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <CalendarioReservas />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-semibold text-atlantic-blue mb-6">Valoraciones Recientes</h3>
            <div className="space-y-4">
              {recentReviews.map((review, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4 hover:border-soft-mint transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-atlantic-blue">{review.guest}</p>
                      <p className="text-xs text-neutral-gray">{review.property}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="text-yellow-400 fill-current" size={16} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-gray italic mb-2">"{review.comment}"</p>
                  <p className="text-xs text-neutral-gray">Hace {review.date}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-semibold text-atlantic-blue mb-6">Próximas Reservas</h3>
            <div className="space-y-4">
              {[
                { guest: 'Ana García', property: 'Apartamento Vista Mar', checkIn: '15 Nov', checkOut: '18 Nov', nights: 3 },
                { guest: 'Thomas W.', property: 'Casa Playa A Lanzada', checkIn: '20 Nov', checkOut: '27 Nov', nights: 7 },
                { guest: 'Laura M.', property: 'Apartamento Vista Mar', checkIn: '22 Nov', checkOut: '24 Nov', nights: 2 },
                { guest: 'Pedro S.', property: 'Casa Playa A Lanzada', checkIn: '28 Nov', checkOut: '05 Dic', nights: 7 },
              ].map((booking, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4 hover:border-soft-mint transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="bg-soft-mint w-10 h-10 rounded-full flex items-center justify-center">
                        <Users className="text-atlantic-blue" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-atlantic-blue">{booking.guest}</p>
                        <p className="text-xs text-neutral-gray">{booking.property}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-atlantic-blue">{booking.nights} noches</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-xs text-neutral-gray">
                      <Calendar size={14} />
                      <span>{booking.checkIn} - {booking.checkOut}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
