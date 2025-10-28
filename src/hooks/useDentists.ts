// src/hooks/useDentists.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Dentist {
  id: string;
  clinic_id?: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  license_number?: string;
  status: '1' | '0';
  created_by_user?: string;
  created_date?: string;
  created_by_ip?: string;
  updated_by_user?: string;
  updated_date?: string;
  updated_by_ip?: string;
}

const PAGE_SIZE = 20;

export const useDentists = (page: number = 1) => {
  const { clinicId, user } = useAuth();
  const queryClient = useQueryClient();

  // -------------------------------
  // 🔹 Obtener listado de odontólogos
  // -------------------------------
  const fetchDentists = async () => {
    if (!clinicId) return { data: [], count: 0, totalPages: 1 };

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await supabase
      .from('dentists')
      .select('*', { count: 'exact' })
      .eq('clinic_id', clinicId)
      //.eq('status', '1')
      .order('created_date', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    return {
      data: data || [],
      count: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / PAGE_SIZE)),
    };
  };

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['dentists', clinicId, page],
    queryFn: fetchDentists,
    enabled: !!clinicId, // sólo cuando haya clínica
    staleTime: 1000 * 60 * 5, // 5 min antes de refrescar
    //cacheTime: 1000 * 60 * 10, // 10 min en caché
    retry: 1, // 1 intento si falla
    refetchOnWindowFocus: false, // no recargar al volver a la pestaña
  });

  // -------------------------------
  // 🧠 Helper para obtener IP
  // -------------------------------
  const getIpAddress = async (): Promise<string> => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch {
      return '0.0.0.0';
    }
  };

  // -------------------------------
  // 🧩 Crear odontólogo
  // -------------------------------
  const createDentist = useMutation({
    mutationFn: async (dentistData: Omit<Dentist, 'id'>) => {
      if (!user || !clinicId) throw new Error('Usuario o clínica no disponible');

      const ip = await getIpAddress();

      const { data, error } = await supabase
        .from('dentists')
        .insert([
          {
            ...dentistData,
            clinic_id: clinicId,
            status: '1',
            created_by_user: user.id,
            created_by_ip: ip,
            created_date: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      // 🔄 Refresca automáticamente el listado
      queryClient.invalidateQueries({ queryKey: ['dentists', clinicId] });
    },
  });

  // -------------------------------
  // 🧩 Actualizar odontólogo
  // -------------------------------
  const updateDentist = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Dentist> }) => {
      if (!user || !clinicId) throw new Error('Usuario o clínica no disponible');

      const ip = await getIpAddress();

      const payload = {
        ...updates,
        updated_by_user: user.id,
        updated_by_ip: ip,
        updated_date: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('dentists')
        .update(payload)
        .eq('id', id)
        .eq('clinic_id', clinicId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dentists', clinicId] });
    },
  });

  // -------------------------------
  // 🧩 Eliminar (borrado lógico)
  // -------------------------------
  const deleteDentist = useMutation({
    mutationFn: async (id: string) => {
      if (!user || !clinicId) throw new Error('Usuario o clínica no disponible');

      const ip = await getIpAddress();

      const { error } = await supabase
        .from('dentists')
        .update({
          status: '0',
          updated_by_user: user.id,
          updated_by_ip: ip,
          updated_date: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('clinic_id', clinicId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dentists', clinicId] });
    },
  });

  // -------------------------------
  // 🔁 Retorno del hook
  // -------------------------------
  return {
    dentists: data?.data || [],
    totalDentists: data?.count || 0,
    totalPages: data?.totalPages || 1,
    loading: isLoading || isFetching,
    error,
    refetch,
    createDentist,
    updateDentist,
    deleteDentist,
  };
};
