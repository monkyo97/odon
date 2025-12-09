import { Users, Calendar, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';

export const Dashboard: React.FC = () => {
  const { data: metrics, isLoading } = useDashboardMetrics();

  const stats = [
    {
      title: 'Pacientes Totales',
      value: metrics?.totalPatients.toString() || '0',
      change: 'Registrados',
      trend: 'up' as const,
      icon: Users,
      color: 'blue' as const
    },
    {
      title: 'Citas Hoy',
      value: metrics?.appointmentsToday.toString() || '0',
      change: `${metrics?.appointmentsPending || 0} pendientes`,
      trend: 'neutral' as const,
      icon: Calendar,
      color: 'green' as const
    },
    {
      title: 'Tratamientos Activos',
      value: metrics?.activeTreatments.toString() || '0',
      change: 'En proceso',
      trend: 'neutral' as const,
      icon: TrendingUp,
      color: 'purple' as const
    },
    {
      title: 'Urgencias',
      value: metrics?.urgencies.toString() || '0',
      change: 'Requieren atención',
      trend: metrics?.urgencies ? 'down' as const : 'neutral' as const, // Red alert if > 0
      icon: AlertCircle,
      color: 'red' as const
    }
  ];

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Cargando métricas...</div>;
  }

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
            {metrics?.todayAppointmentsList?.slice(0, 4).map((appointment: any, index: number) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-b-0 space-y-2 sm:space-y-0">
                <div>
                  <p className="font-medium text-gray-900">{appointment.patient_name || 'Paciente Sin Nombre'}</p>
                  <p className="text-sm text-gray-600">{appointment.procedure || 'Consulta General'}</p>
                </div>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded self-start sm:self-auto">
                  {appointment.time}
                </span>
              </div>
            ))}
            {(!metrics?.todayAppointmentsList || metrics.todayAppointmentsList.length === 0) && (
              <p className="text-gray-500 text-center py-4">No hay citas programadas para hoy</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex justify-between items-center">
            <span>Ventas esta semana</span>
            <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
              ${metrics?.weeklySales.toLocaleString() || '0'}
            </span>
          </h3>
          <div className="space-y-4">
            {metrics?.recentSales?.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay ventas registradas esta semana</p>
            )}
            {metrics?.recentSales?.map((sale: any, index: number) => (
              <div key={index} className="flex items-start space-x-3 border-b border-gray-50 pb-3 last:border-b-0">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{sale.procedure}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-600">
                      {new Date(sale.date).toLocaleDateString()}
                    </p>
                    <span className="text-sm font-bold text-gray-700">
                      ${sale.cost?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};