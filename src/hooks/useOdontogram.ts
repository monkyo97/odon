import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Odontogram, ToothCondition, ToothConditionType, Surface } from '../types/odontogram';
import { useAuth } from '@contexts/AuthContext';

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
      .order('date', { ascending: false })
      .order('created_date', { ascending: false }); // Corrected from created_at
    
    if (error) throw error;
    return data || [];
  };

  const { data: odontograms, isLoading: loadingOdontograms } = useQuery({
    queryKey: ['odontograms', patientId],
    queryFn: fetchOdontograms,
    enabled: !!patientId,
  });

  // 2. Fetch Conditions for a specific Odontogram
  const fetchConditions = async (odontogramId: string): Promise<ToothCondition[]> => {
    const { data, error } = await supabase
      .from('tooth_conditions')
      .select('*')
      .eq('odontogram_id', odontogramId);
    
    if (error) throw error;
    return data || [];
  };

  // Logic to determine which odontogram to show
  const latestOdontogram = odontograms?.[0];
  const currentOdontogram = activeOdontogramId 
    ? odontograms?.find(o => o.id === activeOdontogramId) || latestOdontogram
    : latestOdontogram;

  const { data: conditions, isLoading: loadingConditions, refetch: refetchConditions } = useQuery({
    queryKey: ['tooth_conditions', currentOdontogram?.id],
    queryFn: () => fetchConditions(currentOdontogram!.id),
    enabled: !!currentOdontogram?.id,
  });

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
          created_by_user: user.id,
          created_by_ip: ip,
          created_date: new Date().toISOString(), // Explicitly set created_date
          updated_by_user: user.id,
          updated_by_ip: ip,
          updated_date: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (createError) throw createError;

      // 2. If there is a previous odontogram, copy its conditions
      if (latestOdontogram) {
        const previousConditions = await fetchConditions(latestOdontogram.id);
        
        if (previousConditions.length > 0) {
          const conditionsToCopy = previousConditions.map(c => ({
            odontogram_id: newOdontogram.id,
            tooth_number: c.tooth_number,
            surface: c.surface,
            condition_type: c.condition_type,
            status: 'existing', // Mark copied conditions as 'existing'
            notes: c.notes,
            created_by_user: user.id,
            created_by_ip: ip,
            created_date: new Date().toISOString(),
            updated_by_user: user.id,
            updated_by_ip: ip,
            updated_date: new Date().toISOString()
          }));

          const { error: copyError } = await supabase
            .from('tooth_conditions')
            .insert(conditionsToCopy);
            
          if (copyError) throw copyError;
        }
      }

      return newOdontogram;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['odontograms', patientId] }),
  });

  // 4. Save/Update Condition
  const saveCondition = useMutation({
    mutationFn: async (payload: { 
      odontogramId: string; 
      toothNumber: number; 
      rangeEndTooth?: number; // Needed for ranges
      surface: Surface; 
      condition: ToothConditionType;
      notes?: string;
      cost?: number; // Needed for list view
    }) => {
      if (!user) throw new Error('No user');
      const ip = await getIp();

      // First, try to find existing condition on this surface
      // For ranges, we assume surface is 'whole' usually, but let's keep generic
      const { data: existing } = await supabase
        .from('tooth_conditions')
        .select('id')
        .eq('odontogram_id', payload.odontogramId)
        .eq('tooth_number', payload.toothNumber)
        .eq('surface', payload.surface)
        // If it's a range start, we might want to check if there is an existing range? 
        // For simplicity, we overwrite if same tooth/surface.
        .single();

      if (existing) {
        // Update or Delete
        if (payload.condition === 'healthy') {
            const { error } = await supabase.from('tooth_conditions').delete().eq('id', existing.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
            .from('tooth_conditions')
            .update({ 
                condition_type: payload.condition,
                range_end_tooth: payload.rangeEndTooth, // Add this
                notes: payload.notes,
                cost: payload.cost, // Add this
                updated_by_user: user.id,
                updated_by_ip: ip,
                updated_date: new Date().toISOString()
            })
            .eq('id', existing.id);
            if (error) throw error;
        }
      } else {
        // Insert
        if (payload.condition !== 'healthy') {
            const { error } = await supabase
            .from('tooth_conditions')
            .insert([{
                odontogram_id: payload.odontogramId,
                tooth_number: payload.toothNumber,
                range_end_tooth: payload.rangeEndTooth, // Add this
                surface: payload.surface,
                condition_type: payload.condition,
                status: 'planned', 
                notes: payload.notes,
                cost: payload.cost, // Add this
                created_by_user: user.id,
                created_by_ip: ip,
                created_date: new Date().toISOString(),
                updated_by_user: user.id,
                updated_by_ip: ip,
                updated_date: new Date().toISOString()
            }]);
            if (error) throw error;
        }
      }
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['tooth_conditions', variables.odontogramId] });
    },
  });

  return {
    odontograms,
    latestOdontogram, // Keep for check if exists
    currentOdontogram,
    conditions: conditions || [],
    loading: loadingOdontograms || loadingConditions,
    createOdontogram,
    saveCondition,
    refetchConditions
  };
};
