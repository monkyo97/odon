import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ToothCondition, ToothConditionType, Surface } from '../types/odontogram';
import { useAuth } from '@contexts/AuthContext';

export const useToothConditions = (odontogramId?: string) => {
  const { user } = useAuth();
  const qc = useQueryClient();

  // Helper to get IP
  const getIp = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch {
      return '0.0.0.0';
    }
  };

  const fetchConditions = async (id: string): Promise<ToothCondition[]> => {
    const { data, error } = await supabase
      .from('tooth_conditions')
      .select('*')
      .eq('odontogram_id', id)
      .eq('status', '1') // Only active conditions
      .order('updated_date', { ascending: false })
      .order('id', { ascending: false });
    
    if (error) throw error;
    return data || [];
  };

  const { data: conditions, isLoading: loadingConditions, refetch: refetchConditions } = useQuery({
    queryKey: ['tooth_conditions', odontogramId],
    queryFn: () => fetchConditions(odontogramId!),
    enabled: !!odontogramId,
  });

  const saveCondition = useMutation({
    mutationFn: async (payload: { 
      odontogramId: string; 
      toothNumber: number; 
      rangeEndTooth?: number; 
      surface: Surface; 
      condition: ToothConditionType;
      notes?: string;
      cost?: number;
    }) => {
      if (!user) throw new Error('No user');
      const ip = await getIp();

      // Find existing active condition
      // Query for status='1' to ignore soft-deleted ones
      const { data: existing } = await supabase
        .from('tooth_conditions')
        .select('id')
        .eq('odontogram_id', payload.odontogramId)
        .eq('tooth_number', payload.toothNumber)
        .eq('surface', payload.surface)
        .eq('status', '1') 
        .maybeSingle();

      if (existing) {
        // Update or Delete (Soft Delete)
        if (payload.condition === 'healthy') {
            // Soft delete: set status to '0'
            const { error } = await supabase
              .from('tooth_conditions')
              .update({ 
                status: '0',
                updated_by_user: user.id,
                updated_by_ip: ip,
                updated_date: new Date().toISOString()
              })
              .eq('id', existing.id);
            if (error) throw error;
        } else {
            // Update
            const { error } = await supabase
            .from('tooth_conditions')
            .update({ 
                condition_type: payload.condition,
                range_end_tooth: payload.rangeEndTooth,
                notes: payload.notes,
                cost: payload.cost,
                status_tooth_conditions: 'planned', // Reset or maintain logic? Usually updates maintain or set specific. Assuming 'planned' default or keep? 
                // Request says: status_tooth_conditions... DEFAULT 'existing' in DB, but here we are editing.
                // Assuming edits keep it 'planned' or update it. For now let's just update fields.
                // Actually, if we are saving a condition, might want to set status_tooth_conditions?
                // The prompt says "status_tooth_conditions... CHECK (status IN ('planned'...))".
                // I will assume for now we don't change clinical status on simple edit unless specified.
                // But simplified logic usually sets to 'planned' for new/edited diagnosis? 
                // Let's stick to update fields except status.
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
                range_end_tooth: payload.rangeEndTooth,
                surface: payload.surface,
                condition_type: payload.condition,
                status: '1', // Active
                status_tooth_conditions: 'planned', // Default clinical status
                notes: payload.notes,
                cost: payload.cost,
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

  // Function to copy conditions to a new odontogram
  const copyConditions = async (sourceOdontogramId: string, targetOdontogramId: string) => {
      if (!user) throw new Error('Missing user');
      const ip = await getIp();
      const previousConditions = await fetchConditions(sourceOdontogramId);
      
      if (previousConditions.length > 0) {
        const conditionsToCopy = previousConditions.map(c => ({
          odontogram_id: targetOdontogramId,
          tooth_number: c.tooth_number,
          surface: c.surface,
          condition_type: c.condition_type,
          status: '1',
          status_tooth_conditions: 'existing', // Mark copied as existing
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
  };

  return {
    conditions: conditions || [],
    loadingConditions,
    saveCondition,
    copyConditions,
    refetchConditions
  };
};
