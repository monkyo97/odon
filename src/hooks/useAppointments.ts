// src/hooks/useAppointments.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Dentist } from './useDentists';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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

// Zod schema for filters
const appointmentFilterSchema = z.object({
  status: z.string().optional(),
  dentistId: z.string().optional(),
  date: z.string().optional(),
  procedure: z.string().optional(),
});

export type AppointmentFilters = z.infer<typeof appointmentFilterSchema>;

const PAGE_SIZE = 20;

export const useAppointments = (initialPage: number = 1, patientId?: string) => {
  const { clinicId, user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(initialPage);

  // Initialize form
  const formMethods = useForm<AppointmentFilters>({
    resolver: zodResolver(appointmentFilterSchema),
    defaultValues: {
      status: '',
      dentistId: '',
      date: '',
      procedure: ''
    }
  });

  const { watch, reset } = formMethods;
  const filters = watch();

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.dentistId, filters.date, filters.procedure]);

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

    // 🧠 Si hay patientId, filtramos por él (Client-Specific)
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    // Apply Additional Filters
    if (filters.status && filters.status !== 'all') {
      // Logic for status grouping if needed, or direct match
      if (filters.status === 'active') {
        query = query.in('status_appointments', ['scheduled', 'confirmed']);
      } else {
        query = query.eq('status_appointments', filters.status);
      }
    }
    
    if (filters.dentistId && filters.dentistId !== 'all') {
      query = query.eq('dentist_id', filters.dentistId);
    }

    if (filters.date) {
      if (filters.date === 'today') {
        const today = new Date().toISOString().split('T')[0];
        query = query.eq('date', today);
      } else if (filters.date === 'tomorrow') {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        query = query.eq('date', d.toISOString().split('T')[0]);
      } else if (filters.date === 'week') {
         // Implement week logic or simple range if date is YYYY-MM-DD
         // If filter.date is a specific date string:
         query = query.eq('date', filters.date);
      } else {
         // Specific date
         query = query.eq('date', filters.date);
      }
    }

    if (filters.procedure) {
      query = query.ilike('procedure', `%${filters.procedure}%`);
    }

    // Traemos en orden descendente de fecha y hora
    const { data, error, count } = await query
      .order('date', { ascending: false })
      .order('time', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    return {
      data: data || [],
      count: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / PAGE_SIZE)),
    };
  };

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['appointments', clinicId, page, patientId, JSON.stringify(filters)],
    queryFn: fetchAppointments,
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const getIpAddress = async (): Promise<string> => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch {
      return '0.0.0.0';
    }
  };

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
      queryClient.invalidateQueries({ queryKey: ['appointments', clinicId] });
    },
  });

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

  return {
    appointments: data?.data || [],
    totalAppointments: data?.count || 0,
    totalPages: data?.totalPages || 1,
    loading: isLoading || isFetching,
    error,
    refetch,
    page,
    setPage,
    formMethods,
    resetFilters: () => {
        reset({
            status: '',
            dentistId: '',
            date: '',
            procedure: ''
        });
        setPage(1);
    },
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };
};
