import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Appointment {
  id: string;
  patientId?: string; //DB: patient_id
  patientName: string; //DB: patient_name
  patientPhone: string; //DB: patient_phone
  date: string;
  time: string;
  duration: number;
  procedure: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  dentist: string;
  created_at: string;
  updated_at: string;
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
      
      // Format the data to match our interface
      const formattedAppointments = (data || []).map(item => ({
        id: item.id,
        patientId: item.patient_id,
        patientName: item.patient_name,
        patientPhone: item.patient_phone,
        date: item.date,
        time: item.time,
        duration: item.duration,
        procedure: item.procedure,
        status: item.status,
        notes: item.notes,
        dentist: item.dentist,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          patient_id: appointmentData.patientId || null,
          time: appointmentData.time,
          date: appointmentData.date,
          duration: appointmentData.duration,
          notes: appointmentData.notes,
          patient_name: appointmentData.patientName,
          patient_phone:  appointmentData.patientPhone,
          procedure: appointmentData.procedure,
          status: appointmentData.status,
          dentist: user?.user_metadata?.name
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Format the response to match our interface
      const formattedAppointment = {
        id: data.id,
        patientId: data.patient_id,
        patientName: data.patient_name,
        patientPhone: data.patient_phone,
        date: data.date,
        time: data.time,
        duration: data.duration,
        procedure: data.procedure,
        status: data.status,
        notes: data.notes,
        dentist: data.dentist,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setAppointments(prev => [...prev, formattedAppointment]);
      return data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id ? { ...appointment, ...data } : appointment
        )
      );
      return data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
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
    refetch: fetchAppointments
  };
};