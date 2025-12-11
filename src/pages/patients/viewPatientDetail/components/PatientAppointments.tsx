import React, { useState } from 'react';
import { Calendar, Clock, Plus, User, FileText, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { useAppointments, Appointment } from '../../../../hooks/useAppointments';
import { AppointmentModal } from '../../../appointments/components/AppointmentModal';
import { appointmentColors, appointmentStatuses } from '../../../../constants/constantsAppointments';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Notifications } from '@/components/Notifications';

interface PatientAppointmentsProps {
  patientId: string;
}

export const PatientAppointments: React.FC<PatientAppointmentsProps> = ({ patientId }) => {
  // 🧠 Usamos el hook filtrado por patientId
  const { appointments, loading, createAppointment, updateAppointment, deleteAppointment } = useAppointments(1, patientId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    return appointmentColors[status as keyof typeof appointmentColors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    return appointmentStatuses.find(s => s.value === status)?.label || status;
  };

  // 🧠 Manejo de Guardado (Crear o Editar)
  const handleSave = async (data: any) => {
    if (appointmentToEdit) {
      // Editar
      return await updateAppointment.mutateAsync(data);
    } else {
      // Crear
      return await createAppointment.mutateAsync(data);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setAppointmentToEdit(appointment);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setAppointmentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (appointmentToDelete) {
      try {
        await deleteAppointment.mutateAsync(appointmentToDelete);
        Notifications.success('Cita cancelada correctamente');
      } catch (error) {
        console.error(error);
        Notifications.error('Error al cancelar la cita');
      } finally {
        setIsDeleteModalOpen(false);
        setAppointmentToDelete(null);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAppointmentToEdit(null);
  };

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
          onClick={() => {
            setAppointmentToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </button>
      </div>

      {appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{appointment.procedure}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status_appointments)}`}>
                      {getStatusLabel(appointment.status_appointments)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(appointment.date)} {/* Aqui hay fecha mostrar formato 'dd/MM/yyyy'*/}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {appointment.time} ({appointment.duration} min)
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {appointment.dentist?.name || 'No asignado'}
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
                  <button
                    onClick={() => handleEdit(appointment)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                  {appointment.status_appointments !== 'completed' && appointment.status_appointments !== 'cancelled' && (
                    <button
                      onClick={() => handleDeleteClick(appointment.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
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
        onClose={handleCloseModal}
        onSave={handleSave}
        appointmentToEdit={appointmentToEdit}
        preselectedPatientId={patientId}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Cancelar Cita"
        message="¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer."
        confirmText="Sí, cancelar"
        cancelText="No, mantener"
      />
    </div>
  );
};