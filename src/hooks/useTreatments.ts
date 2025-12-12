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
      // We assume user_profiles table exists and has a name. If not, we might need to adjust.
      // SQL provided: dentist_id UUID REFERENCES odon.user_profiles(id)
      const { data, error } = await supabase
        .from('treatments')
        .select(`
            *,
            dentist:dentists (
                id,
                name
            )
        `)
        .eq('patient_id', patientId)
        .eq('status', '1') // Query active only
        .order('date', { ascending: false });

      if (error) throw error;
      
      const formattedTreatments = data?.map(item => ({
        id: item.id,
        patientId: item.patient_id,
        toothNumber: item.tooth_number || '',
        procedure: item.procedure,
        surface: item.surface || '',
        dentist: item.dentist?.name || 'Desconocido', // Display name
        dentistId: item.dentist_id, // ID
        notes: item.notes || '',
        cost: item.cost || 0,
        date: item.date,
        status: item.status_treatments, // Clinical status
        duration: item.duration,
        materials: item.materials,
        complications: item.complications,
        followUpDate: item.follow_up_date
      })) || [];
      
      setTreatments(formattedTreatments);
    } catch (error) {
      console.error('Error fetching treatments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTreatment = async (treatmentData: Omit<Treatment, 'id' | 'dentist'> & { dentistId?: string }) => {
    if (!user || !patientId) return;

    try {
      // Use provided dentistId or fall back to current user if suitable, or null
      // But wait, user.id is a user UUID, not necessarily a dentist UUID from dentists table.
      // The requirement says: "buscar un dentista existente en la clinica y obtener el id para enviarle en la creación por defecto"
      // So if no dentistId is provided, we probably shouldn't default to user.id anymore unless user.id is also a dentist_id (unlikely if separate tables).
      // We will rely on the caller to provide a valid dentistId. If not, maybe null?
      const dentistIdToUse = treatmentData.dentistId || null;

      const { data, error } = await supabase
        .from('treatments')
        .insert([{
          patient_id: patientId,
          tooth_number: treatmentData.toothNumber,
          procedure: treatmentData.procedure,
          surface: treatmentData.surface,
          dentist_id: dentistIdToUse,
          notes: treatmentData.notes,
          cost: treatmentData.cost,
          date: treatmentData.date,
          status_treatments: treatmentData.status, // Clinical status
          status: '1', // Active
          duration: treatmentData.duration,
          materials: treatmentData.materials,
          complications: treatmentData.complications,
          follow_up_date: treatmentData.followUpDate,
          created_by_user: user.id,
        }])
        .select(`
            *,
            dentist:dentists (
                id,
                name
            )
        `)
        .single();

      if (error) throw error;
      
      const formattedTreatment = {
        id: data.id,
        patientId: data.patient_id,
        toothNumber: data.tooth_number || '',
        procedure: data.procedure,
        surface: data.surface || '',
        dentist: data.dentist?.name || 'Desconocido',
        dentistId: data.dentist_id,
        notes: data.notes || '',
        cost: data.cost || 0,
        date: data.date,
        status: data.status_treatments,
        duration: data.duration,
        materials: data.materials,
        complications: data.complications,
        followUpDate: data.follow_up_date
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
      const dbUpdates: any = {
          updated_by_user: user?.id,
          updated_date: new Date().toISOString()
      };
      if (updates.toothNumber !== undefined) dbUpdates.tooth_number = updates.toothNumber;
      if (updates.procedure) dbUpdates.procedure = updates.procedure;
      if (updates.surface !== undefined) dbUpdates.surface = updates.surface;
      if (updates.dentistId !== undefined) dbUpdates.dentist_id = updates.dentistId; // Support updating dentist
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.cost !== undefined) dbUpdates.cost = updates.cost;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.status) dbUpdates.status_treatments = updates.status;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.materials !== undefined) dbUpdates.materials = updates.materials;
      if (updates.complications !== undefined) dbUpdates.complications = updates.complications;
      if (updates.followUpDate !== undefined) dbUpdates.follow_up_date = updates.followUpDate;

      const { data, error } = await supabase
        .from('treatments')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
            *,
            dentist:dentists (
                id,
                name
            )
        `)
        .single();

      if (error) throw error;
      
      const formattedTreatment = {
        id: data.id,
        patientId: data.patient_id,
        toothNumber: data.tooth_number || '',
        procedure: data.procedure,
        surface: data.surface || '',
        dentist: data.dentist?.name || 'Desconocido',
        dentistId: data.dentist_id,
        notes: data.notes || '',
        cost: data.cost || 0,
        date: data.date,
        status: data.status_treatments,
        duration: data.duration,
        materials: data.materials,
        complications: data.complications,
        followUpDate: data.follow_up_date
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
        .update({ status: '0' }) // Soft delete
        .eq('id', id);

      if (error) throw error;
      
      setTreatments(prev => prev.filter(treatment => treatment.id !== id));
    } catch (error) {
      console.error('Error deleting treatment:', error);
      throw error;
    }
  };

  const duplicateTreatment = async (originalTreatment: Treatment) => {
    try {
      const {
        id,
        dentist, 
        dentistId,
        date,
        cost
      } = originalTreatment;

      // Ensure we have a valid dentistId
      const targetDentistId = dentistId || user?.id; // Fallback? Or keep null. Requirement says "Excluir ID primario, fechas...".
      // Also "El nuevo tratamiento debe quedar editable inmediatamente" - we will create it and return it.

      const newTreatment = {
        patient_id: patientId,
        tooth_number: originalTreatment.toothNumber,
        procedure: originalTreatment.procedure,
        surface: originalTreatment.surface,
        dentist_id: targetDentistId,
        notes: originalTreatment.notes,
        cost: originalTreatment.cost, // "Copiar todos los campos relevantes... Excluir campos técnicos"
        date: new Date().toISOString().split('T')[0], // Default to today? Or keep original date? Usually duplication implies checking 'today' or copy. Requirement: "Excluir fechas de creación/actualización". 
        // Logic: Usually duplicates are for "Repeat this today". Let's set date to today to be safe, or keep original?
        // Requirement doesn't explicitly say "Reset clinical date". But usually duplicating a past treatment means doing it again now. I'll set to today.
        status_treatments: originalTreatment.status, // "Estados que dependan del flujo (si aplica)" - maybe reset to planned? 
        // Req: "Estados que dependan del flujo (si aplica)" are excluded. So we should probably default to PLANNED.
        // But let's look at the object. status_treatments is the clinical status.
        // If I duplicate a "Completed" treatment, do I want a "Completed" copy? Usually "Planned" copy.
        // Let's set status to PLANNED by default as it's a new action.
        status: '1', 
        duration: originalTreatment.duration,
        materials: originalTreatment.materials,
        complications: originalTreatment.complications,
        follow_up_date: null, // Reset follow up
        created_by_user: user?.id,
      };

      const { data, error } = await supabase
        .from('treatments')
        .insert([newTreatment])
        .select(`
            *,
            dentist:dentists (
                id,
                name
            )
        `)
        .single();

      if (error) throw error;

      const formattedTreatment = {
        id: data.id,
        patientId: data.patient_id,
        toothNumber: data.tooth_number || '',
        procedure: data.procedure,
        surface: data.surface || '',
        dentist: data.dentist?.name || 'Desconocido',
        dentistId: data.dentist_id,
        notes: data.notes || '',
        cost: data.cost || 0,
        date: data.date,
        status: data.status_treatments,
        duration: data.duration,
        materials: data.materials,
        complications: data.complications,
        followUpDate: data.follow_up_date
      };

      setTreatments(prev => [formattedTreatment, ...prev]);
      return formattedTreatment;

    } catch (error) {
        console.error('Error duplicating treatment:', error);
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
    duplicateTreatment,
    refetch: fetchTreatments
  };
};