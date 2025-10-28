import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
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
  const [clinicId, setClinicId] = useState<string | null>(
    () => sessionStorage.getItem('clinic_id') || null
  );
  const [isLoading, setIsLoading] = useState(true);

  const sessionLoadedRef = useRef(false); // 🧠 Evita doble fetch inicial

  const fetchClinicId = useCallback(async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('clinic_id')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.warn('No se pudo obtener clinic_id del usuario:', error.message);
    setClinicId(null);
    sessionStorage.removeItem('clinic_id');
  } else {
    const id = data?.clinic_id ?? null;
    // 🔹 Solo actualizar si realmente cambió
    setClinicId((prev) => {
      if (prev !== id) {
        if (id) sessionStorage.setItem('clinic_id', id);
        else sessionStorage.removeItem('clinic_id');
        return id;
      }
      return prev;
    });
  }
}, []);


  useEffect(() => {
  let initialSessionHandled = false;

  const loadSession = async () => {
    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user ?? null;
    setUser(sessionUser);

    if (sessionUser) {
      await fetchClinicId(sessionUser.id);
    }

    setIsLoading(false);
    initialSessionHandled = true;
  };

  loadSession();

  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    // 🚫 Ignorar el primer evento "INITIAL_SESSION" (Supabase lo dispara siempre)
    if (!initialSessionHandled && event === 'INITIAL_SESSION') return;

    const activeUser = session?.user ?? null;
    setUser(activeUser);

    if (activeUser) {
      fetchClinicId(activeUser.id);
    } else {
      setClinicId(null);
      sessionStorage.removeItem('clinic_id');
    }
  });

  return () => {
    listener.subscription.unsubscribe();
  };
}, [fetchClinicId]);


  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setIsLoading(false);

      if (error) return { user: null, error };

      setUser(data.user);
      await fetchClinicId(data.user.id);
      sessionLoadedRef.current = true; // 🟩 Evita repetición tras login

      return { user: data.user, error: null };
    },
    [fetchClinicId]
  );

  const register = useCallback(
    async (userData: RegisterData) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: { data: { name: userData.name } },
        });

        if (error) throw error;
        const createdUser = data.user;
        if (!createdUser) throw new Error('No se pudo crear el usuario.');

        const clinicId = createdUser.id;

        await supabase.from('clinics').insert([
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

        await supabase.from('user_profiles').insert([
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

        setUser(createdUser);
        setClinicId(clinicId);
        sessionStorage.setItem('clinic_id', clinicId);
        sessionLoadedRef.current = true;

        return { user: createdUser, error: null };
      } catch (err: any) {
        console.error('Error al registrar usuario o clínica:', err);
        return { user: null, error: err };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchClinicId]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setClinicId(null);
    sessionStorage.removeItem('clinic_id');
  }, []);

  const value = useMemo(
    () => ({
      user,
      clinicId,
      login,
      register,
      logout,
      isLoading,
    }),
    [user, clinicId, login, register, logout, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
