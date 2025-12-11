import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Odontogram } from '../types/odontogram';
import { useAuth } from '@contexts/AuthContext';
import { useToothConditions } from './useToothConditions';

export const useOdontogram = (patientId?: string, activeOdontogramId?: string) => {
  const { user } = useAuth();
  const qc = useQueryClient();

  // Helper to get IP (simplified)
  const getIp = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch {
      return '0.0.0.0';
    }
  };

  // 1. Fetch Odontograms (Versions)
  const fetchOdontograms = async (): Promise<Odontogram[]> => {
    if (!patientId) return [];
    const { data, error } = await supabase
      .from('odontograms')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', '1') // Only active odontograms
      .order('date', { ascending: false })
      .order('created_date', { ascending: false }); 
    
    if (error) throw error;
    return data || [];
  };

  const { data: odontograms, isLoading: loadingOdontograms } = useQuery({
    queryKey: ['odontograms', patientId],
    queryFn: fetchOdontograms,
    enabled: !!patientId,
  });

  // Logic to determine which odontogram to show
  const latestOdontogram = odontograms?.[0];
  const currentOdontogram = activeOdontogramId 
    ? odontograms?.find(o => o.id === activeOdontogramId) || latestOdontogram
    : latestOdontogram;

  // Use the separate hook for conditions logic
  const { 
    conditions, 
    loadingConditions, 
    saveCondition, 
    copyConditions,
    refetchConditions 
  } = useToothConditions(currentOdontogram?.id);

  // 3. Create New Odontogram (Version) with History Copy
  const createOdontogram = useMutation({
    mutationFn: async (name: string) => {
      if (!user || !patientId) throw new Error('Missing user or patient');
      const ip = await getIp();
      
      // 1. Create the new Odontogram record
      const { data: newOdontogram, error: createError } = await supabase
        .from('odontograms')
        .insert([{
          patient_id: patientId,
          name,
          date: new Date().toISOString(),
          type: 'evolution',
          status: '1', // Active by default
          created_by_user: user.id,
          created_by_ip: ip,
          created_date: new Date().toISOString(),
          updated_by_user: user.id,
          updated_by_ip: ip,
          updated_date: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (createError) throw createError;

      // 2. If there is a previous odontogram, copy its conditions
      if (latestOdontogram) {
        await copyConditions(latestOdontogram.id, newOdontogram.id);
      }

      return newOdontogram;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['odontograms', patientId] }),
  });

  return {
    odontograms,
    latestOdontogram,
    currentOdontogram,
    conditions,
    loading: loadingOdontograms || loadingConditions,
    createOdontogram,
    saveCondition,
    refetchConditions
  };
};
