import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface UserProfile {
  id: string;
  user_id: string;
  clinic_id?: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  license_number?: string;
  role: 'admin' | 'dentist' | 'assistant' | 'reception';
  avatar_url?: string;
  bio?: string;
  years_experience?: number;
  status: '1' | '0';
  created_by_user?: string;
  created_date?: string;
  created_by_ip?: string;
  updated_by_user?: string;
  updated_date?: string;
  updated_by_ip?: string;
}

export const useUserProfile = () => {
  const { user, clinicId } = useAuth();
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
  // 🔹 Obtener perfil
  // -------------------------------
  const fetchUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: fetchUserProfile,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // -------------------------------
  // 🧩 Crear perfil
  // -------------------------------
  const createUserProfile = useMutation({
    mutationFn: async (profileData: Omit<UserProfile, 'id'>) => {
      if (!user) throw new Error('Usuario no disponible');
      const ip = await getIpAddress();

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            ...profileData,
            user_id: user.id,
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
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
    },
  });

  // -------------------------------
  // 🧩 Actualizar perfil
  // -------------------------------
  const updateUserProfile = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!data?.id || !user) throw new Error('Perfil o usuario no disponible');

      const ip = await getIpAddress();
      const payload = {
        ...updates,
        updated_by_user: user.id,
        updated_by_ip: ip,
        updated_date: new Date().toISOString(),
      };

      const { data: updated, error } = await supabase
        .from('user_profiles')
        .update(payload)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
    },
  });

  
  // -------------------------------
  // 🧩 Actualizar perfil
  // -------------------------------
  const updateUserProfileEmail = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!data?.id || !user) throw new Error('Perfil o usuario no disponible');

      const ip = await getIpAddress();
      const payload = {
        email: updates.email,
        updated_by_user: user.id,
        updated_by_ip: ip,
        updated_date: new Date().toISOString(),
      };

      const { data: updated, error } = await supabase
        .from('user_profiles')
        .update(payload)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
    },
  });

  // -------------------------------
  // 🔑 Cambiar contraseña
  // -------------------------------
  const changePassword = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      if (!user) throw new Error('Usuario no disponible');

      // Supabase Auth gestiona el cambio directamente
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
    },
  });

  return {
    profile: data,
    loading: isLoading,
    error,
    refetch,
    createUserProfile,
    updateUserProfile,
    changePassword,
    updateUserProfileEmail,
  };
};
