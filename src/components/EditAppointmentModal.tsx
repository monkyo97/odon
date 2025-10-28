import React, { useEffect } from 'react';
import { X, User, Phone, Calendar, Clock, Briefcase, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { FormTextArea } from './FormTextArea';
import { useDentists } from '../hooks/useDentists';
import type { Appointment } from '../hooks/useAppointments';

// 🧠 Esquema de validación con Zod
const appointmentSchema = z.object({
  patientName: z.string().min(2, 'El nombre del paciente es obligatorio'),
  patientPhone: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9+\s-]{6,20}$/.test(v), {
      message: 'Número de teléfono inválido',
    }),
  dentistId: z.string().nonempty('Debe seleccionar un odontólogo'),
  date: z.string().nonempty('La fecha es obligatoria'),
  time: z.string().nonempty('La hora es obligatoria'),
  duration: z.number().min(15).max(240),
  procedure: z.string().nonempty('El procedimiento es obligatorio'),
  notes: z.string().optional(),
  status_appointments: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']).default('scheduled'),
  status: z.enum(['1', '0']).default('1'),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AppointmentFormData) => Promise<void>;
  appointment: Appointment;
}

export const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  appointment,
}) => {
  const { dentists, loading: loadingDentists } = useDentists();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientName: '',
      patientPhone: '',
      dentistId: '',
      date: '',
      time: '',
      duration: 60,
      procedure: '',
      notes: '',
      status_appointments: 'scheduled',
      status: '1',
    },
  });

  useEffect(() => {
    if (appointment) {
      reset({
        patientName: appointment.patientName || '',
        patientPhone: appointment.patientPhone || '',
        dentistId: appointment.dentistId || '',
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration || 60,
        procedure: appointment.procedure || '',
        notes: appointment.notes || '',
        status: appointment.status,
      });
    }
  }, [appointment, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error actualizando cita:', error);
      alert('Error al actualizar la cita. Inténtalo nuevamente.');
    }
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00',
  ];

  const procedures = [
    'Consulta inicial',
    'Limpieza dental',
    'Empaste',
    'Endodoncia',
    'Extracción',
    'Corona',
    'Implante',
    'Ortodoncia - Consulta',
    'Ortodoncia - Revisión',
    'Blanqueamiento',
    'Cirugía oral',
    'Revisión general',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Editar Cita</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Paciente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Nombre del paciente *"
              icon={<User className="h-4 w-4" />}
              placeholder="Ej: María González"
              registration={register('patientName')}
              error={errors.patientName}
            />

            <FormInput
              type="tel"
              label="Teléfono"
              icon={<Phone className="h-4 w-4" />}
              placeholder="+593 99 123 4567"
              registration={register('patientPhone')}
              error={errors.patientPhone}
            />

            <FormInput
              type="date"
              label="Fecha *"
              icon={<Calendar className="h-4 w-4" />}
              registration={register('date')}
              error={errors.date}
            />

            <FormSelect
              label="Hora *"
              icon={<Clock className="h-4 w-4" />}
              registration={register('time')}
              error={errors.time}
              options={timeSlots.map((t) => ({ value: t, label: t }))}
            />

            <FormSelect
              label="Duración (minutos) *"
              registration={register('duration', { valueAsNumber: true })}
              error={errors.duration}
              options={[
                { value: 30, label: '30' },
                { value: 45, label: '45' },
                { value: 60, label: '60' },
                { value: 90, label: '90' },
                { value: 120, label: '120' },
              ]}
            />

            <FormSelect
              label="Odontólogo *"
              icon={<Briefcase className="h-4 w-4" />}
              registration={register('dentistId')}
              error={errors.dentistId}
              options={
                loadingDentists
                  ? [{ value: '', label: 'Cargando...' }]
                  : dentists.map((d) => ({
                      value: d.id,
                      label: `${d.name} — ${d.specialty || 'General'}`,
                    }))
              }
            />

            <FormSelect
              label="Estado"
              registration={register('status')}
              error={errors.status}
              options={[
                { value: 'scheduled', label: 'Programada' },
                { value: 'confirmed', label: 'Confirmada' },
                { value: 'completed', label: 'Completada' },
                { value: 'cancelled', label: 'Cancelada' },
              ]}
            />

          </div>
            <FormSelect
              label="Procedimiento *"
              registration={register('procedure')}
              error={errors.procedure}
              options={procedures.map((p) => ({ value: p, label: p }))}
            />

            <FormTextArea
              label="Notas"
              placeholder="Observaciones, preparación, etc..."
              registration={register('notes')}
              error={errors.notes}
              rows={3}
            />

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
