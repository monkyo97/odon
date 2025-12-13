import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useDefaultDentist = (patientId: string | undefined, preselectedDentistId?: string) => {
  const [activeDentistId, setActiveDentistId] = useState<string | undefined>(preselectedDentistId);
  const [loadingContext, setLoadingContext] = useState(true);

  useEffect(() => {
    const fetchContextDentist = async () => {
      // If we already have a preselected dentist from state/props, use it.
      if (preselectedDentistId) {
        setActiveDentistId(preselectedDentistId);
        setLoadingContext(false);
        return;
      }

      if (!patientId) {
        setLoadingContext(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];

        // Requirement:
        // 1. If appointment today -> use it.
        // 2. If no appointment today but future -> use next future one.
        // 3. If none -> no pre-selection.

        const { data, error } = await supabase
          .from('appointments')
          .select('dentist_id')
          .eq('patient_id', patientId)
          .gte('date', today) // Greater than or equal to today
          .eq('status', '1') // Logically active
          .neq('status_appointments', 'cancelled') // Not cancelled
          .not('dentist_id', 'is', null) // Must have a dentist
          .order('date', { ascending: true })
          .order('time', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching dentist context:', error);
        } else if (data && data.dentist_id) {
          setActiveDentistId(data.dentist_id);
        } else {
          setActiveDentistId(undefined);
        }
      } catch (err) {
        console.error('Error in context fetch:', err);
      } finally {
        setLoadingContext(false);
      }
    };

    fetchContextDentist();
  }, [patientId, preselectedDentistId]);

  return { activeDentistId, setActiveDentistId, loadingContext };
};
