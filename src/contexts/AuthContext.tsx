import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  clinicId: string | null;
  login: (email: string, password: string) => Promise<{ user: any | null; error: any | null }>;
  register: (userData: RegisterData) => Promise<{ user: any | null; error: any | null }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🌀 Cargar sesión activa + perfil del usuario
  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        await fetchClinicId(sessionUser.id);
      }

      setIsLoading(false);
    };

    loadSession();

    // Escucha cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user ?? null;
      setUser(activeUser);

      if (activeUser) {
        fetchClinicId(activeUser.id);
      } else {
        setClinicId(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🏥 Obtener clinic_id del perfil del usuario
  const fetchClinicId = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('clinic_id')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.warn('No se pudo obtener clinic_id del usuario:', error.message);
      setClinicId(null);
    } else {
      setClinicId(data?.clinic_id ?? null);
    }
  };

  // 🔐 LOGIN
  const login = async (
    email: string,
    password: string
  ): Promise<{ user: any | null; error: any | null }> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (error) return { user: null, error };

    setUser(data.user);
    await fetchClinicId(data.user.id);

    return { user: data.user, error: null };
  };

  // 🏥 REGISTRO CLÍNICA + PERFIL ADMIN
  const register = async (
    userData: RegisterData
  ): Promise<{ user: any | null; error: any | null }> => {
    setIsLoading(true);
    try {
      // 1️⃣ Crear usuario
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { name: userData.name },
        },
      });

      if (error) throw error;
      const createdUser = data.user;
      if (!createdUser) throw new Error('No se pudo crear el usuario.');

      const clinicId = createdUser.id; // el id del usuario = id de la clínica (1:1 relación)

      // 2️⃣ Crear registro en la tabla clinics
      const { error: clinicError } = await supabase.from('clinics').insert([
        {
          id: clinicId,
          name: userData.clinicName || 'Clínica sin nombre',
          email: userData.email,
          phone: userData.phone || '',
          address: userData.clinicAddress || '',
          status: '1',
          created_by_user: createdUser.id,
          created_date: new Date().toISOString(),
        },
      ]);
      if (clinicError) throw clinicError;

      // 3️⃣ Crear el perfil del usuario
      const { error: profileError } = await supabase.from('user_profiles').insert([
        {
          user_id: createdUser.id,
          clinic_id: clinicId,
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          specialty: userData.specialty || 'Odontología General',
          license_number: userData.licenseNumber || '',
          role: 'admin',
          status: '1',
          created_by_user: createdUser.id,
          created_date: new Date().toISOString(),
        },
      ]);
      if (profileError) throw profileError;

      setUser(createdUser);
      setClinicId(clinicId);

      return { user: createdUser, error: null };
    } catch (err: any) {
      console.error('Error al registrar usuario o clínica:', err);
      return { user: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setClinicId(null);
  };

  return (
    <AuthContext.Provider value={{ user, clinicId, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🪝 Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
