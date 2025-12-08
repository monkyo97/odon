// src/hooks/useOdontogramNotes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '@contexts/AuthContext';

export const useOdontogramNotes = (patientId?: string) => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['patient_notes', patientId],
    enabled: !!patientId,
    queryFn: async () => {
      const { data, error } = await supabase.from('patient_notes').select('*').eq('patient_id', patientId).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data ?? null;
    },
  });

  const saveNotes = useMutation({
    mutationFn: async (notes: string) => {
      const { data, error } = await supabase
        .from('patient_notes')
        .upsert({
          patient_id: patientId, notes,
          updated_by_user: user?.id, updated_date: new Date().toISOString(),
        })
        .select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient_notes', patientId] }),
  });

  return { notes: query.data, loading: query.isLoading, saveNotes };
};
