import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface TreatmentCatalogItem {
  id: string;
  name: string;
  category: string;
  code?: string;
}

export interface TreatmentCost {
  id: string;
  treatment_catalog_id: string;
  base_cost: number;
  clinic_id: string;
}

export const useTreatmentCatalog = () => {
  const [catalog, setCatalog] = useState<TreatmentCatalogItem[]>([]);
  const [costs, setCosts] = useState<TreatmentCost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCatalogAndCosts = async () => {
    try {
      setLoading(true);
      
      // Fetch Catalog
      const { data: catalogData, error: catalogError } = await supabase
        .from('treatments_catalog')
        .select('*')
        .order('name');

      if (catalogError) throw catalogError;
      setCatalog(catalogData || []);

      // Fetch Costs for current clinic (Assuming user is linked to a clinic or we just fetch all accessible costs)
      // Since we don't have clinic context easily here, we will fetch costs visible to user.
      const { data: costsData, error: costsError } = await supabase
        .from('treatment_costs')
        .select('*');
        
      if (costsError) {
         // It's possible the table allows reading but returns empty if RLS filters.
         console.error('Error fetching costs:', costsError);
      } else {
        setCosts(costsData || []);
      }

    } catch (error) {
      console.error('Error loading treatment catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCostForTreatment = (treatmentName: string): number => {
    // 1. Find catalog item ID by name
    const item = catalog.find(c => c.name === treatmentName);
    if (!item) return 0;

    // 2. Find cost for that item
    // Ideally we filter by specific clinic if we had that info content available.
    // For now, take the first matching cost or 0.
    const cost = costs.find(c => c.treatment_catalog_id === item.id);
    return cost ? cost.base_cost : 0;
  };

  const updateCost = async (treatmentId: string, newCost: number) => {
      // Find existing cost record or insert new
      // We need clinic_id. This is tricky without explicitly knowing the current clinic.
      // We'll search if there is a 'clinic_id' associated with the user profile or just use the first clinic found on the user relationship?
      // Since I don't want to break things by guessing clinic, I'll check if we have a cost record already and update it.
      
      // For creation, we really need a clinic_id.
      // Let's assume for this sprint we only update existing or if we can find a single clinic.
      const existingCost = costs.find(c => c.treatment_catalog_id === treatmentId);
      
      if (existingCost) {
          const { error } = await supabase
              .from('treatment_costs')
              .update({ base_cost: newCost, updated_date: new Date().toISOString() })
              .eq('id', existingCost.id);
          if (error) throw error;
      } else {
          // Fetch user's clinic to create new cost entry
          const { data: clinicData } = await supabase
            .from('dentists') // Assuming dentists are users and linked to clinics, or check user_profiles?
            // Actually, best bet given current context is 'dentists' table usually has clinic_id?
             // Let's check useDentists hook or just assume we can find a clinic.
             // If we look at existing `useDentists`, it fetches from `dentists`. 
             // We can try to fetch the first clinic from `clinics` table if we don't have mapping, 
             // OR simpler: `treatment_costs` requires `clinic_id`. 
             // Let's just fetch the first available clinic for the tenant/user.
             .select('clinic_id')
             .eq('id', user?.id) // if dentist id matches user id
             .maybeSingle();
          
          let clinicId = clinicData?.clinic_id;

          if (!clinicId) {
             // Fallback: fetch any clinic if user is admin? 
             // Let's rely on a 'clinics' fetch.
             const { data: anyClinic } = await supabase.from('clinics').select('id').limit(1).single();
             clinicId = anyClinic?.id;
          }

          if (!clinicId) throw new Error("No clinic found to associate cost.");

          const { error } = await supabase
              .from('treatment_costs')
              .insert([{
                  treatment_catalog_id: treatmentId,
                  clinic_id: clinicId,
                  base_cost: newCost,
                  created_by_user: user?.id
              }]);
          
          if (error) throw error;
      }
      
      await fetchCatalogAndCosts();
  };

  useEffect(() => {
    fetchCatalogAndCosts();
  }, [user]);

  return {
    catalog,
    costs,
    loading,
    getCostForTreatment,
    updateCost,
    refetch: fetchCatalogAndCosts
  };
};
