import { useState } from 'react';
import { X, Home, User, Calendar, Moon, DollarSign, Globe, FileText, Clock, Phone, Edit } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { EditReservationModal } from './EditReservationModal';

interface ReservationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  reservation: {
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
  };
}

export const ReservationDetailsModal = ({ isOpen, onClose, onUpdate, reservation }: ReservationDetailsModalProps) => {
  const { language } = useLanguage();
  const [currentStatus, setCurrentStatus] = useState(reservation.status);
  const [updating, setUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const translations = {
    es: {
      title: 'Detalles de la Reserva',
      property: 'Propiedad',
      guestInfo: 'Información del Huésped',
      name: 'Nombre',
      email: 'Correo Electrónico',
      phone: 'Teléfono',
      reservationInfo: 'Información de la Reserva',
      checkIn: 'Fecha de Entrada',
      checkOut: 'Fecha de Salida',
      nights: 'Noches',
      amount: 'Importe Total',
      status: 'Estado',
      source: 'Origen',
      notes: 'Notas',
      createdAt: 'Fecha de Creación',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada',
      close: 'Cerrar',
      noData: 'Sin datos',
      updateStatus: 'Actualizar Estado',
      updating: 'Actualizando...',
      updateSuccess: 'Estado actualizado correctamente',
      updateError: 'Error al actualizar el estado',
      edit: 'Editar Reserva',
    },
    gl: {
      title: 'Detalles da Reserva',
      property: 'Propiedade',
      guestInfo: 'Información do Hóspede',
      name: 'Nome',
      email: 'Correo Electrónico',
      phone: 'Teléfono',
      reservationInfo: 'Información da Reserva',
      checkIn: 'Data de Entrada',
      checkOut: 'Data de Saída',
      nights: 'Noites',
      amount: 'Importe Total',
      status: 'Estado',
      source: 'Orixe',
      notes: 'Notas',
      createdAt: 'Data de Creación',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada',
      close: 'Pechar',
      noData: 'Sen datos',
      updateStatus: 'Actualizar Estado',
      updating: 'Actualizando...',
      updateSuccess: 'Estado actualizado correctamente',
      updateError: 'Erro ao actualizar o estado',
      edit: 'Editar Reserva',
    },
  };

  const t = translations[language];

  const handleStatusUpdate = async () => {
    if (currentStatus === reservation.status) return;

    setUpdating(true);

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: currentStatus })
        .eq('id', reservation.id);

      if (error) throw error;

      alert(t.updateSuccess);
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating reservation status:', error);
      alert(t.updateError);
    } finally {
      setUpdating(false);
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

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-atlantic-blue">{t.title}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium border border-blue-200"
              >
                <Edit size={18} />
                <span className="hidden sm:inline">{t.edit}</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-neutral-gray" />
              </button>
            </div>
          </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Home size={20} className="text-atlantic-blue" />
              <h3 className="text-lg font-semibold text-atlantic-blue">{t.property}</h3>
            </div>
            <p className="text-lg font-medium text-neutral-gray ml-7">
              {reservation.properties.name}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-atlantic-blue" />
              <h3 className="text-lg font-semibold text-atlantic-blue">{t.guestInfo}</h3>
            </div>
            <div className="ml-7 space-y-3">
              <div>
                <p className="text-sm text-neutral-gray mb-1">{t.name}</p>
                <p className="text-base font-medium">
                  {reservation.guest_name || t.noData}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-gray mb-1">{t.email}</p>
                <p className="text-base font-medium">
                  {reservation.guest_email || t.noData}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Phone size={16} className="text-neutral-gray" />
                  <p className="text-sm text-neutral-gray">{t.phone}</p>
                </div>
                <p className="text-base font-medium">
                  {reservation.guest_phone || t.noData}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-atlantic-blue" />
              <h3 className="text-lg font-semibold text-atlantic-blue">{t.reservationInfo}</h3>
            </div>
            <div className="ml-7 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-gray mb-1">{t.checkIn}</p>
                <p className="text-base font-medium">
                  {format(new Date(reservation.check_in), 'dd/MM/yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-gray mb-1">{t.checkOut}</p>
                <p className="text-base font-medium">
                  {format(new Date(reservation.check_out), 'dd/MM/yyyy')}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Moon size={16} className="text-neutral-gray" />
                  <p className="text-sm text-neutral-gray">{t.nights}</p>
                </div>
                <p className="text-base font-medium">{reservation.nights}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign size={16} className="text-neutral-gray" />
                  <p className="text-sm text-neutral-gray">{t.amount}</p>
                </div>
                <p className="text-base font-medium text-atlantic-blue">
                  {reservation.total_amount
                    ? `€${reservation.total_amount.toFixed(2)}`
                    : t.noData}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-gray mb-1">{t.status}</p>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value as 'confirmed' | 'cancelled' | 'completed')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors focus:ring-2 focus:ring-atlantic-blue focus:outline-none ${getStatusColor(currentStatus)}`}
                >
                  <option value="confirmed">{t.confirmed}</option>
                  <option value="completed">{t.completed}</option>
                  <option value="cancelled">{t.cancelled}</option>
                </select>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={16} className="text-neutral-gray" />
                  <p className="text-sm text-neutral-gray">{t.source}</p>
                </div>
                <p className="text-base font-medium">
                  {reservation.source || t.noData}
                </p>
              </div>
            </div>
          </div>

          {reservation.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={20} className="text-atlantic-blue" />
                <h3 className="text-lg font-semibold text-atlantic-blue">{t.notes}</h3>
              </div>
              <p className="text-base text-neutral-gray ml-7 whitespace-pre-wrap">
                {reservation.notes}
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-neutral-gray" />
              <p className="text-sm text-neutral-gray">{t.createdAt}</p>
            </div>
            <p className="text-sm font-medium ml-6">
              {format(new Date(reservation.created_at), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-neutral-gray rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t.close}
            </button>
            {currentStatus !== reservation.status && (
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="flex-1 px-4 py-3 bg-atlantic-blue text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? t.updating : t.updateStatus}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>

    <EditReservationModal
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
      onSuccess={() => {
        setShowEditModal(false);
        if (onUpdate) onUpdate();
        onClose();
      }}
      reservation={reservation}
    />
    </>
  );
};
