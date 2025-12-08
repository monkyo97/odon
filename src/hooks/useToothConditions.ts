// src/hooks/useToothConditions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '@contexts/AuthContext';

export interface ToothCondition {
  id?: string;
  patient_id: string;
  tooth_number: number;
  surface:
    | 'oclusal' | 'vestibular' | 'lingual'
    | 'mesial'  | 'distal'     | 'incisal'
    | 'cervical'| 'completa';
  condition: string;
  status_tooth_conditions?: 'planificado' | 'en_proceso' | 'completado';
  notes?: string;
  date?: string;
  status?: '1' | '0';
  created_by_user?: string;
  created_date?: string;
  updated_by_user?: string;
  updated_date?: string;
}

export const useToothConditions = (patientId?: string) => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const fetcher = async (): Promise<ToothCondition[]> => {
    if (!patientId) return [];
    const { data, error } = await supabase
      .from('tooth_conditions')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', '1')
      .order('tooth_number', { ascending: true });
    if (error) throw error;
    return data || [];
  };

  const query = useQuery({
    queryKey: ['tooth_conditions', patientId],
    queryFn: fetcher,
    enabled: !!patientId,
    staleTime: 60_000,
  });

  const createCondition = useMutation({
    mutationFn: async (payload: Omit<ToothCondition, 'id'>) => {
      if (!user) throw new Error('Usuario no autenticado');
      const { data, error } = await supabase
        .from('tooth_conditions')
        .insert([{ ...payload, status: '1', created_by_user: user.id, created_date: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tooth_conditions', patientId] }),
  });

  const updateCondition = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ToothCondition> }) => {
      const { data, error } = await supabase
        .from('tooth_conditions')
        .update({ ...updates, updated_by_user: user?.id, updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tooth_conditions', patientId] }),
  });

  const deleteCondition = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tooth_conditions')
        .update({ status: '0', updated_by_user: user?.id, updated_date: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tooth_conditions', patientId] }),
  });

  return {
    conditions: query.data || [],
    loading: query.isLoading,
    refetch: query.refetch,
    createCondition,
    updateCondition,
    deleteCondition,
  };
};
