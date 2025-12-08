import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  FileText,
  Save,
  Phone,
  Briefcase,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePatients } from '@hooks/usePatients';
import { useDentists } from '@hooks/useDentists';
import { FormInput } from '@components/FormInput';
import { FormSelect } from '@components/FormSelect';
import { FormRadioGroup } from '@components/FormRadioGroup';
import { FormSearchSelect } from '@components/FormSearchSelect';
import { Appointment } from '@hooks/useAppointments';
import { appointmentDurations, appointmentStatuses, procedures, timeSlots } from '../../../constants/constantsAppointments';
import { Notifications } from '@/components/Notifications';

// ✅ Validación con Zod
const appointmentSchema = z.object({
  patient_id: z.string().optional(),
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
  duration: z
    .number()
    .min(15, 'Duración mínima 15 minutos')
    .max(240, 'Duración máxima 4 horas'),
  procedure: z.string().nonempty('El procedimiento es obligatorio'),
  notes: z.string().optional(),
  status_appointments: z
    .enum(['scheduled', 'confirmed', 'completed', 'cancelled'], 'El estado es obligatorio')
    .default('scheduled').nonoptional(),
  status: z.enum(['1', '0']).default('1').nonoptional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: any) => Promise<Appointment | undefined>;
  defaultDate?: string;
  defaultTime?: string;
  appointmentToEdit?: Appointment | null;
  preselectedPatientId?: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultDate,
  defaultTime,
  appointmentToEdit,
  preselectedPatientId,
}) => {
  const { patients } = usePatients();
  const { dentists, loading: loadingDentists } = useDentists();

  const [isNewPatient, setIsNewPatient] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      duration: 60,
      status: '1',
      status_appointments: 'scheduled',
      date: defaultDate || '',
      time: defaultTime || '',
    },
  });

  // 🧠 Efecto para cargar datos al editar o preseleccionar paciente
  useEffect(() => {
    if (isOpen) {
      if (appointmentToEdit) {
        // Modo Edición
        setIsNewPatient(false);
        setValue('patient_id', appointmentToEdit.patient_id);
        setValue('patient_name', appointmentToEdit.patient_name || '');
        setValue('patient_phone', appointmentToEdit.patient_phone || '');
        setValue('dentist_id', appointmentToEdit.dentist_id || '');
        setValue('date', appointmentToEdit.date);
        setValue('time', appointmentToEdit.time);
        setValue('duration', appointmentToEdit.duration || 60);
        setValue('procedure', appointmentToEdit.procedure || '');
        setValue('notes', appointmentToEdit.notes || '');
        setValue('status_appointments', appointmentToEdit.status_appointments);
        setSearchTerm(appointmentToEdit.patient_name || '');
      } else if (preselectedPatientId) {
        // Modo Nuevo con Paciente Preseleccionado
        const patient = patients.find(p => p.id === preselectedPatientId);
        if (patient) {
          setIsNewPatient(false);
          setValue('patient_id', patient.id);
          setValue('patient_name', patient.name);
          setValue('patient_phone', patient.phone || '');
          setSearchTerm(patient.name);
        }
        setValue('date', defaultDate || '');
        setValue('time', defaultTime || '');
        setValue('status_appointments', 'scheduled');
      } else {
        // Modo Nuevo (Reset)
        reset({
          duration: 60,
          status: '1',
          status_appointments: 'scheduled',
          date: defaultDate || '',
          time: defaultTime || '',
        });
        setIsNewPatient(true);
        setSearchTerm('');
      }
    }
  }, [isOpen, appointmentToEdit, preselectedPatientId, patients, defaultDate, defaultTime, reset, setValue]);


  if (!isOpen) return null;

  // 🔍 Filtrar pacientes por nombre o teléfono
  const filteredPatients = searchTerm
    ? patients.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm)
    )
    : patients;

  // 📋 Selección de paciente existente
  const handlePatientSelect = (patient: any) => {
    setIsNewPatient(false);
    setValue('patient_id', patient.id);
    setValue('patient_name', patient.name);
    setValue('patient_phone', patient.phone || '');
    setSearchTerm(patient.name);
  };

  // 💾 Enviar formulario
  const onSubmit = async (data: AppointmentFormData) => {
    try {
      // Si estamos editando, pasamos el ID también (aunque onSave suele esperar solo data, el padre manejará la lógica)
      const payload = appointmentToEdit ? { id: appointmentToEdit.id, updates: data } : data;

      await onSave(payload);

      reset();
      setIsNewPatient(true);
      setSearchTerm('');
      onClose();
      Notifications.success(appointmentToEdit ? 'Cita actualizada correctamente.' : 'Cita creada correctamente.');
    } catch (error) {
      console.error('Error guardando cita:', error);
      Notifications.error('Error al guardar la cita. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {appointmentToEdit ? 'Editar Cita' : 'Nueva Cita'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Radio: paciente nuevo (Solo si no hay paciente preseleccionado ni estamos editando) */}
          {!preselectedPatientId && !appointmentToEdit && (
            <FormRadioGroup
              label="¿Es paciente nuevo?"
              options={[
                { label: 'Sí', value: true },
                { label: 'No', value: false },
              ]}
              value={isNewPatient}
              onChange={(val) => {
                setIsNewPatient(Boolean(val));
                if (val) setValue('patient_id', undefined);
                else setSearchTerm('');
              }}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Paciente */}
            {isNewPatient ? (
              <FormInput
                label="Nombre del paciente *"
                iconLeft={<User className="h-4 w-4" />}
                placeholder="Ej: María González"
                registration={register('patient_name')}
                error={errors.patient_name}
                disabled={!!preselectedPatientId || !!appointmentToEdit}
              />
            ) : (
              <FormSearchSelect
                label="Buscar paciente *"
                icon={<User className="h-4 w-4" />}
                placeholder="Buscar por nombre o teléfono..."
                value={searchTerm}
                options={filteredPatients.map((p) => ({
                  value: p.id,
                  label: p.name,
                  description: p.phone,
                }))}
                onSearch={(term) => setSearchTerm(term)}
                onSelect={(option) =>
                  handlePatientSelect({
                    id: option.value,
                    name: option.label,
                    phone: option.description,
                  })
                }
                disabled={!!preselectedPatientId || !!appointmentToEdit}
              />
            )}

            {/* Teléfono */}
            <FormInput
              label="Teléfono"
              iconLeft={<Phone className="h-4 w-4" />}
              placeholder="+593 99 123 4567"
              registration={register('patient_phone')}
              error={errors.patient_phone}
              disabled={!isNewPatient && !preselectedPatientId && !appointmentToEdit}
            />

            {/* Fecha */}
            <FormInput
              type="date"
              label="Fecha *"
              iconLeft={<Calendar className="h-4 w-4" />}
              registration={register('date')}
              error={errors.date}
            />

            {/* Hora */}
            <FormSelect
              label="Hora *"
              iconLeft={<Clock className="h-4 w-4" />}
              registration={register('time')}
              error={errors.time}
              options={timeSlots.map((t) => ({ value: t, label: t }))}
              placeholder="Seleccionar hora"
            />

            {/* Duración */}
            <FormSelect
              label="Duración (minutos) *"
              registration={register('duration', { valueAsNumber: true })}
              error={errors.duration}
              options={appointmentDurations}
            />

            {/* Odontólogo */}
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

            {/* Estado funcional */}
            <FormSelect
              label="Estado de la cita *"
              registration={register('status_appointments', { required: true })}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Observaciones, preparación especial, etc..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Guardando...' : (appointmentToEdit ? 'Actualizar Cita' : 'Programar Cita')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
