import React from 'react';
import { Clock, User, Phone } from 'lucide-react';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  duration: number;
  procedure: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  dentist: string;
}

interface CalendarViewProps {
  appointments: Appointment[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  appointments, 
  selectedDate, 
  onDateChange 
}) => {
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const getAppointmentForSlot = (time: string) => {
    return appointments.find(apt => apt.time === time && apt.date === selectedDate);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-50 border-blue-200 text-blue-800',
      confirmed: 'bg-green-50 border-green-200 text-green-800',
      completed: 'bg-gray-50 border-gray-200 text-gray-800',
      cancelled: 'bg-red-50 border-red-200 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const getDurationSlots = (startTime: string, duration: number) => {
    const startIndex = timeSlots.indexOf(startTime);
    const slotsNeeded = Math.ceil(duration / 30);
    return slotsNeeded;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {new Date(selectedDate).toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-200 rounded mr-2"></div>
            <span>Confirmada</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-200 rounded mr-2"></div>
            <span>Programada</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-200 rounded mr-2"></div>
            <span>Completada</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {timeSlots.map((time, index) => {
          const appointment = getAppointmentForSlot(time);
          const isOccupied = !!appointment;
          
          // Skip slots that are part of a longer appointment
          if (!isOccupied) {
            const prevAppointment = appointments.find(apt => {
              const aptIndex = timeSlots.indexOf(apt.time);
              const slotsNeeded = getDurationSlots(apt.time, apt.duration);
              return apt.date === selectedDate && 
                     aptIndex < index && 
                     aptIndex + slotsNeeded > index;
            });
            if (prevAppointment) return null;
          }

          return (
            <div key={time} className="flex items-center">
              <div className="w-16 text-sm text-gray-500 font-medium">
                {time}
              </div>
              
              <div className="flex-1 ml-4">
                {isOccupied ? (
                  <div className={`p-3 rounded-lg border-2 ${getStatusColor(appointment.status)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{appointment.patientName}</span>
                        </div>
                        <p className="text-sm font-medium mb-1">{appointment.procedure}</p>
                        <div className="flex items-center space-x-4 text-xs">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {appointment.duration} min
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {appointment.patientPhone}
                          </div>
                        </div>
                        {appointment.notes && (
                          <p className="text-xs mt-2 opacity-75">{appointment.notes}</p>
                        )}
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button className="text-xs text-blue-600 hover:text-blue-800">
                          Editar
                        </button>
                        <button className="text-xs text-red-600 hover:text-red-800">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-12 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors cursor-pointer">
                    <span className="text-sm">Disponible</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};