// src/components/odontogram/DiagnosticModal.tsx
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { STATUS_FLOW, SURFACES, TREATMENTS } from '@constants/odontogram';
import { X, Save } from 'lucide-react';

const schema = z.object({
  toothNumber: z.number(),
  surfaces: z.array(z.string()).min(1, 'Selecciona al menos una superficie'),
  condition: z.string().min(2, 'Selecciona un tratamiento'),
  status: z.enum(['planificado', 'en_proceso', 'completado']),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  toothNumber: number;
  defaultSurfaces?: string[];
  onClose: () => void;
  onSave: (data: FormData) => Promise<void> | void;
};

export const DiagnosticModal: React.FC<Props> = ({
  isOpen, toothNumber, defaultSurfaces = [], onClose, onSave,
}) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        toothNumber,
        surfaces: defaultSurfaces,
        status: 'planificado',
      },
    });

  if (!isOpen) return null;

  const selected = new Set(watch('surfaces'));

  const toggleSurface = (s: string) => {
    const next = new Set(selected);
    next.has(s) ? next.delete(s) : next.add(s);
    setValue('surfaces', Array.from(next));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Diagnóstico — Pieza {toothNumber}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X /></button>
        </div>

        <form
          onSubmit={handleSubmit(async (data) => { await onSave({ ...data, toothNumber }); onClose(); })}
          className="p-4 space-y-4"
        >
          <div>
            <p className="text-sm font-medium mb-2">Superficies</p>
            <div className="flex flex-wrap gap-2">
              {SURFACES.map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleSurface(s)}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    selected.has(s) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {errors.surfaces && <p className="text-red-600 text-xs mt-1">{errors.surfaces.message}</p>}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Tratamiento</p>
            <select {...register('condition')} className="w-full border rounded-lg p-2">
              <option value="">Selecciona…</option>
              {TREATMENTS.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
            {errors.condition && <p className="text-red-600 text-xs mt-1">{errors.condition.message}</p>}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Estado</p>
            <div className="flex gap-3">
              {STATUS_FLOW.map(s => (
                <label key={s.value} className="flex items-center gap-2 text-sm">
                  <input type="radio" value={s.value} {...register('status')} />
                  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: s.dot }} />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Notas</p>
            <textarea {...register('notes')} rows={3} className="w-full border rounded-lg p-2" />
          </div>

          <div className="flex justify-end border-t pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" /> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
