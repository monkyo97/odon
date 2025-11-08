import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { ToothCondition } from '../pages/patients/viewPatientDetail/components/Odontogram';

export const useToothConditions = (patientId: string) => {
  const [conditions, setConditions] = useState<ToothCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchConditions = async () => {
    if (!user || !patientId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tooth_conditions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedConditions = data?.map(item => ({
        id: item.id,
        toothNumber: item.tooth_number,
        surface: item.surface,
        condition: item.condition,
        status: item.status,
        notes: item.notes || '',
        date: item.date
      })) || [];
      
      setConditions(formattedConditions);
    } catch (error) {
      console.error('Error fetching tooth conditions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCondition = async (conditionData: ToothCondition) => {
    if (!user || !patientId) return;

    try {
      const { data, error } = await supabase
        .from('tooth_conditions')
        .insert([{
          patient_id: patientId,
          tooth_number: conditionData.toothNumber,
          surface: conditionData.surface,
          condition: conditionData.condition,
          status: conditionData.status,
          notes: conditionData.notes,
          date: conditionData.date
        }])
        .select()
        .single();

      if (error) throw error;
      
      const formattedCondition = {
        id: data.id,
        toothNumber: data.tooth_number,
        surface: data.surface,
        condition: data.condition,
        status: data.status,
        notes: data.notes || '',
        date: data.date
      };
      
      setConditions(prev => [formattedCondition, ...prev]);
      return formattedCondition;
    } catch (error) {
      console.error('Error creating tooth condition:', error);
      throw error;
    }
  };

  const updateCondition = async (id: string, updates: Partial<ToothCondition>) => {
    try {
      const dbUpdates: any = {};
      if (updates.toothNumber) dbUpdates.tooth_number = updates.toothNumber;
      if (updates.surface) dbUpdates.surface = updates.surface;
      if (updates.condition) dbUpdates.condition = updates.condition;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.date) dbUpdates.date = updates.date;

      const { data, error } = await supabase
        .from('tooth_conditions')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const formattedCondition = {
        id: data.id,
        toothNumber: data.tooth_number,
        surface: data.surface,
        condition: data.condition,
        status: data.status,
        notes: data.notes || '',
        date: data.date
      };
      
      setConditions(prev => 
        prev.map(condition => 
          condition.id === id ? { ...condition, ...formattedCondition } : condition
        )
      );
      return formattedCondition;
    } catch (error) {
      console.error('Error updating tooth condition:', error);
      throw error;
    }
  };

  const deleteCondition = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tooth_conditions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setConditions(prev => prev.filter(condition => condition.id !== id));
    } catch (error) {
      console.error('Error deleting tooth condition:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchConditions();
  }, [user, patientId]);

  return {
    conditions,
    loading,
    createCondition,
    updateCondition,
    deleteCondition,
    refetch: fetchConditions
  };
};