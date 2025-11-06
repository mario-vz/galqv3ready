import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Home, User, DollarSign, Edit, Eye, Search, X, Filter, List } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { format } from 'date-fns';
import { ReservationDetailsModal } from './ReservationDetailsModal';
import { EditReservationModal } from './EditReservationModal';
import { ReservationCalendarView } from './ReservationCalendarView';

interface Reservation {
  id: string;
  property_id: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone?: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  total_amount: number | null;
  status: 'confirmed' | 'cancelled' | 'completed';
  source: string | null;
  notes: string | null;
  created_at: string;
  properties: {
    name: string;
  };
}

export const ReservationManagement = () => {
  const { language } = useLanguage();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const translations = {
    es: {
      title: 'Gestión de Reservas',
      all: 'Todas',
      confirmed: 'Confirmadas',
      cancelled: 'Canceladas',
      completed: 'Completadas',
      property: 'Propiedad',
      guest: 'Huésped',
      checkIn: 'Entrada',
      checkOut: 'Salida',
      nights: 'Noches',
      amount: 'Importe',
      status: 'Estado',
      source: 'Origen',
      actions: 'Acciones',
      view: 'Ver',
      edit: 'Editar',
      search: 'Buscar por nombre o email',
      filterByProperty: 'Filtrar por propiedad',
      filterBySource: 'Filtrar por plataforma',
      allProperties: 'Todas las propiedades',
      allSources: 'Todas las plataformas',
      dateFrom: 'Desde',
      dateTo: 'Hasta',
      filters: 'Filtros',
      clearFilters: 'Limpiar filtros',
      activeFilters: 'filtros activos',
      noReservations: 'No hay reservas',
      noResults: 'No se encontraron reservas con los filtros aplicados',
      listView: 'Lista',
      calendarView: 'Calendario',
    },
    gl: {
      title: 'Xestión de Reservas',
      all: 'Todas',
      confirmed: 'Confirmadas',
      cancelled: 'Canceladas',
      completed: 'Completadas',
      property: 'Propiedade',
      guest: 'Hóspede',
      checkIn: 'Entrada',
      checkOut: 'Saída',
      nights: 'Noites',
      amount: 'Importe',
      status: 'Estado',
      source: 'Orixe',
      actions: 'Accións',
      view: 'Ver',
      edit: 'Editar',
      search: 'Buscar por nome ou email',
      filterByProperty: 'Filtrar por propiedade',
      filterBySource: 'Filtrar por plataforma',
      allProperties: 'Todas as propiedades',
      allSources: 'Todas as plataformas',
      dateFrom: 'Desde',
      dateTo: 'Ata',
      filters: 'Filtros',
      clearFilters: 'Limpar filtros',
      activeFilters: 'filtros activos',
      noReservations: 'Non hai reservas',
      noResults: 'Non se atoparon reservas cos filtros aplicados',
      listView: 'Lista',
      calendarView: 'Calendario',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchReservations();
    fetchProperties();
  }, []);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          properties (
            name
          )
        `)
        .order('check_in', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return t.confirmed;
      case 'cancelled':
        return t.cancelled;
      case 'completed':
        return t.completed;
      default:
        return status;
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (filterProperty !== 'all') count++;
    if (filterSource !== 'all') count++;
    if (filterDateFrom) count++;
    if (filterDateTo) count++;
    return count;
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterProperty('all');
    setFilterSource('all');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterStatus('all');
  };

  const filteredReservations = reservations.filter((reservation) => {
    if (filterStatus !== 'all' && reservation.status !== filterStatus) {
      return false;
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesName = reservation.guest_name?.toLowerCase().includes(search);
      const matchesEmail = reservation.guest_email?.toLowerCase().includes(search);
      const matchesPhone = reservation.guest_phone?.toLowerCase().includes(search);
      if (!matchesName && !matchesEmail && !matchesPhone) {
        return false;
      }
    }

    if (filterProperty !== 'all' && reservation.property_id !== filterProperty) {
      return false;
    }

    if (filterSource !== 'all' && reservation.source !== filterSource) {
      return false;
    }

    if (filterDateFrom) {
      const checkIn = new Date(reservation.check_in);
      const dateFrom = new Date(filterDateFrom);
      if (checkIn < dateFrom) {
        return false;
      }
    }

    if (filterDateTo) {
      const checkOut = new Date(reservation.check_out);
      const dateTo = new Date(filterDateTo);
      if (checkOut > dateTo) {
        return false;
      }
    }

    return true;
  });

  const uniqueSources = Array.from(new Set(reservations.map(r => r.source).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-atlantic-blue"></div>
      </div>
    );
  }

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-atlantic-blue">{t.title}</h2>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-atlantic-blue shadow-sm'
                  : 'text-gray-600 hover:text-atlantic-blue'
              }`}
            >
              <List size={20} />
              {t.listView}
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-atlantic-blue shadow-sm'
                  : 'text-gray-600 hover:text-atlantic-blue'
              }`}
            >
              <Calendar size={20} />
              {t.calendarView}
            </button>
          </div>
          {viewMode === 'list' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-atlantic-blue text-atlantic-blue rounded-lg hover:bg-atlantic-blue hover:text-white transition-colors font-medium"
            >
              <Filter size={20} />
              {t.filters}
              {activeFiltersCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <ReservationCalendarView />
      ) : (
        <>
          {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t.filters}</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <X size={16} />
                {t.clearFilters}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search size={16} className="inline mr-2" />
                {t.search}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.search}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Home size={16} className="inline mr-2" />
                {t.filterByProperty}
              </label>
              <select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
              >
                <option value="all">{t.allProperties}</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.filterBySource}
              </label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
              >
                <option value="all">{t.allSources}</option>
                {uniqueSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                {t.dateFrom}
              </label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                {t.dateTo}
              </label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                min={filterDateFrom}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
              />
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              {activeFiltersCount} {t.activeFilters}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-atlantic-blue text-white'
                : 'bg-gray-100 text-neutral-gray hover:bg-gray-200'
            }`}
          >
            {t.all}
          </button>
          <button
            onClick={() => setFilterStatus('confirmed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'confirmed'
                ? 'bg-atlantic-blue text-white'
                : 'bg-gray-100 text-neutral-gray hover:bg-gray-200'
            }`}
          >
            {t.confirmed}
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'completed'
                ? 'bg-atlantic-blue text-white'
                : 'bg-gray-100 text-neutral-gray hover:bg-gray-200'
            }`}
          >
            {t.completed}
          </button>
          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'cancelled'
                ? 'bg-atlantic-blue text-white'
                : 'bg-gray-100 text-neutral-gray hover:bg-gray-200'
            }`}
          >
            {t.cancelled}
          </button>
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-neutral-gray mb-2">
            {activeFiltersCount > 0 ? t.noResults : t.noReservations}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-atlantic-blue hover:underline text-sm font-medium"
            >
              {t.clearFilters}
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-gray">{t.property}</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-gray">{t.guest}</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-gray">{t.checkIn}</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-gray">{t.checkOut}</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-gray">{t.nights}</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-gray">{t.amount}</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-gray">{t.status}</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-gray">{t.source}</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-gray">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Home size={16} className="text-neutral-gray" />
                      {reservation.properties.name}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-neutral-gray" />
                      <div>
                        <div className="font-medium">{reservation.guest_name || '-'}</div>
                        <div className="text-sm text-neutral-gray">{reservation.guest_email || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-neutral-gray" />
                      {format(new Date(reservation.check_in), 'dd/MM/yyyy')}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-neutral-gray" />
                      {format(new Date(reservation.check_out), 'dd/MM/yyyy')}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium">{reservation.nights}</td>
                  <td className="py-4 px-4">
                    {reservation.total_amount ? (
                      <div className="flex items-center gap-1 font-medium text-atlantic-blue">
                        <DollarSign size={16} />
                        {reservation.total_amount.toFixed(2)}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        reservation.status
                      )}`}
                    >
                      {getStatusLabel(reservation.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4">{reservation.source || '-'}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReservation(reservation);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t.view}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReservation(reservation);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title={t.edit}
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

        </>
      )}

      {selectedReservation && (
        <>
          <ReservationDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedReservation(null);
            }}
            onUpdate={fetchReservations}
            reservation={selectedReservation}
          />
          <EditReservationModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedReservation(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedReservation(null);
              fetchReservations();
            }}
            reservation={selectedReservation}
          />
        </>
      )}
    </div>
  );
};
