import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface DashboardMetrics {
  totalPatients: number;
  appointmentsToday: number;
  appointmentsPending: number;
  activeTreatments: number; // Treatments in progress or completed this week
  urgencies: number;
  weeklySales: number;
  todayAppointmentsList: any[];
  recentSales: any[];
}

import { useAuth } from '../contexts/AuthContext';

export const useDashboardMetrics = () => {
  const { clinicId } = useAuth();
  
  const fetchMetrics = async (): Promise<DashboardMetrics> => {
    if (!clinicId) return {
      totalPatients: 0,
      appointmentsToday: 0,
      appointmentsPending: 0,
      activeTreatments: 0,
      urgencies: 0,
      weeklySales: 0,
      todayAppointmentsList: [],
      recentSales: []
    };

    const today = new Date().toISOString().split('T')[0];
    
    // 1. Total Patients (Direct filter)
    const { count: totalPatients, error: patientsError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', '1');
    if (patientsError) throw patientsError;

    // 2. Appointments Today (Direct filter as per schema usage)
    const { data: todayAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*, patient:patients(name)') 
      .eq('clinic_id', clinicId)
      .eq('date', today)
      .eq('status', '1');

    if (appointmentsError) throw appointmentsError;

    const appointmentsToday = todayAppointments?.length || 0;
    const appointmentsPending = todayAppointments?.filter(a => a.status_appointments === 'scheduled').length || 0;

    // 3. Urgencies (Filter by patient's clinic)
    // We need to join with patients to filter by clinic_id
    const { count: urgencies, error: urgenciesError } = await supabase
      .from('tooth_conditions')
      .select('*, patients!inner(clinic_id)', { count: 'exact', head: true })
      .eq('patients.clinic_id', clinicId)
      .eq('urgency', true)
      .eq('status', '1'); 
    
    //if (urgenciesError) throw urgenciesError; //PENDIENTE ACTIVAR

    // 4. Weekly Sales & Active Treatments
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); 
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    // Fetch sales (Completed treatments this week)
    const { data: treatments, error: treatmentsError } = await supabase
      .from('treatments')
      .select('*, patients!inner(clinic_id)')
      .eq('patients.clinic_id', clinicId)
      .gte('date', startOfWeekStr)
      .eq('status', '1'); 
    
    //if (treatmentsError) throw treatmentsError; //PENDIENTE ACTIVAR

    const weeklySales = treatments?.reduce((sum, t) => sum + (t.cost || 0), 0) || 0;
    const recentSales = treatments?.slice(0, 5) || [];

    // Active Treatments (In progress)
    const { count: activeTreatments, error: activeTreatmentsError } = await supabase
      .from('treatments')
      .select('*, patients!inner(clinic_id)', { count: 'exact', head: true })
      .eq('patients.clinic_id', clinicId)
      .eq('status', '1'); 

    //if (activeTreatmentsError) throw activeTreatmentsError; //PENDIENTE ACTIVAR

    console.log('totalPatients', totalPatients);
    
    return {
      totalPatients: totalPatients || 0,
      appointmentsToday,
      appointmentsPending,
      activeTreatments: activeTreatments || 0,
      urgencies: urgencies || 0,
      weeklySales,
      todayAppointmentsList: todayAppointments || [],
      recentSales: recentSales
    };
  };

  return useQuery({
    queryKey: ['dashboard_metrics', clinicId],
    queryFn: fetchMetrics,
    enabled: !!clinicId,
    refetchInterval: 30000 // Refresh every 30s
  });
};
