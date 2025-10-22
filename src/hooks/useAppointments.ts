import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Appointment {
  id: string;
  patientId?: string; // DB: patient_id
  patientName?: string; // DB: patient_name (nuevo)
  patientPhone?: string; // DB: patient_phone
  dentistId?: string; // DB: dentist_id
  date: string;
  time: string;
  duration?: number;
  procedure?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  dentist?: string; // referencia o nombre visible
  created_at?: string;
  updated_at?: string;
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;

      const formatted = (data || []).map((item) => ({
        id: item.id,
        patientId: item.patient_id,
        patientName: item.patient_name,
        patientPhone: item.patient_phone,
        dentistId: item.dentist_id,
        date: item.date,
        time: item.time,
        duration: item.duration,
        procedure: item.procedure,
        status: item.status_appointments || item.status,
        notes: item.notes,
        dentist: item.dentist_id,
        created_at: item.created_date,
        updated_at: item.updated_date,
      }));

      setAppointments(formatted);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (
    appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return;

    try {
      // Capturar IP (opcional)
      const ip = await fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => '0.0.0.0');

      const payload: any = {
        patient_id: appointmentData.patientId || null,
        patient_name: appointmentData.patientId ? null : appointmentData.patientName || null,
        patient_phone: appointmentData.patientPhone || null,
        dentist_id: appointmentData.dentistId || null,
        date: appointmentData.date,
        time: appointmentData.time,
        duration: appointmentData.duration || null,
        procedure: appointmentData.procedure || '',
        status_appointments: appointmentData.status || 'scheduled',
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

      const newAppointment: Appointment = {
        id: data.id,
        patientId: data.patient_id,
        patientName: data.patient_name,
        patientPhone: data.patient_phone,
        dentistId: data.dentist_id,
        date: data.date,
        time: data.time,
        duration: data.duration,
        procedure: data.procedure,
        status: data.status_appointments,
        notes: data.notes,
        created_at: data.created_date,
      };

      setAppointments((prev) => [...prev, newAppointment]);
      return newAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const payload: any = {
        ...(updates.patientId !== undefined && { patient_id: updates.patientId }),
        ...(updates.patientName !== undefined && { patient_name: updates.patientName }),
        ...(updates.patientPhone !== undefined && { patient_phone: updates.patientPhone }),
        ...(updates.dentistId !== undefined && { dentist_id: updates.dentistId }),
        ...(updates.date !== undefined && { date: updates.date }),
        ...(updates.time !== undefined && { time: updates.time }),
        ...(updates.duration !== undefined && { duration: updates.duration }),
        ...(updates.procedure !== undefined && { procedure: updates.procedure }),
        ...(updates.status !== undefined && { status_appointments: updates.status }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
        updated_by_user: user?.id,
        updated_date: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('appointments')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAppointments((prev) =>
        prev.map((appt) => (appt.id === id ? { ...appt, ...data } : appt))
      );

      return data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  return {
    appointments,
    loading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch: fetchAppointments,
  };
};
