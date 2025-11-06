import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Reservation {
  id: string;
  property_id: string;
  guest_name: string | null;
  guest_email: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  total_amount: number | null;
  status: 'confirmed' | 'cancelled' | 'completed';
  source: string | null;
  properties: {
    name: string;
  };
}

interface ReservationEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Reservation;
}

export const ReservationCalendarView = () => {
  const { language } = useLanguage();
  const [events, setEvents] = useState<ReservationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');

  const t = language === 'es' ? {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    noEvents: 'No hay reservas para este período',
    property: 'Propiedad',
    guest: 'Huésped',
    status: 'Estado',
    amount: 'Importe',
    nights: 'noches',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada'
  } : {
    today: 'Hoxe',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Axenda',
    noEvents: 'Non hai reservas para este período',
    property: 'Propiedade',
    guest: 'Hóspede',
    status: 'Estado',
    amount: 'Importe',
    nights: 'noites',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada'
  };

  useEffect(() => {
    fetchReservations();
  }, [currentDate]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const startDate = format(subMonths(currentDate, 2), 'yyyy-MM-dd');
      const endDate = format(addMonths(currentDate, 2), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          properties (
            name
          )
        `)
        .gte('check_out', startDate)
        .lte('check_in', endDate)
        .order('check_in');

      if (error) throw error;

      const reservationEvents: ReservationEvent[] = (data || []).map((reservation) => ({
        id: reservation.id,
        title: `${reservation.properties?.name || 'Propiedad'}`,
        start: new Date(reservation.check_in),
        end: new Date(reservation.check_out),
        resource: reservation
      }));

      setEvents(reservationEvents);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceColor = (source: string | null) => {
    switch (source?.toLowerCase()) {
      case 'airbnb':
        return { bg: '#FF5A5F', border: '#E00007' };
      case 'booking':
      case 'booking.com':
        return { bg: '#003580', border: '#00224F' };
      case 'vrbo':
        return { bg: '#1C4FA2', border: '#133A7C' };
      case 'manual':
        return { bg: '#10B981', border: '#059669' };
      default:
        return { bg: '#6B7280', border: '#4B5563' };
    }
  };

  const eventStyleGetter = (event: ReservationEvent) => {
    const colors = getSourceColor(event.resource.source);
    let opacity = 1;

    if (event.resource.status === 'cancelled') {
      opacity = 0.5;
    } else if (event.resource.status === 'completed') {
      opacity = 0.7;
    }

    return {
      style: {
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '4px',
        color: '#ffffff',
        opacity,
        fontWeight: '600',
        fontSize: '12px',
        padding: '2px 6px',
      }
    };
  };

  const CustomEvent = ({ event }: { event: ReservationEvent }) => {
    const statusText =
      event.resource.status === 'confirmed' ? t.confirmed :
      event.resource.status === 'cancelled' ? t.cancelled :
      t.completed;

    return (
      <div className="group relative">
        <div className="truncate">
          {event.resource.properties?.name}
        </div>
        <div className="hidden group-hover:block absolute z-50 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl min-w-[250px] left-0 top-full mt-1">
          <div className="space-y-1.5">
            <div className="font-bold text-sm border-b border-gray-700 pb-1.5 mb-1.5">
              {event.resource.properties?.name}
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-400 min-w-[60px]">{t.guest}:</span>
              <span className="font-medium">{event.resource.guest_name || '-'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-400 min-w-[60px]">Check-in:</span>
              <span>{format(new Date(event.resource.check_in), 'dd/MM/yyyy')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-400 min-w-[60px]">Check-out:</span>
              <span>{format(new Date(event.resource.check_out), 'dd/MM/yyyy')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-400 min-w-[60px]">{t.nights}:</span>
              <span>{event.resource.nights} {t.nights}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-400 min-w-[60px]">{t.status}:</span>
              <span className={`font-medium ${
                event.resource.status === 'confirmed' ? 'text-green-400' :
                event.resource.status === 'cancelled' ? 'text-red-400' :
                'text-blue-400'
              }`}>
                {statusText}
              </span>
            </div>
            {event.resource.total_amount && (
              <div className="flex items-start gap-2">
                <span className="text-gray-400 min-w-[60px]">{t.amount}:</span>
                <span className="font-medium">{event.resource.total_amount}€</span>
              </div>
            )}
            {event.resource.source && (
              <div className="flex items-start gap-2">
                <span className="text-gray-400 min-w-[60px]">Origen:</span>
                <span className="font-medium capitalize">{event.resource.source}</span>
              </div>
            )}
          </div>
          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      </div>
    );
  };

  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      const newDate = view === 'month' ? subMonths(toolbar.date, 1) :
                      view === 'week' ? new Date(toolbar.date.setDate(toolbar.date.getDate() - 7)) :
                      new Date(toolbar.date.setDate(toolbar.date.getDate() - 1));
      toolbar.onNavigate('prev', newDate);
      setCurrentDate(newDate);
    };

    const goToNext = () => {
      const newDate = view === 'month' ? addMonths(toolbar.date, 1) :
                      view === 'week' ? new Date(toolbar.date.setDate(toolbar.date.getDate() + 7)) :
                      new Date(toolbar.date.setDate(toolbar.date.getDate() + 1));
      toolbar.onNavigate('next', newDate);
      setCurrentDate(newDate);
    };

    const goToToday = () => {
      const now = new Date();
      toolbar.onNavigate('current', now);
      setCurrentDate(now);
    };

    const formatTitle = () => {
      if (view === 'month') {
        return format(toolbar.date, 'MMMM yyyy', { locale: es });
      } else if (view === 'week') {
        return format(toolbar.date, "'Semana del' d 'de' MMMM yyyy", { locale: es });
      } else {
        return format(toolbar.date, "d 'de' MMMM yyyy", { locale: es });
      }
    };

    return (
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={goToBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h3 className="text-xl font-bold text-gray-900 min-w-[250px] text-center">
            {formatTitle()}
          </h3>
          <button
            onClick={goToNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-atlantic-blue text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
          >
            {t.today}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-12">Cargando calendario...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Leyenda de Plataformas</h3>
        <div className="flex items-center gap-6 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#FF5A5F', border: '2px solid #E00007' }}></div>
            <span className="text-gray-700 font-medium">Airbnb</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#003580', border: '2px solid #00224F' }}></div>
            <span className="text-gray-700 font-medium">Booking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#1C4FA2', border: '2px solid #133A7C' }}></div>
            <span className="text-gray-700 font-medium">Vrbo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#10B981', border: '2px solid #059669' }}></div>
            <span className="text-gray-700 font-medium">Manual</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200" style={{ height: '700px' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          culture={language}
          views={['month', 'week', 'day', 'agenda']}
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
            event: CustomEvent
          }}
          messages={{
            today: t.today,
            month: t.month,
            week: t.week,
            day: t.day,
            agenda: t.agenda,
            next: 'Siguiente',
            previous: 'Anterior',
            noEventsInRange: t.noEvents
          }}
        />
      </div>
    </div>
  );
};
