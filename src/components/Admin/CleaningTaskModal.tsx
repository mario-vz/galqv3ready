import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Send, Calendar, Clock, AlertTriangle, Home, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { format } from 'date-fns';

interface CleaningTask {
  id?: string;
  reservation_id?: string;
  property_id: string;
  cleaner_id?: string;
  cleaning_date: string;
  cleaning_time_start: string;
  cleaning_time_end: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent';
  notes?: string;
  property?: {
    name: string;
  };
  reservation?: {
    guest_name: string;
    check_out: string;
  };
  next_reservation?: {
    check_in: string;
    guest_name: string;
  };
}

interface Cleaner {
  id: string;
  name: string;
  phone: string;
  active: boolean;
}

interface CleaningTaskModalProps {
  task: CleaningTask | null;
  onClose: () => void;
  onSave: () => void;
}

export const CleaningTaskModal = ({ task, onClose, onSave }: CleaningTaskModalProps) => {
  const { language } = useLanguage();
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [properties, setProperties] = useState<Array<{id: string, name: string}>>([]);
  const [formData, setFormData] = useState({
    property_id: task?.property_id || '',
    cleaner_id: task?.cleaner_id || '',
    cleaning_date: task?.cleaning_date || '',
    cleaning_time_start: task?.cleaning_time_start || '11:00',
    cleaning_time_end: task?.cleaning_time_end || '16:00',
    notes: task?.notes || '',
    status: task?.status || 'pending' as 'pending' | 'assigned' | 'completed' | 'cancelled'
  });

  const t = language === 'es' ? {
    title: 'Gestionar Limpieza',
    property: 'Propiedad',
    checkoutDate: 'Fecha salida',
    nextCheckin: 'Próxima entrada',
    cleaningDate: 'Fecha limpieza',
    timeStart: 'Hora inicio',
    timeEnd: 'Hora fin',
    assignCleaner: 'Asignar limpiador',
    selectCleaner: 'Seleccionar limpiador',
    notes: 'Notas para el limpiador',
    status: 'Estado',
    pending: 'Pendiente',
    assigned: 'Asignada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    urgent: 'URGENTE',
    urgentMessage: 'Hay una entrada el mismo día',
    save: 'Guardar',
    cancel: 'Cancelar',
    sendWhatsApp: 'Enviar WhatsApp',
    whatsappMessage: 'Mensaje enviado',
    guestCheckout: 'Huésped saliente',
    noNextReservation: 'Sin próxima reserva',
    whatsappTemplate: 'Plantilla del mensaje',
    selectProperty: 'Seleccionar propiedad'
  } : {
    title: 'Xestionar Limpeza',
    property: 'Propiedade',
    checkoutDate: 'Data saída',
    nextCheckin: 'Próxima entrada',
    cleaningDate: 'Data limpeza',
    timeStart: 'Hora inicio',
    timeEnd: 'Hora fin',
    assignCleaner: 'Asignar limpador',
    selectCleaner: 'Seleccionar limpador',
    notes: 'Notas para o limpador',
    status: 'Estado',
    pending: 'Pendente',
    assigned: 'Asignada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    urgent: 'URXENTE',
    urgentMessage: 'Hai unha entrada o mesmo día',
    save: 'Gardar',
    cancel: 'Cancelar',
    sendWhatsApp: 'Enviar WhatsApp',
    whatsappMessage: 'Mensaxe enviada',
    guestCheckout: 'Hóspede saínte',
    noNextReservation: 'Sen próxima reserva',
    whatsappTemplate: 'Plantilla da mensaxe'
  };

  useEffect(() => {
    fetchCleaners();
    fetchProperties();
  }, []);

  const fetchCleaners = async () => {
    try {
      const { data, error } = await supabase
        .from('cleaners')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setCleaners(data || []);
    } catch (error) {
      console.error('Error fetching cleaners:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSave = {
        property_id: formData.property_id,
        cleaner_id: formData.cleaner_id || null,
        cleaning_date: formData.cleaning_date,
        cleaning_time_start: formData.cleaning_time_start,
        cleaning_time_end: formData.cleaning_time_end,
        status: formData.status,
        notes: formData.notes || null,
        reservation_id: task?.reservation_id || null,
        priority: task?.priority || 'normal'
      };

      if (task?.id) {
        const { error } = await supabase
          .from('cleaning_tasks')
          .update(dataToSave)
          .eq('id', task.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cleaning_tasks')
          .insert([dataToSave]);

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving cleaning task:', error);
    }
  };

  const generateWhatsAppMessage = () => {
    const selectedProperty = properties.find(p => p.id === formData.property_id);
    const propertyName = selectedProperty?.name || task?.property?.name || '';
    const guestName = task?.reservation?.guest_name || 'No especificado';
    const date = formData.cleaning_date ? format(new Date(formData.cleaning_date), 'dd/MM/yyyy') : '';
    const time = formData.cleaning_time_start;
    const notes = formData.notes || 'Sin notas adicionales';

    return `¡Hola! Nueva limpieza asignada:

🏠 Propiedad: ${propertyName}
📅 Fecha: ${date}
👤 Huésped saliente: ${guestName}
⏰ Hora: ${time}
📝 Notas: ${notes}`;
  };

  const handleSendWhatsApp = async () => {
    const selectedCleaner = cleaners.find(c => c.id === formData.cleaner_id);
    if (!selectedCleaner) return;

    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const phone = selectedCleaner.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phone}?text=${encodedMessage}`;

    try {
      if (task?.id) {
        await supabase
          .from('cleaning_tasks')
          .update({
            whatsapp_sent: true,
            whatsapp_sent_at: new Date().toISOString()
          })
          .eq('id', task.id);
      }

      window.open(url, '_blank');
    } catch (error) {
      console.error('Error updating WhatsApp status:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">{t.title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {task?.priority === 'urgent' && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
              <div>
                <div className="font-bold text-red-900 text-lg">{t.urgent}</div>
                <div className="text-red-700">{t.urgentMessage}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Home size={16} className="inline mr-2" />
                  {t.property} *
                </label>
                {task?.id ? (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg font-medium text-gray-900">
                    {task?.property?.name}
                  </div>
                ) : (
                  <select
                    value={formData.property_id}
                    onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
                  >
                    <option value="">{t.selectProperty}</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  {t.guestCheckout}
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                  {task?.reservation?.guest_name || '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.checkoutDate}
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                  {task?.reservation?.check_out
                    ? format(new Date(task.reservation.check_out), 'dd/MM/yyyy')
                    : '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.nextCheckin}
                </label>
                <div className={`px-4 py-3 rounded-lg ${
                  task?.next_reservation
                    ? 'bg-yellow-50 text-yellow-900 font-medium'
                    : 'bg-gray-50 text-gray-900'
                }`}>
                  {task?.next_reservation
                    ? `${format(new Date(task.next_reservation.check_in), 'dd/MM/yyyy')} - ${task.next_reservation.guest_name}`
                    : t.noNextReservation}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  {t.cleaningDate} *
                </label>
                <input
                  type="date"
                  required
                  value={formData.cleaning_date}
                  onChange={(e) => setFormData({ ...formData, cleaning_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock size={16} className="inline mr-2" />
                    {t.timeStart}
                  </label>
                  <input
                    type="time"
                    value={formData.cleaning_time_start}
                    onChange={(e) => setFormData({ ...formData, cleaning_time_start: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.timeEnd}
                  </label>
                  <input
                    type="time"
                    value={formData.cleaning_time_end}
                    onChange={(e) => setFormData({ ...formData, cleaning_time_end: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.assignCleaner}
                </label>
                <select
                  value={formData.cleaner_id}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      cleaner_id: e.target.value,
                      status: e.target.value ? 'assigned' : 'pending'
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
                >
                  <option value="">{t.selectCleaner}</option>
                  {cleaners.map((cleaner) => (
                    <option key={cleaner.id} value={cleaner.id}>
                      {cleaner.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.status}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
                >
                  <option value="pending">{t.pending}</option>
                  <option value="assigned">{t.assigned}</option>
                  <option value="completed">{t.completed}</option>
                  <option value="cancelled">{t.cancelled}</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.notes}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
              placeholder="Instrucciones especiales para el limpiador..."
            />
          </div>

          {formData.cleaner_id && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm font-medium text-green-900 mb-2">{t.whatsappTemplate}:</div>
              <div className="text-sm text-green-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-green-200">
                {generateWhatsAppMessage()}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-atlantic-blue text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
            >
              {t.save}
            </button>
            {formData.cleaner_id && (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Send size={20} />
                {t.sendWhatsApp}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
