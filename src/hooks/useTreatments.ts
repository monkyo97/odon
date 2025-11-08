import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Treatment } from '../pages/patients/viewPatientDetail/components/TreatmentHistory';

export const useTreatments = (patientId: string) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTreatments = async () => {
    if (!user || !patientId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (error) throw error;
      
      const formattedTreatments = data?.map(item => ({
        id: item.id,
        patientId: item.patient_id,
        toothNumber: item.tooth_number || '',
        procedure: item.procedure,
        surface: item.surface || '',
        dentist: item.dentist,
        notes: item.notes || '',
        cost: item.cost || 0,
        date: item.date,
        status: item.status
      })) || [];
      
      setTreatments(formattedTreatments);
    } catch (error) {
      console.error('Error fetching treatments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTreatment = async (treatmentData: Omit<Treatment, 'id'>) => {
    if (!user || !patientId) return;

    try {
      const { data, error } = await supabase
        .from('treatments')
        .insert([{
          patient_id: patientId,
          tooth_number: treatmentData.toothNumber,
          procedure: treatmentData.procedure,
          surface: treatmentData.surface,
          dentist: treatmentData.dentist,
          notes: treatmentData.notes,
          cost: treatmentData.cost,
          date: treatmentData.date,
          status: treatmentData.status
        }])
        .select()
        .single();

      if (error) throw error;
      
      const formattedTreatment = {
        id: data.id,
        patientId: data.patient_id,
        toothNumber: data.tooth_number || '',
        procedure: data.procedure,
        surface: data.surface || '',
        dentist: data.dentist,
        notes: data.notes || '',
        cost: data.cost || 0,
        date: data.date,
        status: data.status
      };
      
      setTreatments(prev => [formattedTreatment, ...prev]);
      return formattedTreatment;
    } catch (error) {
      console.error('Error creating treatment:', error);
      throw error;
    }
  };

  const updateTreatment = async (id: string, updates: Partial<Treatment>) => {
    try {
      const dbUpdates: any = {};
      if (updates.toothNumber !== undefined) dbUpdates.tooth_number = updates.toothNumber;
      if (updates.procedure) dbUpdates.procedure = updates.procedure;
      if (updates.surface !== undefined) dbUpdates.surface = updates.surface;
      if (updates.dentist) dbUpdates.dentist = updates.dentist;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.cost !== undefined) dbUpdates.cost = updates.cost;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.status) dbUpdates.status = updates.status;

      const { data, error } = await supabase
        .from('treatments')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const formattedTreatment = {
        id: data.id,
        patientId: data.patient_id,
        toothNumber: data.tooth_number || '',
        procedure: data.procedure,
        surface: data.surface || '',
        dentist: data.dentist,
        notes: data.notes || '',
        cost: data.cost || 0,
        date: data.date,
        status: data.status
      };
      
      setTreatments(prev => 
        prev.map(treatment => 
          treatment.id === id ? { ...treatment, ...formattedTreatment } : treatment
        )
      );
      return formattedTreatment;
    } catch (error) {
      console.error('Error updating treatment:', error);
      throw error;
    }
  };

  const deleteTreatment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('treatments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTreatments(prev => prev.filter(treatment => treatment.id !== id));
    } catch (error) {
      console.error('Error deleting treatment:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, [user, patientId]);

  return {
    treatments,
    loading,
    createTreatment,
    updateTreatment,
    deleteTreatment,
    refetch: fetchTreatments
  };
};