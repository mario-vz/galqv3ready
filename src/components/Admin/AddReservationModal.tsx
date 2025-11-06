import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Calendar, User, Mail, DollarSign, Phone, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AddReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  propertyId: string;
  propertyName: string;
}

export const AddReservationModal = ({ isOpen, onClose, onSuccess, propertyId, propertyName }: AddReservationModalProps) => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [existingReservations, setExistingReservations] = useState<Array<{check_in: string, check_out: string}>>([]);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: '',
    check_out: '',
    total_amount: '',
    status: 'confirmed' as 'confirmed' | 'cancelled' | 'completed',
    source: 'Airbnb',
    notes: '',
  });

  const translations = {
    es: {
      title: 'Añadir Reserva',
      property: 'Propiedad',
      guestName: 'Nombre del huésped',
      guestEmail: 'Email del huésped',
      guestPhone: 'Teléfono del huésped',
      notes: 'Notas adicionales',
      checkIn: 'Fecha de entrada',
      checkOut: 'Fecha de salida',
      amount: 'Importe total',
      status: 'Estado',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada',
      source: 'Plataforma',
      airbnb: 'Airbnb',
      booking: 'Booking',
      manual: 'Manual',
      vrbo: 'Vrbo',
      cancel: 'Cancelar',
      create: 'Crear Reserva',
      creating: 'Creando...',
      required: 'Por favor completa todos los campos obligatorios',
      invalidDates: 'La fecha de salida debe ser posterior a la de entrada',
      dateConflict: 'Las fechas seleccionadas tienen conflicto con reservas existentes',
      blockedDatesInfo: 'Las fechas ocupadas aparecen deshabilitadas',
      existingReservations: 'Reservas existentes',
    },
    gl: {
      title: 'Engadir Reserva',
      property: 'Propiedade',
      guestName: 'Nome do hóspede',
      guestEmail: 'Email do hóspede',
      guestPhone: 'Teléfono do hóspede',
      notes: 'Notas adicionais',
      checkIn: 'Data de entrada',
      checkOut: 'Data de saída',
      amount: 'Importe total',
      status: 'Estado',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada',
      source: 'Plataforma',
      airbnb: 'Airbnb',
      booking: 'Booking',
      manual: 'Manual',
      vrbo: 'Vrbo',
      cancel: 'Cancelar',
      create: 'Crear Reserva',
      creating: 'Creando...',
      required: 'Por favor completa todos os campos obrigatorios',
      invalidDates: 'A data de saída debe ser posterior á de entrada',
      dateConflict: 'As datas seleccionadas teñen conflito con reservas existentes',
      blockedDatesInfo: 'As datas ocupadas aparecen deshabilitadas',
      existingReservations: 'Reservas existentes',
    },
  };

  const t = translations[language];

  useEffect(() => {
    if (isOpen && propertyId) {
      fetchExistingReservations();
    }
  }, [isOpen, propertyId]);

  const fetchExistingReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('check_in, check_out')
        .eq('property_id', propertyId)
        .in('status', ['confirmed', 'completed']);

      if (error) throw error;

      setExistingReservations(data || []);

      const blocked = new Set<string>();
      data?.forEach(reservation => {
        const start = new Date(reservation.check_in);
        const end = new Date(reservation.check_out);
        let current = new Date(start);

        while (current <= end) {
          blocked.add(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }
      });

      setBlockedDates(blocked);
    } catch (error) {
      console.error('Error fetching existing reservations:', error);
    }
  };

  const isDateBlocked = (dateString: string): boolean => {
    return blockedDates.has(dateString);
  };

  const hasDateConflict = (checkIn: string, checkOut: string): boolean => {
    if (!checkIn || !checkOut) return false;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    let current = new Date(start);

    while (current < end) {
      if (blockedDates.has(current.toISOString().split('T')[0])) {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }

    return false;
  };

  const calculateNights = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.check_in || !formData.check_out) {
      alert(t.required);
      return;
    }

    const checkInDate = new Date(formData.check_in);
    const checkOutDate = new Date(formData.check_out);

    if (checkOutDate <= checkInDate) {
      alert(t.invalidDates);
      return;
    }

    if (hasDateConflict(formData.check_in, formData.check_out)) {
      alert(t.dateConflict);
      return;
    }

    const nights = calculateNights(formData.check_in, formData.check_out);

    setLoading(true);

    try {
      const { error: reservationError } = await supabase
        .from('reservations')
        .insert([{
          property_id: propertyId,
          guest_name: formData.guest_name || null,
          guest_email: formData.guest_email || null,
          guest_phone: formData.guest_phone || null,
          check_in: formData.check_in,
          check_out: formData.check_out,
          nights: nights,
          total_amount: formData.total_amount ? parseFloat(formData.total_amount) : null,
          status: formData.status,
          source: formData.source,
          notes: formData.notes || null,
        }]);

      if (reservationError) throw reservationError;

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      guest_name: '',
      guest_email: '',
      guest_phone: '',
      check_in: '',
      check_out: '',
      total_amount: '',
      status: 'confirmed',
      source: 'Airbnb',
      notes: '',
    });
    setBlockedDates(new Set());
    setExistingReservations([]);
    onClose();
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  const nights = calculateNights(formData.check_in, formData.check_out);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-atlantic-blue">{t.title}</h2>
          <button
            onClick={handleClose}
            className="text-neutral-gray hover:text-atlantic-blue transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-soft-mint p-4 rounded-lg">
            <p className="text-sm text-neutral-gray mb-1">{t.property}</p>
            <p className="font-semibold text-atlantic-blue">{propertyName}</p>
          </div>

          {existingReservations.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                {t.existingReservations}: {existingReservations.length}
              </p>
              <p className="text-xs text-yellow-700">{t.blockedDatesInfo}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
                <User size={16} />
                {t.guestName}
              </label>
              <input
                type="text"
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
                <Mail size={16} />
                {t.guestEmail}
              </label>
              <input
                type="email"
                value={formData.guest_email}
                onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
                placeholder="juan@email.com"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
              <Phone size={16} />
              {t.guestPhone}
            </label>
            <input
              type="tel"
              value={formData.guest_phone}
              onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
              placeholder="+34 666 777 888"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
                <Calendar size={16} />
                {t.checkIn} *
              </label>
              <input
                type="date"
                value={formData.check_in}
                onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                min={getMinDate()}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent ${
                  formData.check_in && isDateBlocked(formData.check_in)
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                required
              />
              {formData.check_in && isDateBlocked(formData.check_in) && (
                <p className="text-xs text-red-600 mt-1">⚠️ Esta fecha ya está ocupada</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
                <Calendar size={16} />
                {t.checkOut} *
              </label>
              <input
                type="date"
                value={formData.check_out}
                onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                min={formData.check_in || getMinDate()}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent ${
                  formData.check_out && isDateBlocked(formData.check_out)
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                required
              />
              {formData.check_out && isDateBlocked(formData.check_out) && (
                <p className="text-xs text-red-600 mt-1">⚠️ Esta fecha ya está ocupada</p>
              )}
            </div>
          </div>

          {nights > 0 && (
            <div className="bg-soft-mint p-3 rounded-lg">
              <p className="text-sm text-neutral-gray">
                Noches: <span className="font-semibold text-atlantic-blue">{nights}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
                <DollarSign size={16} />
                {t.amount} (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
                {t.status}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
              >
                <option value="confirmed">{t.confirmed}</option>
                <option value="completed">{t.completed}</option>
                <option value="cancelled">{t.cancelled}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
              {t.source}
            </label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
            >
              <option value="Airbnb">{t.airbnb}</option>
              <option value="Booking">{t.booking}</option>
              <option value="Vrbo">{t.vrbo}</option>
              <option value="Manual">{t.manual}</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
              <FileText size={16} />
              {t.notes}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent resize-none"
              rows={3}
              placeholder="Información adicional sobre la reserva..."
            />
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-neutral-gray rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-atlantic-blue text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.creating : t.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
