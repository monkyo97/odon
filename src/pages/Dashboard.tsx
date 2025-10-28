import React from 'react';
import { Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { usePatients } from '../hooks/usePatients';
import { useAppointments } from '../hooks/useAppointments';

export const Dashboard: React.FC = () => {
  const { patients } = usePatients();
  const { appointments } = useAppointments();
  
  // Calculate today's appointments
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.date === today);
  const pendingAppointments = todayAppointments.filter(apt => apt.status === 'scheduled').length;
  
  const stats = [
    {
      title: 'Pacientes Totales',
      value: patients.length.toString(),
      change: '+12%',
      trend: 'up' as const,
      icon: Users,
      color: 'blue' as const
    },
    {
      title: 'Citas Hoy',
      value: todayAppointments.length.toString(),
      change: `${pendingAppointments} pendientes`,
      trend: 'neutral' as const,
      icon: Calendar,
      color: 'green' as const
    },
    {
      title: 'Tratamientos Activos',
      value: '45',
      change: '+5 esta semana',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'purple' as const
    },
    {
      title: 'Urgencias',
      value: '3',
      change: 'Requieren atención',
      trend: 'down' as const,
      icon: AlertCircle,
      color: 'red' as const
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Resumen general de la clínica dental</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Citas</h3>
          <div className="space-y-4">
            {todayAppointments.slice(0, 4).map((appointment, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-b-0 space-y-2 sm:space-y-0">
                <div>
                  <p className="font-medium text-gray-900">{appointment.patient_name}</p>
                  <p className="text-sm text-gray-600">{appointment.procedure}</p>
                </div>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded self-start sm:self-auto">
                  {appointment.time}
                </span>
              </div>
            ))}
            {todayAppointments.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay citas programadas para hoy</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            {[
              { action: 'Nuevo paciente registrado', patient: 'Laura Hernández', time: 'hace 2 horas' },
              { action: 'Odontograma actualizado', patient: 'Pedro Sánchez', time: 'hace 4 horas' },
              { action: 'Tratamiento completado', patient: 'Ana Martínez', time: 'hace 6 horas' },
              { action: 'Cita reagendada', patient: 'Carlos López', time: 'hace 1 día' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.patient} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};