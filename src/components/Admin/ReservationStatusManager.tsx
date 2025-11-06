import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const ReservationStatusManager = () => {
  useEffect(() => {
    checkAndUpdateReservations();

    const interval = setInterval(() => {
      checkAndUpdateReservations();
    }, 60000 * 60);

    return () => clearInterval(interval);
  }, []);

  const checkAndUpdateReservations = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data: expiredReservations, error: fetchError } = await supabase
        .from('reservations')
        .select('id, property_id, guest_name, check_out, properties(name)')
        .eq('status', 'confirmed')
        .lt('check_out', todayISO);

      if (fetchError) throw fetchError;

      if (expiredReservations && expiredReservations.length > 0) {
        const reservationIds = expiredReservations.map(r => r.id);

        const { error: updateError } = await supabase
          .from('reservations')
          .update({ status: 'completed' })
          .in('id', reservationIds);

        if (updateError) throw updateError;

        console.log(`Updated ${expiredReservations.length} reservations to completed status`);

        for (const reservation of expiredReservations) {
          await createNotification({
            reservation_id: reservation.id,
            property_name: reservation.properties?.name || 'Propiedad',
            guest_name: reservation.guest_name || 'Huésped',
            check_out_date: reservation.check_out,
          });
        }
      }
    } catch (error) {
      console.error('Error checking reservation status:', error);
    }
  };

  const createNotification = async (data: {
    reservation_id: string;
    property_name: string;
    guest_name: string;
    check_out_date: string;
  }) => {
    try {
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (!adminProfiles || adminProfiles.length === 0) return;

      const notifications = adminProfiles.map(admin => ({
        user_id: admin.id,
        title: 'Reserva completada automáticamente',
        message: `La reserva de ${data.guest_name} en ${data.property_name} ha sido marcada como completada. Fecha de salida: ${new Date(data.check_out_date).toLocaleDateString('es-ES')}`,
        type: 'reservation_completed',
        related_id: data.reservation_id,
        read: false,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  return null;
};
