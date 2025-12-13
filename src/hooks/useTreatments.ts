import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export interface Treatment {
  id: string;
  patientId: string;
  toothNumber: string;
  procedure: string;
  surface: string;
  dentist: string; // Display name
  dentistId?: string; // ID
  notes: string;
  cost: number;
  date: string;
  status: 'planned' | 'in_progress' | 'completed';
  duration?: number;
  materials?: string;
  complications?: string;
  followUpDate?: string;
  created_date?: string; // For sorting
}

// Zod schema for filters
const treatmentFilterSchema = z.object({
  status: z.string().optional(),
  dentistId: z.string().optional(),
  date: z.string().optional(),
  procedure: z.string().optional(),
});

export type TreatmentFilters = z.infer<typeof treatmentFilterSchema>;

const PAGE_SIZE = 20;

export const useTreatments = (patientId: string) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  
  const { user } = useAuth();

  // Initialize form
  const formMethods = useForm<TreatmentFilters>({
    resolver: zodResolver(treatmentFilterSchema),
    defaultValues: {
      status: '',
      dentistId: '',
      date: '',
      procedure: ''
    }
  });

  const { watch, reset } = formMethods;
  
  // Watch all filters
  const filters = watch();

  const fetchTreatments = async () => {
    if (!user || !patientId) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('treatments')
        .select(`
            *,
            dentist:dentists (
                id,
                name
            )
        `, { count: 'exact' })
        .eq('patient_id', patientId)
        .eq('status', '1'); // Query active only

      // Apply Filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status_treatments', filters.status);
      }
      if (filters.dentistId && filters.dentistId !== 'all') {
        query = query.eq('dentist_id', filters.dentistId);
      }
      if (filters.date) {
        query = query.eq('date', filters.date);
      }
      if (filters.procedure) {
        query = query.ilike('procedure', `%${filters.procedure}%`);
      }

      // Pagination
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, error, count } = await query
        .order('date', { ascending: false })
        .range(from, to);

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
        followUpDate: item.follow_up_date,
        created_date: item.created_date
      })) || [];
      
      setTreatments(formattedTreatments);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));

    } catch (error) {
      console.error('Error fetching treatments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset page when filters change (except just page) - Effectively we watch filters.
  // Actually, if filters change, we should reset page to 1?
  // We can do this in a separate useEffect watching filters (but exclude page)
  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.dentistId, filters.date, filters.procedure]);


  // CRUD Operations (Keep existing logic but refresh list on success)
  const createTreatment = async (treatmentData: Omit<Treatment, 'id' | 'dentist'> & { dentistId?: string }) => {
    if (!user || !patientId) return;

    try {
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
          status_treatments: treatmentData.status,
          status: '1',
          duration: treatmentData.duration,
          materials: treatmentData.materials,
          complications: treatmentData.complications,
          follow_up_date: treatmentData.followUpDate,
          created_by_user: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      fetchTreatments(); // Refresh list
      return data;
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
      if (updates.dentistId !== undefined) dbUpdates.dentist_id = updates.dentistId;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.cost !== undefined) dbUpdates.cost = updates.cost;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.status) dbUpdates.status_treatments = updates.status;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.materials !== undefined) dbUpdates.materials = updates.materials;
      if (updates.complications !== undefined) dbUpdates.complications = updates.complications;
      if (updates.followUpDate !== undefined) dbUpdates.follow_up_date = updates.followUpDate;

      const { error } = await supabase
        .from('treatments')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      fetchTreatments();
    } catch (error) {
      console.error('Error updating treatment:', error);
      throw error;
    }
  };

  const deleteTreatment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('treatments')
        .update({ status: '0' })
        .eq('id', id);

      if (error) throw error;
      fetchTreatments();
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
    
        const targetDentistId = dentistId || user?.id; 

      const newTreatment = {
        patient_id: patientId,
        tooth_number: originalTreatment.toothNumber,
        procedure: originalTreatment.procedure,
        surface: originalTreatment.surface,
        dentist_id: targetDentistId,
        notes: originalTreatment.notes,
        cost: originalTreatment.cost,
        date: new Date().toISOString().split('T')[0],
        status_treatments: 'planned', 
        status: '1', 
        duration: originalTreatment.duration,
        materials: originalTreatment.materials,
        complications: originalTreatment.complications,
        follow_up_date: null,
        created_by_user: user?.id,
      };

      const { data, error } = await supabase
        .from('treatments')
        .insert([newTreatment])
        .select()
        .single();

      if (error) throw error;
      fetchTreatments();
      return data;
    } catch (error) {
        console.error('Error duplicating treatment:', error);
        throw error;
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, [user, patientId, page, JSON.stringify(filters)]);

  return {
    treatments,
    loading,
    totalCount,
    totalPages,
    page,
    setPage,
    formMethods, // Expose form methods to UI
    resetFilters: () => {
       reset({
        status: '',
        dentistId: '',
        date: '',
        procedure: ''
       });
       setPage(1);
    },
    createTreatment,
    updateTreatment,
    deleteTreatment,
    duplicateTreatment,
    refetch: fetchTreatments
  };
};