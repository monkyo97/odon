import React, { useState } from 'react';
import { Calendar, Clock, Plus, User, Phone, FileText } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentModal } from './AppointmentModal';
import { usePatients } from '../hooks/usePatients';

interface PatientAppointmentsProps {
  patientId: string;
}

export const PatientAppointments: React.FC<PatientAppointmentsProps> = ({ patientId }) => {
  const { appointments, loading, createAppointment } = useAppointments();
  const { patients } = usePatients();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Find the patient
  const patient = patients.find(p => p.id === patientId);
  
  // Filter appointments for this patient
  const patientAppointments = appointments.filter(apt => 
    apt.patientId === patientId || apt.patientName === patient?.name
  );

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      scheduled: 'Programada',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const sortedAppointments = patientAppointments.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Historial de Citas</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </button>
      </div>

      {sortedAppointments.length > 0 ? (
        <div className="space-y-4">
          {sortedAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{appointment.procedure}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(appointment.date).toLocaleDateString('es-ES')}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {appointment.time} ({appointment.duration} min)
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {appointment.dentist}
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start">
                        <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <p className="text-sm text-gray-700">{appointment.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Editar
                  </button>
                  {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No hay citas registradas para este paciente</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Programar primera cita
          </button>
        </div>
      )}

      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={createAppointment}
      />
    </div>
  );
};