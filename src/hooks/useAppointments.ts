import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Appointment {
  id: string;
  clinic_id?: string;
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  dentistId?: string;
  date: string;
  time: string;
  duration?: number;
  procedure?: string;
  /** Estado funcional */
  status_appointments: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  /** Estado lógico */
  status: '1' | '0';
  notes?: string;
  dentist?: string;
  created_at?: string;
  updated_at?: string;
}

const PAGE_SIZE = 20;

export const useAppointments = () => {
  const { user, clinicId } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);

  // 🔹 Obtener IP del cliente
  const getIpAddress = async (): Promise<string> => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch {
      return '0.0.0.0';
    }
  };

  // 🔁 Mapeo de datos desde la BD al modelo frontend
  const mapAppointment = (item: any): Appointment => ({
    id: item.id,
    clinic_id: item.clinic_id,
    patientId: item.patient_id,
    patientName: item.patient_name,
    patientPhone: item.patient_phone,
    dentistId: item.dentist_id,
    date: item.date,
    time: item.time,
    duration: item.duration,
    procedure: item.procedure,
    status_appointments: item.status_appointments,
    status: item.status,
    notes: item.notes,
    dentist: item.dentist_id,
    created_at: item.created_date,
    updated_at: item.updated_date,
  });

  // 🔹 Obtener citas paginadas
  const fetchAppointments = useCallback(
    async (pageNumber: number = 1) => {
      if (!clinicId) return;
      setLoading(true);
      try {
        const from = (pageNumber - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error, count } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('clinic_id', clinicId)
          .eq('status', '1') // solo activas
          .order('date', { ascending: true })
          .order('time', { ascending: true })
          .range(from, to);

        if (error) throw error;

        const formatted = (data || []).map(mapAppointment);
        setAppointments(formatted);
        setTotalAppointments(count || 0);
        setTotalPages(Math.max(1, Math.ceil((count || 0) / PAGE_SIZE)));
        setPage(pageNumber);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    },
    [clinicId]
  );

  useEffect(() => {
    if (!clinicId) return;
    fetchAppointments(1);
  }, [clinicId]);

  // 🧩 Crear cita
  const createAppointment = async (
    appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user || !clinicId) return;

    try {
      const ip = await getIpAddress();

      const payload = {
        clinic_id: clinicId,
        patient_id: appointmentData.patientId || null,
        patient_name: appointmentData.patientName || null,
        patient_phone: appointmentData.patientPhone || null,
        dentist_id: appointmentData.dentistId || null,
        date: appointmentData.date,
        time: appointmentData.time,
        duration: appointmentData.duration || null,
        procedure: appointmentData.procedure || '',
        status_appointments: appointmentData.status_appointments || 'scheduled',
        status: '1', // activo por defecto
        notes: appointmentData.notes || '',
        created_by_user: user.id,
        created_by_ip: ip,
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      if (page === 1) {
        setAppointments((prev) => [data, ...prev].slice(0, PAGE_SIZE));
      }

      setTotalAppointments((prev) => prev + 1);
      setTotalPages((prev) => Math.ceil((prev * PAGE_SIZE + 1) / PAGE_SIZE));
      return data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  };

  console.log('appointments updateAppointment', appointments);
  // ✏️ Actualizar cita
  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (!user || !clinicId) return;

    try {
      const ip = await getIpAddress();

      const payload: any = {
        ...(updates.patientId !== undefined && { patient_id: updates.patientId }),
        ...(updates.patientName !== undefined && { patient_name: updates.patientName }),
        ...(updates.patientPhone !== undefined && { patient_phone: updates.patientPhone }),
        ...(updates.dentistId !== undefined && { dentist_id: updates.dentistId }),
        ...(updates.date !== undefined && { date: updates.date }),
        ...(updates.time !== undefined && { time: updates.time }),
        ...(updates.duration !== undefined && { duration: updates.duration }),
        ...(updates.procedure !== undefined && { procedure: updates.procedure }),
        ...(updates.status_appointments !== undefined && {
          status_appointments: updates.status_appointments,
        }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
        updated_by_user: user.id,
        updated_by_ip: ip,
      };

      const { data, error } = await supabase
        .from('appointments')
        .update(payload)
        .eq('id', id)
        .eq('clinic_id', clinicId)
        .select()
        .single();

      if (error) throw error;

      console.log('data appointments', data);
      console.log('appt.id === id', id);
      
      setAppointments((prev) =>
        prev.map((appt) => (appt.id === id ? { ...appt, ...data } : appt))
      );

      return data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  // ❌ Eliminar (inactivar) cita
  const deleteAppointment = async (id: string) => {
    if (!user || !clinicId) return;

    try {
      const ip = await getIpAddress();

      const { error } = await supabase
        .from('appointments')
        .update({
          status: '0', // inactiva
          updated_by_user: user.id,
          updated_by_ip: ip,
        })
        .eq('id', id)
        .eq('clinic_id', clinicId);

      if (error) throw error;

      setAppointments((prev) => prev.filter((a) => a.id !== id));
      setTotalAppointments((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  };

  return {
    appointments,
    loading,
    page,
    totalPages,
    totalAppointments,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };
};
