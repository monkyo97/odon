import React, { useState } from 'react';
import { formatDate } from '@/utils/formatDate';
import { Appointment, useAppointments } from '@hooks/useAppointments';
import {
  timeSlots,
} from '../../../constants/constantsAppointments';
import { Legend } from '@components/LegendCalendarView';
import { AppointmentModal } from './AppointmentModal';
import { CalendarViewDetail } from './CalendarViewDetail';

interface CalendarViewProps {
  appointments: Appointment[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  selectedDate,
}) => {
  const { createAppointment } = useAppointments();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  // 📅 Get appointments for a slot
  const getAppointmentsForSlot = (time: string) =>
    appointments.filter((apt) => apt.time === time && apt.date === selectedDate);

  // 🔄 Calculate how many slots an appointment occupies
  const getSlotCount = (duration: number) => Math.ceil(duration / 30);

  // ⚡ Handle click on available slot
  const handleAvailableSlotClick = (time: string) => {
    setSelectedSlot(time);
    setIsCreateModalOpen(true);
  };

  // 🚫 Avoid duplicate render of occupied slots
  const isSlotWithinAppointment = (time: string) => {
    return appointments.some((apt) => {
      const startIndex = timeSlots.indexOf(apt.time);
      const slots = getSlotCount(apt.duration);
      const occupiedTimes = timeSlots.slice(startIndex + 1, startIndex + slots);
      return apt.date === selectedDate && occupiedTimes.includes(time);
    });
  };

  const formatGroupDate = (dateStr: string) => {
    // Format: "Lunes 23 de Diciembre"
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };
  return (
    <div className="space-y-4">
      {/* 🔹 Header */}
      {/* 🔹 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-y-0 space-y-3 text-center sm:text-left">
        {/* Date */}
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 order-1 sm:order-none uppercase">
          {formatGroupDate(selectedDate)} {/* Here is date show 'dd/MM/yyyy' format*/}
        </h3>

        {/* Status legends */}
        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 justify-center sm:justify-end text-sm order-2 sm:order-none">
          <Legend color="bg-green-300" label="Confirmada" />
          <Legend color="bg-blue-300" label="Programada" />
          <Legend color="bg-gray-300" label="Completada" />
          <Legend color="bg-red-300" label="Cancelada" />
        </div>
      </div>


      {/* 🔹 Schedule */}
      <div className="grid grid-cols-1 gap-2">
        {timeSlots.map((time) => {
          // Avoid rendering an intermediate slot of a longer appointment
          if (isSlotWithinAppointment(time)) return null;

          const slotAppointments = getAppointmentsForSlot(time);
          const isEmpty = slotAppointments.length === 0;

          return (
            <div key={time} className="flex items-start">
              {/* Sidebar time */}
              <div className="w-16 text-sm text-gray-500 font-medium mt-1">{time}</div>

              {/* Appointment container */}
              <div className="flex-1 ml-4">
                {isEmpty ? (
                  <div
                    onClick={() => handleAvailableSlotClick(time)}
                    className="h-14 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors cursor-pointer"
                  >
                    <span className="text-sm">Disponible</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {slotAppointments.map((appointment) => {
                      return (
                        <CalendarViewDetail key={appointment.id} appointmentInfo={appointment} />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Creation modal */}
      {isCreateModalOpen && (
        <AppointmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={(formData) => createAppointment.mutateAsync({ ...formData })}
          defaultDate={selectedDate}
          defaultTime={selectedSlot ?? ''}
        />
      )}
    </div>
  );
};
