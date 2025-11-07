import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AppointmentModal } from './components/AppointmentModal';
import { CalendarView } from './components/CalendarView';
import { AppointmentCard } from './components/AppointmentCard';
import { useAppointments } from '@hooks/useAppointments';

const PAGE_SIZE = 20;

export const Appointments: React.FC = () => {
  const [page, setPage] = useState(1);

  const {
    appointments,
    totalAppointments,
    totalPages,
    loading,
    createAppointment,
  } = useAppointments(page);

  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔍 Filtrado de citas (en memoria)
  const filteredAppointments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return appointments.filter((appointment) => {
      const matchesSearch =
        appointment.patient_name?.toLowerCase().includes(q) ||
        appointment.procedure?.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' ||
        appointment.status_appointments === statusFilter;
      const matchesDate =
        view === 'calendar' ? appointment.date === selectedDate : true;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, searchTerm, statusFilter, selectedDate, view]);

  // ⏮ Paginación (usa backend)
  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 🔹 Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Gestión de citas y calendario médico
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'calendar'
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

      {/* 🔹 Panel principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* 🔸 Filtros */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por paciente o procedimiento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              {view === 'calendar' && (
                <div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              )}

              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">Todos los estados</option>
                  <option value="scheduled">Programadas</option>
                  <option value="confirmed">Confirmadas</option>
                  <option value="completed">Completadas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 🔸 Lista o Calendario */}
        <div className="p-4 sm:p-6">
          {view === 'list' ? (
            loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : filteredAppointments.length > 0 ? (
              <>
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                    />
                  ))}
                </div>

                {/* 🔹 Paginador */}
                <div className="flex flex-col items-center justify-center mt-6 space-y-2">
                  <div className="text-xs text-gray-500">
                    {`Total: ${totalAppointments} • Página ${page} de ${totalPages} • ${PAGE_SIZE} por página`}
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePrev}
                      disabled={page === 1}
                      className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={page === totalPages}
                      className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
                    >
                      Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron citas</p>
              </div>
            )
          ) : (
            <CalendarView
              appointments={filteredAppointments}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          )}
        </div>
      </div>

      {/* 🔹 Modal Nueva Cita */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSave={(formData) => createAppointment.mutateAsync({ ...formData })}
      />
    </div>
  );
};
