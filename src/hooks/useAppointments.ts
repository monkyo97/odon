// src/hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Dentist } from './useDentists';

export interface Appointment {
  id: string;
  clinic_id?: string;
  patient_id?: string;
  patient_name?: string;
  patient_phone?: string;
  dentist_id?: string;
  date: string;
  time: string;
  duration: number;
  procedure?: string;
  /** Estado funcional */
  status_appointments: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  /** Estado lógico */
  status: '1' | '0';
  notes?: string;
  dentist?: Dentist;
  created_at?: string;
  updated_at?: string;
}

const PAGE_SIZE = 20;

export const useAppointments = (page: number = 1, patientId?: string) => {
  const { clinicId, user } = useAuth();
  const queryClient = useQueryClient();

  // -------------------------------
  // 🔹 Obtener listado de citas
  // -------------------------------
  const fetchAppointments = async () => {
    if (!clinicId) return { data: [], count: 0, totalPages: 1 };

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('appointments')
      .select(
        `*, 
        dentist:dentists (
            id,
            name,
            specialty
        )`, { count: 'exact' })
      .eq('clinic_id', clinicId);

    // 🧠 Si hay patientId, filtramos por él
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    // Traemos en orden descendente de fecha y hora
    const { data, error, count } = await query
      .order('date', { ascending: false })
      .order('time', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    // 🧠 Ordenar en memoria por prioridad de estado
    // Prioridades:
    // 1. confirmed → 0
    // 2. scheduled → 1
    // 3. completed → 2
    // 4. cancelled → 3
    const priority = {
      confirmed: 0,
      scheduled: 0,
      completed: 1,
      cancelled: 2,
    } as const;

    const sortedData = (data || []).sort((a, b) => {
      const priorityA = priority[a.status_appointments as keyof typeof priority] ?? 99;
      const priorityB = priority[b.status_appointments as keyof typeof priority] ?? 99;

      if (priorityA !== priorityB) return priorityA - priorityB;

      // Si tienen la misma prioridad, ordena por fecha y hora descendente
      const dateA = new Date(`${a.date}T${a.time}:00`);
      const dateB = new Date(`${b.date}T${b.time}:00`);
      return dateB.getTime() - dateA.getTime();
    });

    return {
      data: sortedData,
      count: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / PAGE_SIZE)),
    };
  };


  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['appointments', clinicId, page, patientId], // 🧠 Agregamos patientId a la key
    queryFn: fetchAppointments,
    enabled: !!clinicId, // solo cuando haya clínica activa
    staleTime: 1000 * 60 * 5, // 5 min antes de volver a refrescar
    retry: 1,
    refetchOnWindowFocus: false,
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
  // 🧩 Crear cita
  // -------------------------------
  const createAppointment = useMutation({
    mutationFn: async (appointmentData: Omit<Appointment, 'id'>) => {
      if (!user || !clinicId) throw new Error('Usuario o clínica no disponible');

      const ip = await getIpAddress();

      const payload = {
        ...appointmentData,
        clinic_id: clinicId,
        status: '1',
        created_by_user: user.id,
        created_by_ip: ip,
        created_date: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      // 🔄 Refresca automáticamente el listado
      queryClient.invalidateQueries({ queryKey: ['appointments', clinicId] });
    },
  });

  // -------------------------------
  // 🧩 Actualizar cita
  // -------------------------------
  const updateAppointment = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Appointment> }) => {
      if (!user || !clinicId) throw new Error('Usuario o clínica no disponible');

      const ip = await getIpAddress();

      const payload = {
        ...updates,
        updated_by_user: user.id,
        updated_by_ip: ip,
        updated_date: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('appointments')
        .update(payload)
        .eq('id', id)
        .eq('clinic_id', clinicId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', clinicId] });
    },
  });

  // -------------------------------
  // 🧩 Eliminar (borrado lógico)
  // -------------------------------
  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      if (!user || !clinicId) throw new Error('Usuario o clínica no disponible');

      const ip = await getIpAddress();

      const { error } = await supabase
        .from('appointments')
        .update({
          status_appointments: 'cancelled',
          updated_by_user: user.id,
          updated_by_ip: ip,
          updated_date: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('clinic_id', clinicId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', clinicId] });
    },
  });

  // -------------------------------
  // 🔁 Retorno del hook
  // -------------------------------
  return {
    appointments: data?.data || [],
    totalAppointments: data?.count || 0,
    totalPages: data?.totalPages || 1,
    loading: isLoading || isFetching,
    error,
    refetch,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };
};
