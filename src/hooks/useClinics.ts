import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Clinic {
  id: string;
  name: string;
  ruc?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  website?: string;
  status: '1' | '0';
  created_by_user?: string;
  created_date?: string;
  created_by_ip?: string;
  updated_by_user?: string;
  updated_date?: string;
  updated_by_ip?: string;
}

export const useClinics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
  // 🔹 Obtener clínica del usuario
  // -------------------------------
  const fetchClinic = async (): Promise<Clinic | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('created_by_user', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['clinic', user?.id],
    queryFn: fetchClinic,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // -------------------------------
  // 🧩 Crear clínica
  // -------------------------------
  const createClinic = useMutation({
    mutationFn: async (clinicData: Omit<Clinic, 'id'>) => {
      if (!user) throw new Error('Usuario no disponible');
      const ip = await getIpAddress();

      const { data, error } = await supabase
        .from('clinics')
        .insert([
          {
            ...clinicData,
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
      queryClient.invalidateQueries({ queryKey: ['clinic', user?.id] });
    },
  });

  // -------------------------------
  // 🧩 Actualizar clínica
  // -------------------------------
  const updateClinic = useMutation({
    mutationFn: async (updates: Partial<Clinic>) => {
      if (!data?.id || !user) throw new Error('Clínica o usuario no disponible');

      const ip = await getIpAddress();
      const payload = {
        ...updates,
        updated_by_user: user.id,
        updated_by_ip: ip,
        updated_date: new Date().toISOString(),
      };

      const { data: updated, error } = await supabase
        .from('clinics')
        .update(payload)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic', user?.id] });
    },
  });

  return {
    clinic: data,
    loading: isLoading,
    error,
    refetch,
    createClinic,
    updateClinic,
  };
};
