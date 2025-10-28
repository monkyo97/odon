import React, { useState } from 'react';
import { Calendar, Clock, Phone, Edit, Trash2 } from 'lucide-react';
import type { Appointment } from '../hooks/useAppointments';
import { useAppointments } from '../hooks/useAppointments';
import { EditAppointmentModal } from './EditAppointmentModal';
import { ConfirmModal } from './ConfirmModal';

interface AppointmentCardProps {
  appointment: Appointment;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const { updateAppointment, deleteAppointment } = useAppointments();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

  
  const handleDeleteAppointment = async () => {
    if (!appointment) return;
    setIsConfirmOpen(true);
  };

    const confirmDelete = async () => {
    if (!appointment) return;
    try {
      setIsDeleting(true);
      await deleteAppointment(appointment.id);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error al eliminar el paciente. Inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  // const handleDelete = async () => {
  //   const confirmDelete = window.confirm(
  //     `¿Deseas cancelar la cita de ${appointment.patientName}? Esta acción no se puede deshacer.`
  //   );
  //   if (!confirmDelete) return;

  //   try {
  //     await deleteAppointment(appointment.id);
  //     alert('Cita cancelada correctamente.');
  //   } catch (error) {
  //     console.error('Error cancelando la cita:', error);
  //     alert('Error al cancelar la cita. Intenta nuevamente.');
  //   }
  // };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      scheduled: 'Programada',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {appointment.patientName}
            </h3>
            <p className="text-sm text-gray-500">{appointment.patientPhone || '—'}</p>
          </div>

          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              appointment.status
            )}`}
          >
            {getStatusLabel(appointment.status)}
          </span>
        </div>

        {/* Información de la cita */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {new Date(appointment.date).toLocaleDateString('es-ES')}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            {appointment.time} ({appointment.duration} min)
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            {appointment.patientPhone || '—'}
          </div>
        </div>

        {/* Procedimiento y notas */}
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-900">{appointment.procedure}</p>
          {appointment.notes && (
            <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-3 mt-4">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
          >
            <Edit className="h-4 w-4 mr-1" /> Editar
          </button>

          <button
            onClick={handleDeleteAppointment}
            className="flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Cancelar
          </button>
        </div>
      </div>

      {/* Modal de edición */}
      {isEditModalOpen && (
        <EditAppointmentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          appointment={appointment}
          onSave={(data) => updateAppointment(appointment.id, data)}
        />
      )}
      
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Cancelar cita"
        message={`¿Deseas cancelar la cita de ${appointment.patientName}? Esta acción no se puede deshacer.`}
        confirmText="Cancelar cita"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        loading={isDeleting}
      />
    </>
  );
};
