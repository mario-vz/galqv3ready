import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { X, Calendar as CalendarIcon, Home, User, Globe, Clock } from 'lucide-react';

const locales = {
  es: es,
  gl: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
});

interface ReservationData {
  id: string;
  guest_name: string;
  guest_email: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  total_amount: number;
  status: string;
  source: string;
  property_id: string;
  properties?: {
    name: string;
  };
}

interface CalendarEvent extends Event {
  title: string;
  start: Date;
  end: Date;
  resource: {
    source: string;
    propertyName: string;
    reservationData: ReservationData;
  };
}

interface ICalUrl {
  url: string;
  source: string;
}

export const CalendarioReservas = () => {
  const [reservations, setReservations] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<ReservationData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { language } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', user.id);

      const propertyIds = properties?.map((p) => p.id) || [];

      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('*, properties(name)')
        .in('property_id', propertyIds)
        .in('status', ['confirmed', 'completed']);

      if (reservationsError) throw reservationsError;

      const events: CalendarEvent[] = (reservationsData || []).map((res) => {
        const propertyName = res.properties?.name || 'Propiedad';
        return {
          title: `${res.guest_name} - ${propertyName}`,
          start: new Date(res.check_in),
          end: new Date(res.check_out),
          resource: {
            source: res.source || 'manual',
            propertyName,
            reservationData: res,
          },
        };
      });

      setReservations(events);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('No se pudieron cargar las reservas.');
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const source = event.resource?.source || '';
    let backgroundColor = '#10B981';

    const sourceLower = source.toLowerCase();
    if (sourceLower === 'airbnb' || sourceLower.includes('airbnb')) {
      backgroundColor = '#FF5A5F';
    } else if (sourceLower === 'booking' || sourceLower.includes('booking')) {
      backgroundColor = '#003580';
    } else if (sourceLower === 'vrbo' || sourceLower.includes('vrbo')) {
      backgroundColor = '#1C4FA2';
    } else if (sourceLower === 'manual' || sourceLower.includes('manual')) {
      backgroundColor = '#10B981';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.95,
        color: 'white',
        border: '0px',
        display: 'block',
        fontWeight: '500',
        fontSize: '13px',
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedReservation(event.resource.reservationData);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
  };

  const messages = useMemo(() => ({
    allDay: language === 'es' ? 'Todo el día' : 'Todo o día',
    previous: language === 'es' ? 'Anterior' : 'Anterior',
    next: language === 'es' ? 'Siguiente' : 'Seguinte',
    today: language === 'es' ? 'Hoy' : 'Hoxe',
    month: language === 'es' ? 'Mes' : 'Mes',
    week: language === 'es' ? 'Semana' : 'Semana',
    day: language === 'es' ? 'Día' : 'Día',
    agenda: 'Agenda',
    date: language === 'es' ? 'Fecha' : 'Data',
    time: language === 'es' ? 'Hora' : 'Hora',
    event: language === 'es' ? 'Evento' : 'Evento',
    noEventsInRange: language === 'es' ? 'No hay reservas en este rango' : 'Non hai reservas neste rango',
    showMore: (total: number) => `+ ${total} ${language === 'es' ? 'más' : 'máis'}`,
  }), [language]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchReservations}
          className="px-6 py-2 bg-atlantic-blue text-white rounded-lg hover:bg-atlantic-blue/90 transition-colors"
        >
          {language === 'es' ? 'Reintentar' : 'Reintentar'}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {language === 'es' ? 'Calendario de reservas' : 'Calendario de reservas'}
            </h2>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FF5A5F' }}></div>
                <span className="text-gray-600 font-medium">Airbnb</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#003580' }}></div>
                <span className="text-gray-600 font-medium">Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#1C4FA2' }}></div>
                <span className="text-gray-600 font-medium">Vrbo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10B981' }}></div>
                <span className="text-gray-600 font-medium">Manual</span>
              </div>
            </div>
          </div>
        </div>

        <div className="calendar-container" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={reservations}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            messages={messages}
            culture={language}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      </div>

      {showModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-atlantic-blue">
                {language === 'es' ? 'Detalles de Reserva' : 'Detalles da Reserva'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <User className="text-atlantic-blue flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {language === 'es' ? 'Huésped' : 'Hóspede'}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{selectedReservation.guest_name}</p>
                  {selectedReservation.guest_email && (
                    <p className="text-sm text-gray-600">{selectedReservation.guest_email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Home className="text-atlantic-blue flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {language === 'es' ? 'Propiedad' : 'Propiedade'}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{selectedReservation.properties?.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarIcon className="text-atlantic-blue flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {language === 'es' ? 'Fechas' : 'Datas'}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {format(new Date(selectedReservation.check_in), 'dd/MM/yyyy', { locale: es })} - {format(new Date(selectedReservation.check_out), 'dd/MM/yyyy', { locale: es })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedReservation.nights} {language === 'es' ? 'noches' : 'noites'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="text-atlantic-blue flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {language === 'es' ? 'Plataforma' : 'Plataforma'}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{selectedReservation.source}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="text-atlantic-blue flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {language === 'es' ? 'Estado' : 'Estado'}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedReservation.status === 'confirmed'
                      ? (language === 'es' ? 'Confirmada' : 'Confirmada')
                      : (language === 'es' ? 'Completada' : 'Completada')
                    }
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-medium text-gray-700">
                    {language === 'es' ? 'Total' : 'Total'}
                  </p>
                  <p className="text-2xl font-bold text-atlantic-blue">
                    {selectedReservation.total_amount.toFixed(2)}€
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={handleCloseModal}
                className="w-full py-3 bg-atlantic-blue text-white font-semibold rounded-lg hover:bg-atlantic-blue/90 transition-colors"
              >
                {language === 'es' ? 'Cerrar' : 'Pechar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
