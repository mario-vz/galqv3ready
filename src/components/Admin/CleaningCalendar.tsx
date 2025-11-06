import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CleaningTaskModal } from './CleaningTaskModal';
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

interface CleaningEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    id: string;
    property_id: string;
    property_name: string;
    guest_name: string;
    check_out: string;
    status: 'pending' | 'assigned' | 'completed' | 'cancelled';
    priority: 'normal' | 'urgent';
    cleaner_name?: string;
    reservation_id?: string;
    cleaning_time_start: string;
    cleaning_time_end: string;
    notes?: string;
    next_reservation?: {
      check_in: string;
      guest_name: string;
    };
  };
}

interface CleaningCalendarProps {
  onRefresh?: () => void;
}

export const CleaningCalendar = ({ onRefresh }: CleaningCalendarProps) => {
  const { language } = useLanguage();
  const [events, setEvents] = useState<CleaningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');
  const [properties, setProperties] = useState<Array<{id: string, name: string}>>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const t = language === 'es' ? {
    title: 'Calendario de Limpiezas',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    pending: 'Pendiente',
    assigned: 'Asignada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    urgent: 'Urgente',
    normal: 'Normal',
    legend: 'Leyenda',
    noEvents: 'No hay limpiezas programadas para este mes',
    addCleaning: 'Nueva Limpieza',
    selectProperty: 'Seleccionar propiedad',
    syncCheckouts: 'Sincronizar Checkouts'
  } : {
    title: 'Calendario de Limpezas',
    today: 'Hoxe',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Axenda',
    pending: 'Pendente',
    assigned: 'Asignada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    urgent: 'Urxente',
    normal: 'Normal',
    legend: 'Lenda',
    noEvents: 'Non hai limpezas programadas para este mes',
    addCleaning: 'Nova Limpeza',
    selectProperty: 'Seleccionar propiedade',
    syncCheckouts: 'Sincronizar Checkouts'
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    fetchCleaningTasks();
  }, [currentDate]);

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

  const syncCheckouts = async () => {
    try {
      setLoading(true);

      const { data: reservations, error: resError } = await supabase
        .from('reservations')
        .select('*')
        .eq('status', 'confirmed')
        .gte('check_out', format(new Date(), 'yyyy-MM-dd'))
        .order('check_out');

      if (resError) throw resError;

      let createdCount = 0;

      for (const reservation of reservations || []) {
        const cleaningDate = reservation.check_out;

        const { data: existing } = await supabase
          .from('cleaning_tasks')
          .select('id')
          .eq('reservation_id', reservation.id)
          .maybeSingle();

        if (!existing) {
          const { data: nextRes } = await supabase
            .from('reservations')
            .select('check_in')
            .eq('property_id', reservation.property_id)
            .eq('status', 'confirmed')
            .gte('check_in', cleaningDate)
            .order('check_in')
            .limit(1)
            .maybeSingle();

          const isUrgent = nextRes && isSameDay(new Date(cleaningDate), new Date(nextRes.check_in));

          const { error: insertError } = await supabase
            .from('cleaning_tasks')
            .insert({
              reservation_id: reservation.id,
              property_id: reservation.property_id,
              cleaning_date: cleaningDate,
              cleaning_time_start: '11:00',
              cleaning_time_end: '16:00',
              status: 'pending',
              priority: isUrgent ? 'urgent' : 'normal'
            });

          if (!insertError) {
            createdCount++;
          }
        }
      }

      alert(`Se crearon ${createdCount} tareas de limpieza automáticamente`);
      fetchCleaningTasks();
    } catch (error) {
      console.error('Error syncing checkouts:', error);
      alert('Error al sincronizar checkouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchCleaningTasks = async () => {
    try {
      setLoading(true);
      const startDate = format(subMonths(currentDate, 2), 'yyyy-MM-dd');
      const endDate = format(addMonths(currentDate, 2), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('cleaning_tasks')
        .select(`
          *,
          properties (
            name
          ),
          cleaners (
            name
          ),
          reservations (
            guest_name,
            check_out
          )
        `)
        .gte('cleaning_date', startDate)
        .lte('cleaning_date', endDate)
        .order('cleaning_date');

      if (error) throw error;

      const cleaningEvents: CleaningEvent[] = await Promise.all(
        (data || []).map(async (task) => {
          let nextReservation = null;

          const { data: nextRes } = await supabase
            .from('reservations')
            .select('check_in, guest_name')
            .eq('property_id', task.property_id)
            .eq('status', 'confirmed')
            .gte('check_in', task.cleaning_date)
            .order('check_in')
            .limit(1)
            .maybeSingle();

          if (nextRes) {
            nextReservation = nextRes;
          }

          const startTime = task.cleaning_time_start || '11:00';
          const endTime = task.cleaning_time_end || '16:00';

          const [startHour, startMin] = startTime.split(':').map(Number);
          const [endHour, endMin] = endTime.split(':').map(Number);

          const startDate = new Date(task.cleaning_date);
          startDate.setHours(startHour, startMin);

          const endDate = new Date(task.cleaning_date);
          endDate.setHours(endHour, endMin);

          return {
            id: task.id,
            title: `${task.properties?.name || 'Propiedad'} ${task.status === 'completed' ? '✓' : ''}`,
            start: startDate,
            end: endDate,
            resource: {
              id: task.id,
              property_id: task.property_id,
              property_name: task.properties?.name || '',
              guest_name: task.reservations?.guest_name || '',
              check_out: task.reservations?.check_out || '',
              status: task.status,
              priority: task.priority,
              cleaner_name: task.cleaners?.name,
              reservation_id: task.reservation_id,
              cleaning_time_start: task.cleaning_time_start,
              cleaning_time_end: task.cleaning_time_end,
              notes: task.notes,
              next_reservation: nextReservation
            }
          };
        })
      );

      setEvents(cleaningEvents);
    } catch (error) {
      console.error('Error fetching cleaning tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event: CleaningEvent) => {
    let backgroundColor = '#FCD34D';
    let borderColor = '#F59E0B';

    switch (event.resource.status) {
      case 'assigned':
        backgroundColor = '#60A5FA';
        borderColor = '#3B82F6';
        break;
      case 'completed':
        backgroundColor = '#34D399';
        borderColor = '#10B981';
        break;
      case 'cancelled':
        backgroundColor = '#9CA3AF';
        borderColor = '#6B7280';
        break;
    }

    if (event.resource.priority === 'urgent') {
      borderColor = '#EF4444';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: event.resource.priority === 'urgent' ? '3px' : '1px',
        borderStyle: 'solid',
        borderRadius: '6px',
        color: '#1F2937',
        fontWeight: '600',
        fontSize: '13px',
        padding: '4px 8px',
      }
    };
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    if (properties.length === 0) {
      alert('No hay propiedades disponibles');
      return;
    }

    setSelectedTask({
      property_id: properties[0].id,
      cleaning_date: format(start, 'yyyy-MM-dd'),
      cleaning_time_start: '11:00',
      cleaning_time_end: '16:00',
      status: 'pending',
      priority: 'normal',
      property: {
        name: properties[0].name
      }
    });
    setShowModal(true);
  };

  const handleSelectEvent = (event: CleaningEvent) => {
    setSelectedTask({
      id: event.resource.id,
      property_id: event.resource.property_id,
      reservation_id: event.resource.reservation_id,
      cleaner_id: undefined,
      cleaning_date: format(event.start, 'yyyy-MM-dd'),
      cleaning_time_start: event.resource.cleaning_time_start,
      cleaning_time_end: event.resource.cleaning_time_end,
      status: event.resource.status,
      priority: event.resource.priority,
      notes: event.resource.notes,
      property: {
        name: event.resource.property_name
      },
      reservation: {
        guest_name: event.resource.guest_name,
        check_out: event.resource.check_out
      },
      next_reservation: event.resource.next_reservation
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const handleSaveTask = () => {
    fetchCleaningTasks();
    if (onRefresh) onRefresh();
  };

  const handleAddCleaning = () => {
    if (properties.length === 0) {
      alert('No hay propiedades disponibles');
      return;
    }

    setSelectedTask({
      property_id: properties[0].id,
      cleaning_date: format(currentDate, 'yyyy-MM-dd'),
      cleaning_time_start: '11:00',
      cleaning_time_end: '16:00',
      status: 'pending',
      priority: 'normal',
      property: {
        name: properties[0].name
      }
    });
    setShowModal(true);
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const CustomToolbar = () => {
    const goToBack = () => {
      if (view === 'month') {
        setCurrentDate(subMonths(currentDate, 1));
      } else if (view === 'week') {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
      } else {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
      }
    };

    const goToNext = () => {
      if (view === 'month') {
        setCurrentDate(addMonths(currentDate, 1));
      } else if (view === 'week') {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
      } else {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
      }
    };

    const goToToday = () => {
      setCurrentDate(new Date());
    };

    const formatTitle = () => {
      if (view === 'month') {
        return format(currentDate, 'MMMM yyyy', { locale: es });
      } else if (view === 'week') {
        return format(currentDate, "'Semana del' d 'de' MMMM yyyy", { locale: es });
      } else {
        return format(currentDate, "d 'de' MMMM yyyy", { locale: es });
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
          <h3 className="text-xl font-bold text-gray-900 min-w-[280px] text-center">
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
            onClick={syncCheckouts}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            {t.syncCheckouts}
          </button>
          <button
            onClick={handleAddCleaning}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Plus size={20} />
            {t.addCleaning}
          </button>
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

  const CustomEvent = ({ event }: { event: CleaningEvent }) => {
    return (
      <div className="flex items-center gap-2">
        {event.resource.priority === 'urgent' && (
          <AlertTriangle size={14} className="flex-shrink-0 text-red-600" />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{event.resource.property_name}</div>
          {event.resource.cleaner_name && (
            <div className="text-xs truncate opacity-90">👤 {event.resource.cleaner_name}</div>
          )}
          <div className="text-xs opacity-90">
            {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
          </div>
        </div>
      </div>
    );
  };

  if (loading && events.length === 0) {
    return <div className="text-center py-12">Cargando calendario...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.legend}</h3>
        <div className="flex items-center gap-6 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#FCD34D', border: '2px solid #F59E0B' }}></div>
            <span className="text-gray-700 font-medium">{t.pending}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#60A5FA', border: '2px solid #3B82F6' }}></div>
            <span className="text-gray-700 font-medium">{t.assigned}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#34D399', border: '2px solid #10B981' }}></div>
            <span className="text-gray-700 font-medium">{t.completed}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#FCD34D', border: '3px solid #EF4444' }}></div>
            <span className="text-gray-700 font-medium flex items-center gap-1">
              <AlertTriangle size={16} className="text-red-600" />
              {t.urgent}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200" style={{ height: '700px' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          onNavigate={handleNavigate}
          view={view}
          onView={setView}
          culture={language}
          views={['month', 'week', 'day', 'agenda']}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
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

      {showModal && selectedTask && (
        <CleaningTaskModal
          task={selectedTask}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
};
