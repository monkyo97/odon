import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useSupabaseUserUpdate = () => {
  // 🔑 Actualizar correo
  const updateEmail = useMutation({
    mutationFn: async (newEmail: string) => {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw new Error(error.message);
      return true;
    },
  });

  // 🔒 Actualizar contraseña
  const updatePassword = useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      return true;
    },
  });

  return {
    updateEmail,
    updatePassword,
  };
};
