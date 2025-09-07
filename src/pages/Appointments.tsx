import React, { useState } from 'react';
import { Calendar, Clock, Plus, Search, Filter, User, Phone } from 'lucide-react';
import { AppointmentModal } from '../components/AppointmentModal';
import { CalendarView } from '../components/CalendarView';
import { useAppointments } from '../hooks/useAppointments';

export const Appointments: React.FC = () => {
  const { appointments, loading, createAppointment } = useAppointments();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.procedure.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesDate = view === 'calendar' ? appointment.date === selectedDate : true;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Gestión de citas y calendario médico</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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

        <div className="p-4 sm:p-6">
          {view === 'list' ? (
            loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-3 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                      
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
                          {appointment.patientPhone}
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-900">{appointment.procedure}</p>
                        {appointment.notes && (
                          <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 lg:ml-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Editar
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredAppointments.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron citas</p>
                </div>
              )}
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

      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={createAppointment}
      />
    </div>
  );
};