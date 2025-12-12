import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    CheckCircle,
    XCircle,
    AlertCircle,
    MoreVertical,
    Phone,
    FileText,
    Search,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { useAppointments, Appointment } from '@/hooks/useAppointments';
import { useDentists } from '@/hooks/useDentists';
import { appointmentStatuses } from '@/constants/constantsAppointments';
import { Notifications } from '@/components/Notifications';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EditAppointmentModal } from './EditAppointmentModal';

const PAGE_SIZE = 20;

// Date Helpers (Native implementation to replace date-fns)
const getStartOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const isToday = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00'); // Ensure local time interpretation if dateStr is YYYY-MM-DD
    const today = getStartOfDay(new Date());
    return d.getTime() === today.getTime();
};

const isTomorrow = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const tomorrow = getStartOfDay(new Date());
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.getTime() === tomorrow.getTime();
};

const isThisWeek = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const today = getStartOfDay(new Date());
    const day = today.getDay() || 7; // Sunday is 0, make it 7 for ISO-like calculation if needed, but simple diff is fine

    // Get Monday of this week
    const monday = new Date(today);
    monday.setDate(today.getDate() - day + 1);
    if (day === 0) monday.setDate(today.getDate() - 6); // If today is Sunday, Monday was 6 days ago

    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);

    return d >= monday && d < nextMonday;
};

const formatGroupDate = (dateStr: string) => {
    // Format: "Lunes 23 de Diciembre"
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
};


interface AppointmentListProps {
    // If we need to pass down anything specific
}

export const AppointmentList: React.FC<AppointmentListProps> = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);

    // Use the paginated hook
    const {
        appointments,
        loading,
        updateAppointment,
        totalAppointments,
        totalPages
    } = useAppointments(page);

    const { dentists } = useDentists();

    // Filters State
    const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'week' | 'all'>('today');
    const [statusFilter, setStatusFilter] = useState<string>('active'); // active = scheduled, confirmed
    const [dentistFilter, setDentistFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals & Actions
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [confirmAction, setConfirmAction] = useState<{
        isOpen: boolean;
        type: 'cancel' | 'complete' | 'confirm' | 'reactivate';
        appointment: Appointment | null;
    }>({ isOpen: false, type: 'cancel', appointment: null });

    // Filtering Logic
    const filteredAppointments = useMemo(() => {
        let filtered = [...appointments];

        // 1. Date Filter
        // Appointments date is likely string "YYYY-MM-DD"
        filtered = filtered.filter(apt => {
            if (dateFilter === 'today') return isToday(apt.date);
            if (dateFilter === 'tomorrow') return isTomorrow(apt.date);
            if (dateFilter === 'week') return isThisWeek(apt.date);
            return true;
        });

        // 2. Status Filter
        if (statusFilter === 'active') {
            filtered = filtered.filter(apt => ['scheduled', 'confirmed'].includes(apt.status_appointments));
        } else if (statusFilter !== 'all') {
            filtered = filtered.filter(apt => apt.status_appointments === statusFilter);
        }

        // 3. Dentist Filter
        if (dentistFilter !== 'all') {
            filtered = filtered.filter(apt => apt.dentist_id === dentistFilter);
        }

        // 4. Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(apt =>
                apt.patient_name?.toLowerCase().includes(lowerTerm) ||
                apt.patient_phone?.includes(searchTerm) ||
                apt.procedure?.toLowerCase().includes(lowerTerm)
            );
        }

        // Sort by Date then Time
        return filtered.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });
    }, [appointments, dateFilter, statusFilter, dentistFilter, searchTerm]);

    // Grouping Logic
    const groupedAppointments = useMemo(() => {
        const groups: { [key: string]: Appointment[] } = {};
        filteredAppointments.forEach(apt => {
            if (!groups[apt.date]) groups[apt.date] = [];
            groups[apt.date].push(apt);
        });
        return groups;
    }, [filteredAppointments]);

    // Handlers for pagination
    const handlePrev = () => {
        if (page > 1) setPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (page < totalPages) setPage((prev) => prev + 1);
    };

    // Actions Handlers
    const handleAction = (type: 'cancel' | 'complete' | 'confirm' | 'reactivate', appointment: Appointment) => {
        setConfirmAction({ isOpen: true, type, appointment });
    };

    const executeAction = async () => {
        const { type, appointment } = confirmAction;
        if (!appointment) return;

        try {
            const updates: Partial<Appointment> = {};
            if (type === 'cancel') updates.status_appointments = 'cancelled';
            if (type === 'confirm') updates.status_appointments = 'confirmed';
            if (type === 'complete') updates.status_appointments = 'completed';
            if (type === 'reactivate') updates.status_appointments = 'scheduled';

            if (Object.keys(updates).length > 0) {
                await updateAppointment.mutateAsync({ id: appointment.id, updates });

                let msg = 'Cita actualizada';
                if (type === 'cancel') msg = 'Cita cancelada';
                if (type === 'confirm') msg = 'Cita confirmada';
                if (type === 'complete') msg = 'Cita completada';
                if (type === 'reactivate') msg = 'Cita reactivada';
                Notifications.success(msg);
            }
        } catch (error) {
            console.error(error);
            Notifications.error('Error al actualizar cita');
        } finally {
            setConfirmAction({ ...confirmAction, isOpen: false });
        }
    };

    const handleNavigateToPatient = (appointment: Appointment) => {
        // Setup Global Context Logic
        // We pass the dentist_id in state so PatientDetail can pick it up
        navigate(`/patients/${appointment.patient_id}`, {
            state: { defaultDentistId: appointment.dentist_id }
        });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando citas...</div>;

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">

                {/* Quick Date Filters */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {[
                        { id: 'today', label: 'Hoy' },
                        { id: 'tomorrow', label: 'Mañana' },
                        { id: 'week', label: 'Esta Semana' },
                        { id: 'all', label: 'Todas' }
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setDateFilter(f.id as any)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${dateFilter === f.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-grow md:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="active">Activas (Prog/Conf)</option>
                        <option value="all">Todos los estados</option>
                        <option value="scheduled">Programadas</option>
                        <option value="confirmed">Confirmadas</option>
                        <option value="completed">Completadas</option>
                        <option value="cancelled">Canceladas</option>
                    </select>

                    {/* Dentist Filter */}
                    <select
                        value={dentistFilter}
                        onChange={(e) => setDentistFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="all">Todos los Odontólogos</option>
                        {dentists.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grouped List */}
            <div className="space-y-8">
                {Object.keys(groupedAppointments).length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No se encontraron citas para los filtros seleccionados</p>
                    </div>
                ) : (
                    Object.keys(groupedAppointments).sort().map(date => (
                        <div key={date} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-gray-300"></div>
                                <h3 className="text-sm font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200 uppercase tracking-wider">
                                    {formatGroupDate(date)}
                                </h3>
                                <div className="h-px flex-1 bg-gray-300"></div>
                            </div>

                            <div className="grid gap-4">
                                {groupedAppointments[date].map(apt => (
                                    <AppointmentListCard
                                        key={apt.id}
                                        appointment={apt}
                                        onEdit={() => setEditingAppointment(apt)}
                                        onAction={handleAction}
                                        onPatientClick={() => handleNavigateToPatient(apt)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col items-center justify-center mt-6 space-y-2 border-t border-gray-100 pt-6">
                <div className="text-xs text-gray-500">
                    {`Total: ${totalAppointments} • Página ${page} de ${totalPages} • ${PAGE_SIZE} por página`}
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handlePrev}
                        disabled={page === 1}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={page === totalPages}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                    >
                        Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                </div>
            </div>

            {/* Modals */}
            {editingAppointment && (
                <EditAppointmentModal
                    isOpen={!!editingAppointment}
                    onClose={() => setEditingAppointment(null)}
                    appointment={editingAppointment}
                    onSave={(data) => updateAppointment.mutateAsync({ id: editingAppointment.id, updates: data })}
                />
            )}

            <ConfirmModal
                isOpen={confirmAction.isOpen}
                title={
                    confirmAction.type === 'cancel' ? 'Cancelar Cita' :
                        confirmAction.type === 'confirm' ? 'Confirmar Cita' :
                            confirmAction.type === 'complete' ? 'Completar Cita' : 'Reactivar Cita'
                }
                message={`¿Estás seguro de que deseas ${confirmAction.type === 'cancel' ? 'cancelar' :
                        confirmAction.type === 'confirm' ? 'confirmar' :
                            confirmAction.type === 'complete' ? 'marcar como completada' : 'reactivar'
                    } la cita de ${confirmAction.appointment?.patient_name}?`}
                confirmText="Proceder"
                cancelText="Volver"
                onConfirm={executeAction}
                onCancel={() => setConfirmAction({ ...confirmAction, isOpen: false })}
            />
        </div>
    );
};

// Internal Card Component for better isolation
const AppointmentListCard: React.FC<{
    appointment: Appointment;
    onEdit: () => void;
    onAction: (type: 'cancel' | 'complete' | 'confirm' | 'reactivate', appointment: Appointment) => void;
    onPatientClick: () => void;
}> = ({ appointment, onEdit, onAction, onPatientClick }) => {

    // Status visual helpers
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
            case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    const getStatusLabel = (status: string) => {
        const found = appointmentStatuses.find(s => s.value === status);
        return found ? found.label : status;
    };

    return (
        <div className={`bg-white rounded-xl p-4 border transition-shadow hover:shadow-md flex flex-col md:flex-row gap-4 items-start md:items-center ${appointment.status_appointments === 'cancelled' ? 'opacity-75 bg-gray-50' : 'border-gray-200'
            }`}>
            {/* Time Column */}
            <div className="flex flex-row md:flex-col items-center md:items-start min-w-[100px] border-b md:border-b-0 md:border-r border-gray-100 pb-2 md:pb-0 md:pr-4">
                <div className="text-lg font-bold text-gray-900">{appointment.time}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1 md:mt-1 ml-2 md:ml-0">
                    <Clock className="h-3 w-3" />
                    {appointment.duration} min
                </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(appointment.status_appointments)}`}>
                        {getStatusLabel(appointment.status_appointments)}
                    </span>
                    <button onClick={onPatientClick} className="font-bold text-gray-900 hover:text-blue-600 transition truncate text-lg">
                        {appointment.patient_name}
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        {appointment.dentist?.name || <span className="text-red-400 italic">No asignado</span>}
                    </span>
                    {appointment.procedure && (
                        <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5 text-gray-400" />
                            {appointment.procedure}
                        </span>
                    )}
                    {appointment.patient_phone && (
                        <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {appointment.patient_phone}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 justify-end">
                {appointment.status_appointments === 'scheduled' && (
                    <>
                        <button onClick={() => onAction('confirm', appointment)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg tooltip" title="Confirmar">
                            <CheckCircle className="h-5 w-5" />
                        </button>
                        <button onClick={onEdit} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                            <MoreVertical className="h-5 w-5" />
                        </button>
                        <button onClick={() => onAction('cancel', appointment)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Cancelar">
                            <XCircle className="h-5 w-5" />
                        </button>
                    </>
                )}

                {appointment.status_appointments === 'confirmed' && (
                    <>
                        <button onClick={() => onAction('complete', appointment)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Completar">
                            <CheckCircle className="h-5 w-5" />
                        </button>
                        <button onClick={onEdit} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Editar">
                            <MoreVertical className="h-5 w-5" />
                        </button>
                    </>
                )}

                {appointment.status_appointments === 'completed' && (
                    <div className="flex items-center gap-2">
                        <button onClick={onPatientClick} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors">
                            Ver Paciente
                        </button>
                    </div>
                )}

                {appointment.status_appointments === 'cancelled' && (
                    <button onClick={() => onAction('reactivate', appointment)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Reactivar">
                        <AlertCircle className="h-5 w-5" />
                    </button>
                )}

                <ChevronRight className="h-5 w-5 text-gray-300 ml-2" />
            </div>
        </div>
    );
};
