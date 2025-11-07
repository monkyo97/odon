import React, { useEffect } from 'react';
import { Save, Loader2, Building } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@components/FormInput';
import { useClinics } from '@hooks/useClinics';
import { useUserProfile } from '@hooks/useUserProfile';
import { useSupabaseUserUpdate } from '@hooks/useSupabaseUserUpdate';
import { Notifications } from '@/components/Notifications';


// ✅ Esquema
const clinicSchema = z.object({
  name: z.string().min(2, 'El nombre de la clínica es obligatorio'),
  ruc: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Correo inválido').optional(),
  website: z.string().optional(),
  logo_url: z.string().optional(),
});

type ClinicFormData = z.infer<typeof clinicSchema>;

export const ClinicSettings: React.FC = () => {
  const { profile, updateUserProfileEmail } = useUserProfile();
  const { clinic, loading, updateClinic } = useClinics();
  const { updateEmail } = useSupabaseUserUpdate();

  const isAdmin = profile?.role === 'admin';
  const isDentist = profile?.role === 'dentist';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
  });

  useEffect(() => {
    if (clinic) {
      reset({
        name: clinic.name || '',
        ruc: clinic.ruc || '',
        address: clinic.address || '',
        phone: clinic.phone || '',
        email: clinic.email || '',
        website: clinic.website || '',
        logo_url: clinic.logo_url || '',
      });
    }
  }, [clinic, reset]);

  const onSubmit = async (data: ClinicFormData) => {
    try {
      // 🧩 Si es ADMIN, su correo y el de la clínica deben ser iguales
      if (isAdmin && data.email && data.email !== clinic?.email) {
        // Actualizar correo en clinic
        await updateClinic.mutateAsync(data);

        // Actualizar en user_profiles
        await updateUserProfileEmail.mutateAsync({ email: data.email });

        // Actualizar en auth
        await updateEmail.mutateAsync(data.email);

        Notifications.success('Correo actualizado en todos los registros.');
      } else {
        await updateClinic.mutateAsync(data);
        Notifications.success('Datos de la clínica actualizados.');
      }
    } catch (err: any) {
      Notifications.error(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-600">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Cargando información...
      </div>
    );
  }

  // 🦷 Dentista: solo visual
  const isReadOnly = isDentist;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Building className="h-5 w-5 text-blue-600" /> Información de la Clínica
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Nombre *"
          registration={register('name')}
          error={errors.name}
          disabled={isReadOnly}
        />
        <FormInput label="RUC" registration={register('ruc')} error={errors.ruc} disabled={isReadOnly} />
        <FormInput label="Teléfono" registration={register('phone')} error={errors.phone} disabled={isReadOnly} />
        <FormInput label="Correo electrónico" registration={register('email')} error={errors.email} disabled classNameInput='bg-gray-300' />
        <FormInput label="Dirección" registration={register('address')} error={errors.address} disabled={isReadOnly} />
        <FormInput label="Sitio web" registration={register('website')} error={errors.website} disabled={isReadOnly} />
        <FormInput label="Logo (URL)" registration={register('logo_url')} error={errors.logo_url} disabled={isReadOnly} />
      </div>

      {!isReadOnly && (
        <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar
          </button>
        </div>
      )}
    </form>
  );
};
