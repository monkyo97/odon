import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AppointmentModal } from './components/AppointmentModal';
import { CalendarView } from './components/CalendarView';
import { AppointmentList } from './components/AppointmentList';
import { useAppointments } from '@/hooks/useAppointments';

export const Appointments: React.FC = () => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calendar View Specific State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const {
    appointments,
    createAppointment,
  } = useAppointments(1);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Gestión de citas y calendario médico
          </p>
          {view === 'calendar' && (
            <div className="mt-3">
              <input
                type="date"
                value={selectedDate}
                onClick={(e) => {
                  try {
                    if (typeof (e.currentTarget as HTMLInputElement).showPicker === 'function') {
                      (e.currentTarget as HTMLInputElement).showPicker();
                    }
                  } catch (error) {
                    // Ignore
                  }
                }}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('list')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded text-sm font-medium transition-colors ${view === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Lista
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded text-sm font-medium transition-colors ${view === 'calendar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Calendario
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nueva Cita</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {view === 'list' && (
          <div className="p-4 sm:p-6">
            <AppointmentList />
          </div>
        )}

        {view === 'calendar' && (
          <div className="p-4 sm:p-6">
            <CalendarView
              appointments={appointments}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
        )}
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(formData) => createAppointment.mutateAsync({ ...formData })}
      />
    </div>
  );
};
