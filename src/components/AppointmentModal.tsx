import React, { useState } from 'react';
import { X, Calendar, Clock, User, FileText, Save, Phone, Briefcase } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePatients } from '../hooks/usePatients';
import { useDentists } from '../hooks/useDentists';
import { FormInput } from '../components/FormInput';
import { FormSelect } from '../components/FormSelect';
import { FormRadioGroup } from '../components/FormRadioGroup';
import { FormSearchSelect } from '../components/FormSearchSelect';
import { Appointment } from '../hooks/useAppointments';

// ✅ Schema de validación
const appointmentSchema = z.object({
  patientId: z.string().optional(),
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
  duration: z
    .number()
    .min(15, 'Duración mínima 15 minutos')
    .max(240, 'Duración máxima 4 horas'),
  procedure: z.string().nonempty('El procedimiento es obligatorio'),
  notes: z.string().optional(),
  status_appointments: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']).default('scheduled'),
  status: z.enum(['1', '0']).default('1'),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: AppointmentFormData) => Promise<Appointment | undefined>;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
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
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      duration: 60,
      status: 'scheduled',
    },
  });

  const filteredPatients = searchTerm
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.phone?.includes(searchTerm)
      )
    : patients;

  if (!isOpen) return null;

  const handlePatientSelect = (patient: any) => {
    setIsNewPatient(false);
    setValue('patientId', patient.id);
    setValue('patientName', patient.name);
    setValue('patientPhone', patient.phone || '');
    setSearchTerm(patient.name);
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      await onSave(data);
      reset();
      setIsNewPatient(true);
      setSearchTerm('');
      onClose();
    } catch (error) {
      console.error('Error creando cita:', error);
      alert('Ocurrió un error al crear la cita.');
    }
  };

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

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nueva Cita</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Radio: paciente nuevo */}
          <FormRadioGroup
            label="¿Es paciente nuevo?"
            options={[
              { label: 'Sí', value: true },
              { label: 'No', value: false },
            ]}
            value={isNewPatient}
            onChange={(val) => {
              setIsNewPatient(Boolean(val));
              if (val) setValue('patientId', undefined);
              else setSearchTerm('');
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Paciente */}
            {isNewPatient ? (
              <FormInput
                label="Nombre del paciente *"
                icon={<User className="h-4 w-4" />}
                placeholder="Ej: María González"
                registration={register('patientName')}
                error={errors.patientName}
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
              />
            )}

            {/* Teléfono */}
            <FormInput
              label="Teléfono"
              icon={<Phone className="h-4 w-4" />}
              placeholder="+593 99 123 4567"
              registration={register('patientPhone')}
              error={errors.patientPhone}
              disabled={!isNewPatient}
            />

            {/* Fecha */}
            <FormInput
              type="date"
              label="Fecha *"
              icon={<Calendar className="h-4 w-4" />}
              registration={register('date')}
              error={errors.date}
            />

            {/* Hora */}
            <FormSelect
              label="Hora *"
              icon={<Clock className="h-4 w-4" />}
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
              options={[
                { value: 30, label: '30' },
                { value: 45, label: '45' },
                { value: 60, label: '60' },
                { value: 90, label: '90' },
                { value: 120, label: '120' },
              ]}
            />

            {/* Odontólogo */}
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
              placeholder="Seleccionar odontólogo"
            />

            {/* Estado */}
            <FormSelect
              label="Estado"
              registration={register('status')}
              error={errors.status}
              showEmptyOption={false}
              options={[
                { value: 'scheduled', label: 'Programada' },
                { value: 'confirmed', label: 'Confirmada' },
                { value: 'completed', label: 'Completada' },
                { value: 'cancelled', label: 'Cancelada' },
              ]}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
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
                reset();
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
              {isSubmitting ? 'Programando...' : 'Programar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
