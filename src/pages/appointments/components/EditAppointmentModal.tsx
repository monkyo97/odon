import React, { useEffect } from 'react';
import { X, User, Phone, Calendar, Clock, Briefcase, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@components/FormInput';
import { FormDateInput } from '@components/FormDateInput';
import { FormSelect } from '@components/FormSelect';
import { FormTextArea } from '@components/FormTextArea';
import { useDentists } from '@hooks/useDentists';
import type { Appointment } from '@hooks/useAppointments';
import { appointmentDurations, appointmentStatuses, procedures, timeSlots } from '../../../constants/constantsAppointments';
import { Notifications } from '@/components/Notifications';

// 🧠 Validación con Zod
const appointmentSchema = z.object({
  patient_name: z.string().min(2, 'El nombre del paciente es obligatorio'),
  patient_phone: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9+\s-]{6,20}$/.test(v), {
      message: 'Número de teléfono inválido',
    }),
  dentist_id: z.string().nonempty('Debe seleccionar un odontólogo'),
  date: z.string().nonempty('La fecha es obligatoria'),
  time: z.string().nonempty('La hora es obligatoria'),
  duration: z.number().min(15, 'Duración mínima 15 minutos').max(240, 'Duración máxima 4 horas'),
  procedure: z.string().nonempty('El procedimiento es obligatorio'),
  notes: z.string().optional(),
  status_appointments: z
    .enum(['scheduled', 'confirmed', 'completed', 'cancelled'], 'El estado es obligatorio')
    .default('scheduled').nonoptional(),
  status: z.enum(['1', '0']).default('1').nonoptional(),
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
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_name: '',
      patient_phone: '',
      dentist_id: '',
      date: '',
      time: '',
      duration: 60,
      procedure: '',
      notes: '',
      status_appointments: 'scheduled',
      status: '1',
    },
  });

  // 🔁 Cargar datos al abrir el modal
  useEffect(() => {
    if (appointment) {
      reset({
        patient_name: appointment.patient_name || '',
        patient_phone: appointment.patient_phone || '',
        dentist_id: appointment.dentist_id || '',
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration || 60,
        procedure: appointment.procedure || '',
        notes: appointment.notes || '',
        status_appointments: appointment.status_appointments || 'scheduled',
        status: appointment.status || '1',
      });
    }
  }, [appointment, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      await onSave(data);
      onClose();
      Notifications.success('Cita actualizada correctamente.');
    } catch (error) {
      console.error('Error actualizando cita:', error);
      Notifications.error('Error al actualizar la cita. Inténtalo nuevamente.');
    }
  };

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
          {/* Campos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Nombre del paciente *"
              iconLeft={<User className="h-4 w-4" />}
              placeholder="Ej: María González"
              registration={register('patient_name')}
              error={errors.patient_name}
            />

            <FormInput
              type="tel"
              label="Teléfono"
              iconLeft={<Phone className="h-4 w-4" />}
              placeholder="+593 99 123 4567"
              registration={register('patient_phone')}
              error={errors.patient_phone}
            />

            <FormDateInput
              label="Fecha *"
              registration={register('date')}
              error={errors.date}
            />

            <FormSelect
              label="Hora *"
              iconLeft={<Clock className="h-4 w-4" />}
              registration={register('time')}
              error={errors.time}
              options={timeSlots.map((t) => ({ value: t, label: t }))}
              placeholder="Seleccionar hora"
            />

            <FormSelect
              label="Duración (minutos) *"
              registration={register('duration', { valueAsNumber: true })}
              error={errors.duration}
              options={appointmentDurations}
            />

            <FormSelect
              label="Odontólogo *"
              iconLeft={<Briefcase className="h-4 w-4" />}
              registration={register('dentist_id')}
              error={errors.dentist_id}
              options={
                loadingDentists
                  ? [{ value: '', label: 'Cargando...' }]
                  : dentists.map((d) => ({
                    value: d.id,
                    label: `${d.name} — ${d.specialty || 'General'}`,
                  }))
              }
              placeholder="Seleccionar odontólogo"
            />

            <FormSelect
              label="Estado de la cita"
              registration={register('status_appointments')}
              error={errors.status_appointments}
              options={appointmentStatuses}
            />
          </div>

          {/* Procedimiento */}
          <FormSelect
            label="Procedimiento *"
            registration={register('procedure')}
            error={errors.procedure}
            options={procedures.map((p) => ({ value: p, label: p }))}
            placeholder="Seleccionar procedimiento"
          />

          {/* Notas */}
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
