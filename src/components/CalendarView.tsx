import React, { useState } from 'react';
import { Clock, User, Phone, Edit, Trash2 } from 'lucide-react';
import { Appointment, useAppointments } from '../hooks/useAppointments';
import { colorsBorderCardCalendar, colorsTextCalendar, timeSlots } from '../constants/constantsAppointments';
import { EditAppointmentModal } from './EditAppointmentModal';
import { ConfirmModal } from './ConfirmModal';

interface CalendarViewProps {
  appointments: Appointment[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  selectedDate,
}) => {
  const { updateAppointment, deleteAppointment } = useAppointments();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [appointment, setAppointment] = useState<Appointment>({} as Appointment);

  const getAppointmentsForSlot = (time: string) =>
    appointments.filter((apt) => apt.time === time && apt.date === selectedDate);

  const getBorderStatusColor = (status: string) => {
    return colorsBorderCardCalendar[status as keyof typeof colorsBorderCardCalendar] || 'bg-gray-50 border-gray-200';
  };

  const applyCancelledStatusColor = (status: string) => {
    return colorsTextCalendar[status as keyof typeof colorsTextCalendar] || 'text-gray-800';
  };

   const handleEditAppointment = (appointment: Appointment) => {
    setAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    setAppointment(appointment);
    setIsConfirmOpen(true);
  };

  // 🔄 Confirmar y ejecutar eliminación
  const confirmDelete = async () => {
    try {
      if (!appointment) return;
      setIsDeleting(true);
      await deleteAppointment.mutateAsync(appointment.id);
    } catch (error) {
      console.error('Error eliminando cita:', error);
      alert('Error al eliminar la cita. Inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 🔹 Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {new Date(selectedDate).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC',
          })}
        </h3>

        <div className="flex items-center space-x-3 text-sm">
          <Legend color="bg-green-300" label="Confirmada" />
          <Legend color="bg-blue-300" label="Programada" />
          <Legend color="bg-gray-300" label="Completada" />
          <Legend color="bg-red-300" label="Cancelada" />
        </div>
      </div>

      {/* 🔹 Horario */}
      <div className="grid grid-cols-1 gap-2">
        {timeSlots.map((time) => {
          const slotAppointments = getAppointmentsForSlot(time);
          const isEmpty = slotAppointments.length === 0;

          return (
            <div key={time} className="flex items-start">
              {/* Hora */}
              <div className="w-16 text-sm text-gray-500 font-medium mt-1">{time}</div>

              {/* Contenedor de citas */}
              <div className="flex-1 ml-4">
                {isEmpty ? (
                  <div className="h-12 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors cursor-pointer">
                    <span className="text-sm">Disponible</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slotAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`flex-1 min-w-[250px] p-3 rounded-lg border ${getBorderStatusColor(
                          appointment.status_appointments
                        )} shadow-sm hover:shadow transition`}
                      >
                        <div className={`flex justify-between items-start`}>
                          <div className={`${applyCancelledStatusColor(
                              appointment.status_appointments
                            )}`}>
                            <div className="flex items-center space-x-2 mb-1">
                              <User className="h-4 w-4" />
                              <span className="font-medium text-sm">{appointment.patient_name}</span>
                            </div>
                            <p className="text-xs font-medium">{appointment.procedure}</p>
                            <div className="flex items-center space-x-3 text-xs mt-1">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {appointment.duration} min
                              </div>
                              {appointment.patient_phone && (
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {appointment.patient_phone}
                                </div>
                              )}
                            </div>
                            {appointment.notes && (
                              <p className="text-xs mt-1 italic text-gray-600">
                                {appointment.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col space-y-1 text-xs ml-2">
                            {/* Acciones */}
                            <div className="flex items-center space-x-3 mt-4">
                              <button
                                onClick={() => handleEditAppointment(appointment)}
                                className="flex items-center px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                              >
                                <Edit className="h-4 w-4 mr-1" /> Editar
                              </button>

                              {
                                appointment.status_appointments === 'cancelled' ? (
                                  <></>
                                ) : <button
                                  onClick={() => handleDeleteAppointment(appointment)}
                                  className="flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors "
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> Cancelar
                                </button>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de edición */}
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

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Cancelar cita"
        message={`¿Deseas cancelar la cita de ${appointment?.patient_name }? Esta acción no se puede deshacer.`}
        confirmText="Cancelar cita"
        cancelText="Cerrar"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        loading={isDeleting}
      />
    </div>
  );
};

// 🟩 Pequeño componente auxiliar
const Legend = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center space-x-1">
    <div className={`w-3 h-3 rounded ${color}`} />
    <span>{label}</span>
  </div>
);
