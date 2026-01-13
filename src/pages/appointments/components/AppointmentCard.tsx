import React, { useState } from 'react';
import { formatDate } from '@/utils/formatDate';
import { Calendar, Clock, Phone, Edit, Trash2 } from 'lucide-react';
import type { Appointment } from '@hooks/useAppointments';
import { useAppointments } from '@hooks/useAppointments';
import { EditAppointmentModal } from './EditAppointmentModal';
import { ConfirmModal } from '@components/ConfirmModal';
import { appointmentColors, appointmentStatuses } from '../../../constants/constantsAppointments';
import { Notifications } from '@/components/Notifications';

interface AppointmentCardProps {
  appointment: Appointment;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const { updateAppointment, deleteAppointment } = useAppointments();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🧾 Colors and functional status labels
  const getStatusColor = (status: string) => {
    return appointmentColors[status as keyof typeof appointmentColors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    return appointmentStatuses.find(s => s.value === status)?.label || status;
  };

  // 🗑️ Show confirmation modal
  const handleDeleteAppointment = () => {
    setIsConfirmOpen(true);
  };

  // 🔄 Confirm and execute deletion
  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAppointment.mutateAsync(appointment.id);
      Notifications.success('Cita cancelada correctamente.');
    } catch (error) {
      console.error('Error eliminando cita:', error);
      Notifications.error('Error al eliminar la cita. Inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {appointment.patient_name}
            </h3>
            <p className="text-sm text-gray-500">
              {appointment.patient_phone || '—'}
            </p>
          </div>

          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              appointment.status_appointments
            )}`}
          >
            {getStatusLabel(appointment.status_appointments)}
          </span>
        </div>

        {/* Appointment info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(appointment.date)} {/* Here is date show 'dd/MM/yyyy' format*/}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            {appointment.time} ({appointment.duration} min)
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            {appointment.patient_phone || '—'}
          </div>
        </div>

        {/* Procedure and notes */}
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-900">
            {appointment.procedure}
          </p>
          {appointment.notes && (
            <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 mt-4">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
          >
            <Edit className="h-4 w-4 mr-1" /> Editar
          </button>

          {
            appointment.status_appointments === 'cancelled' ? (
              <></>
            ) : <button
              onClick={handleDeleteAppointment}
              className="flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Cancelar
            </button>
          }

        </div>
      </div>

      {/* Edit modal */}
      {isEditModalOpen && (
        <EditAppointmentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          appointment={appointment}
          onSave={(data) =>
            updateAppointment.mutateAsync({ id: appointment.id, updates: data })
          }
        />
      )}

      {/* Confirmation modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Cancelar cita"
        message={`¿Deseas cancelar la cita de ${appointment.patient_name}? Esta acción no se puede deshacer.`}
        confirmText="Cancelar cita"
        cancelText="Cerrar"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        loading={isDeleting}
      />
    </>
  );
};
