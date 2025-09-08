import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birth_date: string;
  age: number;
  address: string;
  medical_history: string;
  emergency_contact: string;
  emergency_phone: string;
  status: 'active' | 'inactive';
  next_appointment?: string;
  created_at: string;
  updated_at: string;
}

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const { user } = useAuth();

  const fetchPatients = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (patientData: {
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    address: string;
    medicalHistory: string;
    emergencyContact: string;
    emergencyPhone: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([{
          name: patientData.name,
          email: patientData.email,
          phone: patientData.phone,
          birth_date: patientData.birthDate,
          address: patientData.address,
          medical_history: patientData.medicalHistory,
          emergency_contact: patientData.emergencyContact,
          emergency_phone: patientData.emergencyPhone,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;
      
      setPatients(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      console.log({id: id});
      console.log({updates :updates});
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      console.log('error', error);
      if (error) throw error;
      
      setPatients(prev => 
        prev.map(patient => 
          patient.id === id ? { ...patient, ...data } : patient
        )
      );
      return data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  };

  const deletePatient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPatients(prev => prev.filter(patient => patient.id !== id));
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  };

  const searchPatient = async (query: string) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .ilike('name', `%${query}%`);

    if (error) throw error;
    setPatientsList(data || []);
  } catch (error) {
    console.error('Error searching patients:', error);
  }
};
  
  const getPatientById = (id: string) => {
    return patients.find(patient => patient.id === id);
  };

  useEffect(() => {
    fetchPatients();
  }, [user]);

  return {
    patients,
    loading,
    createPatient,
    updatePatient,
    deletePatient,
    searchPatient,
    patientsList,
    getPatientById,
    refetch: fetchPatients
  };
};