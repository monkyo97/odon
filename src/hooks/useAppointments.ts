import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
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
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      console.log('appointmentData', appointmentData )
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          //...appointmentData,
          time: appointmentData.time,
          date: appointmentData.date,
          duration: appointmentData.duration,
          notes: appointmentData.notes,
          patient_name: appointmentData.patientName,
          patient_phone:  appointmentData.patientPhone,
          procedure: appointmentData.procedure,
          status: appointmentData.status,
          dentist: user.name
        }])
        .select()
        .single();

      if (error) throw error;
      
      setAppointments(prev => [...prev, data]);
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