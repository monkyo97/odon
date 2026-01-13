import React, { useState } from 'react';
import { Clock, User, Phone, Edit, Trash2, ClipboardPlus } from 'lucide-react';
import { Appointment, useAppointments } from '@hooks/useAppointments';
import {
  colorsBorderCardCalendar,
  colorsTextCalendar,
} from '../../../constants/constantsAppointments';
import { EditAppointmentModal } from './EditAppointmentModal';
import { ConfirmModal } from '@components/ConfirmModal';
import { InfoLabel } from '@components/InfoLabel';
import { Notifications } from '@/components/Notifications';

interface CalendarViewProps {
  appointmentInfo: Appointment;
}

export const CalendarViewDetail: React.FC<CalendarViewProps> = ({
  appointmentInfo,
}) => {
  const { updateAppointment, deleteAppointment } = useAppointments();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [appointment, setAppointment] = useState<Appointment>({} as Appointment);

  // 🎨 Colors by status
  const getBorderStatusColor = (status: string) =>
    colorsBorderCardCalendar[status as keyof typeof colorsBorderCardCalendar] ||
    'border-gray-200';

  const applyCancelledStatusColor = (status: string) =>
    colorsTextCalendar[status as keyof typeof colorsTextCalendar] ||
    'text-gray-800';

  // ✏️ Edit appointment
  const handleEditAppointment = (appointment: Appointment) => {
    setAppointment(appointment);
    setIsEditModalOpen(true);
  };

  // ❌ Cancel appointment
  const handleDeleteAppointment = (appointment: Appointment) => {
    setAppointment(appointment);
    setIsConfirmOpen(true);
  };

  // 🧩 Confirm deletion
  const confirmDelete = async () => {
    try {
      if (!appointment) return;
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

  // 🔄 Calculate how many slots an appointment occupies

  // Calculate end time by duration
  const calculateEndTime = (start: string, duration: number) => {
    const [hours, minutes] = start.split(':').map(Number);
    const total = hours * 60 + minutes + duration;
    const endH = Math.floor(total / 60)
      .toString()
      .padStart(2, '0');
    const endM = (total % 60).toString().padStart(2, '0');
    return `${endH}:${endM}`;
  };



  return (
    <>
      <div
        key={appointmentInfo.id}
        className={`w-full rounded-lg border ${getBorderStatusColor(
          appointmentInfo.status_appointments
        )} shadow-sm hover:shadow-md transition relative p-3 sm:p-4 bg-white`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 sm:grid-rows gap-y-2 sm:gap-2">
          {/* 🟩 Row 1 - Col 1: Status and buttons */}
          <div className="flex justify-between items-start sm:col-span-3 border-b pb-2 sm:pb-2">
            <span
              className={`text-xs sm:text-sm font-semibold uppercase ${applyCancelledStatusColor(
                appointmentInfo.status_appointments
              )}`}
            >
              {appointmentInfo.status_appointments === 'scheduled'
                ? 'PROGRAMADA'
                : appointmentInfo.status_appointments === 'confirmed'
                  ? 'CONFIRMADA'
                  : appointmentInfo.status_appointments === 'completed'
                    ? 'COMPLETADA'
                    : 'CANCELADA'}
            </span>

            <div className="flex space-x-4">
              <button
                onClick={() => handleEditAppointment(appointmentInfo)}
                className="text-green-600 hover:text-emerald-800"
                title="Editar cita"
              >
                <Edit className="h-6 w-6" />
              </button>
              {appointmentInfo.status_appointments !== 'cancelled' && (
                <button
                  onClick={() => handleDeleteAppointment(appointmentInfo)}
                  className="text-red-600 hover:text-red-800"
                  title="Cancelar cita"
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>

          {/* 🟦 Row 2 - Col 1: Dentist and Treatment */}
          <div className="sm:col-span-1 sm:row-span-1">
            <InfoLabel
              label={<>
                <b><span>Odontólogo:</span>{' '}</b>
              </>
              }
              labelClassName="text-gray-800"
            />
            <InfoLabel
              iconLeft={ClipboardPlus}
              label={
                <>
                  <p>{appointmentInfo?.dentist?.name || '—'} - {appointmentInfo?.dentist?.specialty || '—'}</p>
                </>
              }
              labelClassName="text-gray-800"
            />
            <InfoLabel
              label={
                <>
                  <b><span>Tratamiento:</span>{' '}</b>
                  <p>{appointmentInfo.procedure}</p>
                </>
              }
              labelClassName="text-gray-800"
            />
            <InfoLabel
              iconLeft={Clock}
              label={`${appointmentInfo.time} - ${calculateEndTime(
                appointmentInfo.time,
                appointmentInfo.duration
              )} (${appointmentInfo.duration} min)`}
              labelClassName="text-gray-600"
            />
          </div>

          {/* 🟨 Row 2 - Col 2: Patient and Phone */}
          <div className="sm:col-span-1 sm:row-span-1">
            <InfoLabel
              label={<>
                <b><span>Paciente:</span>{' '}</b>
              </>
              }
              labelClassName="text-gray-800"
            />
            <InfoLabel
              iconLeft={User}
              label={appointmentInfo.patient_name}
              labelClassName="text-gray-800"
            />
            {appointmentInfo.patient_phone && (
              <InfoLabel
                iconLeft={Phone}
                label={appointmentInfo.patient_phone}
                labelClassName="text-gray-800"
              />
            )}

            {/* 🟥 Row 2 - Col 3: Note */}
            {appointmentInfo.notes && (
              <InfoLabel
                label={
                  <>
                    <span className="font-medium not-italic">Nota:</span>{' '}
                    <span className="italic">{appointmentInfo.notes}</span>
                  </>
                }
                labelClassName="text-gray-700"
              />
            )}
          </div>
        </div>



        {/* Edit modal */}
        {isEditModalOpen && (
          <EditAppointmentModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            appointment={appointment}
            onSave={(data) =>
              updateAppointment.mutateAsync({ id: appointment?.id, updates: data })
            }
          />
        )}


        {/* Confirm modal */}
        <ConfirmModal
          isOpen={isConfirmOpen}
          title="Cancelar cita"
          message={`¿Deseas cancelar la cita de ${appointment?.patient_name}? Esta acción no se puede deshacer.`}
          confirmText="Cancelar cita"
          cancelText="Cerrar"
          onConfirm={confirmDelete}
          onCancel={() => setIsConfirmOpen(false)}
          loading={isDeleting}
        />
      </div>
    </>
  );
};
