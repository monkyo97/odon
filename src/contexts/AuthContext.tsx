import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  specialty?: string;
  licenseNumber?: string;
  clinicName?: string;
  clinicAddress?: string;
}

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (error) return false;
    setUser(data.user);
    return true;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { name: userData.name }
        }
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from('user_profiles').insert([{
          user_id: data.user.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          specialty: userData.specialty || 'Odontología General',
          license_number: userData.licenseNumber || '',
          clinic_name: userData.clinicName || '',
          clinic_address: userData.clinicAddress || ''
        }]);

        setUser(data.user);
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      console.error('Error registrando usuario:', err);
      setIsLoading(false);
      return false;
    }

    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
